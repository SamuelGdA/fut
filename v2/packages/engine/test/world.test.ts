import { CLUBS, CONFEDERATIONS, getClub, getCountry, LEAGUES, leagueAt, PLAYABLE_COUNTRIES } from "@craque/world";
import { describe, expect, it } from "vitest";
import {
  BASE_DIVISION,
  BASE_STRENGTH,
  clubIndex,
  continentalEntrants,
  createWorld,
  currentStrength,
  type SeasonMemory,
  type SeasonResults,
  simulateWorldSeason,
  stageAt,
  type WorldState,
} from "../src";

/** O mundo sozinho (GDD 8): regras de cada torneio e invariantes da seção 39. */

function seasons(seed: string, count: number, startYear = 2026): { results: SeasonResults[]; worlds: WorldState[] } {
  let world = createWorld(seed, startYear);
  const results: SeasonResults[] = [];
  const worlds: WorldState[] = [world];
  for (let index = 0; index < count; index += 1) {
    const step = simulateWorldSeason(world, seed);
    results.push(step.results);
    world = step.next;
    worlds.push(world);
  }
  return { results, worlds };
}

const run = seasons("mundo-teste", 9);

describe("o mundo novo", () => {
  it("começa no ano pedido, com as forças e divisões reais dos dados", () => {
    const world = createWorld("inicio", 2031);
    expect(world.year).toBe(2031);
    expect(world.strength).toEqual(BASE_STRENGTH);
    expect(world.division).toEqual(BASE_DIVISION);
  });

  it("chega com memória: tabelas de todas as ligas e campeões continentais", () => {
    const world = createWorld("memoria", 2026);
    for (const league of LEAGUES) expect(world.memory.tables[league.id]?.length).toBeGreaterThan(7);
    expect(world.memory.continental["cont1:UEFA"]?.winner).toBeTruthy();
    expect(world.memory.primaryChampions.UEFA?.length).toBe(4);
  });

  it("é determinístico: a mesma semente dá o mesmo mundo e a mesma temporada", () => {
    expect(createWorld("igual", 2026)).toEqual(createWorld("igual", 2026));
    const a = simulateWorldSeason(createWorld("igual", 2026), "igual");
    const b = simulateWorldSeason(createWorld("igual", 2026), "igual");
    expect(a).toEqual(b);
    const c = simulateWorldSeason(createWorld("outra", 2026), "outra");
    expect(c.results.leagues["premier-league"]?.rows).not.toEqual(a.results.leagues["premier-league"]?.rows);
  });
});

describe("ligas (GDD 8.3 e 8.4)", () => {
  it("toda liga tem exatamente um campeão, posições de 1 a n e pontos que nunca crescem (invariante 14)", () => {
    for (const season of run.results) {
      for (const league of Object.values(season.leagues)) {
        expect(league.rows.map((row) => row.position)).toEqual(league.rows.map((_, index) => index + 1));
        expect(league.rows.filter((row) => row.position === 1)).toHaveLength(1);
        for (let index = 1; index < league.rows.length; index += 1) {
          expect(league.rows[index]?.points).toBeLessThanOrEqual(league.rows[index - 1]?.points ?? 0);
        }
        expect(league.rows[0]?.points).toBeLessThanOrEqual(Math.round(2.63 * league.games));
      }
    }
  });

  it("cada clube joga exatamente uma liga por temporada, a da divisão atual (invariante 13)", () => {
    run.results.forEach((season, index) => {
      const world = run.worlds[index];
      if (!world) return;
      const seen = new Map<string, string>();
      for (const league of Object.values(season.leagues)) {
        for (const row of league.rows) {
          expect(seen.has(row.club)).toBe(false);
          seen.set(row.club, league.league);
          expect(world.division[clubIndex(row.club)]).toBe(league.division);
          expect(getClub(row.club)?.country).toBe(league.country);
        }
      }
      expect(seen.size).toBe(CLUBS.length);
    });
  });

  it("acesso e rebaixamento trocam os últimos da primeira com os primeiros da segunda", () => {
    const [first] = run.results;
    const after = run.worlds[1];
    if (!first || !after) throw new Error("sem temporada");
    for (const country of PLAYABLE_COUNTRIES) {
      const top = leagueAt(country, 1);
      const second = leagueAt(country, 2);
      if (!top || !second) {
        expect(first.promoted[country]).toBeUndefined();
        continue;
      }
      const slots = top.promotionSlots;
      const relegated = first.leagues[top.id]?.rows.slice(-slots).map((row) => row.club) ?? [];
      const promoted = first.leagues[second.id]?.rows.slice(0, slots).map((row) => row.club) ?? [];
      expect(first.relegated[country]).toEqual(relegated);
      expect(first.promoted[country]).toEqual(promoted);
      for (const id of relegated) expect(after.division[clubIndex(id)]).toBe(2);
      for (const id of promoted) expect(after.division[clubIndex(id)]).toBe(1);
    }
  });

  it("o tamanho de cada divisão não muda de uma temporada para outra", () => {
    const sizes = (world: WorldState) =>
      LEAGUES.map((league) =>
        CLUBS.filter((club, index) => club.country === league.country && world.division[index] === league.division).length,
      );
    const start = sizes(run.worlds[0] as WorldState);
    for (const world of run.worlds) expect(sizes(world)).toEqual(start);
  });
});

