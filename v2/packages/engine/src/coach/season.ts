import { areRivals } from "@craque/world";
import { GENERIC_CHAMPIONS } from "../world/tuning";
import { advanceCompetitions, applyToTable, type DrawContext, sortTable } from "./competitions";
import { buildMatchEvent } from "./events";
import { coachSheet, isAvailable, registered } from "./lineup";
import { applyMatchChoice, playUntil, quickMatch, startLive, type DetailedInput, type LiveMatch, type QuickSide } from "./match";
import { formFromRatings, sectorOf } from "./players";
import { aiFormation, aiPhilosophy, aiRating, bestEleven, sectorRatings, type OnField, type SectorRatings } from "./tactics";
import type {
  CoachCareer,
  CoachMatchLog,
  CoachPlayer,
  Fixture,
  GoalEvent,
  MatchResult,
  Moment,
  Sector,
} from "./types";
import { CALENDAR_DAYS, INJURY, PREDICTABILITY, SATISFACTION, SUBSTITUTIONS, TRAINING } from "./tuning";
import type { Rng } from "../rng";
import { absDay, coachRng, unit } from "./util";
import { squadIndex } from "./world";

/**
 * A simulação de um período (spec 5, 10 e 18): dia por dia, na ordem
 * partidas → lesões e recuperação → uso → satisfação → fase. Para no
 * evento de partida e continua do mesmo ponto depois da escolha.
 */

export interface SimulationOutcome {
  readonly paused: boolean;
}

interface AiSheet {
  readonly eleven: OnField[];
  readonly ratings: SectorRatings;
  readonly formation: ReturnType<typeof aiFormation>;
}

interface Run {
  readonly career: CoachCareer;
  readonly index: Map<string, CoachPlayer[]>;
  readonly ai: Map<string, AiSheet>;
  readonly context: DrawContext;
  readonly endDay: number;
  readonly byId: Map<string, Fixture>;
  readonly byDay: Map<number, Fixture[]>;
  readonly byCompetition: Map<string, Fixture[]>;
  readonly injured: Set<string>;
}

function createRun(career: CoachCareer): Run {
  const byId = new Map<string, Fixture>();
  const byDay = new Map<number, Fixture[]>();
  const byCompetition = new Map<string, Fixture[]>();
  for (const fixture of career.fixtures) indexFixture(fixture, byId, byDay, byCompetition);
  const injured = new Set<string>();
  for (const player of Object.values(career.players)) if (player.injury) injured.add(player.id);
  return {
    career,
    index: squadIndex(career.players),
    ai: new Map(),
    context: {
      seed: career.setup.seed,
      year: career.year,
      seeder: (club) => career.clubs[club]?.strength ?? GENERIC_CHAMPIONS.find((entry) => entry.id === club)?.strength ?? 60,
      busy: busyDays(career),
    },
    endDay: periodEnd(career),
    byId,
    byDay,
    byCompetition,
    injured,
  };
}

function indexFixture(fixture: Fixture, byId: Map<string, Fixture>, byDay: Map<number, Fixture[]>, byCompetition: Map<string, Fixture[]>): void {
  byId.set(fixture.id, fixture);
  const day = byDay.get(fixture.day);
  if (day) day.push(fixture);
  else byDay.set(fixture.day, [fixture]);
  const competition = byCompetition.get(fixture.competition);
  if (competition) competition.push(fixture);
  else byCompetition.set(fixture.competition, [fixture]);
}

function genericSheet(club: string): AiSheet | null {
  const generic = GENERIC_CHAMPIONS.find((entry) => entry.id === club);
  if (!generic) return null;
  const value = generic.strength;
  return {
    eleven: [],
    ratings: { gk: value, def: value, mid: value, att: value, attack: value, defense: value },
    formation: "4-3-3",
  };
}

