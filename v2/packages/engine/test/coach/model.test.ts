import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createRng } from "../../src";
import {
  chanceTier,
  clubDuel,
  type CoachPlayer,
  developBonus,
  developTrial,
  developCandidates,
  expectedGoals,
  flatRatings,
  growthStep,
  matchOdds,
  output,
  paceTrial,
  philosophyGrid,
  purchaseChance,
  SATISFACTION,
  type SideSetup,
} from "../../src/coach";
import { fresh } from "./helpers";

const career = fresh("teste-modelo");

function anyPlayer(filter: (player: CoachPlayer) => boolean): CoachPlayer {
  const player = Object.values(career.players).find(filter);
  if (!player) throw new Error("jogador não encontrado");
  return player;
}

describe("rendimento escondido (spec 8)", () => {
  const base = anyPlayer((player) => player.ovr === 75 && player.position === "st" && player.traits.length === 0);
  const neutral = { ...base, level: 75, form: 0, satisfaction: 50 };

  it("um 75 insatisfeito rende como 72; satisfeito, como 76", () => {
    const slot = { slot: "st" as const, big: false, derby: false };
    expect(output(neutral, slot)).toBe(75);
    expect(output({ ...neutral, satisfaction: SATISFACTION.unhappy - 1 }, slot)).toBe(72);
    expect(output({ ...neutral, satisfaction: SATISFACTION.happy }, slot)).toBe(76);
  });

  it("fase e satisfação juntas tiram no máximo 4; o total fica entre −4 e +3", () => {
    const slot = { slot: "st" as const, big: true, derby: true };
    expect(output({ ...neutral, satisfaction: 0, form: -2 }, slot)).toBe(71);
    expect(output({ ...neutral, satisfaction: 100, form: 2, traits: ["clutch", "derby"] }, slot)).toBe(78);
  });

  it("nenhuma conta de partida lê a satisfação fora do rendimento individual (sem dupla penalidade)", () => {
    for (const file of ["match.ts", "tactics.ts"]) {
      const source = readFileSync(new URL(`../../src/coach/${file}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/\bsatisfaction\b/);
      expect(source).not.toMatch(/\.fans\b|\.board\b/);
    }
  });
});

describe("partidas: só o elenco decide (spec 9 e pedido do continente)", () => {
  it("trocar os elencos de dois clubes troca as chances, sem bônus de continente", () => {
    const duel = clubDuel(career, "real-madrid", "flamengo");
    expect(duel.odds.advance + duel.swapped.advance).toBeCloseTo(1, 12);
    expect(duel.odds.win).toBeCloseTo(duel.swapped.loss, 12);
  });

  it("o europeu mais forte é favorito, mas o sul-americano passa em boa parte dos jogos", () => {
    const duel = clubDuel(career, "real-madrid", "flamengo");
    expect(duel.strengthA).toBeGreaterThan(duel.strengthB);
    expect(duel.odds.advance).toBeGreaterThan(0.6);
    expect(duel.odds.advance).toBeLessThan(0.85);
  });

  it("forças iguais em campo neutro dão chances iguais", () => {
    const odds = matchOdds(flatRatings(75), flatRatings(75), ["possession", "possession"]);
    expect(odds.win).toBeCloseTo(odds.loss, 12);
  });

  it("cada filosofia é a melhor em alguma faixa de força e nenhuma em todas", () => {
    const bests = new Set(philosophyGrid([-12, -8, -5, -3, 0, 3, 5, 8, 12]).map((row) => row.best));
    expect(bests.size).toBe(4);
  });

  it("mandante tem vantagem pequena e simétrica", () => {
    const side = (home: boolean): SideSetup => ({
      ratings: flatRatings(75),
      philosophy: "possession",
      fastPlayers: 0,
      setPiecePlayers: 0,
      forBoost: 1,
      againstBoost: 1,
      home,
      neutral: false,
      playersOnField: 11,
    });
    const home = expectedGoals(side(true), side(false));
    const away = expectedGoals(side(false), side(true));
    expect(home).toBeGreaterThan(away);
    expect(home / away).toBeLessThan(1.3);
  });
});

describe("contratar acima do próprio nível (pedido: quanto maior, mais difícil)", () => {
  it("a chance cai a cada ponto de OVR acima e chega perto de zero", () => {
    const target = anyPlayer((player) => player.club === "palmeiras" && player.role === "starter");
    let previous = 1;
    for (let ovr = 70; ovr <= 92; ovr += 2) {
      const chance = purchaseChance(career, { ...target, ovr, level: ovr }, "goias").total;
      expect(chance).toBeLessThanOrEqual(previous + 1e-12);
      previous = chance;
    }
    expect(previous).toBeLessThan(0.001);
  });

  it("Mbappé no Flamengo: quase impossível, mas não zero", () => {
    const mbappe = anyPlayer((player) => player.name === "Kylian Mbappé");
    const chance = purchaseChance(career, mbappe, "flamengo").total;
    expect(chance).toBeGreaterThan(0);
    expect(chance).toBeLessThan(0.001);
    expect(chanceTier(chance)).toBe("veryHard");
  });
});

describe("evolução (spec 5 e 7)", () => {
  it("Desenvolver soma ganho com a mesma sorte, e nunca passa do potencial + 1", () => {
    for (const player of developCandidates(career, 23, 3).slice(0, 200)) {
      const input = { year: career.year, fraction: 1, games: 30, performance: 0, mentor: 1 };
      const withMark = growthStep(player, { ...input, developed: true }, createRng(`d:${player.id}`));
      const without = growthStep(player, { ...input, developed: false }, createRng(`d:${player.id}`));
      expect(withMark).toBeGreaterThan(without);
      expect(withMark).toBeLessThanOrEqual(Math.max(player.level, player.potential + 1) + 1e-9);
      expect(developBonus(player, career.year)).toBeGreaterThan(0);
    }
  });

  it("Desenvolver perto do auge aumenta muito a chance de o OVR subir", () => {
    const prime = developCandidates(career, 29, 3).filter((player) => career.year - player.birthYear >= 26);
    const trial = developTrial(career, prime, 1);
    expect(trial.treated).toBeGreaterThan(0.85);
    expect(trial.treated - trial.control).toBeGreaterThan(0.12);
  });

  it("veterano cai, mas quem tem longevidade alta segura o nível perto dos 39", () => {
    const veteran = { ...anyPlayer((player) => player.position === "cm"), birthYear: career.year - 38, level: 82, ovr: 82, potential: 82 };
    const input = { year: career.year, fraction: 1, games: 30, performance: 0.5, mentor: 1, developed: false };
    const decline = (longevity: number) => {
      let total = 0;
      let kept = 0;
      for (let index = 0; index < 400; index += 1) {
        const next = growthStep({ ...veteran, longevity }, input, createRng(`v:${index}`));
        total += veteran.level - next;
        if (next >= 81) kept += 1;
      }
      return { mean: total / 400, kept };
    };
    const normal = decline(0);
    const rare = decline(3);
    expect(normal.mean).toBeGreaterThan(5);
    expect(rare.mean).toBeLessThan(3);
    expect(rare.kept).toBeGreaterThan(0);
  });

  it("rápido e lento evoluem igual numa temporada sem ações", () => {
    const pace = paceTrial(career, Object.values(career.players).slice(0, 3000));
    expect(Math.abs(pace.fast - pace.slow)).toBeLessThan(0.15);
  });
});
