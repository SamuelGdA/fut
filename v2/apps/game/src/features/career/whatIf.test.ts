import { describe, expect, it } from "vitest";
import { autoplay, createCareer, saveOf } from "@craque/engine";
import { decisionPoints } from "./whatIf";

const career = autoplay(createCareer({ seed: "hypothetical-d68", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "Teste", nationality: "BRA", position: "lw", foot: "right", dreamNumber: 11 } }), "balanced");
describe("hipotético em sessões com ajustes de teste", () => {
  it("lista os pontos reproduzíveis da carreira completa nos três idiomas", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      const points = decisionPoints(saveOf(career), locale);
      expect(points).toHaveLength(career.choices.length);
      expect(points[0]!.title).toBeTruthy();
    }
  });
  it("uma opção de teste incompatível não derruba os pontos válidos anteriores", () => {
    const save = saveOf(career), choices = [...save.choices];
    choices[2] = { ...choices[2]!, option: "oferta-apenas-no-debug" };
    expect(decisionPoints({ ...save, choices }, "pt")).toHaveLength(2);
  });
});
