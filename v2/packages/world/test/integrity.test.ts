import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  areRivals,
  AWARDS,
  CLUB_KITS,
  CLUBS,
  clubsOf,
  COMPETITIONS,
  CONFEDERATIONS,
  COUNTRIES,
  getClub,
  getClubKit,
  getCompetition,
  getCountry,
  getCountryKit,
  LEAGUES,
  leagueAt,
  NEUTRAL_KIT,
  PLAYABLE_COUNTRIES,
  RIVALRIES,
  titleImportance,
  WORLD_SIZE,
} from "../src";

const ASSETS = new URL("../../../apps/game/public/assets/", import.meta.url);
const asset = (path: string) => existsSync(new URL(path, ASSETS));
const HEX = /^#[0-9a-fA-F]{6}$/;
const DASH = /[–—]/;

describe("escala do mundo (GDD 7.1)", () => {
  it("211 países, 17 com liga, 32 ligas, 489 clubes", () => {
    expect(WORLD_SIZE).toEqual({ countries: 211, playableCountries: 17, leagues: 32, clubs: 489 });
  });

  it("México e Estados Unidos só têm a primeira divisão", () => {
    for (const country of ["MEX", "USA"]) {
      expect(leagueAt(country, 2)).toBeNull();
      expect(leagueAt(country, 1)?.promotionSlots).toBe(0);
    }
  });
});

describe("países", () => {
  it("códigos FIFA e ISO são únicos", () => {
    expect(new Set(COUNTRIES.map((c) => c.code)).size).toBe(COUNTRIES.length);
    expect(new Set(COUNTRIES.map((c) => c.iso2)).size).toBe(COUNTRIES.length);
  });

  it("todo país tem nome nos três idiomas, força plausível e kit válido", () => {
    for (const country of COUNTRIES) {
      for (const name of Object.values(country.names)) expect(name.trim().length).toBeGreaterThan(0);
      expect(country.strength).toBeGreaterThanOrEqual(30);
      expect(country.strength).toBeLessThanOrEqual(92);
      expect(country.kit.base).toMatch(HEX);
      expect(country.kit.accent).toMatch(HEX);
    }
  });

  it("toda bandeira existe em assets/flags", () => {
    const missing = COUNTRIES.filter((c) => !asset(`flags/${c.iso2.toLowerCase()}.svg`)).map((c) => c.code);
    expect(missing).toEqual([]);
  });

  it("as seleções mais fortes de cada confederação fazem sentido", () => {
    const best = (confederation: string) =>
      COUNTRIES.filter((c) => c.confederation === confederation).sort((a, b) => b.strength - a.strength)[0]?.code;
    expect(["ESP", "FRA"]).toContain(best("UEFA"));
    expect(best("CONMEBOL")).toBe("ARG");
    expect(best("CAF")).toBe("MAR");
    expect(best("AFC")).toBe("JPN");
    expect(best("OFC")).toBe("NZL");
  });
});

describe("ligas e clubes", () => {
  it("ids de clube são únicos no mundo inteiro (GDD 39, invariante 15)", () => {
    expect(new Set(CLUBS.map((c) => c.id)).size).toBe(CLUBS.length);
  });

  it("todo clube pertence a uma liga existente do seu país", () => {
    const orphans = CLUBS.filter((club) => !leagueAt(club.country, club.division)).map((c) => c.id);
    expect(orphans).toEqual([]);
  });

  it("toda liga tem pelo menos 8 clubes e um calendário plausível", () => {
    for (const league of LEAGUES) {
      expect(clubsOf(league.country, league.division).length).toBeGreaterThanOrEqual(8);
      expect(league.games).toBeGreaterThanOrEqual(20);
      expect(league.games).toBeLessThanOrEqual(50);
    }
  });

  it("acesso e rebaixamento trocam o mesmo número de clubes nas duas divisões", () => {
    for (const country of PLAYABLE_COUNTRIES) {
      const top = leagueAt(country, 1);
      const second = leagueAt(country, 2);
      if (!second) continue;
      expect(second.promotionSlots).toBe(top?.promotionSlots);
      expect(second.promotionSlots).toBeLessThan(clubsOf(country, 2).length);
    }
  });

  it("notas dentro das faixas do GDD", () => {
    for (const club of CLUBS) {
      expect(club.strength).toBeGreaterThanOrEqual(40);
      expect(club.strength).toBeLessThanOrEqual(92);
      expect(club.prestige).toBeGreaterThanOrEqual(1);
      expect(club.prestige).toBeLessThanOrEqual(5);
      expect(club.color).toMatch(HEX);
    }
  });

  it("toda primeira divisão é, em média, mais forte que a segunda do mesmo país", () => {
    const average = (country: string, tier: 1 | 2) => {
      const clubs = clubsOf(country, tier);
      return clubs.reduce((sum, club) => sum + club.strength, 0) / clubs.length;
    };
    for (const country of PLAYABLE_COUNTRIES) {
      if (!leagueAt(country, 2)) continue;
      expect(average(country, 1)).toBeGreaterThan(average(country, 2));
    }
  });

  it("os gigantes estão onde deveriam", () => {
    const top = [...CLUBS].sort((a, b) => b.strength - a.strength).slice(0, 6).map((c) => c.id);
    expect(top).toContain("real-madrid");
    expect(top).toContain("bayern-munchen");
    expect(getClub("flamengo")?.strength).toBeGreaterThan(getClub("remo")?.strength ?? 99);
  });

  it("todo escudo e troféu real declarado existe em assets", () => {
    const missingCrests = CLUBS.filter((c) => c.crest && !asset(`clubs/${c.id}.${c.crest}`)).map((c) => c.id);
    const missingLeagues = LEAGUES.filter((l) => l.crest && !asset(`leagues/${l.id}.${l.crest}`)).map((l) => l.id);
    expect(missingCrests).toEqual([]);
    expect(missingLeagues).toEqual([]);
  });
});

