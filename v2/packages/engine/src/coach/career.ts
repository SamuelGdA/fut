import type { CountryCode } from "@craque/world";
import { clamp } from "../math";
import {
  ActionError,
  cancelAction,
  closeAction,
  confirmAction,
  generateYouth,
  openAction,
  respondAction,
  type ConfirmPayload,
} from "./actions";
import { buildSeason, seasonMemory } from "./competitions";
import { applyEffects, matchEventSuccess, pickStageEvent, resolveEventChoice } from "./events";
import { evolvePeriod } from "./evolution";
import { sanitizeTactics, suggestTactics } from "./lineup";
import { displayStrength, FORMATION_SLOTS } from "./tactics";
import { buildReport } from "./report";
import {
  applyPeriodFinances,
  evaluateSeason,
  historyEntry,
  initialOffers,
  leaguePosition,
  objectiveFor,
  reputationChange,
  seasonBudget,
  seasonOffers,
  seasonPrizes,
} from "./review";
import { closeLeagues, offseason } from "./rollover";
import { resumeMatch, simulateDays } from "./season";
import type {
  ActionKind,
  CoachCareer,
  CoachClubState,
  CoachPlayer,
  CoachSetup,
  FormationId,
  PeriodLedger,
  Philosophy,
  RelationChange,
  Tactics,
} from "./types";
import { FORMATIONS } from "./types";
import { CAREER_SEASONS, COACH_VERSION, EVALUATION, OFFERS, PREDICTABILITY, PROMISES, REPUTATION, SATISFACTION } from "./tuning";
import { absDay, coachRng } from "./util";
import { assignRoles, createWorldState, squadOf, type WorldData } from "./world";

/**
 * A carreira do Técnico (GDD 56): estado em memória, sem save (spec 17). Toda
 * mudança passa por `coachCommand`, que nunca altera o estado recebido:
 * devolve um estado novo ou o mesmo com o motivo da recusa. Comando fora de
 * fase é recusado sem efeito, e é isso que impede cliques repetidos de
 * duplicar vendas, receitas ou simulações (spec 18).
 */

function emptyLedger(): PeriodLedger {
  return { startOvr: {}, relations: [], transfersIn: 0, transfersOut: 0, revenue: 0, wages: 0, prizes: 0, injuries: [], moments: [], newTraits: [] };
}

export function createCoachCareer(setup: CoachSetup, data: WorldData): CoachCareer {
  const world = createWorldState(setup.seed, setup.startYear, data);
  const career: CoachCareer = {
    setup,
    version: COACH_VERSION,
    year: setup.startYear,
    half: 0,
    phase: "offers",
    seasonIndex: 0,
    day: 0,
    players: world.players,
    clubs: world.clubs,
    competitions: {},
    fixtures: [],
    memory: world.memory,
    coach: null,
    reputation: REPUTATION.start,
    actionsUsed: 0,
    actions: [],
    flow: null,
    youth: [],
    event: null,
    matchEventArmed: false,
    pendingMatch: null,
    promises: [],
    offers: [],
    review: null,
    lastReport: null,
    history: [],
    legacy: {},
    moments: [],
    bans: {},
    stageReports: [],
    ledger: emptyLedger(),
    ended: null,
    dismissedThisSeason: false,
    movement: null,
  };
  const season = buildSeason({ seed: setup.seed, year: setup.startYear, clubs: career.clubs, memory: career.memory });
  career.competitions = season.competitions;
  career.fixtures = season.fixtures;
  career.offers = initialOffers(career);
  return career;
}

