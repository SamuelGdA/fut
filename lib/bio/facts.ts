import { getCountryByFifa, getLeagueOfTeamAtTier, getTeam } from "@/lib/data/dataset";
import { countryName, type Locale } from "@/lib/i18n/context";
import { areRivals } from "@/lib/data/rivalries";
import { CLUB_TROPHY_IMPORTANCE, type ClubTrophyKey, type TrophyKey } from "@/lib/data/trophies";
import { clubStanding, fanBand, rivalOverallAt } from "@/lib/sim/engine";
import type { ClubStanding, PersonalityTrait, PositionCode, TalentTier } from "@/lib/sim/constants";
import type { CareerState, SeasonSnapshot } from "@/lib/sim/career";
import { REAL_RECORDS, type BrokenRecord } from "./records";

/** A full starter season's worth of appearances — the yardstick for "actually played". */
const STARTER_SEASON_APPEARANCES = 40;

export interface ClubSpellFact {
  teamId: string;
  name: string;
  countryName: string;
  from: number;
  to: number;
  seasons: number;
  onLoan: boolean;
  standing: ClubStanding;
  reputation: number;
  goals: number;
  assists: number;
  appearances: number;
  trophies: number;
  /** Overall on arrival and on leaving — how much this club moved the player. */
  overallStart: number;
  overallEnd: number;
  /** Left this club to sign directly for one of its real rivals. */
  leftForRival: boolean;
}

export interface BioFacts {
  seed: string;
  lastName: string;
  position: PositionCode;
  isGoalkeeper: boolean;
  nationality: string;
  trait: PersonalityTrait;
  talentTier: TalentTier;
  shirtNumber: number | null;
  retirementAge: number;
  retirementReason: CareerState["retirementReason"];

  startOverall: number;
  peakOverall: number;
  peakAge: number;
  finalOverall: number;

  spells: ClubSpellFact[];
  firstClub: ClubSpellFact | null;
  lastClub: ClubSpellFact | null;
  /** The most prestigious club ever played for. */
  biggestClub: ClubSpellFact | null;
  longestSpell: ClubSpellFact | null;
  clubCount: number;
  loanCount: number;
  countriesPlayedIn: number;
  /** Age of a genuine return to the club they came through, null if it never happened. */
  homecomingAge: number | null;
  retiredAtFirstClub: boolean;
  /** The club where the career finally took off, if there was one. */
  breakoutClub: ClubSpellFact | null;
  /** The first permanent step up to a genuinely big club, null if it never came. */
  giantMove: ClubSpellFact | null;
  giantMoveAge: number | null;
  everLeftForRival: boolean;
  legendClubs: string[];
  idolClubs: string[];

  totalAppearances: number;
  totalGoals: number;
  totalAssists: number;
  totalCleanSheets: number;
  bestSeason: {
    age: number;
    teamName: string;
    goals: number;
    assists: number;
    appearances: number;
    overall: number;
  } | null;

  trophyCounts: Partial<Record<TrophyKey, number>>;
  totalTrophies: number;
  firstLeagueAge: number | null;
  firstContinentalAge: number | null;
  firstCupAge: number | null;
  wonWorldCup: boolean;
  wonNationalContinental: boolean;
  trophyless: boolean;

  ballonDors: number;
  goldenBoots: number;

  caps: number;
  nationalGoals: number;
  firstCallUpAge: number | null;
  neverCapped: boolean;

  /** Age at the career-threatening injury, null if it never happened. */
  severeInjuryAge: number | null;
  relegations: number;
  promotions: number;
  benchSeasons: number;
  suspendedSeasons: number;

  fanSupport: number;
  fanBandKey: string;

  rivalName: string | null;
  rivalOverall: number | null;
  outshoneRival: boolean;

  brokenRecords: BrokenRecord[];

