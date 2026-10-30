import { titleKeepChance } from "../records/pressure";
import { getClub, getCompetition, titleImportance } from "@craque/world";
import { clamp } from "../math";
import { attributesAt, ovrAt } from "../player/player";
import { marketLeagueStrength } from "../player/value";
import { isDefender } from "../player/positions";
import { REAL_MARKS, recordTally } from "../records/pressure";
import { stream, type Rng } from "../rng";
import { outcomeStream } from "./outcome";
import { simulatePlayerSeason, type SeasonModifiers, type PlayerSeasonStats } from "../season/playerSeason";
import { LAST_AGE, SEASONS_PER_PERIOD, type Six } from "../types";
import { nextDecision, transferOpportunityDue, windowDecision } from "./decisions";
import { simulatePeriod } from "./period";
import { isCornerChoice, isKeeperSave, isShootout, matchActionKind, pickMatchScene, matchSkillWeights } from "./matchMoments";
import { squadRole } from "../season/role";
import { CLUB_CONFEDERATION, clubIndex } from "../world/model";
import { bondLegacy } from "./context";
import { guaranteeFocus } from "../evolution/training";
import { VETERAN_PATHS, type KeyMatch, type KeyMatchResult, type PromiseReport, type SeasonPromise, type VeteranPath } from "./dramaTypes";
import type { Career, CareerNotice, Decision, DecisionOption, SeasonRecord } from "./types";

export function promiseOptions(career: Career): readonly SeasonPromise[] {
  const last = career.history.at(-1);
  const defensive = isDefender(career.player.position) || career.player.position === "gk";
  const production = defensive ? last?.production.cleanSheets ?? 3 : (last?.production.goals ?? 2) + (last?.production.assists ?? 1);
  const seasons = career.drama?.remaining ?? Math.min(SEASONS_PER_PERIOD[career.setup.pace], LAST_AGE - career.age + 1);
  const first = Math.max(10 * seasons, Math.floor(production * seasons * 0.6 / 10) * 10);
  return [
    ...(["humble", "protagonist", "legend"] as const).map((level, index): SeasonPromise => ({ year: career.world.year, throughYear: career.world.year + seasons - 1, level, metric: defensive ? "cleanSheets" : "contributions", target: first + index * 10 })),
  ];
}

export function hasPublicRole(career: Career): boolean {
  if (!career.contract) return false;
  const last = career.history.at(-1);
  if (last?.club === career.contract.club && !["rotation", "starter", "star"].includes(last.role)) return false;
  const role = squadRole(career.player.position, ovrAt(career.player, career.age), career.world.strength[clubIndex(career.contract.club)] ?? 0).role;
  return role === "rotation" || role === "starter" || role === "star";
}
export function veteranDue(career: Career): boolean {
  // Uma oportunidade de carreira, não uma etapa obrigatória do envelhecimento.
  return !career.veteran && !career.drama && career.age >= 33
    && ovrAt(career.player, career.age - 2) - ovrAt(career.player, career.age) >= 2
    && stream(career.setup.seed, "drama", "veteranInvitation").chance(0.45);
}

/** Cada reinvenção tem uma concessão que continua valendo depois dos 30. */
export function veteranModifiers(path: VeteranPath | undefined, base: SeasonModifiers): SeasonModifiers {
  const game = path === "poacher" ? 0.86 : path === "maestro" ? 0.95 : path === "athlete" ? 1.06 : 1;
  const production = path === "guardian" ? 0.92 : path === "mentor" ? 0.96 : 1;
  return {
    ...base,
    gamesScale: (base.gamesScale ?? 1) * game,
    productionScale: (base.productionScale ?? 1) * production,
    injuryScale: (base.injuryScale ?? 1) * (path === "athlete" ? 1.3 : path === "guardian" ? 0.7 : 1),
    growthScale: (base.growthScale ?? 1) * (path === "mentor" ? 0.8 : 1),
    boosts: { ...base.boosts, cup: (base.boosts?.cup ?? 0) + (path === "captain" ? 0.7 : 0), continental: (base.boosts?.continental ?? 0) + (path === "captain" ? 0.7 : 0) },
  };
}

