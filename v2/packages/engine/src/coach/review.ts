import { type CountryCode, type Division, getLeague, LEAGUES, leagueAt } from "@craque/world";
import { clamp } from "../math";
import { sortTable } from "./competitions";
import type {
  ClubOffer,
  CoachCareer,
  CoachClub,
  CompetitionState,
  Objective,
  ObjectiveKind,
  SeasonHistory,
  SeasonReview,
} from "./types";
import { EVALUATION, FINANCE, INITIAL_OFFERS, MONTHS_PER_SEASON, OFFERS, REPUTATION } from "./tuning";
import { coachRng } from "./util";
import { squadOf } from "./world";

/**
 * Objetivo, finanças, avaliação anual, reputação e propostas (spec 11, 12,
 * 14). A mesma colocação pode ser sucesso num clube e fracasso em outro: o
 * objetivo sai da força do elenco e do prestígio do clube dentro da liga.
 */

// -------------------------------------------------------------- objetivo

export function leagueOf(career: Pick<CoachCareer, "clubs">, clubId: string) {
  const club = career.clubs[clubId];
  if (!club) return null;
  return LEAGUES.find((league) => league.country === club.country && league.division === club.division) ?? null;
}

function hasSecondDivision(country: CountryCode): boolean {
  return Boolean(leagueAt(country, 2));
}

/** Nota de expectativa: força do elenco com um peso do prestígio (o grande em crise ainda é cobrado). */
function expectationScore(club: CoachClub): number {
  return club.strength + 1.2 * (club.prestige - 3);
}

export function objectiveFor(career: Pick<CoachCareer, "clubs">, clubId: string): Objective {
  const club = career.clubs[clubId];
  const league = leagueOf(career, clubId);
  if (!club || !league) return { kind: "mid", target: 10, expected: 10, tableSize: 20 };
  const members = Object.values(career.clubs).filter((other) => other.country === club.country && other.division === club.division);
  const n = members.length;
  const ranked = [...members].sort((a, b) => expectationScore(b) - expectationScore(a) || a.id.localeCompare(b.id));
  const expected = ranked.findIndex((other) => other.id === clubId) + 1;
  const slots = league.promotionSlots;
  if (club.division === 2) {
    if (expected <= slots) return { kind: "promotion", target: slots, expected, tableSize: n };
    if (expected <= slots * 2 + 2) return { kind: "top", target: slots * 2 + 2, expected, tableSize: n };
    if (expected <= n - 3) return { kind: "mid", target: Math.ceil(n / 2), expected, tableSize: n };
    return { kind: "bottom", target: n - 2, expected, tableSize: n };
  }
  const relegation = hasSecondDivision(club.country) ? (leagueAt(club.country, 1)?.promotionSlots ?? 0) : 0;
  if (expected <= 2) return { kind: "title", target: 2, expected, tableSize: n };
  if (expected <= Math.ceil(n / 4)) return { kind: "top", target: Math.max(4, Math.ceil(n / 4)), expected, tableSize: n };
  if (expected <= Math.ceil(n * 0.6) || relegation === 0) {
    return relegation === 0 && expected > Math.ceil(n * 0.6)
      ? { kind: "bottom", target: n - 3, expected, tableSize: n }
      : { kind: "mid", target: Math.ceil(n / 2), expected, tableSize: n };
  }
  return { kind: "survive", target: n - relegation, expected, tableSize: n };
}

export function leagueState(career: Pick<CoachCareer, "competitions">, clubId: string): CompetitionState | null {
  return Object.values(career.competitions).find((state) => state.kind === "league" && state.entrants.includes(clubId)) ?? null;
}

export function leaguePosition(career: Pick<CoachCareer, "competitions" | "clubs">, clubId: string): number | null {
  const state = leagueState(career, clubId);
  if (!state?.table) return null;
  const sorted = sortTable(state.table, (club) => career.clubs[club]?.strength ?? 0);
  const index = sorted.findIndex((row) => row.club === clubId);
  return index < 0 ? null : index + 1;
}

// -------------------------------------------------------------- finanças

export function wageBillOf(career: CoachCareer, clubId: string): number {
  return squadOf(career, clubId).reduce((total, player) => total + player.wage, 0);
}

export function financeLabel(club: CoachClub, wageBill: number): ClubOffer["finances"] {
  if (club.cash < 0 || wageBill * 12 >= club.revenue * 0.65) return "tight";
  if (club.cash >= club.revenue * 0.15 && wageBill * 12 <= club.revenue * 0.5) return "healthy";
  return "balanced";
}

