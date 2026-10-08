import {
  autoplay,
  type CareerPolicy,
  challengeSetup,
  challengeStatus,
  createCareer,
  dailyHand,
  drawTalent,
  EDICTS,
  edictState,
  MISSION_TARGETS,
  missionFitsPosition,
  MISSIONS,
  POSITIONS,
  shiftChallengeDay,
  stream,
  TALENT_BANDS,
  type TalentBand,
} from "@craque/engine";
import { PLAYABLE_COUNTRIES } from "@craque/world";
import { mean, median, proportionError, quantile, share } from "./stats";
import { bandName, type TargetResult } from "./targets";

/**
 * O Desafio do dia no harness (GDD 27.3 e 40.1):
 *
 * - **calibragem**: carreiras com as regras do desafio (Difícil, Normal,
 *   aposentar a partir dos 27) em cada faixa de talento, medindo as 36
 *   missões; o alvo de cada faixa é o percentil 65 do jogo comum, então quem
 *   persegue a missão chega lá bem mais vezes;
 * - **relatório**: dez anos de mãos (todas válidas), a taxa de cumprimento
 *   de cada missão com os alvos gravados, e tentativas de verdade de dias de
 *   verdade, com a pontuação.
 */

/** O percentil do jogo comum que vira alvo: o jogo comum cumpre cerca de 35%. */
export const TARGET_QUANTILE = 0.65;
const TARGET_SHARE = 1 - TARGET_QUANTILE;
/** Abaixo disto a missão sai das mãos daquela faixa (alvo zero): não há o que perseguir. */
const MIN_TARGET = 1;
/**
 * Evento raro (um título continental, uma artilharia): o percentil 65 é zero,
 * mas se pelo menos esta fração da faixa chega a um, o alvo é 1. Abaixo
 * disso, a missão fica fora das mãos daquela faixa.
 */
const RARE_SHARE = 0.15;
/**
 * Acima disto o alvo é fácil demais para valer missão: quando a distribuição
 * pula de "quase todo mundo" para "quase ninguém" (o maior salto de um
 * Operário, a idade final), nenhum degrau fica entre 15% e 55%, e a missão sai
 * da faixa em vez de virar presente.
 */
const EASY_SHARE = 0.55;
/** Políticas que fazem as tentativas: jogadores comuns, que não perseguem missão. */
const ATTEMPT_POLICIES: readonly CareerPolicy[] = ["balanced", "ambitious"];

export interface CalibrationRun {
  readonly band: TalentBand;
  readonly measures: Readonly<Record<string, number>>;
  /** Éditos que o jogo comum quebrou nesta carreira. */
  readonly brokenEdicts: readonly string[];
}

/** Sementes cujo jogador nasce na faixa pedida, no Difícil do desafio. */
function seedsForBand(base: string, band: TalentBand, count: number): string[] {
  const seeds: string[] = [];
  for (let index = 0; seeds.length < count && index < count * 400; index += 1) {
    const seed = `${base}:${band}:${index}`;
    if (drawTalent(stream(seed, "birth", "talent"), "hard") === band) seeds.push(seed);
  }
  return seeds;
}

/** Carreiras de calibragem: posições e países em rodízio, as duas políticas comuns. */
export function runCalibration(base: string, perBand: number): CalibrationRun[] {
  const runs: CalibrationRun[] = [];
  for (const band of TALENT_BANDS) {
    seedsForBand(base, band, perBand).forEach((seed, index) => {
      const position = POSITIONS[index % POSITIONS.length] ?? "st";
      const nationality = PLAYABLE_COUNTRIES[(index * 7) % PLAYABLE_COUNTRIES.length] ?? "BRA";
      const career = autoplay(
        createCareer({
          seed,
          startYear: 2026,
          pace: "normal",
          difficulty: "hard",
          challengeId: "2026-01-01",
          identity: { surname: "CALIBRA", foot: "right", nationality, position, dreamNumber: null },
        }),
        ATTEMPT_POLICIES[index % ATTEMPT_POLICIES.length] ?? "balanced",
      );
      const measures: Record<string, number> = {};
      for (const item of MISSIONS) if (missionFitsPosition(item, position)) measures[item.id] = item.measure(career);
      const brokenEdicts = EDICTS.filter((edict) => edictState(edict, career) === "broken").map((edict) => edict.id);
      runs.push({ band, measures, brokenEdicts });
    });
  }
  return runs;
}

