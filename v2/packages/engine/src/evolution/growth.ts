import { clamp, fallingLogistic, softCeiling } from "../math";
import { overallLevel, type Player } from "../player/player";
import { DECLINE_GRACE, GROUP_OF } from "../player/positions";
import { TRAIT_EFFECTS } from "../player/traits";
import type { Difficulty } from "../types";
import { DECLINE, DIFFICULTY_EFFECTS, GROWTH, MORALE } from "./tuning";

/**
 * Crescimento e declínio da capacidade L (GDD 10.1, 10.3, 10.4).
 *
 * O desenho é orgânico: cada fator é uma razão para crescer, e nenhum deles
 * decide sozinho.
 *
 * - **Idade**: jovens aprendem rápido; o ritmo cai pela metade alguns anos
 *   antes do pico e some depois dele.
 * - **Folga**: quanto mais longe do potencial, mais rápido, mas com
 *   saturação. É a tendência à média do modelo: quem se adiantou chega perto
 *   do teto e desacelera; quem se atrasou ainda tem folga e recupera.
 * - **Minutos e treinador** puxam em sentidos opostos na prática: o clube
 *   grande ensina mais, mas escala menos o garoto.
 * - **Teto suave**: nenhuma temporada, por melhor que seja, dá um salto
 *   irreal. Os ganhos acima do joelho rendem cada vez menos.
 */

export interface GrowthContext {
  readonly age: number;
  readonly games: number;
  readonly clubStrength: number;
  /** Torcida do clube atual, de 0 a 100. */
  readonly fans: number;
  readonly difficulty: Difficulty;
}

export interface GrowthFactors {
  readonly age: number;
  readonly gap: number;
  readonly minutes: number;
  readonly coach: number;
  readonly confidence: number;
  readonly trait: number;
  readonly difficulty: number;
}

/** Ritmo de aprendizado pela idade: perto de 1 aos 16, metade em pico - 3,5. */
export function ageRate(age: number, peakAge: number): number {
  return fallingLogistic(age, peakAge - GROWTH.slowdownBeforePeak, GROWTH.slowdownWidth);
}

/**
 * Quanto a distância até o potencial ainda empurra (0 a 1, com saturação).
 * `level` é o nível total: capacidade natural mais o que o treino já soma.
 */
export function gapDrive(level: number, potential: number): number {
  const gap = Math.max(potential - level, 0) + GROWTH.gapFloor;
  return gap / (gap + GROWTH.gapHalfSpeed);
}

export function minutesFactor(games: number): number {
  return GROWTH.benchFactor + (1 - GROWTH.benchFactor) * Math.min(1, games / GROWTH.fullSeasonGames);
}

export function coachFactor(clubStrength: number): number {
  const level = clamp((clubStrength - GROWTH.coachFloorStrength) / GROWTH.coachSpan, 0, 1);
  return GROWTH.coachMin + (GROWTH.coachMax - GROWTH.coachMin) * level;
}

export function confidenceFactor(fans: number): number {
  return GROWTH.confidenceMin + GROWTH.confidenceSpan * (clamp(fans, 0, 100) / 100);
}

export function growthFactors(player: Player, context: GrowthContext): GrowthFactors {
  return {
    age: ageRate(context.age, player.peakAge),
    gap: gapDrive(overallLevel(player), player.potential),
    minutes: minutesFactor(context.games),
    coach: coachFactor(context.clubStrength),
    confidence: confidenceFactor(context.fans),
    trait: TRAIT_EFFECTS[player.trait].growth,
    difficulty: DIFFICULTY_EFFECTS[context.difficulty].growth,
  };
}

/** O ganho esperado de L, antes da forma da temporada e do teto suave. */
export function expectedGrowth(factors: GrowthFactors): number {
  return (
    GROWTH.base *
    factors.age *
    factors.gap *
    factors.minutes *
    factors.coach *
    factors.confidence *
    factors.trait *
    factors.difficulty
  );
}

/**
 * Moral de título (GDD 10.4): ganhar empurra um pouco, até P + 1. A soma de
 * importâncias é a da seção 7.5 (liga 1,0; Champions 2,5...). `level` é o
 * nível total, com o treino.
 */
export function titleMorale(importance: number, level: number, potential: number): number {
  if (importance <= 0 || level >= potential + MORALE.aboveCeiling) return 0;
  return Math.min(MORALE.max, MORALE.perImportance * importance);
}

/** O teto biológico de uma temporada: tudo que soma em L passa por aqui. */
export function capSeasonGain(rawGain: number): number {
  return softCeiling(Math.max(0, rawGain), GROWTH.knee, GROWTH.ceiling);
}

/**
 * Perda por idade (GDD 10.3). Não depende da forma: temporada ruim não
 * acelera o envelhecimento, e temporada boa não o interrompe. Começa dois anos
 * depois do pico, mais a folga da posição (zagueiro +1, goleiro +2, sobre um
 * pico que já é mais tarde) e a longevidade de quem nasceu com ela.
 */
export function ageDecline(player: Player, age: number, difficulty: Difficulty): number {
  const grace = DECLINE_GRACE[GROUP_OF[player.position]] + player.longevity;
  const years = age - player.peakAge - DECLINE.startAfterPeak - grace;
  if (years <= 0) return 0;
  const loss = Math.min(DECLINE.max, DECLINE.linear * years + DECLINE.quadratic * years * years);
  return loss * TRAIT_EFFECTS[player.trait].decline * DIFFICULTY_EFFECTS[difficulty].decline;
}
