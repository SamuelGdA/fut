import { getClub, getCompetition, getCountry, getElite } from "@craque/world";
import { type CareerBatches, type CareerMetrics, type CareerSummary, HARNESS_RETIREMENT, RECORDS } from "./career";
import { median } from "./stats";
import type { TargetResult } from "./targets";

/** O relatório da carreira em Markdown (tools/balance/relatorios/carreira.md). */

const pct = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;
const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");

function targetTable(targets: readonly TargetResult[]): string[] {
  const lines = ["| | Meta | Alvo | Medido |", "|---|---|---|---|"];
  for (const target of targets) lines.push(`| ${target.pass ? "✓" : "✗"} | ${target.label} | ${target.target} | ${target.measured} |`);
  return lines;
}

function histogram(values: readonly number[], label: string): string[] {
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const keys = [...counts.keys()].sort((a, b) => a - b);
  const most = Math.max(1, ...counts.values());
  const lines = [`| ${label} | Carreiras | |`, "|---:|---:|---|"];
  for (const key of keys) {
    const count = counts.get(key) ?? 0;
    lines.push(`| ${key} | ${count} | ${"█".repeat(Math.max(1, Math.round((count / most) * 30)))} |`);
  }
  return lines;
}

/** Nome de quem ganhou um prêmio: o jogador, um nome real ou a geração futura. */
function winnerName(id: string | null): string {
  if (!id) return "-";
  if (id === "player") return "**você**";
  if (id.startsWith("future:")) return `geração futura (${id.slice(7, 11)})`;
  return getElite(id)?.name ?? id;
}

const competitionName = (id: string) => getCompetition(id)?.names.pt ?? id;

/** Uma carreira contada temporada a temporada, para ler o motor como jogo. */
function exampleCareer(summary: CareerSummary): string[] {
  const { run } = summary;
  const nation = getCountry(run.input.nationality)?.names.pt ?? run.input.nationality;
  const lines = [
    `Centroavante ${nation === "" ? "" : `(${nation})`}, talento Fenômeno, semente \`${run.input.seed}\`. ` +
      `Pico de OVR ${summary.peak}, ${summary.goals} gols, ${summary.ballons} Bolas de Ouro, ${summary.titles} títulos.`,
    "",
    "| Idade | Clube | Liga | Jogos | Gols | Títulos | Bola de Ouro | Seleção | OVR |",
    "|---:|---|---|---:|---:|---|---|---:|---:|",
  ];
  for (const season of run.seasons) {
    if (season.age > summary.retiredAt) break;
    const league = season.competitions.find((entry) => entry.kind === "league" || entry.kind === "second");
    const ballot = season.awards.ballonDor;
    const ballon = ballot.winner === "player" ? "🏆 venceu" : ballot.playerRank ? `${ballot.playerRank}º (${winnerName(ballot.winner)})` : "-";
    lines.push(
      `| ${season.age} | ${getClub(season.club)?.short ?? season.club} | ${league ? `${league.position}º` : "-"} | ${season.games} | ${
        season.production.goals
      } | ${season.titles.map(competitionName).join(", ") || "-"} | ${ballon} | ${season.national.games} j, ${season.national.goals} g | ${season.ovrEnd} |`,
    );
  }
  return lines;
}

export function careerReport(input: {
  readonly engineVersion: string;
  readonly seed: string;
  readonly batches: CareerBatches;
  readonly metrics: CareerMetrics;
  readonly targets: readonly TargetResult[];
}): string {
  const { batches, metrics } = input;
  const passed = input.targets.filter((target) => target.pass).length;
  const goals = batches.phenomStrikers.map((summary) => summary.goals);
  const typical =
    [...batches.phenomStrikers].sort(
      (a, b) => Math.abs(a.goals - median(goals)) - Math.abs(b.goals - median(goals)) || a.run.input.seed.localeCompare(b.run.input.seed),
    )[0] ?? batches.phenomStrikers[0];

  return [
    "# Relatório da carreira dentro do mundo",
    "",
    `Motor ${input.engineVersion}, semente \`${input.seed}\`. **${passed} de ${input.targets.length} metas atendidas.**`,
    "",
    "Gerado por `pnpm balance`. Carreiras inteiras dentro do mundo simulado, com clubes reais, copas, continentais, seleção e",
    "prêmios contra a elite real e a geração futura. O clube ainda vem de uma política fixa (do nível do jogador, indo para a",
    `Europa a partir de OVR 75) até o mercado chegar no M4; o relatório aposenta quem passa dos ${HARNESS_RETIREMENT.from} com OVR ${HARNESS_RETIREMENT.ovr}`,
    `ou menos, e todo mundo aos ${HARNESS_RETIREMENT.latest}.`,
    "",
    "| Lote | Carreiras | Para quê |",
    "|---|---:|---|",
    `| Fenômenos de ataque na Europa | ${batches.phenoms.length} | Bola de Ouro e recordes |`,
    `| Centroavantes Fenômenos na Europa | ${batches.phenomStrikers.length} | Chuteira de Ouro |`,
    `| Centroavantes Craque na Europa | ${batches.classStrikers.length} | Gols na carreira |`,
    `| Estrelas que ficam no Chile | ${batches.smallLeague.length} | Primária fora da Europa |`,
    "",
    "## Metas",
    "",
    ...targetTable(input.targets),
    "",
    `Mediana do pico de OVR dos Fenômenos de ataque: ${fixed(metrics.peakMedian, 0)}. Idade mediana de aposentadoria no relatório: ${fixed(
      metrics.retirementMedian,
      0,
    )}.`,
    "",
    "## Bolas de Ouro por carreira (Fenômenos de ataque)",
    "",
    `O recorde real é ${RECORDS.ballonDor} (Messi).`,
    "",
    ...histogram(batches.phenoms.map((summary) => summary.ballons), "Bolas de Ouro"),
    "",
    "## Chuteiras de Ouro por carreira (centroavantes Fenômenos)",
    "",
    `O recorde real é ${RECORDS.goldenShoe} (Messi).`,
    "",
    ...histogram(batches.phenomStrikers.map((summary) => summary.shoes), "Chuteiras"),
    "",
    "## Uma carreira típica",
    "",
    ...(typical ? exampleCareer(typical) : ["Nenhuma carreira no lote."]),
    "",
    `Quando a Bola de Ouro vai para a geração futura, o relatório mostra o ano de nascimento: esses candidatos são gerados pela semente para a disputa não acabar quando a elite real envelhece (ver D13). ${pct(
      metrics.ballonAny,
    )} dos Fenômenos de ataque ganham ao menos uma.`,
    "",
  ].join("\n");
}
