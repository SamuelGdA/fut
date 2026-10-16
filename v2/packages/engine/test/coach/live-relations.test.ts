import { describe, expect, it } from "vitest";
import { cloneCareer, leagueState, squadOf } from "../../src/coach";
import { applyMatchRelations, shouldDismissMidseason } from "../../src/coach/review";
import { must, playStage, started } from "./helpers";

describe("relações ao vivo e paciência da diretoria (D60)", () => {
  const base = started("relacoes-d60", "slow");
  it("vitória e derrota mexem nas relações antes de encerrar o turno", () => {
    const career = cloneCareer(base);
    const before = career.coach!.board;
    applyMatchRelations(career, 2, 0, false);
    expect(career.coach!.board).toBeGreaterThan(before);
    expect(career.coach!.fans).toBeGreaterThan(base.coach!.fans);
    const winning = career.coach!.board;
    applyMatchRelations(career, 0, 2, false);
    expect(career.coach!.board).toBeLessThan(winning);
    expect(base.coach!.board).toBe(before);
    expect(career.ledger.relations.map((item) => item.reason)).toEqual(["resultsAbove", "resultsAbove", "resultsBelow", "resultsBelow"]);
  });
  it("só campanha extrema, longa e muito abaixo da expectativa dispensa no turno", () => {
    const career = cloneCareer(base);
    const coach = career.coach!;
    coach.objective = { ...coach.objective, expected: 1 };
    coach.board = 50;
    const table = leagueState(career, coach.club)!.table!;
    for (const row of table) { row.played = 14; row.points = row.club === coach.club ? 0 : 25; }
    expect(shouldDismissMidseason(career)).toBe(true);
    const row = table.find((item) => item.club === coach.club)!;
    row.played = 6;
    expect(shouldDismissMidseason(career)).toBe(false);
    row.played = 14; row.points = 15;
    expect(shouldDismissMidseason(career)).toBe(false);
    row.points = 0; coach.objective = { ...coach.objective, expected: table.length - 2 };
    expect(shouldDismissMidseason(career)).toBe(false);
  });
  it("dispensa parcial pula o segundo turno; a IA termina o ano sem atribuir jogos ao técnico", () => {
    const career = cloneCareer(base);
    const coach = career.coach!;
    coach.objective = { ...coach.objective, expected: 1, target: 2 };
    for (const player of squadOf(career, coach.club)) { player.level = 20; player.ovr = 20; }
    const result = playStage(career);
    expect(result.review?.dismissed).toBe(true);
    expect(result.history.at(-1)?.partial).toBe(true);
    const review = must(result, { type: "continue" });
    expect(review.phase).toBe("review");
    const apps = squadOf(review, coach.club).reduce((sum, player) => sum + player.season.apps, 0);
    const offer = review.offers[0]!;
    const legacyApps = Object.fromEntries(Object.entries(review.legacy).map(([id, player]) => [id, player.apps]));
    const next = must(review, { type: "decide", choice: { offer: offer.id } });
    expect(next.year).toBe(review.year + 1);
    expect(next.history.at(-1)?.partial).toBe(true);
    expect(next.history.at(-1)?.titles).toEqual([]);
    for (const [id, games] of Object.entries(legacyApps)) expect(next.legacy[id]?.apps).toBe(games);
    expect(Object.values(next.legacy).reduce((sum, player) => sum + player.apps, 0)).toBe(Object.values(legacyApps).reduce((sum, games) => sum + games, 0));
    expect(squadOf(review, coach.club).reduce((sum, player) => sum + player.season.apps, 0)).toBe(apps);
    expect(next.fixtures.every((fixture) => fixture.result === null)).toBe(true);
  });
});
