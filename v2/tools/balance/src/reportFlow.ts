import { getClub } from "@craque/world";
import type { BatchFlowMetrics, FlowBatches, FlowMetrics, FlowRun } from "./flow";
import type { TargetResult } from "./targets";

/** O relatório do fluxo da carreira em Markdown (tools/balance/relatorios/fluxo.md). */

const pct = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;
const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");

const REASON_NAMES: Readonly<Record<string, string>> = {
  age: "Idade (40)",
  noRoom: "Sem mercado",
  noOffers: "Sem ofertas",
  release: "Parou depois da dispensa",
  voluntary: "Escolheu parar",
};

const KIND_NAMES: Readonly<Record<string, string>> = {
  base: "Base",
  window: "Janela",
  event: "Evento",
  focus: "Foco de treino",
  loan: "Empréstimo",
  return: "Volta de empréstimo",
  release: "Dispensa",
  forced: "Aposentadoria forçada",
};

function targetTable(targets: readonly TargetResult[]): string[] {
  const lines = ["| | Meta | Alvo | Medido |", "|---|---|---|---|"];
  for (const target of targets) lines.push(`| ${target.pass ? "✓" : "✗"} | ${target.label} | ${target.target} | ${target.measured} |`);
  return lines;
}

function endHistogram(ages: readonly number[]): string[] {
  const counts = new Map<number, number>();
  for (const age of ages) counts.set(age, (counts.get(age) ?? 0) + 1);
  const most = Math.max(1, ...counts.values());
  const lines = ["| Idade | Carreiras | |", "|---:|---:|---|"];
  for (const age of [...counts.keys()].sort((a, b) => a - b)) {
    const count = counts.get(age) ?? 0;
    lines.push(`| ${age} | ${count} | ${"█".repeat(Math.max(1, Math.round((count / most) * 30)))} |`);
  }
  return lines;
}

function batchTable(rows: ReadonlyArray<readonly [string, BatchFlowMetrics]>): string[] {
  const lines = [
    "| Lote | Carreiras | Fim (mediana) | Eventos | Decisões | Empréstimos | Clubes | Traidor |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
  ];
  for (const [name, metrics] of rows) {
    lines.push(
      `| ${name} | ${metrics.careers} | ${fixed(metrics.endMedian, 0)} | ${fixed(metrics.events)} | ${fixed(metrics.decisions)} | ${fixed(
        metrics.loans,
        2,
      )} | ${fixed(metrics.clubs)} | ${pct(metrics.traitorShare, 1)} |`,
    );
  }
  return lines;
}

function reasonTable(rows: ReadonlyArray<readonly [string, BatchFlowMetrics]>): string[] {
  const reasons = Object.keys(REASON_NAMES);
  const lines = [`| Lote | ${reasons.map((reason) => REASON_NAMES[reason]).join(" | ")} |`, `|---|${reasons.map(() => "---:").join("|")}|`];
  for (const [name, metrics] of rows) {
    lines.push(`| ${name} | ${reasons.map((reason) => pct(metrics.reasons[reason as keyof typeof metrics.reasons] ?? 0)).join(" | ")} |`);
  }
  return lines;
}

function kindTable(rows: ReadonlyArray<readonly [string, BatchFlowMetrics]>): string[] {
  const kinds = Object.keys(KIND_NAMES);
  const lines = [`| Lote | ${kinds.map((kind) => KIND_NAMES[kind]).join(" | ")} |`, `|---|${kinds.map(() => "---:").join("|")}|`];
  for (const [name, metrics] of rows) {
    lines.push(`| ${name} | ${kinds.map((kind) => fixed(metrics.decisionKinds[kind as keyof typeof metrics.decisionKinds] ?? 0, 2)).join(" | ")} |`);
  }
  return lines;
}

/** Uma carreira contada decisão a decisão, para ler o fluxo como jogo. */
function exampleCareer(run: FlowRun): string[] {
  const career = run.career;
  const lines = [
    `Semente \`${run.seed}\`, ${career.setup.identity.position}, ${career.setup.identity.nationality}. Fim aos ${career.end?.age} (${
      REASON_NAMES[career.end?.reason ?? ""] ?? "-"
    }). Eventos: ${career.eventsSeen.join(", ") || "nenhum"}.`,
    "",
    "| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |",
    "|---:|---:|---|---|---:|---:|---:|---:|---|---|",
  ];
  for (const season of career.history) {
    lines.push(
      `| ${season.year} | ${season.age} | ${getClub(season.club)?.short ?? season.club}${season.loan ? " (emp.)" : ""} | ${season.role} | ${season.games} | ${
        season.production.goals
      } | ${season.ovrEnd} | ${Math.round(season.fans)} | ${season.mission} | ${
        season.event ? `${season.event.id}/${season.event.option}${season.event.success === null ? "" : season.event.success ? " ✓" : " ✗"}` : ""
      } |`,
    );
  }
  return lines;
}

export function flowReport(input: {
  readonly engineVersion: string;
  readonly seed: string;
  readonly batches: FlowBatches;
  readonly metrics: FlowMetrics;
  readonly targets: readonly TargetResult[];
}): string {
  const { batches, metrics } = input;
  const passed = input.targets.filter((target) => target.pass).length;
  const rows = [
    ["Teimosa, Intensa", metrics.stubbornIntense],
    ["Teimosa, Normal", metrics.stubbornNormal],
    ["Equilibrada, Intensa", metrics.balancedIntense],
    ["Equilibrada, Normal", metrics.balancedNormal],
  ] as const;
  const example = batches.balancedIntense.find((run) => run.career.eventsSeen.length >= 6) ?? batches.balancedIntense[0];
  return [
    "# Relatório do fluxo da carreira",
    "",
    `Motor ${input.engineVersion}, semente \`${input.seed}\`. **${passed} de ${input.targets.length} metas atendidas.**`,
    "",
    "Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,",
    "dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.",
    "",
    "- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a",
    "  carreira é a falta de ofertas, não a vontade do jogador.",
    "- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.",
    "",
    "## Metas",
    "",
    ...targetTable(input.targets),
    "",
    "## Os lotes",
    "",
    ...batchTable(rows),
    "",
    "## Como as carreiras terminam",
    "",
    ...reasonTable(rows),
    "",
    "## Decisões por carreira, por tipo",
    "",
    ...kindTable(rows),
    "",
    "## Idade do fim, política teimosa, ritmo Intensa",
    "",
    ...endHistogram(metrics.stubbornIntense.endAges),
    "",
    "## Idade do fim, política teimosa, ritmo Normal",
    "",
    "No ritmo Normal as decisões caem nas idades pares, então o fim também.",
    "",
    ...endHistogram(metrics.stubbornNormal.endAges),
    "",
    "## Uma carreira do lote equilibrado, ritmo Intensa",
    "",
    ...(example ? exampleCareer(example) : ["Nenhuma carreira no lote."]),
    "",
  ].join("\n");
}