function aiSheet(run: Run, club: string, dayAbs: number): AiSheet {
  const cached = run.ai.get(club);
  if (cached) return cached;
  const generic = genericSheet(club);
  if (generic) {
    run.ai.set(club, generic);
    return generic;
  }
  const squad = (run.index.get(club) ?? []).filter((player) => isAvailable(player, dayAbs));
  const formation = aiFormation(unit(`${run.career.setup.seed}:formation:${club}`));
  const eleven = bestEleven(squad, formation);
  const ratings = sectorRatings(eleven, aiRating);
  const sheet = { eleven, ratings, formation };
  run.ai.set(club, sheet);
  return sheet;
}

function strengthOf(run: Run, club: string): number {
  return run.career.clubs[club]?.strength ?? GENERIC_CHAMPIONS.find((entry) => entry.id === club)?.strength ?? 60;
}

function aggregateBefore(run: Run, fixture: Fixture): readonly [number, number] | null {
  if (!fixture.firstLeg) return null;
  const first = run.byId.get(fixture.firstLeg);
  if (!first?.result) return null;
  // Do ponto de vista do mandante da volta (que foi visitante na ida).
  return [first.result.away, first.result.home];
}

function decideWinner(fixture: Fixture, home: number, away: number, aggregate: readonly [number, number] | null, penalties: readonly [number, number] | null): string | null {
  if (!fixture.decisive) return home > away ? fixture.home : away > home ? fixture.away : null;
  const [aggHome, aggAway] = aggregate ?? [0, 0];
  const totalHome = home + aggHome;
  const totalAway = away + aggAway;
  if (totalHome !== totalAway) return totalHome > totalAway ? fixture.home : fixture.away;
  if (penalties) return penalties[0] > penalties[1] ? fixture.home : fixture.away;
  return fixture.home;
}

function recordResult(run: Run, fixture: Fixture, result: MatchResult): void {
  fixture.result = result;
  const state = run.career.competitions[fixture.competition];
  if (!state) return;
  if (fixture.roundKind === "league" && state.table) applyToTable(state.table, fixture.home, fixture.away, result.home, result.away);
  if (fixture.roundKind === "group" && state.groups) {
    const group = state.groups.find((entry) => entry.clubs.includes(fixture.home));
    if (group) applyToTable(group.rows, fixture.home, fixture.away, result.home, result.away);
  }
}

function aiInjuries(run: Run, club: string, dayAbs: number, rng: Rng): void {
  const sheet = run.ai.get(club);
  if (!sheet || sheet.eleven.length === 0) return;
  let changed = false;
  for (const entry of sheet.eleven) {
    const player = entry.player;
    const age = run.career.year - player.birthYear;
    const factor = 1 + Math.max(0, age - INJURY.ageFrom) * INJURY.agePerYear;
    if (!rng.chance(INJURY.per90 * factor)) continue;
    const severity = rng.weighted(INJURY.severity.map((item) => [item, item.weight] as const));
    const days = rng.int(severity.days[0], severity.days[1]);
    player.injury = { kind: severity.kind, since: dayAbs, until: dayAbs + days };
    run.injured.add(player.id);
    changed = true;
  }
  if (changed) run.ai.delete(club);
}

// ---------------------------------------------------------- clube do treinador

function trainingBoost(training: Readonly<Record<Sector, number>>, sector: Sector): number {
  let total = 0;
  for (let step = 0; step < (training[sector] ?? 0); step += 1) total += TRAINING.steps[step] ?? 0;
  return Math.min(TRAINING.cap, total);
}

function isBig(fixture: Fixture): boolean {
  return fixture.roundKind === "knockout" && (fixture.decisive || fixture.round === "F" || fixture.round === "FF" || fixture.round === "SF");
}