export function matchChance(career: Career, match: KeyMatch, action: string): number {
  const attributes = attributesAt(career.player, career.age);
  const keeper = career.player.position === "gk";
  if (action === "leave") return 0.5;
  const pressure = match.stage === "final" ? titleKeepChance(recordTally(career.history), match.competition) : 1;
  if (isKeeperSave(career.player.position, match.scene)) return keeperSaveChance(career) * pressure;
  const weights = matchSkillWeights(career.player.position, match, action);
  const skill = weights.reduce((sum, weight, index) => sum + weight * (attributes[index] ?? 0), 0);
  const cap = matchChanceCeiling(career, match, action);
  const agePenalty = action === "team" && career.veteran === "maestro" ? 0 : Math.max(0, career.age - 31) * 0.006;
  const bonus = career.veteran === "maestro" && action === "team" ? 0.08
    : career.veteran === "poacher" && !keeper && action !== "team" && action !== "safe" ? 0.1
    : career.veteran === "guardian" && (keeper || isDefender(career.player.position)) ? 0.07
    : career.veteran === "athlete" && (match.scene === "counter" || match.scene === "breakaway") ? 0.08
    : career.veteran === "captain" && match.stage !== "league" ? 0.04 : 0;
  // A nota da ação domina; OVR não pode transformar um passe ruim em passe de craque.
  const ovr = ovrAt(career.player, career.age);
  const level = match.national ? undefined : marketLeagueStrength(career.world, match.team);
  const leagueFactor = level === undefined ? 1 : clamp(1 + (ovr - level) * 0.004, 0.9, 1.1);
  const quality = clamp((0.95 * skill + 0.05 * ovr) / 99 * leagueFactor, 0, 1);
  const chance = cap * quality + bonus - agePenalty;
  return clamp(chance, Math.min(0.05, cap), cap) * (action !== "safe" ? pressure : 1);
}

/**
 * Pênalti contra o goleiro (D91): o cobrador escolhe o canto antes, 50/50.
 * Acertar o lado é defender. O especialista em pênaltis ainda alcança
 * `specialistReach` das bolas no canto errado.
 */
export const KEEPER_SAVE = { guess: 0.5, specialistReach: 0.2 } as const;

function keeperSaveChance(career: Career): number {
  return KEEPER_SAVE.guess + (career.veteran === "poacher" ? (1 - KEEPER_SAVE.guess) * KEEPER_SAVE.specialistReach : 0);
}

/** O canto do cobrador, sorteado antes da escolha e estável no replay. */
export function penaltySide(career: Career, match: KeyMatch): "left" | "right" {
  return stream(career.setup.seed, "drama", "penaltySide", career.world.year, match.competition, match.stage).chance(0.5) ? "left" : "right";
}

/** O teto muda por aparição, mas fica estável ao reler ou refazer a mesma escolha. */
export function matchChanceCeiling(career: Career, match: KeyMatch, action: string): number {
  if (match.scene === "corner" && action === "bold") return 0.08;
  if (match.scene === "keeperCorner" && action !== "safe") return action === "bold" ? 0.18 : 0.4;
  if (match.scene === "bicycle" && action === "bold") return 0.35;
  if (action === "leave") return 0.5;
  if (isKeeperSave(career.player.position, match.scene)) return keeperSaveChance(career);
  // Cobrança rara: o defensor bate um pouco mais solto; o goleiro, menos (D91).
  if (match.scene === "suddenDeath") return 0.8;
  if (match.scene === "keeperShootout") return 0.75;
  if (["left", "right"].includes(action)) return 0.7;
  const rng = stream(career.setup.seed, "drama", "chanceCeiling", career.world.year, match.competition, match.stage, match.scene, action);
  return action === "team" ? rng.int(70, 80) / 100 : action === "safe" ? rng.int(70, 90) / 100 : 0.7;
}

