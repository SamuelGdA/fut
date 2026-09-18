import { describe, expect, it } from "vitest";
import {
  ALL_TEAMS,
  COUNTRIES,
  DOMESTIC_CUPS,
  DOMESTIC_SUPER_CUPS,
  LEAGUES,
  LEAGUE_ORDER,
  LEAGUE_CUPS,
  PLAYABLE_COUNTRY_CODES,
  areRivals,
  CLUB_RIVALRIES,
  getCountryByFifa,
  getKitForTeam,
  getLeagueByTier,
  getLeagueOfTeam,
  getTeam,
  CONFEDERATION_TROPHIES,
  type Confederation,
} from "../src";

/**
 * The dataset has no type system of its own: it is JSON, hand-edited, and
 * every row is a real-world fact somebody typed. These are the checks that
 * turn the mistakes that actually happened into build failures.
 *
 * Each one exists because of a specific incident, noted on the test.
 */

const CONFEDERATIONS: Confederation[] = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];
const HEX = /^#[0-9a-fA-F]{6}$/;

describe("identifiers", () => {
  /**
   * The lookup index is a Map built by `set`, so a duplicate id does not throw:
   * it silently overwrites, and the club ends up filed under another country's
   * league. This already happened twice, with `river-plate` and `colegiales`,
   * which exist in both Argentina and Paraguay.
   */
  it("gives every club a globally unique id", () => {
    const seen = new Map<string, string[]>();
    for (const league of LEAGUES) {
      for (const team of league.teams) {
        seen.set(team.id, [...(seen.get(team.id) ?? []), `${league.country_fifa_code}/${league.id}`]);
      }
    }
    const duplicates = [...seen.entries()].filter(([, where]) => where.length > 1);
    expect(duplicates.map(([id, where]) => `${id} in ${where.join(" and ")}`)).toEqual([]);
  });

  it("gives every league a unique id", () => {
    const ids = LEAGUES.map((league) => league.id);
    expect(ids).toHaveLength(new Set(ids).size);
  });

  it("gives every country a unique FIFA code and a unique ISO code", () => {
    const fifa = COUNTRIES.map((country) => country.fifa_code).filter(Boolean);
    const iso = COUNTRIES.map((country) => country.iso_alpha2).filter(Boolean);
    expect(fifa).toHaveLength(new Set(fifa).size);
    expect(iso).toHaveLength(new Set(iso).size);
  });

  it("resolves every club back to itself and to its league", () => {
    for (const team of ALL_TEAMS) {
      expect(getTeam(team.id), team.id).not.toBeNull();
      expect(getLeagueOfTeam(team.id), team.id).not.toBeNull();
    }
  });
});

describe("league order", () => {
  /**
   * The order feeds `ALL_TEAMS`, which the transfer market buckets and picks
   * from, so it is behaviour and not presentation. Splitting the single
   * leagues file into one per country would have quietly reordered it, because
   * the original interleaves countries.
   */
  it("lists exactly the leagues that exist, once each", () => {
    expect([...LEAGUE_ORDER].sort()).toEqual(LEAGUES.map((league) => league.id).sort());
    expect(LEAGUE_ORDER).toHaveLength(new Set(LEAGUE_ORDER).size);
  });

  it("assembles the leagues in that order", () => {
    expect(LEAGUES.map((league) => league.id)).toEqual([...LEAGUE_ORDER]);
  });
});

describe("division coverage", () => {
  it("gives every league a tier of 1 or 2", () => {
    const wrong = LEAGUES.filter((league) => league.tier !== 1 && league.tier !== 2);
    expect(wrong.map((league) => `${league.id} tier ${league.tier}`)).toEqual([]);
  });

  /**
   * Promotion and relegation switch on purely by the existence of a tier-2
   * league for that country. A second division with no top flight above it
   * would therefore promote clubs into nothing.
   */
  it("never gives a country a second division without a first", () => {
    const orphans = LEAGUES.filter(
      (league) => league.tier === 2 && !getLeagueByTier(league.country_fifa_code, 1),
    );
    expect(orphans.map((league) => league.id)).toEqual([]);
  });

  it("gives every country at most one league per tier", () => {
    const seen = new Set<string>();
    const clashes: string[] = [];
    for (const league of LEAGUES) {
      const key = `${league.country_fifa_code}:${league.tier}`;
      if (seen.has(key)) clashes.push(`${key} (${league.id})`);
      seen.add(key);
    }
    expect(clashes).toEqual([]);
  });

  it("files every league under a country that exists", () => {
    const unknown = LEAGUES.filter((league) => !getCountryByFifa(league.country_fifa_code));
    expect(unknown.map((league) => `${league.id} -> ${league.country_fifa_code}`)).toEqual([]);
  });

  it("keeps the playable country set in step with the leagues", () => {
    const fromLeagues = new Set(LEAGUES.map((league) => league.country_fifa_code.toUpperCase()));
    expect([...PLAYABLE_COUNTRY_CODES].sort()).toEqual([...fromLeagues].sort());
  });

  /** A league nobody can be relegated out of or promoted into still has to be playable. */
  it("gives every league at least eight clubs", () => {
    const thin = LEAGUES.filter((league) => league.teams.length < 8);
    expect(thin.map((league) => `${league.id}: ${league.teams.length}`)).toEqual([]);
  });
});

