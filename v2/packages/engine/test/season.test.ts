import { describe, expect, it } from "vitest";
import {
  ageValueFactor,
  baseMarketValue,
  breakthroughChance,
  createRng,
  marketValue,
  rollBreakthrough,
  scoutLevel,
  scoutReading,
  squadRole,
  TALENT_BANDS,
} from "../src";

describe("papel no elenco (GDD 11.2)", () => {
  it("segue a escada de linha pelos limiares do GDD", () => {
    expect(squadRole("st", 83, 80).role).toBe("star");
    expect(squadRole("st", 79, 80).role).toBe("starter");
    expect(squadRole("st", 76, 80).role).toBe("rotation");
    expect(squadRole("st", 72, 80).role).toBe("reserve");
    expect(squadRole("st", 71, 80).role).toBe("surplus");
    expect(squadRole("st", 83, 80).participation).toBe(0.95);
  });

  it("goleiro tem escada própria", () => {
    expect(squadRole("gk", 78, 80).role).toBe("starter");
    expect(squadRole("gk", 73, 80).role).toBe("reserve");
    expect(squadRole("gk", 72, 80).role).toBe("third");
  });

  it("chance de ganhar espaço fica entre 2% e 8%", () => {
    expect(breakthroughChance(0)).toBe(0.08);
    expect(breakthroughChance(-30)).toBe(0.02);
  });

  it("titular não sorteia nada; reserva às vezes sobe um degrau", () => {
    const rng = createRng("degrau");
    const starter = squadRole("st", 80, 80);
    expect(rollBreakthrough(rng, "st", starter)).toBe(starter);
    let promoted = 0;
    for (let index = 0; index < 4000; index += 1) {
      if (rollBreakthrough(rng, "st", squadRole("st", 74, 80)).role === "rotation") promoted += 1;
    }
    expect(promoted / 4000).toBeGreaterThan(0.04);
    expect(promoted / 4000).toBeLessThan(0.08);
  });
});

describe("leitura do olheiro (GDD 9.9)", () => {
  it("os portões exigem idade e jogos ao mesmo tempo", () => {
    expect(scoutLevel(19, 500)).toBe("observing");
    expect(scoutLevel(20, 59)).toBe("observing");
    expect(scoutLevel(20, 60)).toBe("rumour");
    expect(scoutLevel(24, 180)).toBe("approximate");
    expect(scoutLevel(29, 350)).toBe("certain");
    expect(scoutLevel(35, 200)).toBe("approximate");
  });

  it("em observação não mostra nada; certeira mostra a faixa verdadeira", () => {
    expect(scoutReading("s", "star", 18, 40).bands).toEqual([]);
    expect(scoutReading("s", "star", 30, 400).bands).toEqual(["star"]);
  });

  it("boato e aproximada mostram duas faixas vizinhas, fixas para a mesma carreira", () => {
    for (let index = 0; index < 300; index += 1) {
      for (const truth of TALENT_BANDS) {
        const reading = scoutReading(`olheiro-${index}`, truth, 21, 90);
        const [low, high] = reading.bands.map((band) => TALENT_BANDS.indexOf(band));
        expect(reading.bands).toHaveLength(2);
        expect((high ?? 0) - (low ?? 0)).toBe(1);
        expect(scoutReading(`olheiro-${index}`, truth, 22, 120)).toEqual(reading);
      }
    }
  });

  it("a leitura aproximada sempre passa a no máximo uma faixa da verdade", () => {
    for (let index = 0; index < 300; index += 1) {
      const reading = scoutReading(`perto-${index}`, "class", 25, 200);
      const distances = reading.bands.map((band) => Math.abs(TALENT_BANDS.indexOf(band) - 2));
      expect(Math.min(...distances)).toBeLessThanOrEqual(1);
    }
  });
});

describe("valor de mercado (GDD 9.10)", () => {
  it("segue a fórmula: OVR 90 aos 25 vale perto de 180 milhões", () => {
    expect(baseMarketValue(90, 25) / 1e6).toBeCloseTo(180, 0);
    expect(baseMarketValue(50, 25)).toBe(110_000);
  });

  it("idade pesa: jovem vale mais, veterano bem menos", () => {
    expect(ageValueFactor(20)).toBeGreaterThan(ageValueFactor(26));
    expect(ageValueFactor(34)).toBe(0.22);
  });

  it("o humor do mercado fica em ±6% e o valor sai em três algarismos", () => {
    const rng = createRng("mercado");
    for (let index = 0; index < 500; index += 1) {
      const value = marketValue(rng, 80, 26);
      const base = baseMarketValue(80, 26);
      expect(value / base).toBeGreaterThan(0.93);
      expect(value / base).toBeLessThan(1.07);
      expect(Number(value.toPrecision(3))).toBe(value);
    }
  });
});
