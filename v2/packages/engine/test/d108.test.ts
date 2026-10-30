import { CLUBS, getCompetition, getCountry } from "@craque/world";
import { describe, expect, it } from "vitest";
import { choose, createCareer, createWorld, MAX_DECISIONS, policyChoice, simulateWorldSeason, type Career } from "../src";
import { AWARD_BOOST, awardBoost, BALLON_TITLE, decideAwards, PLAYER, YOUNG_PLAYER, type PlayerAwardInput } from "../src/awards/awards";
import { BENCH_LIMIT, benchLimitReached } from "../src/career/decisions";
import { drawNationalGames } from "../src/season/national";
import { stream } from "../src/rng";
import { NATIONS_LEAGUE } from "../src/world/tuning";

/** Joga até ter clube (sem empréstimo) numa idade, para mexer no contrato. */
function careerAt(seed: string, age: number): Career {
  let career = createCareer({ seed, startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: null } });
  for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
    if (career.age >= age && career.contract && !career.contract.loan) return career;
    career = choose(career, policyChoice(career, "balanced")!).career;
  }
  throw new Error("carreira sem clube na idade");
}

describe("D108: o banco tem teto", () => {
  const base = careerAt("d108-banco", 22);
  const benched = (age: number, benchSeasons: number, yearsAtClub: number): Career => ({
    ...base,
    age,
    bonds: {},
    contract: { ...base.contract!, benchSeasons, since: base.world.year - yearsAtClub },
  });

  it("o jovem no banco fica até os 22; aos 23, a paciência acabou", () => {
    expect(benchLimitReached(benched(22, 4, 4))).toBe(false);
    expect(benchLimitReached(benched(23, 1, 1))).toBe(true);
    expect(benchLimitReached(benched(24, 2, 2))).toBe(true);
  });

  it("quem chegou com 23 ou mais fica no máximo cinco anos de casa no banco", () => {
    // Banco começou depois dos 22 (uma temporada só, aos 27): conta os anos de casa.
    expect(benchLimitReached(benched(28, 1, BENCH_LIMIT.years - 1))).toBe(false);
    expect(benchLimitReached(benched(28, 1, BENCH_LIMIT.years))).toBe(true);
    expect(BENCH_LIMIT.idol).toBeGreaterThan(0);
    expect(BENCH_LIMIT.legend).toBeGreaterThan(BENCH_LIMIT.idol);
  });
});

describe("D108: Portugal e a Liga das Nações no mundo", () => {
  let world = createWorld("d108-mundo", 2026);
  const seasons = [] as ReturnType<typeof simulateWorldSeason>["results"][];
  for (let index = 0; index < 2; index++) {
    const step = simulateWorldSeason(world, "d108-mundo");
    seasons.push(step.results);
    world = step.next;
  }
  const [even, odd] = seasons as [typeof seasons[number], typeof seasons[number]];

  it("Portugal joga Primeira Liga, Liga Portugal 2, Taça de Portugal, Taça da Liga e Supertaça", () => {
    expect(odd.leagues["primeira-liga"]?.rows).toHaveLength(18);
    expect(odd.leagues["liga-portugal-2"]?.rows).toHaveLength(18);
    expect(new Set(odd.cups["cup:POR"]?.order)).toEqual(new Set(CLUBS.filter((club) => club.country === "POR").map((club) => club.id)));
    expect(odd.cups["leaguecup:POR"]?.order.length).toBeGreaterThan(10);
    expect(odd.superCups["super:POR"]).toBeTruthy();
    expect(odd.cups["cup:PER"]).toBeUndefined();
  });

  it("a Liga das Nações tem fase final nos anos ímpares, com as 16 da Liga A da UEFA", () => {
    expect(2027 % 2).toBe(NATIONS_LEAGUE.parity);
    expect(even.nations["nationsleague:UEFA"]).toBeUndefined();
    const league = odd.nations["nationsleague:UEFA"]!;
    expect(league.order).toHaveLength(NATIONS_LEAGUE.size);
    for (const code of league.order) expect(getCountry(code)?.confederation).toBe("UEFA");
    expect(getCompetition("nationsleague:UEFA")?.kind).toBe("nationsLeague");
  });

  it("os jogos da Liga das Nações ocupam datas de amistoso: a convocação não incha", () => {
    for (let index = 0; index < 50; index++) {
      // Titular aos 26: de 9 a 11 jogos comuns; os 8 das quartas cabem dentro deles.
      const without = drawNationalGames(stream(`liga:${index}`, "national"), "starter", 26, 0);
      const withLeague = drawNationalGames(stream(`liga:${index}`, "national"), "starter", 26, 8, 8);
      expect(withLeague).toBe(without);
    }
  });
});

