import type { Policy } from "./run";
import type { CareerSummary } from "./worker";

/** Números das carreiras simuladas que as metas e o relatório usam. */

export interface PolicyStats {
  readonly policy: Policy;
  readonly careers: number;
  readonly seasons: number;
  readonly dismissals: number;
  readonly objectiveMet: number;
  readonly promotions: number;
  readonly relegations: number;
  readonly titles: number;
  readonly majorTitles: number;
  readonly finalReputation: number;
  readonly purchaseSeasons: number;
  readonly purchases: number;
  readonly purchaseTries: number;
  readonly available: number;
  readonly firstSeasonDismissals: number;
}

export interface LeagueStats {
  readonly id: string;
  readonly division: number;
  readonly seasons: number;
  readonly strongestShare: number;
  readonly topThreeShare: number;
  readonly championPoints: number;
  readonly distinctChampions: number;
  readonly strengthStart: number;
  readonly strengthEnd: number;
}

export interface CareerMetrics {
  readonly careers: number;
  readonly seasons: number;
  readonly errors: readonly string[];
  readonly msPerSeason: number;
  readonly byPolicy: readonly PolicyStats[];
  readonly leagues: readonly LeagueStats[];
  readonly strongestShare: number;
  readonly clubWorldCups: number;
  readonly clubWorldCupEurope: number;
  readonly clubWorldCupFinalsWithSouth: number;
  readonly intercontinentals: number;
  readonly intercontinentalEurope: number;
  readonly squadInRange: number;
  readonly squadMin: number;
  readonly squadMax: number;
  readonly activeStart: number;
  readonly activeEnd: number;
  readonly injuriesPerSeason: number;
  readonly seriousShare: number;
  readonly injuryDaysPerSeason: number;
  readonly fastSeasonMs: number;
  readonly slowSeasonMs: number;
}

const mean = (values: readonly number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : Number.NaN);

