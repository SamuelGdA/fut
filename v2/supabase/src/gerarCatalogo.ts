import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG_SUFFIX, catalogRows, catalogSql } from "./catalogo";

/**
 * pnpm supabase:catalogo
 *
 * Compara o catálogo de conquistas do jogo com a última migração de catálogo.
 * Igual: nada a fazer. Diferente: grava uma migração nova, com a data de agora
 * (UTC) no nome, para subir com `npx supabase@2.121.0 db push`.
 */

const MIGRATIONS = fileURLToPath(new URL("../migrations/", import.meta.url));

const latest = readdirSync(MIGRATIONS).filter((name) => name.endsWith(CATALOG_SUFFIX)).sort().at(-1);
const sql = catalogSql();
const current = latest ? readFileSync(join(MIGRATIONS, latest), "utf8").replace(/\r\n/g, "\n") : null;

if (current === sql) {
  console.log(`Catálogo em dia (${catalogRows().length} conquistas, ${latest}).`);
} else {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const name = `${stamp}${CATALOG_SUFFIX}`;
  writeFileSync(join(MIGRATIONS, name), sql);
  console.log(`Migração nova: supabase/migrations/${name} (${catalogRows().length} conquistas). Suba com: npx supabase@2.121.0 db push`);
}
