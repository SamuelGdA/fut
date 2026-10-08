import argClubs from "../data/clubs/arg.json";
import bolClubs from "../data/clubs/bol.json";
import braClubs from "../data/clubs/bra.json";
import chiClubs from "../data/clubs/chi.json";
import colClubs from "../data/clubs/col.json";
import ecuClubs from "../data/clubs/ecu.json";
import engClubs from "../data/clubs/eng.json";
import espClubs from "../data/clubs/esp.json";
import fraClubs from "../data/clubs/fra.json";
import gerClubs from "../data/clubs/ger.json";
import itaClubs from "../data/clubs/ita.json";
import mexClubs from "../data/clubs/mex.json";
import parClubs from "../data/clubs/par.json";
import perClubs from "../data/clubs/per.json";
import uruClubs from "../data/clubs/uru.json";
import usaClubs from "../data/clubs/usa.json";
import venClubs from "../data/clubs/ven.json";
import countriesJson from "../data/countries.json";
import kitsJson from "../data/kits.json";
import leaguesJson from "../data/leagues.json";
import rivalriesJson from "../data/rivalries.json";
import {
  CONFEDERATIONS,
  type Club,
  type Confederation,
  type Country,
  type CountryCode,
  type Division,
  type Kit,
  type KitPattern,
  type League,
} from "./types";

const KIT_PATTERNS: readonly KitPattern[] = [
  "solid",
  "vertical_stripes",
  "horizontal_stripes",
  "diagonal_sash",
  "checkerboard",
];

function fail(message: string): never {
  throw new Error(`@craque/world: ${message}`);
}

function division(value: number, where: string): Division {
  if (value === 1 || value === 2) return value;
  return fail(`divisão inválida em ${where}: ${value}`);
}

function confederation(value: string, where: string): Confederation {
  const match = CONFEDERATIONS.find((item) => item === value);
  return match ?? fail(`confederação inválida em ${where}: ${value}`);
}

function pattern(value: string, where: string): KitPattern {
  const match = KIT_PATTERNS.find((item) => item === value);
  return match ?? fail(`padrão de kit inválido em ${where}: ${value}`);
}

// ------------------------------------------------------------------ países

export const COUNTRIES: readonly Country[] = countriesJson.map((row) => ({
  ...row,
  confederation: confederation(row.confederation, row.code),
  kit: { ...row.kit, pattern: pattern(row.kit.pattern, row.code) },
}));

const countryByCode = new Map(COUNTRIES.map((country) => [country.code, country]));

export function getCountry(code: CountryCode | null | undefined): Country | null {
  if (!code) return null;
  return countryByCode.get(code) ?? null;
}

// ------------------------------------------------------------------- ligas

export const LEAGUES: readonly League[] = leaguesJson.map((row) => ({
  ...row,
  division: division(row.division, row.id),
}));

const leagueById = new Map(LEAGUES.map((league) => [league.id, league]));

export function getLeague(id: string | null | undefined): League | null {
  if (!id) return null;
  return leagueById.get(id) ?? null;
}

/** A liga de um país numa divisão, ou null quando o país não tem essa divisão. */
export function leagueAt(country: CountryCode, tier: Division): League | null {
  return LEAGUES.find((league) => league.country === country && league.division === tier) ?? null;
}

export function leaguesOf(country: CountryCode): readonly League[] {
  return LEAGUES.filter((league) => league.country === country);
}

// ------------------------------------------------------------------ clubes

/** Uma linha de clube como está no arquivo de dados. */
interface RawClub {
  id: string;
  name: string;
  short: string;
  abbr: string;
  division: number;
  strength: number;
  prestige: number;
  color: string;
  crest: string | null;
}

