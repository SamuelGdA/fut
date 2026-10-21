import { describe, expect, it } from "vitest";
import { matchOutcomeText, matchStory } from "../src";
import { matchScenes, POSITIONS, type KeyMatchResult } from "@craque/engine";

describe("D82: voz editorial", () => {
  for (const locale of ["pt", "en", "es"] as const) it(`${locale}: todas as cenas falam do atleta em terceira pessoa`, () => {
    for (const position of POSITIONS) for (const scene of new Set([...matchScenes(position, false), ...matchScenes(position, true)])) {
      for (const action of ["bold", "team", "safe", "left", "right", "take", "leave"]) for (const success of [true, false]) {
        const result: KeyMatchResult = { match: { scene, competition: "brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 88, score: [1, 1] }, action, success, won: success, score: success ? [2, 1] : [1, 2], penalties: null, goals: Number(success), assists: 0, fans: 0, legacy: 0 };
        const story = matchStory(locale, result, position, "MOREIRA");
        expect(story.body).toContain("MOREIRA");
        expect(story.body).not.toMatch(/\b(você|seu|sua|you|your|tu|tus|elegiste|conectaste|remataste|subiste|sacaste|dejaste|convertiste|paraste|protegiste|guardaste|diste|pudiste|querías)\b/i);
        expect(story.body).not.toMatch(/[—–]/);
      }
    }
  });
  it("a voz da partida continua direta sem contaminar o jornal", () => {
    const result: KeyMatchResult = { match: { scene: "throughBall", competition: "brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 88, score: [1, 1] }, action: "bold", success: true, won: true, score: [2, 1], penalties: null, goals: 1, assists: 0, fans: 0, legacy: 0 };
    expect(matchOutcomeText("pt", result, "st")).toContain("Sua finalização");
    expect(matchOutcomeText("pt", result, "st", false, "newspaper")).not.toMatch(/Você|Sua/);
    expect(matchStory("pt", result, "st", "MOREIRA").body).toContain("A finalização");
  });
});
