import { describe, expect, it } from "vitest";
import { autoplay, createCareer, EVENT_CATALOG, leagueAfter, leagueSnapshot, type Career, type KeyMatch } from "../src";

const setup = { seed: "d96-tabela", startYear: 2026, pace: "intense" as const, difficulty: "normal" as const, identity: { surname: "Teste", nationality: "BRA" as const, position: "st" as const, foot: "right" as const, dreamNumber: 9 } };

describe("D96", () => {
  it("Uma semana sem holofotes saiu do catálogo", () => {
    expect(EVENT_CATALOG.some((event) => event.id === "silentWeek")).toBe(false);
  });

  it("a tabela da rodada decisiva: rodada no fim do ano, o jogo do jogador decide os pontos dele e a rodada fecha para todos", () => {
    // Um jogo decisivo de liga de verdade, do jeito que a carreira o apresenta.
    let found: { career: Career; match: KeyMatch } | null = null;
    for (const seed of ["d96-a", "d96-b", "d96-c", "d96-d", "d96-e"]) {
      autoplay(createCareer({ ...setup, seed }), "ambitious", (step) => {
        const match = step.career.decision?.match;
        if (!found && match?.stage === "league" && !match.national) found = { career: step.career, match };
      });
      if (found) break;
    }
    expect(found).not.toBeNull();
    const { career, match } = found!;
    const club = match.team;
    const first = leagueSnapshot(career, match);
    expect(first).not.toBeNull();
    const snap = first!;
    expect(snap.before.some((row) => row.club === match.opponent)).toBe(true);
    expect(snap.round / snap.rounds).toBeGreaterThanOrEqual(0.68);
    expect(snap.before.every((row) => row.played === snap.round - 1)).toBe(true);
    const win = leagueAfter(snap, [2, 1]);
    const loss = leagueAfter(snap, [1, 2]);
    const before = (id: string) => snap.before.find((row) => row.club === id)!.points;
    const after = (rows: typeof win, id: string) => rows.find((row) => row.club === id)!.points;
    expect(after(win, club) - before(club)).toBe(3);
    expect(after(loss, club) - before(club)).toBe(0);
    expect(after(loss, snap.opponent) - before(snap.opponent)).toBe(3);
    for (const row of win) expect([0, 1, 3]).toContain(row.points - before(row.club));
    expect(win.map((row) => row.position)).toEqual(win.map((_, index) => index + 1));
    expect(leagueSnapshot(career, { ...match, stage: "final" })).toBeNull();
  });
});
