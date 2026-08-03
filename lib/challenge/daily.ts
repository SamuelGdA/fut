import { COUNTRIES } from "@/lib/data/dataset";
import { ALL_POSITIONS, type Difficulty, type GameMode, type PositionCode } from "@/lib/sim/constants";
import { createRng, nextInt } from "@/lib/sim/rng";
import type { CareerState } from "@/lib/sim/career";
import { buildCareerMetrics } from "./metrics";
import { MISSIONS, missionById, type Mission } from "./missions";

/**
 * The daily challenge: the same hand dealt to everyone, so the only thing left
 * to compare is the decisions.
 *
 * Everything the simulation would otherwise randomise has to be pinned, not
 * just the seed — nationality and position decide starting attributes, which
 * clubs come calling and what the international path looks like, so leaving
 * them to the player would make two runs incomparable. Only cosmetics
 * (surname, avatar, dominant foot) stay free, because they touch nothing.
 */

/** Challenges are always played on the unforgiving ruleset. */
export const CHALLENGE_DIFFICULTY: Difficulty = "hard";
/** Fixed pacing too, or a player on Intensa would get more decisions than one on Normal. */
export const CHALLENGE_MODE: GameMode = "normal";

/**
 * Only nations whose league the dataset actually simulates.
 *
 * An earlier pool included the likes of Portugal and Denmark, which have a
 * national team here but no domestic competition — so a career there begins
 * abroad and can never win a home title. Measurement caught it: a
 * "domestic dominance" day dealt to a Dane scored zero for every strategy
 * tried, because there was no league to dominate.
 */
const CHALLENGE_NATION_POOL = [
  "BR", "AR", "ES", "FR", "DE", "IT", "GB-ENG", "UY",
  "CO", "CL", "MX", "US", "PE", "EC", "PY", "VE", "BO",
];

/** UTC-anchored so the challenge turns over at the same instant everywhere. */
export function todayChallengeId(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function challengeSeed(challengeId: string): string {
  return `craque-daily:${challengeId}`;
}

export interface DailyChallenge {
  id: string;
  seed: string;
  mission: Mission;
  countryIso: string;
  position: PositionCode;
}

function shuffled<T>(items: T[], seed: string): T[] {
  const out = [...items];
  let rng = createRng(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const pick = nextInt(rng, 0, i);
    rng = pick.rng;
    [out[i], out[pick.value]] = [out[pick.value], out[i]];
  }
  return out;
}

/**
 * The order missions are dealt in, for one cycle of the full list.
 *
 * Shuffling each cycle independently would let a mission close one cycle and
 * open the next — a two-day repeat, which is exactly what a daily is supposed
 * to avoid. So the list is split in half by *where it appeared last cycle*:
 * anything from the back half has to land in the back half again, and the
 * same for the front. That guarantees at least half a cycle between repeats
 * while still reordering enough that the sequence never feels memorised.
 */
function cycleOrder(cycle: number): string[] {
  const base = shuffled(MISSIONS.map((m) => m.id), "mission-base");
  if (cycle === 0) return base;

  let previous = base;
  for (let c = 1; c <= cycle; c += 1) {
    const half = Math.ceil(previous.length / 2);
    const front = shuffled(previous.slice(0, half), `mission-front:${c}`);
    const back = shuffled(previous.slice(half), `mission-back:${c}`);
    previous = [...front, ...back];
  }
  return previous;
}

function missionForDay(dayIndex: number): Mission {
  const cycle = Math.floor(dayIndex / MISSIONS.length);
  const offset = dayIndex % MISSIONS.length;
  return missionById(cycleOrder(cycle)[offset]) ?? MISSIONS[0];
}

const GOALKEEPER: PositionCode[] = ["GK"];
const ATTACKERS: PositionCode[] = ["ST", "LW", "RW", "CAM"];
const OUTFIELD: PositionCode[] = ALL_POSITIONS.filter((p) => p !== "GK");

/** Positions that can plausibly satisfy a given mission. */
function positionsFor(mission: Mission): PositionCode[] {
  if (mission.role === "goalkeeper") return GOALKEEPER;
  if (mission.role === "attacker") return ATTACKERS;
  if (mission.role === "outfield") return OUTFIELD;
  // "any" still avoids keepers most of the time: a keeper can technically chase
  // most missions, but the position is different enough that always allowing it
  // would make a third of days feel like a separate game.
  return ALL_POSITIONS;
}

function daysSinceEpoch(challengeId: string): number {
  return Math.floor(Date.parse(`${challengeId}T00:00:00Z`) / 86_400_000);
}

export function getDailyChallenge(challengeId: string = todayChallengeId()): DailyChallenge {
  const seed = challengeSeed(challengeId);
  const mission = missionForDay(daysSinceEpoch(challengeId));

  // The mission is chosen first and the position drawn from what can actually
  // satisfy it — dealing a clean-sheet brief to a striker would guarantee an
  // all-zero day.
  const allowed = positionsFor(mission);
  const rng = createRng(`${seed}:setup`);
  const nationPick = nextInt(rng, 0, CHALLENGE_NATION_POOL.length - 1);
  const positionPick = nextInt(nationPick.rng, 0, allowed.length - 1);
  const countryIso = CHALLENGE_NATION_POOL[nationPick.value];

  return {
    id: challengeId,
    seed,
    mission,
    // Fall back to Brazil only if the dataset ever loses one of the pool.
    countryIso: COUNTRIES.some((c) => c.iso_alpha2 === countryIso) ? countryIso : "BR",
    position: allowed[positionPick.value],
  };
}

export interface ChallengeResult {
  /** 0–1000, graded. */
  score: number;
  /** Raw mission progress, in the mission's own unit. */
  progress: number;
  target: number;
  /** True when the mission's hard rule survived the whole career. */
  cleanRun: boolean;
}

/** Score a run that broke the mission's rule can never exceed. */
const BROKEN_RULE_CEILING = 400;

/**
 * Grades a finished career against the day's mission.
 *
 * The curve is deliberately not linear: the last stretch towards the target is
 * worth more than the first, so a run that nearly gets there is clearly ahead
 * of one that got halfway. Past the target the score keeps climbing, slowly —
 * beating the brief should still be worth something, or the best players all
 * tie on 1000 and the leaderboard stops meaning anything.
 */
export function scoreChallenge(career: CareerState, mission: Mission): ChallengeResult {
  const metrics = buildCareerMetrics(career);
  const progress = Math.max(0, mission.progress(metrics));
  const cleanRun = mission.rule ? mission.rule(metrics) : true;

  const ratio = progress / mission.target;
  const base =
    ratio <= 1
      ? Math.pow(ratio, 1.35) * 850
      : 850 + Math.min(150, Math.log2(ratio) * 180);

  const capped = cleanRun ? base : Math.min(BROKEN_RULE_CEILING, base);
  return {
    score: Math.round(Math.max(0, capped)),
    progress: Math.round(progress),
    target: mission.target,
    cleanRun,
  };
}
