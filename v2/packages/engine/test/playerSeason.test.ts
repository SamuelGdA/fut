import { describe, expect, it } from "vitest";
import {
  clubCompetitions,
  createPlayer,
  createRng,
  createWorld,
  drawInjury,
  drawNationalGames,
  drawProduction,
  gamesForStage,
  injuryChance,
  nationalAgeFactor,
  nationalStatus,
  type Player,
  productionRates,
  type ProductionInput,
  simulatePlayerSeason,
  simulateWorldSeason,
  totalGames,
} from "../src";

/** A temporada do jogador (GDD 11 e 12): jogos, lesão, produção, seleção e títulos. */

const striker: ProductionInput = {
  position: "st",
  ovr: 85,
  attributes: [82, 88, 75, 84, 50, 80],
  trait: "professional",
  teamStrength: 82,
  clubStrength: 82,
  opposition: 76,
  games: 50,
  split: [
    { competition: "league:laliga", kind: "league", games: 36 },
    { competition: "cup:ESP", kind: "cup", games: 6 },
    { competition: "cont1:UEFA", kind: "continental1", games: 8 },
  ],
};

describe("jogos por fase (GDD 11.3)", () => {
  it("copa vale de 1 a 6, continental 6 nos grupos e 2 por fase", () => {
    expect(gamesForStage("cup", "early")).toBe(1);
    expect(gamesForStage("cup", "champion")).toBe(6);
    expect(gamesForStage("continental1", "groups")).toBe(6);
    expect(gamesForStage("continental1", "roundOf16")).toBe(8);
    expect(gamesForStage("continental1", "champion")).toBe(13);
    expect(gamesForStage("clubWorldCup", "groups")).toBe(3);
    expect(gamesForStage("clubWorldCup", "champion")).toBe(7);
  });

  it("a agenda do clube sai dos resultados: uma liga, a copa e o que mais ele disputou", () => {
    const { results } = simulateWorldSeason(createWorld("agenda", 2026), "agenda");
    const entries = clubCompetitions(results, "flamengo");
    expect(entries.filter((entry) => entry.kind === "league" || entry.kind === "second")).toHaveLength(1);
    expect(entries.some((entry) => entry.competition === "cup:BRA")).toBe(true);
    expect(totalGames(entries)).toBeGreaterThanOrEqual(38 + 1);
    for (const entry of entries) expect(entry.champion).toBe(entry.stage === "champion" || entry.position === 1);
  });
});

describe("produção (GDD 11.4 e 11.5)", () => {
  it("quanto maior o OVR, mais gols por jogo e menos gols sofridos", () => {
    const low = productionRates({ ...striker, ovr: 75 });
    const high = productionRates({ ...striker, ovr: 90 });
    expect(high.goalsPerGame).toBeGreaterThan(low.goalsPerGame);
    const keeper = (ovr: number) => productionRates({ ...striker, position: "gk", ovr, clubStrength: 80 }).concededPerGame;
    expect(keeper(88)).toBeLessThan(keeper(74));
  });

  it("goleiro não faz gol; centroavante faz mais que zagueiro", () => {
    expect(productionRates({ ...striker, position: "gk" }).goalsPerGame).toBe(0);
    expect(productionRates(striker).goalsPerGame).toBeGreaterThan(productionRates({ ...striker, position: "cb" }).goalsPerGame);
  });

  it("sem jogos não há produção; gols de liga nunca passam do total", () => {
    const rng = createRng("producao");
    expect(drawProduction(rng, { ...striker, games: 0 }).goals).toBe(0);
    for (let index = 0; index < 300; index += 1) {
      const season = drawProduction(rng, striker);
      expect(season.leagueGoals).toBeLessThanOrEqual(season.goals);
      expect(season.cleanSheets).toBeLessThanOrEqual(striker.games);
      expect(season.conceded).toBe(0);
    }
  });

  it("a média dos gols bate com a taxa esperada (Poisson)", () => {
    const rng = createRng("media");
    const expected = productionRates(striker).goalsPerGame * striker.games;
    let total = 0;
    const samples = 4000;
    for (let index = 0; index < samples; index += 1) total += drawProduction(rng, striker).goals;
    expect(total / samples / expected).toBeGreaterThan(0.95);
    expect(total / samples / expected).toBeLessThan(1.05);
  });
});