function coachInput(run: Run, fixture: Fixture, dayAbs: number): { input: DetailedInput; coachIndex: 0 | 1; rested: string[] } {
  const career = run.career;
  const coach = career.coach;
  if (!coach) throw new Error("coach: simulação sem clube");
  const coachHome = fixture.home === coach.club;
  const opponent = coachHome ? fixture.away : fixture.home;
  const squad = run.index.get(coach.club) ?? [];
  const derby = areRivals(coach.club, opponent);
  const big = isBig(fixture);
  const rotationRng = coachRng(career.setup.seed, "rotation", fixture.id);
  const sheet = coachSheet(squad, coach.tactics, {
    fixture,
    day: dayAbs,
    year: career.year,
    country: career.clubs[coach.club]?.country ?? "BRA",
    opponentStrength: strengthOf(run, opponent),
    ownStrength: strengthOf(run, coach.club),
    big,
    derby,
    promises: career.promises,
    rotationRoll: () => rotationRng.next(),
  });
  const predictability = coach.predictability.value;
  const training = coach.activeTraining;
  const priority = career.promises
    .filter((promise) => promise.status === "active" && promise.player && (promise.kind === "minutes" || promise.kind === "starts"))
    .map((promise) => promise.player as string);
  const youthPromise = career.promises.some((promise) => promise.status === "active" && promise.kind === "youth");
  if (youthPromise) {
    for (const player of sheet.bench) if (career.year - player.birthYear <= 21 && !priority.includes(player.id)) priority.push(player.id);
  }
  const midTraining = trainingBoost(training, "mid") / 2;
  const coachSide = {
    club: coach.club,
    isCoach: true,
    onField: sheet.onField,
    bench: sheet.bench,
    philosophy: coach.tactics.philosophy,
    formation: coach.tactics.formation,
    forBoost: (1 + trainingBoost(training, "att") + midTraining) * (1 - PREDICTABILITY.ownPenalty * predictability),
    againstBoost: (1 - trainingBoost(training, "def") - midTraining) * (1 + PREDICTABILITY.opponentBoost * predictability),
    priority,
  };
  const ai = aiSheet(run, opponent, dayAbs);
  const opponentSquad = (run.index.get(opponent) ?? []).filter((player) => isAvailable(player, dayAbs));
  const chosen = new Set(ai.eleven.map((entry) => entry.player.id));
  const roll = unit(`${career.setup.seed}:approach:${fixture.id}`);
  const opponentSide = {
    club: opponent,
    isCoach: false,
    onField: ai.eleven,
    bench: opponentSquad.filter((player) => !chosen.has(player.id)).slice(0, 9),
    philosophy: aiPhilosophy(strengthOf(run, opponent), strengthOf(run, coach.club), roll),
    formation: ai.formation,
    forBoost: 1,
    againstBoost: 1,
    priority: [],
  };
  const input: DetailedInput = {
    year: career.year,
    home: coachHome ? coachSide : opponentSide,
    away: coachHome ? opponentSide : coachSide,
    neutral: fixture.neutral,
    decisive: fixture.decisive,
    aggregateBefore: aggregateBefore(run, fixture),
    big,
    derby,
    maxSubs: SUBSTITUTIONS.max,
  };
  return { input, coachIndex: coachHome ? 0 : 1, rested: sheet.rested };
}

/** Importância do jogo para disparar o evento de partida (spec 13). */
function importance(run: Run, fixture: Fixture): number {
  const coach = run.career.coach;
  if (!coach) return 0;
  const opponent = fixture.home === coach.club ? fixture.away : fixture.home;
  if (fixture.round === "F" || fixture.round === "FF") return 5;
  if (fixture.roundKind === "knockout" && fixture.decisive) return 4;
  if (areRivals(coach.club, opponent)) return 3;
  if (fixture.roundKind === "knockout" || fixture.roundKind === "group") return 2;
  const table = run.career.competitions[fixture.competition]?.table;
  if (table && Number(fixture.round) > 8) {
    const sorted = sortTable(table, (club) => run.career.clubs[club]?.strength ?? 0);
    const mine = sorted.findIndex((row) => row.club === coach.club);
    const theirs = sorted.findIndex((row) => row.club === opponent);
    if (Math.abs(mine - theirs) <= 2) return 2;
  }
  return 1;
}

