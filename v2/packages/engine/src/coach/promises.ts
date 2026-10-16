import type { CoachCareer, CoachPromise } from "./types";
import { isAvailable } from "./lineup";

/** A cobrança é a escalação escolhida para abrir o segundo turno, antes da IA jogar. */
export function promiseProgress(career: CoachCareer, promise: CoachPromise): { done: number; target: number; exempt: boolean; unit: "share" | "games" | "keep" } {
  const player = promise.player ? career.players[promise.player] : null;
  if (!player || player.club !== career.coach?.club) return { done: 0, target: 1, exempt: false, unit: "share" };
  return { done: career.coach?.tactics.lineup.includes(player.id) ? 1 : 0, target: 1, exempt: !isAvailable(player, career.day), unit: "share" };
}
