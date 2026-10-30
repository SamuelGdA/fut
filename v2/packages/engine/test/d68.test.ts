import { describe, expect, it } from "vitest";
import { baseMarketValue, marketValue, MAX_MARKET_VALUE } from "../src/player/value";
import { productionRates, finishingOpportunities, type ProductionInput } from "../src/season/production";
import { stream } from "../src/rng";
import type { Position } from "../src/player/positions";

const input: ProductionInput = { position: "lw", ovr: 94, attributes: [94, 94, 94, 94, 60, 80], trait: "professional", teamStrength: 88, clubStrength: 87, opposition: 80, games: 50 };
const rate = (position: Position, finishing: number) => productionRates({ ...input, position, attributes: [94, finishing, 94, 94, 60, 80] }).goalsPerGame;

describe("D68: oportunidades dos finalizadores e valor", () => {
  it("um ponta excepcional se aproxima de um centroavante e o finalizador comum segue abaixo dele", () => {
    expect(rate("lw", 99) / rate("st", 99)).toBeGreaterThan(0.9);
    // D100: a ponta Fenômeno chega à temporada recorde (perto de 2%); com finalização comum, segue abaixo do centroavante.
    expect(rate("lw", 80) / rate("st", 80)).toBeLessThan(0.92);
    expect(rate("lw", 99) / rate("st", 99)).toBeLessThanOrEqual(1.3 + 1e-9);
    expect(rate("rw", 99)).toBe(rate("lw", 99));
    expect(rate("lw", 99) * 50).toBeGreaterThan(30);
    // D100: o finalizador de elite da ponta passa dos 50 gols esperados em 50 jogos, mas não chega aos 60 de todo ano.
    expect(rate("lw", 99) * 50).toBeLessThan(55);
  });
  it("meias finalizadores melhoram, preservando a diferença de oportunidades entre funções", () => {
    // D100: a ordem das funções vale com a finalização comum; no topo, a ponta e o meia de elite podem passar o centroavante.
    const order = (["st", "lw", "cam", "lm", "cm"] as const).map(position => rate(position, 80));
    expect(order.every((value, i) => !i || value < order[i - 1]!)).toBe(true);
    const elite = (["lw", "cam", "lm", "cm", "cdm", "cb", "gk"] as const).map(position => rate(position, 99));
    expect(elite.every((value, i) => !i || value < elite[i - 1]!)).toBe(true);
    expect(rate("cm", 99) * 50).toBeGreaterThan(10);
    expect(rate("cm", 99) * 50).toBeLessThan(20);
    expect(rate("cm", 99)).toBeGreaterThan(rate("cm", 80) * 2);
    expect(finishingOpportunities("st", 99)).toBe(0);
    expect(finishingOpportunities("cb", 99)).toBe(0);
  });
  it("a melhoria é gradual, monotônica e não muda a taxa-base de finalização comum", () => {
    for (const position of ["lw", "rw", "cam", "lm", "rm", "cm", "cdm"] as const) {
      expect(finishingOpportunities(position, 80)).toBe(0);
      const rates = Array.from({ length: 60 }, (_, i) => rate(position, 40 + i));
      expect(rates.every((value, i) => !i || value > rates[i - 1]!)).toBe(true);
      // D110: o batedor fora do ataque soma um pouco de gol de bola parada a partir de 80.
      expect(rate(position, 81) / rate(position, 80)).toBeLessThan(1.06);
    }
  });
  it("o valor nunca ultrapassa €400M, nem com humor positivo ou atributos extremos de teste", () => {
    const rng = stream("value-d68", "market");
    for (let age = 16; age <= 40; age++) for (let ovr = 40; ovr <= 110; ovr++) {
      expect(baseMarketValue(ovr, age)).toBeLessThanOrEqual(MAX_MARKET_VALUE);
      expect(marketValue(rng, ovr, age)).toBeLessThanOrEqual(MAX_MARKET_VALUE);
    }
    expect(baseMarketValue(99, 20)).toBeGreaterThan(350_000_000);
    expect(baseMarketValue(95, 20)).toBeLessThan(250_000_000);
    expect(baseMarketValue(99, 30)).toBeLessThan(200_000_000);
    expect(baseMarketValue(99, 34)).toBeLessThan(70_000_000);
  });
  it("a idade e qualidade ainda contam e o valor não salta na transição do OVR 80", () => {
    for (let age = 16; age <= 40; age++) for (let ovr = 40; ovr < 99; ovr++) expect(baseMarketValue(ovr + 1, age)).toBeGreaterThanOrEqual(baseMarketValue(ovr, age));
    expect(baseMarketValue(81, 25) / baseMarketValue(80, 25)).toBeCloseTo(Math.exp(0.12));
    expect(baseMarketValue(99, 25)).toBeGreaterThan(baseMarketValue(99, 30));
  });
});