  /** Reached a high level unusually fast. */
  meteoric: boolean;
  /** Only became good well into their late twenties. */
  lateBloomer: boolean;
  /** Never settled anywhere for long. */
  journeyman: boolean;
  /** Spent essentially the whole career at one club. */
  oneClubMan: boolean;
  /** Left their home country before turning 21. */
  wentAbroadEarly: boolean;
  /** Peak overall never got near elite. */
  modestCareer: boolean;
}

function countryNameOf(season: SeasonSnapshot, locale: Locale): string {
  const league = getLeagueOfTeamAtTier(season.teamId, season.leagueTier);
  const country = league ? getCountryByFifa(league.country_fifa_code) : null;
  return country ? countryName(country, locale) : "";
}

/** Consecutive seasons at the same club collapse into a single spell. */
function buildSpells(career: CareerState, locale: Locale): ClubSpellFact[] {
  const spells: ClubSpellFact[] = [];

  for (const season of career.seasons) {
    const last = spells[spells.length - 1];
    if (last && last.teamId === season.teamId && last.onLoan === season.onLoan) {
      last.to = season.age;
      last.seasons += 1;
      last.goals += season.stats.goals;
      last.assists += season.stats.assists;
      last.appearances += season.stats.appearances;
      last.trophies += season.trophies.length;
      last.overallEnd = season.overall;
      continue;
    }
    const team = getTeam(season.teamId);
    spells.push({
      teamId: season.teamId,
      name: team?.name ?? "—",
      countryName: countryNameOf(season, locale),
      from: season.age,
      to: season.age,
      seasons: 1,
      onLoan: season.onLoan,
      standing: "passing",
      reputation: team ? (team.domestic_reputation + team.international_reputation) / 2 : 0,
      goals: season.stats.goals,
      assists: season.stats.assists,
      appearances: season.stats.appearances,
      trophies: season.trophies.length,
      overallStart: season.overall,
      overallEnd: season.overall,
      leftForRival: false,
    });
  }

  // Standing is judged per *club* across every spell there, matching the
  // summary timeline — two stints at the same club add up to one legacy.
  const byClub = new Map<string, { seasons: number; trophyScore: number; appearances: number }>();
  for (const season of career.seasons) {
    const acc = byClub.get(season.teamId) ?? { seasons: 0, trophyScore: 0, appearances: 0 };
    acc.seasons += 1;
    acc.appearances += season.stats.appearances;
    for (const key of season.trophies) {
      acc.trophyScore += CLUB_TROPHY_IMPORTANCE[key as ClubTrophyKey] ?? 0;
    }
    byClub.set(season.teamId, acc);
  }
  for (const spell of spells) {
    const acc = byClub.get(spell.teamId);
    if (!acc) continue;
    spell.standing = clubStanding({
      seasons: acc.seasons,
      trophyScore: acc.trophyScore,
      clubReputation: spell.reputation,
      playedShare: acc.appearances / acc.seasons / STARTER_SEASON_APPEARANCES,
    });
  }

  for (let i = 0; i < spells.length - 1; i += 1) {
    if (areRivals(spells[i].teamId, spells[i + 1].teamId)) spells[i].leftForRival = true;
  }

  return spells;
}

/**
 * A genuine homecoming, as opposed to a loan simply expiring.
 *
 * Going out on loan and coming back is the contract resuming — the player
 * never actually left. A homecoming needs a *permanent* move away first, and
 * it has to be the end of the story: either the return runs to retirement, or
 * it happens late enough to read as one. A 21-year-old rejoining their parent
 * club before leaving again five years later is neither.
 */
function findHomecomingAge(spells: ClubSpellFact[]): number | null {
  const first = spells[0];
  if (!first) return null;

  // Where the opening stint at that club ends.
  let openingEnd = 1;
  while (openingEnd < spells.length && spells[openingEnd].teamId === first.teamId) openingEnd += 1;

  for (let j = openingEnd; j < spells.length; j += 1) {
    if (spells[j].teamId !== first.teamId) continue;
    const away = spells.slice(openingEnd, j).filter((s) => s.teamId !== first.teamId);
    if (!away.some((s) => !s.onLoan)) continue;

    // Only counts if they stayed. Rejoining at 30 and moving on again four
    // years later is another transfer, not a homecoming — so the return has
    // to carry through to retirement for the line to be honest.
    const stayedToTheEnd = spells.slice(j + 1).every((s) => s.teamId === first.teamId);
    if (stayedToTheEnd) return spells[j].from;
  }
  return null;
}

