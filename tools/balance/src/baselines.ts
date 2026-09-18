import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CORPUS } from "./corpus";

/** Where captured baselines live and what gets stored alongside them. */

const here = dirname(fileURLToPath(import.meta.url));
export const BASELINE_DIR = resolve(here, "..", "baselines");

export type BaselineName = "fingerprints" | "aggregate" | "challenge";

export const BASELINE_NAMES: BaselineName[] = ["fingerprints", "aggregate", "challenge"];

export interface Baseline<T> {
  /** Bumped by hand when a change to the game is accepted rather than fixed. */
  version: number;
  capturedAt: string;
  /**
   * Recorded because the simulation uses pow, exp and log2, and those are the
   * three places a different engine could legitimately produce a different
   * last decimal. If a diff appears the morning after a Node upgrade, this is
   * the first thing to check.
   */
  environment: { node: string; platform: string; arch: string };
  corpus: typeof CORPUS;
  data: T;
}

function pathFor(name: BaselineName): string {
  return resolve(BASELINE_DIR, `${name}.json`);
}

export function hasBaseline(name: BaselineName): boolean {
  return existsSync(pathFor(name));
}

export function writeBaseline<T>(name: BaselineName, data: T, version = 1): Baseline<T> {
  const baseline: Baseline<T> = {
    version,
    capturedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    corpus: CORPUS,
    data,
  };
  mkdirSync(BASELINE_DIR, { recursive: true });
  writeFileSync(pathFor(name), `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  return baseline;
}

export function readBaseline<T>(name: BaselineName): Baseline<T> {
  if (!hasBaseline(name)) {
    throw new Error(
      `No baseline for "${name}". Run "pnpm balance:capture" against the reference build first.`,
    );
  }
  return JSON.parse(readFileSync(pathFor(name), "utf8")) as Baseline<T>;
}