/** Cópia de trabalho: jogadores, clubes, jogos e o resto ganham cópias próprias. */
export function cloneCareer(career: CoachCareer): CoachCareer {
  const players: Record<string, CoachPlayer> = {};
  for (const [id, player] of Object.entries(career.players)) {
    players[id] = { ...player, recentRatings: [...player.recentRatings], traits: [...player.traits], season: { ...player.season } };
  }
  const clubs: CoachCareer["clubs"] = {};
  for (const [id, club] of Object.entries(career.clubs)) clubs[id] = { ...club };
  const deep = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
  return {
    ...career,
    players,
    clubs,
    competitions: deep(career.competitions),
    fixtures: career.fixtures.map((fixture) => ({ ...fixture })),
    coach: career.coach ? deep(career.coach) : null,
    actions: [...career.actions],
    flow: career.flow ? deep(career.flow) : null,
    youth: deep(career.youth),
    event: career.event ? deep(career.event) : null,
    pendingMatch: career.pendingMatch ? deep(career.pendingMatch) : null,
    promises: deep(career.promises),
    offers: [...career.offers],
    history: [...career.history],
    legacy: deep(career.legacy),
    moments: [...career.moments],
    bans: { ...career.bans },
    stageReports: [...career.stageReports],
    ledger: deep(career.ledger),
  };
}

// ---------------------------------------------------------------- clube

function bestFormation(squad: readonly CoachPlayer[], country: CountryCode, year: number): FormationId {
  let best: FormationId = "4-3-3";
  let bestValue = -Infinity;
  for (const formation of FORMATIONS) {
    const tactics = suggestTactics(squad, { formation, philosophy: "possession" }, country, year, 0);
    const value = tactics.lineup.reduce((total, id) => total + (squad.find((player) => player.id === id)?.level ?? 0), 0);
    if (value > bestValue + 0.5) {
      best = formation;
      bestValue = value;
    }
  }
  return best;
}

function setCoachClub(career: CoachCareer, clubId: string): void {
  const club = career.clubs[clubId];
  if (!club) throw new ActionError("club");
  const squad = squadOf(career, clubId);
  club.strength = displayStrength(squad);
  assignRoles(squad, career.year, club.strength);
  const formation = bestFormation(squad, club.country, career.year);
  const rng = coachRng(career.setup.seed, "predictability", career.year, clubId);
  const tactics = suggestTactics(squad, { formation, philosophy: "possession" }, club.country, career.year, career.day);
  const state: CoachClubState = {
    club: clubId,
    tactics,
    predictability: { value: 0, readFocus: rng.chance(0.5) ? "formation" : "philosophy", lastFormation: formation, lastPhilosophy: "possession", lastLineup: [] },
    training: { def: 0, mid: 0, att: 0 },
    activeTraining: { def: 0, mid: 0, att: 0 },
    board: 60,
    fans: 50,
    budget: seasonBudget(club, 0),
    fundsGranted: 0,
    fundsRequests: 0,
    objective: objectiveFor(career, clubId),
    raisedObjective: false,
    credit: EVALUATION.creditStart,
    seasonsAtClub: 0,
    arrivedYear: career.year,
  };
  career.coach = state;
  for (const player of squad) {
    if (career.legacy[player.id]) continue;
    career.legacy[player.id] = {
      player: player.id,
      name: player.name,
      nationality: player.nationality,
      position: player.position,
      apps: 0,
      goals: 0,
      seasons: 0,
      bestOvr: player.ovr,
      revealed: false,
      signed: false,
      firstOvr: player.ovr,
    };
  }
}

/** Escalação válida depois de vendas, lesões longas e aposentadorias: completa as vagas vazias. */
function refreshTactics(career: CoachCareer): void {
  const coach = career.coach;
  if (!coach) return;
  const club = career.clubs[coach.club];
  const squad = squadOf(career, coach.club);
  const clean = sanitizeTactics(coach.tactics, squad, club?.country ?? "BRA");
  if (clean.lineup.every((id) => id !== "")) {
    coach.tactics = clean;
    return;
  }
  const suggestion = suggestTactics(squad, clean, club?.country ?? "BRA", career.year, career.day);
  const used = new Set(clean.lineup.filter(Boolean));
  const lineup = clean.lineup.map((id, index) => {
    if (id) return id;
    const fill = suggestion.lineup[index];
    if (fill && !used.has(fill)) {
      used.add(fill);
      return fill;
    }
    const other = suggestion.lineup.find((candidate) => candidate && !used.has(candidate)) ?? "";
    if (other) used.add(other);
    return other;
  });
  coach.tactics = sanitizeTactics({ ...clean, lineup, bench: clean.bench.filter((id) => !used.has(id)) }, squad, club?.country ?? "BRA");
}