function setDecision(career: Career, kind: Decision["kind"], actions: readonly string[], extras: Partial<Decision> = {}): Career {
  const id = career.decisionCount + 1;
  const options: DecisionOption[] = actions.map((action) => ({ id: `drama:${action}`, kind: "drama", action, chance: extras.match ? matchChance(career, extras.match, action) : null }));
  const index = (career.drama?.decisions ?? 0) + 1;
  const total = Math.max(index, (career.drama?.decisions ?? 0) + (career.drama?.queue.length ?? 0));
  return { ...career, decisionCount: id, decision: { id, kind, age: career.age, year: career.world.year, options, event: null, reason: null, progress: { index, total }, ...extras } };
}

/**
 * O ano como o mundo o joga sem as escolhas de partida: a base do plano de
 * jogos e da tabela da rodada decisiva (D96). Puro e determinístico.
 */
export function seasonPreview(career: Career, club: string) {
  return simulatePlayerSeason({ seed: career.setup.seed, world: career.world, player: career.player, age: career.age, club, nationality: career.nationality, difficulty: career.setup.difficulty, fans: career.bonds[club]?.fans ?? 50, focus: null, modifiers: veteranModifiers(career.veteran, career.pending.modifiers), tally: recordTally(career.history) });
}

function planMatches(career: Career): { queue: readonly KeyMatch[]; reserve: readonly KeyMatch[] } {
  const contract = career.contract;
  if (!contract || career.pending.suspension >= 0.5 || (career.history.at(-1)?.games ?? 0) < 12) return { queue: [], reserve: [] };
  const preview = seasonPreview(career, contract.club);
  if (preview.stats.games < 12 || !["rotation", "starter", "star"].includes(preview.stats.role)) return { queue: [], reserve: [] };
  const rng = stream(career.setup.seed, "drama", "matches", career.world.year);
  const matches: KeyMatch[] = [];
  const recent = [...career.history.slice(-2).flatMap((season) => season.keyMatches ?? []), ...(career.drama?.results ?? [])].map((result) => result.match.scene);
  const used = new Set(recent);
  // D110: o batedor do time (finalização alta fora do ataque) cai mais em pênalti e falta.
  const finishing = attributesAt(career.player, career.age)[1] ?? 0;
  const build = (competition: string, team: string, opponents: readonly string[], national: boolean, stage: KeyMatch["stage"]): KeyMatch | null => {
    const others = opponents.filter((id) => id !== team);
    if (!others.length) return null;
    const opponent = rng.pick(others);
    const scene = pickMatchScene(career.player.position, stage !== "league", used, rng, finishing);
    used.add(scene);
    const scoreRng = stream(career.setup.seed, "drama", "score", career.world.year, competition, stage);
    const tied = scoreRng.weighted([[0, 2], [1, 5], [2, 2], [3, 1]]);
    const behind = scene === "keeperCorner" || (stage === "league" && scoreRng.chance(0.18));
    const kick = scene === "suddenDeath" ? scoreRng.int(7, 10) : scene === "keeperShootout" ? 11 : 0;
    return { competition, team, opponent, national, stage, minute: isShootout(scene) ? 120 : scene === "keeperCorner" ? scoreRng.int(92, 95) : rng.int(76, 89), score: [tied, tied + Number(behind)], scene, ...(kick ? { kick } : {}) };
  };
  const add = (competition: string, team: string, opponents: readonly string[], national: boolean, stage: KeyMatch["stage"]) => {
    const match = build(competition, team, opponents, national, stage);
    if (match) matches.push(match);
  };
  // Só partidas das fases realmente alcançadas no mundo sem a escolha.
  const knockouts = [...Object.values(preview.results.continental), ...Object.values(preview.results.cups), ...Object.values(preview.results.nations)];
  const orders = new Map<string, readonly string[]>();
  for (const result of knockouts) {
    orders.set(result.competition, result.order);
    const national = result.competition === "worldcup" || result.competition.startsWith("nations:") || result.competition.startsWith("nationsleague:");
    const team = national ? career.nationality : contract.club;
    const rank = result.order.indexOf(team);
    const line = national ? preview.stats.national.lines : preview.stats.production.lines;
    if (rank < 0 || rank > 7 || !line.some((entry) => entry.competition === result.competition && entry.games > 0)) continue;
    const stage = rank <= 1 ? "final" : rank <= 3 ? "semi" : "quarter";
    add(result.competition, team, result.order.slice(0, rank <= 1 ? 2 : rank <= 3 ? 4 : 8), national, stage);
  }
  const league = preview.stats.league ? preview.results.leagues[preview.stats.league] : null;
  if (league) {
    const derby = getClub(contract.club);
    const opponents = league.rows.map((row) => row.club).filter((id) => id !== derby?.id);
    add(league.competition, contract.club, opponents, false, "league");
  }
  // Até quatro partidas no ano anual: com a decisão principal, cinco decisões (D90).
  const limit = Math.min(career.setup.pace === "normal" ? 1 : MATCH_COUNT.max, 5 - (career.drama?.decisions ?? 1));
  const count = Math.min(limit, rng.weighted(MATCH_COUNT.weights));
  const chosen: KeyMatch[] = [];
  const reserve: KeyMatch[] = [];
  // A final que vale recorde entra primeiro na fila do ano (D94): só quando o clube chegou lá de verdade.
  const stake = (match: KeyMatch) => (recordStake(career.history, match) ? 1 : 0);
  for (const match of rng.shuffle(matches).sort((a, b) => stake(b) - stake(a))) {
    // Jogos que sobraram ficam de reserva para substituir fases canceladas por eliminação.
    if (chosen.length >= count) { reserve.push(match); continue; }
    // Campanha contínua (D89): com vaga para dois jogos, a semifinal ou a final
    // pode vir depois de uma fase anterior da mesma copa, como quem avançou.
    const room = count - chosen.length >= 2 && (match.stage === "semi" || match.stage === "final");
    const earlier = room && rng.chance(MATCH_CHAIN.chance) ? earlierStage(match, rng) : null;
    const previous = earlier ? build(match.competition, match.team, (orders.get(match.competition) ?? []).slice(earlier === "semi" ? 2 : 4, earlier === "semi" ? 4 : 8).filter((id) => id !== match.opponent), match.national, earlier) : null;
    if (previous) chosen.push(previous);
    chosen.push(match);
  }
  return { queue: sortMatches(chosen), reserve };
}

