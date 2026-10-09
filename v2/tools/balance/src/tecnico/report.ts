import { COACH_VERSION, type Philosophy } from "@craque/engine/coach";
import { getClub, getLeague } from "@craque/world";
import type { TargetResult } from "../targets";
import type { CareerMetrics } from "./metrics";
import type { ProbeMetrics } from "./probes";

/** Relatório do Técnico em Markdown (arquivo versionado) e em texto (terminal). */

const pct = (value: number, digits = 1) => (Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : "n/d");
const fixed = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");
const clubName = (id: string) => getClub(id)?.name ?? id;

const PHILOSOPHY_NAME: Readonly<Record<Philosophy, string>> = {
  attacking: "Ofensiva",
  defensive: "Defensiva",
  possession: "Posse",
  counter: "Contra-ataque",
};

const POLICY_NAME: Readonly<Record<string, string>> = {
  balanced: "Equilibrada (treina, desenvolve, contrata ou sobe da base)",
  passive: "Passiva (nenhuma ação)",
  spender: "Gastadora (contrata em toda etapa)",
};

function targetTable(targets: readonly TargetResult[]): string[] {
  const lines = ["| | Meta | Alvo | Medido |", "|---|---|---|---|"];
  for (const target of targets) lines.push(`| ${target.pass ? "✓" : "✗"} | ${target.label} | ${target.target} | ${target.measured} |`);
  return lines;
}

export interface TecnicoReport {
  readonly seed: string;
  readonly probes: ProbeMetrics;
  readonly careers: CareerMetrics;
  readonly targets: readonly TargetResult[];
  readonly seconds: number;
}

