import { parentPort } from "node:worker_threads";
import { runCareer, type RunOptions } from "./run";
import { type SeasonSnap, snapshot, strengthsAtStart } from "./snapshot";

/**
 * Trabalhador do harness: joga as carreiras que recebe e devolve só os
 * retratos das temporadas (a carreira inteira é grande demais para copiar).
 */

export interface CareerSummary {
  readonly options: RunOptions;
  readonly seasons: readonly SeasonSnap[];
  readonly errors: readonly string[];
  readonly ms: number;
  readonly ended: string;
}

export function summarize(options: RunOptions): CareerSummary {
  const seasons: SeasonSnap[] = [];
  let start = new Map<string, number>();
  const log = runCareer(options, {
    seasonStart: (career) => {
      start = strengthsAtStart(career);
    },
    seasonEnd: (career, counters) => {
      seasons.push(snapshot(career, start, counters));
    },
  });
  return { options, seasons, errors: log.errors, ms: log.ms, ended: log.career.ended?.reason ?? log.career.phase };
}

const port = parentPort;
if (port) port.on("message", (job: RunOptions) => port.postMessage(summarize(job)));