function sortMatches(list: readonly KeyMatch[]): KeyMatch[] {
  return [...list].sort((a, b) => matchOrder(a) - matchOrder(b) || STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]);
}

/** Quantas partidas o ano anual sorteia, antes dos limites (D90). */
export const MATCH_COUNT = { max: 4, weights: [[1, 30], [2, 30], [3, 25], [4, 15]] as const } as const;

/** Campanha contínua: chance de a fase alcançada chegar depois de uma fase anterior (D89). */
export const MATCH_CHAIN = { chance: 0.5, semiBeforeFinal: 0.6 } as const;
const STAGE_ORDER: Readonly<Record<KeyMatch["stage"], number>> = { league: 0, quarter: 1, semi: 2, final: 3 };

function earlierStage(match: KeyMatch, rng: Rng): KeyMatch["stage"] {
  return match.stage === "final" && rng.chance(MATCH_CHAIN.semiBeforeFinal) ? "semi" : "quarter";
}



/**
 * A final que vale recorde (D94): vencer iguala (ou supera, por um) uma marca
 * real. Copa do Mundo, Champions, Libertadores, a sequência de continentais e
 * os títulos da carreira, nessa ordem. A tela mostra "vale recorde" e a fila
 * do ano dá prioridade a essa final; a chance do lance não muda.
 */
