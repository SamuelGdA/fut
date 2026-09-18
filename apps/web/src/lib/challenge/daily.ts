import { COUNTRIES } from "@craque/data";
import { ALL_POSITIONS, type Difficulty, type GameMode, type PositionCode } from "@/lib/sim/constants";
import { createRng, nextInt } from "@/lib/sim/rng";
import type { CareerState } from "@/lib/sim/career";
import { buildCareerMetrics, type CareerMetrics } from "./metrics";
import { MISSIONS, missionById, type Mission, type MissionAxis } from "./missions";
import { EDICTS, edictById, type Edict } from "./edicts";

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
  countryIso: string;
  position: PositionCode;
  /**
   * The two briefs on the table from kick-off, and the one nobody sees until
   * the career is already half spent.
   */
  openMissions: [Mission, Mission];
  hiddenMission: Mission;
  /** The move that is off the board today. */
  edict: Edict;
}

/** All three briefs in dealing order — the hidden one last. */
export function challengeMissions(challenge: DailyChallenge): Mission[] {
  return [...challenge.openMissions, challenge.hiddenMission];
}

/**
 * The age the third brief is revealed.
 *
 * Late enough that the player has already committed — a first club, probably a
 * first move — so it cannot be planned for from the menu screen, and early
 * enough that there is still a career left to change course with.
 */
export const HIDDEN_REVEAL_AGE = 25;

/**
 * The earliest a challenge career can be walked away from.
 *
 * Under `CHALLENGE_MODE` a period is a season, so this leaves roughly a
 * decade in which stopping is a live option. Before it, "should I retire" is
 * not a real question and offering it would only be noise.
 */
export const BANK_MIN_AGE = 27;

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

const GOALKEEPER: PositionCode[] = ["GK"];
const ATTACKERS: PositionCode[] = ["ST", "LW", "RW", "CAM"];
const OUTFIELD: PositionCode[] = ALL_POSITIONS.filter((p) => p !== "GK");

/** Positions that can plausibly satisfy a given mission. */
function positionsFor(mission: Mission): PositionCode[] {
  if (mission.role === "goalkeeper") return GOALKEEPER;
  if (mission.role === "attacker") return ATTACKERS;
  if (mission.role === "outfield") return OUTFIELD;
  return ALL_POSITIONS;
}

/**
 * Whether two of the three briefs cancel each other out.
 *
 * Different axes were meant to guarantee the hand pulls three different ways,
 * and mostly they do — but not always. "Never transfer" is loyalty and "win a
 * league in three countries" is journey, so the axis rule let them be dealt
 * together, and holding one made the other arithmetically impossible. A hand
 * should be a choice between three things worth chasing, never a slot that was
 * dead before the first kick.
 */
function handHasContradiction(hand: Mission[]): boolean {
  for (const mission of hand) {
    for (const other of hand) {
      if (mission === other) continue;
      if (mission.excludes?.includes(other.id)) return true;
    }
  }
  return false;
}

/** Positions that satisfy every brief on the table at once. */
function sharedPositions(missions: Mission[]): PositionCode[] {
  return ALL_POSITIONS.filter((p) => missions.every((m) => positionsFor(m).includes(p)));
}

function daysSinceEpoch(challengeId: string): number {
  return Math.floor(Date.parse(`${challengeId}T00:00:00Z`) / 86_400_000);
}

/**
 * Deals the day's hand.
 *
 * Three constraints, in order of importance. The three briefs must come from
 * three different axes, or "pick the best two" is not a sacrifice — it is just
 * a wider net. There has to be at least one position that can chase all three,
 * or the day starts with a guaranteed zero. And the edict must not make any of
 * the three literally impossible: hard is the point, unwinnable is a bug.
 *
 * Everything is drawn off the date, so every player in the world gets the same
 * hand, and the search is deterministic rather than random-until-it-fits.
 */
