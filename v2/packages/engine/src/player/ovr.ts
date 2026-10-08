import { clamp } from "../math";
import type { Six } from "../types";
import { positionBonus, positionWeights, type Position } from "./positions";

/**
 * O OVR sai sempre dos atributos (GDD 9.3, invariante 1): média ponderada
 * pelos pesos da posição, mais o bônus, arredondada e presa entre 1 e 99.
 * Sem o limite, o bônus da posição empurraria uma carta de atributos 99 para
 * 101.
 */
export function ovrOf(position: Position, attributes: Six): number {
  return clamp(Math.round(weightedLevel(position, attributes) + positionBonus(position)), 1, 99);
}

/** Média ponderada pelos pesos da posição, sem bônus nem arredondamento. */
export function weightedLevel(position: Position, values: Six): number {
  const weights = positionWeights(position);
  let total = 0;
  for (let slot = 0; slot < 6; slot += 1) total += (weights[slot] ?? 0) * (values[slot] ?? 0);
  return total / 100;
}