function shouldTrigger(run: Run, fixture: Fixture, played: number, total: number, remaining: number): boolean {
  if (remaining <= 1) return true;
  const progress = total === 0 ? 1 : played / total;
  const need = progress < 0.3 ? 5 : progress < 0.55 ? 4 : progress < 0.75 ? 3 : progress < 0.9 ? 2 : 1;
  return importance(run, fixture) >= need;
}

/** Minuto da decisão: o primeiro a partir do 55' com no máximo um gol de diferença; senão, 70'. */
function decisionMinute(live: LiveMatch, input: DetailedInput, lookup: (id: string) => CoachPlayer, seed: string, fixture: Fixture): { live: LiveMatch; minute: number } {
  const rng = coachRng(seed, "match", fixture.id, "a");
  for (let minute = 1; minute <= 70; minute += 1) {
    playUntil(live, input, lookup, rng, minute);
    if (minute >= 55 && Math.abs(live.score[0] - live.score[1]) <= 1) return { live, minute };
  }
  return { live, minute: 70 };
}

function finishCoachMatch(run: Run, fixture: Fixture, input: DetailedInput, live: LiveMatch, coachIndex: 0 | 1, dayAbs: number, rested: string[]): void {
  const career = run.career;
  const coach = career.coach;
  if (!coach) return;
  const aggregate = aggregateBefore(run, fixture);
  const winner = decideWinner(fixture, live.score[0], live.score[1], aggregate, live.penalties);
  const coachSide = coachIndex === 0 ? input.home : input.away;
  const log: CoachMatchLog = {
    side: coachIndex === 0 ? "home" : "away",
    lineup: coachSide.onField.map((entry) => entry.player.id),
    used: live.sides[coachIndex].used.map((entry) => ({ ...entry, rating: Math.round((live.ratings[entry.player] ?? 6) * 10) / 10 })),
    philosophy: coachSide.philosophy,
    opponentPhilosophy: (coachIndex === 0 ? input.away : input.home).philosophy,
    formation: coachSide.formation,
    eventOption: live.eventOption,
    shortHanded: live.sides[coachIndex].shortHanded,
  };
  const result: MatchResult = {
    home: live.score[0],
    away: live.score[1],
    extraTime: live.extraTime,
    penalties: live.penalties,
    winner,
    goals: live.goals,
    injuries: live.injuries.map((injury) => ({ player: injury.player, minute: injury.minute, days: injury.days })),
    coach: log,
  };
  recordResult(run, fixture, result);
  for (const injury of live.injuries) {
    const player = career.players[injury.player];
    if (!player) continue;
    player.injury = { kind: injury.kind, since: dayAbs, until: dayAbs + injury.days };
    run.injured.add(player.id);
    if (player.club === coach.club) career.ledger.injuries.push({ player: player.id, days: injury.days, kind: injury.kind });
  }
  // A IA também sente as lesões do jogo.
  run.ai.delete(coachIndex === 0 ? fixture.away : fixture.home);
  applyCoachUsage(run, fixture, log, live, dayAbs, rested, coachIndex);
  updatePredictability(run, log);
  noteMoments(run, fixture, live, coachIndex);
}

