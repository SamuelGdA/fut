import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { AWARDS, CLUBS, COMPETITIONS, getClubKit, getCountryKit, LEAGUES, type Kit } from "@craque/world";
import { describe, expect, it } from "vitest";
import {
  generatedLeagueBadge,
  generatedTrophyUrl,
  renderAvatarSvg,
  teamCrestSvg,
  teamCrestUrl,
  toArtLeague,
  trophyArtUrl,
  type AvatarConfig,
} from "../src";

/**
 * Prova do porte (D1, GDD 31.2): cada desenho do v2 sai idêntico byte a byte
 * ao do v1. A fixture foi gerada pelo próprio código do v1, com os dados do v1.
 */

interface Fixture {
  crests: Record<string, string>;
  leagueBadges: Record<string, string>;
  trophies: Record<string, string>;
  avatars: Array<{
    config: AvatarConfig | null;
    kit: string;
    showBackground: boolean;
    className: string | null;
    hash: string;
  }>;
}

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/v1-art.json", import.meta.url), "utf8"),
) as Fixture;

const hash = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 24);

/**
 * Diferenças esperadas: correções de dado, não de desenho. No v1 a cor de
 * destaque do kit dos Estados Unidos vinha com um espaço sobrando ("#B31942 "),
 * que acabava escrito dentro do SVG do selo gerado da MLS.
 */
const EXPECTED_BADGE_CHANGES = new Set(["usa-mls"]);

function kitFor(key: string): Kit | null {
  if (key === "none") return null;
  const [kind, id] = key.split(":");
  if (kind === "club") return getClubKit(id);
  if (kind === "country") return getCountryKit(id);
  throw new Error(`kit desconhecido na fixture: ${key}`);
}

describe("porte da arte do v1", () => {
  it("todos os 489 escudos saem idênticos", () => {
    const changed = CLUBS.filter((club) => hash(teamCrestSvg(club.id)) !== fixture.crests[club.id]).map((c) => c.id);
    expect(Object.keys(fixture.crests)).toHaveLength(CLUBS.length);
    expect(changed).toEqual([]);
  });

  it("todos os selos de liga gerados saem idênticos, salvo a correção de dado conhecida", () => {
    const changed = LEAGUES.filter(
      (league) => hash(generatedLeagueBadge(toArtLeague(league))) !== fixture.leagueBadges[league.id],
    ).map((league) => league.id);
    expect(new Set(changed)).toEqual(EXPECTED_BADGE_CHANGES);
  });

  it("todos os troféus gerados do v1 saem idênticos", () => {
    const changed = Object.entries(fixture.trophies).filter(([key, expected]) => {
      const url = key.startsWith("fallback:")
        ? generatedTrophyUrl(null, key.slice("fallback:".length) as Parameters<typeof generatedTrophyUrl>[1])
        : generatedTrophyUrl(key);
      return hash(url) !== expected;
    });
    expect(changed.map(([key]) => key)).toEqual([]);
  });

  it("o avatar sai idêntico em 62 combinações de rosto, camisa e fundo", () => {
    const changed = fixture.avatars.filter((sample) => {
      const svg = renderAvatarSvg(sample.config, {
        kit: kitFor(sample.kit),
        showBackground: sample.showBackground,
        className: sample.className ?? undefined,
      });
      return hash(svg) !== sample.hash;
    });
    expect(fixture.avatars).toHaveLength(62);
    expect(changed.map((sample) => sample.kit)).toEqual([]);
  });
});

describe("nenhuma peça fica sem imagem (GDD 39, invariante 16)", () => {
  it("todo clube tem escudo gerado", () => {
    for (const club of CLUBS) expect(teamCrestUrl(club.id)).toMatch(/^data:image\/svg\+xml/);
  });

  it("toda competição e todo prêmio têm troféu gerado", () => {
    for (const competition of COMPETITIONS) {
      expect(trophyArtUrl(competition.art.key, competition.art.category)).toMatch(/^data:image\/svg\+xml/);
    }
    for (const award of Object.values(AWARDS)) {
      expect(trophyArtUrl(award.art, "cup")).toMatch(/^data:image\/svg\+xml/);
    }
  });

  it("no modo gerado, nenhuma competição sai igual a outra", () => {
    const seen = new Map<string, string>();
    const repeated: string[] = [];
    for (const competition of COMPETITIONS) {
      const image = trophyArtUrl(competition.art.key, competition.art.category);
      const first = seen.get(image);
      if (first) repeated.push(`${competition.id} = ${first}`);
      else seen.set(image, competition.id);
    }
    expect(repeated).toEqual([]);
  });

  it("no modo gerado, os prêmios não repetem a arte de nenhuma competição", () => {
    const competitions = new Set(
      COMPETITIONS.map((competition) => trophyArtUrl(competition.art.key, competition.art.category)),
    );
    const awards = Object.values(AWARDS).map((award) => trophyArtUrl(award.art, "cup"));
    expect(new Set(awards).size).toBe(awards.length);
    for (const award of awards) expect(competitions.has(award)).toBe(false);
  });
});
