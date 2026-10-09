import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";
import type { RunOptions } from "./run";
import type { CareerSummary } from "./worker";

/**
 * Distribui as carreiras entre trabalhadores (um por núcleo, no máximo
 * `limit`) numa fila: quem termina pega a próxima, para as carreiras lentas
 * não se acumularem num trabalhador só.
 */
export function runParallel(jobs: readonly RunOptions[], onDone: (summary: CareerSummary) => void, limit = availableParallelism()): Promise<CareerSummary[]> {
  const queue = [...jobs];
  const results: CareerSummary[] = [];
  const workers = Math.max(1, Math.min(limit, jobs.length));
  return Promise.all(
    Array.from(
      { length: workers },
      () =>
        new Promise<void>((resolve, reject) => {
          const worker = new Worker(new URL("./worker.mjs", import.meta.url));
          const next = () => {
            const job = queue.shift();
            if (job) worker.postMessage(job);
            else void worker.terminate().then(() => resolve());
          };
          worker.on("message", (summary: CareerSummary) => {
            results.push(summary);
            onDone(summary);
            next();
          });
          worker.on("error", reject);
          next();
        }),
    ),
  ).then(() => results.sort((a, b) => a.options.seed.localeCompare(b.options.seed, "en", { numeric: true })));
}
