import { titleKeepChance } from "../records/pressure";
import { getClub, getCompetition } from "@craque/world";
import { clamp } from "../math";
import { attributesAt, ovrAt } from "../player/player";
import { marketLeagueStrength } from "../player/value";
import { isDefender } from "../player/positions";
import { recordTally } from "../records/pressure";
import { stream } from "../rng";
import { simulatePlayerSeason, type SeasonModifiers, type PlayerSeasonStats } from "../season/playerSeason";
import { LAST_AGE, SEASONS_PER_PERIOD, type Six } from "../types";
import { nextDecision, transferOpportunityDue, windowDecision } from "./decisions";
import { simulatePeriod } from "./period";
import { matchActionKind, pickMatchScene, matchSkillWeights } from "./matchMoments";
import { squadRole } from "../season/role";
import { clubIndex } from "../world/model";
import { guaranteeFocus } from "../evolution/training";
import { VETERAN_PATHS, type KeyMatch, type KeyMatchResult, type PromiseReport, type SeasonPromise, type VeteranPath } from "./dramaTypes";
import type { Career, CareerNotice, Decision, DecisionOption, SeasonRecord } from "./types";

export function promiseOptions(career: Career): readonly SeasonPromise[] {
  const last = career.history.at(-1);
  const defensive = isDefender(career.player.position) || career.player.position === "gk";
  const production = defensive ? last?.production.cleanSheets ?? 3 : (last?.production.goals ?? 2) + (last?.production.assists ?? 1);
  const seasons = career.drama?.remaining ?? SEASONS_PER_PERIOD[career.setup.pace];
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
  return !career.veteran && career.age >= 33
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
  const weights = matchSkillWeights(career.player.position, match, action);
  const skill = weights.reduce((sum, weight, index) => sum + weight * (attributes[index] ?? 0), 0);
  const cap = matchChanceCeiling(career, match, action);
  const agePenalty = action === "team" && career.veteran === "maestro" ? 0 : Math.max(0, career.age - 31) * 0.006;
  const bonus = career.veteran === "maestro" && action === "team" ? 0.08
    : career.veteran === "poacher" && (!keeper || ["shootout", "penaltySave"].includes(match.scene)) && action !== "team" && action !== "safe" ? 0.1
    : career.veteran === "guardian" && (keeper || isDefender(career.player.position)) ? 0.07
    : career.veteran === "athlete" && (match.scene === "counter" || match.scene === "breakaway") ? 0.08
    : career.veteran === "captain" && match.stage !== "league" ? 0.04 : 0;
  // A nota da ação domina; OVR não pode transformar um passe ruim em passe de craque.
  const ovr = ovrAt(career.player, career.age);
  const level = match.national ? undefined : marketLeagueStrength(career.world, match.team);
  const leagueFactor = level === undefined ? 1 : clamp(1 + (ovr - level) * 0.004, 0.9, 1.1);
  const quality = clamp((0.95 * skill + 0.05 * ovr) / 99 * leagueFactor, 0, 1);
  const specialist = keeper && career.veteran === "poacher" && ["left", "right"].includes(action);
  const chance = specialist ? clamp(0.35 * quality - agePenalty, 0.05, 0.35) + 0.1 : cap * quality + bonus - agePenalty;
  return clamp(chance, Math.min(0.05, cap), cap) * (match.stage === "final" && action !== "safe" ? titleKeepChance(recordTally(career.history), match.competition) : 1);
}

/** O teto muda por aparição, mas fica estável ao reler ou refazer a mesma escolha. */
export function matchChanceCeiling(career: Career, match: KeyMatch, action: string): number {
  if (match.scene === "corner" && action === "bold") return 0.08;
  if (match.scene === "keeperCorner" && action !== "safe") return action === "bold" ? 0.18 : 0.4;
  if (match.scene === "bicycle" && action === "bold") return 0.35;
  if (action === "leave") return 0.5;
  if (["left", "right"].includes(action)) return career.player.position === "gk" ? career.veteran === "poacher" ? 0.45 : 0.35 : 0.7;
  const rng = stream(career.setup.seed, "drama", "chanceCeiling", career.world.year, match.competition, match.scene, action);
  return action === "team" ? rng.int(70, 80) / 100 : action === "safe" ? rng.int(70, 90) / 100 : 0.7;
}

