import {
  type Club,
  CLUBS,
  type Confederation,
  COUNTRIES,
  type Country,
  type CountryCode,
  type Division,
  getCountry,
  type League,
  leagueAt,
  PLAYABLE_COUNTRIES,
} from "@craque/world";
import type { KnockoutFormat, Stage } from "./types";

/**
 * Índices do mundo, montados uma vez. A simulação trabalha com o índice de
 * cada clube na lista `CLUBS` (ordenada por id), o que deixa o estado em
 * listas simples e a temporada rápida.
 */

export const CLUB_COUNT = CLUBS.length;

const indexById = new Map(CLUBS.map((club, index) => [club.id, index]));

export function clubIndex(id: string): number {
  const index = indexById.get(id);
  if (index === undefined) throw new Error(`motor: clube desconhecido ${id}`);
  return index;
}

export function hasClub(id: string): boolean {
  return indexById.has(id);
}

export function clubAt(index: number): Club {
  const club = CLUBS[index];
  if (!club) throw new Error(`motor: índice de clube fora da lista ${index}`);
  return club;
}

export const BASE_STRENGTH: readonly number[] = CLUBS.map((club) => club.strength);
export const BASE_DIVISION: readonly Division[] = CLUBS.map((club) => club.division);

function confederationOf(country: CountryCode): Confederation {
  const found = getCountry(country);
  if (!found) throw new Error(`motor: país desconhecido ${country}`);
  return found.confederation;
}

export const CLUB_CONFEDERATION: readonly Confederation[] = CLUBS.map((club) => confederationOf(club.country));

export function clubConfederation(id: string): Confederation {
  return CLUB_CONFEDERATION[clubIndex(id)] ?? "UEFA";
}

/** Clubes de cada país com liga jogável, por índice. */
export const COUNTRY_CLUBS: ReadonlyMap<CountryCode, readonly number[]> = new Map(
  PLAYABLE_COUNTRIES.map((country) => [
    country,
    CLUBS.flatMap((club, index) => (club.country === country ? [index] : [])),
  ]),
);

export const CONFEDERATION_CLUBS: ReadonlyMap<Confederation, readonly number[]> = (() => {
  const groups = new Map<Confederation, number[]>();
  CLUB_CONFEDERATION.forEach((confederation, index) => {
    const list = groups.get(confederation);
    if (list) list.push(index);
    else groups.set(confederation, [index]);
  });
  return groups;
})();

/** As ligas de um país, da primeira para a segunda divisão. */
export function countryLeagues(country: CountryCode): readonly League[] {
  const first = leagueAt(country, 1);
  const second = leagueAt(country, 2);
  return [first, second].filter((league): league is League => league !== null);
}

/** Seleções por confederação, na ordem dos dados. */
export const NATIONS_BY_CONFEDERATION: ReadonlyMap<Confederation, readonly Country[]> = (() => {
  const groups = new Map<Confederation, Country[]>();
  for (const country of COUNTRIES) {
    const list = groups.get(country.confederation);
    if (list) list.push(country);
    else groups.set(country.confederation, [country]);
  }
  return groups;
})();

export const KNOCKOUT: KnockoutFormat = { kind: "knockout", groupSlots: 0 };

export function groupsFormat(groupSlots: number): KnockoutFormat {
  return { kind: "groups", groupSlots };
}

export const WORLD_CUP_FORMAT: KnockoutFormat = { kind: "groups32", groupSlots: 48 };

/**
 * A fase alcançada por quem terminou em `position` (0 é o campeão). A ordem
 * final de um torneio é a ordem das notas, e a fase sai dela (GDD 8.5).
 */
export function stageAt(position: number, format: KnockoutFormat): Stage {
  const rank = position + 1;
  if (rank === 1) return "champion";
  if (rank === 2) return "final";
  if (rank <= 4) return "semi";
  if (rank <= 8) return "quarter";
  if (rank <= 16) return "roundOf16";
  if (format.kind === "knockout") return rank <= 32 ? "roundOf32" : "early";
  if (format.kind === "groups32") return rank <= 32 ? "roundOf32" : "groups";
  return rank <= format.groupSlots ? "groups" : "early";
}