describe("competitions", () => {
  /**
   * `resolveTrophy` looks a cup up by the id the league names. A league
   * pointing at a cup that does not exist renders a trophy with no name and no
   * artwork, and the season that won it reads as a blank row.
   */
  it("never points a league at a domestic cup that does not exist", () => {
    const orphans = LEAGUES.filter(
      (league) => league.domestic_cup_id && !DOMESTIC_CUPS[league.domestic_cup_id],
    );
    expect(orphans.map((league) => `${league.id} -> ${league.domestic_cup_id}`)).toEqual([]);
  });

  /** The reverse: a cup nobody plays for is dead weight that still ships. */
  it("never defines a domestic cup no league plays for", () => {
    const claimed = new Set(
      LEAGUES.map((league) => league.domestic_cup_id).filter((id): id is string => Boolean(id)),
    );
    const unused = Object.keys(DOMESTIC_CUPS).filter((id) => !claimed.has(id));
    expect(unused).toEqual([]);
  });

  it("files every domestic cup under a country that has a league", () => {
    const stray = Object.entries(DOMESTIC_CUPS).filter(
      ([, cup]) => !PLAYABLE_COUNTRY_CODES.has(cup.country_fifa_code.toUpperCase()),
    );
    expect(stray.map(([id]) => id)).toEqual([]);
  });

  it("only defines super cups and league cups for countries that play", () => {
    for (const code of Object.keys(DOMESTIC_SUPER_CUPS)) {
      expect(PLAYABLE_COUNTRY_CODES.has(code), `super cup for ${code}`).toBe(true);
    }
    for (const code of Object.keys(LEAGUE_CUPS)) {
      expect(PLAYABLE_COUNTRY_CODES.has(code), `league cup for ${code}`).toBe(true);
    }
  });

  it("gives every confederation a continental title for its national teams", () => {
    for (const confederation of CONFEDERATIONS) {
      const trophies = CONFEDERATION_TROPHIES[confederation];
      expect(trophies?.national_trophies.national_continental, confederation).toBeTruthy();
    }
  });

  /**
   * A confederation with a secondary competition but no primary one would let a
   * club win the lesser trophy while the exclusion rules reference a title that
   * does not exist.
   */
  it("never gives a confederation a secondary or tertiary cup without a primary", () => {
    for (const confederation of CONFEDERATIONS) {
      const cups = CONFEDERATION_TROPHIES[confederation]?.continental_trophies;
      if (!cups) continue;
      if (cups.continental_secondary || cups.continental_tertiary) {
        expect(cups.continental_primary, confederation).toBeTruthy();
      }
    }
  });

  it("uses a known confederation everywhere one is named", () => {
    for (const league of LEAGUES) {
      expect(CONFEDERATIONS as string[], league.id).toContain(league.confederation);
    }
    for (const country of COUNTRIES) {
      expect(CONFEDERATIONS as string[], country.fifa_code).toContain(country.confederation);
    }
  });
});

