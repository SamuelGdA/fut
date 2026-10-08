import { FIRST_AGE, PRODIGY_CHANCE, TALENT_BANDS, TALENT_ODDS, type Difficulty, type TalentBand } from "@craque/engine";
import type { Metrics } from "./metrics";
import { maxOf, minOf, proportionError } from "./stats";

/**
 * As metas da evolução (GDD 40.1, parte do jogador). Cada uma é uma faixa
 * fixa: o harness não ajusta meta, ajusta coeficiente.
 */

export interface TargetResult {
  readonly id: string;
  readonly label: string;
  readonly target: string;
  readonly measured: string;
  readonly pass: boolean;
}

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const num = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");
const signed = (value: number, digits = 1) => `${value > 0 ? "+" : ""}${num(value, digits)}`;

const BAND_NAME: Readonly<Record<TalentBand, string>> = {
  journeyman: "Operário",
  prospect: "Promissor",
  class: "Craque",
  star: "Estrela",
  phenom: "Fenômeno",
};

export function bandName(band: TalentBand): string {
  return BAND_NAME[band];
}

/** Tolerância de uma proporção: 1,5 ponto ou três desvios da amostra, o que for maior. */
function proportionTolerance(expected: number, samples: number): number {
  return Math.max(0.015, 3 * proportionError(expected, samples));
}

export function talentTargets(metrics: Metrics, difficulty: Difficulty): TargetResult[] {
  const odds = TALENT_ODDS[difficulty];
  const misses = TALENT_BANDS.filter((band) => {
    const expected = odds[band] / 100;
    return Math.abs(metrics.talentShare[band] - expected) > proportionTolerance(expected, metrics.careers);
  });
  return [
    {
      id: `talent-${difficulty}`,
      label: `Distribuição de talento, ${difficulty === "normal" ? "Normal" : "Difícil"}`,
      target: TALENT_BANDS.map((band) => odds[band]).join(" / "),
      measured: TALENT_BANDS.map((band) => (metrics.talentShare[band] * 100).toFixed(1)).join(" / "),
      pass: misses.length === 0,
    },
  ];
}

export function evolutionTargets(metrics: Metrics): TargetResult[] {
  const results: TargetResult[] = [];

  const gaps = TALENT_BANDS.map((band) => metrics.peakByBand[band].gap);
  results.push({
    id: "peak-vs-potential",
    label: "Pico médio de OVR menos o potencial, por faixa",
    target: "entre -2 e +2 em todas",
    measured: TALENT_BANDS.map((band, index) => `${bandName(band)} ${signed(gaps[index] ?? Number.NaN)}`).join(", "),
    pass: gaps.every((gap) => gap >= -2 && gap <= 2),
  });

  const groupGaps = Object.values(metrics.peakGapByGroup);
  const spread = maxOf(groupGaps) - minOf(groupGaps);
  results.push({
    id: "position-fairness",
    label: "Justiça entre posições: diferença do pico relativo entre grupos",
    target: "no máximo 2 pontos",
    measured: num(spread),
    pass: spread <= 2,
  });

  results.push({
    id: "peak-age",
    label: "Idade do pico de OVR (mediana)",
    target: "entre 26 e 29",
    measured: `${num(metrics.peakAge.median)} (quartis ${num(metrics.peakAge.p25)} a ${num(metrics.peakAge.p75)})`,
    pass: metrics.peakAge.median >= 26 && metrics.peakAge.median <= 29,
  });

  results.push({
    id: "no-ten-jump",
    label: "Maior subida de OVR numa temporada",
    target: "no máximo +9",
    measured: signed(metrics.deltas.max, 0),
    pass: metrics.deltas.max <= 9,
  });

  results.push({
    id: "rare-eight-jump",
    label: "Temporadas com subida de 8 ou mais",
    target: "no máximo 1% das temporadas",
    measured: pct(metrics.deltas.atLeast8, 2),
    pass: metrics.deltas.atLeast8 <= 0.01,
  });

  results.push({
    id: "big-jumps-young",
    label: "Subidas de 8 ou mais só na juventude",
    target: "até os 21 anos",
    measured: Number.isFinite(metrics.deltas.bigJumpsMaxAge) ? `até os ${metrics.deltas.bigJumpsMaxAge}` : "nenhuma",
    pass: !Number.isFinite(metrics.deltas.bigJumpsMaxAge) || metrics.deltas.bigJumpsMaxAge <= 21,
  });

  results.push({
    id: "young-growth",
    label: "Crescimento típico de Craque, Estrela e Fenômeno dos 17 aos 19 (mediana por temporada)",
    target: "entre +3 e +7",
    measured: signed(metrics.youngGrowth),
    pass: metrics.youngGrowth >= 3 && metrics.youngGrowth <= 7,
  });

  results.push({
    id: "late-decline",
    label: "Declínio típico dos 33 aos 35 (mediana por temporada)",
    target: "entre -4 e -1,5",
    measured: signed(metrics.lateDecline),
    pass: metrics.lateDecline >= -4 && metrics.lateDecline <= -1.5,
  });

  results.push({
    id: "no-cliff",
    label: "Temporadas com queda de 7 ou mais, sem lesão",
    target: "nenhuma",
    measured: `${pct(metrics.deltas.dropAtLeast7, 2)} (pior ${signed(metrics.deltas.min, 0)})`,
    pass: metrics.deltas.dropAtLeast7 === 0,
  });

  const overlaps = metrics.startOverlap.map((entry) => entry.share);
  results.push({
    id: "start-overlap",
    label: "Aos 16, faixas vizinhas se confundem (sem prodígios)",
    target: "pelo menos 15% da faixa de cima começa abaixo da mediana da de baixo",
    measured: metrics.startOverlap
      .map((entry) => `${bandName(entry.upper)}/${bandName(entry.lower)} ${pct(entry.share, 0)}`)
      .join(", "),
    pass: overlaps.every((value) => value >= 0.15),
  });

  const starTolerance = 3 * proportionError(PRODIGY_CHANCE.star, metrics.talentCount.star);
  const phenomTolerance = 3 * proportionError(PRODIGY_CHANCE.phenom, metrics.talentCount.phenom);
  results.push({
    id: "prodigy-rate",
    label: "Prodígios entre Estrelas e Fenômenos",
    target: `${pct(PRODIGY_CHANCE.star, 0)} e ${pct(PRODIGY_CHANCE.phenom, 0)}`,
    measured: `${pct(metrics.prodigyShare.star)} e ${pct(metrics.prodigyShare.phenom)}`,
    pass:
      Math.abs(metrics.prodigyShare.star - PRODIGY_CHANCE.star) <= starTolerance &&
      Math.abs(metrics.prodigyShare.phenom - PRODIGY_CHANCE.phenom) <= phenomTolerance,
  });

  return results;
}

