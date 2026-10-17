import { cupObjectiveScore } from "./objectives";
import { type CountryCode, type Division, getLeague, LEAGUES, leagueAt } from "@craque/world";
import { clamp } from "../math";
import { seasonMemory, sortTable, toSeasonMemory } from "./competitions";
import { continentalEntrants } from "../world/season";
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
import { EVALUATION, FINANCE, INITIAL_OFFERS, LIVE_RELATIONS, MONTHS_PER_SEASON, OFFERS, REPUTATION } from "./tuning";
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

export function objectiveFor(career: Pick<CoachCareer, "clubs"> & Partial<Pick<CoachCareer, "history" | "year">>, clubId: string): Objective {
  const club = career.clubs[clubId];
  const league = leagueOf(career, clubId);
  if (!club || !league) return { kind: "mid", target: 10, expected: 10, tableSize: 20 };
  const members = Object.values(career.clubs).filter((other) => other.country === club.country && other.division === club.division);
  const n = members.length;
  const ranked = [...members].sort((a, b) => expectationScore(b) - expectationScore(a) || a.id.localeCompare(b.id));
  const baseline = ranked.findIndex((other) => other.id === clubId) + 1;
  const recent = (career.history ?? []).filter((season) => season.club === clubId && !season.partial && season.division === club.division && season.year >= (career.year ?? Infinity) - 3).slice(-3);
  // Um campeão recém-formado deixou de ser só um candidato à sobrevivência.
  // O histórico puxa a cobrança aos poucos e perde peso depois de três anos.
  const best = recent.reduce((position, season) => Math.min(position, season.position ?? n), n);
  let expected = recent.length ? Math.min(baseline, Math.max(1, Math.round(baseline * 0.6 + best * 0.4))) : baseline;
  const last = recent.at(-1), leagueTitles = recent.filter((season) => season.titles.some((id) => id.startsWith("league:"))).length;
  if (last?.titles.some((id) => id.startsWith("league:") || id.startsWith("cont1:"))) expected = Math.min(expected, leagueTitles >= 2 ? 2 : Math.max(4, Math.ceil(n / 4)));
  else if (last?.titles.some((id) => id.startsWith("cont2:") || id.startsWith("cup:"))) expected = Math.min(expected, Math.ceil(n / 2));
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
  const limit = club.revenue * FINANCE.wageCap / 12;
  if (wageBill >= limit * 0.9) return "tight";
  if (wageBill <= limit * 0.7) return "healthy";
  return "balanced";
}

