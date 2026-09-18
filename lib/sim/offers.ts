import { clamp, nextFloat, pickOne, pickWeighted, type Rng } from "./rng";
import {
  ALL_TEAMS,
  getLeagueOfTeam,
  getLeaguesOfCountry,
  LEAGUES,
  type Team,
} from "@/lib/data/dataset";
import { squadStatusAtTeam, type Player } from "./engine";

const ACADEMY_OFFER_COUNT = 3;
const FALLBACK_CONFEDERATION = "UEFA";

const teamsByInternationalReputation = new Map<number, Team[]>();
for (const team of ALL_TEAMS) {
  const list = teamsByInternationalReputation.get(team.international_reputation) ?? [];
  list.push(team);
  teamsByInternationalReputation.set(team.international_reputation, list);
}

function teamsWithReputation(reputation: number): Team[] {
  return teamsByInternationalReputation.get(reputation) ?? [];
}

function teamsOfConfederation(confederation: string): Team[] {
  return LEAGUES.filter((l) => l.confederation === confederation).flatMap((l) => l.teams);
}

function teamsOfCountry(fifaCode: string): Team[] {
  return getLeaguesOfCountry(fifaCode).flatMap((l) => l.teams);
}

/** The tier of club willing to talk to a player, derived from their overall. */
export function playerOfferReputation(overall: number): number {
  if (overall >= 87) return 5;
  if (overall >= 83) return 4;
  if (overall >= 78) return 3;
  if (overall >= 73) return 2;
  if (overall >= 65) return 1;
  return 0;
}

/** Nudges the target reputation up or down so offers aren't always the same tier. */
export function jitterReputation(rng: Rng, reputation: number): { rng: Rng; reputation: number } {
  const r = nextFloat(rng, 0, 1);
  if (reputation === 0) return { rng: r.rng, reputation: r.value < 0.8 ? 0 : 1 };
  if (reputation === 5) return { rng: r.rng, reputation: r.value < 0.8 ? 5 : 4 };
  if (r.value < 0.1) return { rng: r.rng, reputation: reputation + 1 };
  if (r.value < 0.9) return { rng: r.rng, reputation };
  return { rng: r.rng, reputation: reputation - 1 };
}

interface AffinityWeights {
  countryClub: number;
  countryPlayer: number;
  confederationClub: number;
  confederationPlayer: number;
  random: number;
}

const NO_AFFINITY: AffinityWeights = {
  countryClub: 0, countryPlayer: 0, confederationClub: 0, confederationPlayer: 0, random: 0,
};

/** Elite players attract offers globally; lesser ones stay closer to home. */
function affinityWeights(overall: number): AffinityWeights {
  if (overall >= 83) return { ...NO_AFFINITY, random: 100 };
  if (overall >= 78) return { ...NO_AFFINITY, confederationClub: 25, confederationPlayer: 25, random: 50 };
  if (overall >= 73) return { ...NO_AFFINITY, confederationClub: 50, confederationPlayer: 50 };
  if (overall >= 50) return { ...NO_AFFINITY, countryClub: 50, countryPlayer: 50 };
  return NO_AFFINITY;
}

function teamContext(team: Team): { countryFifaCode: string | null; confederation: string | null } {
  const league = getLeagueOfTeam(team.id);
  return {
    countryFifaCode: league?.country_fifa_code ?? null,
    confederation: league?.confederation ?? null,
  };
}

function offerWeight(
  candidate: Team,
  currentContext: { countryFifaCode: string | null; confederation: string | null },
  player: Player,
  weights: AffinityWeights,
): number {
  const ctx = teamContext(candidate);
  let weight = weights.random;
  if (weights.countryClub > 0 && currentContext.countryFifaCode && ctx.countryFifaCode === currentContext.countryFifaCode) {
    weight += weights.countryClub;
  }
  if (weights.countryPlayer > 0 && ctx.countryFifaCode === player.nationality.fifa_code) {
    weight += weights.countryPlayer;
  }
  if (weights.confederationClub > 0 && currentContext.confederation && ctx.confederation === currentContext.confederation) {
    weight += weights.confederationClub;
  }
  if (weights.confederationPlayer > 0 && ctx.confederation === player.nationality.confederation) {
    weight += weights.confederationPlayer;
  }
  return weight;
}