function beginStage(career: CoachCareer): void {
  career.phase = "stage";
  career.actionsUsed = 0;
  career.actions = [];
  career.flow = null;
  career.event = null;
  career.matchEventArmed = false;
  career.pendingMatch = null;
  career.ledger = emptyLedger();
  const coach = career.coach;
  if (coach) {
    coach.training = { def: 0, mid: 0, att: 0 };
    for (const player of squadOf(career, coach.club)) career.ledger.startOvr[player.id] = player.ovr;
  }
  career.youth = generateYouth(career);
  refreshTactics(career);
}

// --------------------------------------------------------------- comandos

export type CoachCommand =
  | { readonly type: "acceptOffer"; readonly offer: string }
  | { readonly type: "setTactics"; readonly formation?: FormationId; readonly philosophy?: Philosophy; readonly lineup?: readonly string[]; readonly bench?: readonly string[] }
  | { readonly type: "autoLineup" }
  | { readonly type: "openAction"; readonly kind: ActionKind }
  | { readonly type: "cancelAction" }
  | { readonly type: "confirmAction"; readonly payload: ConfirmPayload }
  | { readonly type: "respond"; readonly item: string; readonly decision: string }
  | { readonly type: "closeAction" }
  | { readonly type: "advance" }
  | { readonly type: "chooseEvent"; readonly option: string }
  | { readonly type: "simulate" }
  | { readonly type: "chooseMatchEvent"; readonly option: string }
  | { readonly type: "continue" }
  | { readonly type: "decide"; readonly choice: "stay" | "retire" | "finish" | { readonly offer: string } }
  | { readonly type: "retire" };

export interface CoachStep {
  readonly career: CoachCareer;
  readonly error: string | null;
}

/** Aplica um comando. Nunca altera o estado recebido. */
export function coachCommand(career: CoachCareer, command: CoachCommand): CoachStep {
  const next = cloneCareer(career);
  try {
    apply(next, command);
    return { career: next, error: null };
  } catch (error) {
    if (error instanceof ActionError) return { career, error: error.code };
    throw error;
  }
}

function ensure(condition: boolean, code: string): void {
  if (!condition) throw new ActionError(code);
}

