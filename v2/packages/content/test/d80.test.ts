import { describe, expect, it } from "vitest";
import { matchStory } from "../src/matchStory";
import type { KeyMatchResult } from "@craque/engine";

const result: KeyMatchResult = { match: { scene: "throughBall", competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 87, score: [1, 2] }, action: "bold", success: true, won: false, score: [2, 2], penalties: null, goals: 0, assists: 1, fans: 3, legacy: 2 };
describe("D80: crônica de reação", () => {
  for (const locale of ["pt", "en", "es"] as const) it(`${locale}: relata empate sem inventar vitória nem derrota`, () => {
    const text = matchStory(locale, result, "st", "MOREIRA").body;
    expect(text).toContain("1 × 2"); expect(text).toContain("87"); expect(text).toContain("MOREIRA");
    expect(text).not.toMatch(/Três pontos|Three points|Tres puntos|A derrota deixou|after the defeat|La derrota dejó/);
  });
});
