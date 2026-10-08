import { writeFileSync } from "node:fs";
import { ENGINE_VERSION } from "@craque/engine";
import { calibrateTargets, runCalibration, TARGET_QUANTILE, targetsSource } from "./challenge";

/**
 * pnpm desafio:calibrar [--por-faixa N] [--semente texto]
 *
 * Recalibra os alvos das missões do Desafio do dia (GDD 27.3) e reescreve
 * `packages/engine/src/challenge/targets.ts`. Depois, `pnpm balance` mostra se
 * os alvos novos caem dentro das metas (relatório desafio.md).
 */

function value(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const perBand = Number(value("--por-faixa") ?? 600);
const seed = value("--semente") ?? "calibra-desafio";
if (!Number.isInteger(perBand) || perBand < 50) throw new Error("--por-faixa precisa ser um inteiro de 50 para cima");

const started = performance.now();
const runs = runCalibration(seed, perBand);
const table = calibrateTargets(runs);
const file = new URL("../../../packages/engine/src/challenge/targets.ts", import.meta.url);
writeFileSync(
  file,
  targetsSource(
    table,
    `Percentil ${Math.round(TARGET_QUANTILE * 100)} de ${runs.length} carreiras (${perBand} por faixa), semente "${seed}", motor ${ENGINE_VERSION}.`,
  ),
);
console.log(`Alvos recalibrados com ${runs.length} carreiras em ${((performance.now() - started) / 1000).toFixed(1)} s: packages/engine/src/challenge/targets.ts`);
