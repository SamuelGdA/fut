import { ELITE, getElite } from "@craque/world";
import { describe, expect, it } from "vitest";
import {
  activeElite,
  BALLON,
  bestPlayerEligible,
  type CrownEntry,
  decideAwards,
  decideCrowns,
  eliteOvr,
  FUTURE_GENERATION,
  futureGeneration,
  PLAYER,
  type PlayerAwardInput,
  scoringCrownChance,
  scoringMark,
  streakOf,
} from "../src";

/** Prêmios (GDD 13), a elite projetada e os prêmios de cada competição (D42). */

const brasileirao: CrownEntry = {
  competition: "league:brasileirao",
  kind: "league",
  teamGames: 38,
  leagueGames: 38,
  games: 34,
  goals: 10,
  assists: 3,
  cleanSheets: 10,
  field: 80,
  placing: "other",
};

const noTitles = { league: false, cup: false, primary: false, worldCup: false, nationsCup: false } as const;

const average: PlayerAwardInput = {
  eligible: true,
  position: "st",
  ovr: 78,
  age: 26,
  games: 40,
  goals: 15,
  assists: 4,
  leagueGoals: 10,
  cleanSheets: 10,
  playsInUefa: true,
  success: noTitles,
  crownEntries: [brasileirao],
};

const legend: PlayerAwardInput = {
  ...average,
  ovr: 99,
  games: 55,
  goals: 70,
  assists: 20,
  leagueGoals: 50,
  success: { league: true, cup: true, primary: true, worldCup: false, nationsCup: false },
  crownEntries: [{ ...brasileirao, goals: 50, games: 38, placing: "champion" }],
};

describe("projeção da elite (GDD 13.1)", () => {
  const profile = ELITE[0];
  if (!profile) throw new Error("elite vazia");

  it("sobe 1,9 por ano até o pico e cai devagar depois", () => {
    expect(eliteOvr(profile, profile.born + profile.peakAge)).toBe(profile.peakOvr);
    expect(eliteOvr(profile, profile.born + profile.peakAge - 2)).toBeCloseTo(profile.peakOvr - 3.8);
    expect(eliteOvr(profile, profile.born + profile.peakAge + 1)).toBe(profile.peakOvr);
    expect(eliteOvr(profile, profile.born + profile.peakAge + 4)).toBeLessThan(profile.peakOvr);
  });

  it("fora da carreira não existe: antes dos 17, depois da aposentadoria", () => {
    expect(eliteOvr(profile, profile.born + 16)).toBeNull();
    expect(eliteOvr(profile, profile.born + profile.retireAge + 1)).toBeNull();
  });
});

describe("geração futura", () => {
  it("é a mesma para a mesma semente e muda com a semente", () => {
    expect(futureGeneration("futuro")).toEqual(futureGeneration("futuro"));
    expect(futureGeneration("futuro")).not.toEqual(futureGeneration("outro"));
  });

  it("um elenco completo por ano de nascimento, marcado como gerado e sem nome", () => {
    const generation = futureGeneration("elenco");
    const years = FUTURE_GENERATION.lastBorn - FUTURE_GENERATION.firstBorn + 1;
    expect(generation).toHaveLength(years * FUTURE_GENERATION.roster.length);
    expect(new Set(generation.map((profile) => profile.id)).size).toBe(generation.length);
    for (const profile of generation) {
      expect(profile.generated).toBe(true);
      expect(profile.name).toBe("");
      expect(profile.id.startsWith("future:")).toBe(true);
      expect(profile.peakOvr).toBeGreaterThanOrEqual(81);
      expect(profile.peakOvr).toBeLessThanOrEqual(94);
    }
  });

  it("mantém a disputa viva: pelo menos 15 candidatos de 84 ou mais em todo ano até 2050", () => {
    for (let year = 2026; year <= 2050; year += 1) {
      const strong = activeElite(year, "disputa").filter((candidate) => candidate.ovr >= 84);
      expect(strong.length, String(year)).toBeGreaterThanOrEqual(15);
    }
  });

  it("sem semente, só a elite real", () => {
    expect(activeElite(2030).every((candidate) => !candidate.profile.generated)).toBe(true);
  });
});