describe("copas e supercopas (GDD 8.5 e 8.6)", () => {
  it("a copa nacional reúne todos os clubes do país, das duas divisões", () => {
    const season = run.results[0] as SeasonResults;
    for (const country of PLAYABLE_COUNTRIES) {
      const cup = season.cups[`cup:${country}`];
      if (country === "MEX") {
        expect(cup).toBeUndefined();
        continue;
      }
      expect(new Set(cup?.order)).toEqual(new Set(CLUBS.filter((club) => club.country === country).map((club) => club.id)));
    }
    expect(season.cups["leaguecup:ENG"]?.order.length).toBeGreaterThan(30);
  });

  it("a supercopa junta o campeão da liga e o da copa do ano anterior (ou o vice)", () => {
    run.results.forEach((season, index) => {
      const memory = run.worlds[index]?.memory as SeasonMemory;
      for (const country of ["ENG", "ESP", "BRA", "MEX"]) {
        const match = season.superCups[`super:${country}`];
        const table = memory.tables[leagueAt(country, 1)?.id ?? ""] ?? [];
        expect(match?.home).toBe(table[0]);
        const cupWinner = memory.cups[`cup:${country}`]?.winner;
        expect(match?.away).toBe(cupWinner && cupWinner !== table[0] ? cupWinner : table[1]);
        expect([match?.home, match?.away]).toContain(match?.winner);
      }
    });
  });
});

describe("classificação continental (GDD 8.7)", () => {
  /** Uma memória inventada para testar as vagas uma a uma. */
  function memoryWith(country: string, cupWinner: string): SeasonMemory {
    const world = createWorld("vagas", 2026);
    const league = leagueAt(country, 1);
    if (!league) throw new Error("sem liga");
    const table = [...(world.memory.tables[league.id] ?? [])];
    return {
      ...world.memory,
      cups: { ...world.memory.cups, [`cup:${country}`]: { winner: cupWinner, runnerUp: table[1] ?? "" } },
    };
  }

  it("Inglaterra: 4 na primária, o 5º e o campeão da copa na secundária, o 6º na terciária", () => {
    const base = createWorld("vagas", 2026).memory;
    const table = base.tables["premier-league"] ?? [];
    const cupWinner = table[10] ?? "";
    const entrants = continentalEntrants(memoryWith("ENG", cupWinner));
    const english = (competition: string) => (entrants[competition] ?? []).filter((id) => getClub(id)?.country === "ENG");
    expect(english("cont1:UEFA").slice(0, 4)).toEqual(table.slice(0, 4));
    expect(english("cont2:UEFA")).toEqual([table[4], cupWinner]);
    expect(english("cont3:UEFA")).toEqual([table[5]]);
  });

  it("vaga repetida desce: campeão da copa já na primária libera a vaga para o próximo da tabela", () => {
    const table = createWorld("vagas", 2026).memory.tables["premier-league"] ?? [];
    const entrants = continentalEntrants(memoryWith("ENG", table[0] ?? ""));
    const english = (competition: string) => (entrants[competition] ?? []).filter((id) => getClub(id)?.country === "ENG");
    expect(english("cont2:UEFA")).toEqual([table[4], table[5]]);
    expect(english("cont3:UEFA")).toEqual([table[6]]);
  });

  it("no Brasil, 6 mais o campeão da copa na Libertadores e 6 na Sul-Americana", () => {
    const entrants = continentalEntrants(createWorld("vagas", 2026).memory);
    const brazilian = (competition: string) => (entrants[competition] ?? []).filter((id) => getClub(id)?.country === "BRA");
    expect(brazilian("cont1:CONMEBOL").length).toBeGreaterThanOrEqual(7);
    expect(brazilian("cont2:CONMEBOL")).toHaveLength(6);
  });

  it("o campeão da primária volta a ela mesmo sem vaga pela liga", () => {
    const memory = createWorld("vagas", 2026).memory;
    const outsider = memory.tables["premier-league"]?.[15] ?? "";
    const entrants = continentalEntrants({
      ...memory,
      continental: { ...memory.continental, "cont1:UEFA": { winner: outsider, runnerUp: "real-madrid" } },
    });
    expect(entrants["cont1:UEFA"]).toContain(outsider);
  });

  it("ninguém joga dois continentais na mesma temporada", () => {
    for (const season of run.results) {
      for (const confederation of CONFEDERATIONS) {
        const all = ["cont1", "cont2", "cont3"].flatMap((tier) => season.continental[`${tier}:${confederation}`]?.order ?? []);
        expect(new Set(all).size).toBe(all.length);
      }
    }
  });
});

