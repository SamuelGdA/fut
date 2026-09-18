import { attributeKeysFor, roundedAttributes } from "@/lib/sim/attributes";
import { buildBioFacts } from "@/lib/bio/facts";
import { getLeagueOfTeam } from "@/lib/data/dataset";
import type { CareerState } from "@/lib/sim/career";
import type { PositionCode } from "@/lib/sim/constants";
import { aggregateCorpus } from "../corpus";
import { playCareer } from "../play";
import { rate, share, spread, round, type Spread } from "../stats";

/**
 * The statistical mirror: what the game feels like, as numbers.
 *
 * Where the fingerprints answer "is this the same game", this answers "is it
 * still the same balance". The two fail in different ways and that is the
 * point. A refactor that reorders two RNG draws breaks every fingerprint and
 * changes none of these, which is a rewrite that needs a decision rather than
 * a bug. A tuning change does the reverse.
 *
 * The `targets` block is the part that is written down in
 * docs/REQUISITOS.md section 25.6 and section 54, and is the only part with
 * an opinion attached. Everything else is recorded so that drift is visible,
 * not because a specific value was ever designed.
 */

export interface AggregateReport {
  corpusSize: number;
  stalled: number;
  /** The measurements the design has an explicit opinion about. */
  targets: Record<string, number>;
  talentByDifficulty: Record<string, Record<string, { count: number; pct: number }>>;
  peakOverallByTier: Record<string, Spread>;
  peakOverallByPosition: Record<string, Spread>;
  cardByPosition: Record<string, Record<string, Spread>>;
  outputByRole: Record<string, Record<string, Spread>>;
  trophies: Record<string, Spread>;
  awards: Record<string, Spread>;
  awardStreaks: Record<string, Spread>;
  recordsBroken: Record<string, { count: number; pct: number }>;
  career: Record<string, Spread>;
  retirementReasons: Record<string, { count: number; pct: number }>;
  confederationShare: Record<string, { count: number; pct: number }>;
}

interface Row {
  state: CareerState;
  position: PositionCode;
  role: string;
  tier: string;
  difficulty: string;
  peakOverall: number;
  peakAttributes: Record<string, number>;
  totals: { appearances: number; goals: number; assists: number; cleanSheets: number };
  trophyCounts: Record<string, number>;
  ballonDors: number;
  goldenBoots: number;
  goldenGloves: number;
  longestBallonStreak: number;
  longestBootStreak: number;
  playedInUefa: boolean;
  brokenRecordIds: string[];
  clubs: number;
  countries: number;
  relegations: number;
  promotions: number;
  secondTierSeasons: number;
}