describe("club and country rows", () => {
  /**
   * The crest generator derives a badge from the club's colour, so a malformed
   * hex produces an invisible or black badge rather than an error.
   */
  it("gives every club a well-formed primary colour", () => {
    const bad = ALL_TEAMS.filter((team) => !HEX.test(team.primary_color));
    expect(bad.map((team) => `${team.id}: ${team.primary_color}`)).toEqual([]);
  });

  it("gives every club a name and an abbreviation", () => {
    const bad = ALL_TEAMS.filter((team) => !team.name.trim() || !team.abbreviation.trim());
    expect(bad.map((team) => team.id)).toEqual([]);
  });

  it("keeps every reputation an integer from 0 to 5", () => {
    const bad: string[] = [];
    for (const team of ALL_TEAMS) {
      for (const key of ["domestic_reputation", "continental_reputation", "international_reputation"] as const) {
        const value = team[key];
        if (!Number.isInteger(value) || value < 0 || value > 5) bad.push(`${team.id}.${key}=${value}`);
      }
    }
    expect(bad).toEqual([]);
  });

  /**
   * The three reputations mean different things and a second division splits
   * them cleanly.
   *
   * Domestic reputation drives the odds of winning the league and the cup, and
   * continental reputation drives entry into the continental competitions. A
   * second-tier club can do neither, so both are zero for every one of them,
   * without exception.
   *
   * International reputation is not standing, it is squad strength: it is what
   * sets the level the club fields, and therefore what the player is measured
   * against for a place in the side. A fallen giant in the second division
   * still has a better squad than the club promoted last season, and the data
   * says so: Wolfsburg, West Ham, Southampton, Girona and Nantes all sit at 3
   * while in the second tier.
   *
   * Collapsing all three to zero would make every second division a flat
   * league of identical clubs, which is both wrong and much less interesting
   * to be promoted out of.
   */
  it("keeps second-division clubs out of the competitions they cannot enter", () => {
    const wrong: string[] = [];
    for (const league of LEAGUES.filter((l) => l.tier === 2)) {
      for (const team of league.teams) {
        if (team.domestic_reputation !== 0) {
          wrong.push(`${team.id} in ${league.id}: domestic ${team.domestic_reputation}`);
        }
        if (team.continental_reputation !== 0) {
          wrong.push(`${team.id} in ${league.id}: continental ${team.continental_reputation}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  /**
   * And the ceiling on squad strength. A second-tier club rated 4 or 5 would
   * field a side stronger than most of the top flight above it, which would
   * make being promoted a downgrade.
   */
  it("never gives a second-division club an elite squad", () => {
    const wrong: string[] = [];
    for (const league of LEAGUES.filter((l) => l.tier === 2)) {
      for (const team of league.teams) {
        if (team.international_reputation > 3) {
          wrong.push(`${team.id} in ${league.id}: ${team.international_reputation}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it("gives every country the three locale names and a flag", () => {
    const bad = COUNTRIES.filter(
      (country) => !country.name_pt || !country.name_es || !country.name_en || !country.flag_url,
    );
    expect(bad.map((country) => country.fifa_code || country.iso_alpha2)).toEqual([]);
  });

  it("keeps every country reputation an integer from 0 to 6", () => {
    const bad: string[] = [];
    for (const country of COUNTRIES) {
      for (const key of ["continental_reputation", "fifa_reputation", "international_reputation"] as const) {
        const value = country[key];
        if (!Number.isInteger(value) || value < 0 || value > 6) {
          bad.push(`${country.fifa_code}.${key}=${value}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("derived tables", () => {
  /**
   * The rivalry table is what marks a move as a betrayal, and a betrayal
   * blocks that club from ever making an offer again. An id typo there is
   * silent: the pair simply never matches.
   */
  it("names only clubs that exist in every rivalry", () => {
    const unknown: string[] = [];
    for (const [a, b] of CLUB_RIVALRIES) {
      if (!getTeam(a)) unknown.push(a);
      if (!getTeam(b)) unknown.push(b);
    }
    expect([...new Set(unknown)]).toEqual([]);
  });

  it("never lists the same rivalry twice, in either direction", () => {
    const seen = new Set<string>();
    const repeats: string[] = [];
    for (const [a, b] of CLUB_RIVALRIES) {
      const key = [a, b].sort().join(":");
      if (seen.has(key)) repeats.push(key);
      seen.add(key);
    }
    expect(repeats).toEqual([]);
  });

  it("never claims a club is its own rival", () => {
    expect(CLUB_RIVALRIES.filter(([a, b]) => a === b)).toEqual([]);
  });

  /**
   * A derby between two countries is always a typo. The table is about local
   * rivalries, and the only way a pair spans a border is an id that landed in
   * the wrong league.
   */
  it("never pairs clubs from different countries", () => {
    const crossBorder: string[] = [];
    for (const [a, b] of CLUB_RIVALRIES) {
      const left = getLeagueOfTeam(a)?.country_fifa_code;
      const right = getLeagueOfTeam(b)?.country_fifa_code;
      if (left && right && left !== right) crossBorder.push(`${a} (${left}) / ${b} (${right})`);
    }
    expect(crossBorder).toEqual([]);
  });

  it("treats rivalry as symmetric and never reflexive", () => {
    const pairs: [string, string][] = [
      ["flamengo", "fluminense"],
      ["boca-juniors", "river-plate"],
      ["real-madrid", "barcelona"],
    ];
    for (const [a, b] of pairs) {
      expect(areRivals(a, b), `${a}/${b}`).toBe(true);
      expect(areRivals(b, a), `${b}/${a}`).toBe(true);
      expect(areRivals(a, a)).toBe(false);
    }
  });

  it("gives every club a kit, generated or curated", () => {
    for (const team of ALL_TEAMS) {
      const kit = getKitForTeam(team.id);
      expect(HEX.test(kit.base), `${team.id} base ${kit.base}`).toBe(true);
      expect(HEX.test(kit.accent), `${team.id} accent ${kit.accent}`).toBe(true);
    }
  });
});

describe("scale", () => {
  /**
   * Not a rule, a tripwire. These numbers are quoted in the README and in
   * REQUISITOS.md section 10, and they have gone stale before.
   */
  it("matches the documented size of the world", () => {
    expect({
      leagues: LEAGUES.length,
      countriesWithLeagues: PLAYABLE_COUNTRY_CODES.size,
      clubs: ALL_TEAMS.length,
      countries: COUNTRIES.length,
      secondDivisions: LEAGUES.filter((league) => league.tier === 2).length,
    }).toEqual({
      leagues: 32,
      countriesWithLeagues: 17,
      clubs: 489,
      countries: 211,
      secondDivisions: 15,
    });
  });
});