export type StakeRecord = "worldCups" | "championsLeague" | "libertadores" | "primaryStreak" | "careerTitles";
export interface RecordStake {
  readonly record: StakeRecord;
  readonly goal: "match" | "beat";
  readonly mark: number;
  /** A marca da carreira se vencer. */
  readonly after: number;
}

export function recordStake(history: readonly SeasonRecord[], match: KeyMatch): RecordStake | null {
  if (match.stage !== "final") return null;
  const tally = recordTally(history);
  const kind = getCompetition(match.competition)?.kind;
  const check = (record: StakeRecord, current: number, mark: number): RecordStake | null =>
    current + 1 === mark ? { record, goal: "match", mark, after: current + 1 } : current + 1 === mark + 1 ? { record, goal: "beat", mark, after: current + 1 } : null;
  const worldCups = Object.entries(tally.titlesBy).reduce((sum, [id, count]) => sum + (getCompetition(id)?.kind === "worldCup" ? count : 0), 0);
  return (kind === "worldCup" ? check("worldCups", worldCups, REAL_MARKS.worldCups) : null)
    ?? (match.competition === "cont1:UEFA" ? check("championsLeague", tally.titlesBy[match.competition] ?? 0, REAL_MARKS.continental) : null)
    ?? (match.competition === "cont1:CONMEBOL" ? check("libertadores", tally.titlesBy[match.competition] ?? 0, REAL_MARKS.continental) : null)
    ?? (kind === "continental1" ? check("primaryStreak", tally.continentalStreak, REAL_MARKS.continentalStreak) : null)
    ?? check("careerTitles", tally.titles, REAL_MARKS.titles);
}

/** Finais continentais fecham os clubes; qualquer seleção vem depois. */
export function matchOrder(match: KeyMatch): number {
  if (match.national) return 3;
  if (match.stage === "final" && getCompetition(match.competition)?.kind.startsWith("continental")) return 2;
  return match.stage === "final" ? 1 : 0;
}

/**
 * A promessa é uma decisão principal (D89): ocupa o lugar da janela comum do
 * ano, sem vir depois de outra decisão principal. Se não sair, não sai.
 */
export const PROMISE_CHANCE = { first: 0.6, later: 0.12, gap: 5, max: 3, minAge: 18 } as const;

export function promiseDue(career: Career): boolean {
  if (career.promise || career.drama || !hasPublicRole(career)) return false;
  const years = career.promiseYears ?? [];
  if (career.age < PROMISE_CHANCE.minAge || years.length >= PROMISE_CHANCE.max) return false;
  if (years.length && career.world.year - (years.at(-1) ?? 0) < PROMISE_CHANCE.gap) return false;
  return stream(career.setup.seed, "drama", "press", career.world.year).chance(years.length ? PROMISE_CHANCE.later : PROMISE_CHANCE.first);
}

/** A reinvenção como decisão principal, no mesmo lugar da promessa (D89). */
export function veteranDecision(career: Career): Career {
  const id = career.decisionCount + 1;
  const options: DecisionOption[] = VETERAN_PATHS.map((action) => ({ id: `drama:${action}`, kind: "drama", action, chance: null }));
  return { ...career, decisionCount: id, decision: { id, kind: "veteran", age: career.age, year: career.world.year, options, event: null, reason: null } };
}

/** A promessa como decisão principal do ano; sem progresso, como as outras principais. */
export function promiseDecision(career: Career): Career {
  const id = career.decisionCount + 1;
  const options: DecisionOption[] = (["humble", "protagonist", "legend"] as const).map((action) => ({ id: `drama:${action}`, kind: "drama", action, chance: null }));
  return { ...career, decisionCount: id, decision: { id, kind: "promise", age: career.age, year: career.world.year, options, event: null, reason: null, promises: promiseOptions(career) } };
}

