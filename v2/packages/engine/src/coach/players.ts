import type { SquadPlayer } from "@craque/world/squads";
import { clamp } from "../math";
import type { Rng } from "../rng";
import type { Position } from "../player/positions";
import { baseMarketValue } from "../player/value";
import type { CoachPlayer, CoachTrait, FormLabel, Mood, Role, SeasonStats, SectorOrGk } from "./types";
import { EVOLUTION, FINANCE, FORM, MOOD_OUTPUT, OUTPUT_LIMITS, POSITION_FIT, SATISFACTION, TRAIT_EFFECTS } from "./tuning";
import { coachRng, unit } from "./util";

/**
 * O jogador do Técnico (spec 7 e 8). A tela mostra OVR, fase, estado de
 * satisfação e características; o rendimento efetivo (OVR mais fase,
 * satisfação e contexto) só existe aqui dentro.
 */

const SECTOR: Readonly<Record<Position, SectorOrGk>> = {
  gk: "gk",
  cb: "def",
  lb: "def",
  rb: "def",
  cdm: "mid",
  cm: "mid",
  cam: "mid",
  lm: "mid",
  rm: "mid",
  lw: "att",
  rw: "att",
  st: "att",
};

export function sectorOf(position: Position): SectorOrGk {
  return SECTOR[position];
}

export function ageOf(player: Pick<CoachPlayer, "birthYear">, year: number): number {
  return year - player.birthYear;
}

export function moodOf(satisfaction: number): Mood {
  if (satisfaction >= SATISFACTION.happy) return "happy";
  if (satisfaction < SATISFACTION.unhappy) return "unhappy";
  return "neutral";
}

export function formLabelOf(form: number): FormLabel {
  if (form <= -1.5) return "awful";
  if (form <= -0.5) return "poor";
  if (form < 0.5) return "normal";
  if (form < 1.5) return "good";
  return "great";
}

export function emptySeason(): SeasonStats {
  return {
    apps: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    ratingSum: 0,
    rated: 0,
    available: 0,
    benchUnused: 0,
    derbyGoals: 0,
    bigGames: 0,
    bigGoals: 0,
    setPieceGoals: 0,
  };
}

/** Salário mensal pelo OVR: o mesmo jogador custa o mesmo em qualquer clube. */
export function wageFor(ovr: number): number {
  const annual = FINANCE.wageOfValue * baseMarketValue(ovr, 27);
  return Math.max(2_000, Math.round(annual / 12 / 500) * 500);
}

/** Valor estimado (sempre estimativa na tela). */
export function valueOf(player: Pick<CoachPlayer, "ovr" | "birthYear">, year: number): number {
  const raw = baseMarketValue(player.ovr, ageOf(player, year));
  const step = raw >= 10_000_000 ? 500_000 : raw >= 1_000_000 ? 100_000 : 10_000;
  return Math.max(10_000, Math.round(raw / step) * step);
}

/**
 * Potencial escondido pela idade e pelo OVR inicial. Jovens têm folga maior
 * e uma cauda rara; acima dos 27, praticamente nenhuma.
 */
function hiddenPotential(rng: Rng, ovr: number, age: number): number {
  let room: number;
  if (age <= 18) room = rng.real(5, 15) + (rng.chance(0.08) ? rng.real(3, 8) : 0);
  else if (age <= 20) room = rng.real(3, 12) + (rng.chance(0.06) ? rng.real(2, 6) : 0);
  else if (age <= 23) room = rng.real(1, 8);
  else if (age <= 26) room = rng.real(0, 4);
  else room = rng.real(0, 1.2);
  return Math.min(97, ovr + room);
}

