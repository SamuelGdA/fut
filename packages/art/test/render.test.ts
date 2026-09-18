import { describe, expect, it } from "vitest";
import { ALL_TEAMS, LEAGUES, getKitForTeam } from "@craque/data";
import {
  ACCESSORY_STYLES,
  BEARD_STYLES,
  DEFAULT_AVATAR,
  EYE_SHAPES,
  HAIR_STYLES,
  MOUTH_STYLES,
  NOSE_SHAPES,
  TIER_BANDS,
  avatarDataUri,
  cardTier,
  generatedLeagueBadge,
  generatedTrophyUrl,
  isPlaceholderArt,
  leagueLogoUrl,
  renderAvatarSvg,
  teamCrestSvg,
  teamCrestUrl,
  tierProgress,
  type AvatarConfig,
} from "../src";

/**
 * What can go wrong with generated art, and what catches it.
 *
 * None of this asserts that a badge looks good; that is what the contact
 * sheets are for. It asserts the three things that have actually broken
 * before and were invisible until someone happened to look at the right
 * club at the right size.
 */

const DATA_URI = /^data:image\/svg\+xml[;,]/;

/**
 * FNV-1a over the whole set. Cheaper to store than 489 snapshots and just as
 * sensitive: any change to any club's badge moves it.
 */
