import { CLUBS, COUNTRIES } from "@craque/world";
import { describe, expect, it } from "vitest";
import { relativeLuminance } from "./clubColors";
import { bandOf, clubColors, glowOf, nationColors, SILVER_GLOW } from "./teamColors";

describe("cores do time na transmissão (D83)", () => {
  it("o brilho clareia cores escuras, mantém as vivas e prateia preto e branco", () => {
    expect(relativeLuminance(glowOf("#04174b"))).toBeGreaterThanOrEqual(0.1);
    expect(glowOf("#c52613")).toBe("#c52613");
    for (const neutral of ["#000000", "#0a0a0a", "#ffffff", "#808080"]) expect(glowOf(neutral)).toBe(SILVER_GLOW);
  });

  it("a faixa nunca some na placa escura", () => {
    expect(bandOf("#000000")).toBe("#3b414b");
    expect(relativeLuminance(bandOf("#04174b"))).toBeGreaterThanOrEqual(0.06);
    expect(bandOf("#FFD900")).toBe("#ffd900");
    for (const club of CLUBS) for (const color of clubColors(club.id).band) expect(relativeLuminance(color), club.id).toBeGreaterThanOrEqual(0.045);
    for (const country of COUNTRIES) for (const color of nationColors(country.code).band) expect(relativeLuminance(color), country.code).toBeGreaterThanOrEqual(0.045);
  });

  it("todo clube e toda seleção têm faixa de três cores válidas e um desenho conhecido", () => {
    const kits = new Set(["solid", "vertical_stripes", "horizontal_stripes", "diagonal_sash", "checkerboard", "flag"]);
    for (const club of CLUBS) {
      const colors = clubColors(club.id);
      expect(kits.has(colors.kit), club.id).toBe(true);
      expect(colors.band.every((color) => /^#[0-9a-f]{6}$/.test(color)), club.id).toBe(true);
    }
    for (const country of COUNTRIES) {
      const colors = nationColors(country.code);
      expect(kits.has(colors.kit), country.code).toBe(true);
      expect(colors.band.every((color) => /^#[0-9a-f]{6}$/.test(color)), country.code).toBe(true);
    }
  });

  it("a Croácia leva o xadrez; o Brasil, verde, amarelo e azul", () => {
    expect(nationColors("CRO").kit).toBe("checkerboard");
    expect(nationColors("BRA").band).toEqual(["#009c3b", "#ffdf00", "#2f6fd6"]);
    expect(clubColors("barcelona").kit).toBe("vertical_stripes");
    expect(clubColors("river-plate").kit).toBe("diagonal_sash");
  });
});
