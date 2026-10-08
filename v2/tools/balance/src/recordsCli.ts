import { mkdirSync, writeFileSync } from "node:fs";
import { ENGINE_VERSION } from "@craque/engine";
import { recordRows, runRecordCareers } from "./records";

/**
 * pnpm balance:recordes [--carreiras N] [--semente texto] [--sem-arquivo]
 *
 * Mede se os recordes reais estão ao alcance (D33 e D42): N Fenômenos por
 * posição em cada lote (ambicioso e fiel), jogados pelas decisões até o fim. Grava
 * tools/balance/relatorios/recordes.md.
 */

function readArgs(argv: readonly string[]) {
  const value = (name: string) => {
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const careers = Number(value("--carreiras") ?? 150);
  if (!Number.isInteger(careers) || careers < 10) throw new Error("--carreiras precisa ser um inteiro de 10 para cima");
  return { careers, seed: value("--semente") ?? "recordes", writeFile: !argv.includes("--sem-arquivo") };
}

function main() {
  const args = readArgs(process.argv.slice(2));
  const started = performance.now();
  const rows = recordRows(runRecordCareers(args.seed, args.careers));
  const seconds = ((performance.now() - started) / 1000).toFixed(1);

  const table = [
    "| Recorde | Marca real | Melhor do lote | Mediana | Carreiras que alcançaram | +1 | +2 | +3 |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    ...rows.map(
      (row) =>
        `| ${row.target.label} | ${row.target.value} | ${row.best} | ${row.median} | ${row.reached} de ${row.careers} (${((100 * row.reached) / row.careers).toFixed(1)}%) | ${row.beyond.join(" | ")} |`,
    ),
  ];
  const report = [
    "# Recordes ao alcance",
    "",
    `Motor ${ENGINE_VERSION}, semente \`${args.seed}\`, ${args.careers} Fenômenos por posição em cada lote (ambicioso, fiel e fiel ao gigante), jogados pelas decisões sem aposentar por vontade própria, ritmo Normal (uma temporada por decisão). ${seconds} s.`,
    "",
    "Recorde não é para ser comum: a meta (D33, D42 e D44) é que cada marca seja possível para um jogador",
    "extraordinário com muita sorte, e que cada passo além dela seja mais raro que o anterior (colunas +1, +2",
    "e +3: quantas carreiras passaram da marca por um, dois e três). Uma linha com zero carreiras que",
    "alcançaram mostra o melhor que o lote fez.",
    "",
    ...table,
    "",
  ].join("\n");

  console.log(table.join("\n"));
  console.log(`\n${seconds} s`);
  if (args.writeFile) {
    mkdirSync(new URL("../relatorios/", import.meta.url), { recursive: true });
    writeFileSync(new URL("../relatorios/recordes.md", import.meta.url), report, "utf8");
  }
}

main();
