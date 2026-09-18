/**
 * The football world: countries, leagues, clubs and the competitions they
 * play for.
 *
 * Pure data plus the indices to read it. No simulation, no rendering, no
 * framework. Everything else in the repository depends on this and it depends
 * on nothing, which is what makes it the package to extract first.
 */

export type { Team, League, Country, Confederation } from "./types";

export {
  ALL_TEAMS,
  COUNTRIES,
  LEAGUES,
  PLAYABLE_COUNTRY_CODES,
  getConfederationTrophies,
  getCountryByFifa,
  getCountryByIso,
  getDomesticCup,
  getLeagueByTier,
  getLeagueOfTeam,
  getLeagueOfTeamAtTier,
  getLeaguesOfCountry,
  getTeam,
  hasDomesticCup,
} from "./lookups";

export { LEAGUE_ORDER } from "./world/leagues";

export { areRivals, CLUB_RIVALRIES } from "./world/rivalries";

export {
  KIT_DATABASE,
  NEUTRAL_KIT,
  getKitForCountry,
  getKitForTeam,
  type KitDef,
  type KitPattern,
} from "./world/kits";

export {
  AWARD_ICONS,
  AWARD_IMAGES,
  CLUB_TROPHY_IMPORTANCE,
  CLUB_WORLD_CUP,
  CLUB_WORLD_CUP_IMPORTANCE,
  CONFEDERATION_TROPHIES,
  DOMESTIC_CUPS,
  DOMESTIC_SUPER_CUPS,
  GENERIC_TROPHY_IMAGES,
  INTERCONTINENTAL_IMPORTANCE,
  LEAGUE_CUPS,
  NATIONAL_TROPHY_IMPORTANCE,
  WORLD_CUP,
  getDomesticSuperCup,
  getLeagueCup,
  singleTrophyImportance,
  trophyImportance,
  type AwardKey,
  type ClubTrophyKey,
  type NationalTrophyKey,
  type TrophyKey,
} from "./competitions/trophies";