describe("torneios entre continentes e de seleções (GDD 8.10 a 8.12)", () => {
  it("Intercontinental: o campeão europeu do ano anterior contra o vencedor do chaveamento", () => {
    run.results.forEach((season, index) => {
      const memory = run.worlds[index]?.memory as SeasonMemory;
      const result = season.intercontinental;
      expect(result?.final.home).toBe(memory.continental["cont1:UEFA"]?.winner);
      expect(result?.final.away).toBe(result?.bracket[0]);
      expect(result?.bracket).toContain("generic:AFC");
      expect(result?.bracket).toContain(season.continental["cont1:CONMEBOL"]?.order[0]);
    });
  });

  it("Mundial de Clubes só nos anos certos, com 22 clubes", () => {
    for (const season of run.results) {
      if (season.year % 4 === 1) {
        expect(season.clubWorldCup?.order).toHaveLength(22);
        expect(new Set(season.clubWorldCup?.order).size).toBe(22);
      } else {
        expect(season.clubWorldCup).toBeNull();
      }
    }
  });

  it("Copa do Mundo de 48 nos anos certos, com as sedes classificadas", () => {
    for (const season of run.results) {
      const cup = season.nations.worldcup;
      if (season.year % 4 !== 2) {
        expect(cup).toBeUndefined();
        continue;
      }
      expect(cup?.order).toHaveLength(48);
      expect(new Set(cup?.order).size).toBe(48);
      if (season.year === 2030) for (const host of ["ESP", "POR", "MAR"]) expect(cup?.order).toContain(host);
      const perConfederation = (code: string) => cup?.order.filter((nation) => getCountry(nation)?.confederation === code).length ?? 0;
      expect(perConfederation("OFC")).toBeGreaterThanOrEqual(1);
      expect(perConfederation("UEFA")).toBeGreaterThanOrEqual(16);
    }
  });

  it("continentais de seleções nos anos certos; a Eurocopa com 24", () => {
    for (const season of run.results) {
      const euro = season.nations["nations:UEFA"];
      if (season.year % 4 !== 0) {
        expect(euro).toBeUndefined();
        continue;
      }
      expect(euro?.order).toHaveLength(24);
      expect(season.nations["nations:CONMEBOL"]?.order).toHaveLength(10);
    }
  });

  it("a fase sai da posição final", () => {
    const groups = { kind: "groups", groupSlots: 32 } as const;
    expect(stageAt(0, groups)).toBe("champion");
    expect(stageAt(1, groups)).toBe("final");
    expect(stageAt(3, groups)).toBe("semi");
    expect(stageAt(7, groups)).toBe("quarter");
    expect(stageAt(15, groups)).toBe("roundOf16");
    expect(stageAt(20, groups)).toBe("groups");
    expect(stageAt(40, groups)).toBe("early");
    expect(stageAt(20, { kind: "knockout", groupSlots: 0 })).toBe("roundOf32");
    expect(stageAt(40, { kind: "groups32", groupSlots: 48 })).toBe("groups");
  });
});

describe("o jogador dentro do mundo (GDD 8.2)", () => {
  it("somar força ao clube só pode melhorar a posição dele, com a mesma sorte", () => {
    const world = createWorld("impacto", 2026);
    const club = "botafogo";
    const position = (results: SeasonResults) =>
      results.leagues.brasileirao?.rows.find((row) => row.club === club)?.position ?? 99;
    const without = simulateWorldSeason(world, "impacto");
    const withPlayer = simulateWorldSeason(world, "impacto", { club, ovr: 92, participation: 0.95 });
    expect(position(withPlayer.results)).toBeLessThanOrEqual(position(without.results));
  });
});

describe("força dos clubes (GDD 8.13)", () => {
  it("volta à média: depois de 9 temporadas ninguém se afasta mais de 6 pontos da base", () => {
    const last = run.worlds[run.worlds.length - 1] as WorldState;
    last.strength.forEach((strength, index) => {
      expect(Math.abs(strength - (BASE_STRENGTH[index] ?? strength))).toBeLessThanOrEqual(6);
    });
    expect(currentStrength(last, "flamengo")).toBeGreaterThan(60);
  });
});
