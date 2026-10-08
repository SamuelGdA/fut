import {
  type DevelopmentRun,
  FIRST_AGE,
  GROUP_OF,
  LAST_AGE,
  POSITION_GROUPS,
  type PositionGroup,
  TALENT_BANDS,
  type TalentBand,
} from "@craque/engine";
import { maxOf, mean, median, minOf, quantile, share } from "./stats";

/** Uma variação de OVR entre duas temporadas seguidas. */
export interface SeasonDelta {
  readonly age: number;
  readonly delta: number;
  readonly band: TalentBand;
  readonly form: string;
  readonly games: number;
}

export interface PeakSummary {
  readonly careers: number;
  readonly meanPeak: number;
  readonly meanPotential: number;
  /** Média de (pico de OVR - P). */
  readonly gap: number;
}

export interface AgeBucket {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly p10: number;
  readonly median: number;
  readonly p90: number;
}

export interface Metrics {
  readonly careers: number;
  readonly talentShare: Readonly<Record<TalentBand, number>>;
  readonly talentCount: Readonly<Record<TalentBand, number>>;
  readonly prodigyShare: Readonly<Record<"star" | "phenom", number>>;
  readonly peakByBand: Readonly<Record<TalentBand, PeakSummary>>;
  readonly peakGapByGroup: Readonly<Record<PositionGroup, number>>;
  readonly peakAge: { readonly p25: number; readonly median: number; readonly p75: number };
  readonly ovrAtStart: Readonly<Record<TalentBand, number>>;
  /** Chance de um jogador da faixa de cima começar abaixo da mediana da faixa de baixo. */
  readonly startOverlap: ReadonlyArray<{ readonly lower: TalentBand; readonly upper: TalentBand; readonly share: number }>;
  /** Mediana do OVR do fim de cada temporada, por faixa, dos 16 aos 39. */
  readonly ovrCurve: Readonly<Record<TalentBand, readonly number[]>>;
  /** Média do OVR do fim de cada temporada, por faixa: mais estável que a mediana de inteiros. */
  readonly ovrMeanCurve: Readonly<Record<TalentBand, readonly number[]>>;
  readonly deltas: {
    readonly max: number;
    readonly min: number;
    readonly atLeast8: number;
    readonly atLeast10: number;
    readonly bigJumpsMaxAge: number;
    readonly dropAtLeast7: number;
    readonly buckets: readonly AgeBucket[];
  };
  readonly youngGrowth: number;
  readonly lateDecline: number;
  readonly ageReaching80: Readonly<Record<TalentBand, { readonly share: number; readonly medianAge: number }>>;
  readonly formShare: Readonly<Record<"explosion" | "stumble", number>>;
  readonly meanGamesAt: Readonly<Record<"18" | "24" | "30", number>>;
}

const AGE_BUCKETS: ReadonlyArray<readonly [string, number, number]> = [
  ["17 a 19", 17, 19],
  ["20 a 22", 20, 22],
  ["23 a 25", 23, 25],
  ["26 a 29", 26, 29],
  ["30 a 32", 30, 32],
  ["33 a 35", 33, 35],
  ["36 a 39", 36, 39],
];

function peakOf(run: DevelopmentRun): { ovr: number; age: number } {
  let best = { ovr: run.ovrAtStart, age: FIRST_AGE };
  for (const season of run.seasons) if (season.ovr > best.ovr) best = { ovr: season.ovr, age: season.age };
  return best;
}

export function seasonDeltas(run: DevelopmentRun): SeasonDelta[] {
  const deltas: SeasonDelta[] = [];
  let previous = run.ovrAtStart;
  for (const season of run.seasons) {
    deltas.push({
      age: season.age,
      delta: season.ovr - previous,
      band: run.born.talent,
      form: season.form,
      games: season.games,
    });
    previous = season.ovr;
  }
  return deltas;
}

function byBand<T>(build: (band: TalentBand) => T): Record<TalentBand, T> {
  return Object.fromEntries(TALENT_BANDS.map((band) => [band, build(band)])) as Record<TalentBand, T>;
}

