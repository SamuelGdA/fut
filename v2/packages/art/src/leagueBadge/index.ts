/**
 * The badge a league shows, whether or not it shipped one.
 *
 * `leagueLogoUrl` is the only thing outside this folder that should be called:
 * it hands back the real artwork when a league has some, and a generated badge
 * when it does not. Same shape as `pick()` in `lib/trophyDisplay`, which does
 * exactly this for trophies.
 *
 * Everything is derived from the country the league belongs to, so a Colombian
 * badge comes out yellow, blue and red without anyone writing that down. The
 * curated table below exists only for the handful of initials the derivation
 * gets clumsily wrong.
 */

import { getCountryByFifa, type League } from "../data";
import { getKitForCountry } from "../data";
import { isLight, lighten, separates, temper } from "../palette";
import type { FieldKind } from "../crest/fields";
import { leagueBadgeDataUri, type LeagueBadgeSpec } from "./render";

/** Initials that read better than the derived ones. */
const MARKS: Record<string, string> = {
  "ligapro-serie-b": "SB",
  "liga-futve-2": "FV2",
  "segunda-division-uruguaya": "SD",
  "copa-simon-bolivar": "CSB",
};

/**
 * Words that carry no identity, so "Copa de Primera" does not come out as CDP.
 * `liga`, `serie`, `primera`, `segunda` and the digits stay: they are the whole
 * difference between "Primera B" and "Liga 2".
 */
const STOPWORDS = new Set(["de", "del", "la", "las", "los", "el", "campeonato", "torneo"]);

/**
 * The mark, from the league's own name rather than the country's, because two
 * leagues in one country have to differ.
 *
 * The ASCII fold is not cosmetic. A raw `Ñ` or `Í` inside the `<text>` node of
 * a data URI produces a broken image, and three of these league names have one.
 */
function deriveMark(league: League): string {
  const folded = league.name.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const initials = (words: string[]) =>
    words
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3);
  const words = folded.split(/\s+/).filter(Boolean);
  const trimmed = initials(words.filter((word) => !STOPWORDS.has(word.toLowerCase())));
  // A single letter is not a badge. "Torneo Dimayor" loses its only
  // meaningful word to the stopword list, so when trimming leaves nothing to
  // read, keep the whole name instead.
  const letters = trimmed.length >= 2 ? trimmed : initials(words);
  return letters || league.country_fifa_code.slice(0, 3).toUpperCase();
}

/** The kit pattern a country plays in, as a field. */
function deriveField(kitType: string | undefined, hasThird: boolean): FieldKind {
  if (kitType === "vertical_stripes") return "stripes";
  if (kitType === "diagonal_sash") return "sash";
  if (kitType === "checkerboard") return "checks";
  if (kitType === "horizontal_stripes") return "hoops";
  // A national tricolour is the most recognisable thing a country owns, and
  // five of the eight have one sitting unused in the dataset.
  return hasThird ? "tricolorH" : "band";
}

function specFor(league: League): LeagueBadgeSpec {
  const country = getCountryByFifa(league.country_fifa_code);
  const kit = getKitForCountry(country);
  // `temper` is load-bearing: Peru and Paraguay both list white as their kit
  // primary, and a white badge disappears on a light surface.
  const base = temper(kit.base);
  const accent = separates(kit.accent, base)
    ? kit.accent
    : isLight(base)
      ? "#12161f"
      : lighten(base, 0.7);
  const third = country?.kit_tertiary_color || undefined;

  return {
    base,
    accent,
    third,
    field: deriveField(country?.kit_type, Boolean(third)),
    n: 5,
    mark: MARKS[league.id] ?? deriveMark(league),
    tier: league.tier,
  };
}

/** The league's own artwork, or a generated badge when it shipped none. */
export function leagueLogoUrl(league: League | null | undefined): string | undefined {
  if (!league) return undefined;
  if (league.logo_url) return league.logo_url;
  return leagueBadgeDataUri(league.id, specFor(league));
}

/** The generated badge regardless of what the league shipped — for the dev sheet. */
export function generatedLeagueBadge(league: League): string {
  return leagueBadgeDataUri(`gen:${league.id}`, specFor(league));
}

export type { LeagueBadgeSpec } from "./render";