function pickOfferTeam(
  rng: Rng,
  player: Player,
  currentTeam: Team,
  candidates: Team[],
): { rng: Rng; team: Team } {
  const weights = affinityWeights(player.overall);
  const context = teamContext(currentTeam);
  const weighted = candidates
    .map((team) => ({ item: team, weight: offerWeight(team, context, player, weights) }))
    .filter((entry) => entry.weight > 0);
  if (weighted.length === 0) {
    const fallback = pickOne(rng, candidates);
    return { rng: fallback.rng, team: fallback.item };
  }
  const picked = pickWeighted(rng, weighted);
  return { rng: picked.rng, team: picked.item };
}

function pickDistinct(rng: Rng, pool: Team[], count: number): { rng: Rng; teams: Team[] } {
  const remaining = [...pool];
  const picked: Team[] = [];
  let cur = rng;
  while (remaining.length > 0 && picked.length < count) {
    const choice = pickOne(cur, remaining);
    cur = choice.rng;
    picked.push(choice.item);
    remaining.splice(remaining.findIndex((t) => t.id === choice.item.id), 1);
  }
  return { rng: cur, teams: picked };
}

// ---------------------------------------------------------------------------
// Academy
// ---------------------------------------------------------------------------

/** Youth clubs come from the player's country, then confederation, then anywhere. */
function academyPool(player: Player): Team[] {
  const home = teamsOfCountry(player.nationality.fifa_code);
  if (home.length >= ACADEMY_OFFER_COUNT) return home;
  const confederation = teamsOfConfederation(player.nationality.confederation);
  if (confederation.length >= ACADEMY_OFFER_COUNT) return confederation;
  const fallback = teamsOfConfederation(FALLBACK_CONFEDERATION);
  return fallback.length >= ACADEMY_OFFER_COUNT ? fallback : ALL_TEAMS;
}

export function createAcademyOffers(rng: Rng, player: Player): { rng: Rng; teams: Team[] } {
  return pickDistinct(rng, academyPool(player), ACADEMY_OFFER_COUNT);
}

// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------

export function createTransferOffers(
  rng: Rng,
  player: Player,
  currentTeam: Team,
  count = 2,
  blocked: readonly string[] = [],
): { rng: Rng; teams: Team[] } {
  const used = new Set<string>([currentTeam.id, ...blocked]);
  const offers: Team[] = [];
  let cur = rng;
  const baseReputation = playerOfferReputation(player.overall);

  while (offers.length < count) {
    const jittered = jitterReputation(cur, baseReputation);
    cur = jittered.rng;
    const pool = teamsWithReputation(jittered.reputation).filter((t) => !used.has(t.id));
    if (pool.length === 0) break;
    const picked = pickOfferTeam(cur, player, currentTeam, pool);
    cur = picked.rng;
    offers.push(picked.team);
    used.add(picked.team.id);
  }

  return { rng: cur, teams: offers };
}

// ---------------------------------------------------------------------------
// Loans
// ---------------------------------------------------------------------------

/** A loan only makes sense if the player would actually start at the destination. */
function wouldPlayRegularly(player: Player, team: Team): boolean {
  const status = squadStatusAtTeam(player, team);
  return status === "starter" || status === "high_rotation";
}

function loanPools(
  reputation: number,
  contractTeam: Team,
  excluded: Set<string>,
): { sameCountry: Team[]; sameConfederation: Team[] } {
  const league = getLeagueOfTeam(contractTeam.id);
  const country = league?.country_fifa_code;
  const confederation = league?.confederation;
  const rep = clamp(reputation, 0, 5);
  const candidates = teamsWithReputation(rep).filter((t) => !excluded.has(t.id));
  const sameCountry = candidates.filter((t) => getLeagueOfTeam(t.id)?.country_fifa_code === country);
  const sameConfederation = candidates.filter((t) => {
    const l = getLeagueOfTeam(t.id);
    return l?.country_fifa_code !== country && l?.confederation === confederation;
  });
  return { sameCountry, sameConfederation };
}