/** Verba de contratações no começo da temporada: parte da receita mais um pouco da sobra de caixa. */
export function seasonBudget(club: CoachClub, leftover: number): number {
  return Math.max(0, FINANCE.budgetShare * club.revenue + 0.3 * Math.max(0, club.cash - 0.2 * club.revenue) + 0.5 * leftover);
}

/** Receitas e salários de um período, para todos os clubes; o do treinador vai para o diário. */
export function applyPeriodFinances(career: CoachCareer, fraction: number): void {
  const wages = new Map<string, number>();
  for (const player of Object.values(career.players)) {
    if (!player.club) continue;
    wages.set(player.club, (wages.get(player.club) ?? 0) + player.wage);
  }
  for (const club of Object.values(career.clubs)) {
    const revenue = club.revenue * fraction;
    const paid = (wages.get(club.id) ?? 0) * MONTHS_PER_SEASON * fraction;
    club.cash += revenue - paid;
    if (club.id === career.coach?.club) {
      career.ledger.revenue += revenue;
      career.ledger.wages += paid;
    }
  }
}

const STAGE_VALUE: Readonly<Record<string, number>> = { champion: 1, F: 0.6, FF: 0.6, SF: 0.4, QF: 0.25, R16: 0.12, G: 0.05 };
const KIND_WEIGHT: Readonly<Record<string, number>> = {
  cont1: 1.5,
  cont2: 1,
  cont3: 0.7,
  cup: 0.8,
  leaguecup: 0.4,
  super: 0.25,
  contsuper: 0.3,
  intercontinental: 0.8,
  clubworldcup: 1.5,
};

/** Premiação de fim de temporada (liga, títulos, acesso, queda) para todos os clubes. */
export function seasonPrizes(career: CoachCareer, promoted: ReadonlySet<string>, relegated: ReadonlySet<string>): void {
  for (const state of Object.values(career.competitions)) {
    if (state.kind === "league" && state.table) {
      const n = state.table.length;
      state.table.forEach((row, index) => {
        const club = career.clubs[row.club];
        if (!club) return;
        const prize = club.revenue * (FINANCE.prize.perPositionAbove * (n - index - 1) + (index === 0 ? FINANCE.prize.leagueTitle : 0));
        club.cash += prize;
        if (club.id === career.coach?.club) career.ledger.prizes += prize;
      });
    } else if (state.champion) {
      const club = career.clubs[state.champion];
      if (!club) continue;
      const share = state.kind.startsWith("cont") || state.kind === "clubworldcup" ? FINANCE.prize.continentalTitle : FINANCE.prize.cupTitle;
      const prize = club.revenue * share;
      club.cash += prize;
      if (club.id === career.coach?.club) career.ledger.prizes += prize;
    }
  }
  for (const id of promoted) {
    const club = career.clubs[id];
    if (club) club.cash += club.revenue * FINANCE.prize.promotion;
  }
  for (const id of relegated) {
    const club = career.clubs[id];
    if (club) club.cash += club.revenue * FINANCE.prize.relegation * 0.25;
  }
}

// ------------------------------------------------------------- avaliação

export function cupScore(career: CoachCareer, clubId: string): number {
  let total = 0;
  for (const state of Object.values(career.competitions)) {
    if (state.kind === "league" || !state.entrants.includes(clubId)) continue;
    const reached = state.reached[clubId] ?? "";
    total += (KIND_WEIGHT[state.kind] ?? 0.3) * (STAGE_VALUE[reached] ?? 0);
  }
  return total;
}

export function titlesOf(career: CoachCareer, clubId: string): string[] {
  return Object.values(career.competitions)
    .filter((state) => state.champion === clubId)
    .map((state) => state.id);
}

/**
 * Avaliação anual (spec 14). Nota da temporada pela posição contra a
 * esperada, copas, finanças, promessas e torcida; o crédito acumulado guarda
 * memória decrescente das temporadas anteriores e decide a tolerância.
 */
