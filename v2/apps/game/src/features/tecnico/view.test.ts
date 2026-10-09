import { coachCommand, COACH_COUNTRIES, createCoachCareer } from "@craque/engine/coach";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";
import { describe, expect, it } from "vitest";
import { COACH_NATIONS } from "./draft";
import { squadRows } from "./view";

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
});