const CLUB_FILES: ReadonlyArray<readonly [CountryCode, readonly RawClub[]]> = [
  ["ARG", argClubs],
  ["BOL", bolClubs],
  ["BRA", braClubs],
  ["CHI", chiClubs],
  ["COL", colClubs],
  ["ECU", ecuClubs],
  ["ENG", engClubs],
  ["ESP", espClubs],
  ["FRA", fraClubs],
  ["GER", gerClubs],
  ["ITA", itaClubs],
  ["MEX", mexClubs],
  ["PAR", parClubs],
  ["PER", perClubs],
  ["URU", uruClubs],
  ["USA", usaClubs],
  ["VEN", venClubs],
];

/**
 * Todos os clubes, ordenados por id. A ordem é estável e não carrega sentido:
 * o motor nunca pode depender da ordem dos arquivos de dados.
 */
export const CLUBS: readonly Club[] = CLUB_FILES.flatMap(([country, rows]) =>
  rows.map((row) => ({ ...row, country, division: division(row.division, row.id) })),
).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

const clubById = new Map(CLUBS.map((club) => [club.id, club]));

export function getClub(id: string | null | undefined): Club | null {
  if (!id) return null;
  return clubById.get(id) ?? null;
}

/** Clubes de um país, opcionalmente só de uma divisão inicial. */
export function clubsOf(country: CountryCode, tier?: Division): readonly Club[] {
  return CLUBS.filter((club) => club.country === country && (tier === undefined || club.division === tier));
}

/** Países com liga jogável, em ordem de código. */
export const PLAYABLE_COUNTRIES: readonly CountryCode[] = [...new Set(LEAGUES.map((league) => league.country))].sort();

// -------------------------------------------------------------------- kits

/** Camisa cinza para quando ainda não existe clube (criação, demonstração). */
export const NEUTRAL_KIT: Kit = { base: "#4b5563", accent: "#4b5563", pattern: "solid" };

/** Kits pesquisados à mão, por id de clube (portados do v1). */
export const CLUB_KITS: Readonly<Record<string, Kit>> = Object.fromEntries(
  Object.entries(kitsJson).map(([id, kit]) => [id, { ...kit, pattern: pattern(kit.pattern, id) }]),
);

/** Escolha de contraste claro ou escuro quando o clube não tem kit curado. */
function contrastAccent(hex: string): string {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) || 0;
  const g = Number.parseInt(value.slice(2, 4), 16) || 0;
  const b = Number.parseInt(value.slice(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#f5f5f5";
}

/** A camisa de um clube: curada, ou lisa na cor primária, ou neutra. */
export function getClubKit(clubId: string | null | undefined): Kit {
  if (!clubId) return NEUTRAL_KIT;
  const curated = CLUB_KITS[clubId];
  if (curated) return curated;
  const club = getClub(clubId);
  if (!club?.color) return NEUTRAL_KIT;
  return { base: club.color, accent: contrastAccent(club.color), pattern: "solid" };
}

/** A camisa da seleção de um país. */
export function getCountryKit(code: CountryCode | null | undefined): Kit {
  const country = getCountry(code);
  if (!country?.kit.base) return NEUTRAL_KIT;
  return {
    base: country.kit.base,
    accent: country.kit.accent || contrastAccent(country.kit.base),
    pattern: country.kit.pattern,
  };
}

// ------------------------------------------------------------- rivalidades

/** Clássicos reais, usados só para marcar a tarja de Traidor (GDD 7.6). */
export const RIVALRIES: ReadonlyArray<readonly [string, string]> = rivalriesJson.map(([a, b]) => {
  if (!a || !b) return fail("rivalidade incompleta");
  return [a, b] as const;
});

const rivalKeys = new Set(RIVALRIES.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));

export function areRivals(a: string, b: string): boolean {
  return a !== b && rivalKeys.has(`${a}|${b}`);
}

// -------------------------------------------------------------- resumo

export const WORLD_SIZE = {
  countries: COUNTRIES.length,
  playableCountries: PLAYABLE_COUNTRIES.length,
  leagues: LEAGUES.length,
  clubs: CLUBS.length,
} as const;
