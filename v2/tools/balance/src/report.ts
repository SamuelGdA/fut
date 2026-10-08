import { FIRST_AGE, POSITION_GROUPS, type PositionGroup, TALENT_BANDS } from "@craque/engine";
import type { Metrics } from "./metrics";
import { bandName, type TargetResult } from "./targets";

/** O relatório em Markdown (arquivo) e em texto (terminal). */

const GROUP_NAME: Readonly<Record<PositionGroup, string>> = {
  attacker: "Atacante",
  attackingMid: "Meia ofensivo",
  midfield: "Meio-campo",
  fullback: "Lateral",
  centreBack: "Zagueiro",
  goalkeeper: "Goleiro",
};

const SPARK = "▁▂▃▄▅▆▇█";
const CURVE_AGES = [16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 39];

const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");
const signed = (value: number, digits = 1) => `${value > 0 ? "+" : ""}${fixed(value, digits)}`;

/** Curva de 40 a 99 em oito alturas, um caractere por idade. */
export function sparkline(values: readonly number[]): string {
  return values
    .map((value) => {
      const level = Math.round(((Math.min(99, Math.max(40, value)) - 40) / 59) * (SPARK.length - 1));
      return SPARK[level] ?? " ";
    })
    .join("");
}

export interface ReportSection {
  readonly title: string;
  readonly description: string;
  readonly metrics: Metrics;
  readonly targets: readonly TargetResult[];
}

export interface PolicyRow {
  readonly policy: string;
  readonly metrics: Metrics;
}

function targetTable(targets: readonly TargetResult[]): string[] {
  const lines = ["| | Meta | Alvo | Medido |", "|---|---|---|---|"];
  for (const target of targets) {
    lines.push(`| ${target.pass ? "✓" : "✗"} | ${target.label} | ${target.target} | ${target.measured} |`);
  }
  return lines;
}

function curveTable(metrics: Metrics): string[] {
  const header = `| Faixa | ${CURVE_AGES.map((age) => `${age}`).join(" | ")} | Curva 16 a 39 |`;
  const rule = `|---|${CURVE_AGES.map(() => "---:").join("|")}|---|`;
  const rows = TALENT_BANDS.map((band) => {
    const curve = metrics.ovrCurve[band];
    const cells = CURVE_AGES.map((age) => fixed(curve[age - FIRST_AGE] ?? Number.NaN, 0));
    return `| ${bandName(band)} | ${cells.join(" | ")} | \`${sparkline(curve)}\` |`;
  });
  return [header, rule, ...rows];
}

function deltaTable(metrics: Metrics): string[] {
  const lines = ["| Idade | 10% piores | Mediana | 10% melhores |", "|---|---:|---:|---:|"];
  for (const bucket of metrics.deltas.buckets) {
    lines.push(`| ${bucket.label} | ${signed(bucket.p10)} | ${signed(bucket.median)} | ${signed(bucket.p90)} |`);
  }
  return lines;
}

function bandTable(metrics: Metrics): string[] {
  const lines = [
    "| Faixa | Carreiras | OVR aos 16 (mediana, sem prodígio) | Potencial médio | Pico médio | Pico - P | Chega a 80 | Idade em que chega a 80 |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
  ];
  for (const band of TALENT_BANDS) {
    const peak = metrics.peakByBand[band];
    const reach = metrics.ageReaching80[band];
    lines.push(
      `| ${bandName(band)} | ${peak.careers} | ${fixed(metrics.ovrAtStart[band], 0)} | ${fixed(peak.meanPotential)} | ${fixed(
        peak.meanPeak,
      )} | ${signed(peak.gap)} | ${(reach.share * 100).toFixed(0)}% | ${fixed(reach.medianAge, 0)} |`,
    );
  }
  return lines;
}