function longestStreak(state: CareerState, award: string): number {
  let best = 0;
  let run = 0;
  for (const season of state.seasons) {
    if (season.awards.includes(award as never)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

function buildRow(state: CareerState): Row {
  const position = state.player.position;
  const peakSeason = state.seasons.reduce<(typeof state.seasons)[number] | null>(
    (best, season) => (!best || season.overall > best.overall ? season : best),
    null,
  );

  const totals = { appearances: 0, goals: 0, assists: 0, cleanSheets: 0 };
  const trophyCounts: Record<string, number> = {};
  let ballonDors = 0;
  let goldenBoots = 0;
  let goldenGloves = 0;
  let relegations = 0;
  let promotions = 0;
  let secondTierSeasons = 0;
  let playedInUefa = false;

  for (const season of state.seasons) {
    totals.appearances += season.stats.appearances;
    totals.goals += season.stats.goals;
    totals.assists += season.stats.assists;
    totals.cleanSheets += season.stats.cleanSheets;
    for (const key of season.trophies) trophyCounts[key] = (trophyCounts[key] ?? 0) + 1;
    for (const award of season.awards) {
      if (award === "ballon_dor") ballonDors += 1;
      if (award === "golden_boot") goldenBoots += 1;
      if (award === "golden_glove") goldenGloves += 1;
    }
    if (season.relegated) relegations += 1;
    if (season.promoted) promotions += 1;
    if (season.leagueTier === 2) secondTierSeasons += 1;
    if (getLeagueOfTeam(season.teamId)?.confederation === "UEFA") playedInUefa = true;
  }

  const facts = buildBioFacts(state, "pt");

  return {
    state,
    position,
    role: state.player.role,
    tier: state.player.talentTier,
    difficulty: state.difficulty,
    peakOverall: peakSeason?.overall ?? state.player.overall,
    peakAttributes: roundedAttributes(
      peakSeason?.attributes ?? state.player.attributes,
      position,
    ),
    totals,
    trophyCounts,
    ballonDors,
    goldenBoots,
    goldenGloves,
    longestBallonStreak: longestStreak(state, "ballon_dor"),
    longestBootStreak: longestStreak(state, "golden_boot"),
    playedInUefa,
    brokenRecordIds: facts.brokenRecords.map((broken) => broken.id),
    clubs: new Set(state.seasons.map((season) => season.teamId)).size,
    countries: facts.countriesPlayedIn,
    relegations,
    promotions,
    secondTierSeasons,
  };
}

function groupSpread<T extends string>(
  rows: Row[],
  key: (row: Row) => T,
  value: (row: Row) => number,
): Record<string, Spread> {
  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const bucket = buckets.get(key(row)) ?? [];
    bucket.push(value(row));
    buckets.set(key(row), bucket);
  }
  const out: Record<string, Spread> = {};
  for (const name of [...buckets.keys()].sort()) out[name] = spread(buckets.get(name)!);
  return out;
}

/**
 * The four numbers the design argues about, isolated so a tuning session can
 * read them without wading through everything else.
 */
function buildTargets(rows: Row[]): Record<string, number> {
  const generational = rows.filter((row) => row.tier === "generational");
  const generationalInEurope = generational.filter((row) => row.playedInUefa);
  const hard = rows.filter((row) => row.difficulty === "hard");
  const hardTiers = share(hard.map((row) => row.tier));

  return {
    // Section 25.6: the record is 8, and beating it should be rare but real.
    ballonDorRecordPctOfGenerational: rate(
      generational.length,
      generational.filter((row) => row.ballonDors >= 8).length,
    ),
    // The real record is four in a row.
    fourInARowPctOfGenerational: rate(
      generational.length,
      generational.filter((row) => row.longestBallonStreak >= 4).length,
    ),
    // The record is six, and it is only reachable from Europe.
    goldenBootRecordPctOfGenerationalInEurope: rate(
      generationalInEurope.length,
      generationalInEurope.filter((row) => row.goldenBoots >= 6).length,
    ),
    medianBallonDorsOfGenerational: spread(generational.map((row) => row.ballonDors)).median,
    maxBallonDors: spread(rows.map((row) => row.ballonDors)).max,
    maxBallonStreak: spread(rows.map((row) => row.longestBallonStreak)).max,
    maxGoldenBoots: spread(rows.map((row) => row.goldenBoots)).max,

    // Section 4.2: hard mode renormalises to roughly 45/34/15/4/1.
    hardProspectPct: hardTiers["prospect"]?.pct ?? 0,
    hardTalentPct: hardTiers["talent"]?.pct ?? 0,
    hardStarPct: hardTiers["star"]?.pct ?? 0,
    hardPhenomenonPct: hardTiers["phenomenon"]?.pct ?? 0,
    hardGenerationalPct: hardTiers["generational"]?.pct ?? 0,

    // Nothing may reach the top of the scale by accident.
    careersWithA99Pct: rate(
      rows.length,
      rows.filter((row) => Object.values(row.peakAttributes).some((value) => value >= 99)).length,
    ),
    peakOverallP90: spread(rows.map((row) => row.peakOverall)).p90,
  };
}

export function runAggregate(): AggregateReport {
  const specs = aggregateCorpus();
  const rows: Row[] = [];
  let stalled = 0;

  for (const spec of specs) {
    const played = playCareer(spec);
    if (played.stalled) stalled += 1;
    // A career that never got a season is a legitimate outcome (retired at 26
    // below 50 overall) but tells the distributions nothing.
    if (played.state.seasons.length === 0) continue;
    rows.push(buildRow(played.state));
  }

  const talentByDifficulty: AggregateReport["talentByDifficulty"] = {};
  for (const difficulty of ["normal", "hard"]) {
    talentByDifficulty[difficulty] = share(
      rows.filter((row) => row.difficulty === difficulty).map((row) => row.tier),
    );
  }

  const cardByPosition: AggregateReport["cardByPosition"] = {};
  const positions = [...new Set(rows.map((row) => row.position))].sort();
  for (const position of positions) {
    const inPosition = rows.filter((row) => row.position === position);
    const perAttribute: Record<string, Spread> = {};
    for (const key of attributeKeysFor(position)) {
      perAttribute[key] = spread(inPosition.map((row) => row.peakAttributes[key] ?? 0));
    }
    perAttribute["overall"] = spread(inPosition.map((row) => row.peakOverall));
    cardByPosition[position] = perAttribute;
  }

  const outputByRole: AggregateReport["outputByRole"] = {};
  for (const role of [...new Set(rows.map((row) => row.role))].sort()) {
    const inRole = rows.filter((row) => row.role === role);
    outputByRole[role] = {
      appearances: spread(inRole.map((row) => row.totals.appearances)),
      goals: spread(inRole.map((row) => row.totals.goals)),
      assists: spread(inRole.map((row) => row.totals.assists)),
      cleanSheets: spread(inRole.map((row) => row.totals.cleanSheets)),
      goalsPerGame: spread(
        inRole.map((row) =>
          row.totals.appearances > 0 ? row.totals.goals / row.totals.appearances : 0,
        ),
      ),
    };
  }

  const trophyKeys = [...new Set(rows.flatMap((row) => Object.keys(row.trophyCounts)))].sort();
  const trophies: Record<string, Spread> = {
    total: spread(
      rows.map((row) => Object.values(row.trophyCounts).reduce((sum, n) => sum + n, 0)),
    ),
  };
  for (const key of trophyKeys) {
    trophies[key] = spread(rows.map((row) => row.trophyCounts[key] ?? 0));
  }

  const recordIds = [...new Set(rows.flatMap((row) => row.brokenRecordIds))].sort();
  const recordsBroken: AggregateReport["recordsBroken"] = {};
  for (const id of recordIds) {
    const count = rows.filter((row) => row.brokenRecordIds.includes(id)).length;
    recordsBroken[id] = { count, pct: round((count / rows.length) * 100, 2) };
  }

  return {
    corpusSize: specs.length,
    stalled,
    targets: buildTargets(rows),
    talentByDifficulty,
    peakOverallByTier: groupSpread(rows, (row) => row.tier, (row) => row.peakOverall),
    peakOverallByPosition: groupSpread(rows, (row) => row.position, (row) => row.peakOverall),
    cardByPosition,
    outputByRole,
    trophies,
    awards: {
      ballonDor: spread(rows.map((row) => row.ballonDors)),
      goldenBoot: spread(rows.map((row) => row.goldenBoots)),
      goldenGlove: spread(rows.map((row) => row.goldenGloves)),
    },
    awardStreaks: {
      ballonDor: spread(rows.map((row) => row.longestBallonStreak)),
      goldenBoot: spread(rows.map((row) => row.longestBootStreak)),
    },
    recordsBroken,
    career: {
      seasons: spread(rows.map((row) => row.state.seasons.length)),
      clubs: spread(rows.map((row) => row.clubs)),
      countries: spread(rows.map((row) => row.countries)),
      caps: spread(rows.map((row) => row.state.nationalTeamStats.caps)),
      fanSupport: spread(rows.map((row) => Math.round(row.state.fanSupport))),
      relegations: spread(rows.map((row) => row.relegations)),
      promotions: spread(rows.map((row) => row.promotions)),
      secondTierSeasons: spread(rows.map((row) => row.secondTierSeasons)),
    },
    retirementReasons: share(rows.map((row) => row.state.retirementReason ?? "none")),
    confederationShare: share(
      rows.flatMap((row) =>
        row.state.seasons
          .map((season) => getLeagueOfTeam(season.teamId)?.confederation ?? "")
          .filter((conf) => conf.length > 0),
      ),
    ),
  };
}
