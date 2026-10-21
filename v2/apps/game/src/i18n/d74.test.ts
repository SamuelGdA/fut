import { describe, expect, it } from "vitest";
import { D74_TEXTS } from "./d74";
import { veteranChips } from "./d78";
import { VETERAN_PATHS } from "@craque/engine";

describe("D74: textos do novo fluxo", () => {
  it("mantém idiomas completos, variáveis de progresso e pontuação permitida", () => {
    for (const copy of Object.values(D74_TEXTS)) {
      expect(Object.keys(copy).sort()).toEqual(Object.keys(D74_TEXTS.pt).sort());
      for (const variable of ["{index}", "{total}", "{year}"]) expect(copy.progress).toContain(variable);
      expect(JSON.stringify(copy)).not.toMatch(/[—–]/u);
    }
  });
  it("D78: os seis caminhos têm benefício e custo nos três idiomas, inclusive goleiro", () => {
    for (const locale of ["pt", "en", "es"] as const) for (const path of VETERAN_PATHS) for (const keeper of [false,true]) {
      const [benefit,cost] = veteranChips(locale,path,keeper);
      expect(benefit.startsWith("+")).toBe(true);
      expect(cost.length).toBeGreaterThan(3);
      expect(`${benefit} ${cost}`).not.toMatch(/[—–]/);
    }
  });
});
