import { describe, expect, it } from "vitest";
import { createRng, stream } from "../src";

const sample = (count: number, draw: () => number) => Array.from({ length: count }, draw);
const average = (values: readonly number[]) => values.reduce((total, value) => total + value, 0) / values.length;
const variance = (values: readonly number[]) => {
  const mean = average(values);
  return average(values.map((value) => (value - mean) ** 2));
};

describe("gerador semeado (GDD 8.1)", () => {
  it("a mesma semente dá a mesma sequência", () => {
    const a = createRng("copa-2030");
    const b = createRng("copa-2030");
    expect(sample(50, a.next)).toEqual(sample(50, b.next));
  });

  it("sementes vizinhas dão sequências diferentes", () => {
    expect(createRng("semente-1").next()).not.toBe(createRng("semente-2").next());
  });

  it("cada sistema e cada ano têm um fluxo próprio", () => {
    const growth = stream("carreira", "growth", 2030).next();
    expect(stream("carreira", "season", 2030).next()).not.toBe(growth);
    expect(stream("carreira", "growth", 2031).next()).not.toBe(growth);
    expect(stream("carreira", "growth", 2030).next()).toBe(growth);
  });

  it("reais ficam em [0, 1) e na faixa pedida", () => {
    const rng = createRng("faixas");
    for (let index = 0; index < 5000; index += 1) {
      const unit = rng.next();
      expect(unit).toBeGreaterThanOrEqual(0);
      expect(unit).toBeLessThan(1);
      const value = rng.real(-3, 7);
      expect(value).toBeGreaterThanOrEqual(-3);
      expect(value).toBeLessThan(7);
    }
  });

  it("inteiros incluem as duas pontas e nada fora delas", () => {
    const rng = createRng("dados");
    const seen = new Set(sample(3000, () => rng.int(1, 6)));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(() => rng.int(5, 4)).toThrow();
  });

  it("chance limita p entre 0 e 1", () => {
    const rng = createRng("chance");
    expect(sample(500, () => (rng.chance(-1) ? 1 : 0)).every((value) => value === 0)).toBe(true);
    expect(sample(500, () => (rng.chance(2) ? 1 : 0)).every((value) => value === 1)).toBe(true);
    const hits = sample(20000, () => (rng.chance(0.3) ? 1 : 0));
    expect(average(hits)).toBeCloseTo(0.3, 1);
  });

  it("escolha ponderada ignora peso negativo e recusa soma zero", () => {
    const rng = createRng("pesos");
    const picks = sample(4000, () => (rng.weighted([["a", 3], ["b", -5], ["c", 1]] as const) === "a" ? 1 : 0));
    expect(average(picks)).toBeCloseTo(0.75, 1);
    expect(() => rng.weighted([["a", 0], ["b", -1]] as const)).toThrow();
  });

  it("embaralhar devolve uma permutação e não mexe na lista original", () => {
    const rng = createRng("baralho");
    const original = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]);
    const shuffled = rng.shuffle(original);
    expect([...shuffled].sort()).toEqual([...original]);
    expect(original).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(() => rng.pick([])).toThrow();
  });

  it("a normal tem a média e o desvio pedidos", () => {
    const rng = createRng("normal");
    const values = sample(40000, () => rng.normal(10, 2));
    expect(average(values)).toBeCloseTo(10, 1);
    expect(Math.sqrt(variance(values))).toBeCloseTo(2, 1);
  });

  it("Poisson acerta média e variância, com λ pequeno e grande", () => {
    const rng = createRng("poisson");
    for (const lambda of [0.4, 3, 75]) {
      const values = sample(20000, () => rng.poisson(lambda));
      expect(average(values) / lambda).toBeCloseTo(1, 1);
      expect(variance(values) / lambda).toBeCloseTo(1, 1);
    }
    expect(rng.poisson(0)).toBe(0);
    expect(rng.poisson(-2)).toBe(0);
  });

  it("binomial acerta a média e respeita os limites", () => {
    const rng = createRng("binomial");
    const values = sample(10000, () => rng.binomial(40, 0.25));
    expect(average(values)).toBeCloseTo(10, 0);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThanOrEqual(40);
  });
});