export function computeCareerMetrics(summaries: readonly CareerSummary[]): CareerMetrics {
  const seasons = summaries.flatMap((summary) => summary.seasons.map((season) => ({ summary, season })));
  const errors = summaries.flatMap((summary) => summary.errors.map((error) => `${summary.options.seed}: ${error}`));
  const policies = [...new Set(summaries.map((summary) => summary.options.policy))];
  const byPolicy: PolicyStats[] = policies.map((policy) => {
    const own = seasons.filter(({ summary }) => summary.options.policy === policy);
    const coach = own.map(({ season }) => season.coach).filter((value) => value !== null);
    return {
      policy,
      careers: summaries.filter((summary) => summary.options.policy === policy).length,
      seasons: coach.length,
      dismissals: coach.filter((entry) => entry.dismissed).length / Math.max(1, coach.length),
      objectiveMet: coach.filter((entry) => entry.met).length / Math.max(1, coach.length),
      promotions: coach.filter((entry) => entry.promoted).length,
      relegations: coach.filter((entry) => entry.relegated).length,
      titles: coach.reduce((total, entry) => total + entry.titles, 0),
      majorTitles: coach.reduce((total, entry) => total + entry.majorTitles, 0),
      finalReputation: mean(
        summaries.filter((summary) => summary.options.policy === policy).map((summary) => summary.seasons[summary.seasons.length - 1]?.coach?.reputation ?? 0),
      ),
      purchaseSeasons: coach.filter((entry) => entry.purchases > 0).length / Math.max(1, coach.length),
      purchases: coach.reduce((total, entry) => total + entry.purchases, 0),
      purchaseTries: coach.reduce((total, entry) => total + entry.purchaseTries, 0),
      available: coach.reduce((total, entry) => total + (entry.available ?? 0), 0),
      firstSeasonDismissals:
        own.filter(({ season }) => season.seasonIndex === 0 && season.coach?.dismissed).length /
        Math.max(1, own.filter(({ season }) => season.seasonIndex === 0).length),
    };
  });

  const leagueIds = [...new Set(seasons.flatMap(({ season }) => season.leagues.map((league) => league.id)))].sort();
  const leagues: LeagueStats[] = leagueIds.map((id) => {
    const rows = seasons.flatMap(({ season }) => season.leagues.filter((league) => league.id === id));
    const first = summaries.map((summary) => summary.seasons[0]?.leagues.find((league) => league.id === id)?.meanStrength ?? Number.NaN);
    const last = summaries.map((summary) => summary.seasons[summary.seasons.length - 1]?.leagues.find((league) => league.id === id)?.meanStrength ?? Number.NaN);
    const champions = summaries.map((summary) => new Set(summary.seasons.flatMap((season) => season.leagues.filter((league) => league.id === id).map((league) => league.champion))).size);
    return {
      id,
      division: rows[0]?.division ?? 1,
      seasons: rows.length,
      strongestShare: rows.filter((row) => row.championRank === 1).length / Math.max(1, rows.length),
      topThreeShare: rows.filter((row) => row.championRank <= 3).length / Math.max(1, rows.length),
      championPoints: mean(rows.map((row) => row.championPoints)),
      distinctChampions: mean(champions),
      strengthStart: mean(first.filter(Number.isFinite)),
      strengthEnd: mean(last.filter(Number.isFinite)),
    };
  });
  const firstDivision = seasons.flatMap(({ season }) => season.leagues.filter((league) => league.division === 1));

  const cwc = seasons.map(({ season }) => season.clubWorldCup).filter((value) => value !== null);
  const inter = seasons.map(({ season }) => season.intercontinental).filter((value) => value !== null);
  const sizes = seasons.flatMap(({ season }) => season.squadSizes);
  const coach = seasons.map(({ season }) => season.coach).filter((value) => value !== null);
  const injuries = coach.reduce((total, entry) => total + entry.injuries, 0);
  const seasonMs = (mode: string) => {
    const own = summaries.filter((summary) => summary.options.mode === mode && summary.seasons.length > 0);
    return mean(own.map((summary) => summary.ms / summary.seasons.length));
  };

  return {
    careers: summaries.length,
    seasons: seasons.length,
    errors,
    msPerSeason: mean(summaries.map((summary) => summary.ms / Math.max(1, summary.seasons.length))),
    byPolicy,
    leagues,
    strongestShare: firstDivision.filter((row) => row.championRank === 1).length / Math.max(1, firstDivision.length),
    clubWorldCups: cwc.length,
    clubWorldCupEurope: cwc.filter((entry) => entry.winner === "UEFA").length / Math.max(1, cwc.length),
    clubWorldCupFinalsWithSouth: cwc.filter((entry) => entry.winner === "CONMEBOL" || entry.runnerUp === "CONMEBOL").length / Math.max(1, cwc.length),
    intercontinentals: inter.length,
    intercontinentalEurope: inter.filter((entry) => entry.winner === "UEFA").length / Math.max(1, inter.length),
    squadInRange: sizes.filter((size) => size >= 22 && size <= 34).length / Math.max(1, sizes.length),
    squadMin: sizes.reduce((low, size) => Math.min(low, size), Number.POSITIVE_INFINITY),
    squadMax: sizes.reduce((high, size) => Math.max(high, size), 0),
    activeStart: mean(summaries.map((summary) => summary.seasons[0]?.activePlayers ?? Number.NaN)),
    activeEnd: mean(summaries.map((summary) => summary.seasons[summary.seasons.length - 1]?.activePlayers ?? Number.NaN)),
    injuriesPerSeason: injuries / Math.max(1, coach.length),
    seriousShare: coach.reduce((total, entry) => total + entry.seriousInjuries, 0) / Math.max(1, injuries),
    injuryDaysPerSeason: coach.reduce((total, entry) => total + entry.injuryDays, 0) / Math.max(1, coach.length),
    fastSeasonMs: seasonMs("fast"),
    slowSeasonMs: seasonMs("slow"),
  };
}
