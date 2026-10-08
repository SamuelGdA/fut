import { describe, expect, it } from "vitest";
import { ELITE, getCountry, getElite } from "../src";

/** A elite real (GDD 13.1): dados coerentes e cobertura dos anos de carreira. */

const DASH = /[–—]/;
const POSITIONS = ["gk", "cb", "lb", "rb", "cdm", "cm", "cam", "lm", "rm", "lw", "rw", "st"];
const ATTACK = new Set(["st", "lw", "rw", "cam", "lm", "rm"]);

function activeIn(year: number) {
  return ELITE.filter((profile) => year - profile.born >= 17 && year - profile.born <= profile.retireAge);
}

describe("elite real", () => {
  it("ids únicos e consulta por id", () => {
    expect(new Set(ELITE.map((profile) => profile.id)).size).toBe(ELITE.length);
    for (const profile of ELITE) expect(getElite(profile.id)).toBe(profile);
    expect(getElite("ninguem")).toBeNull();
  });

  it("toda nacionalidade existe e toda posição é uma das 12", () => {
    for (const profile of ELITE) {
      expect(getCountry(profile.nationality), profile.id).not.toBeNull();
      expect(POSITIONS).toContain(profile.position);
    }
  });

  it("nomes reais, sem travessão e sem espaço sobrando", () => {
    for (const profile of ELITE) {
      expect(profile.name.trim()).toBe(profile.name);
      expect(profile.name.length).toBeGreaterThan(2);
      expect(DASH.test(profile.name)).toBe(false);
    }
  });

  it("projeções plausíveis: pico de 80 a 95, auge de 26 a 31, aposentadoria depois do auge", () => {
    for (const profile of ELITE) {
      expect(profile.born).toBeGreaterThanOrEqual(1996);
      expect(profile.born).toBeLessThanOrEqual(2009);
      expect(profile.peakOvr).toBeGreaterThanOrEqual(80);
      expect(profile.peakOvr).toBeLessThanOrEqual(95);
      expect(profile.peakAge).toBeGreaterThanOrEqual(26);
      expect(profile.peakAge).toBeLessThanOrEqual(31);
      expect(profile.retireAge).toBeGreaterThanOrEqual(profile.peakAge + 5);
      expect(profile.retireAge).toBeLessThanOrEqual(40);
    }
  });

  it("todas as posições têm representantes, com goleiros para a Luva de Ouro", () => {
    for (const position of ["gk", "cb", "cm", "st"]) {
      expect(ELITE.filter((profile) => profile.position === position).length).toBeGreaterThanOrEqual(8);
    }
    expect(ELITE.filter((profile) => ATTACK.has(profile.position)).length).toBeGreaterThanOrEqual(40);
  });

  it("pelo menos 10 nomes reais em atividade em todo ano de 2026 a 2043", () => {
    for (let year = 2026; year <= 2043; year += 1) {
      expect(activeIn(year).length, String(year)).toBeGreaterThanOrEqual(10);
    }
  });
});