export function evaluateSeason(
  career: CoachCareer,
  promoted: boolean,
  relegated: boolean,
): SeasonReview {
  const coach = career.coach;
  if (!coach) throw new Error("coach: avaliação sem clube");
  const club = career.clubs[coach.club];
  const objective = coach.objective;
  const position = leaguePosition(career, coach.club);
  const n = objective.tableSize;
  const met = position !== null && (objective.kind === "promotion" ? promoted : position <= objective.target);
  const objectiveTerm = position === null ? 0 : clamp((objective.expected - position) / Math.max(2, n / 5), -2, 2) + (met ? 0.3 : -0.3) + (promoted ? 0.8 : 0) + (relegated ? -1.2 : 0);
  const cups = Math.min(1.5, cupScore(career, coach.club)) * EVALUATION.cupWeight;
  let finances = 0;
  if (club) {
    if (club.cash < -FINANCE.debtLimit * club.revenue) finances = -1;
    else if (club.cash < 0) finances = EVALUATION.financePenalty;
    else if (career.ledger.revenue + career.ledger.prizes + career.ledger.transfersIn - career.ledger.wages - career.ledger.transfersOut > 0) finances = EVALUATION.financeBonus;
    if (wageBillOf(career, coach.club) * 12 > club.revenue * FINANCE.wageCap) finances -= 0.3;
  }
  const seasonPromises = career.promises.filter((promise) => promise.madeAt >= career.seasonIndex * 365);
  const promiseTerm = clamp(
    seasonPromises.reduce((total, promise) => total + (promise.status === "kept" ? 1 : promise.status === "broken" ? -1 : 0) * EVALUATION.promiseWeight, 0),
    -EVALUATION.promiseCap,
    EVALUATION.promiseCap,
  );
  const fansTerm = (coach.fans - 50) / 100;
  const score = objectiveTerm + cups + finances + promiseTerm + fansTerm;
  const creditBefore = coach.credit;
  const [low, high] = EVALUATION.creditRange;
  const creditAfter = clamp(EVALUATION.creditMemory * creditBefore + (1 - EVALUATION.creditMemory) * score, low, high);
  const confidence = clamp(Math.round(EVALUATION.confidenceBase + EVALUATION.seasonWeight * score + EVALUATION.creditWeight * creditAfter), 0, 100);
  const dismissed = confidence < EVALUATION.dismissBelow;
  const terms: Array<[SeasonReview["reason"], number]> = [
    ["objective", objectiveTerm],
    ["cups", cups],
    ["finances", finances],
    ["promises", promiseTerm],
    ["fans", fansTerm],
    ["history", EVALUATION.creditWeight / EVALUATION.seasonWeight * (creditAfter - score * (1 - EVALUATION.creditMemory))],
  ];
  const reason = terms.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0]?.[0] ?? "objective";
  let tolerance: SeasonReview["tolerance"] = "none";
  if (score >= 0.5) tolerance = "trusted";
  else if (score < 0 && !dismissed && creditBefore > 0.2) tolerance = "patience";
  else if (score < 0 && !dismissed) tolerance = "warned";
  return {
    score,
    confidence,
    creditBefore,
    creditAfter,
    dismissed,
    reason,
    tolerance,
    reputationBefore: career.reputation,
    reputationAfter: career.reputation,
    objectiveMet: met,
    position,
  };
}

/**
 * Reputação (spec 14): um número só. Sobe ou cai pelo trabalho em relação ao
 * esperado, pesado pelo tamanho do clube; títulos, acessos, livrar da queda e
 * revelar jogadores somam. Trabalho excelente em clube fraco sobe sem título.
 */
export function reputationChange(career: CoachCareer, review: SeasonReview, titles: readonly string[], promoted: boolean, rescue: boolean, revelations: number): number {
  const coach = career.coach;
  const club = coach ? career.clubs[coach.club] : null;
  const level = club ? clamp(0.6 + (club.strength - 60) / 40, 0.6, 1.4) : 1;
  let delta = REPUTATION.perScore * clamp(review.score, -2, 2);
  for (const title of titles) {
    const major = title.startsWith("league:") || title.startsWith("cont1") || title === "clubworldcup" || title === "intercontinental";
    delta += major ? REPUTATION.title : REPUTATION.minorTitle;
  }
  if (promoted) delta += REPUTATION.promotion;
  if (rescue) delta += REPUTATION.rescue;
  delta += REPUTATION.revelation * Math.min(3, revelations);
  if (delta > 0) delta *= level;
  return clamp(delta, -REPUTATION.maxChange, REPUTATION.maxChange);
}

// -------------------------------------------------------------- propostas