describe("lesão leve (GDD 11.6)", () => {
  it("a chance cresce com a idade e cai com o físico; Vidraça e Difícil pioram", () => {
    expect(injuryChance(34, 70, "professional", "normal")).toBeGreaterThan(injuryChance(24, 70, "professional", "normal"));
    expect(injuryChance(24, 90, "competitor", "normal")).toBeLessThan(injuryChance(24, 50, "competitor", "normal"));
    expect(injuryChance(24, 70, "fragile", "normal")).toBeGreaterThan(injuryChance(24, 70, "competitor", "normal"));
    expect(injuryChance(24, 70, "competitor", "hard")).toBeGreaterThan(injuryChance(24, 70, "competitor", "normal"));
  });

  it("só com 10 jogos ou mais, e tira de 5% a 22% deles", () => {
    const rng = createRng("lesao");
    expect(drawInjury(rng, 9, 38, 30, "fragile", "hard")).toBeNull();
    let injuries = 0;
    for (let index = 0; index < 2000; index += 1) {
      const injury = drawInjury(rng, 50, 30, 60, "fragile", "hard");
      if (!injury) continue;
      injuries += 1;
      expect(injury.lostGames).toBeGreaterThanOrEqual(2);
      expect(injury.lostGames).toBeLessThanOrEqual(11);
    }
    expect(injuries).toBeGreaterThan(0);
  });
});

describe("seleção (GDD 12.1)", () => {
  it("a convocação sai da distância para a força da seleção", () => {
    expect(nationalStatus(90, 86)).toBe("starter");
    expect(nationalStatus(85, 86)).toBe("squad");
    expect(nationalStatus(83, 86)).toBe("occasional");
    expect(nationalStatus(80, 86)).toBe("out");
  });

  it("jogos pela situação e pela idade; o torneio só para quem está no elenco", () => {
    const rng = createRng("selecao");
    expect(nationalAgeFactor(18)).toBe(0.4);
    expect(nationalAgeFactor(36)).toBe(0.5);
    for (let index = 0; index < 200; index += 1) {
      const starter = drawNationalGames(rng, "starter", 26, 7);
      expect(starter).toBeGreaterThanOrEqual(16);
      expect(starter).toBeLessThanOrEqual(18);
      expect(drawNationalGames(rng, "occasional", 26, 7)).toBeLessThanOrEqual(3);
      expect(drawNationalGames(rng, "out", 26, 7)).toBe(0);
    }
  });
});

describe("uma temporada inteira do jogador", () => {
  const world = createWorld("temporada", 2026);
  const player: Player = { ...createPlayer({ seed: "temporada", position: "st", difficulty: "normal" }), capacity: 86 };
  const input = {
    seed: "temporada",
    world,
    player,
    age: 24,
    nationality: "BRA",
    club: "palmeiras",
    difficulty: "normal",
    fans: 60,
    focus: null,
  } as const;

  it("é determinística e avança o mundo um ano", () => {
    const a = simulatePlayerSeason(input);
    const b = simulatePlayerSeason(input);
    expect(a).toEqual(b);
    expect(a.world.year).toBe(2027);
    expect(a.stats.year).toBe(2026);
  });

  it("jogos cabem nos do clube, e a lesão sai antes da produção (invariante 10)", () => {
    for (let index = 0; index < 30; index += 1) {
      const { stats } = simulatePlayerSeason({ ...input, seed: `jogos-${index}` });
      expect(stats.games).toBeLessThanOrEqual(stats.clubGames);
      expect(stats.leagueGames).toBeLessThanOrEqual(stats.games);
      expect(stats.production.leagueGoals).toBeLessThanOrEqual(stats.production.goals);
      if (stats.injury) expect(stats.games).toBeLessThan(stats.clubGames);
    }
  });

  it("títulos só de competições que o clube ou a seleção ganharam", () => {
    for (let index = 0; index < 20; index += 1) {
      const { stats } = simulatePlayerSeason({ ...input, seed: `titulos-${index}` });
      const won = [...stats.competitions, ...stats.national.competitions].filter((entry) => entry.champion).map((entry) => entry.competition);
      for (const title of stats.titles) expect(won).toContain(title);
    }
  });

  it("temporada suspensa: sem jogos, sem títulos, sem prêmios, e o mundo segue (invariante 9)", () => {
    const result = simulatePlayerSeason({ ...input, suspended: true });
    expect(result.stats.games).toBe(0);
    expect(result.stats.titles).toEqual([]);
    expect(result.stats.awards.won).toEqual([]);
    expect(result.stats.national.games).toBe(0);
    expect(Object.keys(result.results.leagues).length).toBeGreaterThan(30);
    expect(result.world.awards.ballonDor?.length).toBe(1);
  });

  it("o histórico de prêmios cresce um ano por temporada", () => {
    const first = simulatePlayerSeason(input);
    const second = simulatePlayerSeason({ ...input, world: first.world, player: first.player, age: 25 });
    expect(second.world.awards.ballonDor).toHaveLength(2);
    expect(second.world.awards.ballonDor?.[0]).toBe(first.world.awards.ballonDor?.[0]);
  });
});
