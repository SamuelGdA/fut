import type { Difficulty } from "../types";

/**
 * Todos os coeficientes da evolução num lugar só (GDD 10). São os números
 * marcados como "(inicial)" no GDD, ajustados pelo harness `tools/balance`
 * até as metas da seção 40 passarem. Mudar qualquer um muda carreiras: a
 * versão do motor sobe junto (`ENGINE_VERSION`).
 */
export const GROWTH = {
  /** Ganho de L por temporada de um jovem longe do teto, em condições médias. */
  base: 7.6,
  /** A idade em que o ritmo de crescimento cai pela metade: pico menos isto. */
  slowdownBeforePeak: 2.5,
  /** Largura da curva de desaceleração, em anos. */
  slowdownWidth: 1.8,
  /** Folga até o potencial em que o crescimento anda a meio ritmo. */
  gapHalfSpeed: 9,
  /** Folga mínima: deixa uma temporada excepcional passar do teto por pouco. */
  gapFloor: 0.35,
  /** Teto suave do ganho de L numa temporada: até `knee` passa inteiro. */
  knee: 4.4,
  /** O ganho de L numa temporada se aproxima disto, mas nunca chega. */
  ceiling: 7,
  /** Jogos que contam como temporada completa. */
  fullSeasonGames: 34,
  /** Quanto rende quem quase não joga. */
  benchFactor: 0.45,
  /** Treinador do clube mais fraco e do mais forte. */
  coachMin: 0.85,
  coachMax: 1.15,
  coachFloorStrength: 55,
  coachSpan: 35,
  /** Confiança vinda da torcida, de 0 a 100. */
  confidenceMin: 0.96,
  confidenceSpan: 0.08,
} as const;

/** Forma da temporada (GDD 10.2). */
export const FORM = {
  explosion: { min: 1.25, max: 1.45 },
  stumble: { chance: 0.08, min: 0.45, max: 0.7 },
  normal: { min: 0.88, max: 1.12 },
  /** Chance de explosão por idade; ninguém explode com menos jogos que isto. */
  explosionMinGames: 20,
  explosionByAge: [
    { upTo: 19, chance: 0.14 },
    { upTo: 22, chance: 0.1 },
    { upTo: 25, chance: 0.05 },
    { upTo: Number.POSITIVE_INFINITY, chance: 0.015 },
  ],
} as const;

/** Declínio por idade (GDD 10.3). */
export const DECLINE = {
  /** Anos depois do pico em que a perda começa. */
  startAfterPeak: 2,
  linear: 0.26,
  quadratic: 0.05,
  /** Perda máxima de L numa temporada. */
  max: 4.5,
} as const;

/** Moral de título (GDD 10.4). */
export const MORALE = {
  perImportance: 0.25,
  max: 1.2,
  /** Acima de P + isto, título não rende mais nada. */
  aboveCeiling: 1,
} as const;

/** Treino (GDD 10.5 e D42). */
export const TRAINING = {
  /** O que um foco soma ao atributo dele, e o mínimo garantido no fim do período. */
  focus: 2,
  /**
   * Quanto o nível total (L mais treino) pode passar do potencial por causa do
   * treino. Daqui para cima, treinar especializa: o atributo treinado sobe e a
   * capacidade natural cede o mesmo tanto no OVR.
   */
  ceilingAllowance: 0,
} as const;

export const DIFFICULTY_EFFECTS: Readonly<Record<Difficulty, { growth: number; decline: number }>> = {
  normal: { growth: 1, decline: 1 },
  hard: { growth: 0.86, decline: 1.25 },
};

/** Faixa em que L pode existir. Abaixo disso, ninguém mais seria profissional. */
export const CAPACITY_RANGE = { min: 25, max: 99 } as const;