describe("prêmios do ano (GDD 13.2 a 13.4)", () => {
  it("quem é muito melhor que todos ganha a Bola de Ouro; o ranking vem em ordem", () => {
    const outcome = decideAwards("bola", 2034, {}, legend, false);
    expect(outcome.ballonDor.winner).toBe(PLAYER);
    expect(outcome.ballonDor.playerRank).toBe(1);
    expect(outcome.won).toContain("ballonDor");
    for (let index = 1; index < outcome.ballonDor.scores.length; index += 1) {
      expect(outcome.ballonDor.scores[index]).toBeLessThanOrEqual(outcome.ballonDor.scores[index - 1] ?? 0);
    }
    expect(outcome.ballonDor.ranking.length).toBeLessThanOrEqual(BALLON.showUpTo);
  });

  it("temporada suspensa não ganha nada (invariante 9)", () => {
    const outcome = decideAwards("suspenso", 2034, {}, { ...legend, eligible: false }, false);
    expect(outcome.won).toEqual([]);
    expect(outcome.ballonDor.ranking).not.toContain(PLAYER);
    expect(outcome.crowns).toEqual([]);
  });

  it("menos de 25 jogos: fora da Bola de Ouro", () => {
    const outcome = decideAwards("poucos", 2034, {}, { ...legend, games: 20 }, false);
    expect(outcome.ballonDor.ranking).not.toContain(PLAYER);
    expect(outcome.ballonDor.playerRank).toBeNull();
  });

  it("Chuteira de Ouro só para quem joga na UEFA", () => {
    const outcome = decideAwards("chuteira", 2034, {}, { ...legend, playsInUefa: false }, false);
    expect(outcome.goldenShoe.winner).not.toBe(PLAYER);
    expect(decideAwards("chuteira", 2034, {}, legend, false).goldenShoe.winner).toBe(PLAYER);
  });

  it("artilharia: 10 gols no Brasileirão não dão nada; 50 dão, com o craque de campeão junto", () => {
    expect(decideAwards("artilharia", 2034, {}, average, false).crowns).toEqual([]);
    const outcome = decideAwards("artilharia", 2034, {}, legend, false);
    expect(outcome.crowns).toContainEqual({ award: "topScorer", competition: "league:brasileirao", goals: 50 });
    expect(outcome.crowns).toContainEqual({ award: "bestPlayer", competition: "league:brasileirao", goals: 50 });
    expect(outcome.won).toEqual(expect.arrayContaining(["topScorer", "bestPlayer"]));
  });

  it("quem ganha a Chuteira de Ouro é o artilheiro da própria liga", () => {
    const laliga: CrownEntry = { ...brasileirao, competition: "league:laliga", goals: 34, field: 88, placing: "leagueTop" };
    for (let index = 0; index < 30; index += 1) {
      const outcome = decideAwards(`sapato-${index}`, 2034, {}, { ...legend, leagueGoals: 34, crownEntries: [laliga] }, false);
      if (outcome.goldenShoe.winner !== PLAYER) continue;
      expect(outcome.crowns.some((crown) => crown.award === "topScorer" && crown.competition === "league:laliga")).toBe(true);
    }
  });

  it("Revelação só até 21 anos", () => {
    const old = decideAwards("revelacao", 2034, {}, { ...legend, age: 25 }, false);
    expect(old.youngPlayer.ranking).not.toContain(PLAYER);
    const young = decideAwards("revelacao", 2034, {}, { ...legend, age: 20 }, false);
    expect(young.youngPlayer.ranking).toContain(PLAYER);
  });

  it("Luva de Ouro só entre goleiros", () => {
    expect(decideAwards("luva", 2034, {}, legend, false).goldenGlove.ranking).not.toContain(PLAYER);
    const keeper = decideAwards("luva", 2034, {}, { ...legend, position: "gk", cleanSheets: 30 }, false);
    expect(keeper.goldenGlove.ranking).toContain(PLAYER);
    for (const id of keeper.goldenGlove.ranking) {
      if (id === PLAYER) continue;
      const position = id.startsWith("future:") ? futureGeneration("luva").find((profile) => profile.id === id)?.position : getElite(id)?.position;
      expect(position).toBe("gk");
    }
  });

  it("o histórico guarda o vencedor de cada ano, e a sequência conta só o fim", () => {
    const outcome = decideAwards("historia", 2034, { ballonDor: ["a", "b"] }, average, false);
    expect(outcome.history.ballonDor).toHaveLength(3);
    expect(streakOf(["x", PLAYER, PLAYER], PLAYER)).toBe(2);
    expect(streakOf([PLAYER, "x"], PLAYER)).toBe(0);
    expect(streakOf(undefined, PLAYER)).toBe(0);
  });

  it("é determinístico", () => {
    expect(decideAwards("igual", 2034, {}, average, true)).toEqual(decideAwards("igual", 2034, {}, average, true));
  });
});