export function markdownReport(report: TecnicoReport): string {
  const { probes, careers, targets } = report;
  const passed = targets.filter((target) => target.pass).length;
  const lines: string[] = [
    "# Relatório do Técnico",
    "",
    `Técnico ${COACH_VERSION}, semente \`${report.seed}\`, ${careers.careers} carreiras automáticas (${careers.seasons} temporadas). **${passed} de ${targets.length} metas atendidas.**`,
    "",
    "Gerado por `pnpm balance:tecnico`. As sondas fazem contas exatas sobre o modelo (sem sorteio); as carreiras",
    "jogam o mundo inteiro com uma política fixa (GDD 42.12). As mesmas sondas aparecem no laboratório.",
    "",
    "## Metas",
    "",
    ...targetTable(targets),
    "",
    "## Filosofias",
    "",
    "Pontos por jogo em campo neutro contra a mistura de abordagens que a IA escolhe pela força relativa.",
    "A diferença de força vale para os quatro setores.",
    "",
    `| Diferença | ${Object.values(PHILOSOPHY_NAME).join(" | ")} | Melhor |`,
    "|---:|---:|---:|---:|---:|---|",
    ...probes.philosophies.map(
      (row) =>
        `| ${row.gap > 0 ? "+" : ""}${row.gap} | ${(Object.keys(PHILOSOPHY_NAME) as Philosophy[]).map((key) => fixed(row.points[key], 3)).join(" | ")} | ${PHILOSOPHY_NAME[row.best]} |`,
    ),
    "",
    "## Europa × América do Sul",
    "",
    "Jogo de 90 minutos em campo neutro e chance de passar num mata-mata de jogo único (prorrogação e pênaltis).",
    "A coluna \"trocado\" refaz a conta com os elencos trocados: o resultado inverte, porque só o elenco conta.",
    "",
    "| Europeu | Força | Sul-americano | Força | Vitória | Empate | Derrota | Passa | Passa (trocado) |",
    "|---|---:|---|---:|---:|---:|---:|---:|---:|",
    ...probes.duels.map(
      (duel) =>
        `| ${clubName(duel.a)} | ${fixed(duel.strengthA, 1)} | ${clubName(duel.b)} | ${fixed(duel.strengthB, 1)} | ${pct(duel.odds.win)} | ${pct(duel.odds.draw)} | ${pct(duel.odds.loss)} | ${pct(duel.odds.advance)} | ${pct(duel.swapped.advance)} |`,
    ),
    "",
    `Mundial de Clubes (${probes.clubWorldCup.entrants} clubes, ${probes.clubWorldCup.europeans} europeus), chaveamento jogado 20 mil vezes com as chances exatas: ${Object.entries(probes.clubWorldCup.share)
      .sort((a, b) => b[1] - a[1])
      .map(([confederation, value]) => `${confederation} ${pct(value)}`)
      .join(", ")}. Melhor sul-americano: ${probes.clubWorldCup.bestSouth ? `${clubName(probes.clubWorldCup.bestSouth.club)} ${pct(probes.clubWorldCup.bestSouth.chance, 2)}` : "n/d"} por edição.`,
    "",
    "## Dificuldade de contratar",
    "",
    "Mediana da chance de o negócio existir (o jogador querer e o clube liberar), por diferença entre o OVR do alvo",
    "e a força do comprador. Entre parênteses, quantos jogadores do mundo (até 31 anos) há naquele degrau.",
    "",
    `| Comprador | Força | ${(probes.curves[0]?.points ?? []).map((point) => `${point.gap > 0 ? "+" : ""}${point.gap}`).join(" | ")} |`,
    `|---|---:|${(probes.curves[0]?.points ?? []).map(() => "---:").join("|")}|`,
    ...probes.curves.map(
      (curve) =>
        `| ${clubName(curve.club)} | ${fixed(curve.strength, 1)} | ${curve.points.map((point) => (point.players ? `${pct(point.median, point.median < 0.01 ? 3 : 1)} (${point.players})` : "-")).join(" | ")} |`,
    ),
    "",
    "| Jogador | OVR | De | Para | Chance |",
    "|---|---:|---|---|---:|",
    ...probes.named.map((entry) => `| ${entry.player} | ${entry.ovr} | ${clubName(entry.from)} | ${clubName(entry.to)} | ${pct(entry.chance, 4)} |`),
    "",
    "## Desenvolver",
    "",
    "O mesmo jogador com a mesma sorte, com e sem a marca do Desenvolver (só jogadores com 3+ de folga até o potencial).",
    "",
    "| Grupo | Jogadores | OVR sobe (com) | OVR sobe (sem) | Ganho médio (com) | Ganho médio (sem) |",
    "|---|---:|---:|---:|---:|---:|",
    ...probes.develop.map(
      (row) =>
        `| ${row.label} | ${row.trial.players} | ${pct(row.trial.treated)} | ${pct(row.trial.control)} | ${fixed(row.trial.gainTreated)} | ${fixed(row.trial.gainControl)} |`,
    ),
    "",
    `Rápido × lento, sem ações, ${probes.pace.players} jogadores: ${fixed(probes.pace.fast, 3)} contra ${fixed(probes.pace.slow, 3)} de nível por temporada.`,
    "",
    "## Verba",
    "",
    ...probes.budget.map(
      (row) =>
        `- ${row.division}ª divisão: ${row.withThree} de ${row.clubs} clubes têm 3 ou mais alvos do próprio nível ao alcance da verba e da folha. Sem: ${row.tight.map(clubName).join(", ") || "nenhum"} (folha acima do teto, precisam vender antes).`,
    ),
    "",
    "## Carreiras automáticas",
    "",
    "| Política | Carreiras | Temporadas | Objetivo cumprido | Demissões | Demitido na 1ª | Acessos | Quedas | Títulos | Grandes títulos | Reputação final | Temporadas com contratação |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...careers.byPolicy.map(
      (row) =>
        `| ${POLICY_NAME[row.policy] ?? row.policy} | ${row.careers} | ${row.seasons} | ${pct(row.objectiveMet)} | ${pct(row.dismissals)} | ${pct(row.firstSeasonDismissals)} | ${row.promotions} | ${row.relegations} | ${row.titles} | ${row.majorTitles} | ${fixed(row.finalReputation, 0)} | ${pct(row.purchaseSeasons)} |`,
    ),
    "",
    `Tempo médio por temporada (Node, trabalhadores em paralelo): rápido ${Math.round(careers.fastSeasonMs)} ms, lento ${Math.round(careers.slowSeasonMs)} ms. Criar o mundo: ${Math.round(probes.createMs)} ms.`,
    "",
    "## Ligas",
    "",
    "Campeão pelo posto de força no começo da temporada; força média dos clubes na primeira e na última temporada.",
    "",
    "| Liga | Div. | Temporadas | Campeão foi o mais forte | Entre os 3 mais fortes | Pontos do campeão | Campeões diferentes por carreira | Força no começo | Força no fim |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...careers.leagues.map(
      (league) =>
        `| ${getLeague(league.id)?.name ?? league.id} | ${league.division}ª | ${league.seasons} | ${pct(league.strongestShare, 0)} | ${pct(league.topThreeShare, 0)} | ${fixed(league.championPoints, 0)} | ${fixed(league.distinctChampions, 1)} | ${fixed(league.strengthStart, 1)} | ${fixed(league.strengthEnd, 1)} |`,
    ),
    "",
  ];
  return lines.join("\n");
}

export function terminalReport(report: TecnicoReport): string {
  const lines = [`Técnico ${COACH_VERSION}: ${report.careers.careers} carreiras, ${report.careers.seasons} temporadas, ${report.seconds.toFixed(0)} s`];
  for (const target of report.targets) lines.push(`${target.pass ? "✓" : "✗"} ${target.label}: ${target.measured} (alvo: ${target.target})`);
  return lines.join("\n");
}