function offerFor(career: CoachCareer, clubId: string, stay: boolean, index: number): ClubOffer {
  const club = career.clubs[clubId] as CoachClub;
  const objective = objectiveFor(career, clubId);
  const wageBill = wageBillOf(career, clubId);
  const finances = financeLabel(club, wageBill);
  const squad = squadOf(career, clubId);
  const fictionalShare = squad.length ? squad.filter((player) => player.origin === "g").length / squad.length : 0;
  const pressure: Record<ObjectiveKind, number> = { title: 1.6, promotion: 1.2, top: 0.9, mid: 0.4, survive: 1.1, bottom: 0.3 };
  const financePressure = finances === "tight" ? 1 : finances === "balanced" ? 0.4 : 0;
  const prestige = club.prestige >= 4 ? 1 : club.prestige >= 3 ? 0.5 : 0;
  const tightTarget = objective.target < objective.expected ? 0.6 : 0;
  const difficulty = clamp(Math.round(1 + pressure[objective.kind] + financePressure + prestige + tightTarget), 1, 5);
  return {
    id: `${career.year}:${index}:${clubId}`,
    club: clubId,
    division: club.division,
    strength: Math.round(club.strength * 10) / 10,
    objective,
    budget: seasonBudget(club, 0),
    cash: club.cash,
    wageBill,
    revenue: club.revenue,
    difficulty,
    finances,
    fictionalShare,
    stay,
  };
}

/**
 * As três propostas iniciais (spec 4): cada uma com sorteio independente, 95%
 * da segunda divisão do país do treinador e 5% da primeira, sem repetir clube.
 */
export function initialOffers(career: CoachCareer): ClubOffer[] {
  const country = career.setup.identity.nationality;
  const chosen: string[] = [];
  for (let draw = 0; draw < INITIAL_OFFERS.count; draw += 1) {
    const rng = coachRng(career.setup.seed, "initialOffer", draw);
    const division: Division = rng.chance(INITIAL_OFFERS.secondDivisionChance) ? 2 : 1;
    let pool = Object.values(career.clubs)
      .filter((club) => club.country === country && club.division === division && !chosen.includes(club.id))
      .map((club) => club.id)
      .sort();
    if (pool.length === 0) {
      pool = Object.values(career.clubs)
        .filter((club) => club.country === country && !chosen.includes(club.id))
        .map((club) => club.id)
        .sort();
    }
    if (pool.length === 0) break;
    chosen.push(rng.pick(pool));
  }
  return chosen.map((club, index) => offerFor(career, club, false, index));
}

/** Divisão sorteada de cada proposta inicial (para o teste estatístico do 95/5). */
export function initialOfferDivision(seed: string, draw: number): Division {
  return coachRng(seed, "initialOffer", draw).chance(INITIAL_OFFERS.secondDivisionChance) ? 2 : 1;
}

/**
 * Propostas depois de uma temporada (spec 14): continuidade quando o clube
 * quer manter; externas pela reputação e pelos trabalhos anteriores, também
 * de outros países. Depois de uma demissão, pelo menos duas, uma delas da
 * segunda divisão, sem garantia de clube melhor.
 */
