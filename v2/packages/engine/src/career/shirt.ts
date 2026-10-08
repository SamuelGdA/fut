import type { Position } from "../player/positions";
import type { Rng } from "../rng";
import type { SquadRole } from "../season/role";

/**
 * Número da camisa (GDD 19). Titular e craque do time vestem um número
 * clássico da posição; rotação, de 12 a 23; reserva e quem ainda é promessa,
 * de 12 a 99. O número dos sonhos passa na frente de tudo isso quando combina
 * com a posição; quando não combina (a 10 de um goleiro, a 9 de um zagueiro),
 * só vem com menos de 1% de chance, e só para o craque do time (D42).
 *
 * O número só muda em dois momentos: na transferência (a oferta já diz qual
 * será) e na opção de ficar no clube, quando o clube oferece outro.
 */

/** Números clássicos por posição, o mais típico primeiro (GDD 19.2). */
export const PRESTIGE_NUMBERS: Readonly<Record<Position, readonly number[]>> = {
  gk: [1],
  cb: [4, 3, 5],
  lb: [6, 3],
  rb: [2],
  cdm: [5, 8, 6],
  cm: [8, 6, 10],
  cam: [10, 8],
  lm: [11, 7, 10],
  rm: [7, 11, 10],
  lw: [11, 7, 10],
  rw: [7, 11, 10],
  st: [9, 11, 10],
};

/**
 * Números baixos (1 a 11) que ainda combinam com cada posição, além dos
 * clássicos. Do 12 para cima, qualquer número serve para qualquer um.
 */
const FITTING_NUMBERS: Readonly<Record<Position, readonly number[]>> = {
  gk: [1],
  cb: [2, 3, 4, 5, 6],
  lb: [2, 3, 6],
  rb: [2, 3, 4],
  cdm: [4, 5, 6, 8],
  cm: [5, 6, 8, 10],
  cam: [7, 8, 10, 11],
  lm: [7, 8, 10, 11],
  rm: [7, 8, 10, 11],
  lw: [7, 9, 10, 11],
  rw: [7, 9, 10, 11],
  st: [7, 9, 10, 11],
};

/** Chance do número dos sonhos que não combina com a posição: só para o craque do time. */
export const ODD_DREAM_CHANCE = 0.008;

const BENCH: readonly SquadRole[] = ["reserve", "surplus", "third"];
const FIRST_TEAM: readonly SquadRole[] = ["star", "starter"];

/** Faixas dos números altos: rotação usa a numeração do elenco, banco usa qualquer uma. */
export const SHIRT_RANGES = {
  rotation: { min: 12, max: 23 },
  bench: { min: 12, max: 99 },
} as const;

/** Chance do número mais típico da posição entre os clássicos. */
const TYPICAL_CHANCE = 0.6;

/** Chance de o clube dar um número clássico a quem virou titular com número alto. */
export const SHIRT_PROMOTION_CHANCE = 0.5;

export function isFirstTeam(role: SquadRole): boolean {
  return FIRST_TEAM.includes(role);
}

/** O número dos sonhos combina com a posição? Do 12 para cima, sempre. */
export function dreamFits(dream: number, position: Position): boolean {
  return dream >= 12 || FITTING_NUMBERS[position].includes(dream) || PRESTIGE_NUMBERS[position].includes(dream);
}

/** Um número clássico da posição: o mais típico com 60%, os outros dividem o resto. */
export function classicNumber(rng: Rng, position: Position, exclude: number | null = null): number {
  const options = PRESTIGE_NUMBERS[position].filter((number) => number !== exclude);
  const roll = rng.next();
  const [typical, ...others] = options;
  if (typical === undefined) return PRESTIGE_NUMBERS[position][0] ?? 1;
  if (others.length === 0 || roll < TYPICAL_CHANCE) return typical;
  const index = Math.min(others.length - 1, Math.floor(((roll - TYPICAL_CHANCE) / (1 - TYPICAL_CHANCE)) * others.length));
  return others[index] ?? typical;
}

/** O número que o clube dá, pelo papel com que ele chega. */
export function clubNumber(rng: Rng, role: SquadRole, position: Position): number {
  if (isFirstTeam(role)) return classicNumber(rng, position);
  const range = role === "rotation" ? SHIRT_RANGES.rotation : SHIRT_RANGES.bench;
  return rng.int(range.min, range.max);
}

/** Chance do número dos sonhos que não combina com a posição. */
function oddDreamChance(role: SquadRole): number {
  return role === "star" ? ODD_DREAM_CHANCE : 0;
}

/**
 * Primeiro contrato (GDD 19.1): o número dos sonhos com 85% de chance (60% se
 * for de 1 a 11 e ele chegar como reserva ou abaixo). Sem ele, o do papel.
 */
export function firstContractNumber(rng: Rng, dream: number | null, role: SquadRole, position: Position): number {
  const roll = rng.next();
  const fallback = clubNumber(rng, role, position);
  if (dream === null) return fallback;
  const chance = !dreamFits(dream, position) ? oddDreamChance(role) : dream <= 11 && BENCH.includes(role) ? 0.6 : 0.85;
  return roll < chance ? dream : fallback;
}

/** Clube novo: 60% de chance do número dos sonhos para quem chega como titular ou acima. */
export function newClubNumber(rng: Rng, dream: number | null, role: SquadRole, position: Position): number {
  const roll = rng.next();
  const fallback = clubNumber(rng, role, position);
  if (dream === null) return fallback;
  const chance = !dreamFits(dream, position) ? oddDreamChance(role) : isFirstTeam(role) ? 0.6 : 0;
  return roll < chance ? dream : fallback;
}

/**
 * Promoção da camisa: quem ganhou a posição no clube vestindo um número alto
 * (e não o dos sonhos) pode receber um número clássico. Aparece na opção de
 * ficar da janela, antes da escolha. Devolve o número novo, ou `null` se fica
 * tudo como está.
 */
export function promotedNumber(
  rng: Rng,
  input: { readonly current: number; readonly dream: number | null; readonly lastRole: SquadRole | null; readonly position: Position },
): number | null {
  const roll = rng.next();
  if (input.current < 12 || input.current === input.dream) return null;
  if (input.lastRole === null || !isFirstTeam(input.lastRole)) return null;
  if (roll >= SHIRT_PROMOTION_CHANCE) return null;
  return classicNumber(rng, input.position, input.current);
}

/** Números de prestígio livres no clube: cada um está livre com 50% de chance. */
export function freePrestigeNumbers(rng: Rng, position: Position, current: number): number[] {
  return PRESTIGE_NUMBERS[position].filter((number) => number !== current && rng.chance(0.5)).slice(0, 3);
}

/** Na homenagem: até 5 números clássicos da posição, mais o dos sonhos. */
export function homageNumbers(position: Position, dream: number | null, current: number): number[] {
  const pool = [...PRESTIGE_NUMBERS[position], ...(dream !== null ? [dream] : []), 10];
  return [...new Set(pool)].filter((number) => number !== current).slice(0, 5);
}
