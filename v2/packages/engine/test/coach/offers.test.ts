import { describe, expect, it } from "vitest";
import { getClub } from "@craque/world";
import { COACH_COUNTRIES, createCoachCareer, initialDivisionShare, INITIAL_OFFERS } from "../../src/coach";
import { fresh, WORLD } from "./helpers";

describe("propostas iniciais (spec 4)", () => {
  it("cada sorteio é independente: 95% segunda divisão, 5% primeira", () => {
    const share = initialDivisionShare("teste-95", 20_000);
    expect(share.draws).toBe(60_000);
    // Desvio padrão de 0,09 ponto em 60 mil sorteios: 0,5 ponto é folga de mais de 5 desvios.
    expect(Math.abs(share.second - INITIAL_OFFERS.secondDivisionChance)).toBeLessThan(0.005);
    // Pelo menos uma de primeira em 1 − 0,95³ = 14,3% das carreiras.
    expect(Math.abs(share.anyFirst - (1 - 0.95 ** 3))).toBeLessThan(0.01);
  });

  it("três clubes diferentes do próprio país, com tudo o que o cartão mostra", () => {
    const career = fresh("teste-ofertas", "fast", "ARG");
    expect(career.phase).toBe("offers");
    expect(career.offers).toHaveLength(3);
    const clubs = career.offers.map((offer) => offer.club);
    expect(new Set(clubs).size).toBe(3);
    for (const offer of career.offers) {
      const club = getClub(offer.club);
      expect(club?.country).toBe("ARG");
      expect([1, 2]).toContain(offer.division);
      expect(offer.strength).toBeGreaterThan(40);
      expect(["healthy", "balanced", "tight"]).toContain(offer.finances);
      expect(offer.budget).toBeGreaterThanOrEqual(0);
      expect(offer.difficulty).toBeGreaterThanOrEqual(1);
      expect(offer.difficulty).toBeLessThanOrEqual(5);
      expect(offer.objective.kind).toBeTruthy();
    }
  });

  it("sem segunda divisão no jogo, não há treinador daquele país (México e Estados Unidos)", () => {
    expect(COACH_COUNTRIES).not.toContain("MEX");
    expect(COACH_COUNTRIES).not.toContain("USA");
    expect(COACH_COUNTRIES).toHaveLength(15);
    expect(() => createCoachCareer({ seed: "x", startYear: 2026, mode: "fast", identity: { name: "X", nationality: "USA" } }, WORLD)).toThrow();
  });

  it("a mesma semente dá as mesmas propostas", () => {
    const a = fresh("teste-ofertas", "fast", "ARG");
    const b = createCoachCareer({ seed: "teste-ofertas", startYear: 2026, mode: "fast", identity: { name: "Outro nome", nationality: "ARG" } }, WORLD);
    expect(b.offers.map((offer) => offer.club)).toEqual(a.offers.map((offer) => offer.club));
  });
});