export function seasonOffers(career: CoachCareer, dismissed: boolean): ClubOffer[] {
  const coach = career.coach;
  const rng = coachRng(career.setup.seed, "offers", career.year);
  const offers: ClubOffer[] = [];
  if (coach && !dismissed) offers.push(offerFor(career, coach.club, true, 0));
  const reputation = career.reputation;
  // Régua por percentil de força no mundo: a reputação diz em que faixa de
  // clubes o treinador é lembrado; trabalhos anteriores bem feitos puxam para
  // cima, a demissão puxa para baixo (sem garantia de clube melhor).
  const ranked = Object.values(career.clubs).sort((a, b) => a.strength - b.strength || a.id.localeCompare(b.id));
  const percentile = new Map(ranked.map((club, index) => [club.id, index / Math.max(1, ranked.length - 1)]));
  const bestWork = career.history.reduce((best, season) => Math.max(best, season.objectiveMet ? (percentile.get(season.club) ?? 0) : 0), 0);
  const current = coach ? (percentile.get(coach.club) ?? 0.3) : 0.3;
  const target = clamp(
    OFFERS.percentileBase + OFFERS.percentilePerReputation * reputation + Math.max(0, bestWork - current) * 0.2 - (dismissed ? OFFERS.dismissedDrop : 0),
    0.05,
    0.98,
  );
  const [minCount, maxCount] = dismissed ? OFFERS.dismissed : OFFERS.kept;
  let count = rng.int(minCount, maxCount);
  if (!dismissed && reputation < 25 && rng.chance(0.4)) count = Math.max(0, count - 1);
  const homes = new Set([coach ? career.clubs[coach.club]?.country : undefined, career.setup.identity.nationality].filter(Boolean));
  const banned = (club: string) => (career.bans[club] ?? -1) >= career.seasonIndex;
  const candidates = Object.values(career.clubs).filter((club) => club.id !== coach?.club && !banned(club.id));
  const weightOf = (club: CoachClub) => {
    const distance = Math.abs((percentile.get(club.id) ?? 0) - target);
    const closeness = Math.max(0, OFFERS.percentileSpread - distance);
    if (closeness <= 0) return 0;
    const abroad = !homes.has(club.country);
    const countryWeight = abroad ? (reputation >= OFFERS.abroadFromReputation ? OFFERS.abroadChance : OFFERS.abroadLowReputation) : 1;
    return closeness * countryWeight;
  };
  const picked = new Set<string>();
  if (dismissed) {
    // Uma garantia modesta: segunda divisão, de preferência no país de casa.
    const modest = candidates
      .filter((club) => club.division === 2)
      .map((club) => [club.id, (homes.has(club.country) ? 4 : 0.5) * Math.max(0.05, OFFERS.percentileSpread * 2 - Math.abs((percentile.get(club.id) ?? 0) - (target - 0.05)))] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (modest.length > 0) picked.add(rng.weighted(modest));
  }
  let guard = 0;
  while (picked.size < count && guard < 200) {
    guard += 1;
    const pool = candidates
      .filter((club) => !picked.has(club.id))
      .map((club) => [club.id, weightOf(club)] as const)
      .filter(([, weight]) => weight > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (pool.length === 0) break;
    picked.add(rng.weighted(pool));
  }
  // Nunca sem saída depois de uma demissão.
  if (dismissed && picked.size < 2) {
    const fallback = candidates
      .filter((club) => !picked.has(club.id))
      .sort((a, b) => Number(homes.has(b.country)) - Number(homes.has(a.country)) || Math.abs((percentile.get(a.id) ?? 0) - target) - Math.abs((percentile.get(b.id) ?? 0) - target) || a.id.localeCompare(b.id));
    for (const club of fallback) {
      if (picked.size >= 2) break;
      picked.add(club.id);
    }
  }
  [...picked].forEach((club, index) => offers.push(offerFor(career, club, false, index + 1)));
  return offers;
}

// --------------------------------------------------------------- histórico

export function historyEntry(career: CoachCareer, review: SeasonReview | null, partial: boolean, promoted: boolean, relegated: boolean, rescue: boolean): SeasonHistory {
  const coach = career.coach;
  if (!coach) throw new Error("coach: histórico sem clube");
  // A liga jogada vem da competição, não da divisão atual do clube: o acesso
  // e a queda já mudaram a divisão quando a temporada entra no histórico.
  const played = leagueState(career, coach.club);
  const league = played ? getLeague(played.id.replace(/^league:/, "")) : leagueOf(career, coach.club);
  const squad = squadOf(career, coach.club);
  const scorer = [...squad].sort((a, b) => b.season.goals - a.season.goals || b.ovr - a.ovr)[0];
  const best = [...squad].sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id))[0];
  return {
    year: career.year,
    club: coach.club,
    league: league?.id ?? "",
    division: league?.division ?? career.clubs[coach.club]?.division ?? 1,
    position: review?.position ?? leaguePosition(career, coach.club),
    tableSize: coach.objective.tableSize,
    objective: coach.objective,
    objectiveMet: review ? review.objectiveMet : null,
    titles: partial ? [] : titlesOf(career, coach.club),
    promoted,
    relegated,
    dismissed: review?.dismissed ?? false,
    partial,
    rescue,
    confidence: review?.confidence ?? coach.board,
    reputationAfter: career.reputation,
    topScorer: scorer && scorer.season.goals > 0 ? { player: scorer.id, goals: scorer.season.goals } : null,
    bestPlayer: best ? { player: best.id, ovr: best.ovr } : null,
  };
}

export function leagueName(id: string): string {
  return getLeague(id)?.name ?? id;
}