export function computeMetrics(runs: readonly DevelopmentRun[]): Metrics {
  const bandRuns = byBand((band) => runs.filter((run) => run.born.talent === band));
  const peaks = runs.map((run) => ({ run, peak: peakOf(run) }));
  const deltas = runs.flatMap(seasonDeltas);

  const peakByBand = byBand<PeakSummary>((band) => {
    const list = peaks.filter((entry) => entry.run.born.talent === band);
    const meanPeak = mean(list.map((entry) => entry.peak.ovr));
    const meanPotential = mean(list.map((entry) => entry.run.born.potential));
    return { careers: list.length, meanPeak, meanPotential, gap: meanPeak - meanPotential };
  });

  const peakGapByGroup = Object.fromEntries(
    POSITION_GROUPS.map((group) => {
      const list = peaks.filter((entry) => GROUP_OF[entry.run.born.position] === group);
      return [group, mean(list.map((entry) => entry.peak.ovr - entry.run.born.potential))];
    }),
  ) as Record<PositionGroup, number>;

  const peakAges = peaks.map((entry) => entry.peak.age);

  const ovrAtStart = byBand((band) =>
    median(bandRuns[band].filter((run) => !run.born.prodigy).map((run) => run.ovrAtStart)),
  );

  const startOverlap = TALENT_BANDS.slice(1).map((upper, index) => {
    const lower = TALENT_BANDS[index] as TalentBand;
    const lowerMedian = ovrAtStart[lower];
    const uppers = bandRuns[upper].filter((run) => !run.born.prodigy);
    return { lower, upper, share: share(uppers, (run) => run.ovrAtStart <= lowerMedian) };
  });

  const ovrCurve = byBand((band) => {
    const curve: number[] = [];
    for (let age = FIRST_AGE; age <= LAST_AGE; age += 1) {
      const index = age - FIRST_AGE;
      curve.push(median(bandRuns[band].map((run) => run.seasons[index]?.ovr ?? Number.NaN)));
    }
    return curve;
  });

  const ovrMeanCurve = byBand((band) => {
    const curve: number[] = [];
    for (let age = FIRST_AGE; age <= LAST_AGE; age += 1) {
      const index = age - FIRST_AGE;
      curve.push(mean(bandRuns[band].map((run) => run.seasons[index]?.ovr ?? Number.NaN)));
    }
    return curve;
  });

  const values = deltas.map((entry) => entry.delta);
  const bigJumps = deltas.filter((entry) => entry.delta >= 8);
  const buckets: AgeBucket[] = AGE_BUCKETS.map(([label, from, to]) => {
    const list = deltas.filter((entry) => entry.age >= from && entry.age <= to).map((entry) => entry.delta);
    return { label, from, to, p10: quantile(list, 0.1), median: median(list), p90: quantile(list, 0.9) };
  });

  const highBands: readonly TalentBand[] = ["class", "star", "phenom"];
  const youngGrowth = median(
    deltas.filter((entry) => entry.age >= 17 && entry.age <= 19 && highBands.includes(entry.band)).map((e) => e.delta),
  );
  const lateDecline = median(deltas.filter((entry) => entry.age >= 33 && entry.age <= 35).map((entry) => entry.delta));

  const ageReaching80 = byBand((band) => {
    const ages = bandRuns[band]
      .map((run) => run.seasons.find((season) => season.ovr >= 80)?.age)
      .filter((age): age is number => age !== undefined);
    return { share: ages.length / Math.max(1, bandRuns[band].length), medianAge: median(ages) };
  });

  const allSeasons = runs.flatMap((run) => run.seasons);
  const gamesAt = (age: number) => mean(allSeasons.filter((season) => season.age === age).map((season) => season.games));

  return {
    careers: runs.length,
    talentShare: byBand((band) => bandRuns[band].length / runs.length),
    talentCount: byBand((band) => bandRuns[band].length),
    prodigyShare: {
      star: share(bandRuns.star, (run) => run.born.prodigy),
      phenom: share(bandRuns.phenom, (run) => run.born.prodigy),
    },
    peakByBand,
    peakGapByGroup,
    peakAge: { p25: quantile(peakAges, 0.25), median: median(peakAges), p75: quantile(peakAges, 0.75) },
    ovrAtStart,
    startOverlap,
    ovrCurve,
    ovrMeanCurve,
    deltas: {
      max: maxOf(values),
      min: minOf(values),
      atLeast8: bigJumps.length / values.length,
      atLeast10: share(values, (value) => value >= 10),
      bigJumpsMaxAge: bigJumps.length > 0 ? maxOf(bigJumps.map((entry) => entry.age)) : Number.NaN,
      dropAtLeast7: share(values, (value) => value <= -7),
      buckets,
    },
    youngGrowth,
    lateDecline,
    ageReaching80,
    formShare: {
      explosion: share(allSeasons, (season) => season.form === "explosion"),
      stumble: share(allSeasons, (season) => season.form === "stumble"),
    },
    meanGamesAt: { "18": gamesAt(18), "24": gamesAt(24), "30": gamesAt(30) },
  };
}