/** Alvo "redondo": inteiro, de 5 em 5 a partir de 50, de 10 em 10 a partir de 200. */
export function niceTarget(value: number): number {
  if (value < MIN_TARGET) return 0;
  if (value >= 200) return Math.round(value / 10) * 10;
  if (value >= 50) return Math.round(value / 5) * 5;
  return Math.max(MIN_TARGET, Math.round(value));
}

/**
 * O alvo em que o jogo comum chega mais perto de cumprir 35%. Em contagem
 * pequena (promoções, clubes, idade final), o percentil cru erra feio: com
 * alvo 1, "uma promoção" seria cumprida por 73%. Por isso olha cada degrau da
 * distribuição, e só aceita degraus cumpridos por 15% a 55% do jogo comum.
 * Sem nenhum degrau nessa faixa, a missão sai da faixa de talento.
 */
function targetFor(values: readonly number[]): number {
  const candidates = [...new Set(values.filter((value) => value >= MIN_TARGET).map(niceTarget))].sort((a, b) => a - b);
  let chosen = 0;
  let gap = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const reached = share(values, (value) => value >= candidate);
    if (reached < RARE_SHARE || reached > EASY_SHARE) continue;
    const distance = Math.abs(reached - TARGET_SHARE);
    if (distance < gap - 1e-9 || (Math.abs(distance - gap) <= 1e-9 && candidate > chosen)) {
      chosen = candidate;
      gap = distance;
    }
  }
  return chosen;
}

export function calibrateTargets(runs: readonly CalibrationRun[]): Record<string, Record<TalentBand, number>> {
  const table: Record<string, Record<TalentBand, number>> = {};
  for (const item of MISSIONS) {
    const row = {} as Record<TalentBand, number>;
    for (const band of TALENT_BANDS) {
      const values = runs.filter((run) => run.band === band && item.id in run.measures).map((run) => run.measures[item.id] ?? 0);
      row[band] = values.length === 0 ? 0 : targetFor(values);
    }
    table[item.id] = row;
  }
  return table;
}

/** O arquivo `targets.ts` do motor, com a tabela calibrada. */
export function targetsSource(table: Readonly<Record<string, Readonly<Record<TalentBand, number>>>>, note: string): string {
  const rows = Object.entries(table).map(
    ([id, row]) => `  ${id}: { ${TALENT_BANDS.map((band) => `${band}: ${row[band]}`).join(", ")} },`,
  );
  return `import type { TalentBand } from "../player/talent";

/**
 * Alvos das missões do Desafio do dia por faixa de talento (GDD 27.3).
 * Gerado por \`pnpm desafio:calibrar\` (tools/balance): não edite à mão. Zero
 * tira a missão das mãos daquela faixa.
 *
 * ${note}
 */
export const MISSION_TARGETS: Readonly<Record<string, Readonly<Record<TalentBand, number>>>> = {
${rows.join("\n")}
};
`;
}

// ------------------------------------------------------------- relatório

export interface MissionRate {
  readonly id: string;
  readonly band: TalentBand;
  readonly samples: number;
  readonly target: number;
  /** Fração das carreiras comuns que cumpriram o alvo gravado. */
  readonly full: number;
  readonly medianRatio: number;
}

export function missionRates(runs: readonly CalibrationRun[]): MissionRate[] {
  const rates: MissionRate[] = [];
  for (const item of MISSIONS) {
    for (const band of TALENT_BANDS) {
      const target = MISSION_TARGETS[item.id]?.[band] ?? 0;
      if (target <= 0) continue;
      const values = runs.filter((run) => run.band === band && item.id in run.measures).map((run) => run.measures[item.id] ?? 0);
      if (values.length === 0) continue;
      rates.push({
        id: item.id,
        band,
        samples: values.length,
        target,
        full: share(values, (value) => value >= target),
        medianRatio: median(values.map((value) => value / target)),
      });
    }
  }
  return rates;
}

export interface Attempt {
  readonly day: string;
  readonly band: TalentBand;
  readonly edict: string;
  readonly policy: CareerPolicy;
  readonly score: number;
  readonly full: number;
  readonly edictIntact: boolean;
  readonly erased: number;
}

export interface ChallengeMetrics {
  readonly days: number;
  readonly validDays: number;
  readonly invalidDay: string | null;
  readonly missionUse: ReadonlyMap<string, number>;
  readonly edictUse: ReadonlyMap<string, number>;
  readonly bandUse: ReadonlyMap<TalentBand, number>;
  readonly rates: readonly MissionRate[];
  readonly edictBreaks: ReadonlyMap<string, number>;
  /** Carreiras da amostra. */
  readonly runs: number;
  readonly attempts: readonly Attempt[];
}

const count = <K,>(map: Map<K, number>, key: K) => map.set(key, (map.get(key) ?? 0) + 1);

