import { clamp } from "../math";
import type { Rng } from "../rng";
import { isGoalkeeper, type Position } from "../player/positions";

/**
 * Papel no elenco (GDD 11.2): sai da distância entre o OVR e a força atual do
 * clube, e decide quantos jogos o jogador disputa.
 */

export const OUTFIELD_ROLES = ["star", "starter", "rotation", "reserve", "surplus"] as const;
export const KEEPER_ROLES = ["starter", "reserve", "third"] as const;
export type SquadRole = (typeof OUTFIELD_ROLES)[number] | (typeof KEEPER_ROLES)[number];

interface RoleStep {
  readonly role: SquadRole;
  /** Menor `d = OVR - força` que ainda garante o papel. */
  readonly from: number;
  /** Fração dos jogos do clube que o jogador disputa. */
  readonly participation: number;
}

const OUTFIELD_LADDER: readonly RoleStep[] = [
  { role: "star", from: 3, participation: 0.95 },
  { role: "starter", from: -1, participation: 0.85 },
  { role: "rotation", from: -4, participation: 0.6 },
  { role: "reserve", from: -8, participation: 0.28 },
  { role: "surplus", from: Number.NEGATIVE_INFINITY, participation: 0.08 },
];

const KEEPER_LADDER: readonly RoleStep[] = [
  { role: "starter", from: -2, participation: 0.92 },
  { role: "reserve", from: -7, participation: 0.12 },
  { role: "third", from: Number.NEGATIVE_INFINITY, participation: 0.02 },
];

function ladderOf(position: Position): readonly RoleStep[] {
  return isGoalkeeper(position) ? KEEPER_LADDER : OUTFIELD_LADDER;
}

export interface RoleResult {
  readonly role: SquadRole;
  readonly participation: number;
  /** A distância que decidiu o papel. */
  readonly gap: number;
}

export function squadRole(position: Position, ovr: number, clubStrength: number): RoleResult {
  const gap = ovr - clubStrength;
  const ladder = ladderOf(position);
  const step = ladder.find((candidate) => gap >= candidate.from) ?? ladder[ladder.length - 1];
  if (!step) throw new Error("squadRole: escada vazia");
  return { role: step.role, participation: step.participation, gap };
}

export function participationOf(position: Position, role: SquadRole): number {
  const step = ladderOf(position).find((candidate) => candidate.role === role);
  if (!step) throw new Error(`participationOf: papel ${role} não existe para ${position}`);
  return step.participation;
}

/** Chance de subir um degrau na temporada para quem ainda não é titular. */
export function breakthroughChance(gap: number): number {
  return clamp(0.08 - 0.004 * Math.abs(gap), 0.02, 0.08);
}

/**
 * Aplica a chance de ganhar espaço. Quem já é titular (ou craque do time)
 * não sorteia nada: o fluxo só é consumido por quem pode subir.
 */
export function rollBreakthrough(rng: Rng, position: Position, result: RoleResult): RoleResult {
  const ladder = ladderOf(position);
  const index = ladder.findIndex((step) => step.role === result.role);
  const titular = isGoalkeeper(position) ? 0 : 1;
  if (index <= titular) return result;
  if (!rng.chance(breakthroughChance(result.gap))) return result;
  const promoted = ladder[index - 1];
  if (!promoted) return result;
  return { role: promoted.role, participation: promoted.participation, gap: result.gap };
}

/**
 * Um degrau acima (`1`) ou abaixo (`-1`) na escada, por evento: concorrente
 * contratado, treinador novo, atrito com o clube.
 */
export function shiftRole(position: Position, result: RoleResult, shift: -1 | 1): RoleResult {
  const ladder = ladderOf(position);
  const index = ladder.findIndex((step) => step.role === result.role);
  const next = ladder[clamp(index - shift, 0, ladder.length - 1)];
  if (!next) return result;
  return { role: next.role, participation: next.participation, gap: result.gap };
}

/**
 * Um papel mínimo garantido por evento ("titular garantido" na nova função ou
 * na volta do ídolo). É piso, não teto: quem já seria craque do time continua
 * craque do time.
 */
export function atLeastRole(position: Position, result: RoleResult, minimum: SquadRole): RoleResult {
  const ladder = ladderOf(position);
  const current = ladder.findIndex((step) => step.role === result.role);
  const floor = ladder.findIndex((step) => step.role === minimum);
  if (floor < 0 || current <= floor) return result;
  const step = ladder[floor];
  if (!step) return result;
  return { role: step.role, participation: step.participation, gap: result.gap };
}