function groupTable(metrics: Metrics): string[] {
  const lines = ["| Grupo | Pico - P (média) |", "|---|---:|"];
  for (const group of POSITION_GROUPS) lines.push(`| ${GROUP_NAME[group]} | ${signed(metrics.peakGapByGroup[group])} |`);
  return lines;
}

function policyTable(rows: readonly PolicyRow[]): string[] {
  const header = `| Política | ${TALENT_BANDS.map((band) => bandName(band)).join(" | ")} | Jogos aos 18 | Jogos aos 24 | Maior subida |`;
  const rule = `|---|${TALENT_BANDS.map(() => "---:").join("|")}|---:|---:|---:|`;
  const lines = [header, rule];
  for (const row of rows) {
    const gaps = TALENT_BANDS.map((band) => signed(row.metrics.peakByBand[band].gap));
    lines.push(
      `| ${row.policy} | ${gaps.join(" | ")} | ${fixed(row.metrics.meanGamesAt["18"], 0)} | ${fixed(
        row.metrics.meanGamesAt["24"],
        0,
      )} | ${signed(row.metrics.deltas.max, 0)} |`,
    );
  }
  return lines;
}

export function markdownReport(input: {
  readonly engineVersion: string;
  readonly seed: string;
  readonly careers: number;
  readonly main: ReportSection;
  readonly hard: ReportSection;
  readonly policies: readonly PolicyRow[];
}): string {
  const { main, hard } = input;
  const all = [...main.targets, ...hard.targets];
  const passed = all.filter((target) => target.pass).length;
  return [
    "# Relatório de evolução do jogador",
    "",
    `Motor ${input.engineVersion}, semente \`${input.seed}\`, ${input.careers} carreiras por lote. ` +
      `**${passed} de ${all.length} metas atendidas.**`,
    "",
    "Gerado por `pnpm balance`. As carreiras rodam na caixa de areia da evolução: o clube vem de uma política",
    "fixa e os títulos de um modelo provisório, até o mercado e as tabelas chegarem (M3 e M4).",
    "",
    `## ${main.title}`,
    "",
    main.description,
    "",
    ...targetTable(main.targets),
    "",
    "### OVR mediano por idade",
    "",
    ...curveTable(main.metrics),
    "",
    "### Variação de OVR por temporada",
    "",
    ...deltaTable(main.metrics),
    "",
    `Explosões em ${(main.metrics.formShare.explosion * 100).toFixed(1)}% das temporadas, tropeços em ${(
      main.metrics.formShare.stumble * 100
    ).toFixed(1)}%.`,
    "",
    "### Faixas de talento",
    "",
    ...bandTable(main.metrics),
    "",
    "### Posições",
    "",
    ...groupTable(main.metrics),
    "",
    `## ${hard.title}`,
    "",
    hard.description,
    "",
    ...targetTable(hard.targets),
    "",
    ...curveTable(hard.metrics),
    "",
    "## Políticas de clube (pico - P por faixa)",
    "",
    "Mesmo lote de sementes, só a escolha de clube muda. Mostra a troca entre minutos e treinador.",
    "",
    ...policyTable(input.policies),
    "",
  ].join("\n");
}

/** Versão curta para o terminal: metas e curvas. */
export function terminalReport(sections: readonly ReportSection[]): string {
  const lines: string[] = [];
  for (const section of sections) {
    lines.push("", section.title.toUpperCase(), "");
    for (const target of section.targets) {
      lines.push(`  ${target.pass ? "✓" : "✗"} ${target.label}`);
      lines.push(`      alvo ${target.target}  |  medido ${target.measured}`);
    }
    lines.push("", "  OVR mediano por idade (16 a 39):");
    for (const band of TALENT_BANDS) {
      const curve = section.metrics.ovrCurve[band];
      const peak = curve.filter(Number.isFinite).reduce((best, value) => Math.max(best, value), 0);
      lines.push(`    ${bandName(band).padEnd(10)} ${sparkline(curve)}  pico ${fixed(peak, 0)}`);
    }
  }
  return lines.join("\n");
}
