import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { careerKey } from "./careerKey";
import { hasStoredSession, isSecretKey, readCloudConfig } from "./config";
import {
  CAREER_LIMITS,
  craqueCareerSchema,
  emailSchema,
  passwordSchema,
  profileUpdateSchema,
  RESERVED_USERNAMES,
  tecnicoCareerSchema,
  unlockPayloadSchema,
  usernameSchema,
} from "./schemas";
import { readAuthParams } from "./store";
import { STORAGE_KEYS } from "../../services/storage";
import { CONSENT_KEY } from "../consent/store";
import { AUTH_STORAGE_KEY } from "./config";

/** A conta (D112) e a validação dos envios (D114). */

const SQL = readFileSync(new URL("../../../../../supabase/migrations/20261030180000_contas_e_conquistas.sql", import.meta.url), "utf8");


const career = (extra: Record<string, unknown> = {}) => ({
  temporadas: 18, partidas: 610, gols: 280, assistencias: 120, jogos_sem_sofrer: 0, titulos: 14, premios: 9, bolas_de_ouro: 2, melhor_ovr: 91,
  conquistas: ["firstCareer"], progresso: { twentyTitles: 14 }, ...extra,
});

describe("configuração da nuvem", () => {
  it("liga só com endereço do Supabase e chave publicável", () => {
    expect(readCloudConfig({ VITE_SUPABASE_URL: "https://abc123.supabase.co/", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x" })).toEqual({ url: "https://abc123.supabase.co", key: "sb_publishable_x" });
    expect(readCloudConfig({ VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x" })).not.toBeNull();
    expect(readCloudConfig({})).toBeNull();
    expect(readCloudConfig({ VITE_SUPABASE_URL: "https://evil.example.com", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x" })).toBeNull();
  });

  it("nunca liga com chave secreta", () => {
    expect(isSecretKey("sb_secret_abc")).toBe(true);
    const serviceRole = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ role: "service_role" })).replace(/=+$/, "")}.x`;
    expect(isSecretKey(serviceRole)).toBe(true);
    expect(readCloudConfig({ VITE_SUPABASE_URL: "https://abc.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc" })).toBeNull();
    expect(readCloudConfig({ VITE_SUPABASE_URL: "https://abc.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: serviceRole })).toBeNull();
  });

  it("percebe a sessão guardada sem baixar o Supabase", () => {
    expect(hasStoredSession(() => JSON.stringify({ access_token: "a", refresh_token: "r" }))).toBe(true);
    expect(hasStoredSession(() => null)).toBe(false);
    expect(hasStoredSession(() => "{quebrado")).toBe(false);
  });

  it("lê o que o Supabase devolve na URL (código, erro, modo)", () => {
    expect(readAuthParams({ search: "?code=abc&modo=nova-senha", hash: "" })).toEqual({ code: "abc", error: null, errorCode: null, mode: "nova-senha" });
    expect(readAuthParams({ search: "", hash: "#error=access_denied&error_code=otp_expired" })).toMatchObject({ error: "access_denied", errorCode: "otp_expired" });
  });
});

describe("username", () => {
  it("aceita @ válido, com ou sem @, e guarda em minúsculas", () => {
    expect(usernameSchema.parse("@Rocha_10")).toBe("rocha_10");
    expect(usernameSchema.parse("  craque99 ")).toBe("craque99");
  });

  it("recusa curto, longo, com espaço, acento ou reservado", () => {
    for (const value of ["ab", "a".repeat(21), "com espaço", "joão", "admin", "@suporte"]) expect(usernameSchema.safeParse(value).success, value).toBe(false);
  });

  it("a lista de reservados é a mesma do banco", () => {
    const block = /nome <> all \(array\[([\s\S]*?)\]\)/.exec(SQL)?.[1] ?? "";
    const sql = [...block.matchAll(/'([^']+)'/g)].map((match) => match[1]).sort();
    expect(sql).toEqual([...RESERVED_USERNAMES].sort());
  });

  it("a atualização do perfil só leva o username (mass assignment)", () => {
    expect(profileUpdateSchema.parse({ username: "novo_nome" })).toEqual({ username: "novo_nome" });
    expect(profileUpdateSchema.safeParse({ username: "novo_nome", role: "admin" }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ username: "novo_nome", gols: 9999 }).success).toBe(false);
  });
});

describe("e-mail e senha", () => {
  it("e-mail válido e minúsculo; senha com 8, letras e números", () => {
    expect(emailSchema.parse("  Jogador@Exemplo.COM ")).toBe("jogador@exemplo.com");
    expect(emailSchema.safeParse("sem-arroba").success).toBe(false);
    expect(passwordSchema.safeParse("abc12345").success).toBe(true);
    for (const value of ["abc1234", "abcdefgh", "12345678"]) expect(passwordSchema.safeParse(value).success, value).toBe(false);
  });
});

describe("envio de carreira (anti-trapaça)", () => {
  it("aceita uma carreira de verdade e o Desafio", () => {
    expect(craqueCareerSchema.safeParse(career()).success).toBe(true);
    expect(craqueCareerSchema.safeParse(career({ desafio: { dia: "2026-10-30", pontos: 812 } })).success).toBe(true);
    expect(tecnicoCareerSchema.safeParse({ temporadas: 24, titulos: 30, conquistas: ["tecnico:firstSeason"] }).success).toBe(true);
  });

  it("recusa 9999 gols, negativos, quebrados, tipos errados e campos a mais", () => {
    for (const bad of [
      career({ temporadas: 1, partidas: 50, gols: 9999 }),
      career({ gols: -1 }),
      career({ gols: 2.5 }),
      career({ gols: "10" }),
      career({ melhor_ovr: 120 }),
      career({ temporadas: 3, partidas: 120, gols: 40, assistencias: 10, titulos: 2, premios: 1, bolas_de_ouro: 4 }),
      career({ role: "admin" }),
      career({ desafio: { dia: "2026-10-30", pontos: 1001 } }),
      career({ desafio: { dia: "2026-10-30", pontos: 500, ranqueada: true } }),
    ]) {
      expect(craqueCareerSchema.safeParse(bad).success).toBe(false);
    }
    expect(tecnicoCareerSchema.safeParse({ temporadas: 2, titulos: 1, conquistas: [], gols: 3 }).success).toBe(false);
    expect(unlockPayloadSchema.safeParse({ jogo: "craque", chave: "ABC DEF", ids: ["firstCareer"] }).success).toBe(false);
  });

  it("os limites por temporada são os mesmos do banco", () => {
    const pairs: [string, number][] = [
      ["partidas", CAREER_LIMITS.gamesPerSeason],
      ["gols", CAREER_LIMITS.goalsPerSeason],
      ["assistencias", CAREER_LIMITS.assistsPerSeason],
      ["jogos_sem_sofrer", CAREER_LIMITS.cleanSheetsPerSeason],
      ["premios", CAREER_LIMITS.awardsPerSeason],
      ["titulos", CAREER_LIMITS.titlesPerSeason],
    ];
    for (const [field, limit] of pairs) expect(SQL, field).toContain(`privado.inteiro(p_dados, '${field}', 0, ${limit} * v_base)`);
    expect(SQL).toContain(`case p_jogo when 'craque' then ${CAREER_LIMITS.seasonsCraque} else ${CAREER_LIMITS.seasonsTecnico} end`);
  });
});

describe("chave da carreira", () => {
  it("é estável, curta e no formato do banco", () => {
    const setup = { seed: "abc", identity: { surname: "ROCHA" } };
    const key = careerKey("craque", "2.0.0-m41", setup);
    expect(key).toBe(careerKey("craque", "2.0.0-m41", { ...setup }));
    expect(key).toMatch(/^[a-z0-9]{6,32}$/);
    expect(careerKey("tecnico", "2.0.0-m41", setup)).not.toBe(key);
  });
});


describe("chaves do armazenamento (GDD 34.1)", () => {
  it("as chaves da conta e do consentimento estão na lista oficial", () => {
    expect(STORAGE_KEYS.auth).toBe(AUTH_STORAGE_KEY);
    expect(STORAGE_KEYS.consent).toBe(CONSENT_KEY);
  });
});
