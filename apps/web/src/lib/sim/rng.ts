/** Deterministic RNG: FNV-1a seed hash + xorshift32, mirroring the original game. */

export interface Rng {
  seed: string;
  state: number;
}

export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0 || 1;
}

export function createRng(seed: string): Rng {
  return { seed, state: hashSeed(seed) };
}

function nextState(rng: Rng): { rng: Rng; value: number } {
  let s = rng.state;
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  const out = s >>> 0 || 1;
  return { rng: { seed: rng.seed, state: out }, value: out / 4294967296 };
}

export function nextFloat(rng: Rng, min = 0, max = 1): { rng: Rng; value: number } {
  const r = nextState(rng);
  return { rng: r.rng, value: min + r.value * (max - min) };
}

export function nextInt(rng: Rng, min: number, max: number): { rng: Rng; value: number } {
  const r = nextFloat(rng, 0, 1);
  return { rng: r.rng, value: Math.floor(r.value * (max - min + 1)) + min };
}

export function chance(rng: Rng, probability: number): { rng: Rng; success: boolean } {
  const p = Math.max(0, Math.min(1, probability));
  const r = nextFloat(rng, 0, 1);
  return { rng: r.rng, success: r.value < p };
}

export function pickOne<T>(rng: Rng, items: T[]): { rng: Rng; item: T } {
  if (items.length === 0) throw new Error("Cannot pick from an empty list.");
  const r = nextInt(rng, 0, items.length - 1);
  return { rng: r.rng, item: items[r.value] };
}

export function pickWeighted<T>(
  rng: Rng,
  options: { item: T; weight: number }[],
): { rng: Rng; item: T } {
  const total = options.reduce((sum, o) => sum + Math.max(0, o.weight), 0);
  if (options.length === 0 || total <= 0) {
    throw new Error("Cannot pick from empty or zero-weight options.");
  }
  const r = nextFloat(rng, 0, total);
  let acc = 0;
  for (const o of options) {
    acc += Math.max(0, o.weight);
    if (r.value <= acc) return { rng: r.rng, item: o.item };
  }
  return { rng: r.rng, item: options[options.length - 1].item };
}

export function shuffle<T>(rng: Rng, items: T[]): { rng: Rng; items: T[] } {
  const copy = [...items];
  let cur = rng;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const r = nextInt(cur, 0, i);
    cur = r.rng;
    [copy[i], copy[r.value]] = [copy[r.value], copy[i]];
  }
  return { rng: cur, items: copy };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
