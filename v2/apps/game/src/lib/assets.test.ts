import { existsSync } from "node:fs";
import { AWARDS, CLUBS, COMPETITIONS, COUNTRIES, LEAGUES } from "@craque/world";
import { afterEach, describe, expect, it } from "vitest";
import { ASSET_MODE, TROPHY_ASSET_MODE } from "./env";
import {
  awardImageUrl,
  clubCrestUrl,
  competitionTrophyUrl,
  flagUrl,
  leagueLogoUrl,
  useAssetMode,
} from "./assets";

const PUBLIC = new URL("../../public/", import.meta.url);
const BASE = import.meta.env.BASE_URL;
const GENERATED = /^data:image\/svg\+xml/;

/** Um endereço de `public/` aponta para um arquivo que existe de verdade. */
function fileExists(url: string): boolean {
  if (!url.startsWith(`${BASE}assets/`)) return false;
  return existsSync(new URL(url.slice(BASE.length), PUBLIC));
}

/** No modo real, cada imagem é um arquivo existente ou, sem foto, a arte gerada. */
function resolvesInRealMode(url: string, hasReal: boolean): boolean {
  return hasReal ? fileExists(url) : GENERATED.test(url);
}

describe("imagens no modo real", () => {
  it("todo escudo aponta para um arquivo existente ou para a arte gerada", () => {
    const wrong = CLUBS.filter((club) => !resolvesInRealMode(clubCrestUrl(club, "real"), club.crest !== null));
    expect(wrong.map((club) => club.id)).toEqual([]);
  });

  it("o escudo também resolve pelo id do clube", () => {
    const club = CLUBS.find((item) => item.crest !== null);
    expect(club).toBeDefined();
    if (club) expect(clubCrestUrl(club.id, "real")).toBe(clubCrestUrl(club, "real"));
  });

  it("todo selo de liga, troféu e prêmio resolve", () => {
    const leagues = LEAGUES.filter((league) => !resolvesInRealMode(leagueLogoUrl(league, "real"), league.crest !== null));
    const trophies = COMPETITIONS.filter(
      (competition) => !resolvesInRealMode(competitionTrophyUrl(competition, "real"), competition.trophy !== null),
    );
    const awards = Object.values(AWARDS).filter(
      (award) => !resolvesInRealMode(awardImageUrl(award, "real"), award.image !== null),
    );
    expect(leagues.map((league) => league.id)).toEqual([]);
    expect(trophies.map((competition) => competition.id)).toEqual([]);
    expect(awards.map((award) => award.key)).toEqual([]);
  });

  it("o craque da Copa e o da Champions têm peça própria; os outros craques usam a geral (D118)", () => {
    const worldCup = awardImageUrl(AWARDS.bestPlayer, "real", "worldcup");
    const champions = awardImageUrl(AWARDS.bestPlayer, "real", "cont1:UEFA");
    expect(worldCup).toContain("awards/best-player-world-cup.webp");
    expect(champions).toContain("awards/best-player-champions.webp");
    expect(resolvesInRealMode(worldCup, true) && resolvesInRealMode(champions, true)).toBe(true);
    expect(awardImageUrl(AWARDS.bestPlayer, "real", "cont1:CONMEBOL")).toBe(awardImageUrl(AWARDS.bestPlayer, "real"));
    expect(awardImageUrl(AWARDS.ballonDor, "real", "worldcup")).toBe(awardImageUrl(AWARDS.ballonDor, "real"));
  });

  it("toda bandeira existe, com o nome do arquivo em minúsculas", () => {
    const missing = COUNTRIES.filter((country) => !fileExists(flagUrl(country.iso2)));
    expect(missing.map((country) => country.code)).toEqual([]);
    expect(flagUrl("GB-ENG")).toBe(`${BASE}assets/flags/gb-eng.svg`);
  });
});

describe("imagens no modo gerado", () => {
  it("nenhum escudo, selo, troféu ou prêmio sai da pasta de fotos", () => {
    const urls = [
      ...CLUBS.map((club) => clubCrestUrl(club, "gerado")),
      ...LEAGUES.map((league) => leagueLogoUrl(league, "gerado")),
      ...COMPETITIONS.map((competition) => competitionTrophyUrl(competition, "gerado")),
      ...Object.values(AWARDS).map((award) => awardImageUrl(award, "gerado")),
    ];
    expect(urls.filter((url) => !GENERATED.test(url))).toEqual([]);
  });

  it("clube desconhecido ainda recebe uma imagem, nunca um endereço vazio", () => {
    expect(clubCrestUrl("clube-que-nao-existe", "gerado")).toMatch(GENERATED);
    expect(clubCrestUrl("clube-que-nao-existe", "real")).toMatch(GENERATED);
  });
});

describe("modo de imagens em tempo real", () => {
  afterEach(() => useAssetMode.setState({ mode: ASSET_MODE, trophyMode: TROPHY_ASSET_MODE }));

  it("começa no modo do build e troca quando o laboratório pede", () => {
    expect(useAssetMode.getState().mode).toBe(ASSET_MODE);
    expect(useAssetMode.getState().trophyMode).toBe(TROPHY_ASSET_MODE);
    useAssetMode.getState().setMode("gerado");
    expect(useAssetMode.getState().mode).toBe("gerado");
    expect(useAssetMode.getState().trophyMode).toBe("gerado");
    useAssetMode.getState().setMode("real");
    expect(useAssetMode.getState().mode).toBe("real");
    expect(useAssetMode.getState().trophyMode).toBe("real");
  });
});
