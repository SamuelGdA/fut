import leaguesJson from "./leagues.json";
import countriesJson from "./countries.json";
import { CONFEDERATION_TROPHIES, DOMESTIC_CUPS, type Confederation } from "./trophies";

export interface Team {
  id: string;
  name: string;
  short_name: string;
  abbreviation: string;
  logo_url: string;
  primary_color: string;
  domestic_reputation: number;
  continental_reputation: number;
  international_reputation: number;
}

export interface League {
  id: string;
  name: string;
  country_fifa_code: string;
  logo_url: string;
  league_trophy_url: string;
  confederation: Confederation;
  tier: number;
  domestic_cup_id?: string;
  teams: Team[];
}

export interface Country {
  name_en: string;
  name_es: string;
  name_pt: string;
  iso_alpha2: string;
  fifa_code: string;
  slug: string;
  flag_url: string;
  confederation: Confederation;
  continental_reputation: number;
  fifa_reputation: number;
  international_reputation: number;
  primary_color: string;
  kit_primary_color: string;
  kit_secondary_color: string;
  kit_tertiary_color: string;
  kit_type?: "vertical_stripes" | "checkerboard" | "diagonal_sash";
}

export const LEAGUES = leaguesJson as unknown as League[];
export const COUNTRIES = countriesJson as unknown as Country[];

/** A handful of dataset rows carry null codes, so normalise defensively. */
const norm = (v: string | null | undefined) => (v ?? "").trim().toUpperCase();

const teamById = new Map<string, Team>();
const leagueByTeamId = new Map<string, League>();
const leaguesByCountry = new Map<string, League[]>();
const countryByFifa = new Map<string, Country>();
const countryByIso = new Map<string, Country>();

for (const league of LEAGUES) {
  const key = norm(league.country_fifa_code);
  const list = leaguesByCountry.get(key) ?? [];
  list.push(league);
  leaguesByCountry.set(key, list);
  for (const team of league.teams) {
    teamById.set(team.id, team);
    leagueByTeamId.set(team.id, league);
  }
}

for (const country of COUNTRIES) {
  const fifa = norm(country.fifa_code);
  const iso = norm(country.iso_alpha2);
  if (fifa) countryByFifa.set(fifa, country);
  if (iso) countryByIso.set(iso, country);
}

export const ALL_TEAMS: Team[] = [...teamById.values()];

export function getTeam(id: string): Team | null {
  return teamById.get(id) ?? null;
}

export function getLeagueOfTeam(teamId: string): League | null {
  return leagueByTeamId.get(teamId) ?? null;
}

export function getLeaguesOfCountry(fifaCode: string): League[] {
  return leaguesByCountry.get(norm(fifaCode)) ?? [];
}

/** League of a country at a given tier (1 = top flight, 2 = second division). */
export function getLeagueByTier(fifaCode: string, tier: number): League | null {
  return getLeaguesOfCountry(fifaCode).find((l) => l.tier === tier) ?? null;
}

/**
 * The league a team is actually competing in *right now*, honouring
 * promotion/relegation — not just the tier it's statically listed at in the
 * dataset (every team is only ever listed once, at its default tier). Falls
 * back to the team's home league if the requested tier doesn't exist for
 * that country.
 */
export function getLeagueOfTeamAtTier(teamId: string, tier: number): League | null {
  const home = getLeagueOfTeam(teamId);
  if (!home) return null;
  return getLeagueByTier(home.country_fifa_code, tier) ?? home;
}

export function getCountryByFifa(fifaCode: string): Country | null {
  return countryByFifa.get(norm(fifaCode)) ?? null;
}

export function getCountryByIso(iso: string): Country | null {
  return countryByIso.get(norm(iso)) ?? null;
}

export function getConfederationTrophies(confederation: string) {
  return CONFEDERATION_TROPHIES[norm(confederation) as Confederation] ?? null;
}

export function getDomesticCup(cupId: string | undefined) {
  if (!cupId) return null;
  return DOMESTIC_CUPS[cupId] ?? null;
}

export function hasDomesticCup(cupId: string | undefined): boolean {
  return Boolean(cupId && DOMESTIC_CUPS[cupId]);
}

/** Countries that actually have playable leagues in the dataset. */
export const PLAYABLE_COUNTRY_CODES = new Set(
  LEAGUES.map((l) => norm(l.country_fifa_code)),
);