export function computeChallengeMetrics(runs: readonly CalibrationRun[], firstDay: string, days: number, attemptDays: number): ChallengeMetrics {
  const missionUse = new Map<string, number>();
  const edictUse = new Map<string, number>();
  const bandUse = new Map<TalentBand, number>();
  let validDays = 0;
  let invalidDay: string | null = null;
  for (let offset = 0; offset < days; offset += 1) {
    const day = shiftChallengeDay(firstDay, offset);
    try {
      const hand = dailyHand(day);
      validDays += 1;
      for (const id of hand.missions) count(missionUse, id);
      count(edictUse, hand.edict);
      count(bandUse, hand.talent);
    } catch {
      invalidDay ??= day;
    }
  }

  // Tentativas de verdade: dias de verdade, jogados por jogadores comuns.
  const attempts: Attempt[] = [];
  for (let offset = 0; offset < attemptDays; offset += 1) {
    const day = shiftChallengeDay(firstDay, offset * 3);
    const hand = dailyHand(day);
    for (const policy of ATTEMPT_POLICIES) {
      const career = autoplay(createCareer(challengeSetup(hand, { surname: "TENTATIVA", foot: "right", dreamNumber: null })), policy);
      const status = challengeStatus(hand, career);
      attempts.push({
        day,
        band: hand.talent,
        edict: hand.edict,
        policy,
        score: status.total,
        full: status.missions.filter((item) => item.ratio >= 1).length,
        edictIntact: status.edict.state === "intact" || status.edict.state === "met",
        erased: status.erased,
      });
    }
  }
  return { days, validDays, invalidDay, missionUse, edictUse, bandUse, rates: missionRates(runs), edictBreaks: edictBreakRates(runs), runs: runs.length, attempts };
}

/** Faixa aceita da taxa de cumprimento de cada missão, por faixa, com os alvos gravados. */
const RATE_BAND = [0.15, 0.55] as const;
/** Faixa aceita da quebra de cada édito pelo jogo comum: tem dente, e dá para cumprir. */
const EDICT_BAND = [0.1, 0.75] as const;

export function edictBreakRates(runs: readonly CalibrationRun[]): Map<string, number> {
  return new Map(EDICTS.map((edict) => [edict.id, share(runs, (run) => run.brokenEdicts.includes(edict.id))]));
}

export function challengeTargets(metrics: ChallengeMetrics): TargetResult[] {
  // Tolerância da amostra (três desvios): o check do verify usa lotes menores, e
  // uma célula de 40 carreiras oscila sozinha mais que a faixa inteira.
  const slack = (rate: number, samples: number) => 3 * proportionError(rate, samples);
  const solid = metrics.rates.filter((rate) => rate.samples >= 30);
  const outside = solid.filter(
    (rate) => rate.full < RATE_BAND[0] - slack(RATE_BAND[0], rate.samples) || rate.full > RATE_BAND[1] + slack(RATE_BAND[1], rate.samples),
  );
  const fullPerAttempt = mean(metrics.attempts.map((attempt) => attempt.full));
  const unused = MISSIONS.filter((item) => !metrics.missionUse.has(item.id)).map((item) => item.id);
  const samples = metrics.runs;
  const toothless = [...metrics.edictBreaks].filter(
    ([, rate]) => rate < EDICT_BAND[0] - slack(EDICT_BAND[0], samples) || rate > EDICT_BAND[1] + slack(EDICT_BAND[1], samples),
  );
  return [
    {
      id: "challenge-valid",
      label: `Mão do dia válida em ${metrics.days} dias seguidos (invariante 21)`,
      target: "100%",
      measured: `${((metrics.validDays / metrics.days) * 100).toFixed(1)}%${metrics.invalidDay ? ` (falhou em ${metrics.invalidDay})` : ""}`,
      pass: metrics.validDays === metrics.days,
    },
    {
      id: "challenge-coverage",
      label: "Toda missão aparece em alguma mão",
      target: "36 de 36",
      measured: unused.length === 0 ? "36 de 36" : `faltam ${unused.join(", ")}`,
      pass: unused.length === 0,
    },
    {
      id: "challenge-rates",
      label: "Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65)",
      target: `${(RATE_BAND[0] * 100).toFixed(0)}% a ${(RATE_BAND[1] * 100).toFixed(0)}% em toda célula com 30+ carreiras (mais a tolerância da amostra)`,
      measured:
        outside.length === 0
          ? `${solid.length} células, todas dentro`
          : `${outside.length} fora: ${outside
              .slice(0, 4)
              .map((rate) => `${rate.id}/${bandName(rate.band)} ${(rate.full * 100).toFixed(0)}%`)
              .join(", ")}`,
      pass: outside.length === 0,
    },
    {
      id: "challenge-edicts",
      label: "Todo édito tem dente e dá para cumprir: quebra pelo jogo comum",
      target: `${(EDICT_BAND[0] * 100).toFixed(0)}% a ${(EDICT_BAND[1] * 100).toFixed(0)}%`,
      measured:
        toothless.length === 0
          ? `${metrics.edictBreaks.size} éditos dentro`
          : toothless.map(([id, rate]) => `${id} ${(rate * 100).toFixed(0)}%`).join(", "),
      pass: toothless.length === 0,
    },
    {
      id: "challenge-full",
      label: "Missões cheias por tentativa típica (perto de uma cheia e uma parcial)",
      target: "0,6 a 1,6",
      measured: fullPerAttempt.toFixed(2),
      pass: fullPerAttempt >= 0.6 && fullPerAttempt <= 1.6,
    },
  ];
}

