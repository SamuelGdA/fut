import { describe, expect, it } from "vitest";
import { readBaseline } from "../src/baselines";
import { diffFingerprints, diffValues } from "../src/report/diff";
import { runAggregate, type AggregateReport } from "../src/runners/aggregate";
import { runChallenge, type ChallengeReport } from "../src/runners/challenge";
import { printCareer, runFingerprints, type FingerprintReport } from "../src/runners/fingerprints";
import { fingerprintCorpus } from "../src/corpus";

/**
 * The gate.
 *
 * These do not assert that the balance is good. They assert that it has not
 * moved since it was captured, which is a different and much more useful
 * thing to know while a refactor is in flight: every number below was tuned
 * over many measured iterations, and none of it is obvious from reading the
 * code, so the only way a silent change gets caught is if something is
 * watching for it.
 *
 * When one of these fails after a deliberate change, the fix is to look at
 * the reported drift, decide it was intended, and re-capture. Never to widen
 * the assertion.
 */

describe("the game has not changed", () => {
  it("reproduces every fingerprinted career exactly", () => {
    const baseline = readBaseline<FingerprintReport>("fingerprints");
    const fresh = runFingerprints();

    expect(fresh.stalled, "careers that never reached retirement").toEqual([]);
    expect(fresh.corpusSize).toBe(baseline.data.corpusSize);

    const drifts = diffFingerprints(baseline.data.careers, fresh.careers);
    const readable = drifts
      .slice(0, 10)
      .map((drift) => `${drift.id} (${drift.kind}, age ${drift.divergedAtAge ?? "?"})`);
    expect(drifts, `careers diverged: ${readable.join(", ")}`).toHaveLength(0);
  });

  it("reproduces every aggregate statistic exactly", () => {
    const baseline = readBaseline<AggregateReport>("aggregate");
    const fresh = runAggregate();

    // Reported first so a failure names the design targets before the wall of
    // distributions underneath them.
    expect(fresh.targets).toEqual(baseline.data.targets);
    expect(diffValues(baseline.data, fresh)).toHaveLength(0);
  });

  it("reproduces the daily challenge exactly, and deals no impossible day", () => {
    const baseline = readBaseline<ChallengeReport>("challenge");
    const fresh = runChallenge();

    expect(fresh.failures.fewerThanThreeAxes).toEqual([]);
    expect(fresh.failures.noSharedPosition).toEqual([]);
    expect(fresh.failures.contradiction).toEqual([]);
    expect(fresh.failures.edictConflict).toEqual([]);
    expect(fresh.scores.zeroScoreDays, "days nobody can score on").toEqual([]);

    expect(fresh.dealDigest).toBe(baseline.data.dealDigest);
    expect(diffValues(baseline.data, fresh)).toHaveLength(0);
  });
});

describe("the harness itself", () => {
  it("plays the same career twice from one spec", () => {
    const spec = fingerprintCorpus()[7]!;
    expect(printCareer(spec).print.digest).toBe(printCareer(spec).print.digest);
  });

  /**
   * Without this, a comparator that quietly returned "no difference" would
   * make every assertion above pass forever while measuring nothing.
   */
  it("notices a difference when there is one", () => {
    const baseline = readBaseline<FingerprintReport>("fingerprints");
    const tampered = structuredClone(baseline.data.careers);
    tampered[3]!.seasonPrints[2]!.digest = "deadbeefdeadbeef";
    tampered[3]!.digest = "deadbeefdeadbeef";
    tampered[3]!.summary.goals += 1;

    const drifts = diffFingerprints(baseline.data.careers, tampered);
    expect(drifts).toHaveLength(1);
    expect(drifts[0]!.id).toBe(baseline.data.careers[3]!.id);
    expect(drifts[0]!.divergedAtAge).toBe(baseline.data.careers[3]!.seasonPrints[2]!.age);
    expect(drifts[0]!.summaryDrift.map((entry) => entry.path)).toContain("goals");
  });

  it("notices a numeric difference and reports its size", () => {
    const drifts = diffValues({ a: { b: 10 } }, { a: { b: 12 } });
    expect(drifts).toEqual([{ path: "a.b", before: 10, after: 12, delta: 2, pct: 20 }]);
  });
});
