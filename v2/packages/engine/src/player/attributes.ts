import { piecewise } from "../math";
import type { Six } from "../types";
import { isGoalkeeper, type Position } from "./positions";

/**
 * Os seis atributos da carta (GDD 9.2) e como a idade muda o perfil (GDD 9.5).
 *
 * A mesma posição no vetor tem sentido parecido nas duas linhas: a primeira é
 * a explosão de campo (Ritmo) ou de gol (Elasticidade), e assim por diante.
 */

export const OUTFIELD_ATTRIBUTES = ["pace", "shooting", "passing", "dribbling", "defending", "physical"] as const;
export const KEEPER_ATTRIBUTES = ["diving", "handling", "kicking", "reflexes", "speed", "positioning"] as const;

export type OutfieldAttribute = (typeof OUTFIELD_ATTRIBUTES)[number];
export type KeeperAttribute = (typeof KEEPER_ATTRIBUTES)[number];
export type AttributeKey = OutfieldAttribute | KeeperAttribute;

export function attributeKeys(position: Position): Six<AttributeKey> {
  return isGoalkeeper(position) ? KEEPER_ATTRIBUTES : OUTFIELD_ATTRIBUTES;
}

/** Atributos com valores 1 a 99, nomeados, para quem exibe a carta. */
export function namedAttributes(position: Position, values: Six): Readonly<Partial<Record<AttributeKey, number>>> {
  const keys = attributeKeys(position);
  const named: Partial<Record<AttributeKey, number>> = {};
  keys.forEach((key, slot) => {
    named[key] = values[slot];
  });
  return named;
}

/**
 * Classes de envelhecimento. A explosão vai primeiro e a leitura de jogo vai
 * por último: é por isso que um veterano ainda parece útil na carta enquanto
 * já perde minutos.
 */
export type AgeClass = "explosive" | "physical" | "technical" | "reading";

const OUTFIELD_CLASSES: Six<AgeClass> = ["explosive", "technical", "reading", "technical", "reading", "physical"];
const KEEPER_CLASSES: Six<AgeClass> = ["physical", "reading", "reading", "technical", "explosive", "reading"];

export function ageClasses(position: Position): Six<AgeClass> {
  return isGoalkeeper(position) ? KEEPER_CLASSES : OUTFIELD_CLASSES;
}

/**
 * Curvas contínuas por idade: pontos `[idade, deslocamento]` e a inclinação
 * depois do último ponto. Contínuas de propósito: um degrau aos 21 anos faria
 * o Ritmo cair 2 pontos numa virada de temporada sem motivo nenhum.
 */
const AGE_CURVES: Readonly<Record<AgeClass, { knots: ReadonlyArray<readonly [number, number]>; tail: number }>> = {
  explosive: {
    knots: [
      [16, 1],
      [18, 2],
      [25, 2],
      [29, 0],
    ],
    tail: -1.5,
  },
  physical: {
    knots: [
      [16, -3],
      [20, 1],
      [31, 1],
    ],
    tail: -1.2,
  },
  technical: {
    knots: [
      [16, 0],
      [31, 0],
    ],
    tail: -0.8,
  },
  reading: {
    knots: [
      [16, -3],
      [30, 2],
      [34, 2],
    ],
    tail: -0.5,
  },
};

export function ageOffset(ageClass: AgeClass, age: number): number {
  const curve = AGE_CURVES[ageClass];
  return piecewise(curve.knots, age, curve.tail);
}

/** O deslocamento de idade dos seis atributos de uma posição. */
export function ageProfile(position: Position, age: number): Six {
  const classes = ageClasses(position);
  return [
    ageOffset(classes[0], age),
    ageOffset(classes[1], age),
    ageOffset(classes[2], age),
    ageOffset(classes[3], age),
    ageOffset(classes[4], age),
    ageOffset(classes[5], age),
  ];
}

/**
 * Idade de referência do perfil: aos 28, no auge, o desenho da idade não soma
 * nem tira do OVR em nenhuma posição. Sem isso, zagueiros e volantes (que
 * pesam muito a leitura de jogo) teriam um OVR de pico mais alto que pontas
 * com a mesma capacidade.
 */
export const REFERENCE_AGE = 28;

export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 99;

/** Bônus permanente máximo de treino e eventos por atributo (GDD 9.4). */
export const TRAINING_CAP = 8;