export function getDailyChallenge(challengeId: string = todayChallengeId()): DailyChallenge {
  const seed = challengeSeed(challengeId);
  const day = daysSinceEpoch(challengeId);

  // A per-day shuffle of the whole pool. Walking it in order and taking the
  // first hand that satisfies every constraint gives a stable answer without
  // ever looping forever.
  const pool = shuffled(MISSIONS.map((m) => m.id), `${seed}:pool`)
    .map((id) => missionById(id))
    .filter((m): m is Mission => Boolean(m));
  const edicts = shuffled(EDICTS.map((e) => e.id), `${seed}:edicts`)
    .map((id) => edictById(id))
    .filter((e): e is Edict => Boolean(e));

  let chosen: Mission[] | null = null;
  let chosenEdict: Edict | null = null;

  outer: for (let a = 0; a < pool.length && !chosen; a += 1) {
    for (let b = a + 1; b < pool.length; b += 1) {
      for (let c = b + 1; c < pool.length; c += 1) {
        const hand = [pool[a], pool[b], pool[c]];
        const axes = new Set<MissionAxis>(hand.map((m) => m.axis));
        if (axes.size < 3) continue;
        if (sharedPositions(hand).length === 0) continue;
        if (handHasContradiction(hand)) continue;

        const edict = edicts.find((e) => !hand.some((m) => e.conflictsWith?.(m) ?? false));
        if (!edict) continue;

        chosen = hand;
        chosenEdict = edict;
        break outer;
      }
    }
  }

  // Cannot happen with the current pools, but a day with no legal hand must
  // still be playable rather than throwing on the front page.
  const hand = chosen ?? [pool[0], pool[1], pool[2]];
  const edict = chosenEdict ?? edicts[0] ?? EDICTS[0];

  // Which of the three is held back rotates by day, so the same hand would
  // still play differently.
  const hiddenIndex = day % 3;
  const hidden = hand[hiddenIndex];
  const open = hand.filter((_, i) => i !== hiddenIndex);

  const allowed = sharedPositions(hand);
  const rng = createRng(`${seed}:setup`);
  const nationPick = nextInt(rng, 0, CHALLENGE_NATION_POOL.length - 1);
  const positionPick = nextInt(nationPick.rng, 0, Math.max(0, allowed.length - 1));
  const countryIso = CHALLENGE_NATION_POOL[nationPick.value];

  return {
    id: challengeId,
    seed,
    // Fall back to Brazil only if the dataset ever loses one of the pool.
    countryIso: COUNTRIES.some((c) => c.iso_alpha2 === countryIso) ? countryIso : "BR",
    position: allowed[positionPick.value] ?? "CM",
    openMissions: [open[0], open[1]],
    hiddenMission: hidden,
    edict,
  };
}

export interface MissionScore {
  missionId: string;
  progress: number;
  target: number;
  /** 0–500 for this brief on its own. */
  points: number;
  /** Whether this one made the cut into the final score. */
  counted: boolean;
}

export interface ChallengeResult {
  /** 0–1000, graded. */
  score: number;
  /** Every brief, so the summary can show the one that was sacrificed. */
  missions: MissionScore[];
  /** True when the day's edict survived the whole career. */
  edictHeld: boolean;
  edictId: string;
  /** Seasons played after the peak that cost points, and what they cost. */
  fadedSeasons: number;
  twilightMultiplier: number;
  /** The card the run peaked at, and the points it was worth. */
  peakOverall: number;
  peakPoints: number;
}

/** What a run that broke the edict keeps of its score. */
const BROKEN_EDICT_MULTIPLIER = 0.35;
/** Each faded season past the peak shaves this much off the total. */
const TWILIGHT_DECAY = 0.96;
/** How far below the peak a season has to fall before it counts as faded. */
const FADE_THRESHOLD = 4;
/** Points a single brief is worth at full marks. Two are counted. */
const MISSION_POINTS = 400;

/**
 * What the card itself is worth, on top of the briefs.
 *
 * Completing the day's hand is most of the score, but not all of it: a run
 * that ticked every box with a 78-rated player has not done the same thing
 * as one that ticked them with a 99. Without this the ceiling was reachable
 * on briefs alone, and how good the player actually became did not enter
 * into it at all.
 *
 * The curve is steep on purpose. The last few points of overall are the
 * hardest thing in the game to buy, so they should be where the last few
 * points of the score live — a perfect thousand needs both briefs maxed, an
 * unbroken edict, no faded seasons *and* a 99.
 */
const PEAK_POINTS = 200;
/** Below this the card contributes nothing; the scale runs from here to 99. */
const PEAK_FLOOR = 70;
const PEAK_CURVE = 1.5;

