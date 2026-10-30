import { autoplay, createCareer, saveOf } from "@craque/engine";
import { describe, expect, it } from "vitest";
import { useCareer } from "./store";

describe("D110: a linha alternativa do hipotético refaz o sorteio", () => {
  it("a carreira nova leva uma troca a partir da decisão escolhida, com sal próprio", () => {
    const finished = autoplay(createCareer({ seed: "d110-hipotetico", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: null } }), "balanced");
    const save = saveOf(finished);
    expect(useCareer.getState().branch(save, null, 6)).toBe(true);
    const first = useCareer.getState().career!.setup.rerolls;
    expect(first).toHaveLength(1);
    expect(first![0]!.from).toBe(save.choices[6]!.decision);
    expect(useCareer.getState().branch(save, null, 6)).toBe(true);
    // Cada nova linha alternativa sorteia de novo: o sal muda.
    expect(useCareer.getState().career!.setup.rerolls![0]!.salt).not.toBe(first![0]!.salt);
  });
});