describe("D108: Chuteira de Ouro, coroas e Troféu Kopa", () => {
  it("a Chuteira soma meio ponto; a coroa pesa pelo nível da competição, com teto", () => {
    expect(awardBoost([], true)).toBe(AWARD_BOOST.goldenShoe);
    const champions = awardBoost([{ award: "bestPlayer", competition: "cont1:UEFA", goals: 8 }], false);
    const league = awardBoost([{ award: "topScorer", competition: "league:laliga", goals: 30 }], false);
    const cup = awardBoost([{ award: "topScorer", competition: "cup:ESP", goals: 6 }], false);
    expect(champions).toBeCloseTo(AWARD_BOOST.crown * BALLON_TITLE.continental1!);
    expect(champions).toBeGreaterThan(league);
    expect(league).toBeGreaterThan(cup);
    const many = Array.from({ length: 12 }, () => ({ award: "bestPlayer" as const, competition: "worldcup", goals: 6 }));
    expect(awardBoost(many, false)).toBe(AWARD_BOOST.crownMax);
  });

  const input = (patch: Partial<PlayerAwardInput>): PlayerAwardInput => ({
    eligible: true, position: "st", ovr: 86, age: 20, games: 45, goals: 28, assists: 9, leagueGoals: 20, cleanSheets: 0, playsInUefa: true,
    success: { league: true, cup: false, primary: false, worldCup: false, nationsCup: false }, crownEntries: [], ...patch,
  });

  it("o Kopa é de quem joga na Europa: fora dela, o mesmo ano perde o desconto inteiro", () => {
    const europe = decideAwards("d108-kopa", 2030, {}, input({}), false);
    const outside = decideAwards("d108-kopa", 2030, {}, input({ playsInUefa: false }), false);
    expect(europe.youngPlayer.playerScore - outside.youngPlayer.playerScore).toBeCloseTo(YOUNG_PLAYER.outsideEurope);
    // A temporada histórica (OVR alto e Champions ou Copa) reduz o desconto.
    const historic = decideAwards("d108-kopa", 2030, {}, input({ playsInUefa: false, ovr: YOUNG_PLAYER.outsideHistoricOvr, success: { league: true, cup: false, primary: true, worldCup: false, nationsCup: false } }), false);
    const historicEurope = decideAwards("d108-kopa", 2030, {}, input({ ovr: YOUNG_PLAYER.outsideHistoricOvr, success: { league: true, cup: false, primary: true, worldCup: false, nationsCup: false } }), false);
    expect(historicEurope.youngPlayer.playerScore - historic.youngPlayer.playerScore).toBeCloseTo(YOUNG_PLAYER.outsideHistoric);
  });

  it("acima de 21 anos não há Kopa; até 21, ele concorre", () => {
    expect(decideAwards("d108-idade", 2030, {}, input({ age: 22 }), false).youngPlayer.ranking).not.toContain(PLAYER);
    expect(decideAwards("d108-idade", 2030, {}, input({ ovr: 92 }), false).youngPlayer.ranking).toContain(PLAYER);
  });
});

describe("D108: a janela do meio do período do Rápida não aposenta", () => {
  it("aposentar só nas decisões principais; o período nunca termina pela metade", () => {
    for (let seed = 0; seed < 8; seed++) {
      let career = createCareer({ seed: `d108-rapida-${seed}`, startYear: 2026, pace: "normal", difficulty: "normal", identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "cam", dreamNumber: null } });
      for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
        if (career.drama && career.decision.kind === "window") expect(career.decision.options.some((option) => option.kind === "retire")).toBe(false);
        career = choose(career, policyChoice(career, seed % 2 ? "ambitious" : "random")!).career;
      }
      expect(career.end).not.toBeNull();
    }
  });
});