function setDecision(career: Career, kind: Decision["kind"], actions: readonly string[], extras: Partial<Decision> = {}): Career {
  const id = career.decisionCount + 1;
  const options: DecisionOption[] = actions.map((action) => ({ id: `drama:${action}`, kind: "drama", action, chance: extras.match ? matchChance(career, extras.match, action) : null }));
  const index = (career.drama?.decisions ?? 0) + 1;
  const total = Math.max(index, (career.drama?.decisions ?? 0) + (career.drama?.queue.length ?? 0) + Number(veteranDue(career)) + Number(!career.promise && promiseDue(career)));
  return { ...career, decisionCount: id, decision: { id, kind, age: career.age, year: career.world.year, options, event: null, reason: null, progress: { index, total }, ...extras } };
}

function planMatches(career: Career): readonly KeyMatch[] {
  const contract = career.contract;
  if (!contract || career.pending.suspension >= 0.5 || (career.history.at(-1)?.games ?? 0) < 12) return [];
  const preview = simulatePlayerSeason({ seed: career.setup.seed, world: career.world, player: career.player, age: career.age, club: contract.club, nationality: career.nationality, difficulty: career.setup.difficulty, fans: career.bonds[contract.club]?.fans ?? 50, focus: null, modifiers: veteranModifiers(career.veteran, career.pending.modifiers), tally: recordTally(career.history) });
  if (preview.stats.games < 12 || !["rotation", "starter", "star"].includes(preview.stats.role)) return [];
  const rng = stream(career.setup.seed, "drama", "matches", career.world.year);
  const matches: KeyMatch[] = [];
  const recent = [...career.history.slice(-2).flatMap((season) => season.keyMatches ?? []), ...(career.drama?.results ?? [])].map((result) => result.match.scene);
  const used = new Set(recent);
  const add = (competition: string, team: string, opponents: readonly string[], national: boolean, stage: KeyMatch["stage"]) => {
    const others = opponents.filter((id) => id !== team);
    if (!others.length) return;
    const opponent = rng.pick(others);
    const scene = pickMatchScene(career.player.position, stage !== "league", used, rng);
    used.add(scene);
    const scoreRng = stream(career.setup.seed, "drama", "score", career.world.year, competition);
    const tied = scoreRng.weighted([[0, 2], [1, 5], [2, 2], [3, 1]]);
    const behind = scene === "keeperCorner" || (stage === "league" && scoreRng.chance(0.18));
    matches.push({ competition, team, opponent, national, stage, minute: scene === "shootout" ? 120 : scene === "keeperCorner" ? scoreRng.int(92, 95) : rng.int(76, 89), score: [tied, tied + Number(behind)], scene });
  };
  // Só partidas das fases realmente alcançadas no mundo sem a escolha.
  const knockouts = [...Object.values(preview.results.continental), ...Object.values(preview.results.cups), ...Object.values(preview.results.nations)];
  for (const result of knockouts) {
    const national = result.competition === "worldcup" || result.competition.startsWith("nations:");
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
  const limit = Math.min(career.setup.pace === "normal" ? 1 : 3, 5 - (career.drama?.decisions ?? 1));
  return rng.shuffle(matches).slice(0, Math.min(limit, rng.int(1, 3))).sort((a, b) => matchOrder(a) - matchOrder(b));
}

/** Finais continentais fecham os clubes; qualquer seleção vem depois. */
export function matchOrder(match: KeyMatch): number {
  if (match.national) return 3;
  if (match.stage === "final" && getCompetition(match.competition)?.kind.startsWith("continental")) return 2;
  return match.stage === "final" ? 1 : 0;
}

function promiseDue(career: Career): boolean {
  if (career.setup.pace === "normal" && career.drama?.startAge !== career.age) return false;
  if (!hasPublicRole(career)) return false;
  const years = career.promiseYears ?? [];
  if (!years.length) return career.age >= 18;
  return years.length < 3 && career.world.year - (years.at(-1) ?? 0) >= 5 && stream(career.setup.seed, "drama", "press", career.world.year).chance(0.04);
}

/** Abre apenas o próximo momento, sem simular nem avançar a idade. */
export function continueDrama(career: Career, notices: CareerNotice[]): Career {
  let next = career;
  const period = next.drama;
  if (!period) return nextDecision(next, notices);
  if (next.focus && next.focusAge === period.startAge) next = { ...next, player: guaranteeFocus(next.player, next.focus, period.startAttributes, next.age) };
  if (period.decisions === 0 && transferOpportunityDue(next)) return windowDecision(next, null, true);
  if (!period.prepared) {
    const reserved = period.decisions + Number(veteranDue(next)) + Number(!next.promise && promiseDue(next));
    next = { ...next, drama: { ...period, prepared: true, queue: planMatches({ ...next, drama: { ...period, decisions: reserved } }) } };
  }
  if (veteranDue(next) && period.decisions < 5) return setDecision(next, "veteran", VETERAN_PATHS);
  if (!next.promise && promiseDue(next) && period.decisions < 4) return setDecision(next, "promise", ["humble", "protagonist", "legend"], { promises: promiseOptions(next) });
  const match = next.drama?.queue[0];
  if (match) {
    const penalty = match.scene === "penalty" || match.scene === "shootout" || match.scene === "penaltySave";
    return setDecision(next, "match", match.scene === "decisivePenalty" ? ["take", "leave"] : penalty ? ["left", "right"] : ["bold", "team", "safe"], { match });
  }
  const ctx = next.drama ?? period;
  const last = ctx.remaining <= 1 || next.age >= LAST_AGE;
  next = simulatePeriod(next, notices, ctx.event, ctx.traitor, { length: 1, first: next.age === ctx.startAge, last, start: ctx.startAttributes, startAge: ctx.startAge });
  if (last || !next.contract) return nextDecision({ ...next, drama: undefined, promise: undefined }, notices);
  return continueDrama({ ...next, drama: { ...ctx, remaining: ctx.remaining - 1, event: null, traitor: false, prepared: false, queue: [], results: [], decisions: 0 } }, notices);
}

export function startDrama(career: Career, notices: CareerNotice[], event: SeasonRecord["event"], traitor: boolean, start?: Six, decisions = 1): Career {
  if (!career.contract) return nextDecision(career, notices);
  if (career.drama) return continueDrama({ ...career, drama: { ...career.drama, decisions: career.drama.decisions + decisions } }, notices);
  return continueDrama({ ...career, drama: { remaining: Math.min(SEASONS_PER_PERIOD[career.setup.pace], LAST_AGE - career.age + 1), startAge: career.age, startAttributes: start ?? attributesAt(career.player, career.age), event, traitor, prepared: false, queue: [], results: [], decisions } }, notices);
}

export function resolveDrama(career: Career, option: Extract<DecisionOption, { kind: "drama" }>, notices: CareerNotice[]): Career {
  const decision = career.decision;
  const period = career.drama;
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
    next = { ...next, drama: { ...drama, queue: period.queue.slice(1), results: [...period.results, result] } };
    notices.push({ kind: "matchOutcome", result });
  }
  return continueDrama(next, notices);
}