/** Abre apenas o próximo momento, sem simular nem avançar a idade. */
export function continueDrama(career: Career, notices: CareerNotice[]): Career {
  let next = career;
  const period = next.drama;
  if (!period) return nextDecision(next, notices);
  if (next.focus && next.focusAge === period.startAge) next = { ...next, player: guaranteeFocus(next.player, next.focus, period.startAttributes, next.age) };
  if (period.decisions === 0 && transferOpportunityDue(next)) return windowDecision(next, null, true);
  if (!period.prepared) {
    const plan = planMatches(next);
    next = { ...next, drama: { ...period, prepared: true, queue: plan.queue, reserve: plan.reserve } };
  }
  const match = next.drama?.queue[0];
  if (match) {
    return setDecision(next, "match", match.scene === "decisivePenalty" ? ["take", "leave"] : isCornerChoice(match.scene) ? ["left", "right"] : ["bold", "team", "safe"], { match });
  }
  const ctx = next.drama ?? period;
  const last = ctx.remaining <= 1 || next.age >= LAST_AGE;
  next = simulatePeriod(next, notices, ctx.event, ctx.traitor, { length: 1, first: next.age === ctx.startAge, last, start: ctx.startAttributes, startAge: ctx.startAge });
  if (last || !next.contract) return nextDecision({ ...next, drama: undefined, promise: undefined }, notices);
  return continueDrama({ ...next, drama: { ...ctx, remaining: ctx.remaining - 1, event: null, traitor: false, prepared: false, queue: [], reserve: [], results: [], decisions: 0 } }, notices);
}

export function startDrama(career: Career, notices: CareerNotice[], event: SeasonRecord["event"], traitor: boolean, start?: Six, decisions = 1): Career {
  if (!career.contract) return nextDecision(career, notices);
  if (career.drama) return continueDrama({ ...career, drama: { ...career.drama, decisions: career.drama.decisions + decisions } }, notices);
  return continueDrama({ ...career, drama: { remaining: Math.min(SEASONS_PER_PERIOD[career.setup.pace], LAST_AGE - career.age + 1), startAge: career.age, startAttributes: start ?? attributesAt(career.player, career.age), event, traitor, prepared: false, queue: [], reserve: [], results: [], decisions } }, notices);
}

export function resolveDrama(career: Career, option: Extract<DecisionOption, { kind: "drama" }>, notices: CareerNotice[]): Career {
  const decision = career.decision;
  const period = career.drama;
  if (decision?.kind === "promise" && !period) {
    // A promessa principal abre o período como qualquer outra escolha de ficar.
    const promise = decision.promises?.find((item) => item.level === option.action);
    const kept: Career = promise ? { ...career, decision: null, promise, promiseYears: [...(career.promiseYears ?? []), promise.year] } : { ...career, decision: null };
    return startDrama(kept, notices, null, false);
  }
  if (decision?.kind === "veteran" && !period) {
    // A reinvenção também é decisão principal (D89): abre o período sozinha.
    return startDrama({ ...career, decision: null, veteran: option.action as VeteranPath, veteranYear: decision.year }, notices, null, false);
  }
  if (!decision || !period) return career;
  let next: Career = { ...career, decision: null, drama: { ...period, decisions: period.decisions + 1 } };
  if (decision.kind === "veteran") next = { ...next, veteran: option.action as VeteranPath, veteranYear: decision.year };
  if (decision.kind === "promise") {
    const promise = decision.promises?.find((item) => item.level === option.action);
    if (promise) next = { ...next, promise, promiseYears: [...(next.promiseYears ?? []), promise.year] };
  }
  if (decision.match) {
    const result = resolveKeyMatch(career, decision.match, option);
    const drama = next.drama ?? period;
    // Eliminado numa fase, as fases seguintes da mesma copa viram outro jogo do
    // ano (liga, copa ou seleção ainda vivos), para o ano manter as decisões (D89).
    const eliminated = !result.won && result.match.stage !== "league";
    const rest = period.queue.slice(1);
    const kept = rest.filter((item) => !eliminated || item.competition !== result.match.competition);
    const used = new Set([...rest, ...period.results.map((item) => item.match), decision.match].map((item) => item.competition));
    // A troca respeita a ordem do ano: nunca um jogo que viria antes do que acabou de acontecer.
    const spare = (period.reserve ?? []).filter((item) => !used.has(item.competition) && matchOrder(item) >= matchOrder(decision.match!));
    const swaps = spare.slice(0, rest.length - kept.length);
    const queue = swaps.length ? sortMatches([...kept, ...swaps]) : kept;
    next = { ...next, drama: { ...drama, queue, reserve: (period.reserve ?? []).filter((item) => !swaps.includes(item)), results: [...period.results, result] } };
    notices.push({ kind: "matchOutcome", result });
  }
  return continueDrama(next, notices);
}

