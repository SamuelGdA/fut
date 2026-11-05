import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ACHIEVEMENTS } from "@craque/content";
import { COACH_ACHIEVEMENTS } from "@craque/content/coach";
import { describe, expect, it } from "vitest";
import { CATALOG_SUFFIX, catalogRows, catalogSql } from "../src/catalogo";

/** O catálogo do banco acompanha o do jogo (D112). */

const MIGRATIONS = fileURLToPath(new URL("../migrations/", import.meta.url));

describe("catálogo de conquistas", () => {
  it("a última migração de catálogo é exatamente o catálogo do jogo (rode pnpm supabase:catalogo)", () => {
    const latest = readdirSync(MIGRATIONS).filter((name) => name.endsWith(CATALOG_SUFFIX)).sort().at(-1);
    expect(latest, "nenhuma migração de catálogo").toBeDefined();
    const current = readFileSync(join(MIGRATIONS, latest!), "utf8").replace(/\r\n/g, "\n");
    expect(current).toBe(catalogSql());
  });

  it("traz todas as conquistas dos dois jogos, sem repetir id, com nome nos três idiomas", () => {
    const rows = catalogRows();
    expect(rows).toHaveLength(ACHIEVEMENTS.length + COACH_ACHIEVEMENTS.length);
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
    for (const row of rows) {
      for (const locale of ["pt", "es", "en"] as const) {
        expect(row.nome[locale].length, `${row.id} ${locale}`).toBeGreaterThan(0);
      }
      expect(row.id).toMatch(/^[A-Za-z0-9:._-]{2,64}$/);
    }
  });

  it("as migrações vêm em ordem: tabelas antes do catálogo", () => {
    const names = readdirSync(MIGRATIONS).filter((name) => name.endsWith(".sql")).sort();
    expect(names[0]).toMatch(/_contas_e_conquistas\.sql$/);
    expect(names.filter((name) => name.endsWith(CATALOG_SUFFIX)).length).toBeGreaterThan(0);
  });
});
