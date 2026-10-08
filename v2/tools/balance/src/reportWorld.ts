import { getCountry } from "@craque/world";
import type { TargetResult } from "./targets";
import { clubName, type WorldMetrics } from "./world";

/** O relatório do mundo em Markdown (tools/balance/relatorios/mundo.md). */

const pct = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;
const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");

function targetTable(targets: readonly TargetResult[]): string[] {
  const lines = ["| | Meta | Alvo | Medido |", "|---|---|---|---|"];
  for (const target of targets) lines.push(`| ${target.pass ? "✓" : "✗"} | ${target.label} | ${target.target} | ${target.measured} |`);
  return lines;
}

function shareList(shares: Readonly<Record<string, number>>, label: (key: string) => string, limit = 8): string {
  return Object.entries(shares)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => `${label(key)} ${pct(value)}`)
    .join(", ");
}

const countryName = (code: string) => getCountry(code)?.names.pt ?? code;

export function worldReport(input: {
  readonly engineVersion: string;
  readonly seed: string;
  readonly worlds: number;
  readonly seasons: number;
  readonly metrics: WorldMetrics;
  readonly targets: readonly TargetResult[];
}): string {
  const { metrics } = input;
  const passed = input.targets.filter((target) => target.pass).length;
  const leagueRows = metrics.leagues.map(
    (league) =>
      `| ${league.name} | ${league.division}ª | ${fixed(league.championPoints, 0)} | ${fixed(league.lastPoints, 0)} | ${fixed(
        league.distinctChampions,
        0,
      )} | ${clubName(league.dominant)} ${pct(league.dominantShare)} | ${league.survival === null ? "-" : pct(league.survival)} |`,
  );
  const continental = (id: string, title: string) =>
    `- **${title}**: ${shareList(metrics.winnersByCountry[id] ?? {}, countryName)}`;

  return [
    "# Relatório do mundo simulado",
    "",
    `Motor ${input.engineVersion}, semente \`${input.seed}\`, ${input.worlds} mundos de ${input.seasons} temporadas, sem jogador. ` +
      `**${passed} de ${input.targets.length} metas atendidas.**`,
    "",
    "Gerado por `pnpm balance`. Cada mundo começa com as forças e divisões reais dos dados e roda sozinho: tabelas,",
    "acesso, copas, supercopas, continentais, Intercontinental, Mundial de Clubes, Copa do Mundo e continentais de seleções.",
    "",
    "## Metas",
    "",
    ...targetTable(input.targets),
    "",
    "## Ligas",
    "",
    "Pontos e campeões diferentes são medianas por mundo. O maior campeão soma todos os mundos.",
    "",
    "| Liga | Div. | Pontos do campeão | Pontos do lanterna | Campeões diferentes | Maior campeão | Quem sobe e fica |",
    "|---|---|---:|---:|---:|---|---:|",
    ...leagueRows,
    "",
    "## Torneios continentais (títulos por país)",
    "",
    continental("cont1:UEFA", "Champions League"),
    continental("cont2:UEFA", "Europa League"),
    continental("cont1:CONMEBOL", "Libertadores"),
    continental("cont2:CONMEBOL", "Sul-Americana"),
    continental("cont1:CONCACAF", "Copa dos Campeões da Concacaf"),
    "",
    `- **Intercontinental**: campeão europeu vence ${pct(metrics.intercontinentalUefa)}.`,
    `- **Mundial de Clubes**: clube europeu vence ${pct(metrics.clubWorldCupUefa)}.`,
    "",
    "## Seleções",
    "",
    `- **Copa do Mundo**: ${shareList(metrics.worldCupWinners, countryName, 10)}.`,
    ...["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"].map(
      (confederation) => `- **Continental ${confederation}**: ${shareList(metrics.nationsCupWinners[confederation] ?? {}, countryName, 5)}.`,
    ),
    "",
    "## Força dos clubes",
    "",
    `Depois de ${input.seasons} temporadas, a diferença para a força base fica entre ${fixed(metrics.driftP01)} e +${fixed(
      metrics.driftP99,
    )} (1% e 99% dos clubes), com média absoluta de ${fixed(metrics.driftMeanAbs, 2)}. Sucesso puxa para cima, a volta à média puxa de volta.`,
    "",
    "## Desempenho",
    "",
    `Uma temporada do mundo inteiro leva ${fixed(metrics.msPerSeason, 2)} ms (média, já aquecido). Uma carreira de 24 temporadas, com o jogador, fica perto de 30 ms.`,
    "",
  ].join("\n");
}
