import { describe, expect, it } from "vitest";
import {
  ageClasses,
  ageOffset,
  ageProfile,
  attributeKeys,
  attributesAt,
  createPlayer,
  KEEPER_ATTRIBUTES,
  namedAttributes,
  OUTFIELD_ATTRIBUTES,
  ovrAt,
  ovrOf,
  type Player,
  POSITIONS,
  positionWeights,
  POTENTIAL_RANGE,
  REFERENCE_AGE,
  TALENT_BANDS,
  weightedLevel,
} from "../src";

/** Jogador neutro para testar a carta: sem DNA e sem treino. */
function neutral(position: Player["position"], capacity: number): Player {
  return {
    position,
    talent: "class",
    potential: 85,
    capacity,
    prodigy: false,
    maturity: "normal",
    peakAge: 27,
    longevity: 0,
    trait: "professional",
    dna: [0, 0, 0, 0, 0, 0],
    training: [0, 0, 0, 0, 0, 0],
  };
}

describe("posições e OVR (GDD 9.3)", () => {
  it("cada linha de pesos soma exatamente 100 (invariante 2)", () => {
    for (const position of POSITIONS) {
      expect(positionWeights(position).reduce((total, weight) => total + weight, 0)).toBe(100);
    }
  });

  it("aos 28, sem treino, o OVR fica a no máximo 1 de L em qualquer posição", () => {
    for (const position of POSITIONS) {
      for (let capacity = 45; capacity <= 92; capacity += 0.7) {
        expect(Math.abs(ovrAt(neutral(position, capacity), REFERENCE_AGE) - capacity)).toBeLessThanOrEqual(1);
      }
    }
  });

  it("o OVR fica entre 1 e 99 mesmo com atributos no limite", () => {
    for (const position of POSITIONS) {
      expect(ovrOf(position, [99, 99, 99, 99, 99, 99])).toBe(99);
      expect(ovrOf(position, [1, 1, 1, 1, 1, 1])).toBeGreaterThanOrEqual(1);
    }
  });

  it("goleiro tem só atributos de goleiro, linha só de linha (GDD 9.2)", () => {
    expect(attributeKeys("gk")).toEqual(KEEPER_ATTRIBUTES);
    expect(attributeKeys("st")).toEqual(OUTFIELD_ATTRIBUTES);
    expect(Object.keys(namedAttributes("gk", [1, 2, 3, 4, 5, 6]))).toEqual([...KEEPER_ATTRIBUTES]);
  });

  it("o desenho da posição aparece na carta: centroavante finaliza, zagueiro defende", () => {
    const striker = attributesAt(neutral("st", 80), REFERENCE_AGE);
    const defender = attributesAt(neutral("cb", 80), REFERENCE_AGE);
    expect(striker[1]).toBeGreaterThan(striker[4] + 20);
    expect(defender[4]).toBeGreaterThan(defender[1] + 20);
  });
});

describe("idade no perfil (GDD 9.5)", () => {
  it("as curvas são contínuas: nenhum atributo muda mais de 2 entre dois anos seguidos", () => {
    for (const ageClass of ["explosive", "physical", "technical", "reading"] as const) {
      for (let age = 16; age < 39; age += 1) {
        expect(Math.abs(ageOffset(ageClass, age + 1) - ageOffset(ageClass, age))).toBeLessThanOrEqual(2);
      }
    }
  });

  it("a explosão vai primeiro e a leitura de jogo por último", () => {
    expect(ageOffset("explosive", 33)).toBeLessThan(ageOffset("technical", 33));
    expect(ageOffset("technical", 33)).toBeLessThan(ageOffset("reading", 33));
  });

  it("goleiro envelhece pela tabela de goleiro", () => {
    expect(ageClasses("gk")[4]).toBe("explosive");
    expect(ageClasses("st")[0]).toBe("explosive");
    expect(ageProfile("gk", 35)[4]).toBeLessThan(ageProfile("gk", 35)[1]);
  });
});

describe("criação do jogador (GDD 9.6 a 9.8)", () => {
  it("a mesma semente cria o mesmo jogador", () => {
    const input = { seed: "joga-bonito", position: "cam", difficulty: "normal" } as const;
    expect(createPlayer(input)).toEqual(createPlayer(input));
  });

  it("todos os campos ficam nas faixas do GDD", () => {
    for (let index = 0; index < 600; index += 1) {
      const position = POSITIONS[index % POSITIONS.length] ?? "st";
      const player = createPlayer({ seed: `faixas-${index}`, position, difficulty: index % 2 ? "hard" : "normal" });
      const [min, max] = POTENTIAL_RANGE[player.talent];
      expect(TALENT_BANDS).toContain(player.talent);
      expect(player.potential).toBeGreaterThanOrEqual(min);
      expect(player.potential).toBeLessThan(max);
      if (!player.prodigy) {
        expect(player.capacity).toBeGreaterThanOrEqual(43);
        expect(player.capacity).toBeLessThanOrEqual(56);
      }
      expect(player.capacity).toBeLessThan(player.potential);
      expect(Math.abs(weightedLevel(position, player.dna))).toBeLessThan(1e-9);
      expect(player.training).toEqual([0, 0, 0, 0, 0, 0]);
      if (position === "gk") expect(player.maturity).toBe("normal");
      for (const value of attributesAt(player, 16)) {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(99);
      }
    }
  });

  it("só Estrela e Fenômeno nascem prodígios, e prontos mas abaixo do teto", () => {
    for (let index = 0; index < 3000; index += 1) {
      const player = createPlayer({ seed: `prodigio-${index}`, position: "st", difficulty: "normal" });
      if (!player.prodigy) continue;
      expect(["star", "phenom"]).toContain(player.talent);
      expect(player.potential - player.capacity).toBeGreaterThanOrEqual(11);
      expect(player.potential - player.capacity).toBeLessThanOrEqual(17);
    }
  });

  it("atributos ficam entre 1 e 99 mesmo em capacidades extremas (invariante 3)", () => {
    for (const position of POSITIONS) {
      for (const capacity of [25, 99]) {
        for (const age of [16, 28, 39]) {
          for (const value of attributesAt(neutral(position, capacity), age)) {
            expect(value).toBeGreaterThanOrEqual(1);
            expect(value).toBeLessThanOrEqual(99);
          }
        }
      }
    }
  });
});
