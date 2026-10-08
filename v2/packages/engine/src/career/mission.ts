import type { MissionKey } from "./types";

/**
 * A missão do clube (GDD 16): o motivo da contratação. Define a torcida da
 * chegada, a pressão (multiplica as quedas de torcida) e a cobrança
 * (descontada do ganho de torcida toda temporada).
 */

export interface MissionTerms {
  readonly fans: number;
  readonly pressure: number;
  readonly demand: number;
}

export const MISSION_TERMS: Readonly<Record<MissionKey, MissionTerms>> = {
  academyBet: { fans: 45, pressure: 0.7, demand: 0 },
  reinforcement: { fans: 50, pressure: 1, demand: 3 },
  projectPiece: { fans: 55, pressure: 1, demand: 4 },
  marqueeSigning: { fans: 64, pressure: 1.3, demand: 8 },
  heir: { fans: 48, pressure: 1.45, demand: 8 },
  rescue: { fans: 56, pressure: 1.2, demand: 5 },
  rebuild: { fans: 58, pressure: 0.85, demand: 2 },
  homecoming: { fans: 68, pressure: 0.8, demand: 2 },
  experience: { fans: 55, pressure: 0.8, demand: 2 },
  proveYourself: { fans: 46, pressure: 1.15, demand: 4 },
};

/** Pressão máxima depois de camisas, braçadeira e homenagens. */
export const PRESSURE_MAX = 1.8;

/** Chance de o passo acima virar "herdeiro da camisa". */
const HEIR_CHANCE = 0.12;

export interface MissionInput {
  readonly age: number;
  readonly ovr: number;
  readonly clubStrength: number;
  readonly clubPrestige: number;
  /** Força do clube que ele deixa, ou `null` no primeiro clube. */
  readonly currentStrength: number | null;
  /** Já jogou no clube, ou é o primeiro clube da carreira voltando. */
  readonly homecoming: boolean;
  /** Vem de dispensa ou de empréstimo não retido. */
  readonly proving: boolean;
  /** O clube ficou no terço de baixo da tabela anterior. */
  readonly bottomThird: boolean;
  /** O clube acabou de subir ou cair. */
  readonly justMoved: boolean;
  /** Um sorteio de 0 a 1, para o herdeiro. */
  readonly roll: number;
}

/**
 * A primeira missão que se aplicar, na ordem: volta para casa, mostrar
 * serviço, aposta da base, resgate, reconstrução, contratação de peso,
 * herdeiro, experiência, peça do projeto e, por fim, reforço.
 *
 * A aposta da base vem antes do resgate: um clube bem mais forte que leva um
 * garoto de 17 anos está apostando nele, não contando com ele para fugir do
 * rebaixamento.
 */
export function chooseMission(input: MissionInput): MissionKey {
  if (input.homecoming) return "homecoming";
  if (input.proving) return "proveYourself";
  if (input.age <= 19 && input.clubStrength >= input.ovr + 4) return "academyBet";
  if (input.bottomThird) return "rescue";
  if (input.justMoved) return "rebuild";
  if (input.ovr >= input.clubStrength + 4 || (input.clubPrestige >= 4 && input.ovr >= 84)) return "marqueeSigning";
  const stepUp = input.currentStrength !== null && input.clubStrength >= input.currentStrength + 2;
  if (stepUp && input.roll < HEIR_CHANCE) return "heir";
  if (input.age >= 31) return "experience";
  if (input.ovr >= input.clubStrength) return "projectPiece";
  return "reinforcement";
}

/** Cor da pílula da missão pela pressão (sempre com texto ao lado). */
export function pressureTone(pressure: number): "high" | "low" | "neutral" {
  if (pressure >= 1.3) return "high";
  if (pressure <= 0.85) return "low";
  return "neutral";
}
