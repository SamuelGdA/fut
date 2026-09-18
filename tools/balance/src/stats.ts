/** Small, boring summary statistics, rounded so a baseline diff is readable. */

export interface Spread {
  n: number;
  mean: number;
  median: number;
  p90: number;
  min: number;
  max: number;
}

function round(value: number, places = 3): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function spread(values: number[]): Spread {
  if (values.length === 0) {
    return { n: 0, mean: 0, median: 0, p90: 0, min: 0, max: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
  const total = sorted.reduce((sum, value) => sum + value, 0);
  return {
    n: sorted.length,
    mean: round(total / sorted.length),
    median: round(at(0.5)),
    p90: round(at(0.9)),
    min: round(sorted[0]!),
    max: round(sorted[sorted.length - 1]!),
  };
}

/** Counts by key, plus the share each key holds, as a percentage to one decimal. */
export function share(values: string[]): Record<string, { count: number; pct: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const total = values.length || 1;
  const out: Record<string, { count: number; pct: number }> = {};
  for (const key of [...counts.keys()].sort()) {
    const count = counts.get(key)!;
    out[key] = { count, pct: round((count / total) * 100, 1) };
  }
  return out;
}

/** The percentage of a population satisfying a predicate, to two decimals. */
export function rate(population: number, hits: number): number {
  if (population === 0) return 0;
  return round((hits / population) * 100, 2);
}

export { round };
