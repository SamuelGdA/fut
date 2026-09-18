/**
 * Comparing a fresh run against a stored baseline.
 *
 * The comparison is **exact**, not tolerant, and that is deliberate. The
 * corpus is fixed and the simulation is deterministic, so two runs of the same
 * code produce byte-identical numbers; a tolerance band would only ever hide a
 * real change. Magnitude is still reported, because when a number does move
 * the first question is always "by how much".
 *
 * The one caveat worth knowing: `Math.pow`, `Math.exp` and `Math.log2` are not
 * guaranteed bit-identical between JavaScript engines, and the simulation uses
 * all three. Within one machine and one Node major they are stable, which is
 * the case this tool is built for. The environment block stored alongside each
 * baseline is there so a mismatch after an upgrade reads as an explanation
 * rather than as a mystery.
 */

export interface Drift {
  path: string;
  before: unknown;
  after: unknown;
  /** Present when both sides are numbers. */
  delta?: number;
  /** Percentage change, when the baseline was not zero. */
  pct?: number;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function diffValues(before: unknown, after: unknown, path = ""): Drift[] {
  if (typeof before === "number" && typeof after === "number") {
    if (before === after) return [];
    const delta = Math.round((after - before) * 1e6) / 1e6;
    const pct = before === 0 ? undefined : Math.round(((after - before) / before) * 1000) / 10;
    return [{ path, before, after, delta, ...(pct === undefined ? {} : { pct }) }];
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const drifts: Drift[] = [];
    const length = Math.max(before.length, after.length);
    for (let i = 0; i < length; i += 1) {
      drifts.push(...diffValues(before[i], after[i], `${path}[${i}]`));
    }
    return drifts;
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    return keys.flatMap((key) =>
      diffValues(before[key], after[key], path ? `${path}.${key}` : key),
    );
  }

  if (before === after) return [];
  return [{ path, before, after }];
}

export interface FingerprintDrift {
  id: string;
  kind: "changed" | "added" | "removed";
  /** The first age whose season stopped matching, when there is one. */
  divergedAtAge: number | null;
  summaryDrift: Drift[];
}

interface PrintLike {
  id: string;
  digest: string;
  summary: Record<string, unknown>;
  seasonPrints: { age: number; digest: string }[];
}

/**
 * Fingerprints get their own comparison so the answer is "career fp-014
 * diverged at age 24" rather than a page of changed hex.
 */
export function diffFingerprints(
  before: PrintLike[],
  after: PrintLike[],
): FingerprintDrift[] {
  const byId = new Map(before.map((print) => [print.id, print]));
  const seen = new Set<string>();
  const drifts: FingerprintDrift[] = [];

  for (const current of after) {
    seen.add(current.id);
    const baseline = byId.get(current.id);
    if (!baseline) {
      drifts.push({ id: current.id, kind: "added", divergedAtAge: null, summaryDrift: [] });
      continue;
    }
    if (baseline.digest === current.digest) continue;

    let divergedAtAge: number | null = null;
    const length = Math.max(baseline.seasonPrints.length, current.seasonPrints.length);
    for (let i = 0; i < length; i += 1) {
      const a = baseline.seasonPrints[i];
      const b = current.seasonPrints[i];
      if (!a || !b || a.digest !== b.digest) {
        divergedAtAge = b?.age ?? a?.age ?? null;
        break;
      }
    }

    drifts.push({
      id: current.id,
      kind: "changed",
      divergedAtAge,
      summaryDrift: diffValues(baseline.summary, current.summary),
    });
  }

  for (const baseline of before) {
    if (!seen.has(baseline.id)) {
      drifts.push({ id: baseline.id, kind: "removed", divergedAtAge: null, summaryDrift: [] });
    }
  }

  return drifts;
}
