import fc from "fast-check";
import { describe, it } from "vitest";
import {
  CAPACITY_RANGE,
  CLUB_POLICIES,
  FOCUS_POLICIES,
  FOCUS_SLOT,
  ovrOf,
  PACES,
  POSITIONS,
  runDevelopment,
  TRAINING_CAP,
  DIFFICULTIES,
  type DevelopmentInput,
} from "../src";

/**
 * Propriedades (GDD 40.2): invariantes da seção 39 em centenas de carreiras
 * sorteadas pelo fast-check, com semente fixa para o resultado ser estável.
 */

const careerInput: fc.Arbitrary<DevelopmentInput> = fc.record({
  seed: fc.string({ minLength: 1, maxLength: 24 }),
  position: fc.constantFrom(...POSITIONS),
  difficulty: fc.constantFrom(...DIFFICULTIES),
  pace: fc.constantFrom(...PACES),
  clubPolicy: fc.constantFrom(...CLUB_POLICIES),
  focusPolicy: fc.constantFrom(...FOCUS_POLICIES),
});

const settings = { numRuns: 250, seed: 20260930 } as const;

describe("invariantes da evolução em carreiras sorteadas", () => {
  it("o OVR é sempre lido dos atributos, e eles ficam entre 1 e 99 (invariantes 1 e 3)", () => {
    fc.assert(
      fc.property(careerInput, (input) => {
        const run = runDevelopment(input);
        for (const season of run.seasons) {
          if (season.ovr !== ovrOf(input.position, season.attributes)) return false;
          if (season.attributes.some((value) => value < 1 || value > 99)) return false;
        }
        return true;
      }),
      settings,
    );
  });

  it("nenhuma temporada sobe 10 ou mais de OVR, nem cai 8 ou mais", () => {
    fc.assert(
      fc.property(careerInput, (input) => {
        const run = runDevelopment(input);
        let previous = run.ovrAtStart;
        for (const season of run.seasons) {
          const delta = season.ovr - previous;
          if (delta >= 10 || delta <= -8) return false;
          previous = season.ovr;
        }
        return true;
      }),
      settings,
    );
  });

  it("capacidade e treino ficam nas faixas, e o nível não passa muito do potencial", () => {
    fc.assert(
      fc.property(careerInput, (input) => {
        const run = runDevelopment(input);
        for (const season of run.seasons) {
          if (season.capacity < CAPACITY_RANGE.min || season.capacity > CAPACITY_RANGE.max) return false;
        }
        if (run.final.training.some((value) => value < 0 || value > TRAINING_CAP)) return false;
        return run.seasons.every((season) => season.ovr <= run.born.potential + 4);
      }),
      settings,
    );
  });

  it("a mesma entrada produz a mesma carreira, byte a byte (invariante 5)", () => {
    fc.assert(
      fc.property(careerInput, (input) => JSON.stringify(runDevelopment(input)) === JSON.stringify(runDevelopment(input))),
      { ...settings, numRuns: 80 },
    );
  });

  it("toda carreira vai dos 16 aos 39 e termina (invariante 7)", () => {
    fc.assert(
      fc.property(careerInput, (input) => {
        const run = runDevelopment(input);
        return run.seasons.length === 24 && run.seasons[0]?.age === 16 && run.seasons[23]?.age === 39;
      }),
      { ...settings, numRuns: 60 },
    );
  });

  it("o foco de treino termina o período pelo menos 2 acima do começo no atributo treinado (D42)", () => {
    fc.assert(
      fc.property(careerInput, (input) => {
        const run = runDevelopment({ ...input, focusPolicy: input.focusPolicy === "none" ? "best" : input.focusPolicy });
        const length = input.pace === "intense" ? 1 : 2;
        for (let start = 0; start < run.seasons.length; start += length) {
          const first = run.seasons[start];
          const last = run.seasons[Math.min(start + length, run.seasons.length) - 1];
          if (!first?.focus || !last) continue;
          const slot = FOCUS_SLOT[first.focus];
          const begin = first.startAttributes[slot];
          const capped = last.training[slot] >= TRAINING_CAP;
          if (!capped && last.attributes[slot] < Math.min(99, begin + 2)) return false;
        }
        return true;
      }),
      { ...settings, numRuns: 150 },
    );
  });
});