function peakOverallPoints(peakOverall: number): number {
  const span = 99 - PEAK_FLOOR;
  const reach = Math.max(0, Math.min(1, (peakOverall - PEAK_FLOOR) / span));
  return PEAK_POINTS * Math.pow(reach, PEAK_CURVE);
}

/** How much of a brief was delivered, 0 to MISSION_POINTS. */
function scoreMission(mission: Mission, metrics: CareerMetrics): MissionScore {
  const progress = Math.max(0, mission.progress(metrics));
  const ratio = progress / mission.target;
  // Deliberately not linear: the last stretch towards the target is worth more
  // than the first, so nearly getting there clearly beats getting halfway.
  // Past the target it keeps climbing slowly, or every strong run ties.
  const points =
    ratio <= 1
      ? Math.pow(ratio, 1.35) * (MISSION_POINTS * 0.85)
      : MISSION_POINTS * 0.85 + Math.min(MISSION_POINTS * 0.15, Math.log2(ratio) * 90);
  return {
    missionId: mission.id,
    progress: Math.round(progress),
    target: mission.target,
    points: Math.round(Math.max(0, points)),
    counted: false,
  };
}

/**
 * Grades a finished career against the day's hand.
 *
 * Three things decide the number, and each is a decision the player made.
 *
 * Only the best two briefs count, so chasing all three is the losing line and
 * the real question is which one to abandon. The edict is all-or-nothing at
 * the end of the career, because a rule you can partially keep is not a rule.
 * And every season played after the player was visibly finished shaves the
 * total, which is what turns "one more year" into a gamble instead of a
 * freebie — more seasons still earn more progress, so pushing on can be right,
 * it just has to be paid for.
 */
export function scoreChallenge(career: CareerState, challenge: DailyChallenge): ChallengeResult {
  const metrics = buildCareerMetrics(career);
  const missions = challengeMissions(challenge).map((m) => scoreMission(m, metrics));

  const ranked = [...missions].sort((a, b) => b.points - a.points);
  for (const entry of ranked.slice(0, 2)) entry.counted = true;
  const raw = ranked.slice(0, 2).reduce((sum, m) => sum + m.points, 0);

  const edictHeld = challenge.edict.holds(metrics);

  // Seasons after the peak spent visibly past it. Judged on the card, not on
  // age, so a player who held their level to 38 is never punished for it.
  let fadedSeasons = 0;
  for (const season of career.seasons) {
    if (season.age <= metrics.peakAge) continue;
    if (season.overall <= metrics.peakOverall - FADE_THRESHOLD) fadedSeasons += 1;
  }
  const twilightMultiplier = Math.pow(TWILIGHT_DECAY, fadedSeasons);

  // The card counts too, and it is subject to the same penalties: a broken
  // edict or a career dragged past its peak devalues the whole run, not just
  // the part of it that came from the briefs.
  const peakPoints = peakOverallPoints(metrics.peakOverall);
  const total =
    (raw + peakPoints) * (edictHeld ? 1 : BROKEN_EDICT_MULTIPLIER) * twilightMultiplier;

  return {
    score: Math.round(Math.max(0, total)),
    missions,
    edictHeld,
    edictId: challenge.edict.id,
    fadedSeasons,
    twilightMultiplier,
    peakOverall: metrics.peakOverall,
    peakPoints: Math.round(peakPoints),
  };
}

export interface TwilightStatus {
  fadedSeasons: number;
  /** What the final score is multiplied by if the career ended right now. */
  multiplier: number;
}

/**
 * The same faded-season count `scoreChallenge` uses, exposed for the live HUD.
 *
 * The two only ever agreed at the final summary before this existed — during
 * play there was no way to see the decay building up, so "one more season"
 * always looked free even after it stopped being free. A run that finished at
 * 727 instead of a clean 967 lost that quarter entirely to seasons played
 * after every brief was already maxed, with nothing on screen warning it was
 * happening.
 */
export function liveTwilightStatus(career: CareerState, metrics: CareerMetrics): TwilightStatus {
  let fadedSeasons = 0;
  for (const season of career.seasons) {
    if (season.age <= metrics.peakAge) continue;
    if (season.overall <= metrics.peakOverall - FADE_THRESHOLD) fadedSeasons += 1;
  }
  return { fadedSeasons, multiplier: Math.pow(TWILIGHT_DECAY, fadedSeasons) };
}
