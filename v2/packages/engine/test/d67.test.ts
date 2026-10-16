import { describe, expect, it } from "vitest";
import { cloneCareer } from "../src/coach/career";
import { evaluateSeason, historyEntry, leagueState, titleAmbition } from "../src/coach/review";
import { started } from "./coach/helpers";
import type { CoachCareer } from "../src/coach/types";

/** Cenário exigente: vice sempre, torcida máxima e folha saudável. */
function contender(): CoachCareer {
  const career = cloneCareer(started("board-d67", "fast", "ESP"));
  career.coach = { ...career.coach!, club: "barcelona" };
  career.coach!.objective = { kind: "title", target: 2, expected: 1, tableSize: 20 };
  career.coach!.cupObjectives = [];
  career.coach!.fans = 100;
  for (const player of Object.values(career.players)) if (player.club === "barcelona") player.wage = 0;
  const league = leagueState(career, "barcelona")!;
  for (const [i, row] of league.table!.entries()) row.points = row.club === "barcelona" ? 999 : i === league.table!.findIndex(row => row.club !== "barcelona") ? 1000 : 0;
  for (const state of Object.values(career.competitions)) { state.champion = null; if (state.entrants.includes("barcelona")) state.reached.barcelona = "SF"; }
  return career;
}
function next(career: CoachCareer) {
  const review = evaluateSeason(career, false, false);
  career.history.push(historyEntry(career, review, false, false, false, false));
  career.coach!.credit = review.creditAfter;
  career.year++;
  career.seasonIndex++;
  return review;
}

describe("D67: diretoria ambiciosa", () => {
  it("dá uma primeira temporada ao vice, mas torcida, supercopas e vice não garantem emprego eterno", () => {
    const career = contender();
    const supercup = Object.values(career.competitions).find(state => state.kind === "super")!;
    supercup.champion = "barcelona";
    const reviews = Array.from({ length: 8 }, () => next(career));
    expect(reviews[0]!.dismissed).toBe(false);
    expect(reviews.every(review => review.objectiveMet)).toBe(true);
    expect(reviews.some(review => review.dismissed)).toBe(true);
    expect(reviews[7]!.confidence).toBeLessThan(reviews[0]!.confidence);
    expect(reviews[7]!.reason).toBe("ambition");
  });
  it("uma copa alivia parcialmente; liga, principal continental e Mundial zeram o jejum", () => {
    const career = contender();
    for (let i = 0; i < 3; i++) next(career);
    const debt = titleAmbition(career).debt;
    const cup = Object.values(career.competitions).find(state => state.kind === "cup")!;
    cup.champion = "barcelona";
    expect(titleAmbition(career).debt).toBe(debt - 0.5);
    cup.champion = null;
    for (const kind of ["league", "cont1", "clubworldcup"] as const) {
      const state = Object.values(career.competitions).find(state => state.kind === kind)
        ?? (career.competitions.clubworldcup = { ...cup, id: "clubworldcup", kind: "clubworldcup" });
      state.champion = "barcelona";
      expect(titleAmbition(career)).toMatchObject({ debt: 0, penalty: 0 });
      expect(evaluateSeason(career, false, false).dismissed).toBe(false);
      state.champion = null;
    }
  });
  it("ganhar só a copa nacional todo ano adia a crise, sem anular a exigência por grandes títulos", () => {
    const career = contender();
    const cup = Object.values(career.competitions).find(state => state.kind === "cup")!;
    cup.champion = "barcelona";
    const reviews = Array.from({ length: 14 }, () => next(career));
    expect(reviews.slice(0, 3).some(review => review.dismissed)).toBe(false);
    expect(reviews.some(review => review.dismissed)).toBe(true);
  });
  it("pequenos, segunda divisão e outro mandato não herdam cobrança de gigante", () => {
    const career = contender();
    for (let i = 0; i < 5; i++) next(career);
    career.coach!.objective = { kind: "survive", target: 16, expected: 17, tableSize: 20 };
    expect(titleAmbition(career).weight).toBe(0);
    career.coach!.objective = { kind: "promotion", target: 4, expected: 1, tableSize: 20 };
    career.clubs.barcelona!.division = 2;
    expect(titleAmbition(career).weight).toBe(0);
    career.clubs.barcelona!.division = 1;
    career.coach!.objective = { kind: "title", target: 2, expected: 1, tableSize: 20 };
    career.history[career.history.length - 1] = { ...career.history.at(-1)!, club: "real-madrid" };
    expect(titleAmbition(career).debt).toBe(1);
  });
  it("uma campanha muito abaixo da meta pode custar o cargo já no primeiro ano", () => {
    const career = contender(), league = leagueState(career, "barcelona")!;
    for (const row of league.table!) if (row.club !== "barcelona") row.points = 1000;
    expect(evaluateSeason(career, false, false).dismissed).toBe(true);
  });
});
