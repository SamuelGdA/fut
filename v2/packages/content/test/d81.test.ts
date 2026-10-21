import { describe, expect, it } from "vitest";
import { matchOutcomeText, matchStory } from "../src";
import type { KeyMatchResult } from "@craque/engine";

const result: KeyMatchResult = { match: { scene: "throughBall", competition: "brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 85, score: [2, 2] }, action: "safe", success: true, won: false, score: [2, 3], penalties: null, goals: 0, assists: 0, fans: 0, legacy: 0 };
describe("D81: ação e resultado do time", () => {
  for (const locale of ["pt", "en", "es"] as const) it(`${locale}: distingue todas as opções e não narra gol em empate após erro`, () => {
    const reports = ["bold", "team", "safe"].map(action => matchOutcomeText(locale, { ...result, action }, "st"));
    expect(new Set(reports).size).toBe(3);
    expect(reports[2]).toMatch(/derrota|defeat/);
    const draw = { ...result, action: "bold", success: false, score: [2, 2] as const };
    expect(matchOutcomeText(locale, draw, "st")).not.toMatch(/definiu a derrota|settle the defeat|decidió la derrota/);
    expect(matchStory(locale, draw, "st").body).not.toMatch(/A reação|comeback|La reacción|adversário aproveitou/);
    expect(JSON.stringify(reports)).not.toMatch(/[—–]/);
  });
});
