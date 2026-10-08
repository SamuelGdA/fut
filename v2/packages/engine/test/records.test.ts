import { CLUBS } from "@craque/world";
import { describe, expect, it } from "vitest";
import {
  ballonKeepChance,
  createRng,
  createWorld,
  simulateWorldSeason,
  EMPTY_TALLY,
  goldenShoeKeepChance,
  keepChance,
  leagueTail,
  PRESSURE,
  type RecordTally,
  recordTally,
  thinUnits,
  titleKeepChance,
} from "../src";
import { drawProduction, NO_PRODUCTION, thinProduction } from "../src/season/production";

/**
 * Pressão do recorde (D44): perto de um recorde real, cada unidade a mais
 * precisa de mais sorte que a anterior, e nada vira impossível.
 */

describe("a cauda", () => {
  it("cada passo é mais difícil que o anterior, e nenhum chega a zero", () => {
    expect(keepChance(0, 6)).toBe(1);
    let previous = 1;
    for (let step = 1; step <= 40; step += 1) {
      const chance = keepChance(step, 6);
      expect(chance).toBeLessThan(previous);
      expect(chance).toBeGreaterThan(0);
      previous = chance;
    }
  });

  it("abaixo da cauda nada muda e nada é sorteado", () => {
    const used = createRng("cauda-baixa");
    expect(thinUnits(used, 40, [{ tail: { start: 100, scale: 5 }, before: 10 }])).toBe(40);
    // O fluxo não andou: o próximo número é o primeiro de um fluxo intocado.
    expect(used.next()).toBe(createRng("cauda-baixa").next());
  });

  it("dentro da cauda, quanto mais longe do começo, menos entra", () => {
    const kept = (before: number) => {
      let total = 0;
      for (let trial = 0; trial < 400; trial += 1) {
        total += thinUnits(createRng(`cauda:${before}:${trial}`), 10, [{ tail: { start: 50, scale: 6 }, before }]);
      }
      return total / 400;
    };
    const near = kept(50);
    const far = kept(65);
    expect(near).toBeLessThan(10);
    expect(far).toBeLessThan(near);
    expect(far).toBeGreaterThan(0);
  });
});

describe("a produção perto do recorde", () => {
  const input = {
    position: "st" as const,
    ovr: 99,
    attributes: [99, 99, 99, 99, 99, 99] as [number, number, number, number, number, number],
    trait: "professional" as const,
    teamStrength: 95,
    clubStrength: 92,
    opposition: 60,
    games: 70,
    split: [
      { competition: "league:laliga", kind: "league" as const, games: 38 },
      { competition: "cont1:UEFA", kind: "continental1" as const, games: 17 },
      { competition: "cup:ESP", kind: "cup" as const, games: 9 },
    ],
  };

  it("uma temporada absurda encolhe, as linhas continuam somando o total e a liga continua sendo a liga", () => {
    let raw = 0;
    let thinned = 0;
    for (let trial = 0; trial < 200; trial += 1) {
      const drawn = drawProduction(createRng(`absurda:${trial}`), input);
      const result = thinProduction(createRng(`absurda:pressao:${trial}`), drawn, { goals: [{ tail: PRESSURE.seasonGoals, before: 0 }] });
      expect(result.lines.reduce((total, line) => total + line.goals, 0)).toBeLessThanOrEqual(result.goals);
      expect(result.leagueGoals).toBe(result.lines.filter((line) => line.kind === "league").reduce((total, line) => total + line.goals, 0));
      expect(result.goals).toBeLessThanOrEqual(drawn.goals);
      raw += drawn.goals;
      thinned += result.goals;
    }
    expect(raw / 200).toBeGreaterThan(80);
    // Bem perto da marca, nunca dezenas acima dela.
    expect(thinned / 200).toBeLessThan(76);
    expect(thinned / 200).toBeGreaterThan(PRESSURE.seasonGoals.start);
  });

  it("sem caudas, ou sem nada para cortar, a produção volta igual", () => {
    expect(thinProduction(createRng("vazio"), NO_PRODUCTION, { goals: [{ tail: PRESSURE.seasonGoals, before: 0 }] })).toBe(NO_PRODUCTION);
    const drawn = drawProduction(createRng("normal"), { ...input, games: 10 });
    expect(thinProduction(createRng("normal:pressao"), drawn, {})).toBe(drawn);
  });

  it("o jogo sem sofrer gol que não entrou vira gol sofrido", () => {
    const drawn = { ...NO_PRODUCTION, cleanSheets: 60, conceded: 4, lines: [] };
    const result = thinProduction(createRng("goleiro"), drawn, { cleanSheets: [{ tail: PRESSURE.seasonCleanSheets, before: 0 }] });
    expect(result.cleanSheets).toBeLessThan(60);
    expect(result.conceded).toBe(4 + (60 - result.cleanSheets));
  });
});

