import { roundSignificant } from "../math";
import type { Rng } from "../rng";

/**
 * Valor de mercado (GDD 9.10), em euros. Cresce de forma exponencial com o
 * OVR e cai com a idade; a última parcela é o humor do mercado no ano.
 */

const BASE_VALUE = 110_000;
const GROWTH_PER_POINT = 0.185;
export const MAX_MARKET_VALUE = 300_000_000;

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

/** Referência histórica do mercado do Técnico, cujo modelo financeiro é independente. */
export function referenceMarketValue(ovr: number, age: number): number {
  return BASE_VALUE * Math.exp(GROWTH_PER_POINT * (ovr - 50)) * ageValueFactor(age);
}

/** D68: valorização mais suave acima de OVR 80 e teto de €300 milhões no Craque. */
export function baseMarketValue(ovr: number, age: number): number {
  const level = Math.max(1, Math.min(99, ovr));
  const exponent = GROWTH_PER_POINT * (Math.min(level, 80) - 50) + 0.12 * Math.max(0, level - 80);
  return Math.min(MAX_MARKET_VALUE, BASE_VALUE * Math.exp(exponent) * ageValueFactor(age));
}

/** Valor com o humor do ano, em três algarismos significativos. */
export function marketValue(rng: Rng, ovr: number, age: number): number {
  return Math.min(MAX_MARKET_VALUE, roundSignificant(baseMarketValue(ovr, age) * rng.real(0.94, 1.06), 3));
}
