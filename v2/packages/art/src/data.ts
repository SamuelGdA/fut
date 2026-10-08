/**
 * Ponte entre a arte portada do v1 e o mundo do v2.
 *
 * Os arquivos de desenho foram portados sem alteração de lógica (D1, GDD 31.2):
 * a única linha que mudou em cada um é o import, que antes apontava para o
 * pacote de dados do v1 e agora aponta para cá. Este arquivo devolve
 * exatamente os campos e formatos que aquele código lê, tirados de
 * `@craque/world`. O teste `port.test.ts` prova que a saída continua idêntica.
 */

import {
  getClub,
  getClubKit,
  getCountry,
  getCountryKit,
  NEUTRAL_KIT as WORLD_NEUTRAL_KIT,
  type Kit,
  type KitPattern as WorldKitPattern,
  type League as WorldLeague,
} from "@craque/world";

export type KitPattern = WorldKitPattern;

export type KitDef = Kit;

export const NEUTRAL_KIT: KitDef = WORLD_NEUTRAL_KIT;

/** O que o desenho de escudo lê de um clube. */
export interface Team {
  id: string;
  primary_color: string;
}

export function getTeam(teamId: string): Team | null {
  const club = getClub(teamId);
  return club ? { id: club.id, primary_color: club.color } : null;
}

export function getKitForTeam(teamId: string | null | undefined): KitDef {
  return getClubKit(teamId);
}

/** O que o selo de liga lê de um país. */
export interface Country {
  fifa_code: string;
  kit_primary_color: string;
  kit_secondary_color: string;
  kit_tertiary_color?: string;
  kit_type?: KitPattern;
}

export function getCountryByFifa(code: string): Country | null {
  const country = getCountry(code);
  if (!country) return null;
  return {
    fifa_code: country.code,
    kit_primary_color: country.kit.base,
    kit_secondary_color: country.kit.accent,
    kit_tertiary_color: country.kit.third,
    kit_type: country.kit.pattern === "solid" ? undefined : country.kit.pattern,
  };
}

export function getKitForCountry(country: Country | null | undefined): KitDef {
  return country ? getCountryKit(country.fifa_code) : NEUTRAL_KIT;
}

/** O que o selo de liga lê de uma liga. */
export interface League {
  id: string;
  name: string;
  country_fifa_code: string;
  tier: number;
  logo_url: string;
}

/**
 * Converte uma liga do mundo para a forma que o selo lê. `logoUrl` vazio faz
 * o selo gerado entrar no lugar da arte real.
 */
export function toArtLeague(league: WorldLeague, logoUrl = ""): League {
  return {
    id: league.id,
    name: league.name,
    country_fifa_code: league.country,
    tier: league.division,
    logo_url: logoUrl,
  };
}
