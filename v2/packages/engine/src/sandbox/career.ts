import { CLUBS, type CountryCode, getCountry, PLAYABLE_COUNTRIES } from "@craque/world";
import { focusDueAt, type TrainingFocus } from "../evolution/training";
import { attributesAt, createPlayer, ovrAt, type Player } from "../player/player";
import type { Position } from "../player/positions";
import { stream } from "../rng";
import { recordTally } from "../records/pressure";
import { simulatePlayerSeason, type PlayerSeasonStats } from "../season/playerSeason";
import { type Difficulty, FIRST_AGE, LAST_AGE, type Pace, SEASONS_PER_PERIOD, type Six } from "../types";
import { CONFEDERATION_CLUBS, COUNTRY_CLUBS } from "../world/model";
import { createWorld } from "../world/season";
import type { WorldState } from "../world/types";
import { chooseFocus, type ClubPolicy, type FocusPolicy } from "./development";

/**
 * Caixa de areia da carreira (M3): o jogador atravessa o mundo simulado, com
 * clubes reais, copas, continentais, seleção e prêmios. Só a escolha de clube
 * ainda é automática, por uma política fixa, até o mercado chegar (M4).
 *
 * Usada pelo harness e pelo laboratório. O jogo nunca roda a caixa de areia.
 */

/**
 * Onde o jogador procura clube.
 * - `home`: no próprio país (ou na confederação, se o país não tem liga).
 * - `europe`: em casa até um OVR de 75, depois só na UEFA.
 * - `world`: em qualquer lugar.
 */
export const REGIONS = ["home", "europe", "world"] as const;
export type Region = (typeof REGIONS)[number];

export interface CareerSandboxInput {
  readonly seed: string;
  readonly position: Position;
  readonly nationality: CountryCode;
  readonly difficulty: Difficulty;
  readonly pace: Pace;
  readonly clubPolicy: ClubPolicy;
  readonly region: Region;
  readonly focusPolicy: FocusPolicy;
  readonly startYear?: number;
  readonly fans?: number;
}

export interface CareerSandboxRun {
  readonly input: CareerSandboxInput;
  readonly born: Player;
  readonly ovrAtStart: number;
  readonly seasons: readonly PlayerSeasonStats[];
  readonly final: Player;
  readonly world: WorldState;
}

const EUROPE_FROM = 75;

function homeClubs(nationality: CountryCode): readonly number[] {
  if ((PLAYABLE_COUNTRIES as readonly string[]).includes(nationality)) return COUNTRY_CLUBS.get(nationality) ?? [];
  const confederation = getCountry(nationality)?.confederation;
  const near = confederation ? (CONFEDERATION_CLUBS.get(confederation) ?? []) : [];
  return near.length > 0 ? near : CLUBS.map((_, index) => index);
}

function candidates(region: Region, nationality: CountryCode, ovr: number): readonly number[] {
  if (region === "world") return CLUBS.map((_, index) => index);
  if (region === "europe" && ovr >= EUROPE_FROM) return CONFEDERATION_CLUBS.get("UEFA") ?? [];
  return homeClubs(nationality);
}

function targetStrength(policy: ClubPolicy, ovr: number, roll: number): number {
  const between = (low: number, high: number) => low + (high - low) * roll;
  if (policy === "minutes") return ovr + between(-5, -3);
  if (policy === "ambitious") return ovr + between(3, 7);
  if (policy === "random") return ovr + between(-8, 6);
  return ovr + between(-3, 1);
}

/**
 * O clube do período: o mais perto da força-alvo entre os da região, sorteado
 * entre os três mais perto. Fica onde está se o clube atual ainda serve.
 */
function chooseClub(
  world: WorldState,
  input: CareerSandboxInput,
  ovr: number,
  current: string | null,
  roll: () => number,
): string {
  const pool = candidates(input.region, input.nationality, ovr);
  const target = targetStrength(input.clubPolicy, ovr, roll());
  const pick = roll();
  if (current) {
    const index = CLUBS.findIndex((club) => club.id === current);
    const stillFits = pool.includes(index) && Math.abs((world.strength[index] ?? 0) - target) <= 3;
    if (stillFits) return current;
  }
  const ranked = [...pool].sort(
    (a, b) => Math.abs((world.strength[a] ?? 0) - target) - Math.abs((world.strength[b] ?? 0) - target) || a - b,
  );
  const shortlist = ranked.slice(0, 3);
  const chosen = shortlist[Math.min(shortlist.length - 1, Math.floor(pick * shortlist.length))] ?? ranked[0] ?? 0;
  return CLUBS[chosen]?.id ?? CLUBS[0]?.id ?? "";
}

export function runCareerSandbox(input: CareerSandboxInput): CareerSandboxRun {
  const startYear = input.startYear ?? 2026;
  const fans = input.fans ?? 60;
  const born = createPlayer({ seed: input.seed, position: input.position, difficulty: input.difficulty });
  const policyRng = stream(input.seed, "policy", "career");
  const roll = () => policyRng.next();
  const periodLength = SEASONS_PER_PERIOD[input.pace];

  let world = createWorld(input.seed, startYear);
  let player = born;
  let club: string | null = null;
  let focus: TrainingFocus | null = null;
  let focusAge: number | null = null;
  let periodStart: Six | null = null;
  const seasons: PlayerSeasonStats[] = [];

  for (let age = FIRST_AGE; age <= LAST_AGE; age += 1) {
    const index = age - FIRST_AGE;
    if (index % periodLength === 0) {
      club = chooseClub(world, input, ovrAt(player, age), club, roll);
      // O foco segue a regra do jogo: dos 17 aos 31, a cada quatro anos ou mais.
      const chosen = chooseFocus(input.focusPolicy, player, roll);
      focus = chosen !== null && focusDueAt(input.seed, age, focusAge) ? chosen : null;
      if (focus) focusAge = age;
      periodStart = attributesAt(player, age);
    }
    const startsPeriod = index % periodLength === 0;
    if (!club) throw new Error("caixa de areia: sem clube");

    const endsPeriod = (index + 1) % periodLength === 0 || age === LAST_AGE;
    const season = simulatePlayerSeason({
      seed: input.seed,
      world,
      player,
      age,
      nationality: input.nationality,
      club,
      difficulty: input.difficulty,
      fans,
      focus: startsPeriod ? focus : null,
      guarantee: endsPeriod && focus && periodStart ? { focus, start: periodStart } : undefined,
      tally: recordTally(seasons),
    });
    world = season.world;
    player = season.player;


    const ovr = ovrAt(player, age);
    seasons.push({ ...season.stats, ovrEnd: ovr, attributes: attributesAt(player, age) });
  }

  return {
    input,
    born,
    ovrAtStart: ovrAt(born, FIRST_AGE),
    seasons,
    final: player,
    world,
  };
}
