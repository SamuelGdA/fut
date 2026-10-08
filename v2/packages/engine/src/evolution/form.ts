import type { Rng } from "../rng";
import { FORM } from "./tuning";

/**
 * A forma da temporada (GDD 10.2): a pitada de sorte da evolução. Uma
 * explosão acelera o crescimento, um tropeço o freia; a maioria das
 * temporadas fica perto do esperado.
 */

export type FormKind = "explosion" | "stumble" | "normal";

export interface SeasonForm {
  readonly kind: FormKind;
  readonly multiplier: number;
}

export function explosionChance(age: number, games: number): number {
  if (games < FORM.explosionMinGames) return 0;
  const band = FORM.explosionByAge.find((entry) => age <= entry.upTo);
  return band?.chance ?? 0;
}

/** Sempre consome exatamente dois sorteios, seja qual for o resultado. */
export function drawSeasonForm(rng: Rng, age: number, games: number): SeasonForm {
  const roll = rng.next();
  const spread = rng.next();
  const explosion = explosionChance(age, games);
  if (roll < explosion) {
    return { kind: "explosion", multiplier: FORM.explosion.min + spread * (FORM.explosion.max - FORM.explosion.min) };
  }
  if (roll < explosion + FORM.stumble.chance) {
    return { kind: "stumble", multiplier: FORM.stumble.min + spread * (FORM.stumble.max - FORM.stumble.min) };
  }
  return { kind: "normal", multiplier: FORM.normal.min + spread * (FORM.normal.max - FORM.normal.min) };
}
