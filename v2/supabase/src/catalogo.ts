import {
  ACHIEVEMENTS,
  achievementRarity,
  achievementText,
  type AchievementRarity,
  LOCALES,
  type Locale,
} from "@craque/content";
import { COACH_ACHIEVEMENTS, coachAchievementRarity, coachAchievementText } from "@craque/content/coach";

/**
 * O catálogo de conquistas do banco (D112), tirado do mesmo pacote que o
 * jogo usa: as 148 do Craque e as do Técnico, com grupo, raridade, alvo e os
 * nomes nos três idiomas. O banco usa o catálogo para recusar ids inventados
 * e limitar o progresso ao alvo; a tela continua lendo os textos do pacote.
 */

export interface CatalogRow {
  readonly id: string;
  readonly jogo: "craque" | "tecnico";
  readonly grupo: string;
  readonly raridade: AchievementRarity;
  readonly secreta: boolean;
  readonly alvo: number | null;
  readonly nome: Readonly<Record<Locale, string>>;
  readonly descricao: Readonly<Record<Locale, string>>;
  readonly ordem: number;
}

const byLocale = (text: (locale: Locale) => string): Record<Locale, string> =>
  Object.fromEntries(LOCALES.map((locale) => [locale, text(locale)])) as Record<Locale, string>;

export function catalogRows(): CatalogRow[] {
  const craque = ACHIEVEMENTS.map((item, index): CatalogRow => ({
    id: item.id,
    jogo: "craque",
    grupo: item.group,
    raridade: achievementRarity(item.id),
    secreta: item.group === "secret",
    alvo: item.target ?? null,
    nome: byLocale((locale) => achievementText(locale, item.id).name),
    descricao: byLocale((locale) => achievementText(locale, item.id).description),
    ordem: index,
  }));
  const tecnico = COACH_ACHIEVEMENTS.map((item, index): CatalogRow => ({
    id: item.id,
    jogo: "tecnico",
    grupo: "tecnico",
    raridade: coachAchievementRarity(item.id),
    secreta: false,
    alvo: null,
    nome: byLocale((locale) => coachAchievementText(locale, item.id).name),
    descricao: byLocale((locale) => coachAchievementText(locale, item.id).description),
    ordem: 1000 + index,
  }));
  return [...craque, ...tecnico];
}

/** Texto como literal SQL: aspas simples dobradas. */
const literal = (value: string): string => `'${value.replace(/'/g, "''")}'`;

/**
 * A migração do catálogo: insere ou atualiza cada conquista e marca como
 * inativas as que saíram do jogo (os troféus de quem já ganhou ficam).
 */
export function catalogSql(rows: readonly CatalogRow[] = catalogRows()): string {
  const values = rows.map((row) =>
    `  (${[
      literal(row.id),
      literal(row.jogo),
      literal(row.grupo),
      literal(row.raridade),
      row.secreta ? "true" : "false",
      row.alvo === null ? "null" : String(row.alvo),
      `${literal(JSON.stringify(row.nome))}::jsonb`,
      `${literal(JSON.stringify(row.descricao))}::jsonb`,
      String(row.ordem),
      "true",
    ].join(", ")})`,
  );
  return [
    "-- Catálogo de conquistas do Futeiros (D112). Gerado por `pnpm supabase:catalogo`",
    "-- a partir de @craque/content: não edite à mão. Uma conquista nova no jogo pede",
    "-- uma migração nova deste tipo (o teste do pacote @craque/supabase avisa).",
    "",
    "insert into public.conquistas (id, jogo, grupo, raridade, secreta, alvo, nome, descricao, ordem, ativa) values",
    `${values.join(",\n")}`,
    "on conflict (id) do update set",
    "  jogo = excluded.jogo,",
    "  grupo = excluded.grupo,",
    "  raridade = excluded.raridade,",
    "  secreta = excluded.secreta,",
    "  alvo = excluded.alvo,",
    "  nome = excluded.nome,",
    "  descricao = excluded.descricao,",
    "  ordem = excluded.ordem,",
    "  ativa = true;",
    "",
    "update public.conquistas set ativa = false",
    `where id <> all (array[${rows.map((row) => literal(row.id)).join(", ")}]);`,
    "",
  ].join("\n");
}

/** O sufixo dos arquivos de catálogo em `supabase/migrations`. */
export const CATALOG_SUFFIX = "_catalogo_conquistas.sql";
