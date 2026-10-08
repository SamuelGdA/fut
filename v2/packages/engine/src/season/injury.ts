import { TRAIT_EFFECTS, type Trait } from "../player/traits";
import type { Rng } from "../rng";
import type { Difficulty } from "../types";

/**
 * Lesão leve (GDD 11.6). Tira uma fatia dos jogos e é descontada antes da
 * produção (invariante 10). Aparece só no jornal e no histórico detalhado,
 * nunca como alerta.
 */

export const INJURY_TYPES = ["muscle", "ankle", "knee", "back", "illness", "groin"] as const;
export type InjuryType = (typeof INJURY_TYPES)[number];

export const INJURY = {
  base: 0.14,
  agePerYear: 0.05,
  ageFrom: 28,
  minGames: 10,
  lostMin: 0.05,
  lostMax: 0.22,
} as const;

const DIFFICULTY_INJURY: Readonly<Record<Difficulty, number>> = { normal: 1, hard: 1.6 };

/** `physical` é o atributo físico da carta (Físico na linha, Elasticidade no gol). */
export function injuryChance(age: number, physical: number, trait: Trait, difficulty: Difficulty): number {
  const aging = 1 + INJURY.agePerYear * Math.max(0, age - INJURY.ageFrom);
  const body = 1.15 - (0.3 * physical) / 99;
  return INJURY.base * aging * body * TRAIT_EFFECTS[trait].injury * DIFFICULTY_INJURY[difficulty];
}

export interface Injury {
  readonly type: InjuryType;
  readonly lostGames: number;
}

/** Sempre consome três sorteios: chance, fatia perdida e tipo. */
export function drawInjury(
  rng: Rng,
  games: number,
  age: number,
  physical: number,
  trait: Trait,
  difficulty: Difficulty,
  /** Multiplica a chance (gestão de carga, jogar no sacrifício). */
  scale = 1,
): Injury | null {
  const roll = rng.next();
  const share = INJURY.lostMin + rng.next() * (INJURY.lostMax - INJURY.lostMin);
  const type = INJURY_TYPES[Math.floor(rng.next() * INJURY_TYPES.length)] ?? "muscle";
  if (games < INJURY.minGames || roll >= injuryChance(age, physical, trait, difficulty) * scale) return null;
  return { type, lostGames: Math.max(1, Math.round(games * share)) };
}