function apply(career: CoachCareer, command: CoachCommand): void {
  ensure(career.phase !== "ended", "ended");
  switch (command.type) {
    case "acceptOffer": {
      ensure(career.phase === "offers", "phase");
      const offer = career.offers.find((item) => item.id === command.offer);
      ensure(Boolean(offer), "offer");
      setCoachClub(career, (offer as { club: string }).club);
      career.offers = [];
      beginStage(career);
      return;
    }
    case "setTactics": {
      ensure(career.phase === "stage" || career.phase === "event", "phase");
      const coach = career.coach as CoachClubState;
      const formation = command.formation ?? coach.tactics.formation;
      let lineup = command.lineup ? [...command.lineup] : [...coach.tactics.lineup];
      if (command.formation && command.formation !== coach.tactics.formation && !command.lineup) {
        // Trocar a formação mantém os mesmos onze nas vagas mais parecidas.
        lineup = remapLineup(career, coach.tactics, formation);
      }
      const tactics: Tactics = {
        formation,
        philosophy: command.philosophy ?? coach.tactics.philosophy,
        lineup,
        bench: command.bench ? [...command.bench] : coach.tactics.bench,
      };
      const club = career.clubs[coach.club];
      coach.tactics = sanitizeTactics(tactics, squadOf(career, coach.club), club?.country ?? "BRA");
      return;
    }
    case "autoLineup": {
      ensure(career.phase === "stage" || career.phase === "event", "phase");
      const coach = career.coach as CoachClubState;
      const club = career.clubs[coach.club];
      coach.tactics = suggestTactics(squadOf(career, coach.club), coach.tactics, club?.country ?? "BRA", career.year, career.day);
      return;
    }
    case "openAction":
      openAction(career, command.kind);
      return;
    case "cancelAction":
      cancelAction(career);
      return;
    case "confirmAction":
      confirmAction(career, command.payload);
      return;
    case "respond":
      respondAction(career, command.item, command.decision);
      return;
    case "closeAction":
      closeAction(career);
      return;
    case "advance": {
      ensure(career.phase === "stage", "phase");
      if (career.flow) {
        if (career.flow.step === "select") cancelAction(career);
        else closeAction(career);
      }
      refreshTactics(career);
      const picked = pickStageEvent(career);
      career.matchEventArmed = picked.match;
      career.event = picked.event;
      career.phase = "event";
      return;
    }
    case "chooseEvent": {
      ensure(career.phase === "event" && Boolean(career.event) && !career.event?.chosen, "phase");
      resolveEventChoice(career, command.option);
      ensure(Boolean(career.event?.chosen), "option");
      return;
    }
    case "simulate": {
      ensure(career.phase === "event" && (!career.event || Boolean(career.event.chosen)), "phase");
      const coach = career.coach as CoachClubState;
      coach.activeTraining = { ...coach.training };
      refreshTactics(career);
      const outcome = simulateDays(career);
      if (!outcome.paused) finishPeriod(career);
      return;
    }
    case "chooseMatchEvent": {
      ensure(career.phase === "matchEvent" && Boolean(career.event) && Boolean(career.pendingMatch), "phase");
      const event = career.event as NonNullable<CoachCareer["event"]>;
      const option = event.options.find((item) => item.id === command.option);
      ensure(Boolean(option), "option");
      const match = option?.success.find((effect) => effect.type === "match");
      const forMult = match && match.type === "match" ? match.forMult : 1;
      const againstMult = match && match.type === "match" ? match.againstMult : 1;
      const pending = career.pendingMatch as NonNullable<CoachCareer["pendingMatch"]>;
      resumeMatch(career, command.option, forMult, againstMult);
      const fixture = career.fixtures.find((item) => item.id === pending.fixture);
      const coachClub = career.coach?.club ?? "";
      const own = fixture?.result ? (fixture.home === coachClub ? fixture.result.home : fixture.result.away) : 0;
      const other = fixture?.result ? (fixture.home === coachClub ? fixture.result.away : fixture.result.home) : 0;
      const before = event.match?.aggregate && event.match ? [event.match.aggregate[0] - event.match.score[0], event.match.aggregate[1] - event.match.score[1]] as const : null;
      const success = matchEventSuccess(event, own, other, before);
      event.chosen = command.option;
      event.outcome = success ? "success" : "failure";
      applyEffects(career, (success ? option?.success : option?.failure)?.filter((effect) => effect.type !== "match") ?? [], null, "event");
      career.ledger.moments.push({ kind: "matchEvent", event: event.id, outcome: event.outcome, fixture: pending.fixture });
      career.phase = "event";
      const outcome = simulateDays(career);
      if (!outcome.paused) finishPeriod(career);
      return;
    }
    case "continue": {
      ensure(career.phase === "results", "phase");
      const final = career.setup.mode === "fast" || career.half === 1;
      if (final) {
        career.phase = "review";
        return;
      }
      career.half = 1;
      beginStage(career);
      return;
    }
    case "decide": {
      ensure(career.phase === "review", "phase");
      const choice = command.choice;
      if (choice === "retire" || choice === "finish") {
        ensure(choice === "retire" || career.seasonIndex >= CAREER_SEASONS - 1, "notLastSeason");
        career.ended = { reason: career.seasonIndex >= CAREER_SEASONS - 1 ? "completed" : "retired", partial: false };
        career.phase = "ended";
        return;
      }
      ensure(career.seasonIndex < CAREER_SEASONS - 1, "careerOver");
      let target: string;
      if (choice === "stay") {
        const stay = career.offers.find((offer) => offer.stay);
        ensure(Boolean(stay), "noStayOffer");
        target = (stay as { club: string }).club;
      } else {
        const offer = career.offers.find((item) => item.id === choice.offer);
        ensure(Boolean(offer), "offer");
        target = (offer as { club: string }).club;
      }
      startNextSeason(career, target);
      return;
    }
    case "retire": {
      ensure(canRetire(career), "cannotRetire");
      const playedThisSeason = career.fixtures.some((fixture) => fixture.result?.coach);
      const partial = career.phase !== "review" && playedThisSeason;
      if (partial && career.coach) career.history.push(historyEntry(career, null, true, false, false, false));
      career.ended = { reason: "retired", partial };
      career.phase = "ended";
      return;
    }
  }
}

