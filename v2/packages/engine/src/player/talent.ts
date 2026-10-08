import { clamp } from "../math";
import type { Rng } from "../rng";
import type { Difficulty } from "../types";

/**
 * Talento e potencial (GDD 9.6). O potencial P é um teto suave da capacidade
 * L e nunca aparece como número: o jogador só conhece a faixa pela leitura do
 * olheiro (`scout.ts`).
 */

/** Operário, Promissor, Craque, Estrela e Fenômeno, do menor ao maior. */
export const TALENT_BANDS = ["journeyman", "prospect", "class", "star", "phenom"] as const;
export type TalentBand = (typeof TALENT_BANDS)[number];

export function bandIndex(band: TalentBand): number {
  return TALENT_BANDS.indexOf(band);
}

export function bandAt(index: number): TalentBand {
  return TALENT_BANDS[clamp(Math.round(index), 0, TALENT_BANDS.length - 1)] as TalentBand;
}

/** Faixa de potencial de cada talento: P é uniforme em [mínimo, máximo). */
export const POTENTIAL_RANGE: Readonly<Record<TalentBand, readonly [number, number]>> = {
  journeyman: [66, 74],
  prospect: [74, 81],
  class: [81, 87],
  star: [87, 92],
  phenom: [92, 97],
};

/** Chance de cada faixa, em porcentagem, por dificuldade. */
export const TALENT_ODDS: Readonly<Record<Difficulty, Readonly<Record<TalentBand, number>>>> = {
  normal: { journeyman: 28, prospect: 34, class: 22, star: 11, phenom: 5 },
  hard: { journeyman: 45, prospect: 34, class: 15, star: 4, phenom: 1 },
};

export function drawTalent(rng: Rng, difficulty: Difficulty): TalentBand {
  const odds = TALENT_ODDS[difficulty];
  return rng.weighted(TALENT_BANDS.map((band) => [band, odds[band]] as const));
}

export function drawPotential(rng: Rng, band: TalentBand): number {
  const [min, max] = POTENTIAL_RANGE[band];
  return rng.real(min, max);
}

/**
 * Capacidade aos 16 anos. Um fenômeno costuma ser visivelmente melhor, mas não
 * o bastante para entregar a faixa: o desvio cobre quase dois degraus.
 */
export function drawInitialCapacity(rng: Rng, band: TalentBand): number {
  return clamp(46 + 1.3 * bandIndex(band) + rng.normal(0, 1.6), 43, 56);
}

/**
 * Prodígio: alguns Estrelas e Fenômenos já chegam prontos aos 16. Acontece na
 * criação, antes da primeira decisão, para que a carta, as ofertas e o
 * primeiro ano já sejam do jogador que ele é. Aplicado depois da primeira
 * temporada, viraria um salto de 30 pontos sem explicação.
 */
export const PRODIGY_CHANCE: Readonly<Record<TalentBand, number>> = {
  journeyman: 0,
  prospect: 0,
  class: 0,
  star: 0.14,
  phenom: 0.26,
};

/** Distância do potencial com que o prodígio começa (inicial). */
export const PRODIGY_GAP: readonly [number, number] = [11, 17];

export function drawProdigy(rng: Rng, band: TalentBand, potential: number, capacity: number): number | null {
  if (!rng.chance(PRODIGY_CHANCE[band])) return null;
  const ready = potential - rng.real(PRODIGY_GAP[0], PRODIGY_GAP[1]);
  return Math.max(capacity, ready);
}
