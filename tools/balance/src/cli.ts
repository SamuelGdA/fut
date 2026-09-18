import { BASELINE_NAMES, readBaseline, writeBaseline, type BaselineName } from "./baselines";
import { diffFingerprints, diffValues, type Drift } from "./report/diff";
import { formatDrift, formatFingerprintDrift, formatTargets, heading } from "./report/format";
import { runAggregate, type AggregateReport } from "./runners/aggregate";
import { runChallenge, type ChallengeReport } from "./runners/challenge";
import { runFingerprints, type FingerprintReport } from "./runners/fingerprints";

/**
 * capture  writes the baselines from whatever code is on disk right now
 * check    re-runs and reports every difference against them
 *
 * Nothing here decides whether a difference is acceptable. That is a human
 * call, and the tool's job is to make sure the call gets made rather than
 * missed.
 */

type Runner = () => unknown;

const RUNNERS: Record<BaselineName, Runner> = {
  fingerprints: runFingerprints,
  aggregate: runAggregate,
  challenge: runChallenge,
};

function timed<T>(label: string, run: () => T): T {
  const started = Date.now();
  process.stdout.write(`  ${label} ... `);
  const result = run();
  process.stdout.write(`${((Date.now() - started) / 1000).toFixed(1)}s\n`);
  return result;
}

function capture(selected: BaselineName[]): void {
  console.log(heading("Capturing balance baselines"));
  for (const name of selected) {
    const data = timed(name, RUNNERS[name]);
    const baseline = writeBaseline(name, data);
    console.log(`  -> baselines/${name}.json  (node ${baseline.environment.node})`);
  }
  console.log(`\nCaptured ${selected.length} baseline(s).`);
}

function reportFingerprints(fresh: FingerprintReport, verbose: boolean): number {
  const baseline = readBaseline<FingerprintReport>("fingerprints");
  const drifts = diffFingerprints(baseline.data.careers, fresh.careers);

  console.log(heading(`Fingerprints  (${fresh.corpusSize} careers, exact match required)`));
  if (drifts.length === 0) {
    console.log("  every career identical");
  } else {
    console.log(`  ${drifts.length} career(s) changed`);
    console.log(formatFingerprintDrift(drifts, verbose ? 250 : 25));
  }
  if (fresh.stalled.length > 0) {
    console.log(`  WARNING stalled careers: ${fresh.stalled.join(", ")}`);
  }
  return drifts.length;
}

function reportAggregate(fresh: AggregateReport, verbose: boolean): number {
  const baseline = readBaseline<AggregateReport>("aggregate");
  const drifts = diffValues(baseline.data, fresh);

  console.log(heading(`Aggregate  (${fresh.corpusSize} careers)`));
  console.log("  design targets now:");
  console.log(formatTargets(fresh.targets));

  const targetDrift = drifts.filter((drift) => drift.path.startsWith("targets."));
  const rest = drifts.filter((drift) => !drift.path.startsWith("targets."));

  console.log("\n  target drift:");
  console.log(formatDrift(targetDrift));
  console.log(`\n  other drift: ${rest.length} value(s)`);
  if (rest.length > 0) console.log(formatDrift(rest, verbose ? 500 : 20));

  return drifts.length;
}

function reportChallenge(fresh: ChallengeReport, verbose: boolean): number {
  const baseline = readBaseline<ChallengeReport>("challenge");
  const drifts = diffValues(baseline.data, fresh);

  const failures = Object.values(fresh.failures).reduce((sum, list) => sum + list.length, 0);
  console.log(heading(`Daily challenge  (${fresh.days} days)`));
  console.log(`  dealer failures: ${failures}   (must be 0)`);
  if (failures > 0) console.log(`  ${JSON.stringify(fresh.failures)}`);
  console.log(`  days nobody could score on: ${fresh.scores.zeroScoreDays.length}`);
  console.log(`  best score across sampled days: median ${fresh.scores.best.median}, max ${fresh.scores.best.max}`);
  console.log(`\n  drift: ${drifts.length} value(s)`);
  if (drifts.length > 0) console.log(formatDrift(drifts, verbose ? 500 : 20));

  return drifts.length + failures;
}

function check(selected: BaselineName[], verbose: boolean): number {
  console.log(heading("Checking against stored baselines"));
  let problems = 0;

  if (selected.includes("fingerprints")) {
    const fresh = timed("fingerprints", runFingerprints) as FingerprintReport;
    problems += reportFingerprints(fresh, verbose);
  }
  if (selected.includes("aggregate")) {
    const fresh = timed("aggregate", runAggregate) as AggregateReport;
    problems += reportAggregate(fresh, verbose);
  }
  if (selected.includes("challenge")) {
    const fresh = timed("challenge", runChallenge) as ChallengeReport;
    problems += reportChallenge(fresh, verbose);
  }

  console.log(heading(problems === 0 ? "No drift. The game is unchanged." : `${problems} difference(s) found.`));
  return problems;
}

function parseSelection(args: string[]): BaselineName[] {
  const only = args.filter((arg) => (BASELINE_NAMES as string[]).includes(arg)) as BaselineName[];
  return only.length > 0 ? only : BASELINE_NAMES;
}

function main(): void {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const command = args[0] ?? "check";
  const verbose = args.includes("--verbose");
  const selected = parseSelection(args.slice(1));

  if (command === "capture") {
    capture(selected);
    return;
  }
  if (command === "check") {
    const problems = check(selected, verbose);
    process.exitCode = problems === 0 ? 0 : 1;
    return;
  }

  console.error(`Unknown command "${command}". Use "capture" or "check".`);
  process.exitCode = 2;
}

main();

export type { Drift };
