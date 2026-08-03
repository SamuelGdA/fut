import { getLeagueOfTeamAtTier, getTeam } from "@/lib/data/dataset";
import { CLUB_TROPHY_IMPORTANCE, type ClubTrophyKey, type TrophyKey } from "@/lib/data/trophies";
import { clubStanding } from "@/lib/sim/engine";
import type { ClubStanding } from "@/lib/sim/constants";
import type { CareerState } from "@/lib/sim/career";

/** A full starter season's worth of appearances — the yardstick for "actually played". */
const STARTER_SEASON_APPEARANCES = 40;

export interface ClubRun {
  teamId: string;
  name: string;
  reputation: number;
  seasons: number;
  appearances: number;
  goals: number;
  assists: number;
  trophies: number;
  standing: ClubStanding;
  /** Every stint there was a loan — the player was never really theirs. */
  onlyOnLoan: boolean;
}

/**
 * Everything a challenge might want to ask about a finished career, computed
 * once.
 *
 * Missions are scored on these and nothing else, so a mission can never reach
 * into simulation internals and quietly break when the engine changes. It also
 * keeps scoring honest: two missions asking about "titles" are guaranteed to
 * be counting the same thing.
 */
export interface CareerMetrics {
  seasonsPlayed: number;
  retirementAge: number;
  peakOverall: number;
  peakAge: number;
  finalOverall: number;
  /** Best overall reached at or before a given age. */
  overallByAge: (age: number) => number;

  totalAppearances: number;
  totalGoals: number;
  totalAssists: number;
  totalCleanSheets: number;
  bestSeasonGoals: number;
  bestSeasonAssists: number;
  bestSeasonCleanSheets: number;

  trophyCounts: Partial<Record<TrophyKey, number>>;
  totalTrophies: number;
  distinctTrophyTypes: number;
  leagueTitles: number;
  cupTitles: number;
  continentalTitles: number;
  clubWorldCups: number;
  worldCups: number;
  nationalContinental: number;

  ballonDors: number;
  goldenBoots: number;
  totalAwards: number;

  caps: number;
  nationalGoals: number;
  firstCallUpAge: number | null;

  clubs: ClubRun[];
  clubCount: number;
  countryCount: number;
  loanSpells: number;
  /** Permanent moves only — loans don't count as leaving. */
  permanentTransfers: number;
  legendClubs: ClubRun[];
  idolClubs: ClubRun[];
  /** Best (lowest-reputation) club the player became a legend at. */
  smallestLegendClub: ClubRun | null;

  relegations: number;
  promotions: number;
  seasonsInSecondTier: number;
  severeInjuryAge: number | null;
  suspendedSeasons: number;

  finalFanSupport: number;
  shirtNumber: number | null;
  /** Seasons spent wearing a single-digit-to-11 marquee number. */
  seasonsWithMarqueeNumber: number;

  everPlayedForFirstClubAgain: boolean;
  retiredAtFirstClub: boolean;
  firstClub: ClubRun | null;
  lastClub: ClubRun | null;
}

function buildClubRuns(career: CareerState): ClubRun[] {
  const byClub = new Map<string, ClubRun & { loanSeasons: number }>();

  for (const season of career.seasons) {
    const existing = byClub.get(season.teamId);
    const team = getTeam(season.teamId);
    const entry =
      existing ??
      {
        teamId: season.teamId,
        name: team?.name ?? "—",
        reputation: team ? (team.domestic_reputation + team.international_reputation) / 2 : 0,
        seasons: 0,
        appearances: 0,
        goals: 0,
        assists: 0,
        trophies: 0,
        standing: "passing" as ClubStanding,
        onlyOnLoan: true,
        loanSeasons: 0,
      };

    entry.seasons += 1;
    entry.appearances += season.stats.appearances;
    entry.goals += season.stats.goals;
    entry.assists += season.stats.assists;
    entry.trophies += season.trophies.length;
    if (season.onLoan) entry.loanSeasons += 1;
    byClub.set(season.teamId, entry);
  }

  const runs: ClubRun[] = [];
  for (const entry of byClub.values()) {
    let trophyScore = 0;
    for (const season of career.seasons) {
      if (season.teamId !== entry.teamId) continue;
      for (const key of season.trophies) {
        trophyScore += CLUB_TROPHY_IMPORTANCE[key as ClubTrophyKey] ?? 0;
      }
    }
    entry.standing = clubStanding({
      seasons: entry.seasons,
      trophyScore,
      clubReputation: entry.reputation,
      playedShare: entry.appearances / entry.seasons / STARTER_SEASON_APPEARANCES,
    });
    entry.onlyOnLoan = entry.loanSeasons === entry.seasons;
    const { loanSeasons: _loanSeasons, ...run } = entry;
    void _loanSeasons;
    runs.push(run);
  }
  return runs;
}