describe("kits e rivalidades", () => {
  it("todo kit curado aponta para um clube existente, com cores válidas", () => {
    for (const [id, kit] of Object.entries(CLUB_KITS)) {
      expect(getClub(id), id).not.toBeNull();
      expect(kit.base).toMatch(HEX);
      expect(kit.accent).toMatch(HEX);
    }
  });

  it("clube sem kit curado veste a cor primária; sem clube, o kit neutro", () => {
    expect(getClubKit(null)).toEqual(NEUTRAL_KIT);
    const plain = CLUBS.find((club) => !CLUB_KITS[club.id]);
    expect(plain).toBeDefined();
    if (plain) expect(getClubKit(plain.id).base).toBe(plain.color);
    expect(getCountryKit("BRA").base).toBe(getCountry("BRA")?.kit.base);
  });

  it("rivalidades ligam clubes existentes, sem repetição", () => {
    const keys = new Set<string>();
    for (const [a, b] of RIVALRIES) {
      expect(getClub(a), a).not.toBeNull();
      expect(getClub(b), b).not.toBeNull();
      const key = [a, b].sort().join("|");
      expect(keys.has(key), key).toBe(false);
      keys.add(key);
    }
  });

  it("rivalidade vale nos dois sentidos e nunca consigo mesmo", () => {
    expect(areRivals("flamengo", "fluminense")).toBe(true);
    expect(areRivals("fluminense", "flamengo")).toBe(true);
    expect(areRivals("flamengo", "flamengo")).toBe(false);
    expect(areRivals("flamengo", "barcelona")).toBe(false);
  });
});

describe("competições e prêmios", () => {
  it("ids únicos e nomes nos três idiomas, sem travessão", () => {
    expect(new Set(COMPETITIONS.map((c) => c.id)).size).toBe(COMPETITIONS.length);
    for (const competition of [...COMPETITIONS, ...Object.values(AWARDS)]) {
      for (const name of Object.values(competition.names)) {
        expect(name.trim().length).toBeGreaterThan(0);
        expect(DASH.test(name)).toBe(false);
      }
    }
  });

  it("toda liga tem a sua competição; todo país jogável tem copa, menos o México", () => {
    for (const league of LEAGUES) expect(getCompetition(`league:${league.id}`)).not.toBeNull();
    for (const country of PLAYABLE_COUNTRIES) {
      expect(getCompetition(`cup:${country}`) === null).toBe(country === "MEX");
    }
  });

  it("toda confederação tem torneio de seleções", () => {
    for (const confederation of CONFEDERATIONS) {
      expect(getCompetition(`nations:${confederation}`)).not.toBeNull();
    }
  });

  it("todo troféu e prêmio real declarado existe em assets", () => {
    const missing = [
      ...COMPETITIONS.filter((c) => c.trophy && !asset(c.trophy)).map((c) => c.id),
      ...Object.values(AWARDS).filter((a) => a.image && !asset(a.image)).map((a) => a.key),
    ];
    expect(missing).toEqual([]);
  });

  it("a importância do título segue a confederação do clube (GDD 7.5)", () => {
    expect(titleImportance("league")).toBe(1);
    expect(titleImportance("intercontinental", "UEFA")).toBe(1);
    expect(titleImportance("intercontinental", "CONMEBOL")).toBe(2);
    expect(titleImportance("clubWorldCup", "UEFA")).toBe(2.5);
    expect(titleImportance("clubWorldCup", "CONCACAF")).toBe(3.5);
    expect(titleImportance("continental1", "CONMEBOL")).toBe(2.5);
  });
});
