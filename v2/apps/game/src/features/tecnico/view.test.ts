import { coachTotals } from "./legacy";
import { coachCommand, COACH_COUNTRIES, createCoachCareer } from "@craque/engine/coach";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";
import { describe, expect, it } from "vitest";
import { COACH_NATIONS } from "./draft";
import { budgetSpent, squadRows } from "./view";

/**
 * A tela nunca recebe o que é escondido (GDD 42.8): nível oculto, potencial,
 * satisfação em número e longevidade não podem aparecer nas vistas.
 */
describe("vistas do Técnico", () => {
  const career = createCoachCareer({ seed: "vista", startYear: 2026, mode: "fast", identity: { name: "Vista", nationality: "BRA" } }, { players: SQUAD_PLAYERS, free: FREE_PLAYERS });

  it("o elenco mostrado não carrega nível, potencial, satisfação nem longevidade", () => {
    const started = coachCommand(career, { type: "acceptOffer", offer: career.offers[0]?.id ?? "" }).career;
    const rows = squadRows(started);
    expect(rows.length).toBeGreaterThan(15);
    const keys = new Set(rows.flatMap((row) => Object.keys(row)));
    for (const hidden of ["level", "potential", "satisfaction", "longevity", "recentRatings"]) expect(keys.has(hidden), hidden).toBe(false);
  });

  it("a lista de países do rascunho é a mesma do motor", () => {
    expect([...COACH_NATIONS].sort()).toEqual([...COACH_COUNTRIES].sort());
  });

  it("o legado soma liga, copas e temporada parcial sem perder empates", () => {
    const started = coachCommand(career, { type: "acceptOffer", offer: career.offers[0]!.id }).career;
    const common = { club: started.coach!.club, league: "league:brasileirao", division: 1 as const, position: 3, tableSize: 20, objective: started.coach!.objective, objectiveMet: true, titles: ["cup:BRA"], promoted: false, relegated: false, dismissed: false, rescue: false, confidence: 70, reputationAfter: 30, topScorer: null, bestPlayer: null };
    const history = [{ ...common, year: 2026, partial: false, record: { won: 22, drawn: 9, lost: 8, goalsFor: 61, goalsAgainst: 35 } }, { ...common, year: 2027, partial: true, titles: [], record: { won: 10, drawn: 2, lost: 3, goalsFor: 29, goalsAgainst: 15 } }];
    const totals = coachTotals({ ...started, history });
    expect(totals).toMatchObject({ games: 54, won: 32, drawn: 11, lost: 11, goalsFor: 90, goalsAgainst: 50, seasons: 1, titles: 1, clubs: 1 });
    expect(totals.rate).toBeCloseTo(107/162);
  });

  it("a verba soma compras do clube/ano sem duplicar a etapa já relatada", () => {
    const started = coachCommand(career, { type: "acceptOffer", offer: career.offers[0]?.id ?? "" }).career;
    const coach = started.coach!;
    const signing = { kind: "signing" as const, player: "reforco", fee: 1000 };
    const report: typeof started.stageReports[number] = {
      year: started.year, half: 0, final: false, partial: false, club: coach.club,
      league: "teste", position: null, tableSize: 20, objective: coach.objective,
      record: { won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 },
      competitions: [], highlights: [], revelations: [], disappointments: [],
      ovrChanges: [], injuries: [], relations: [], finance: { revenue: 0, wages: 0, transfers: 1000, prizes: 0, cash: 0, budget: 0 },
      moments: [signing], predictabilityHint: false, promises: [], newTraits: [],
    };
    const ledger = { ...started.ledger, moments: [signing] };
    expect(budgetSpent({ ...started, half: 0, ledger, stageReports: [report] })).toBe(1000);
    expect(budgetSpent({ ...started, half: 1, ledger, stageReports: [report] })).toBe(2000);
    expect(budgetSpent({ ...started, half: 1, ledger, stageReports: [
      { ...report, year: started.year - 1 }, { ...report, club: "outro-clube" },
    ] })).toBe(1000);
  });
});
