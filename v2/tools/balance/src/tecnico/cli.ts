import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { CountryCode } from "@craque/world";
import type { CoachMode } from "@craque/engine/coach";
import { computeCareerMetrics } from "./metrics";
import { runParallel } from "./pool";
import { runProbes } from "./probes";
import { markdownReport, terminalReport } from "./report";
import type { Policy, RunOptions } from "./run";
import type { CareerSummary } from "./worker";
import { careerTargets, probeTargets } from "./targets";

/**
 * pnpm balance:tecnico [--carreiras N] [--temporadas N] [--semente texto] [--check] [--sem-arquivo] [--cache arquivo.json]
 *
 * Roda as sondas exatas e N carreiras automáticas em paralelo, imprime as
 * metas e grava tools/balance/relatorios/tecnico.md. Com --check, sai com
 * erro se alguma meta falhar. Com --cache, guarda os retratos das carreiras
 * num arquivo (fora do projeto) e os reaproveita na próxima vez, para
 * recalcular as metas sem jogar tudo de novo.
 */

function readArgs(argv: readonly string[]) {
  const value = (name: string) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const careers = Number(value("--carreiras") ?? 16);
  const seasons = Number(value("--temporadas") ?? 24);
  if (!Number.isInteger(careers) || careers < 4) throw new Error("--carreiras precisa ser um inteiro de 4 para cima");
  if (!Number.isInteger(seasons) || seasons < 2 || seasons > 24) throw new Error("--temporadas vai de 2 a 24");
  return {
    careers,
    seasons,
    seed: value("--semente") ?? "tecnico-m1",
    check: argv.includes("--check"),
    writeFile: !argv.includes("--sem-arquivo"),
    cache: value("--cache") ?? null,
  };
}

/** Nacionalidades em rodízio: as de 2ª divisão real e as completadas. */
const NATIONS: readonly CountryCode[] = ["BRA", "ARG", "ENG", "ESP", "ITA", "COL", "FRA", "GER", "URU", "CHI", "ECU", "PAR", "PER", "BOL", "VEN"];

/** Metade equilibrada (rápido e lento), um quarto passiva, um quarto gastadora. */
function jobs(count: number, seasons: number, seed: string): RunOptions[] {
  const list: RunOptions[] = [];
  for (let index = 0; index < count; index += 1) {
    const slot = index % 4;
    const policy: Policy = slot === 1 ? "passive" : slot === 3 ? "spender" : "balanced";
    const mode: CoachMode = slot === 2 ? "slow" : "fast";
    list.push({ seed: `${seed}:${index}`, mode, policy, nationality: NATIONS[index % NATIONS.length] ?? "BRA", seasons });
  }
  return list;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  const started = performance.now();
  const probes = runProbes(args.seed);
  let done = 0;
  const cached = args.cache && existsSync(args.cache) ? (JSON.parse(readFileSync(args.cache, "utf8")) as CareerSummary[]) : null;
  const summaries =
    cached ??
    (await runParallel(jobs(args.careers, args.seasons, args.seed), (summary) => {
      done += 1;
      process.stderr.write(`  carreira ${done}/${args.careers} (${summary.options.policy}, ${summary.options.mode}, ${summary.options.nationality}): ${(summary.ms / 1000).toFixed(0)} s\n`);
    }));
  if (args.cache && !cached) writeFileSync(args.cache, JSON.stringify(summaries));
  const careers = computeCareerMetrics(summaries);
  const targets = [...probeTargets(probes), ...careerTargets(careers)];
  const report = { seed: args.seed, probes, careers, targets, seconds: (performance.now() - started) / 1000 };
  console.log(terminalReport(report));
  if (args.writeFile) {
    const dir = new URL("../../relatorios/", import.meta.url);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL("tecnico.md", dir), markdownReport(report));
    console.log("Relatório gravado em tools/balance/relatorios/tecnico.md");
  }
  if (args.check && targets.some((target) => !target.pass)) {
    console.error("Metas do Técnico falharam.");
    process.exit(1);
  }
}

await main();
