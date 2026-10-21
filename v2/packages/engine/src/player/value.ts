import { roundSignificant } from "../math";
import type { Rng } from "../rng";
import { getClub } from "@craque/world";
import { clubIndex, COUNTRY_CLUBS } from "../world/model";
import type { WorldState } from "../world/types";

/**
 * Valor de mercado (GDD 9.10), em euros. Cresce de forma exponencial com o
 * OVR e cai com a idade; a última parcela é o humor do mercado no ano.
 */

const BASE_VALUE = 110_000;
const GROWTH_PER_POINT = 0.185;
export const MAX_MARKET_VALUE = 400_000_000;

export function ageValueFactor(age: number): number {
  if (age <= 21) return 1.35;
  if (age <= 24) return 1.2;
  if (age <= 27) return 1;
  if (age <= 29) return 0.85;
  if (age === 30) return 0.7;
  if (age === 31) return 0.55;
  if (age === 32) return 0.42;
  if (age === 33) return 0.32;
  return 0.22;
}

/** Teto etário comum aos dois modos; €400M só até 21 anos. */
export function marketValueCeiling(age: number): number {
  return Math.floor(MAX_MARKET_VALUE * ageValueFactor(age) / 1.35 / 500_000) * 500_000;
}

/** Referência histórica dos salários do Técnico, sem aplicar teto de transferência. */
export function referenceMarketValue(ovr: number, age: number): number {
  return BASE_VALUE * Math.exp(GROWTH_PER_POINT * (ovr - 50)) * ageValueFactor(age);
}

/** Valorização mais suave acima de OVR 80 e teto etário de até €400 milhões. */
export function leagueMarketFactor(strength = 82): number {
  return 0.55 + 0.55 * Math.max(0, Math.min(1, (strength - 50) / 32));
}

/** Média do elenco de clubes da divisão atual, inclusive após acessos e quedas. */
export function marketLeagueStrength(world: WorldState, club: string | null): number | undefined {
  if (!club) return undefined;
  const country = getClub(club)?.country;
  const division = world.division[clubIndex(club)];
  const indices = (COUNTRY_CLUBS.get(country ?? "") ?? []).filter(index => world.division[index] === division);
  return indices.length ? indices.reduce((sum, index) => sum + (world.strength[index] ?? 50), 0) / indices.length : undefined;
}

export function baseMarketValue(ovr: number, age: number, leagueStrength?: number): number {
  const level = Math.max(1, Math.min(99, ovr));
  const exponent = GROWTH_PER_POINT * (Math.min(level, 80) - 50) + 0.12 * Math.max(0, level - 80);
  return Math.min(marketValueCeiling(age), BASE_VALUE * Math.exp(exponent) * ageValueFactor(age) * (leagueStrength === undefined ? 1 : leagueMarketFactor(leagueStrength)));
}

/** Valor com o humor do ano, em três algarismos significativos. */
export function marketValue(rng: Rng, ovr: number, age: number, leagueStrength?: number): number {
  return Math.min(marketValueCeiling(age), roundSignificant(baseMarketValue(ovr, age, leagueStrength) * rng.real(0.94, 1.06), 3));
}
