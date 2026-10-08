/** Tipos compartilhados por todo o motor. Tudo é somente leitura. */

export const DIFFICULTIES = ["normal", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Temporadas por decisão (GDD 3.1): Intensa 1 (padrão), Normal 2. */
export const PACES = ["intense", "normal"] as const;
export type Pace = (typeof PACES)[number];

export const SEASONS_PER_PERIOD: Readonly<Record<Pace, number>> = {
  intense: 1,
  normal: 2,
};

/**
 * Seis números na ordem das linhas da carta. A posição de cada número tem o
 * mesmo sentido para linha e goleiro (ver `player/attributes.ts`).
 */
export type Six<T = number> = readonly [T, T, T, T, T, T];

export const SLOTS = [0, 1, 2, 3, 4, 5] as const;
export type Slot = (typeof SLOTS)[number];

/** Primeira e última idade jogável (GDD 4). */
export const FIRST_AGE = 16;
export const LAST_AGE = 39;
export const RETIREMENT_AGE = 40;
/** No Desafio do dia, aposentar só vale a partir desta idade (GDD 27.1). */
export const CHALLENGE_RETIRE_AGE = 27;

/** Monta um `Six` a partir de uma função do índice. */
export function sixOf<T>(build: (slot: Slot) => T): Six<T> {
  return [build(0), build(1), build(2), build(3), build(4), build(5)];
}