/** Aposentadoria (spec 17): depois da primeira temporada completa, em momento apropriado. */
export function canRetire(career: CoachCareer): boolean {
  if (career.phase === "ended" || career.phase === "offers" || career.phase === "matchEvent") return false;
  if (career.flow) return false;
  if (career.phase === "event" && career.event && !career.event.chosen) return false;
  return career.seasonIndex >= 1 || career.phase === "review";
}

function remapLineup(career: CoachCareer, tactics: Tactics, formation: FormationId): string[] {
  const slots = FORMATION_SLOTS[formation];
  const previous = FORMATION_SLOTS[tactics.formation];
  const remaining = tactics.lineup.map((id, index) => ({ id, slot: previous[index] })).filter((entry) => entry.id);
  const result: string[] = slots.map(() => "");
  slots.forEach((slot, index) => {
    const exact = remaining.findIndex((entry) => entry.slot === slot);
    if (exact >= 0) {
      result[index] = remaining[exact]?.id ?? "";
      remaining.splice(exact, 1);
    }
  });
  slots.forEach((slot, index) => {
    if (result[index]) return;
    const player = remaining.findIndex((entry) => {
      const p = career.players[entry.id];
      return p && (p.position === slot || p.alternates.includes(slot));
    });
    const pick = player >= 0 ? player : 0;
    const entry = remaining[pick];
    if (entry) {
      result[index] = entry.id;
      remaining.splice(pick, 1);
    }
  });
  return result;
}

// ------------------------------------------------------- fim de período

function evaluatePromises(career: CoachCareer): void {
  const coach = career.coach;
  if (!coach) return;
  for (const promise of career.promises) {
    if (promise.status !== "active" || promise.until > career.day) continue;
    const player = promise.player ? career.players[promise.player] : null;
    let kept = true;
    if (promise.kind === "keep") kept = Boolean(player && player.club === coach.club);
    else if (promise.kind === "youth") {
      const apps = Object.values(career.players)
        .filter((item) => item.club === coach.club && career.year - item.birthYear <= 21)
        .reduce((total, item) => total + item.season.apps, 0);
      kept = apps - promise.baseline.apps >= promise.target;
    } else if (player) {
      const available = player.season.available - promise.baseline.available;
      // Lesão suspende a cobrança: sem jogos disponíveis suficientes, não há quebra.
      if (available < 3) kept = true;
      else if (promise.kind === "starts") kept = (player.season.starts - promise.baseline.starts) / available >= promise.target;
      else kept = player.season.apps - promise.baseline.apps >= Math.min(promise.target, Math.ceil(available * 0.5));
    }
    promise.status = kept ? "kept" : "broken";
    const effect = kept ? PROMISES.kept : PROMISES.broken;
    if (player && player.club === coach.club) player.satisfaction = clamp(player.satisfaction + effect.satisfaction, 0, 100);
    for (const other of squadOf(career, coach.club)) other.satisfaction = clamp(other.satisfaction + effect.squad / 4, 0, 100);
    career.ledger.relations.push({ bar: "squad", delta: effect.squad, reason: kept ? "promiseKept" : "promiseBroken" });
    if (!kept) {
      coach.board = clamp(coach.board + PROMISES.broken.board, 0, 100);
      career.ledger.relations.push({ bar: "board", delta: PROMISES.broken.board, reason: "promiseBroken" });
    }
  }
}

