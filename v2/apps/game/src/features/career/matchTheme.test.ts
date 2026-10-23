import { createCareer } from "@craque/engine";
import { describe, expect, it } from "vitest";
import { broadcastIdentity } from "./broadcast";
import { matchTheme } from "./matchTheme";

const career = createCareer({ seed: "d73-paleta", startYear: 2026, pace: "normal", difficulty: "normal", identity: { surname: "PALETA", nationality: "BRA", foot: "right", position: "st", dreamNumber: null } });
function theme(competition: string, national: boolean) {
  return matchTheme({ ...career, decision: { ...career.decision!, match: { competition, national, team: national ? "BRA" : "palmeiras", opponent: national ? "ARG" : "santos", stage: "final", minute: 86, score: [1, 1], scene: "lastAttack" } } }) as Record<string, unknown>;
}

describe("variáveis da transmissão na tela da carreira", () => {
  it("fora de uma partida, nenhuma variável", () => {
    expect(matchTheme({ ...career, decision: { ...career.decision!, match: undefined } })).toEqual({});
  });

  it.each([["nations:UEFA", true], ["nations:CONMEBOL", true], ["worldcup", true], ["cont1:UEFA", false], ["cont1:CONMEBOL", false], ["league:brasileirao", false]] as const)("%s publica acento, brilho e o fundo do estádio", (competition, national) => {
    const style = theme(competition, national);
    const identity = broadcastIdentity({ competition, national, team: national ? "BRA" : "palmeiras", opponent: national ? "ARG" : "santos" });
    expect(style["--match-accent"]).toBe(identity.palette.accent);
    expect(style["--match-glow"]).toBe(identity.team.glow);
    expect(style["--bc-deep"]).toBe(identity.palette.deep);
    expect(style["--match-bg-gradient"]).toContain("color-mix");
  });

  it("seleção dentro da UEFA ou da CONMEBOL não vira atmosfera de clube", () => {
    expect(theme("nations:UEFA", true)["--match-accent"]).toBe("#dbe5ef");
    expect(theme("nations:CONMEBOL", true)["--match-accent"]).toBe("#dbe5ef");
    expect(theme("cont1:UEFA", false)["--bc-accent"]).not.toBe(theme("nations:UEFA", true)["--bc-accent"]);
    expect(theme("cont1:CONMEBOL", false)["--bc-metal"]).toBe("#d4af37");
  });
});