/** Resolve somente o lance; o laboratório usa a mesma regra sem avançar a carreira. */
export function resolveKeyMatch(career: Career, match: KeyMatch, option: Extract<DecisionOption, { kind: "drama" }>): KeyMatchResult {
    const rng = stream(career.setup.seed, "drama", "outcome", career.world.year, match.competition, option.action);
    const success = rng.chance(option.chance ?? 0);
    const safe = option.action === "safe";
    const decisive = match.scene === "decisivePenalty";
    const shootout = match.scene === "shootout";
    // A ação segura preserva a nota; o time ainda precisa resolver a partida.
    const chasing = match.stage === "league" && match.score[0] < match.score[1];
    const resolved = safe && !chasing ? rng.chance(0.42 * (match.stage === "final" ? titleKeepChance(recordTally(career.history), match.competition) : 1)) : success;
    const actionKind = matchActionKind(career.player.position, match, option.action);
    const goals = success && actionKind === "shot" && !shootout ? 1 : 0;
    const assists = success && actionKind === "pass" ? 1 : 0;
    const [home, away] = match.score;
    // Uma reação saindo atrás vale empate; o placar inicial nunca é descartado.
    const heldDraw = match.stage === "league" && home === away && !resolved
      && stream(career.setup.seed, "drama", "heldDraw", career.world.year, match.competition, option.action).chance(0.12);
    const score: readonly [number, number] = shootout ? match.score : resolved ? [home + 1, away] : heldDraw ? match.score : [home, away + Number(home === away || rng.chance(0.3))];
    const tiedKnockout = match.stage !== "league" && score[0] === score[1];
    const won = tiedKnockout ? shootout ? resolved : rng.chance(0.5) : score[0] > score[1];
    return { match, action: option.action, success, won, score, penalties: tiedKnockout ? won ? [5, 4] : [4, 5] : null, goals, assists, fans: decisive ? option.action === "take" ? success ? 8 : -6 : 0 : safe ? 0 : success ? option.action === "team" ? 2 : 3 : -2, legacy: success && !safe && !decisive ? option.action === "team" ? 1 : 2 : 0 };
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