/**
 * Os dois ritmos jogam o mesmo futebol (GDD 3.1): treino e regras contam
 * temporadas, não decisões. Compara o mesmo lote de sementes nos dois ritmos.
 */
export function paceTargets(intense: Metrics, normal: Metrics): TargetResult[] {
  const index = 21 - FIRST_AGE;
  const peakGaps = TALENT_BANDS.map((band) => Math.abs(intense.peakByBand[band].gap - normal.peakByBand[band].gap));
  const youngGaps = TALENT_BANDS.map((band) =>
    Math.abs((intense.ovrMeanCurve[band][index] ?? 0) - (normal.ovrMeanCurve[band][index] ?? 0)),
  );
  const worstPeak = maxOf(peakGaps);
  const worstYoung = maxOf(youngGaps);
  return [
    {
      id: "pace-parity",
      label: "Os dois ritmos dão o mesmo jogador (Intensa contra Normal)",
      target: "pico médio e OVR médio aos 21 a no máximo 0,6 de diferença, em todas as faixas",
      measured: `pico ${num(worstPeak, 2)}, aos 21 ${num(worstYoung, 2)}`,
      pass: worstPeak <= 0.6 && worstYoung <= 0.6,
    },
  ];
}

/** Idade em que se compara o Difícil com o Normal: o meio do crescimento. */
const HARD_COMPARE_AGE = 21;

/**
 * O Difícil não baixa o teto: o talento continua decidindo até onde se chega.
 * Ele torna o caminho mais lento e o auge mais curto, e o talento grande mais
 * raro (GDD 3.2).
 */
export function hardTargets(metrics: Metrics, normal: Metrics): TargetResult[] {
  const results = talentTargets(metrics, "hard");
  const index = HARD_COMPARE_AGE - FIRST_AGE;
  const slower = TALENT_BANDS.map((band) => (normal.ovrCurve[band][index] ?? 0) - (metrics.ovrCurve[band][index] ?? 0));
  results.push({
    id: "hard-slower",
    label: `No Difícil, o OVR mediano aos ${HARD_COMPARE_AGE} anos fica abaixo do Normal na mesma faixa`,
    target: "pelo menos 1 ponto abaixo em todas as faixas",
    measured: TALENT_BANDS.map((band, position) => `${bandName(band)} -${num(slower[position] ?? Number.NaN, 0)}`).join(", "),
    pass: slower.every((gap) => gap >= 1),
  });
  const gaps = TALENT_BANDS.map((band) => metrics.peakByBand[band].gap);
  results.push({
    id: "hard-peak",
    label: "No Difícil, pico médio de OVR menos o potencial",
    target: "entre -3 e +2 em todas as faixas",
    measured: TALENT_BANDS.map((band, position) => `${bandName(band)} ${signed(gaps[position] ?? Number.NaN)}`).join(", "),
    pass: gaps.every((gap) => gap >= -3 && gap <= 2),
  });
  results.push({
    id: "hard-no-ten-jump",
    label: "No Difícil, maior subida numa temporada",
    target: "no máximo +9",
    measured: signed(metrics.deltas.max, 0),
    pass: metrics.deltas.max <= 9,
  });
  return results;
}