function applyCoachUsage(run: Run, fixture: Fixture, log: CoachMatchLog, live: LiveMatch, dayAbs: number, rested: string[], coachIndex: 0 | 1): void {
  const career = run.career;
  const coach = career.coach;
  if (!coach) return;
  const squad = run.index.get(coach.club) ?? [];
  const minutes = new Map<string, number>();
  for (const entry of log.used) minutes.set(entry.player, (minutes.get(entry.player) ?? 0) + (entry.to - entry.from));
  const starters = new Set(log.lineup);
  const benchIds = new Set((coachIndex === 0 ? live.sides[0] : live.sides[1]).bench);
  const derby = areRivals(fixture.home, fixture.away);
  const big = isBig(fixture);
  const allowed = registered(squad, career.clubs[coach.club]?.country ?? "BRA", career.year);
  const sideKey = coachIndex === 0 ? "home" : "away";
  for (const player of squad) {
    const available = isAvailable(player, dayAbs) || minutes.has(player.id);
    if (!available || !allowed.has(player.id)) continue;
    const stats = player.season;
    stats.available += 1;
    const played = minutes.get(player.id) ?? 0;
    const table = SATISFACTION.perMatch[player.role];
    let delta: number;
    if (played > 0) {
      stats.apps += 1;
      stats.minutes += played;
      if (starters.has(player.id)) {
        stats.starts += 1;
        player.consecutiveStarts += 1;
        delta = table.start;
      } else {
        player.consecutiveStarts = 0;
        delta = table.start * 0.6;
      }
      const rating = live.ratings[player.id] ?? 6;
      stats.ratingSum += rating;
      stats.rated += 1;
      player.recentRatings = [...player.recentRatings, rating].slice(-6);
      player.form = formFromRatings(player.recentRatings);
      if (big) stats.bigGames += 1;
      const legacy = career.legacy[player.id];
      if (legacy) legacy.apps += 1;
    } else {
      player.consecutiveStarts = 0;
      const benched = benchIds.has(player.id);
      if (benched) stats.benchUnused += 1;
      const accepts = player.acceptsBench && stats.benchUnused <= Math.ceil(SATISFACTION.acceptedBenchShare * Math.max(4, stats.available));
      delta = accepts || player.listed ? 0 : benched ? table.bench : table.out;
      if (rested.includes(player.id)) delta = 0;
      // Fase volta devagar ao normal sem jogar.
      player.form = Math.abs(player.form) < 0.1 ? 0 : player.form - Math.sign(player.form) * 0.1;
    }
    player.satisfaction = Math.max(0, Math.min(100, player.satisfaction + delta));
  }
  for (const goal of fixture.result?.goals ?? []) {
    if (goal.side !== sideKey || !goal.scorer) continue;
    const scorer = career.players[goal.scorer];
    if (!scorer) continue;
    scorer.season.goals += 1;
    if (derby) scorer.season.derbyGoals += 1;
    if (big) scorer.season.bigGoals += 1;
    if (goal.setPiece) scorer.season.setPieceGoals += 1;
    const legacy = career.legacy[scorer.id];
    if (legacy) legacy.goals += 1;
    if (goal.assist) {
      const assister = career.players[goal.assist];
      if (assister) assister.season.assists += 1;
    }
  }
}

function updatePredictability(run: Run, log: CoachMatchLog): void {
  const coach = run.career.coach;
  if (!coach) return;
  const state = coach.predictability;
  const rng = coachRng(run.career.setup.seed, "predictability", run.career.year, state.value.toFixed(4), log.lineup.join(","));
  const read = (focus: "formation" | "philosophy") => state.readFocus === focus;
  let value = state.value;
  if (log.formation !== state.lastFormation) {
    const [low, high] = read("formation") ? PREDICTABILITY.formationChange.read : PREDICTABILITY.formationChange.unread;
    value *= rng.real(low, high);
  }
  if (log.philosophy !== state.lastPhilosophy) {
    const [low, high] = read("philosophy") ? PREDICTABILITY.philosophyChange.read : PREDICTABILITY.philosophyChange.unread;
    value *= rng.real(low, high);
  }
  const changed = log.lineup.filter((id) => !state.lastLineup.includes(id)).length;
  if (state.lastLineup.length > 0 && changed >= PREDICTABILITY.lineupChangeMinimum) {
    const [low, high] = PREDICTABILITY.lineupChange;
    value *= rng.real(low, high);
  }
  state.value = Math.min(1, value + PREDICTABILITY.perMatch);
  state.lastFormation = log.formation;
  state.lastPhilosophy = log.philosophy;
  state.lastLineup = [...log.lineup];
}

