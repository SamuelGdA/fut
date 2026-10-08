import type { Position } from "../player/positions";
import { aiOutput, output, sectorOf, type OutputContext } from "./players";
import type { CoachPlayer, FormationId, Philosophy, SectorOrGk } from "./types";
import { MATCH, PHILOSOPHY, PREDICTABILITY, SECTOR_MIX, TRAIT_EFFECTS } from "./tuning";

/**
 * Formações, filosofias e a força dos setores (spec 9). Não há barra de
 * adequação tática: a formação só decide quantos jogadores cada setor tem e em
 * que posição cada um joga; a filosofia muda gols a favor e contra.
 */

/** As 11 vagas de cada formação, do goleiro ao ataque. */
export const FORMATION_SLOTS: Readonly<Record<FormationId, readonly Position[]>> = {
  "4-4-2": ["gk", "rb", "cb", "cb", "lb", "rm", "cm", "cm", "lm", "st", "st"],
  "4-3-3": ["gk", "rb", "cb", "cb", "lb", "cm", "cdm", "cm", "rw", "st", "lw"],
  "4-2-3-1": ["gk", "rb", "cb", "cb", "lb", "cdm", "cm", "rw", "cam", "lw", "st"],
  "3-5-2": ["gk", "cb", "cb", "cb", "rm", "cm", "cdm", "cm", "lm", "st", "st"],
  "5-3-2": ["gk", "rb", "cb", "cb", "cb", "lb", "cm", "cdm", "cm", "st", "st"],
  "4-1-4-1": ["gk", "rb", "cb", "cb", "lb", "cdm", "rm", "cm", "cm", "lm", "st"],
};

const BASE_COUNT: Readonly<Record<"def" | "mid" | "att", number>> = { def: 4, mid: 4, att: 2 };

export interface SectorRatings {
  readonly gk: number;
  readonly def: number;
  readonly mid: number;
  readonly att: number;
  /** Ataque e defesa combinados (SECTOR_MIX). */
  readonly attack: number;
  readonly defense: number;
}

export interface OnField {
  readonly player: CoachPlayer;
  readonly slot: Position;
}

/**
 * Força dos setores a partir de quem está em campo. Um jogador a mais que a
 * base do setor soma `countBonus`; com menos de 11, o time perde força.
 */
export function sectorRatings(onField: readonly OnField[], rating: (entry: OnField) => number): SectorRatings {
  const groups: Record<SectorOrGk, number[]> = { gk: [], def: [], mid: [], att: [] };
  for (const entry of onField) groups[sectorOf(entry.slot)].push(rating(entry));
  const avg = (list: number[], fallback: number) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : fallback);
  const all = onField.map(rating);
  const overall = avg(all, 50);
  const gk = avg(groups.gk, overall - 15);
  const sector = (key: "def" | "mid" | "att") => avg(groups[key], overall - 6) + SECTOR_MIX.countBonus * (groups[key].length - BASE_COUNT[key]);
  const def = sector("def");
  const mid = sector("mid");
  const att = sector("att");
  return {
    gk,
    def,
    mid,
    att,
    attack: SECTOR_MIX.attack.att * att + SECTOR_MIX.attack.mid * mid,
    defense: SECTOR_MIX.defense.def * def + SECTOR_MIX.defense.gk * gk + SECTOR_MIX.defense.mid * mid,
  };
}

export function coachRating(context: Omit<OutputContext, "slot">): (entry: OnField) => number {
  return (entry) => output(entry.player, { ...context, slot: entry.slot });
}

export function aiRating(entry: OnField): number {
  return aiOutput(entry.player, entry.slot);
}

/**
 * Melhor time disponível para uma formação: preenche as vagas mais difíceis
 * primeiro (goleiro, depois zaga) com quem rende mais naquela posição.
 */
export function bestEleven(
  players: readonly CoachPlayer[],
  formation: FormationId,
  rate: (player: CoachPlayer, slot: Position) => number = aiOutput,
): OnField[] {
  const slots = FORMATION_SLOTS[formation];
  const order = slots
    .map((slot, index) => ({ slot, index }))
    .sort((a, b) => scarcity(a.slot) - scarcity(b.slot) || a.index - b.index);
  const used = new Set<string>();
  const chosen: Array<OnField | null> = slots.map(() => null);
  for (const { slot, index } of order) {
    let best: CoachPlayer | null = null;
    let bestValue = -Infinity;
    for (const player of players) {
      if (used.has(player.id)) continue;
      const value = rate(player, slot);
      if (value > bestValue || (value === bestValue && best && player.id < best.id)) {
        best = player;
        bestValue = value;
      }
    }
    if (best) {
      used.add(best.id);
      chosen[index] = { player: best, slot };
    }
  }
  return chosen.filter((entry): entry is OnField => entry !== null);
}

function scarcity(slot: Position): number {
  if (slot === "gk") return 0;
  if (slot === "cb") return 1;
  if (slot === "lb" || slot === "rb") return 2;
  if (slot === "st") return 3;
  return 4;
}