/** Resultados mexem pouco na satisfação (limitado), e ela volta devagar ao alvo: sem espiral. */
function periodSatisfaction(career: CoachCareer): void {
  const coach = career.coach;
  if (!coach) return;
  const position = leaguePosition(career, coach.club);
  const squad = squadOf(career, coach.club);
  const objective = coach.objective;
  const results = position === null ? 0 : clamp((objective.expected - position) / Math.max(2, objective.tableSize / 5), -1, 1);
  const leader = squad.some((player) => player.traits.includes("leader"));
  const delta = results * SATISFACTION.resultsCap * (results < 0 && leader ? 0.6 : 1);
  for (const player of squad) {
    player.satisfaction = clamp(player.satisfaction + delta, 0, 100);
    player.satisfaction += SATISFACTION.reversion * (SATISFACTION.target - player.satisfaction);
  }
}

function periodRelations(career: CoachCareer, final: boolean, promoted: boolean, relegated: boolean): RelationChange[] {
  const coach = career.coach;
  if (!coach) return [];
  const changes: RelationChange[] = [...career.ledger.relations];
  const position = leaguePosition(career, coach.club);
  const objective = coach.objective;
  const results = position === null ? 0 : clamp((objective.expected - position) / Math.max(2, objective.tableSize / 5), -1.5, 1.5);
  const push = (bar: "board" | "fans", delta: number, reason: string) => {
    if (Math.abs(delta) < 0.5) return;
    const rounded = Math.round(delta);
    if (bar === "fans") coach.fans = clamp(coach.fans + rounded, 0, 100);
    else coach.board = clamp(coach.board + rounded, 0, 100);
    changes.push({ bar, delta: rounded, reason });
  };
  push("fans", results * (final ? 5 : 3.5), results >= 0 ? "resultsAbove" : "resultsBelow");
  const derby = career.ledger.moments.reduce((total, moment) => total + (moment.kind === "derbyWin" ? 2 : moment.kind === "derbyLoss" ? -2 : 0), 0);
  push("fans", derby, derby >= 0 ? "derbyWins" : "derbyLosses");
  if (final) {
    const titles = Object.values(career.competitions).filter((state) => state.champion === coach.club).length;
    push("fans", titles * 6, "titles");
    if (promoted) push("fans", 8, "promotion");
    if (relegated) push("fans", -10, "relegation");
  } else {
    push("board", results * 4, results >= 0 ? "resultsAbove" : "resultsBelow");
  }
  return changes;
}

