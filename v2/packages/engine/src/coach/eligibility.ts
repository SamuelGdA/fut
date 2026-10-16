import type { Position } from "../player/positions";
import type { Rng } from "../rng";
import type { CoachTrait } from "./types";

/** Características precisam ter efeito nas posições declaradas, inclusive as secundárias. */
export function traitFits(trait: CoachTrait, positions: readonly Position[]): boolean {
  if (trait === "aerial") return positions.some((position) => position === "cb" || position === "cdm");
  if (trait === "setPiece" || trait === "fast" || trait === "clutch" || trait === "derby") return positions.some((position) => position !== "gk");
  if (trait === "versatile") return positions.length > 1;
  return true;
}

const NEIGHBOURS: Readonly<Record<Position, readonly Position[]>> = {
  gk: [], cb: ["cdm", "lb", "rb"], lb: ["cb", "lm"], rb: ["cb", "rm"],
  cdm: ["cb", "cm"], cm: ["cdm", "cam", "lm", "rm"], cam: ["cm", "lw", "rw", "st"],
  lm: ["lb", "cm", "lw"], rm: ["rb", "cm", "rw"], lw: ["lm", "cam", "rw", "st"],
  rw: ["rm", "cam", "lw", "st"], st: ["cam", "lw", "rw"],
};

/** Jovens podem atuar em posições vizinhas, sem saltar de defesa para ataque. */
export function youthAlternates(position: Position, rng: Rng): Position[] {
  const pool = NEIGHBOURS[position];
  if (!pool.length || !rng.chance(0.42)) return [];
  const first = rng.pick(pool);
  const rest = pool.filter((entry) => entry !== first);
  return rest.length && rng.chance(0.18) ? [first, rng.pick(rest)] : [first];
}

export function canLearnPosition(primary:Position,alternate:Position):boolean { return NEIGHBOURS[primary].includes(alternate); }
