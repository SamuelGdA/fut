import { describe, expect, it } from "vitest";
import { createWorld, LAST_AGE, RETIREMENT_AGE, simulateWorldSeason } from "../src";
import { BALLON, ballonPositionPenalty, decideAwards, PLAYER, YOUNG_PLAYER, type PlayerAwardInput } from "../src/awards/awards";
import { nationsCupYear } from "../src/world/tuning";

const input = (patch: Partial<PlayerAwardInput>): PlayerAwardInput => ({
  eligible: true, position: "st", ovr: 90, age: 27, games: 50, goals: 30, assists: 10, leagueGoals: 22, cleanSheets: 0, playsInUefa: true,
  success: { league: true, cup: false, primary: false, worldCup: false, nationsCup: false }, crownEntries: [], ...patch,
});

describe("D109: cada torneio de seleções no ano dele", () => {
  it("Euro, Copa América e OFC a cada quatro anos; Copa Ouro nos anos ímpares; Ásia em 2027 e 2031; África em 2027, 2028 e 2032", () => {
    const years = (confederation: Parameters<typeof nationsCupYear>[0]) => [2026, 2027, 2028, 2029, 2030, 2031, 2032].filter((year) => nationsCupYear(confederation, year));
    expect(years("UEFA")).toEqual([2028, 2032]);
    expect(years("CONMEBOL")).toEqual([2028, 2032]);
    expect(years("OFC")).toEqual([2028, 2032]);
    expect(years("CONCACAF")).toEqual([2027, 2029, 2031]);
    expect(years("AFC")).toEqual([2027, 2031]);
    expect(years("CAF")).toEqual([2027, 2028, 2032]);
  });

  it("a temporada do mundo segue o calendário: em 2027 há Copa Ouro, Copa Africana e Copa da Ásia, sem Euro", () => {
    let world = createWorld("d109-calendario", 2026);
    world = simulateWorldSeason(world, "d109-calendario").next;
    const nations = simulateWorldSeason(world, "d109-calendario").results.nations;
    expect(Object.keys(nations).sort()).toEqual(["nations:AFC", "nations:CAF", "nations:CONCACAF", "nationsleague:UEFA"]);
  });
});

describe("D109: a Bola de Ouro olha mais o que o jogador fez", () => {
  it("cinco pontos de OVR valem quatro na nota", () => {
    const high = decideAwards("d109-ovr", 2034, {}, input({ ovr: 95 }), false).ballonDor.playerScore;
    const low = decideAwards("d109-ovr", 2034, {}, input({ ovr: 90 }), false).ballonDor.playerScore;
    expect(high - low).toBeCloseTo(5 * BALLON.ovrWeight + 0.5, 5);
  });

  it("a temporada histórica de gols passa do teto da produção", () => {
    const big = decideAwards("d109-gols", 2034, {}, input({ goals: 70, assists: 20 }), false).ballonDor.playerScore;
    const usual = decideAwards("d109-gols", 2034, {}, input({ goals: 66, assists: 0 }), false).ballonDor.playerScore;
    expect(big).toBeGreaterThan(usual + 1);
  });

  it("para o top 10, o zagueiro leva só parte do desconto de posição", () => {
    for (let year = 2030; year < 2040; year++) {
      const outcome = decideAwards(`d109-top-${year}`, year, {}, input({ position: "cb", goals: 4, assists: 2, cleanSheets: 22 }), false);
      const ballot = outcome.ballonDor;
      if (ballot.winner === PLAYER || ballot.playerRank === null) continue;
      const place = ballot.playerScore + (1 - BALLON.placementPositionShare) * ballonPositionPenalty(input({ position: "cb" }));
      const ahead = ballot.scores.filter((score) => score > place).length;
      expect(ballot.playerRank).toBe(Math.max(2, ahead + 1));
    }
  });
});

describe("D109: Troféu Kopa", () => {
  it("fora da Europa pesa menos que na Bola de Ouro, e o OVR conta menos que o desempenho", () => {
    expect(YOUNG_PLAYER.outsideEurope).toBeLessThan(BALLON.outsideEuropePenalty);
    expect(YOUNG_PLAYER.ovrWeight).toBeLessThan(1);
    const young = (patch: Partial<PlayerAwardInput>) => decideAwards("d109-kopa", 2032, {}, input({ age: 20, ...patch }), false).youngPlayer.playerScore;
    expect(young({ ovr: 86 }) - young({ ovr: 81 })).toBeCloseTo(5 * YOUNG_PLAYER.ovrWeight, 5);
  });
});

describe("D109: a carreira vai até 2050", () => {
  it("dos 16 aos 40: quem começa em 2026 joga a Copa de 2050", () => {
    expect(LAST_AGE).toBe(40);
    expect(RETIREMENT_AGE).toBe(41);
    expect(2026 + (LAST_AGE - 16)).toBe(2050);
    expect(2050 % 4).toBe(2);
  });
});