/**
 * The club where a career that hadn't taken off finally did: a permanent move
 * away from where they came through, to somewhere short of a superclub, after
 * which the player's level jumped sharply. Measured on overall rather than
 * goals so it works for a centre-back the same way it does for a striker.
 */
function findBreakoutClub(spells: ClubSpellFact[]): ClubSpellFact | null {
  const first = spells[0];
  for (const spell of spells) {
    if (!first || spell.teamId === first.teamId) continue;
    if (spell.onLoan) continue;
    if (spell.reputation >= 4) continue;
    if (spell.seasons < 2) continue;
    if (spell.overallStart >= 78) continue;
    if (spell.overallEnd - spell.overallStart < 8) continue;
    return spell;
  }
  return null;
}

function detectRecords(facts: {
  isGoalkeeper: boolean;
  totalGoals: number;
  totalAssists: number;
  totalAppearances: number;
  totalCleanSheets: number;
  totalTrophies: number;
  goldenBoots: number;
  ballonDors: number;
  bestSeasonGoals: number;
  bestSeasonAssists: number;
  continentalTitles: number;
  worldCups: number;
  caps: number;
  nationalGoals: number;
  goalsByCountry: Record<string, number>;
}): BrokenRecord[] {
  const achievedBy: Partial<Record<string, number>> = {
    season_goals: facts.bestSeasonGoals,
    career_goals: facts.totalGoals,
    season_assists: facts.bestSeasonAssists,
    career_assists: facts.totalAssists,
    career_appearances: facts.totalAppearances,
    continental_titles: facts.continentalTitles,
    golden_boots: facts.goldenBoots,
    ballon_dor: facts.ballonDors,
    clean_sheets: facts.totalCleanSheets,
    total_trophies: facts.totalTrophies,
    world_cups: facts.worldCups,
    international_caps: facts.caps,
    international_goals: facts.nationalGoals,
  };

  const broken: BrokenRecord[] = [];
  for (const record of REAL_RECORDS) {
    if (record.goalkeeperOnly && !facts.isGoalkeeper) continue;
    if (record.outfieldOnly && facts.isGoalkeeper) continue;

    // A country's record is only on the table once the player actually played
    // there — an English mark means nothing to a career spent in Brazil.
    const achieved =
      record.countryFifa !== undefined
        ? (facts.goalsByCountry[record.countryFifa] ?? -1)
        : (achievedBy[record.key] ?? 0);
    if (achieved < 0 || achieved < record.value) continue;

    broken.push({
      id: record.id,
      key: record.key,
      achieved,
      previous: record.value,
      holder: record.holder,
      equalled: achieved === record.value,
    });
  }
  return broken;
}

/**
 * Flattens a finished career into the plain, queryable shape the biography
 * phrase library reads. Every condition in that library is a predicate over
 * this object and nothing else, so a phrase can never accidentally depend on
 * simulation internals.
 */
