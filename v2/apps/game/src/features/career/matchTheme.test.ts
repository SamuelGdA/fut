import { createCareer } from "@craque/engine";
import { getCountry } from "@craque/world";
import { describe, expect, it } from "vitest";
import { matchTheme } from "./matchTheme";

const career = createCareer({ seed: "d73-paleta", startYear: 2026, pace: "normal", difficulty: "normal", identity: { surname: "PALETA", nationality: "BRA", foot: "right", position: "st", dreamNumber: null } });
function theme(competition: string, national: boolean) {
  return matchTheme({ ...career, decision: { ...career.decision!, match: { competition, national, team: national ? "BRA" : "palmeiras", opponent: national ? "ARG" : "santos", stage: "final", minute: 86, score: [1, 1], scene: "lastAttack" } } }) as Record<string, unknown>;
}

describe("atmosferas de clubes e seleções", () => {
  it.each(["nations:UEFA", "nations:CONMEBOL"])("%s conserva o uniforme da seleção e o detalhe prateado", (competition) => {
    const style = theme(competition, true);
    expect(style["--match-bg-gradient"]).toContain(getCountry("BRA")!.kit.base);
    expect(style["--match-accent"]).toBe("#dbe5ef");
    expect(style["--match-glow"]).toBe(getCountry("BRA")!.kit.base);
  });
  it("a Copa do Mundo conserva o uniforme com detalhe dourado", () => {
    expect(theme("worldcup", true)["--match-accent"]).toBe("#efcf87");
    expect(theme("worldcup", true)["--match-bg-gradient"]).toContain(getCountry("BRA")!.kit.base);
  });
  it("clubes europeus e sul-americanos preservam identidades distintas", () => {
    expect(theme("cont1:UEFA", false)["--match-glow"]).toBe("#2d58be");
    expect(theme("cont1:CONMEBOL", false)["--match-accent"]).toBe("#e8c274");
  });
});