function finishPeriod(career: CoachCareer): void {
  const coach = career.coach as CoachClubState;
  const fraction = career.setup.mode === "fast" ? 1 : 0.5;
  const final = career.setup.mode === "fast" || career.half === 1;
  career.day = absDay(career.seasonIndex, final ? 299 : 149);
  evaluatePromises(career);
  periodSatisfaction(career);
  const changes = evolvePeriod(career, fraction);
  applyPeriodFinances(career, fraction);
  for (const player of squadOf(career, coach.club)) {
    const legacy = career.legacy[player.id];
    if (legacy) legacy.bestOvr = Math.max(legacy.bestOvr, player.ovr);
  }
  let promoted = false;
  let relegated = false;
  let relations: RelationChange[];
  if (final) {
    const movement = closeLeagues(career);
    career.movement = { promoted: [...movement.promoted], relegated: [...movement.relegated] };
    seasonPrizes(career, movement.promoted, movement.relegated);
    promoted = movement.promoted.has(coach.club);
    relegated = movement.relegated.has(coach.club);
    relations = periodRelations(career, true, promoted, relegated);
    const review = evaluateSeason(career, promoted, relegated);
    const objective = coach.objective;
    const rescue = objective.kind === "survive" && !relegated && review.objectiveMet;
    const revelations = squadOf(career, coach.club).filter((player) => career.legacy[player.id]?.revealed && player.season.apps >= 10).length;
    const titles = Object.values(career.competitions).filter((state) => state.champion === coach.club).map((state) => state.id);
    const delta = reputationChange(career, review, titles, promoted, rescue, revelations);
    const before = career.reputation;
    career.reputation = clamp(career.reputation + delta, 0, 100);
    if (Math.round(delta) !== 0) relations.push({ bar: "reputation", delta: Math.round(career.reputation - before), reason: delta >= 0 ? "seasonGood" : "seasonBad" });
    career.review = { ...review, reputationAfter: career.reputation };
    coach.board = review.confidence;
    coach.credit = review.creditAfter;
    career.history.push(historyEntry(career, career.review, false, promoted, relegated, rescue));
    for (const player of squadOf(career, coach.club)) {
      const legacy = career.legacy[player.id];
      if (legacy && player.season.apps > 0) legacy.seasons += 1;
    }
    career.dismissedThisSeason = review.dismissed;
    if (review.dismissed) career.bans[coach.club] = career.seasonIndex + OFFERS.banSeasons;
    career.offers = career.seasonIndex >= CAREER_SEASONS - 1 ? [] : seasonOffers(career, review.dismissed);
  } else {
    relations = periodRelations(career, false, false, false);
  }
  const report = buildReport(career, changes, relations, final, !final);
  career.lastReport = report;
  career.stageReports = [...career.stageReports, report];
  career.moments = [...career.moments, ...career.ledger.moments];
  career.phase = "results";
}

function startNextSeason(career: CoachCareer, target: string): void {
  const coach = career.coach as CoachClubState;
  const previousClub = coach.club;
  const leftover = coach.budget;
  const movement = career.movement ?? { promoted: [], relegated: [] };
  career.memory = seasonMemory(career.year, career.competitions, career.memory);
  offseason(career, { promoted: new Set(movement.promoted), relegated: new Set(movement.relegated) });
  career.movement = null;
  if (target !== previousClub) {
    setCoachClub(career, target);
  } else {
    const club = career.clubs[coach.club];
    coach.seasonsAtClub += 1;
    coach.objective = objectiveFor(career, coach.club);
    coach.raisedObjective = false;
    coach.budget = club ? seasonBudget(club, leftover) : 0;
    coach.fundsGranted = 0;
    coach.fundsRequests = 0;
    coach.predictability.value *= PREDICTABILITY.carryOver;
    coach.predictability.readFocus = coachRng(career.setup.seed, "readFocus", career.year).chance(0.5) ? "formation" : "philosophy";
  }
  const season = buildSeason({ seed: career.setup.seed, year: career.year, clubs: career.clubs, memory: career.memory });
  career.competitions = season.competitions;
  career.fixtures = season.fixtures;
  career.half = 0;
  career.day = absDay(career.seasonIndex, 0);
  career.review = null;
  career.offers = [];
  career.dismissedThisSeason = false;
  career.promises = career.promises.filter((promise) => promise.status === "active" || promise.until >= absDay(career.seasonIndex - 1, 0));
  if (career.coach) {
    // A nova temporada recomeça a satisfação perto do alvo do papel.
    for (const player of squadOf(career, career.coach.club)) player.satisfaction += 0.2 * (SATISFACTION.target - player.satisfaction);
  }
  beginStage(career);
}

export { COACH_VERSION };