/** Força geral mostrada na tela: média do OVR do melhor time na formação mais natural. */
export function displayStrength(players: readonly CoachPlayer[]): number {
  let best = 0;
  for (const formation of ["4-3-3", "4-4-2"] as const) {
    const eleven = bestEleven(players, formation, (player, slot) => player.ovr + (player.position === slot ? 0 : aiOutput(player, slot) - player.level));
    if (eleven.length === 0) continue;
    const value = eleven.reduce((total, entry) => total + entry.player.ovr, 0) / 11;
    best = Math.max(best, value);
  }
  return best;
}

// --------------------------------------------------------------- gols

export interface SideSetup {
  readonly ratings: SectorRatings;
  readonly philosophy: Philosophy;
  readonly fastPlayers: number;
  readonly setPiecePlayers: number;
  /** Multiplicador extra dos gols a favor (treino de ataque, evento). */
  readonly forBoost: number;
  /** Multiplicador extra dos gols contra (treino de defesa, evento). */
  readonly againstBoost: number;
  readonly home: boolean;
  readonly neutral: boolean;
  readonly playersOnField: number;
}

const OPEN: ReadonlySet<Philosophy> = new Set(["attacking", "possession"]);

function forMultiplier(side: SideSetup, other: SideSetup): number {
  switch (side.philosophy) {
    case "attacking":
      return PHILOSOPHY.attacking.for;
    case "defensive":
      return PHILOSOPHY.defensive.for;
    case "possession": {
      const edge = PHILOSOPHY.possession.perMidPoint * (side.ratings.mid - other.ratings.mid);
      return 1 + Math.max(-PHILOSOPHY.possession.cap, Math.min(PHILOSOPHY.possession.cap, edge));
    }
    case "counter": {
      const base = OPEN.has(other.philosophy)
        ? PHILOSOPHY.counter.vsOpen
        : other.philosophy === "defensive"
          ? PHILOSOPHY.counter.vsClosed
          : 1;
      return base * (1 + Math.min(PHILOSOPHY.counter.fastCap, PHILOSOPHY.counter.perFastPlayer * side.fastPlayers));
    }
  }
}

function againstMultiplier(side: SideSetup, other: SideSetup): number {
  switch (side.philosophy) {
    case "attacking": {
      // Bons defensores ajudam a conter a exposição, sem anulá-la.
      const relief = PHILOSOPHY.attacking.defenseRelief * (side.ratings.defense - other.ratings.attack);
      return Math.max(1.05, Math.min(1.2, PHILOSOPHY.attacking.against - relief));
    }
    case "defensive":
      return PHILOSOPHY.defensive.against;
    case "possession":
      return PHILOSOPHY.possession.against;
    case "counter":
      return PHILOSOPHY.counter.against;
  }
}

/** Gols esperados de `side` contra `other` em 90 minutos. */
export function expectedGoals(side: SideSetup, other: SideSetup): number {
  const venue = side.neutral ? 0 : side.home ? MATCH.home : -MATCH.home;
  const exponent = MATCH.attackSlope * (side.ratings.attack - other.ratings.defense) + MATCH.midSlope * (side.ratings.mid - other.ratings.mid) + venue;
  const setPiece = 1 + Math.min(TRAIT_EFFECTS.setPieceCap, TRAIT_EFFECTS.setPiece * side.setPiecePlayers);
  const missing = Math.max(0, 11 - side.playersOnField) * MATCH.shortHanded;
  const extra = Math.max(0, 11 - other.playersOnField) * MATCH.shortHanded;
  const lambda =
    MATCH.base *
    Math.exp(exponent) *
    forMultiplier(side, other) *
    againstMultiplier(other, side) *
    setPiece *
    side.forBoost *
    other.againstBoost *
    (1 - missing) *
    (1 + extra);
  return Math.max(MATCH.minLambda, Math.min(MATCH.maxLambda, lambda));
}

/** Abordagem da IA pela força relativa (spec 9: força e abordagem dos adversários). */
export function aiPhilosophy(own: number, opponent: number, roll: number): Philosophy {
  const gap = own - opponent;
  if (gap > 3) return roll < 0.55 ? "attacking" : "possession";
  if (gap < -3) return roll < 0.5 ? "defensive" : "counter";
  if (roll < 0.3) return "possession";
  if (roll < 0.55) return "attacking";
  if (roll < 0.8) return "counter";
  return "defensive";
}

/** Formação da IA: fixa por clube, sorteada pelo id. */
export function aiFormation(roll: number): FormationId {
  if (roll < 0.35) return "4-3-3";
  if (roll < 0.6) return "4-2-3-1";
  if (roll < 0.8) return "4-4-2";
  if (roll < 0.9) return "3-5-2";
  if (roll < 0.96) return "4-1-4-1";
  return "5-3-2";
}

export function predictabilityHint(value: number): boolean {
  return value >= PREDICTABILITY.hint;
}