/**
 * Recompensas do lance (D89). Vencer sem jogar o lance (apoio atrás, deixar o
 * companheiro cobrar) vale só o resultado do time. A ação que você jogou, deu
 * certo e decidiu a vitória vale mais: torcida extra pela fase, legado extra na
 * final e um reconhecimento na evolução da temporada.
 */
export const MATCH_REWARD = {
  stageFans: { league: 0, quarter: 1, semi: 1, final: 2 },
  finalLegacy: 1,
  recognition: 1,
  /** Com o apoio atrás bem feito, o time ainda precisa marcar sozinho. */
  teamResolves: 0.42,
  /** Erro com o placar empatado na liga: às vezes o adversário também não marca. */
  heldDraw: 0.12,
} as const;

/**
 * Quanto a torcida cobra de um lance errado (D90): de 1 a 10, pelo peso da
 * competição e pela fase. `2 × importância do título + fase` (semi +1, final +3),
 * arredondado. Liga da segunda divisão custa 1, a final da Copa do Mundo, 10.
 * Lenda do clube perde metade a partir de -2 (arredondando para cima).
 */
export const MATCH_FAN_LOSS = { importance: 2, stage: { league: 0, quarter: 0, semi: 1, final: 3 }, min: 1, max: 10, keeperSave: 1 } as const;

export function matchFanLoss(career: Career, match: KeyMatch): number {
  const kind = getCompetition(match.competition)?.kind;
  const confederation = match.national ? undefined : CLUB_CONFEDERATION[clubIndex(match.team)];
  const importance = kind ? titleImportance(kind, confederation) : 1;
  // Ninguém cobra do goleiro defender pênalti como cobra do batedor: um a menos (D91).
  const relief = isKeeperSave(career.player.position, match.scene) ? MATCH_FAN_LOSS.keeperSave : 0;
  const loss = clamp(Math.round(MATCH_FAN_LOSS.importance * importance + MATCH_FAN_LOSS.stage[match.stage]), MATCH_FAN_LOSS.min, MATCH_FAN_LOSS.max) - relief;
  const legend = career.contract ? bondLegacy(career, career.contract.club) === "legend" : false;
  return legend && loss >= 2 ? Math.ceil(loss / 2) : loss;
}