export function buildBioFacts(career: CareerState, locale: Locale): BioFacts {
  const seasons = career.seasons;
  const spells = buildSpells(career, locale);
  const isGoalkeeper = career.player.position === "GK";

  let totalAppearances = 0;
  let totalGoals = 0;
  let totalAssists = 0;
  let totalCleanSheets = 0;
  let relegations = 0;
  let promotions = 0;
  let benchSeasons = 0;
  let suspendedSeasons = 0;
  let ballonDors = 0;
  let goldenBoots = 0;
  let bestSeasonGoals = 0;
  let bestSeasonAssists = 0;

  const trophyCounts: Partial<Record<TrophyKey, number>> = {};
  // Keyed by FIFA code so a country's own top-scorer record can be checked
  // against the goals actually scored in that country's league.
  const goalsByCountry: Record<string, number> = {};

  for (const season of seasons) {
    const league = getLeagueOfTeamAtTier(season.teamId, season.leagueTier);
    if (league) {
      const code = league.country_fifa_code.trim().toUpperCase();
      goalsByCountry[code] = (goalsByCountry[code] ?? 0) + season.stats.goals;
    }
    totalAppearances += season.stats.appearances;
    totalGoals += season.stats.goals;
    totalAssists += season.stats.assists;
    totalCleanSheets += season.stats.cleanSheets;
    if (season.relegated) relegations += 1;
    if (season.promoted) promotions += 1;
    if (season.suspended) suspendedSeasons += 1;
    if (season.stats.appearances < 12) benchSeasons += 1;
    bestSeasonGoals = Math.max(bestSeasonGoals, season.stats.goals);
    bestSeasonAssists = Math.max(bestSeasonAssists, season.stats.assists);
    for (const award of season.awards) {
      if (award === "ballon_dor") ballonDors += 1;
      if (award === "golden_boot") goldenBoots += 1;
    }
    for (const key of season.trophies) {
      trophyCounts[key] = (trophyCounts[key] ?? 0) + 1;
    }
  }

  const totalTrophies = Object.values(trophyCounts).reduce((sum, n) => sum + (n ?? 0), 0);

  const firstAgeWith = (predicate: (t: TrophyKey) => boolean): number | null => {
    for (const season of seasons) {
      if (season.trophies.some(predicate)) return season.age;
    }
    return null;
  };

  // The single season that best defines the career: production first, with
  // overall as the tiebreak so a quiet keeper still gets a defining year.
  let bestSeason: BioFacts["bestSeason"] = null;
  let bestScore = -1;
  for (const season of seasons) {
    const production = isGoalkeeper
      ? season.stats.cleanSheets * 3
      : season.stats.goals * 3 + season.stats.assists * 2;
    const score = production * 100 + season.overall;
    if (score > bestScore) {
      bestScore = score;
      bestSeason = {
        age: season.age,
        teamName: getTeam(season.teamId)?.name ?? "—",
        goals: season.stats.goals,
        assists: season.stats.assists,
        appearances: season.stats.appearances,
        overall: season.overall,
      };
    }
  }

  const peakSeason = seasons.reduce<SeasonSnapshot | null>(
    (best, s) => (!best || s.overall > best.overall ? s : best),
    null,
  );

  const firstClub = spells[0] ?? null;
  const lastClub = spells[spells.length - 1] ?? null;
  const biggestClub = spells.reduce<ClubSpellFact | null>(
    (best, s) => (!best || s.reputation > best.reputation ? s : best),
    null,
  );
  const longestSpell = spells.reduce<ClubSpellFact | null>(
    (best, s) => (!best || s.seasons > best.seasons ? s : best),
    null,
  );

  const giantMoveSpell =
    spells.find((s, i) => i > 0 && !s.onLoan && s.reputation >= 4 && spells[i - 1].reputation < 4) ??
    null;

  const uniqueClubs = new Set(spells.map((s) => s.teamId));
  const uniqueCountries = new Set(spells.map((s) => s.countryName).filter(Boolean));

  const startOverall = seasons[0]?.overall ?? career.player.overall;
  const peakOverall = peakSeason?.overall ?? career.player.overall;
  const finalOverall = seasons[seasons.length - 1]?.overall ?? career.player.overall;
  const peakAge = peakSeason?.age ?? career.player.age;

  // The age the player first looked like a genuine top-flight footballer.
  const breakoutSeason = seasons.find((s) => s.overall >= 75) ?? null;

  const homeCountry = countryName(career.player.nationality, locale);
  const firstForeignSpell = spells.find((s) => s.countryName && s.countryName !== homeCountry) ?? null;

  const continentalTitles =
    (trophyCounts.continental_primary ?? 0) + (trophyCounts.continental_secondary ?? 0);

  return {
    seed: career.seed,
    lastName: career.identity.lastName,
    position: career.player.position,
    isGoalkeeper,
    nationality: homeCountry,
    trait: career.player.trait,
    talentTier: career.player.talentTier,
    shirtNumber: career.shirtNumber,
    retirementAge: career.player.age,
    retirementReason: career.retirementReason,

    startOverall,
    peakOverall,
    peakAge,
    finalOverall,

    spells,
    firstClub,
    lastClub,
    biggestClub,
    longestSpell,
    clubCount: uniqueClubs.size,
    loanCount: spells.filter((s) => s.onLoan).length,
    countriesPlayedIn: uniqueCountries.size,
    homecomingAge: findHomecomingAge(spells),
    retiredAtFirstClub:
      firstClub !== null && lastClub !== null && spells.length > 1 && lastClub.teamId === firstClub.teamId,
    breakoutClub: findBreakoutClub(spells),
    // Only a step *up* counts: arriving at a giant you were already at, or
    // being loaned to one, isn't the transfer that changes a career.
    giantMove: giantMoveSpell,
    giantMoveAge: giantMoveSpell?.from ?? null,
    everLeftForRival: spells.some((s) => s.leftForRival),
    legendClubs: [...new Set(spells.filter((s) => s.standing === "legend").map((s) => s.name))],
    idolClubs: [...new Set(spells.filter((s) => s.standing === "idol").map((s) => s.name))],

    totalAppearances,
    totalGoals,
    totalAssists,
    totalCleanSheets,
    bestSeason,

    trophyCounts,
    totalTrophies,
    firstLeagueAge: firstAgeWith((t) => t === "league"),
    firstContinentalAge: firstAgeWith(
      (t) => t === "continental_primary" || t === "continental_secondary",
    ),
    firstCupAge: firstAgeWith((t) => t === "cup"),
    wonWorldCup: (trophyCounts.world_cup ?? 0) > 0,
    wonNationalContinental: (trophyCounts.national_continental ?? 0) > 0,
    trophyless: totalTrophies === 0,

    ballonDors,
    goldenBoots,

    caps: career.nationalTeamStats.caps,
    nationalGoals: career.nationalTeamStats.goals,
    firstCallUpAge: career.firstCallUpAge,
    neverCapped: career.firstCallUpAge === null,

    // The headline is where the sim recorded it, and it carries the age.
    severeInjuryAge: career.headlines.find((h) => h.key === "severeInjury")?.age ?? null,
    relegations,
    promotions,
    benchSeasons,
    suspendedSeasons,

    fanSupport: career.fanSupport,
    fanBandKey: fanBand(career.fanSupport),

    rivalName: career.rival?.name ?? null,
    rivalOverall: career.rival ? rivalOverallAt(career.rival, 28) : null,
    outshoneRival: career.rival !== null && peakOverall > rivalOverallAt(career.rival, 28),

    brokenRecords: detectRecords({
      isGoalkeeper,
      totalGoals,
      totalAssists,
      totalAppearances,
      totalCleanSheets,
      totalTrophies,
      goldenBoots,
      ballonDors,
      bestSeasonGoals,
      bestSeasonAssists,
      continentalTitles,
      worldCups: trophyCounts.world_cup ?? 0,
      caps: career.nationalTeamStats.caps,
      nationalGoals: career.nationalTeamStats.goals,
      goalsByCountry,
    }),

    meteoric: breakoutSeason !== null && breakoutSeason.age <= 21,
    lateBloomer: breakoutSeason !== null && breakoutSeason.age >= 27,
    journeyman: uniqueClubs.size >= 6,
    oneClubMan: uniqueClubs.size === 1 && seasons.length >= 10,
    wentAbroadEarly: firstForeignSpell !== null && firstForeignSpell.from <= 20,
    modestCareer: peakOverall < 72,
  };
}
