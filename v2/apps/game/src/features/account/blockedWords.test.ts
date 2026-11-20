import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BLOCKED_PARTS, BLOCKED_WORDS, isOffensiveUsername } from "./blockedWords";
import { usernameSchema } from "./schemas";

/** Palavras bloqueadas no @ (D126). */

const SQL = readFileSync(new URL("../../../../../supabase/migrations/20261120150000_palavras_modos_exclusao.sql", import.meta.url), "utf8");

function sqlArray(name: string): string[] {
  const marker = `${name} constant text[] := array[`;
  const start = SQL.indexOf(marker) + marker.length;
  const body = SQL.slice(start, SQL.indexOf("]", start));
  return [...body.matchAll(/'([a-z]+)'/g)].map((match) => match[1]!);
}

describe("palavras bloqueadas no @", () => {
  it("as listas do jogo e do banco são as mesmas", () => {
    expect(sqlArray("partes")).toEqual([...BLOCKED_PARTS]);
    expect(sqlArray("palavras")).toEqual([...BLOCKED_WORDS]);
  });

  it("barra o palavrão mesmo disfarçado", () => {
    for (const name of ["puta", "put4", "p_u_t_a", "puuuta", "puta123", "pu7a", "caralho_10", "fuck_you", "sh1t", "s1ut", "mierda", "hijodeputa", "viado123x", "n1gga", "p0rra", "vsf", "joao_puta", "bitch99"]) {
      expect(isOffensiveUsername(name), name).toBe(true);
    }
  });

  it("deixa passar palavra inocente que contém uma curta", () => {
    for (const name of ["computador", "desviado", "monique", "joao_pinto", "cuca", "paulo", "assis", "niger", "therapist", "canal_10", "glasses", "invadia", "craque_99", "samuel"]) {
      expect(isOffensiveUsername(name), name).toBe(false);
    }
  });

  it("o formulário recusa com o motivo certo", () => {
    const result = usernameSchema.safeParse("Put4_10");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("offensive");
  });

  it("toda entrada da lista é minúscula, sem repetir", () => {
    for (const item of [...BLOCKED_PARTS, ...BLOCKED_WORDS]) expect(item).toMatch(/^[a-z]+$/);
    expect(new Set(BLOCKED_PARTS).size).toBe(BLOCKED_PARTS.length);
    expect(new Set(BLOCKED_WORDS).size).toBe(BLOCKED_WORDS.length);
  });
});