function digest(parts: string[]): string {
  let hash = 0x811c9dc5;
  for (const part of parts) {
    for (let i = 0; i < part.length; i += 1) {
      hash ^= part.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

describe("club crests", () => {
  it("gives every club a badge", () => {
    const missing = ALL_TEAMS.filter((team) => !teamCrestUrl(team.id));
    expect(missing.map((team) => team.id)).toEqual([]);
  });

  it("produces a usable data URI for every club", () => {
    const malformed = ALL_TEAMS.filter((team) => !DATA_URI.test(teamCrestUrl(team.id) ?? ""));
    expect(malformed.map((team) => team.id)).toEqual([]);
  });

  /**
   * A badge is derived from a hash of the club id, so the same club has to get
   * the same badge on every device and every session, forever. A club whose
   * crest changed between two loads would be a different club to the player.
   */
  it("draws the same badge for the same club every time", () => {
    for (const team of ALL_TEAMS.slice(0, 40)) {
      expect(teamCrestSvg(team.id), team.id).toBe(teamCrestSvg(team.id));
    }
  });

  /**
   * Two clubs sharing a badge is the failure this system is most prone to:
   * the field and the device are drawn from the same hash, so a weak spread
   * puts two sides in the same league in matching kit. It happened once,
   * between `titanes` and `atletico-el-vigia`.
   */
  it("keeps the badges of any one league distinguishable", () => {
    const clashes: string[] = [];
    for (const league of LEAGUES) {
      const seen = new Map<string, string>();
      for (const team of league.teams) {
        const svg = teamCrestSvg(team.id);
        const twin = seen.get(svg);
        if (twin) clashes.push(`${league.id}: ${twin} and ${team.id}`);
        seen.set(svg, team.id);
      }
    }
    expect(clashes).toEqual([]);
  });

  it("has not silently changed", () => {
    expect(digest(ALL_TEAMS.map((team) => teamCrestSvg(team.id)))).toMatchInlineSnapshot(`"79381cad"`);
  });
});

describe("competition art", () => {
  it("gives every league a badge, shipped or generated", () => {
    const missing = LEAGUES.filter((league) => !leagueLogoUrl(league));
    expect(missing.map((league) => league.id)).toEqual([]);
  });

  /**
   * Both places a league badge appears sit it next to a club crest, and every
   * crest is a disc. A round league badge would read as a second club, so the
   * shield is a rule and not a preference.
   */
  it("never draws a league badge as a circle", () => {
    for (const league of LEAGUES) {
      const badge = decodeURIComponent(generatedLeagueBadge(league));
      expect(badge, league.id).toContain("M14 8h72v46c0 22-16 33-36 40C30 87 14 76 14 54Z");
    }
  });

  it("falls back to generated art wherever a competition shipped none", () => {
    expect(isPlaceholderArt(undefined)).toBe(true);
    expect(isPlaceholderArt("")).toBe(true);
    expect(isPlaceholderArt("/craque-assets/trophies/football/generic-cup.svg")).toBe(true);
    expect(isPlaceholderArt("/craque-assets/trophies/football/international/UEFA/euro.svg")).toBe(false);
    expect(generatedTrophyUrl("league:copa-simon-bolivar", "league")).toMatch(DATA_URI);
    // An unknown key still has to produce something rather than throw.
    expect(generatedTrophyUrl("nothing:at:all", "cup")).toMatch(DATA_URI);
    expect(generatedTrophyUrl(null)).toMatch(DATA_URI);
  });
});

describe("the portrait", () => {
  const variants = (): AvatarConfig[] => {
    const out: AvatarConfig[] = [];
    for (const hair of HAIR_STYLES) {
      for (const beard of BEARD_STYLES) out.push({ ...DEFAULT_AVATAR, hair, beard });
    }
    for (const accessory of ACCESSORY_STYLES) out.push({ ...DEFAULT_AVATAR, accessory });
    for (const eyeShape of EYE_SHAPES) out.push({ ...DEFAULT_AVATAR, eyeShape });
    for (const nose of NOSE_SHAPES) out.push({ ...DEFAULT_AVATAR, nose });
    for (const mouth of MOUTH_STYLES) out.push({ ...DEFAULT_AVATAR, mouth });
    return out;
  };

  it("draws every combination of features without a gap", () => {
    for (const config of variants()) {
      const svg = renderAvatarSvg(config);
      expect(svg.startsWith("<svg"), config.hair).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      // An unresolved value would land in the markup as the word `undefined`
      // and the browser would drop the attribute silently.
      expect(svg, config.hair).not.toContain("undefined");
      expect(svg).not.toContain("NaN");
    }
  });

  it("renders the silhouette with no facial features at all", () => {
    const svg = renderAvatarSvg(null);
    expect(svg).toContain("#B7BCC1");
    // The eye whites are the giveaway: a silhouette must not have any.
    expect(svg).not.toContain('fill="#FFFFFF"');
  });

  /** A hat replaces the hair rather than drawing over it. */
  it("hides the hair under a beret", () => {
    const withHair = renderAvatarSvg({ ...DEFAULT_AVATAR, hair: "afro", accessory: "none" });
    const underBeret = renderAvatarSvg({ ...DEFAULT_AVATAR, hair: "afro", accessory: "beret" });
    expect(withHair).toContain('cy="52" rx="49"');
    expect(underBeret).not.toContain('cy="52" rx="49"');
  });

  it("colours the jersey from the kit and clips the pattern to the torso", () => {
    const kit = getKitForTeam("barcelona");
    const svg = renderAvatarSvg(DEFAULT_AVATAR, { kit });
    expect(svg).toContain(kit.base);
    expect(svg).toContain("clip-path=\"url(#cq-av-torso)\"");
  });

  /**
   * The poster encodes this straight into an `<img>`. An SVG carrying only a
   * viewBox can be reported as 0x0, which is how a portrait silently vanishes
   * from an exported card.
   */
  it("gives the exported portrait explicit dimensions and no backdrop", () => {
    const uri = avatarDataUri(DEFAULT_AVATAR);
    expect(uri).toMatch(DATA_URI);
    const markup = decodeURIComponent(uri.slice(uri.indexOf(",") + 1));
    expect(markup).toContain('width="400"');
    expect(markup).toContain('height="400"');
    expect(markup).not.toContain("var(--avatar-bg");
  });

  it("has not silently changed", () => {
    expect(digest(variants().map((config) => renderAvatarSvg(config)))).toMatchInlineSnapshot(
      `"e5fda0ae"`,
    );
  });
});

describe("the card spec", () => {
  it("covers every rating from 0 to 99 with exactly one band", () => {
    for (let overall = 0; overall <= 99; overall += 1) {
      const tier = cardTier(overall);
      const matching = TIER_BANDS.filter((band) => overall >= band.min && overall <= band.max);
      expect(matching.map((band) => band.tier), String(overall)).toEqual([tier]);
    }
  });

  it("runs the polish from the floor of a band to its ceiling", () => {
    expect(tierProgress(75)).toBe(0);
    expect(tierProgress(93)).toBe(1);
    expect(tierProgress(94)).toBe(0);
    expect(tierProgress(99)).toBe(1);
    for (let overall = 0; overall <= 99; overall += 1) {
      const progress = tierProgress(overall);
      expect(progress, String(overall)).toBeGreaterThanOrEqual(0);
      expect(progress, String(overall)).toBeLessThanOrEqual(1);
    }
  });
});
