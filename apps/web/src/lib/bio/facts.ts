import {
  getConfederationTrophies,
  getCountryByFifa,
  getLeagueOfTeam,
  getLeagueOfTeamAtTier,
  getTeam,
} from "@craque/data";
import { countryName, type Locale } from "@/lib/i18n/context";
import { areRivals } from "@craque/data";
import {
  singleTrophyImportance,
  type Confederation,
  type TrophyKey,
} from "@craque/data";
import { clubStanding, fanBand, rivalOverallAt } from "@/lib/sim/engine";
import {
  isDefender,
  type ClubStanding,
  type PersonalityTrait,
  type PositionCode,
  type TalentTier,
} from "@/lib/sim/constants";
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
  /** Centre-backs, full-backs and holding midfielders — the clean-sheet trades. */
  isDefender: boolean;
  nationality: string;
  /** Where they are actually from, which a mid-career switch does not change. */
  birthNationality: string;
  /** Whether this career took a second passport and changed who it played for. */
  switchedNationality: boolean;
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
  /**
   * Every permanent re-signing for a club already played for permanently.
   * A loan expiring is not a return — the contract never moved.
   */
  returns: { name: string; age: number }[];
  /** The clubs worth naming in an itinerary line, in career order. */
  itinerary: ClubSpellFact[];
  /** The spell that most defines the career, with its full numbers. */
  keySpell: ClubSpellFact | null;
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
  /**
   * League titles split by division. Winning the Championship is a promotion
   * story, not a national title, and the biography must never conflate them.
   */
  topFlightTitles: number;
  secondTierTitles: number;
  firstLeagueAge: number | null;
  firstSecondTierTitleAge: number | null;
  /**
   * The first continental title, kept apart by tier and carrying the real
   * competition name — a Sudamericana and a Libertadores are not the same
   * sentence, and the bio used to print the same one for both.
   */
  firstContinentalPrimary: { age: number; name: string } | null;
  firstContinentalSecondary: { age: number; name: string } | null;
  firstCupAge: number | null;
  /** Repeat counts, so four Champions Leagues never read like one. */
  continentalPrimaryTitles: number;
  continentalSecondaryTitles: number;
  continentalTertiaryTitles: number;
  firstTertiaryAge: number | null;
  cupTitles: number;
  leagueCupTitles: number;
  superCupTitles: number;
  clubWorldCups: number;
  intercontinentalCups: number;
  worldCups: number;
  nationalContinentalTitles: number;
  /** The single most decorated season, for the "everything at once" line. */
  bestTrophySeason: { age: number; count: number; teamName: string } | null;
  /** How many separate seasons ended with at least one trophy. */
  trophySeasons: number;
  wonWorldCup: boolean;
  wonNationalContinental: boolean;
  trophyless: boolean;

  ballonDors: number;
  goldenBoots: number;

  caps: number;
  nationalGoals: number;
  firstCallUpAge: number | null;
  neverCapped: boolean;
  /**
   * How much of an international career it actually was. Eight caps and eighty
   * are both "played for their country" and nothing else about them is alike.
   */
  capsBand: "none" | "fringe" | "squad" | "regular" | "mainstay" | "icon";

  /** Age at the career-threatening injury, null if it never happened. */
  severeInjuryAge: number | null;
  relegations: number;
  promotions: number;
  /** Club the player last won promotion with, for the line that mentions it. */
  promotionClub: string | null;
  /** True only when the rolled ceiling was genuinely well above what was reached. */
  unfulfilledPotential: boolean;
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
  /** Seasons spent within two points of the career peak. */
  peakPlateauSeasons: number;
  /** How far the level fell from the peak to the final season. */
  declineDrop: number;
  /**
   * The road not taken: the biggest club the player ever turned down, kept
   * only when it was clearly bigger than where they went instead. Null when
   * they never said no to anyone who mattered.
   */
  roadNotTaken: { club: string; age: number; reputation: number; joinedInstead: string } | null;
}

/**
 * The first season a given continental cup was won, with the name that
 * confederation actually calls it.
 */