/** Resolve somente o lance; o laboratório usa a mesma regra sem avançar a carreira. */
export function resolveKeyMatch(career: Career, match: KeyMatch, option: Extract<DecisionOption, { kind: "drama" }>): KeyMatchResult {
    const rng = outcomeStream(career, career.decision?.id ?? 0, "drama", "outcome", career.world.year, match.competition, match.stage, option.action);
    // O goleiro defende quando acerta o canto já escolhido pelo cobrador (D91).
    const keeperSave = isKeeperSave(career.player.position, match.scene);
    const pressure = match.stage === "final" ? titleKeepChance(recordTally(career.history), match.competition) : 1;
    const success = keeperSave
      ? rng.chance(option.action === penaltySide(career, match) ? pressure : keeperSaveChance(career) > KEEPER_SAVE.guess ? KEEPER_SAVE.specialistReach * pressure : 0)
      : rng.chance(option.chance ?? 0);
    const safe = option.action === "safe";
    const active = !safe && option.action !== "leave";
    const decisive = match.scene === "decisivePenalty";
    const shootout = isShootout(match.scene);
    const chasing = match.stage === "league" && match.score[0] < match.score[1];
    // Lance que não deu certo nunca vence (D89): na liga segura no máximo o
    // empate; no mata-mata elimina. A ação segura que deu certo ainda depende
    // de o time marcar.
    const resolved = success && (!safe || chasing || rng.chance(MATCH_REWARD.teamResolves * (match.stage === "final" ? titleKeepChance(recordTally(career.history), match.competition) : 1)));
    const actionKind = matchActionKind(career.player.position, match, option.action);
    const goals = success && actionKind === "shot" && !shootout ? 1 : 0;
    const assists = success && actionKind === "pass" ? 1 : 0;
    const [home, away] = match.score;
    const heldDraw = !success && match.stage === "league" && home === away
      && stream(career.setup.seed, "drama", "heldDraw", career.world.year, match.competition, option.action).chance(MATCH_REWARD.heldDraw);
    // Quem segurou o lance mantém o placar; quem errou sofre o gol (no mata-mata, sempre).
    const score: readonly [number, number] = shootout || (success && !resolved) || heldDraw ? match.score
      : resolved ? [home + 1, away]
      : [home, away + Number(home === away || rng.chance(0.3))];
    const tiedKnockout = match.stage !== "league" && score[0] === score[1];
    const won = tiedKnockout ? success && (shootout || rng.chance(0.5)) : score[0] > score[1];
    const hero = active && success && won;
    // Errar custa torcida pela competição e pela fase; só o pênalti deixado ao companheiro não cobra (D90).
    const baseFans = !success ? option.action === "leave" ? 0 : 0 - matchFanLoss(career, match)
      : decisive ? option.action === "take" ? 8 : 0 : safe ? 0 : option.action === "team" ? 2 : 3;
    const baseLegacy = success && active && !decisive ? option.action === "team" ? 1 : 2 : 0;
    return {
      match, action: option.action, success, won, score,
      penalties: !tiedKnockout ? null : match.kick ? won ? [match.kick, match.kick - 1] : [match.kick - 1, match.kick] : won ? [5, 4] : [4, 5],
      goals, assists,
      fans: baseFans + (hero ? MATCH_REWARD.stageFans[match.stage] : 0),
      legacy: baseLegacy + (hero && match.stage === "final" ? MATCH_REWARD.finalLegacy : 0),
      recognition: hero ? MATCH_REWARD.recognition : 0,
    };
}

export function promiseReport(career: Career, stats: PlayerSeasonStats): PromiseReport | undefined {
  const promise = career.promise;
  if (!promise || (promise.throughYear ?? promise.year) !== stats.year) return undefined;
  const glory = stats.competitions.some((entry) => entry.kind === "continental1" && stats.titles.includes(entry.competition)) || stats.awards.won.some((id) => id === "ballonDor") || stats.awards.crowns.some((crown) => crown.award === "topScorer");
  const value = (season: Pick<PlayerSeasonStats, "games" | "production">) => promise.metric === "games" ? season.games : promise.metric === "cleanSheets" ? season.production.cleanSheets : season.production.goals + season.production.assists;
  const previous = career.history.filter((season) => season.year >= promise.year && season.year < stats.year);
  const actual = promise.metric === "glory" ? Number(glory) : previous.reduce((sum, season) => sum + value(season), value(stats));
  const fulfilled = actual >= promise.target;
  const stakes = promise.level === "humble" ? [2, 0, 0.1, 0] : promise.level === "protagonist" ? [5, 3, 0.3, -3] : [9, 8, 0.5, -7];
  return { ...promise, actual, fulfilled, fans: fulfilled ? stakes[0] ?? 0 : stakes[3] ?? 0, legacy: fulfilled ? stakes[1] ?? 0 : 0, capacity: fulfilled ? stakes[2] ?? 0 : 0 };
}