describe("o que a carreira já tem", () => {
  const season = (titles: string[], games = 50, goals = 30) => ({
    games,
    production: { goals },
    national: { games: 10, goals: 5 },
    titles,
  });

  it("soma jogos e gols de clube e seleção, conta títulos por competição e as sequências até a última temporada", () => {
    const tally = recordTally([
      season(["league:laliga", "cont1:UEFA"]),
      season(["league:laliga"]),
      season(["cup:ESP"]),
      season(["league:laliga", "cont1:UEFA"]),
      season(["league:laliga", "cont1:UEFA"]),
    ]);
    expect(tally.games).toBe(5 * 60);
    expect(tally.goals).toBe(5 * 35);
    expect(tally.caps).toBe(50);
    expect(tally.nationalGoals).toBe(25);
    expect(tally.titles).toBe(8);
    expect(tally.titlesBy["league:laliga"]).toBe(4);
    expect(tally.leagueStreak).toBe(2);
    expect(tally.continentalStreak).toBe(2);
    expect(recordTally([])).toEqual(EMPTY_TALLY);
  });
});

describe("títulos e prêmios perto do recorde", () => {
  const tally = (changes: Partial<RecordTally>): RecordTally => ({ ...EMPTY_TALLY, ...changes });

  it("longe dos recordes, o título é certo", () => {
    expect(titleKeepChance(tally({ titles: 10, titlesBy: { "league:laliga": 3 } }), "league:laliga")).toBe(1);
    expect(titleKeepChance(tally({ titles: 10 }), "cup:ESP")).toBe(1);
  });

  it("cada liga a mais no mesmo país, cada continental e cada título da carreira pesam mais que o anterior", () => {
    const start = leagueTail("ESP").start;
    const league = (count: number) => titleKeepChance(tally({ titlesBy: { "league:laliga": count } }), "league:laliga");
    expect(league(start - 1)).toBe(1);
    expect(league(start)).toBeLessThan(1);
    expect(league(start + 2)).toBeLessThan(league(start + 1));
    const continental = (count: number) => titleKeepChance(tally({ titlesBy: { "cont1:UEFA": count } }), "cont1:UEFA");
    expect(continental(6)).toBeLessThan(continental(5));
    const total = (count: number) => titleKeepChance(tally({ titles: count }), "cup:ESP");
    expect(total(50)).toBeLessThan(total(45));
    expect(total(60)).toBeGreaterThan(0);
  });

  it("a sequência de ligas e a de continentais também pesam", () => {
    expect(titleKeepChance(tally({ leagueStreak: 10 }), "league:laliga")).toBeLessThan(titleKeepChance(tally({ leagueStreak: 8 }), "league:laliga"));
    expect(titleKeepChance(tally({ continentalStreak: 4 }), "cont1:UEFA")).toBeLessThan(1);
  });

  it("Bola de Ouro e Chuteira de Ouro: livres no começo, cada vez mais difíceis depois", () => {
    expect(ballonKeepChance(0, 0)).toBe(1);
    expect(ballonKeepChance(4, 0)).toBeLessThan(1);
    expect(ballonKeepChance(7, 0)).toBeLessThan(ballonKeepChance(6, 0));
    expect(ballonKeepChance(2, 3)).toBeLessThan(ballonKeepChance(2, 2));
    expect(goldenShoeKeepChance(2)).toBe(1);
    expect(goldenShoeKeepChance(6)).toBeLessThan(goldenShoeKeepChance(5));
    expect(goldenShoeKeepChance(20)).toBeGreaterThan(0);
  });
});

describe("a final do evento existe (D44)", () => {
  // Um clube médio da Espanha: nem sempre chega a uma final sozinho.
  const club = [...CLUBS].filter((item) => item.country === "ESP").sort((a, b) => a.strength - b.strength)[10]?.id ?? "";

  it.each(["win", "lose"] as const)("com a final decidida em %s, o clube está na final de algum torneio, no lugar certo", (final) => {
    for (let index = 0; index < 12; index += 1) {
      const world = createWorld(`final-${final}-${index}`, 2026);
      const { results } = simulateWorldSeason(world, `final-${final}-${index}`, { club, ovr: 75, participation: 1, final });
      const knockouts = [...Object.values(results.cups), ...Object.values(results.continental)];
      const spot = final === "win" ? 0 : 1;
      expect(knockouts.some((result) => result.order[spot] === club)).toBe(true);
    }
  });
});