function noteMoments(run: Run, fixture: Fixture, live: LiveMatch, coachIndex: 0 | 1): void {
  const career = run.career;
  const coach = career.coach;
  if (!coach) return;
  const opponent = coachIndex === 0 ? fixture.away : fixture.home;
  const score: [number, number] = coachIndex === 0 ? [live.score[0], live.score[1]] : [live.score[1], live.score[0]];
  const moments: Moment[] = [];
  if (areRivals(coach.club, opponent)) {
    if (score[0] > score[1]) moments.push({ kind: "derbyWin", fixture: fixture.id, score, opponent });
    else if (score[0] < score[1]) moments.push({ kind: "derbyLoss", fixture: fixture.id, score, opponent });
  }
  if (score[0] - score[1] >= 4) moments.push({ kind: "bigWin", fixture: fixture.id, score, opponent });
  if (score[1] - score[0] >= 4) moments.push({ kind: "bigLoss", fixture: fixture.id, score, opponent });
  const goalsBy = new Map<string, number>();
  for (const goal of live.goals as GoalEvent[]) {
    if ((goal.side === "home") !== (coachIndex === 0) || !goal.scorer) continue;
    goalsBy.set(goal.scorer, (goalsBy.get(goal.scorer) ?? 0) + 1);
  }
  for (const [player, goals] of goalsBy) if (goals >= 3) moments.push({ kind: "hatTrick", player, fixture: fixture.id });
  career.ledger.moments.push(...moments);
}

// ---------------------------------------------------------------- laço

function coachFixturesInPeriod(run: Run): Fixture[] {
  const club = run.career.coach?.club;
  if (!club) return [];
  return run.career.fixtures.filter((fixture) => (fixture.home === club || fixture.away === club) && fixture.day <= run.endDay && fixture.day >= periodStart(run.career));
}

export function periodStart(career: CoachCareer): number {
  if (career.setup.mode === "slow" && career.half === 1) return 150;
  return 0;
}

/**
 * Último dia do período atual. O período final vai até o fim das férias:
 * as fases do Mundial de Clubes são sorteadas uma depois da outra, nas
 * férias, e todas precisam caber no período (antes, só a primeira fase
 * cabia, e o Mundial nunca terminava).
 */
export function periodEnd(career: CoachCareer): number {
  if (career.setup.mode === "slow" && career.half === 0) return CALENDAR_DAYS.half - 1;
  return CALENDAR_DAYS.season + CALENDAR_DAYS.offseason - 1;
}

/**
 * Joga até o fim do período ou até o evento de partida. Quando há partida
 * pendente (pausada), ela precisa ser resolvida antes (`resumeMatch`).
 */