/** Loan destinations strongly favour the same country (90/10 against abroad). */
export function createLoanOffers(
  rng: Rng,
  player: Player,
  contractTeam: Team,
  reputation: number,
  count: number,
  extraExcluded: string[] = [],
): { rng: Rng; teams: Team[] } | null {
  const excluded = new Set<string>([contractTeam.id, ...extraExcluded]);
  const picked: Team[] = [];
  let cur = rng;

  while (picked.length < count) {
    const pools = loanPools(reputation, contractTeam, excluded);
    const country = pools.sameCountry.filter((t) => wouldPlayRegularly(player, t));
    const confederation = pools.sameConfederation.filter((t) => wouldPlayRegularly(player, t));
    const options = [
      { item: country, weight: country.length > 0 ? 90 : 0 },
      { item: confederation, weight: confederation.length > 0 ? 10 : 0 },
    ];
    if (options.every((o) => o.weight === 0)) break;
    const bucket = pickWeighted(cur, options);
    cur = bucket.rng;
    const choice = pickOne(cur, bucket.item);
    cur = choice.rng;
    picked.push(choice.item);
    excluded.add(choice.item.id);
  }

  return picked.length === count ? { rng: cur, teams: picked } : null;
}

/**
 * Loans are a development tool, so they stop being offered once a player is
 * old enough that a club would simply sell them instead. Exported because the
 * post-loan branch has to honour the same ceiling — it used to re-offer loans
 * with no age check at all, which left players out on loan at 39.
 */
export const LOAN_MIN_AGE = 18;
export const LOAN_MAX_AGE = 24;

export function isLoanEligible(player: Player, status: string, hadLoan: boolean): boolean {
  if (hadLoan) return false;
  if (player.age < LOAN_MIN_AGE || player.age > LOAN_MAX_AGE) return false;
  return status === "low_rotation" || status === "substitute" || status === "third_keeper";
}

/** Bench players get loaned out far more often than rotation players. */
export function loanWeight(status: string): number {
  if (status === "low_rotation") return 30;
  if (status === "substitute" || status === "third_keeper") return 70;
  return 0;
}

// ---------------------------------------------------------------------------
// Contract non-renewal
// ---------------------------------------------------------------------------

function downgradePool(reputation: number, ceiling: number, excluded: Set<string>): Team[] {
  for (let rep = reputation; rep >= 0; rep -= 1) {
    const pool = teamsWithReputation(rep).filter(
      (t) => t.international_reputation <= ceiling && !excluded.has(t.id),
    );
    if (pool.length > 0) return pool;
  }
  return ALL_TEAMS.filter((t) => t.international_reputation <= ceiling && !excluded.has(t.id));
}

export function createNonRenewalOffers(
  rng: Rng,
  player: Player,
  contractTeam: Team,
  reputation: number,
  blocked: readonly string[] = [],
): { rng: Rng; teams: Team[]; canRetire: boolean } | null {
  const excluded = new Set<string>([contractTeam.id, ...blocked]);
  const veteran = player.age >= 32;
  const count = veteran ? 2 : 3;
  const picked: Team[] = [];
  let cur = rng;

  while (picked.length < count) {
    const coin = nextFloat(cur, 0, 1);
    cur = coin.rng;
    const target = coin.value < 0.5 ? reputation : Math.max(0, reputation - 1);
    const pool = downgradePool(target, reputation, excluded);
    if (pool.length === 0) break;
    const choice = pickOne(cur, pool);
    cur = choice.rng;
    picked.push(choice.item);
    excluded.add(choice.item.id);
  }

  if (picked.length < count) return null;
  return { rng: cur, teams: picked, canRetire: veteran };
}