/** Verba de contratações no começo da temporada: parte da receita mais um pouco da sobra de caixa. */
export function seasonBudget(club: CoachClub, leftover: number): number {
  const base=FINANCE.budgetShare * club.revenue;
  const recent=Math.max(0,club.previousInvestment ?? 0);
  const rule=FINANCE.investmentCut;
  // Um clube pequeno precisa renovar o elenco básico. O corte maior é de
  // quem já dispõe de receita para disputar as contratações mais caras.
  const wealth=clamp((club.revenue-rule.fromRevenue)/(rule.toRevenue-rule.fromRevenue),0,1);
  const maxCut=rule.min+(rule.max-rule.min)*wealth;
  const investmentCut=1-Math.min(maxCut,recent/Math.max(1,base)*rule.scale);
  const allocated=base*investmentCut+FINANCE.budgetFromLeftover*Math.max(0,leftover);
  // A sobra já é dinheiro reservado, não uma nova receita. Continua sujeita
  // ao caixa disponível, para não permitir gastar a mesma economia duas vezes.
  return Math.max(0,Math.min(allocated,club.cash+club.revenue*0.15));
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
    club.cash += revenue * (1-FINANCE.operatingShare) - paid;
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

/** Cobrança do mandato atual. Vice e supercopas não substituem grandes conquistas. */
export function titleAmbition(career: CoachCareer): { weight: number; debt: number; penalty: number } {
  const coach = career.coach, club = coach && career.clubs[coach.club], rules = EVALUATION.ambition;
  if (!coach || !club || club.division !== 1) return { weight: 0, debt: 0, penalty: 0 };
  const titleCandidate = coach.objective.kind === "title";
  const challenger = club.strength >= rules.strength && club.prestige >= rules.prestige && coach.objective.expected <= Math.ceil(coach.objective.tableSize * rules.topShare);
  const weight = titleCandidate ? 1 : challenger ? rules.challengerWeight : 0;
  if (!weight) return { weight, debt: 0, penalty: 0 };
  const tenure: SeasonHistory[] = [];
  for (let i = career.history.length - 1; i >= 0; i--) {
    const season = career.history[i]!;
    if (season.club !== club.id || season.partial || season.division !== 1) break;
    if (season.year < career.year) tenure.unshift(season);
  }
  let debt = 0;
  for (const titles of [...tenure.map(season => season.titles), titlesOf(career, club.id)]) {
    const major = titles.some(id => id.startsWith("league:") || id.startsWith("cont1:") || id === "clubworldcup");
    const cup = titles.some(id => id.startsWith("cup:") || id.startsWith("cont2:"));
    debt = major ? 0 : debt + (cup ? 1 - rules.cupRelief : 1);
  }
  const penalty = debt ? weight * Math.min(rules.maxPenalty, rules.firstYear + rules.perYear * Math.max(0, debt - rules.grace)) : 0;
  return { weight, debt, penalty };
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
  const cups = Math.min(1.5, cupScore(career, coach.club)) * EVALUATION.cupWeight + cupObjectiveScore(career);
  let finances = 0;
  if (club) {
    const wages = wageBillOf(career, coach.club);
    const status = financeLabel(club, wages);
    finances = status === "healthy" ? EVALUATION.financeBonus : wages * 12 > club.revenue * FINANCE.wageCap ? EVALUATION.financePenalty : 0;
  }
  const seasonPromises = career.promises.filter((promise) => promise.madeAt >= career.seasonIndex * 365);
  const promiseTerm = clamp(
    seasonPromises.reduce((total, promise) => total + (promise.status === "kept" ? 1 : promise.status === "broken" ? -1 : 0) * EVALUATION.promiseWeight, 0),
    -EVALUATION.promiseCap,
    EVALUATION.promiseCap,
  );
  const fansTerm = (coach.fans - 50) / 100;
  const ambition = titleAmbition(career);
  const score = objectiveTerm + cups + finances + promiseTerm + fansTerm - ambition.penalty;
  const creditBefore = coach.credit;
  const [low, high] = EVALUATION.creditRange;
  const creditAfter = clamp(EVALUATION.creditMemory * creditBefore + (1 - EVALUATION.creditMemory) * score, low, high);
  const confidence = clamp(Math.round(EVALUATION.confidenceBase + EVALUATION.seasonWeight * score + EVALUATION.creditWeight * creditAfter), 0, 100);
  const dismissed = (!met && confidence < EVALUATION.dismissBelow) || (ambition.weight > 0 && confidence < EVALUATION.ambition.dismissBelow);
  const terms: Array<[SeasonReview["reason"], number]> = [
    ["objective", objectiveTerm],
    ["cups", cups],
    ["finances", finances],
    ["promises", promiseTerm],
    ["fans", fansTerm],
    ["ambition", -ambition.penalty],
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
    ambition,
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
  if (review.position !== null && review.position < (coach?.objective.expected ?? 0) && club && club.strength < 78) delta += Math.min(2, ((coach?.objective.expected ?? 0) - review.position) / 5);
  return clamp(delta > 0 ? delta * 1.1 : delta, -REPUTATION.maxChange, REPUTATION.maxChange * 1.1);
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
  const nextMemory = career.history.some((season) => season.year === career.year)
    ? seasonMemory(career.year, career.competitions, career.memory,career.fixtures) : career.memory;
  const international = continentalEntrants(toSeasonMemory(nextMemory),(id)=>career.clubs[id]?.division===1,career.setup.seed);
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
    internationals: Object.entries(international).filter(([, entrants]) => entrants.includes(clubId)).map(([id]) => id),
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
  const ranked = Object.values(career.clubs).filter(club=>!club.continentalGuest).sort((a, b) => a.strength - b.strength || a.id.localeCompare(b.id));
  const percentile = new Map(ranked.map((club, index) => [club.id, index / Math.max(1, ranked.length - 1)]));
  const bestWork = career.history.reduce((best, season) => Math.max(best, season.objectiveMet ? (percentile.get(season.club) ?? 0) : 0), 0);
  const current = coach ? (percentile.get(coach.club) ?? 0.3) : 0.3;
  const last = career.history.at(-1);
  const firstTitle = Boolean(last && last.division === 1 && last.titles.some((id) => id.startsWith("league:")));
  const continentalTitle = Boolean(last?.titles.some((id) => id.startsWith("cont1:")));
  const topFlightBreakthrough = !dismissed && last?.division === 1 && last.position !== null && last.position !== undefined && last.position <= Math.max(2, Math.floor(last.tableSize / 5));
  const achievementFloor = firstTitle || continentalTitle ? Math.min(0.96, current + 0.1) : topFlightBreakthrough ? Math.max(0.68, current + 0.06) : 0;
  const target = clamp(
    Math.max(achievementFloor, OFFERS.percentileBase + OFFERS.percentilePerReputation * reputation + Math.max(0, bestWork - current) * 0.2) - (dismissed ? OFFERS.dismissedDrop : 0),
    0.05,
    0.98,
  );
  const [minCount, maxCount] = dismissed ? OFFERS.dismissed : OFFERS.kept;
  const count = rng.int(minCount, maxCount);
  const homes = new Set([coach ? career.clubs[coach.club]?.country : undefined, career.setup.identity.nationality].filter(Boolean));
  const banned = (club: string) => (career.bans[club] ?? -1) >= career.seasonIndex;
  const currentCountry = coach ? career.clubs[coach.club]?.country : career.setup.identity.nationality;
  const candidates = Object.values(career.clubs).filter((club) => !club.continentalGuest && club.id !== coach?.club && !banned(club.id)
    && (!(firstTitle || continentalTitle) || club.country !== currentCountry || (club.division === 1 && club.strength >= (career.clubs[coach?.club ?? ""]?.strength ?? 0))));
  const weightOf = (club: CoachClub) => {
    const distance = Math.abs((percentile.get(club.id) ?? 0) - target);
    const closeness = Math.max(0, OFFERS.percentileSpread - distance);
    if (closeness <= 0) return 0;
    const abroad = !homes.has(club.country);
    const countryWeight = abroad ? (reputation >= OFFERS.abroadFromReputation ? OFFERS.abroadChance : OFFERS.abroadLowReputation) : 1;
    return closeness * countryWeight;
  };
  const picked = new Set<string>();
  const domestic = candidates.filter((club) => club.country === currentCountry && (!topFlightBreakthrough || club.division === 1) && (!(firstTitle || continentalTitle) || (club.division === 1 && club.strength >= (career.clubs[coach?.club ?? ""]?.strength ?? 0))))
    .sort((a, b) => Math.abs((percentile.get(a.id) ?? 0) - target) - Math.abs((percentile.get(b.id) ?? 0) - target) || a.id.localeCompare(b.id)).slice(0, 3);
  if (domestic.length) picked.add(rng.pick(domestic).id);
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
  const record = { won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
  for (const fixture of career.fixtures) {
    if (!fixture.result?.coach || (fixture.home !== coach.club && fixture.away !== coach.club)) continue;
    const own = fixture.home === coach.club ? fixture.result.home : fixture.result.away;
    const other = fixture.home === coach.club ? fixture.result.away : fixture.result.home;
    record.goalsFor += own; record.goalsAgainst += other;
    if (own > other) record.won += 1; else if (own === other) record.drawn += 1; else record.lost += 1;
  }
  return {
    invincible: !partial && played?.champion===coach.club && (played.table?.find(row=>row.club===coach.club)?.lost ?? 1)===0,
    year: career.year,
    club: coach.club,
    formation: coach.tactics.formation,
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
    record,
    awards: [...career.seasonAwards],
  };
}

export function leagueName(id: string): string {
  return getLeague(id)?.name ?? id;
}

/** Cada partida altera as relações em relação à expectativa do clube, sem novo sorteio. */
export function applyMatchRelations(career: CoachCareer, own: number, other: number, derby: boolean): void {
  const coach = career.coach;
  if (!coach) return;
  const rules = LIVE_RELATIONS;
  const expectation = rules.expectationBase - rules.expectationRank * coach.objective.expected / Math.max(1, coach.objective.tableSize);
  const performance = (own > other ? 1 : own === other ? rules.drawScore : 0) - expectation;
  for (const bar of ["board", "fans"] as const) {
    const before = coach[bar];
    const step = bar === "board" ? rules.boardStep : rules.fansStep;
    const extra = bar === "fans" && derby ? (own > other ? rules.derby : own < other ? -rules.derby : 0) : 0;
    coach[bar] = clamp(before + performance * step + extra, 0, 100);
    const delta = Math.round((coach[bar] - before) * 100) / 100;
    if (delta !== 0) career.ledger.relations.push({ bar, delta, reason: performance >= 0 ? "resultsAbove" : "resultsBelow" });
  }
}

/** O primeiro turno só permite demissão com campanha realmente desastrosa. */
export function shouldDismissMidseason(career: CoachCareer): boolean {
  const coach = career.coach;
  if (!coach || career.setup.mode !== "slow" || career.half !== 0) return false;
  const row = leagueState(career, coach.club)?.table?.find((item) => item.club === coach.club);
  const position = leaguePosition(career, coach.club);
  if (!row || position === null) return false;
  const rules = LIVE_RELATIONS;
  return row.played >= rules.minGames && row.points / row.played <= rules.pointsPerGame
    && position - coach.objective.expected >= Math.max(rules.minRankGap, Math.ceil(coach.objective.tableSize * rules.rankGapShare))
    && coach.board < rules.maxConfidence;
}
