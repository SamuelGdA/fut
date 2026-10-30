import { createPlayer, drawTalent, stream } from "@craque/engine";
import { describe, expect, it } from "vitest";
import { FIRST_CAREER_TRIES, firstCareerSeed } from "./newCareer";

describe("D108, D109: a primeira carreira nasce Craque ou Estrela", () => {
  it("sorteia a semente de novo enquanto não der Craque ou Estrela, nas duas dificuldades", () => {
    for (const difficulty of ["normal", "hard"] as const) {
      let counter = 0;
      for (let round = 0; round < 200; round++) {
        const seed = firstCareerSeed(difficulty, () => `primeira-${difficulty}-${counter++}`);
        expect(["class", "star"]).toContain(createPlayer({ seed, position: "st", difficulty }).talent);
      }
    }
  });

  it("a semente escolhida é a de uma carreira comum: o talento sai do mesmo fluxo do motor", () => {
    let counter = 0;
    const seed = firstCareerSeed("normal", () => `fluxo-${counter++}`);
    expect(drawTalent(stream(seed, "birth", "talent"), "normal")).toBe(createPlayer({ seed, position: "cm", difficulty: "normal" }).talent);
    expect(counter).toBeLessThanOrEqual(FIRST_CAREER_TRIES);
  });
});