export function createPlayer(seed: string, row: SquadPlayer, year: number): CoachPlayer {
  const age = year - row.birthYear;
  const rng = coachRng(seed, "player", row.id);
  const level = row.ovr + rng.real(-0.45, 0.45);
  const potential = hiddenPotential(rng, row.ovr, age);
  return {
    id: row.id,
    name: row.name,
    nationality: row.nationality,
    position: row.position,
    alternates: row.alternates,
    birthYear: row.birthYear,
    origin: row.origin,
    level,
    ovr: row.ovr,
    potential,
    longevity: rng.normal(0, EVOLUTION.longevitySpread),
    form: 0,
    recentRatings: [],
    traits: [...row.traits],
    club: row.club,
    joinedYear: year - (age > 22 ? rng.int(0, 3) : 0),
    wage: wageFor(row.ovr),
    satisfaction: SATISFACTION.initial + rng.real(-6, 6),
    role: "backup",
    acceptsBench: age >= 31 || rng.chance(0.35),
    injury: null,
    youthClub: null,
    developedAt: null,
    listed: false,
    offeredAt: null,
    consecutiveStarts: 0,
    season: emptySeason(),
  };
}

/**
 * Indicação do potencial (spec 6.5): uma faixa em palavras, calculada sobre
 * uma estimativa com erro fixo por jogador. Nunca o teto interno.
 */
export type PotentialHint = "high" | "good" | "some" | "limited" | "peak" | "declining";

export function potentialHint(player: CoachPlayer, year: number): PotentialHint {
  const age = ageOf(player, year);
  const noise = (unit(`${player.id}:hint`) - 0.5) * 6;
  const room = player.potential + noise - player.level;
  if (age >= 31) return "declining";
  if (age >= 27 && room < 2) return "peak";
  if (room > 10) return "high";
  if (room > 5) return "good";
  if (room > 1.5) return "some";
  return "limited";
}

// ------------------------------------------------------------ rendimento

export interface OutputContext {
  /** Posição da vaga em que joga. */
  readonly slot: Position;
  readonly big: boolean;
  readonly derby: boolean;
}

/** Quanto o jogador perde jogando fora da posição (versátil perde metade). */
export function positionPenalty(player: CoachPlayer, slot: Position): number {
  if (player.position === slot) return 0;
  const versatile = player.traits.includes("versatile") ? 0.5 : 1;
  if (player.position === "gk" || slot === "gk") return POSITION_FIT.goalkeeper;
  if (player.alternates.includes(slot)) return POSITION_FIT.alternate * versatile;
  if (sectorOf(player.position) === sectorOf(slot)) return POSITION_FIT.sameSector * versatile;
  return POSITION_FIT.otherSector * versatile;
}

/**
 * Rendimento efetivo, escondido da interface (spec 8). Um 75 insatisfeito rende
 * como 72; a soma de fase, satisfação e características fica entre −4 e +3.
 */
export function output(player: CoachPlayer, context: OutputContext): number {
  const mood = moodOf(player.satisfaction);
  const moodValue = MOOD_OUTPUT[mood];
  const moodAndForm = Math.max(OUTPUT_LIMITS.moodAndForm, moodValue + player.form);
  let traits = 0;
  if (context.big && player.traits.includes("clutch")) traits += TRAIT_EFFECTS.clutch;
  if (context.derby && player.traits.includes("derby")) traits += TRAIT_EFFECTS.derby;
  if (player.traits.includes("aerial") && (context.slot === "cb" || context.slot === "cdm")) traits += TRAIT_EFFECTS.aerial;
  const modifier = clamp(moodAndForm + traits, OUTPUT_LIMITS.min, OUTPUT_LIMITS.max);
  return player.level + modifier + positionPenalty(player, context.slot);
}

/** Rendimento da IA: sem satisfação (os clubes da IA não sofrem com isso). */
export function aiOutput(player: CoachPlayer, slot: Position): number {
  return player.level + clamp(player.form, -2, 2) + positionPenalty(player, slot);
}

export function hasTrait(player: CoachPlayer, trait: CoachTrait): boolean {
  return player.traits.includes(trait);
}

/** Fase pelas notas recentes (spec 7). */
export function formFromRatings(ratings: readonly number[]): number {
  if (ratings.length === 0) return 0;
  const recent = ratings.slice(-FORM.window);
  const average = recent.reduce((total, value) => total + value, 0) / recent.length;
  const [awful, poor, good, great] = FORM.thresholds;
  if (average < awful) return -2;
  if (average < poor) return -1;
  if (average < good) return 0;
  if (average < great) return 1;
  return 2;
}

export const ROLE_ORDER: readonly Role[] = ["star", "starter", "rotation", "backup", "prospect"];