export function simulateDays(career: CoachCareer): SimulationOutcome {
  const run = createRun(career);
  const europe = career.memory.continental["cont1:UEFA"]?.winner ?? null;
  const coachClub = career.coach?.club ?? null;
  const lookup = (id: string) => career.players[id] as CoachPlayer;
  const days = [...run.byDay.keys()].filter((day) => day <= run.endDay).sort((a, b) => a - b);
  let cursor = 0;
  const created: Fixture[] = [];
  try {
    while (cursor < days.length) {
      const day = days[cursor] as number;
      cursor += 1;
      const todays = (run.byDay.get(day) ?? []).filter((fixture) => !fixture.result).sort((a, b) => a.id.localeCompare(b.id));
      if (todays.length === 0) continue;
      const dayAbs = absDay(career.seasonIndex, day);
      career.day = dayAbs;
      const touched = new Set<string>();
      for (const fixture of todays) {
        touched.add(fixture.competition);
        if (coachClub && (fixture.home === coachClub || fixture.away === coachClub)) {
          const { input, coachIndex, rested } = coachInput(run, fixture, dayAbs);
          if (career.matchEventArmed) {
            const period = coachFixturesInPeriod(run);
            const played = period.filter((item) => item.result).length;
            const remaining = period.filter((item) => !item.result).length;
            if (shouldTrigger(run, fixture, played, period.length, remaining)) {
              const live = startLive(input);
              const { minute } = decisionMinute(live, input, lookup, career.setup.seed, fixture);
              career.event = buildMatchEvent(career, fixture, live, coachIndex, minute, input);
              career.matchEventArmed = false;
              career.pendingMatch = { fixture: fixture.id, minute, state: { live, input: serializeInput(input), coachIndex, rested } };
              career.phase = "matchEvent";
              return { paused: true };
            }
          }
          const live = startLive(input);
          playUntil(live, input, lookup, coachRng(career.setup.seed, "match", fixture.id, "a"), null);
          finishCoachMatch(run, fixture, input, live, coachIndex, dayAbs, rested);
        } else {
          playQuick(run, fixture, dayAbs);
        }
      }
      // Recuperação: quem passou do prazo volta (o lesionado pode voltar dentro do bloco).
      for (const id of [...run.injured]) {
        const player = career.players[id];
        if (!player?.injury) {
          run.injured.delete(id);
          continue;
        }
        if (player.injury.until <= dayAbs) {
          player.injury = null;
          run.injured.delete(id);
          if (player.club && player.club !== coachClub) run.ai.delete(player.club);
        }
      }
      const fresh = advanceCompetitions(career.competitions, run.byCompetition, touched, run.context, europe);
      for (const fixture of fresh) {
        indexFixture(fixture, run.byId, run.byDay, run.byCompetition);
        created.push(fixture);
        if (fixture.day <= run.endDay && !days.includes(fixture.day)) {
          days.push(fixture.day);
          days.sort((a, b) => a - b);
          cursor = days.indexOf(day) + 1;
        }
      }
    }
  } finally {
    if (created.length > 0) {
      career.fixtures.push(...created);
      career.fixtures.sort((a, b) => a.day - b.day || a.id.localeCompare(b.id));
    }
  }
  career.day = absDay(career.seasonIndex, run.endDay);
  return { paused: false };
}

function playQuick(run: Run, fixture: Fixture, dayAbs: number): void {
  const home = aiSheet(run, fixture.home, dayAbs);
  const away = aiSheet(run, fixture.away, dayAbs);
  const roll = unit(`${run.career.setup.seed}:approach:${fixture.id}`);
  const homeSide: QuickSide = { club: fixture.home, ratings: home.ratings, philosophy: aiPhilosophy(strengthOf(run, fixture.home), strengthOf(run, fixture.away), roll) };
  const awaySide: QuickSide = { club: fixture.away, ratings: away.ratings, philosophy: aiPhilosophy(strengthOf(run, fixture.away), strengthOf(run, fixture.home), 1 - roll) };
  const aggregate = aggregateBefore(run, fixture);
  const rng = coachRng(run.career.setup.seed, "quick", fixture.id);
  const result = quickMatch(rng, homeSide, awaySide, fixture.neutral, fixture.decisive, aggregate);
  recordResult(run, fixture, {
    home: result.home,
    away: result.away,
    extraTime: result.extraTime,
    penalties: result.penalties,
    winner: decideWinner(fixture, result.home, result.away, aggregate, result.penalties),
    goals: [],
    injuries: [],
    coach: null,
  });
  // O mesmo fluxo do jogo sorteia as lesões dos dois lados, depois do placar.
  aiInjuries(run, fixture.home, dayAbs, rng);
  aiInjuries(run, fixture.away, dayAbs, rng);
}

function busyDays(career: CoachCareer): Map<string, Set<number>> {
  const busy = new Map<string, Set<number>>();
  for (const fixture of career.fixtures) {
    for (const club of [fixture.home, fixture.away]) {
      if (!busy.has(club)) busy.set(club, new Set());
      busy.get(club)?.add(fixture.day);
    }
  }
  return busy;
}

// ---------------------------------------------------- partida pausada

