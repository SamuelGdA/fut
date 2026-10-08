import { clamp } from "../math";
import { stream } from "../rng";
import { bandAt, bandIndex, type TalentBand } from "./talent";

/**
 * Leitura do olheiro (GDD 9.9). O potencial nunca aparece como número: o
 * olheiro dá uma leitura que afina com idade e jogos ao mesmo tempo.
 *
 * O desvio de cada nível é sorteado uma vez, num fluxo só dele, para a leitura
 * não mudar a cada tela. A interface colore pela faixa **reportada**, nunca
 * pela verdadeira (invariante 12): colorir pela verdadeira entregaria a
 * resposta.
 */

export const SCOUT_LEVELS = ["observing", "rumour", "approximate", "certain"] as const;
export type ScoutLevel = (typeof SCOUT_LEVELS)[number];

/** Portões de cada nível: idade e jogos na carreira, os dois juntos. */
export const SCOUT_GATES: Readonly<Record<Exclude<ScoutLevel, "observing">, { age: number; games: number }>> = {
  rumour: { age: 20, games: 60 },
  approximate: { age: 24, games: 180 },
  certain: { age: 29, games: 350 },
};

/** Pesos do desvio, do mais negativo ao mais positivo. */
const DEVIATION: Readonly<Record<"rumour" | "approximate", ReadonlyArray<readonly [number, number]>>> = {
  rumour: [
    [-2, 10],
    [-1, 22],
    [0, 36],
    [1, 22],
    [2, 10],
  ],
  approximate: [
    [-1, 18],
    [0, 64],
    [1, 18],
  ],
};

export interface ScoutReading {
  readonly level: ScoutLevel;
  /** Nenhuma faixa (em observação), duas vizinhas (boato, aproximada) ou a certa. */
  readonly bands: readonly TalentBand[];
}

export function scoutLevel(age: number, careerGames: number): ScoutLevel {
  const reached = (level: keyof typeof SCOUT_GATES) =>
    age >= SCOUT_GATES[level].age && careerGames >= SCOUT_GATES[level].games;
  if (reached("certain")) return "certain";
  if (reached("approximate")) return "approximate";
  if (reached("rumour")) return "rumour";
  return "observing";
}

export function scoutReading(seed: string, truth: TalentBand, age: number, careerGames: number): ScoutReading {
  const level = scoutLevel(age, careerGames);
  if (level === "observing") return { level, bands: [] };
  if (level === "certain") return { level, bands: [truth] };

  const rng = stream(seed, "scout", level);
  const deviation = rng.weighted(DEVIATION[level]);
  const reported = clamp(bandIndex(truth) + deviation, 0, 4);
  const upward = rng.chance(0.5);
  const low = reported === 0 ? 0 : reported === 4 ? 3 : upward ? reported : reported - 1;
  return { level, bands: [bandAt(low), bandAt(low + 1)] };
}
