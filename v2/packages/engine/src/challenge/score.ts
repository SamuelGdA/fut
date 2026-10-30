import type { Career } from "../career/types";
import { clamp } from "../math";
import { edictState, type EdictState, getEdict } from "./edicts";
import type { ChallengeHand } from "./hand";
import { HIDDEN_REVEAL_AGE } from "./hand";
import { getMission } from "./missions";
import { best, erasedSeasons, lastPlayedAge } from "./measures";
import { getChallengeRecord, RECORD_SHARE, recordPoints } from "./records";

/**
 * A pontuação do Desafio do dia (GDD 27.5), sobre 1000:
 *
 *   missão(r = progresso / alvo):
 *     r ≤ 1: 400 × (1 − e^(−2,2 r)) / (1 − e^(−2,2))
 *     r > 1: 400 + min(50; 45 × log2(r))
 *   bruto = soma das DUAS melhores missões               (máx. 900)
 *   pico  = 100 × limitar((OVR de pico − 72) / 27, 0, 1)^1,4  (máx. 100)
 *   total = arredondar((bruto + pico) × (édito ? 1 : 0,5) × 0,97^apagadas)
 *
 * Dia de recorde (D94): bruto + pico valem 75%, e o recorde soma até 250
 * (perto rende, igualar +60, superar +40), sob o mesmo édito e as mesmas
 * apagadas. A nota continua de 0 a 1000.
 *
 * Contar só duas é o que faz perseguir as três ser a linha perdedora.
 */

export const MISSION_FULL = 400;
export const MISSION_BONUS_MAX = 50;
export const PEAK_BONUS_MAX = 100;

export function missionPoints(ratio: number): number {
  const r = Math.max(0, ratio);
  if (r <= 1) return (MISSION_FULL * (1 - Math.exp(-2.2 * r))) / (1 - Math.exp(-2.2));
  return MISSION_FULL + Math.min(MISSION_BONUS_MAX, 45 * Math.log2(r));
}

export function peakBonus(peakOvr: number): number {
  return PEAK_BONUS_MAX * Math.pow(clamp((peakOvr - 72) / 27, 0, 1), 1.4);
}

export interface MissionProgress {
  readonly id: string;
  readonly value: number;
  readonly target: number;
  /** progresso / alvo, sem teto. */
  readonly ratio: number;
  readonly points: number;
  /** A missão escondida ainda não abriu (antes dos 24). */
  readonly hidden: boolean;
  /** Entra na soma (uma das duas melhores). Só no resultado final. */
  readonly counted: boolean;
}

export interface ChallengeStatus {
  readonly hand: ChallengeHand;
  readonly missions: readonly MissionProgress[];
  readonly edict: { readonly id: string; readonly value: number; readonly limit: number; readonly state: EdictState };
  readonly erased: number;
  readonly peakOvr: number;
  readonly raw: number;
  readonly peak: number;
  /** Dia de recorde (D94): a marca da carreira, a real e os pontos. */
  readonly record: { readonly id: string; readonly value: number; readonly mark: number; readonly points: number } | null;
  readonly total: number;
}

/**
 * Onde a tentativa está, a qualquer momento: progresso de cada missão, o
 * estado do édito, temporadas apagadas e a pontuação como estaria se a
 * carreira acabasse agora. A missão escondida conta mesmo antes de abrir;
 * ela só não aparece.
 */
export function challengeStatus(hand: ChallengeHand, career: Career): ChallengeStatus {
  const opened = lastPlayedAge(career) >= HIDDEN_REVEAL_AGE || career.end !== null;
  const missions = hand.missions.map((id, index): MissionProgress => {
    const item = getMission(id);
    const target = hand.targets[index] ?? 0;
    if (!item || target <= 0) throw new Error(`desafio: missão sem alvo ${id}`);
    const value = item.measure(career);
    const ratio = value / target;
    return { id, value, target, ratio, points: missionPoints(ratio), hidden: index === hand.hidden && !opened, counted: false };
  });
  // As duas melhores contam (empate: a primeira da mão).
  const ranked = [...missions].sort((a, b) => b.points - a.points);
  const counted = new Set(ranked.slice(0, 2).map((item) => item.id));
  const withCounted = missions.map((item) => ({ ...item, counted: counted.has(item.id) }));
  const raw = ranked.slice(0, 2).reduce((total, item) => total + item.points, 0);

  const edict = getEdict(hand.edict);
  if (!edict) throw new Error(`desafio: édito desconhecido ${hand.edict}`);
  const state = edictState(edict, career);
  const erased = erasedSeasons(career.history);
  const peakOvr = best(career.history, (record) => record.ovrEnd);
  const peak = peakBonus(peakOvr);
  const edictFactor = state === "broken" || state === "pending" ? 0.5 : 1;
  const target = hand.record ? getChallengeRecord(hand.record.id) : null;
  const recordValue = target ? target.measure(career) : 0;
  const record = hand.record && target ? { id: hand.record.id, value: recordValue, mark: hand.record.mark, points: recordPoints(recordValue, hand.record.mark) } : null;
  const base = record ? (raw + peak) * RECORD_SHARE + record.points : raw + peak;
  const total = Math.round(base * edictFactor * Math.pow(0.97, erased));
  return {
    hand,
    missions: withCounted,
    edict: { id: edict.id, value: edict.measure(career), limit: edict.limit, state },
    erased,
    peakOvr,
    raw,
    peak,
    record,
    total,
  };
}