interface SerializedInput {
  readonly year: number;
  readonly neutral: boolean;
  readonly decisive: boolean;
  readonly aggregateBefore: readonly [number, number] | null;
  readonly big: boolean;
  readonly derby: boolean;
  readonly maxSubs: number;
  readonly sides: ReadonlyArray<{
    readonly club: string;
    readonly isCoach: boolean;
    readonly onField: ReadonlyArray<{ readonly player: string; readonly slot: OnField["slot"] }>;
    readonly bench: readonly string[];
    readonly philosophy: DetailedInput["home"]["philosophy"];
    readonly formation: DetailedInput["home"]["formation"];
    readonly forBoost: number;
    readonly againstBoost: number;
    readonly priority: readonly string[];
  }>;
}

function serializeInput(input: DetailedInput): SerializedInput {
  const side = (entry: DetailedInput["home"]) => ({
    club: entry.club,
    isCoach: entry.isCoach,
    onField: entry.onField.map((field) => ({ player: field.player.id, slot: field.slot })),
    bench: entry.bench.map((player) => player.id),
    philosophy: entry.philosophy,
    formation: entry.formation,
    forBoost: entry.forBoost,
    againstBoost: entry.againstBoost,
    priority: entry.priority,
  });
  return {
    year: input.year,
    neutral: input.neutral,
    decisive: input.decisive,
    aggregateBefore: input.aggregateBefore,
    big: input.big,
    derby: input.derby,
    maxSubs: input.maxSubs,
    sides: [side(input.home), side(input.away)],
  };
}

function restoreInput(career: CoachCareer, data: SerializedInput): DetailedInput {
  const player = (id: string) => career.players[id] as CoachPlayer;
  const side = (entry: SerializedInput["sides"][number]) => ({
    club: entry.club,
    isCoach: entry.isCoach,
    onField: entry.onField.map((field) => ({ player: player(field.player), slot: field.slot })),
    bench: entry.bench.map(player),
    philosophy: entry.philosophy,
    formation: entry.formation,
    forBoost: entry.forBoost,
    againstBoost: entry.againstBoost,
    priority: entry.priority,
  });
  const [home, away] = data.sides;
  if (!home || !away) throw new Error("coach: partida pausada inválida");
  return {
    year: data.year,
    neutral: data.neutral,
    decisive: data.decisive,
    aggregateBefore: data.aggregateBefore,
    big: data.big,
    derby: data.derby,
    maxSubs: data.maxSubs,
    home: side(home),
    away: side(away),
  };
}

/**
 * Continua a partida pausada com a escolha do evento: o que já aconteceu fica
 * igual; o resto do jogo usa um fluxo próprio da opção escolhida e entra na
 * tabela ou no chaveamento como qualquer outro resultado.
 */
export function resumeMatch(career: CoachCareer, option: string, forMult: number, againstMult: number): void {
  const pending = career.pendingMatch;
  if (!pending) return;
  const stored = pending.state as { live: LiveMatch; input: SerializedInput; coachIndex: 0 | 1; rested: string[] };
  const fixture = career.fixtures.find((item) => item.id === pending.fixture);
  if (!fixture) throw new Error("coach: partida pausada sem jogo");
  const live = JSON.parse(JSON.stringify(stored.live)) as LiveMatch;
  const input = restoreInput(career, stored.input);
  applyMatchChoice(live, stored.coachIndex, option, forMult, againstMult);
  const lookup = (id: string) => career.players[id] as CoachPlayer;
  playUntil(live, input, lookup, coachRng(career.setup.seed, "match", fixture.id, "b", option), null);
  const run = createRun(career);
  finishCoachMatch(run, fixture, input, live, stored.coachIndex, career.day, stored.rested);
  career.pendingMatch = null;
}

/** Setor do jogador, para os textos do evento. */
export function sectorLabel(player: CoachPlayer): Sector | "gk" {
  return sectorOf(player.position);
}