export function challengeReport(input: { engineVersion: string; seed: string; firstDay: string; metrics: ChallengeMetrics; targets: readonly TargetResult[] }): string {
  const { metrics, targets } = input;
  const lines: string[] = [];
  lines.push("# Desafio do dia");
  lines.push("");
  lines.push(`Motor ${input.engineVersion}, semente \`${input.seed}\`. ${metrics.days} dias a partir de ${input.firstDay}.`);
  lines.push("");
  lines.push("O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.");
  lines.push("");
  lines.push("## Metas");
  lines.push("");
  lines.push("| | Meta | Alvo | Medido |", "|---|---|---|---|");
  for (const target of targets) lines.push(`| ${target.pass ? "✓" : "✗"} | ${target.label} | ${target.target} | ${target.measured} |`);
  lines.push("");
  lines.push("## Tentativas de jogadores comuns");
  lines.push("");
  const scores = metrics.attempts.map((attempt) => attempt.score);
  lines.push(
    `${metrics.attempts.length} tentativas em ${metrics.attempts.length / ATTEMPT_POLICIES.length} dias. Pontuação: mediana ${median(scores).toFixed(0)}, percentil 90 ${quantile(scores, 0.9).toFixed(0)}, máxima ${Math.max(...scores)}. Édito intacto em ${(share(metrics.attempts, (attempt) => attempt.edictIntact) * 100).toFixed(0)}% (o jogo comum não presta atenção nele). Missões cheias por tentativa: ${mean(metrics.attempts.map((attempt) => attempt.full)).toFixed(2)}.`,
  );
  lines.push("");
  lines.push("| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |", "|---|---:|---:|---:|---:|");
  for (const band of TALENT_BANDS) {
    const attempts = metrics.attempts.filter((attempt) => attempt.band === band);
    lines.push(
      `| ${bandName(band)} | ${metrics.bandUse.get(band) ?? 0} | ${attempts.length} | ${attempts.length ? median(attempts.map((attempt) => attempt.score)).toFixed(0) : "n/d"} | ${
        attempts.length ? mean(attempts.map((attempt) => attempt.full)).toFixed(2) : "n/d"
      } |`,
    );
  }
  lines.push("");
  lines.push("## Alvos e cumprimento por missão");
  lines.push("");
  lines.push(`| Missão | Mãos | ${TALENT_BANDS.map(bandName).join(" | ")} |`, `|---|---:|${TALENT_BANDS.map(() => "---:").join("|")}|`);
  for (const item of MISSIONS) {
    const cells = TALENT_BANDS.map((band) => {
      const rate = metrics.rates.find((entry) => entry.id === item.id && entry.band === band);
      const target = MISSION_TARGETS[item.id]?.[band] ?? 0;
      if (target <= 0) return "fora";
      return rate ? `${target} (${(rate.full * 100).toFixed(0)}%)` : `${target}`;
    });
    lines.push(`| ${item.id} | ${metrics.missionUse.get(item.id) ?? 0} | ${cells.join(" | ")} |`);
  }
  lines.push("");
  lines.push("Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. \"fora\": a missão não entra nas mãos daquela faixa.");
  lines.push("");
  lines.push("## Éditos");
  lines.push("");
  lines.push("| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |", "|---|---:|---:|");
  for (const [id, uses] of [...metrics.edictUse].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${id} | ${uses} | ${((metrics.edictBreaks.get(id) ?? 0) * 100).toFixed(0)}% |`);
  }
  lines.push("");
  lines.push("A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.");
  lines.push("");
  return lines.join("\n");
}