function firstContinentalWin(
  seasons: SeasonSnapshot[],
  key: "continental_primary" | "continental_secondary",
): { age: number; name: string } | null {
  for (const season of seasons) {
    if (!season.trophies.includes(key)) continue;
    const league = getLeagueOfTeamAtTier(season.teamId, season.leagueTier);
    const name = league
      ? getConfederationTrophies(league.confederation)?.continental_trophies[key]?.name
      : undefined;
    return { age: season.age, name: name ?? "" };
  }
  return null;
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
      name: team?.name ?? "-",
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
      acc.trophyScore += singleTrophyImportance(
        key,
        getLeagueOfTeam(season.teamId)?.confederation as Confederation | undefined,
      );
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
 * Permanent re-signings for a club the player had already been at permanently.
 *
 * Deliberately looser than `findHomecomingAge`, which only fires when the
 * return runs to retirement. Rejoining a club at 30 and leaving again at 34 is
 * still one of the most notable things that happened in that career, and the
 * old rule silently threw it away.
 */
/**
 * Clubs the player genuinely went back to.
 *
 * Being loaned out and coming back is not a return, and it used to read as
 * one: a teenager farmed out season after season kept "rejoining" the club
 * that owned him the whole time, so the biography announced a reunion with a
 * club he had never actually left. A return needs a different club to have
 * owned him in between.
 */
function findReturns(spells: ClubSpellFact[]): { name: string; age: number }[] {
  const out: { name: string; age: number }[] = [];
  const seenPermanently = new Set<string>();
  let lastPermanent: string | null = null;
  for (const spell of spells) {
    if (spell.onLoan) continue;
    if (seenPermanently.has(spell.teamId) && lastPermanent !== spell.teamId) {
      out.push({ name: spell.name, age: spell.from });
    }
    seenPermanently.add(spell.teamId);
    lastPermanent = spell.teamId;
  }
  return out;
}

/**
 * The handful of clubs worth naming when summarising where a career went.
 *
 * Loans are excluded — they are covered by their own lines — and the first and
 * last permanent clubs are always kept, because "started at X, finished at Y"
 * is the spine a reader hangs everything else on. In between, the clubs that
 * earned the most: seasons first, then silverware, then prestige.
 */
const ITINERARY_MAX = 6;

function buildItinerary(spells: ClubSpellFact[]): ClubSpellFact[] {
  // One club, two spells is one name in a list of destinations. Leaving the
  // duplicate in produced "Rosario Central, Rosario Central, Liverpool…".
  const seen = new Set<string>();
  const permanent = spells.filter((s) => {
    if (s.onLoan || seen.has(s.teamId)) return false;
    seen.add(s.teamId);
    return true;
  });
  if (permanent.length <= ITINERARY_MAX) return permanent;

  const first = permanent[0];
  const last = permanent[permanent.length - 1];
  const weight = (s: ClubSpellFact) => s.seasons * 2 + s.trophies * 3 + s.reputation;
  const middle = permanent
    .slice(1, -1)
    .sort((a, b) => weight(b) - weight(a))
    .slice(0, ITINERARY_MAX - 2);

  return [first, ...middle, last].sort((a, b) => a.from - b.from);
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

/** Longest run of unbroken consecutive seasons where `hits` is true. */
function longestStreak(seasons: SeasonSnapshot[], hits: (s: SeasonSnapshot) => boolean): number {
  let longest = 0;
  let current = 0;
  for (const season of seasons) {
    if (hits(season)) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

/**
 * How many times a given trophy was won, grouped by the confederation that
 * actually issues it. A Champions League and a Copa Libertadores both come
 * out of the sim as `continental_primary`, and only this split keeps a record
 * check from comparing one against the other.
 */
function titlesByConfederation(seasons: SeasonSnapshot[], key: TrophyKey): Record<string, number> {
  const out: Record<string, number> = {};
  for (const season of seasons) {
    if (!season.trophies.includes(key)) continue;
    const league = getLeagueOfTeamAtTier(season.teamId, season.leagueTier);
    if (!league) continue;
    out[league.confederation] = (out[league.confederation] ?? 0) + 1;
  }
  return out;
}

/** Top-flight league titles only, grouped by the country whose league it was. */
function leagueTitlesByCountry(seasons: SeasonSnapshot[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const season of seasons) {
    if (!season.trophies.includes("league") || season.leagueTier !== 1) continue;
    const league = getLeagueOfTeamAtTier(season.teamId, season.leagueTier);
    if (!league) continue;
    out[league.country_fifa_code] = (out[league.country_fifa_code] ?? 0) + 1;
  }
  return out;
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
  worldCups: number;
  caps: number;
  nationalGoals: number;
  continentalPrimaryByConfederation: Record<string, number>;
  continentalSecondaryByConfederation: Record<string, number>;
  leagueTitlesByCountry: Record<string, number>;
  longestLeagueStreak: number;
  longestContinentalPrimaryStreak: number;
  longestBallonDorStreak: number;
}): BrokenRecord[] {
  const achievedBy: Partial<Record<string, number>> = {
    season_goals: facts.bestSeasonGoals,
    career_goals: facts.totalGoals,
    season_assists: facts.bestSeasonAssists,
    career_assists: facts.totalAssists,
    career_appearances: facts.totalAppearances,
    golden_boots: facts.goldenBoots,
    ballon_dor: facts.ballonDors,
    clean_sheets: facts.totalCleanSheets,
    total_trophies: facts.totalTrophies,
    world_cups: facts.worldCups,
    international_caps: facts.caps,
    international_goals: facts.nationalGoals,
    consecutive_league_titles: facts.longestLeagueStreak,
    consecutive_continental_primary: facts.longestContinentalPrimaryStreak,
    consecutive_ballon_dor: facts.longestBallonDorStreak,
  };

  const broken: BrokenRecord[] = [];
  for (const record of REAL_RECORDS) {
    if (record.goalkeeperOnly && !facts.isGoalkeeper) continue;
    if (record.outfieldOnly && facts.isGoalkeeper) continue;

    // Continental and league records are scoped to a specific confederation or
    // country rather than read off the flat `achievedBy` map — a career is
    // only ever checked against the one real competition each trophy actually
    // came from.
    let achieved: number;
    if (record.confederation) {
      const byConfederation =
        record.key === "continental_primary"
          ? facts.continentalPrimaryByConfederation
          : facts.continentalSecondaryByConfederation;
      achieved = byConfederation[record.confederation] ?? 0;
    } else if (record.countryFifa) {
      achieved = facts.leagueTitlesByCountry[record.countryFifa] ?? 0;
    } else {
      achieved = achievedBy[record.key] ?? 0;
    }
    if (achieved < record.value) continue;

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
/**
 * The biggest club the player ever turned down — but only when saying no
 * actually meant something.
 *
 * Two guards keep this honest. It has to be a club of real standing, and it
 * has to have been bigger than the one taken instead: turning down a mid-table
 * side to sign for a European champion is not a road not taken, it is just a
 * transfer. What survives both is the offer that would have changed the shape
 * of the career, which is the only kind worth a line in a biography.
 */
function findRoadNotTaken(career: CareerState): BioFacts["roadNotTaken"] {
  const declined = career.declinedOffers ?? [];
  if (declined.length === 0) return null;

  let best: BioFacts["roadNotTaken"] = null;
  for (const offer of declined) {
    if (offer.reputation < 3) continue;
    const club = getTeam(offer.teamId);
    if (!club) continue;

    // Where they actually went that year. The season list is the record of
    // what happened, so it settles what the alternative was.
    const taken = career.seasons.find((s) => s.age >= offer.age);
    if (!taken) continue;
    const takenClub = getTeam(taken.teamId);
    if (!takenClub) continue;
    if (takenClub.id === club.id) continue;

    const takenReputation = Math.max(
      takenClub.domestic_reputation,
      takenClub.international_reputation,
    );
    if (offer.reputation - takenReputation < 1) continue;

    if (!best || offer.reputation > best.reputation) {
      best = {
        club: club.name,
        age: offer.age,
        reputation: offer.reputation,
        joinedInstead: takenClub.name,
      };
    }
  }
  return best;
}

export function buildBioFacts(career: CareerState, locale: Locale): BioFacts {
  const seasons = career.seasons;
  const spells = buildSpells(career, locale);
  const isGoalkeeper = career.player.position === "GK";
  const playsInDefence = isDefender(career.player.position);

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

  for (const season of seasons) {
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

  // League titles have to be read together with the division they were won in.
  // The simulation records a second-division championship under the same
  // `league` key as a Premier League title, and calling the first one a
  // national title is the single most misleading thing the old text did.
  let topFlightTitles = 0;
  let secondTierTitles = 0;
  let firstLeagueAge: number | null = null;
  let firstSecondTierTitleAge: number | null = null;
  for (const season of seasons) {
    if (!season.trophies.includes("league")) continue;
    if (season.leagueTier === 1) {
      topFlightTitles += 1;
      if (firstLeagueAge === null) firstLeagueAge = season.age;
    } else {
      secondTierTitles += 1;
      if (firstSecondTierTitleAge === null) firstSecondTierTitleAge = season.age;
    }
  }

  // The most decorated single season, and how many seasons produced anything.
  let bestTrophySeason: BioFacts["bestTrophySeason"] = null;
  let trophySeasons = 0;
  for (const season of seasons) {
    if (season.trophies.length === 0) continue;
    trophySeasons += 1;
    if (!bestTrophySeason || season.trophies.length > bestTrophySeason.count) {
      bestTrophySeason = {
        age: season.age,
        count: season.trophies.length,
        teamName: getTeam(season.teamId)?.name ?? "-",
      };
    }
  }

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
        teamName: getTeam(season.teamId)?.name ?? "-",
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

  // Two different countries, and the biography has to keep them apart. The
  // one the player represents can change mid-career on a grandparent's
  // passport; where they grew up cannot. Childhood lines and "left home
  // early" belong to the birth country, call-ups and World Cups to the
  // current one. Older saves have no birth country recorded, and for them
  // the current one is right — they were written before switching existed.
  const birthCountry = countryName(career.birthNationality ?? career.player.nationality, locale);
  const representedCountry = countryName(career.player.nationality, locale);
  const firstForeignSpell = spells.find((s) => s.countryName && s.countryName !== birthCountry) ?? null;

  const caps = career.nationalTeamStats.caps;
  const capsBand: BioFacts["capsBand"] =
    caps === 0 ? "none" : caps < 12 ? "fringe" : caps < 30 ? "squad" : caps < 60 ? "regular" : caps < 100 ? "mainstay" : "icon";

  // Legend / idol status is a club thing, and a loanee is a guest. Only count
  // clubs the player was actually signed to at some point.
  const permanentClubIds = new Set(spells.filter((s) => !s.onLoan).map((s) => s.teamId));
  const standingClubs = (want: ClubStanding) => [
    ...new Set(spells.filter((s) => s.standing === want && permanentClubIds.has(s.teamId)).map((s) => s.name)),
  ];

  const plateauFloor = peakOverall - 2;
  const peakPlateauSeasons = seasons.filter((s) => s.overall >= plateauFloor).length;

  const itinerary = buildItinerary(spells);
  // The spell a reader would name if asked "where did they play?" — length
  // first, silverware as the tie-break.
  const keySpell =
    spells
      .filter((s) => !s.onLoan)
      .reduce<ClubSpellFact | null>(
        (best, s) =>
          !best || s.seasons * 2 + s.trophies > best.seasons * 2 + best.trophies ? s : best,
        null,
      ) ?? null;

  return {
    seed: career.seed,
    lastName: career.identity.lastName,
    position: career.player.position,
    isGoalkeeper,
    isDefender: playsInDefence,
    nationality: representedCountry,
    birthNationality: birthCountry,
    switchedNationality: birthCountry !== representedCountry,
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
    returns: findReturns(spells),
    itinerary,
    keySpell,
    retiredAtFirstClub:
      firstClub !== null && lastClub !== null && spells.length > 1 && lastClub.teamId === firstClub.teamId,
    breakoutClub: findBreakoutClub(spells),
    // Only a step *up* counts: arriving at a giant you were already at, or
    // being loaned to one, isn't the transfer that changes a career.
    giantMove: giantMoveSpell,
    giantMoveAge: giantMoveSpell?.from ?? null,
    everLeftForRival: spells.some((s) => s.leftForRival),
    legendClubs: standingClubs("legend"),
    idolClubs: standingClubs("idol"),

    totalAppearances,
    totalGoals,
    totalAssists,
    totalCleanSheets,
    bestSeason,

    trophyCounts,
    totalTrophies,
    topFlightTitles,
    secondTierTitles,
    firstLeagueAge,
    firstSecondTierTitleAge,
    firstContinentalPrimary: firstContinentalWin(seasons, "continental_primary"),
    firstContinentalSecondary: firstContinentalWin(seasons, "continental_secondary"),
    firstCupAge: firstAgeWith((t) => t === "cup"),
    continentalPrimaryTitles: trophyCounts.continental_primary ?? 0,
    continentalSecondaryTitles: trophyCounts.continental_secondary ?? 0,
    continentalTertiaryTitles: trophyCounts.continental_tertiary ?? 0,
    firstTertiaryAge: firstAgeWith((t) => t === "continental_tertiary"),
    cupTitles: trophyCounts.cup ?? 0,
    leagueCupTitles: trophyCounts.league_cup ?? 0,
    superCupTitles: (trophyCounts.domestic_super_cup ?? 0) + (trophyCounts.continental_super_cup ?? 0),
    clubWorldCups: trophyCounts.club_world_cup ?? 0,
    intercontinentalCups: trophyCounts.intercontinental_cup ?? 0,
    worldCups: trophyCounts.world_cup ?? 0,
    nationalContinentalTitles: trophyCounts.national_continental ?? 0,
    bestTrophySeason,
    trophySeasons,
    wonWorldCup: (trophyCounts.world_cup ?? 0) > 0,
    wonNationalContinental: (trophyCounts.national_continental ?? 0) > 0,
    trophyless: totalTrophies === 0,

    ballonDors,
    goldenBoots,

    caps,
    nationalGoals: career.nationalTeamStats.goals,
    firstCallUpAge: career.firstCallUpAge,
    neverCapped: career.firstCallUpAge === null,
    capsBand,

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
      worldCups: trophyCounts.world_cup ?? 0,
      caps: career.nationalTeamStats.caps,
      nationalGoals: career.nationalTeamStats.goals,
      continentalPrimaryByConfederation: titlesByConfederation(seasons, "continental_primary"),
      continentalSecondaryByConfederation: titlesByConfederation(seasons, "continental_secondary"),
      leagueTitlesByCountry: leagueTitlesByCountry(seasons),
      longestLeagueStreak: longestStreak(seasons, (s) => s.trophies.includes("league") && s.leagueTier === 1),
      longestContinentalPrimaryStreak: longestStreak(seasons, (s) => s.trophies.includes("continental_primary")),
      longestBallonDorStreak: longestStreak(seasons, (s) => s.awards.includes("ballon_dor")),
    }),

    meteoric: breakoutSeason !== null && breakoutSeason.age <= 21,
    lateBloomer: breakoutSeason !== null && breakoutSeason.age >= 27,
    journeyman: uniqueClubs.size >= 6,
    oneClubMan: uniqueClubs.size === 1 && seasons.length >= 10,
    wentAbroadEarly: firstForeignSpell !== null && firstForeignSpell.from <= 20,
    modestCareer: peakOverall < 72,
    promotionClub: (() => {
      const lastUp = [...seasons].reverse().find((season) => season.promoted);
      return lastUp ? (getTeam(lastUp.teamId)?.name ?? null) : null;
    })(),
    // "The talent asked for more" is only true if there was more to ask for.
    // A career that peaked at 63 off a 66 ceiling got everything out of
    // itself; saying otherwise reads as the game misremembering the save.
    unfulfilledPotential: career.player.potential - peakOverall >= 8,
    peakPlateauSeasons,
    declineDrop: peakOverall - finalOverall,
    roadNotTaken: findRoadNotTaken(career),
  };
}