describe("prêmios de cada competição (D42)", () => {
  it("cada competição tem a marca real dos artilheiros; LaLiga pede mais que o Brasileirão", () => {
    const laliga = scoringMark("league:laliga", "league", 38);
    const brasil = scoringMark("league:brasileirao", "league", 38);
    expect(laliga?.mean).toBeGreaterThan(brasil?.mean ?? 99);
    expect(scoringMark("super:BRA", "superCup", 0)).toBeNull();
    expect(scoringMark("intercontinental", "intercontinental", 0)).toBeNull();
    expect(scoringMark("cup:BRA", "cup", 0)).not.toBeNull();
    expect(scoringMark("league:inventada", "league", 30)?.mean).toBe(23);
  });

  it("abaixo da média é impossível; a chance sobe a cada gol; acima do recorde é certa", () => {
    const mark = { mean: 20, spread: 2.5, record: 34 };
    expect(scoringCrownChance(19, mark)).toBe(0);
    const chances = [20, 21, 22, 23, 26, 30].map((goals) => scoringCrownChance(goals, mark));
    for (let index = 1; index < chances.length; index += 1) expect(chances[index]).toBeGreaterThan(chances[index - 1] ?? 1);
    expect(chances[0]).toBeGreaterThan(0);
    expect(scoringCrownChance(35, mark)).toBe(1);
  });

  it("craque precisa de 60% dos jogos e, no mata-mata, de pelo menos semifinal", () => {
    expect(bestPlayerEligible({ ...brasileirao, games: 20 })).toBe(false);
    expect(bestPlayerEligible({ ...brasileirao, games: 23 })).toBe(true);
    const cup: CrownEntry = { ...brasileirao, competition: "cup:BRA", kind: "cup", teamGames: 5, games: 5, placing: "other" };
    expect(bestPlayerEligible(cup)).toBe(false);
    expect(bestPlayerEligible({ ...cup, placing: "semi" })).toBe(true);
  });

  it("supercopa não tem prêmio; temporada suspensa também não; sorteio por competição", () => {
    const superCup: CrownEntry = { ...brasileirao, competition: "super:BRA", kind: "superCup", teamGames: 1, games: 1, goals: 5 };
    expect(decideCrowns({ seed: "s", year: 2030, eligible: true, position: "st", ovr: 99, entries: [superCup] })).toEqual([]);
    const big: CrownEntry = { ...brasileirao, goals: 60, games: 38, placing: "champion" };
    expect(decideCrowns({ seed: "s", year: 2030, eligible: false, position: "st", ovr: 99, entries: [big] })).toEqual([]);
    const alone = decideCrowns({ seed: "s", year: 2030, eligible: true, position: "st", ovr: 99, entries: [big] });
    const withCup = decideCrowns({
      seed: "s",
      year: 2030,
      eligible: true,
      position: "st",
      ovr: 99,
      entries: [{ ...big, competition: "cup:BRA", kind: "cup", teamGames: 6, games: 6, goals: 1 }, big],
    });
    expect(withCup.filter((crown) => crown.competition === "league:brasileirao")).toEqual(alone);
  });
});
