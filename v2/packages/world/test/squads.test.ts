import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CLUBS } from "../src";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "../src/squads";

/**
 * Elencos do Técnico (D52): conferidos contra as regras da montagem. Quem
 * mexer nas fontes roda `pnpm elencos:montar` e versiona a saída; este teste
 * reprova saída velha, ids repetidos, elenco curto e arquivo grande demais.
 */

const DATA = new URL("../data/squads/", import.meta.url);
const SCRIPT = fileURLToPath(new URL("../scripts/elencos/montar.mjs", import.meta.url));
const DASH = /[–—]/;

describe("elencos iniciais do Técnico", () => {
  const all = [...SQUAD_PLAYERS, ...FREE_PLAYERS];

  it("nenhum id repetido e nenhum jogador em dois clubes", () => {
    const ids = new Set<string>();
    for (const player of all) {
      expect(ids.has(player.id), player.id).toBe(false);
      ids.add(player.id);
    }
  });

  it("todo clube do jogo tem pelo menos 22 jogadores, 2 goleiros e a composição mínima", () => {
    const byClub = new Map<string, typeof SQUAD_PLAYERS[number][]>();
    for (const player of SQUAD_PLAYERS) byClub.set(player.club, [...(byClub.get(player.club) ?? []), player]);
    for (const club of CLUBS) {
      const squad = byClub.get(club.id) ?? [];
      expect(squad.length, club.id).toBeGreaterThanOrEqual(22);
      expect(squad.filter((player) => player.position === "gk").length, club.id).toBeGreaterThanOrEqual(2);
    }
    expect(byClub.size).toBe(CLUBS.length);
  });

  it("limite de 30 para maiores de 21 anos (o excedente vira jogador livre)", () => {
    const seniors = new Map<string, number>();
    for (const player of SQUAD_PLAYERS) if (2026 - player.birthYear > 21) seniors.set(player.club, (seniors.get(player.club) ?? 0) + 1);
    for (const [club, count] of seniors) expect(count, club).toBeLessThanOrEqual(30);
  });

  it("OVR, idade e nomes plausíveis; gerados sem nome real", () => {
    for (const player of all) {
      expect(player.ovr).toBeGreaterThanOrEqual(40);
      expect(player.ovr).toBeLessThanOrEqual(95);
      expect(2026 - player.birthYear).toBeGreaterThanOrEqual(15);
      // Há veteranos reais em atividade (Fábio, do Fluminense, nasceu em 1980).
      expect(2026 - player.birthYear).toBeLessThanOrEqual(47);
      expect(player.traits.length).toBeLessThanOrEqual(2);
      expect(DASH.test(player.name)).toBe(false);
      if (player.origin === "g") expect(player.name).toBe("");
      else expect(player.name.length).toBeGreaterThan(1);
    }
  });

  it("cada arquivo de país fica bem abaixo de 3 MB", () => {
    const dir = fileURLToPath(DATA);
    for (const name of readdirSync(dir).filter((file) => file.endsWith(".ts"))) {
      expect(statSync(`${dir}/${name}`).size, name).toBeLessThan(400_000);
    }
  });

  it("a saída versionada é exatamente a da montagem (pnpm elencos:montar)", () => {
    const output = execFileSync(process.execPath, [SCRIPT, "--checar"], { encoding: "utf8" });
    expect(output).toContain("conferido");
  });
});
