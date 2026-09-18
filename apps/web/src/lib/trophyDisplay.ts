import { getConfederationTrophies, getDomesticCup, getLeagueOfTeamAtTier } from "@/lib/data/dataset";
import { generatedTrophyUrl, isPlaceholderArt } from "@/lib/trophies";
import {
  CLUB_WORLD_CUP,

  WORLD_CUP,
  getDomesticSuperCup,
  getLeagueCup,
  type TrophyKey,
} from "@/lib/data/trophies";

export interface TrophyDisplay {
  key: TrophyKey;
  name: string;
  imageUrl?: string;
}

/**
 * Resolves a trophy key into the concrete competition it represents for the
 * club the player was at (and the confederation their country belongs to).
 * `t` supplies the locale-specific generic names (World Cup / Club World Cup) —
 * everything else is a proper noun that doesn't change between languages.
 * `tier` picks the right division for "league"/"cup" — a relegated club still
 * plays under the same team id, just in a different league object.
 */
/**
 * The competition's own artwork, or generated art when it has none.
 *
 * Twenty competitions shipped without a trophy image and all shared two
 * placeholder files, so a German treble showed three identical cups. Any
 * missing or placeholder url now resolves to a piece drawn for that
 * specific competition instead.
 */
function pick(
  shipped: string | undefined,
  artKey: string,
  category: Parameters<typeof generatedTrophyUrl>[1],
): string {
  return isPlaceholderArt(shipped) ? generatedTrophyUrl(artKey, category) : shipped!;
}

export function resolveTrophy(
  key: TrophyKey,
  teamId: string,
  playerConfederation: string,
  t: (key: string) => string,
  tier: number = 1,
): TrophyDisplay {
  const league = getLeagueOfTeamAtTier(teamId, tier);

  if (key === "league") {
    return {
      key,
      name: league?.name ?? "Liga",
      imageUrl: pick(league?.league_trophy_url, `league:${league?.id ?? ""}`, "league"),
    };
  }

  if (key === "cup") {
    const cup = getDomesticCup(league?.domestic_cup_id);
    return {
      key,
      name: cup?.name ?? "Copa",
      imageUrl: pick(cup?.trophy_url, `cup:${league?.domestic_cup_id ?? ""}`, "cup"),
    };
  }

  if (key === "league_cup") {
    const cup = getLeagueCup(league?.country_fifa_code);
    return {
      key,
      name: cup?.name ?? t("trophies.league_cup"),
      imageUrl: pick(cup?.trophy_url, `leaguecup:${league?.country_fifa_code ?? ""}`, "cup"),
    };
  }

  if (key === "domestic_super_cup") {
    const cup = getDomesticSuperCup(league?.country_fifa_code);
    return {
      key,
      name: cup?.name ?? t("trophies.domestic_super_cup"),
      imageUrl: pick(cup?.trophy_url, `super:${league?.country_fifa_code ?? ""}`, "super_cup"),
    };
  }

  if (
    key === "continental_primary" ||
    key === "continental_secondary" ||
    key === "continental_tertiary" ||
    key === "continental_super_cup"
  ) {
    const trophies = getConfederationTrophies(league?.confederation ?? playerConfederation);
    const def = trophies?.continental_trophies[key];
    const confederation = league?.confederation ?? playerConfederation;
    return {
      key,
      name: def?.name ?? t(`trophies.${key}`),
      imageUrl: pick(def?.trophy_url, `cont:${confederation}:${key}`, "continental"),
    };
  }

  if (key === "club_world_cup") {
    return { key, name: t("trophies.club_world_cup") || CLUB_WORLD_CUP.name, imageUrl: CLUB_WORLD_CUP.trophy_url };
  }

  // The annual one has no shipped photograph, so it gets a generated piece —
  // an amphora, the shape the continental super cups use, because it is the
  // same kind of trophy: one match between champions.
  if (key === "intercontinental_cup") {
    return {
      key,
      name: t("trophies.intercontinental_cup"),
      imageUrl: generatedTrophyUrl("cup:intercontinental", "continental"),
    };
  }

  if (key === "national_continental") {
    const def = getConfederationTrophies(playerConfederation)?.national_trophies.national_continental;
    return {
      key,
      name: def?.name ?? key,
      imageUrl: pick(def?.trophy_url, `cont:${playerConfederation}:national_continental`, "continental"),
    };
  }

  return { key, name: t("trophies.world_cup") || WORLD_CUP.name, imageUrl: WORLD_CUP.trophy_url };
}

export function formatMarketValue(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `€${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  return `€${Math.round(value / 1000)}K`;
}
