import { getConfederationTrophies, getDomesticCup, getLeagueOfTeamAtTier } from "@/lib/data/dataset";
import { CLUB_WORLD_CUP, GENERIC_TROPHY_IMAGES, WORLD_CUP, type TrophyKey } from "@/lib/data/trophies";

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
      imageUrl: league?.league_trophy_url || GENERIC_TROPHY_IMAGES.league,
    };
  }

  if (key === "cup") {
    const cup = getDomesticCup(league?.domestic_cup_id);
    return { key, name: cup?.name ?? "Copa", imageUrl: cup?.trophy_url || GENERIC_TROPHY_IMAGES.cup };
  }

  if (key === "continental_primary" || key === "continental_secondary") {
    const trophies = getConfederationTrophies(league?.confederation ?? playerConfederation);
    const def = trophies?.continental_trophies[key];
    return { key, name: def?.name ?? key, imageUrl: def?.trophy_url };
  }

  if (key === "club_world_cup") {
    return { key, name: t("trophies.club_world_cup") || CLUB_WORLD_CUP.name, imageUrl: CLUB_WORLD_CUP.trophy_url };
  }

  if (key === "national_continental") {
    const def = getConfederationTrophies(playerConfederation)?.national_trophies.national_continental;
    return { key, name: def?.name ?? key, imageUrl: def?.trophy_url };
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