export function buildCareerMetrics(career: CareerState): CareerMetrics {
  const seasons = career.seasons;
  const clubs = buildClubRuns(career);

  let totalAppearances = 0;
  let totalGoals = 0;
  let totalAssists = 0;
  let totalCleanSheets = 0;
  let bestSeasonGoals = 0;
  let bestSeasonAssists = 0;
  let bestSeasonCleanSheets = 0;
  let relegations = 0;
  let promotions = 0;
  let seasonsInSecondTier = 0;
  let suspendedSeasons = 0;
  let ballonDors = 0;
  let goldenBoots = 0;
  let totalAwards = 0;
  let seasonsWithMarqueeNumber = 0;

  const trophyCounts: Partial<Record<TrophyKey, number>> = {};

  for (const season of seasons) {
    totalAppearances += season.stats.appearances;
    totalGoals += season.stats.goals;
    totalAssists += season.stats.assists;
    totalCleanSheets += season.stats.cleanSheets;
    bestSeasonGoals = Math.max(bestSeasonGoals, season.stats.goals);
    bestSeasonAssists = Math.max(bestSeasonAssists, season.stats.assists);
    bestSeasonCleanSheets = Math.max(bestSeasonCleanSheets, season.stats.cleanSheets);
    if (season.relegated) relegations += 1;
    if (season.promoted) promotions += 1;
    if (season.leagueTier === 2) seasonsInSecondTier += 1;
    if (season.suspended) suspendedSeasons += 1;
    if (season.shirtNumber !== null && season.shirtNumber <= 11) seasonsWithMarqueeNumber += 1;
    for (const award of season.awards) {
      totalAwards += 1;
      if (award === "ballon_dor") ballonDors += 1;
      if (award === "golden_boot") goldenBoots += 1;
    }
    for (const key of season.trophies) {
      trophyCounts[key] = (trophyCounts[key] ?? 0) + 1;
    }
  }

  const peakSeason = seasons.reduce<(typeof seasons)[number] | null>(
    (best, s) => (!best || s.overall > best.overall ? s : best),
    null,
  );

  // Spell order matters for "left and came back" style questions, so this walks
  // the seasons rather than the deduplicated club list.
  const spellOrder: string[] = [];
  for (const season of seasons) {
    if (spellOrder[spellOrder.length - 1] !== season.teamId) spellOrder.push(season.teamId);
  }
  const firstTeamId = spellOrder[0] ?? null;
  const lastTeamId = spellOrder[spellOrder.length - 1] ?? null;

  let permanentTransfers = 0;
  let previousPermanent: string | null = null;
  for (const season of seasons) {
    if (season.onLoan) continue;
    if (previousPermanent !== null && previousPermanent !== season.teamId) permanentTransfers += 1;
    previousPermanent = season.teamId;
  }

  const loanSpells = (() => {
    let count = 0;
    let inLoan = false;
    for (const season of seasons) {
      if (season.onLoan && !inLoan) count += 1;
      inLoan = season.onLoan;
    }
    return count;
  })();

  const byId = (id: string | null) => clubs.find((c) => c.teamId === id) ?? null;
  const legendClubs = clubs.filter((c) => c.standing === "legend");
  const idolClubs = clubs.filter((c) => c.standing === "idol");

  const totalTrophies = Object.values(trophyCounts).reduce((sum, n) => sum + (n ?? 0), 0);

  return {
    seasonsPlayed: seasons.length,
    retirementAge: career.player.age,
    peakOverall: peakSeason?.overall ?? career.player.overall,
    peakAge: peakSeason?.age ?? career.player.age,
    finalOverall: seasons[seasons.length - 1]?.overall ?? career.player.overall,
    overallByAge: (age) =>
      seasons.filter((s) => s.age <= age).reduce((best, s) => Math.max(best, s.overall), 0),

    totalAppearances,
    totalGoals,
    totalAssists,
    totalCleanSheets,
    bestSeasonGoals,
    bestSeasonAssists,
    bestSeasonCleanSheets,

    trophyCounts,
    totalTrophies,
    distinctTrophyTypes: Object.keys(trophyCounts).length,
    leagueTitles: trophyCounts.league ?? 0,
    cupTitles: trophyCounts.cup ?? 0,
    continentalTitles: (trophyCounts.continental_primary ?? 0) + (trophyCounts.continental_secondary ?? 0),
    clubWorldCups: trophyCounts.club_world_cup ?? 0,
    worldCups: trophyCounts.world_cup ?? 0,
    nationalContinental: trophyCounts.national_continental ?? 0,

    ballonDors,
    goldenBoots,
    totalAwards,

    caps: career.nationalTeamStats.caps,
    nationalGoals: career.nationalTeamStats.goals,
    firstCallUpAge: career.firstCallUpAge,

    clubs,
    clubCount: clubs.length,
    countryCount: new Set(
      seasons
        .map((s) => getLeagueOfTeamAtTier(s.teamId, s.leagueTier)?.country_fifa_code)
        .filter((code): code is string => Boolean(code)),
    ).size,
    loanSpells,
    permanentTransfers,
    legendClubs,
    idolClubs,
    smallestLegendClub:
      legendClubs.length === 0
        ? null
        : legendClubs.reduce((smallest, c) => (c.reputation < smallest.reputation ? c : smallest)),

    relegations,
    promotions,
    seasonsInSecondTier,
    severeInjuryAge: career.headlines.find((h) => h.key === "severeInjury")?.age ?? null,
    suspendedSeasons,

    finalFanSupport: career.fanSupport,
    shirtNumber: career.shirtNumber,
    seasonsWithMarqueeNumber,

    everPlayedForFirstClubAgain:
      firstTeamId !== null && spellOrder.slice(1).includes(firstTeamId),
    retiredAtFirstClub: firstTeamId !== null && firstTeamId === lastTeamId && spellOrder.length > 1,
    firstClub: byId(firstTeamId),
    lastClub: byId(lastTeamId),
  };
}
