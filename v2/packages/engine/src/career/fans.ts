import { clamp } from "../math";
import { GROUP_OF, isDefender, isGoalkeeper, type Position } from "../player/positions";
import { TRAIT_EFFECTS, type Trait } from "../player/traits";
import { SCORING } from "../season/production";
import type { PlayerSeasonStats } from "../season/playerSeason";
import type { Difficulty } from "../types";
import type { ClubBond, Contract, LegacyLevel } from "./types";

/**
 * Torcida e legado (GDD 17): um medidor de 0 a 100 por clube, que lembra o
 * pico de cada arquibancada, e o legado acumulado em cada clube.
 */

export const FAN_BANDS = ["unknown", "hostile", "cold", "warm", "loved", "idolized"] as const;
export type FanBand = (typeof FAN_BANDS)[number];

export function fanBand(value: number, peak: number): FanBand {
  if (value < 20 && peak < 35) return "unknown";
  if (value < 20) return "hostile";
  if (value < 40) return "cold";
  if (value < 60) return "warm";
  if (value < 80) return "loved";
  return "idolized";
}

/**
 * Torcida do primeiro clube da carreira: no meio do medidor. Ninguém conhece o
 * garoto da base ainda, mas também ninguém tem nada contra ele.
 */
export const FIRST_CLUB_FANS = 50;

/** A torcida na chegada (GDD 17.3). */
export function arrivalFans(bond: ClubBond | undefined, missionFans: number, firstClub: boolean, ovr: number): number {
  if (firstClub) return FIRST_CLUB_FANS;
  if (bond && bond.ovrWhenLeft !== null) {
    return clamp(bond.fans + Math.min(10, 0.5 * (ovr - bond.ovrWhenLeft)), 0, 100);
  }
  return missionFans;
}

const DIFFICULTY_DROPS: Readonly<Record<Difficulty, number>> = { normal: 1, hard: 1.35 };

/** Referência de produção por jogo de um bom jogador da posição. */
function productionReference(position: Position): number {
  const scoring = SCORING[position];
  return 1.3 * (scoring.goals + 0.6 * scoring.assists);
}

/** Desempenho da temporada, de 0 a 1 (GDD 17.2). */
export function seasonPerformance(stats: PlayerSeasonStats, position: Position): number {
  const { games, production, participation } = stats;
  const presence = Math.min(1, participation / 0.85);
  let relative: number;
  if (games === 0) relative = 0;
  else if (isGoalkeeper(position)) relative = production.cleanSheets / games / 0.4;
  else if (isDefender(position)) relative = 0.5 * (production.cleanSheets / games / 0.35) + 0.5 * participation;
  else relative = (production.goals + 0.6 * production.assists) / games / productionReference(position);
  return 0.45 * presence + 0.55 * clamp(relative, 0, 1);
}

export interface FanSeasonInput {
  readonly stats: PlayerSeasonStats;
  /** Primeira temporada da carreira: a torcida dá tempo ao garoto e não cai. */
  readonly debutSeason: boolean;
  readonly position: Position;
  readonly contract: Contract;
  readonly fans: number;
  readonly trait: Trait;
  readonly difficulty: Difficulty;
  readonly champion: boolean;
  readonly aboveExpected: boolean;
  readonly relegated: boolean;
}

/**
 * Variação da torcida numa temporada (GDD 17.2). Na primeira temporada da
 * carreira ela só pode subir: é só um jovem. Da segunda em diante, quem não
 * joga ou não rende perde a arquibancada.
 */
export function fanDelta(input: FanSeasonInput): number {
  if (input.debutSeason) return Math.max(0, fanSwing(input));
  return fanSwing(input);
}

function fanSwing(input: FanSeasonInput): number {
  const { stats, contract } = input;
  if (stats.games === 0) return -10;
  const team = input.relegated ? -8 : input.champion ? 3 : input.aboveExpected ? 2 : 0;
  let delta =
    16 * (seasonPerformance(stats, input.position) - 0.5) +
    5 * stats.titleImportance +
    TRAIT_EFFECTS[input.trait].fansPerSeason -
    contract.demand +
    team;
  if (delta < 0) delta *= contract.pressure * DIFFICULTY_DROPS[input.difficulty];
  else delta *= clamp((100 - input.fans) / 50, 0.3, 1);
  return delta;
}

// ------------------------------------------------------------------- legado

/** Pontos de legado de uma temporada no clube (GDD 17.4). */
export function legacySeasonPoints(stats: PlayerSeasonStats, fans: number, trait: Trait): number {
  const points =
    4 * stats.participation + 10 * stats.titleImportance + 2 * stats.awards.won.length + (fans >= 80 ? 3 : 0);
  return points * TRAIT_EFFECTS[trait].legacy;
}

export function legacyLevel(points: number, seasons: number, prestige: number): LegacyLevel {
  if (points >= 45 + 10 * prestige && seasons >= 4) return "legend";
  if (points >= 22 + 5 * prestige && seasons >= 2) return "idol";
  if (points >= 8 + 2 * prestige) return "respected";
  return "none";
}

/** Meia ofensiva e ataque: quem pode vestir a 10 (GDD 18.3, evento 11). */
export function canWearTen(position: Position): boolean {
  const group = GROUP_OF[position];
  return group === "attacker" || group === "attackingMid" || position === "cm";
}
