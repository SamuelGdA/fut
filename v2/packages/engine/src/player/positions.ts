import type { Six } from "../types";

/**
 * As 12 posições e o que cada uma pesa na nota (GDD 9.1, 9.3 e 9.4).
 *
 * Ordem das colunas em todas as tabelas: linha RIT FIN PAS DRI DEF FIS;
 * goleiro ELA MAN REP REF VEL POS.
 */

export const POSITIONS = ["gk", "cb", "lb", "rb", "cdm", "cm", "cam", "lm", "rm", "lw", "rw", "st"] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_GROUPS = [
  "attacker",
  "attackingMid",
  "midfield",
  "fullback",
  "centreBack",
  "goalkeeper",
] as const;
export type PositionGroup = (typeof POSITION_GROUPS)[number];

export const GROUP_OF: Readonly<Record<Position, PositionGroup>> = {
  st: "attacker",
  lw: "attacker",
  rw: "attacker",
  cam: "attackingMid",
  lm: "attackingMid",
  rm: "attackingMid",
  cm: "midfield",
  cdm: "midfield",
  lb: "fullback",
  rb: "fullback",
  cb: "centreBack",
  gk: "goalkeeper",
};

export function isGoalkeeper(position: Position): boolean {
  return position === "gk";
}

/** Defensores para fins de exibição: jogos sem sofrer gol aparecem (GDD 9.1). */
export function isDefender(position: Position): boolean {
  return position === "cb" || position === "lb" || position === "rb" || position === "cdm";
}

interface PositionTable {
  /** Peso de cada atributo no OVR. Soma exatamente 100. */
  readonly weights: Six;
  /** Soma ao OVR depois da média ponderada. */
  readonly bonus: number;
  /** O desenho típico da posição, antes da normalização. */
  readonly mold: Six;
}

const TABLE: Readonly<Record<Position, PositionTable>> = {
  st: { weights: [10, 42, 8, 20, 0, 20], bonus: 2, mold: [3, 6, -6, 1, -28, 1] },
  lw: { weights: [22, 22, 16, 32, 0, 8], bonus: 2, mold: [7, 0, -3, 5, -30, -8] },
  rw: { weights: [22, 22, 16, 32, 0, 8], bonus: 2, mold: [7, 0, -3, 5, -30, -8] },
  cam: { weights: [8, 20, 34, 30, 0, 8], bonus: 3, mold: [-2, 1, 5, 4, -26, -9] },
  lm: { weights: [20, 16, 26, 30, 2, 6], bonus: 2, mold: [5, -3, 2, 3, -18, -8] },
  rm: { weights: [20, 16, 26, 30, 2, 6], bonus: 2, mold: [5, -3, 2, 3, -18, -8] },
  cm: { weights: [6, 10, 34, 26, 12, 12], bonus: 4, mold: [-4, -6, 5, 2, -4, -1] },
  cdm: { weights: [6, 4, 24, 12, 34, 20], bonus: 4, mold: [-6, -14, 2, -5, 5, 3] },
  lb: { weights: [22, 4, 18, 14, 28, 14], bonus: 3, mold: [5, -18, -2, -3, 2, -1] },
  rb: { weights: [22, 4, 18, 14, 28, 14], bonus: 3, mold: [5, -18, -2, -3, 2, -1] },
  cb: { weights: [8, 0, 10, 4, 50, 28], bonus: 3, mold: [-7, -26, -8, -14, 6, 4] },
  gk: { weights: [24, 20, 8, 28, 4, 16], bonus: 1, mold: [2, 0, -6, 3, -14, 1] },
};

export function positionWeights(position: Position): Six {
  return TABLE[position].weights;
}

export function positionBonus(position: Position): number {
  return TABLE[position].bonus;
}

/**
 * O molde já normalizado: somado a L, com idade e treino zerados, dá um OVR
 * igual a L. A constante desloca os seis números por igual, e como os pesos
 * somam 100, desloca o OVR exatamente nela.
 */
export function normalizedMold(position: Position): Six {
  const { weights, bonus, mold } = TABLE[position];
  let weighted = 0;
  for (let slot = 0; slot < 6; slot += 1) weighted += (weights[slot] ?? 0) * (mold[slot] ?? 0);
  const shift = -(weighted / 100 + bonus);
  return [
    mold[0] + shift,
    mold[1] + shift,
    mold[2] + shift,
    mold[3] + shift,
    mold[4] + shift,
    mold[5] + shift,
  ];
}

/** Idade de pico média de cada grupo (GDD 9.7). */
export const PEAK_AGE_BASE: Readonly<Record<PositionGroup, number>> = {
  attacker: 26.5,
  attackingMid: 26.5,
  midfield: 27.5,
  fullback: 27,
  centreBack: 28.5,
  goalkeeper: 30,
};

/** Anos a mais antes do declínio (GDD 10.3). */
export const DECLINE_GRACE: Readonly<Record<PositionGroup, number>> = {
  attacker: 0,
  attackingMid: 0,
  midfield: 0,
  fullback: 0,
  centreBack: 1,
  goalkeeper: 2,
};

/**
 * Longevidade (D42): chance de nascer com um corpo que envelhece devagar e
 * quantos anos a mais ele segura antes do declínio. Zagueiro e goleiro já
 * envelhecem tarde pela posição (pico mais tarde e `DECLINE_GRACE`); para os
 * outros, é a exceção rara de quem joga em alto nível perto dos 40.
 */
export const LONGEVITY: Readonly<Record<PositionGroup, { readonly chance: number; readonly years: number }>> = {
  attacker: { chance: 0.07, years: 3 },
  attackingMid: { chance: 0.07, years: 3 },
  midfield: { chance: 0.07, years: 3 },
  fullback: { chance: 0.07, years: 3 },
  centreBack: { chance: 0, years: 0 },
  goalkeeper: { chance: 0, years: 0 },
};
