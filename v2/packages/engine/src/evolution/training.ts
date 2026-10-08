import { TRAINING_CAP } from "../player/attributes";
import { attributesAt, overallLevel, type Player, trainingLevel } from "../player/player";
import { isGoalkeeper, type Position } from "../player/positions";
import { stream } from "../rng";
import type { Six, Slot } from "../types";
import { TRAINING } from "./tuning";

/**
 * Foco de treino (GDD 10.5 e D42). Cada foco treina **um** atributo da carta,
 * e a escolha diz qual: "+2 Finalização". O bônus entra uma vez, no período
 * que vem depois da escolha, e é permanente (até +8 por atributo somando os
 * focos da carreira). No fim do período, o atributo treinado termina pelo
 * menos 2 pontos acima de onde começou: a temporada pode somar mais por conta
 * própria, e uma temporada ruim pode derrubar os outros atributos, nunca o
 * treinado.
 *
 * O treino conta dentro do potencial. Abaixo do teto, ele acelera: o atributo
 * sobe na hora e o nível total chega antes ao potencial. No teto, ele
 * especializa: o atributo treinado continua subindo e a capacidade natural
 * cede o mesmo tanto no OVR.
 */

export const OUTFIELD_FOCUSES = ["burst", "finishing", "vision", "ballControl", "combat", "power"] as const;
export const KEEPER_FOCUSES = ["diving", "handling", "distribution", "reflexes", "explosion", "command"] as const;
export type TrainingFocus = (typeof OUTFIELD_FOCUSES)[number] | (typeof KEEPER_FOCUSES)[number];

/** O atributo que cada foco treina, pelo índice da carta. */
export const FOCUS_SLOT: Readonly<Record<TrainingFocus, Slot>> = {
  burst: 0,
  finishing: 1,
  vision: 2,
  ballControl: 3,
  combat: 4,
  power: 5,
  diving: 0,
  handling: 1,
  distribution: 2,
  reflexes: 3,
  explosion: 4,
  command: 5,
};

/** Quando a decisão de foco aparece (GDD 14.2, regra 7). */
export const FOCUS_RULE = { minAge: 17, maxAge: 31, every: 4, chance: 0.4 } as const;

/**
 * A decisão de foco cabe nesta idade? Dos 17 aos 31, no mínimo quatro anos
 * depois do último foco, com 40% de chance a cada decisão. O sorteio é da
 * idade: a caixa de areia do harness usa a mesma regra que o jogo.
 */
export function focusDueAt(seed: string, age: number, lastFocusAge: number | null): boolean {
  if (age < FOCUS_RULE.minAge || age > FOCUS_RULE.maxAge) return false;
  if (lastFocusAge !== null && age - lastFocusAge < FOCUS_RULE.every) return false;
  return stream(seed, "events", "focus", age).chance(FOCUS_RULE.chance);
}

export function focusesFor(position: Position): readonly TrainingFocus[] {
  return isGoalkeeper(position) ? KEEPER_FOCUSES : OUTFIELD_FOCUSES;
}

export function isFocusValid(position: Position, focus: TrainingFocus): boolean {
  return focusesFor(position).includes(focus);
}

function withTraining(training: Six, slot: Slot, amount: number): Six {
  const next = [...training] as [number, number, number, number, number, number];
  next[slot] = Math.min(TRAINING_CAP, next[slot] + amount);
  return next;
}

/** O treino de um foco: +2 no atributo dele, limitado a +8. */
export function trainFocus(training: Six, focus: TrainingFocus): Six {
  return withTraining(training, FOCUS_SLOT[focus], TRAINING.focus);
}

/**
 * Grava um treino novo respeitando o potencial. A parte do ganho que passaria
 * de P + 1 no nível total sai da capacidade natural (especialização). Se o
 * nível já estava acima disso, todo o ganho de treino vira especialização.
 */
export function settleTraining(player: Player, training: Six): Player {
  if (training === player.training) return player;
  const before = overallLevel(player);
  const raised = trainingLevel({ position: player.position, training }) - trainingLevel(player);
  const ceiling = Math.max(player.potential + TRAINING.ceilingAllowance, before);
  const excess = Math.max(0, before + raised - ceiling);
  return { ...player, training, capacity: player.capacity - excess };
}

/** Quantas vezes a garantia tenta: a especialização pode comer parte do ajuste. */
const GUARANTEE_PASSES = 6;

/**
 * Garantia visível (GDD 10.5 e D42): ao fim do período, o atributo do foco
 * termina pelo menos `TRAINING.focus` pontos acima de onde começou. Escolher
 * "+2 Finalização" e ver menos que isso se leria como a escolha ter sido
 * ignorada.
 *
 * Se o declínio comeu o treino, o bônus cobre a diferença, sempre dentro do
 * limite de +8 e do 99. Atributo já no 99, ou com o treino no limite, fica
 * como está.
 */
export function guaranteeFocus(player: Player, focus: TrainingFocus, startAttributes: Six, endAge: number): Player {
  const slot = FOCUS_SLOT[focus];
  const goal = Math.min(99, startAttributes[slot] + TRAINING.focus);
  let current = player;
  for (let pass = 0; pass < GUARANTEE_PASSES; pass += 1) {
    const values = attributesAt(current, endAge);
    let training = current.training;
    const missing = goal - values[slot];
    if (missing > 0) training = withTraining(training, slot, missing);
    if (training === current.training) return current;
    const next = settleTraining(current, training);
    if (next.training.every((value, slot) => value === current.training[slot])) return current;
    current = next;
  }
  return current;
}
