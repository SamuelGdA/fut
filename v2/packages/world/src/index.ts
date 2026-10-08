/**
 * O mundo do CRAQUE v2: países, ligas, clubes, competições, prêmios, kits e
 * rivalidades. Só dados e consultas: nenhuma simulação, nenhum framework.
 *
 * Fatos (nomes, divisões, cores) vêm do mundo real; as notas de força e
 * prestígio foram escritas para o v2 (GDD 7.1) e ficam editáveis pelo CSV
 * em `data/clubes.csv` (ver `pnpm notas:exportar` e `pnpm notas:importar`).
 */

export * from "./types";
export { ELITE, getElite, type ElitePosition, type EliteProfile } from "./elite";
export {
  areRivals,
  CLUB_KITS,
  CLUBS,
  clubsOf,
  COUNTRIES,
  getClub,
  getClubKit,
  getCountry,
  getCountryKit,
  getLeague,
  LEAGUES,
  leagueAt,
  leaguesOf,
  NEUTRAL_KIT,
  PLAYABLE_COUNTRIES,
  RIVALRIES,
  WORLD_SIZE,
} from "./world";
export {
  AWARD_KEYS,
  AWARDS,
  COMPETITIONS,
  getCompetition,
  titleImportance,
  type Award,
  type AwardKey,
  type Competition,
  type CompetitionKind,
  type TrophyArtCategory,
} from "./competitions";
