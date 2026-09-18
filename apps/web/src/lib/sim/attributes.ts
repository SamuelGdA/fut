import { chance, clamp, nextFloat, type Rng } from "./rng";
import { ROLE_ELITE_RATES, ROLE_POSITIONS, type PlayerRole, type PositionCode } from "./constants";
import type { SeasonStats } from "./engine";

/**
 * EA FC-style six-attribute card. Outfield players and goalkeepers use
 * different stat sets, but both resolve to a single weighted OVR so the rest
 * of the simulation (offers, trophies, market value) keeps working unchanged.
 */

export type OutfieldAttributeKey = "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical";
export type GoalkeeperAttributeKey = "diving" | "handling" | "kicking" | "reflexes" | "speed" | "positioning";
export type AttributeKey = OutfieldAttributeKey | GoalkeeperAttributeKey;

export type Attributes = Record<AttributeKey, number>;

export const OUTFIELD_KEYS: OutfieldAttributeKey[] = [
  "pace", "shooting", "passing", "dribbling", "defending", "physical",
];

export const GOALKEEPER_KEYS: GoalkeeperAttributeKey[] = [
  "diving", "handling", "kicking", "reflexes", "speed", "positioning",
];

/** Short labels printed on the card, matching the Portuguese EA FC abbreviations. */
export const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  pace: "RIT",
  shooting: "FIN",
  passing: "PAS",
  dribbling: "CON",
  defending: "DEF",
  physical: "FÍS",
  diving: "ELA",
  handling: "MAN",
  kicking: "CHU",
  reflexes: "REF",
  speed: "VEL",
  positioning: "POS",
};

export function attributeKeysFor(position: PositionCode): AttributeKey[] {
  return position === "GK" ? GOALKEEPER_KEYS : OUTFIELD_KEYS;
}

// ---------------------------------------------------------------------------
// OVR weights
// ---------------------------------------------------------------------------

type WeightMap = Partial<Record<AttributeKey, number>>;

/**
 * How much each attribute contributes to the card, per position. Each row
 * sums to 1.
 *
 * Fitted against real cards from the game this one is modelled on rather
 * than chosen by feel, and the fit is what forced the shape: off-position
 * attributes carry *zero*. An elite striker rated 91 there has 29 defending
 * and nobody docks him for it; a centre-back rated 88 has 41 shooting. Every
 * version of this table that taxed a card for the stats its position never
 * uses was wrong in the same direction, and wrong most for the players with
 * the most lopsided cards: Harry Kane came out ten points light because his
 * pace is 62.
 */
const OVR_WEIGHTS: Record<PositionCode, WeightMap> = {
  ST:  { shooting: 0.45, dribbling: 0.20, physical: 0.16, passing: 0.11, pace: 0.08 },
  LW:  { dribbling: 0.34, shooting: 0.24, passing: 0.20, pace: 0.14, physical: 0.08 },
  RW:  { dribbling: 0.34, shooting: 0.24, passing: 0.20, pace: 0.14, physical: 0.08 },
  CAM: { passing: 0.32, dribbling: 0.30, shooting: 0.22, pace: 0.09, physical: 0.07 },
  LM:  { dribbling: 0.33, passing: 0.27, shooting: 0.20, pace: 0.15, physical: 0.05 },
  RM:  { dribbling: 0.33, passing: 0.27, shooting: 0.20, pace: 0.15, physical: 0.05 },
  CM:  { passing: 0.36, dribbling: 0.30, defending: 0.12, physical: 0.09, shooting: 0.08, pace: 0.05 },
  CDM: { defending: 0.32, passing: 0.27, physical: 0.19, dribbling: 0.15, pace: 0.04, shooting: 0.03 },
  LB:  { defending: 0.26, pace: 0.20, passing: 0.20, dribbling: 0.16, physical: 0.14, shooting: 0.04 },
  RB:  { defending: 0.26, pace: 0.20, passing: 0.20, dribbling: 0.16, physical: 0.14, shooting: 0.04 },
  CB:  { defending: 0.48, physical: 0.27, passing: 0.12, dribbling: 0.07, pace: 0.06 },
  // Kicking is weighted above what the fit alone wants. It moves a keeper's
  // overall very little either way, but the same number sets his ceiling,
  // and at 0.06 the game capped kicking seventeen points under the overall
  // while real keepers are within six of it.
  GK:  { reflexes: 0.29, diving: 0.25, positioning: 0.19, handling: 0.16, kicking: 0.11 },
};

/**
 * What the reference game adds on top of the weighted average.
 *
 * Its overall is computed from roughly thirty-five sub-attributes, not from
 * the six the card prints, and several of the ones it leans on hardest
 * (reactions, composure, interceptions, positioning) are not visible on the
 * face of the card at all. The net effect is a systematic offset: a real
 * card sits a few points above the weighted average of its own six numbers,
 * and the offset is larger in midfield, where the invisible attributes carry
 * the most weight, and near zero in goal, where the six printed stats *are*
 * the ones the overall is built from.
 *
 * Modelling that as a constant per position reproduces all twenty-three
 * reference cards to within 1.7 points, which is closer than the year-to-year
 * drift in the source.
 */
const OVR_BONUS: Record<PositionCode, number> = {
  ST: 3.6, LW: 3.6, RW: 3.6, LM: 3.0, RM: 3.0,
  CAM: 5.0, CM: 5.0, CDM: 6.0,
  CB: 4.1, LB: 3.2, RB: 3.2,
  GK: 1.0,
};
export function ovrWeights(position: PositionCode): WeightMap {
  return OVR_WEIGHTS[position];
}

/** Weighted average of the attributes this position is rated on, plus its bonus. */
export function computeOverall(attributes: Attributes, position: PositionCode): number {
  return weightedAverage(attributes, position) + OVR_BONUS[position];
}

/** The card without the bonus, which is the space every cap and shift works in. */
function weightedAverage(attributes: Attributes, position: PositionCode): number {
  const weights = OVR_WEIGHTS[position];
  let sum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    sum += (attributes[key as AttributeKey] ?? 0) * (weight ?? 0);
  }
  return sum;
}

function clampAttr(value: number): number {
  return Math.max(1, Math.min(99, value));
}

/**
 * Shifts every attribute by a constant so the weighted average lands exactly
 * on `target`, then repeats a few times to absorb clamping at the edges.
 *
 * Pass `potential` and the edge each attribute clamps against becomes its own
 * ceiling rather than a flat 99. Without it, every trophy season handed a
 * point to all six attributes whether or not they had anywhere left to go,
 * and a decorated generational career simply walked the whole card up to the
 * top of the scale: two thirds of them finished with at least one 99 and the
 * average had nearly two. The rise still happens — it just lands on the parts
 * of the card that can still take it.
 */
export function normalizeToOverall(
  attributes: Attributes,
  position: PositionCode,
  target: number,
  potential?: number,
): Attributes {
  const weights = OVR_WEIGHTS[position];
  let result = { ...attributes };
  const limitOf = (key: AttributeKey) =>
    potential === undefined ? 99 : Math.min(99, attributeCeiling(potential, key, position));

  for (let pass = 0; pass < 6; pass += 1) {
    const current = computeOverall(result, position);
    const gap = target - current;
    if (Math.abs(gap) < 0.01) break;

    // Only attributes that still have headroom in the needed direction can absorb the shift.
    let movableWeight = 0;
    for (const [key, weight] of Object.entries(weights)) {
      const attrKey = key as AttributeKey;
      const value = result[attrKey];
      const canMove = gap > 0 ? value < limitOf(attrKey) : value > 1;
      if (canMove) movableWeight += weight ?? 0;
    }
    if (movableWeight <= 0) break;

    const shift = gap / movableWeight;
    const next = { ...result };
    for (const [key, weight] of Object.entries(weights)) {
      if (!weight) continue;
      const attrKey = key as AttributeKey;
      const value = result[attrKey];
      const limit = limitOf(attrKey);
      const canMove = gap > 0 ? value < limit : value > 1;
      if (canMove) next[attrKey] = Math.min(limit, clampAttr(value + shift));
    }
    result = next;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Starting profiles
// ---------------------------------------------------------------------------

/** Relative flavour of a fresh 16-year-old, before being normalised to the starting OVR. */
const STARTING_SHAPE: Record<PositionCode, WeightMap> = {
  ST:  { pace: 6,  shooting: 8,  passing: -6, dribbling: 2,  defending: -14, physical: 2 },
  LW:  { pace: 10, shooting: 3,  passing: -2, dribbling: 7,  defending: -14, physical: -6 },
  RW:  { pace: 10, shooting: 3,  passing: -2, dribbling: 7,  defending: -14, physical: -6 },
  CAM: { pace: 2,  shooting: 3,  passing: 8,  dribbling: 7,  defending: -12, physical: -6 },
  LM:  { pace: 7,  shooting: 0,  passing: 5,  dribbling: 5,  defending: -8,  physical: -6 },
  RM:  { pace: 7,  shooting: 0,  passing: 5,  dribbling: 5,  defending: -8,  physical: -6 },
  CM:  { pace: 0,  shooting: -3, passing: 8,  dribbling: 4,  defending: 0,   physical: 0 },
  CDM: { pace: -4, shooting: -8, passing: 4,  dribbling: -2, defending: 8,   physical: 6 },
  LB:  { pace: 8,  shooting: -10, passing: 2, dribbling: 0,  defending: 5,   physical: 0 },
  RB:  { pace: 8,  shooting: -10, passing: 2, dribbling: 0,  defending: 5,   physical: 0 },
  CB:  { pace: -4, shooting: -14, passing: -4, dribbling: -8, defending: 10, physical: 9 },
  GK:  { diving: 3, handling: 2, kicking: -6, reflexes: 4, speed: -8, positioning: 2 },
};

export function createStartingAttributes(position: PositionCode, startingOverall: number): Attributes {
  const isGk = position === "GK";
  const base: Attributes = {
    pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
    diving: 50, handling: 50, kicking: 50, reflexes: 50, speed: 50, positioning: 50,
  };

  // A position that isn't in the table would throw on Object.entries and take
  // the whole page down. That is reachable from a persisted draft written by
  // an older build (or edited by hand), so fall back rather than crash.
  const shape = STARTING_SHAPE[position] ?? STARTING_SHAPE.CM;
  for (const [key, offset] of Object.entries(shape)) {
    base[key as AttributeKey] = clampAttr(50 + (offset ?? 0));
  }

  // Unused half of the card sits low, mirroring how EA FC treats GK/outfield splits.
  const unused = isGk ? OUTFIELD_KEYS : GOALKEEPER_KEYS;
  for (const key of unused) base[key] = 12;

  return normalizeToOverall(base, position, startingOverall);
}

// ---------------------------------------------------------------------------
// Growth
// ---------------------------------------------------------------------------
//
// Every attribute grows (or fades) from what the player actually did that
// season — there is no pre-baked OVR target to hit. OVR is purely the
// weighted average of the result. See craque-progression.md for the design
// rationale.

export interface GrowthContext {
  age: number;
  position: PositionCode;
  stats: SeasonStats;
  /** Club domestic reputation 0..5, used as a proxy for defensive solidity. */
  teamReputation: number;
  /** Club international reputation 0..5 — the level you train and compete at. */
  clubLevel: number;
  /** This career's hidden soft ceiling on OVR. */
  potential: number;
  /** OVR entering the season, measured against `potential` to taper growth. */
  overall: number;
  developmentProfile: "early" | "normal" | "late";
  /** Personality multiplier on growth (see TRAIT_EFFECTS). */
  traitGrowth: number;
  /** Personality multiplier on age decline. */
  traitDecline: number;
  /** Fan support 0-100 — a crowd that believes in you is worth a little form. */
  confidence: number;
}

function ratio(value: number, apps: number): number {
  if (apps <= 0) return 0;
  return value / apps;
}

function saturate(value: number, ceiling: number): number {
  if (ceiling <= 0) return 0;
  return Math.max(0, Math.min(1, value / ceiling));
}

/** Early bloomers peak (and fade) a couple of years sooner; late bloomers the opposite. */
function ageCurveShift(age: number, profile: GrowthContext["developmentProfile"]): number {
  if (profile === "early") return age + 2;
  if (profile === "late") return age - 2;
  return age;
}

/** Pace and goalkeeper speed peak in the early twenties and fall away fast. */
function paceAgeFactor(age: number): number {
  if (age <= 18) return 1.7;
  if (age <= 21) return 1.4;
  if (age <= 24) return 1.0;
  if (age <= 27) return 0.6;
  if (age <= 30) return 0.3;
  return 0.1;
}

/** Strength keeps building into the late twenties, then plateaus. */
function physicalAgeFactor(age: number): number {
  if (age <= 18) return 0.8;
  if (age <= 22) return 1.2;
  if (age <= 27) return 1.4;
  if (age <= 31) return 1.0;
  return 0.5;
}

/** Reading the game keeps improving with experience, long after the body slows. */
function experienceFactor(age: number): number {
  if (age <= 20) return 0.6;
  if (age <= 24) return 0.9;
  if (age <= 29) return 1.2;
  return 1.4;
}

/**
 * How much a body still absorbs training at all. This is the master tap on
 * growth: experience decides *which* attributes improve, but past the late
 * twenties there is simply less left to gain, so even the "experience" stats
 * flatten out instead of climbing forever.
 */
function trainability(age: number, potential: number): number {
  const base =
    age <= 19 ? 1.45
    : age <= 22 ? 1.3
    : age <= 25 ? 1.0
    : age <= 28 ? 0.72
    : age <= 31 ? 0.34
    : age <= 34 ? 0.18
    : 0.09;

  // Genuinely exceptional players keep absorbing coaching long after their
  // peers have plateaued — the real reason the all-time greats were still
  // improving at 30. It also gives the rarest talent tiers the longer runway
  // they need to actually reach the ceiling they were promised.
  const retention = clamp((potential - 84) / 15, 0, 1);
  return base + (1 - base) * 0.35 * retention;
}

/**
 * Better clubs coach you better. This is the deliberate counterweight to the
 * fact that bigger clubs also give you fewer minutes: the central strategic
 * question of the whole game becomes "what is the best club where I still
 * actually play?" rather than having one dominant answer.
 */
function coachingFactor(clubLevel: number): number {
  return [0.72, 0.86, 1.0, 1.13, 1.28, 1.44][clamp(Math.round(clubLevel), 0, 5)];
}

/**
 * Output against weak opposition develops you less than the same output
 * against good opposition. Without this the optimal play is to drop to the
 * worst league you can find and farm goals — the goal *rate* model already
 * pays out hugely when you're far above your league — which is both a
 * degenerate strategy and the opposite of how footballers actually develop.
 */
function competitionFactor(clubLevel: number): number {
  return [0.45, 0.62, 0.8, 0.95, 1.08, 1.2][clamp(Math.round(clubLevel), 0, 5)];
}

/**
 * The master brake: growth fades as OVR closes on this career's hidden
 * ceiling. Deliberately never reaches zero, so an exceptional run can nudge
 * past its potential rather than slamming into an invisible wall — a hard cap
 * reads as unfair, a steep taper reads as "I've squeezed out everything there
 * was".
 */
function potentialTaper(overall: number, potential: number): number {
  const room = potential - overall;
  if (room <= 0) return 0.05;
  // Deliberately two-sided: a big gap doesn't just fail to brake, it actively
  // accelerates. Raw talent has to *feel* different to play, not merely allow a
  // higher number twenty seasons later.
  return clamp(room / 16, 0.05, 2.2);
}

/** The same goal is worth far more to a teenager's development than to a veteran's. */
function productionAgeValue(age: number): number {
  if (age <= 19) return 1.4;
  if (age <= 22) return 1.05;
  if (age <= 25) return 0.8;
  if (age <= 28) return 0.6;
  if (age <= 31) return 0.4;
  return 0.25;
}

/**
 * How growth is shared out across a card.
 *
 * Not a straight line in the weight any more. A line made the top attribute
 * grow twice as fast as the second one, so a striker's Finishing ran away
 * while his Dribbling stalled and the card came out 84 overall with 95
 * Finishing and 68 Dribbling. The cards this game is modelled on do not look
 * like that: Haaland is a 91 with 93 Shooting and 80 Dribbling, and his
 * second-best relevant stat is right behind his best.
 *
 * So the curve saturates. Everything the position genuinely uses — anything
 * weighted at or above the knee — grows at full speed, and only the stats the
 * position has no use for fall away. That is what puts a striker's Defending
 * at 40 while keeping his Dribbling within a few points of his Finishing.
 */
const AFFINITY_FLOOR = 0.1;
/**
 * How sharply growth falls away from a position's main attribute. Below 1 so
 * the second and third stats stay close behind the first: the cards this game
 * is modelled on have a striker's Dribbling within a few points of his
 * Finishing, and only his Defending far away.
 */
const AFFINITY_FALLOFF = 0.6;

/**
 * Measured against the position's *own* top weight rather than against an
 * absolute scale. A centre-back's Defending and a striker's Finishing are both
 * the thing that position is for, whatever number the weight table happens to
 * give them, and both should grow fastest on their own card.
 */
function affinityCurve(weight: number, topWeight: number): number {
  const relative = topWeight > 0 ? Math.min(1, weight / topWeight) : 0;
  return AFFINITY_FLOOR + (1 - AFFINITY_FLOOR) * Math.pow(relative, AFFINITY_FALLOFF);
}

/**
 * Because OVR is a weighted average and affinity rises with that same weight,
 * a position's overall growth rate works out proportional to how *concentrated*
 * its weights are. Left alone that hands centre-backs (0.45 on Defending) a
 * huge edge over central midfielders, whose six weights are nearly even — an
 * artefact of the maths rather than a design decision.
 *
 * Normalising by each position's own concentration keeps every role improving
 * at a comparable rate, while still letting the attributes that matter most to
 * a given position grow fastest *within* that card.
 */
const REFERENCE_CONCENTRATION = 0.98;

const AFFINITY_NORMALISER: Record<PositionCode, number> = Object.fromEntries(
  (Object.entries(OVR_WEIGHTS) as [PositionCode, WeightMap][]).map(([position, weights]) => {
    const topWeight = Math.max(...Object.values(weights).map((w) => w ?? 0));
    const aggregate = Object.values(weights).reduce(
      (sum, w) => sum + (w ?? 0) * affinityCurve(w ?? 0, topWeight),
      0,
    );
    return [position, aggregate > 0 ? REFERENCE_CONCENTRATION / aggregate : 1];
  }),
) as Record<PositionCode, number>;

/**
 * How much a position's own affinity for a stat amplifies its growth. A
 * striker's Finishing grows fast; his Defending barely moves — the floor
 * keeps it from being literally zero, but the slope does the real work.
 */
function affinity(weight: number, position: PositionCode): number {
  const weights = OVR_WEIGHTS[position];
  const topWeight = Math.max(...Object.values(weights).map((w) => w ?? 0));
  return affinityCurve(weight, topWeight) * AFFINITY_NORMALISER[position];
}

/**
 * A ceiling isn't flat across the card. A striker capped at 80 should still be
 * allowed to finish above that while defending well below it — that's what
 * makes a card read as the position it plays. The spread follows the position's
 * own OVR weights, so the strongest attribute sits above the ceiling and an
 * irrelevant one sits the same distance below.
 *
 * The number is set against the cards this game is modelled on, where the best
 * *skill* stat lands within a couple of points of the overall and only pace
 * ever runs six clear: Haaland is a 91 with 93 shooting, Lewandowski a 90 with
 * 91, Van Dijk an 89 with 90 defending. At 11 the ceiling let a striker finish
 * eight above his own potential, and the game printed 84-rated cards with 95
 * finishing — internally consistent, and not a card FC would ever print.
 */
const CEILING_SPREAD = 8;

/**
 * The weighted average of `relative` for a position, which is what decides
 * where its *overall* ceiling lands once every attribute has grown out.
 *
 * This has to be subtracted back off, or the spread quietly changes how good
 * each position can ever be. A goalkeeper's weights are nearly flat across
 * its four big attributes, so all four ceilings sat at or above potential and
 * a keeper finished around potential + 9. A striker's weights are steeply
 * graded, so only finishing got the high ceiling and everything else was
 * capped below: potential + 3. Same rolled potential, six OVR apart, purely
 * because of the shape of the weight table — which is why keepers averaged 84
 * peak while strikers averaged 73.
 */
const CEILING_MEAN: Record<PositionCode, number> = (() => {
  const out = {} as Record<PositionCode, number>;
  for (const position of Object.keys(OVR_WEIGHTS) as PositionCode[]) {
    const weights = OVR_WEIGHTS[position];
    const values = Object.values(weights).map((w) => w ?? 0);
    const max = Math.max(...values);
    out[position] = max > 0 ? values.reduce((sum, w) => sum + w * w, 0) / max : 0;
  }
  return out;
})();

/**
 * The gap between a card that has fully grown and one that actually exists.
 *
 * The centring above assumes every attribute reaches its own ceiling, which is
 * what would make a finished card land exactly on its potential. Real cards do
 * not: the stats a position barely uses never get near their ceilings — which
 * is right, and is what gives a striker 40 Defending — so the weighted average
 * settles several points under potential while the one stat the position lives
 * on sits at a ceiling *above* it. That is where 83-rated strikers with 92
 * Finishing came from.
 *
 * Subtracting the shortfall only bites on the attributes that are actually
 * ceiling-bound, which is the handful at the top of the card. The ones far
 * below their cap are limited by growth, not by this, and do not move.
 */
const CEILING_STALL = 2;

function attributeCeiling(potential: number, key: AttributeKey, position: PositionCode): number {
  const weights = OVR_WEIGHTS[position];
  const max = Math.max(...Object.values(weights).map((w) => w ?? 0));
  const relative = max > 0 ? (weights[key] ?? 0) / max : 0;
  // Centred on the position's own weighted mean, so a fully grown card lands
  // on `potential` whatever it plays, while the attributes inside it still
  // spread the way the position demands. `potential` is an overall, and a
  // ceiling is an attribute, so the position's bonus comes back off first:
  // without that every card would grow to its potential *plus* the bonus.
  return clampAttr(
    potential -
      OVR_BONUS[position] +
      CEILING_SPREAD * (relative - CEILING_MEAN[position]) * 2 -
      CEILING_STALL,
  );
}

/**
 * Diminishing returns as an attribute nears *its own* ceiling, so the same
 * season's work buys less the closer you are. This keeps a high attribute
 * feeling earned, and stops one stat running off to 99 while the rest stall.
 *
 * Zero at the ceiling, and it used to be 0.12. That floor meant nothing ever
 * actually stopped: Physical and Pace are the two attributes that grow purely
 * from playing rather than from producing, so they kept collecting a twelfth
 * of a full season's work every year and drifted a dozen points past their cap.
 * That is where the cards with 95 Physical on an 82 centre-back came from — the
 * stat the position cares least about ending up the highest on the card.
 */
/**
 * How far one attribute may run ahead of the card it sits on before its
 * growth starts costing more.
 *
 * The ceiling alone could not hold the shape together. A striker's finishing
 * grows fastest by design, so it arrives at its cap years before the rest of
 * the card arrives at theirs, and a career that peaks eight under its
 * potential still prints a finishing that does not. That is how the game came
 * to show a best stat five points clear of the overall where the cards it is
 * modelled on average two.
 *
 * A brake rather than a cap, and one that never reaches zero: capping an
 * attribute at overall-plus-a-bit deadlocks the whole card, because raising
 * the top stat barely moves a weighted average, so the cap binds on the first
 * season and nothing grows again. An earlier attempt at exactly that dropped
 * peak overall from 78 to 61.
 */
const ATTRIBUTE_LEAD = 6;
const LEAD_DECAY = 10;
const LEAD_FLOOR = 0.2;

function leadBrake(value: number, overall: number): number {
  const lead = value - overall;
  if (lead <= ATTRIBUTE_LEAD) return 1;
  return Math.max(LEAD_FLOOR, 1 - (lead - ATTRIBUTE_LEAD) / LEAD_DECAY);
}

function headroomFactor(value: number, ceiling: number): number {
  return Math.max(0, Math.min(1.5, (ceiling - value) / 26));
}

/** Ageing erodes explosiveness first and game intelligence last. */
const DECLINE_SHARES: Record<AttributeKey, number> = {
  pace: 2.2,
  physical: 1.4,
  dribbling: 1.2,
  shooting: 0.9,
  defending: 0.8,
  passing: 0.5,
  speed: 2.2,
  diving: 1.5,
  reflexes: 1.2,
  handling: 0.8,
  kicking: 0.6,
  positioning: 0.4,
};

/**
 * Production-driven growth is measured *per appearance* and saturates, rather
 * than scaling with the raw season total. Without the ceiling the loop runs
 * away: more Finishing buys more goals, which buys more Finishing, and a
 * career spirals into 70-goal seasons. Saturating it means an outstanding
 * season is rewarded fully, but an absurd one is not rewarded any further.
 */
const ROLE_BY_POSITION: Record<PositionCode, PlayerRole> = Object.fromEntries(
  (Object.entries(ROLE_POSITIONS) as [PlayerRole, PositionCode[]][]).flatMap(([role, positions]) =>
    positions.map((position) => [position, role]),
  ),
) as Record<PositionCode, PlayerRole>;

/**
 * Playing regularly always advances your primary craft, even in a quiet season.
 * Held deliberately high: positions whose growth is production-driven (striker,
 * playmaker) otherwise face a chicken-and-egg — you need output to improve, and
 * you need to be good to produce output — while experience-driven positions
 * (full-back, keeper) grow for free. This is the floor that levels that out.
 */
const PRODUCTION_FLOOR = 1.35;

const GOAL_GROWTH_UNIT = 9.5;
const ASSIST_GROWTH_UNIT = 9.5;
const DRIBBLE_GROWTH_UNIT = 7.0;
/** Ball work happens every day, whatever the scoreline says. */
const DRIBBLE_FLOOR = 1.3;
// Pace and Physical ask nothing of the player but availability, so they are
// kept deliberately cheap. Left level with the earned stats they simply won:
// a centre-back finished with Physical as the highest number on his card 146
// times out of 150, and a striker's Pace outran his Finishing more often than
// not — because scoring goals is conditional on scoring goals, and turning up
// is not.
const PACE_GROWTH_UNIT = 2.6;
const PHYSICAL_GROWTH_UNIT = 3.4;
const DEFENDING_GROWTH_UNIT = 5.6;
// Scaled up once, for a keeper's flat weight table, and then scaled up again
// by AFFINITY_NORMALISER, which exists to do exactly that. Paid twice, a
// keeper finished on his potential while every outfield position finished
// eight short of it.
const KEEPER_GROWTH_UNIT = 2.5;

/**
 * What the player earned this season, per attribute, before ageing decline
 * and the headroom taper are applied. Everything here is driven by what
 * actually happened on the pitch (or, for GK, the ported clean-sheet logic).
 */
function growthTriggers(context: GrowthContext): Partial<Record<AttributeKey, number>> {
  const { position, stats, teamReputation, developmentProfile } = context;
  const age = ageCurveShift(context.age, developmentProfile);
  const weights = OVR_WEIGHTS[position];
  const apps = stats.appearances;
  // Minutes matter, but a squad player still trains with the group all week, so
  // the curve has a floor rather than running to zero. Without it, playing time
  // swamps every other input and "join the weakest club that will start me"
  // becomes the only correct move in the game.
  const appsFactor = apps <= 0 ? 0 : 0.35 + 0.65 * saturate(apps, 32);

  if (position === "GK") {
    const cleanSheetRate = saturate(ratio(stats.cleanSheets, apps), 0.45);
    const concededRate = saturate(ratio(stats.goalsConceded, apps), 2.2);
    const solidity = 1 - concededRate;
    // A keeper's card is six near-equally weighted stats, so each one carries
    // less affinity than a striker's Finishing does. Their unit is scaled up to
    // compensate, otherwise keepers structurally cap out far below outfielders.
    return {
      diving: affinity(weights.diving ?? 0, position) * KEEPER_GROWTH_UNIT * (0.7 + 1.8 * cleanSheetRate) * appsFactor,
      reflexes:
        affinity(weights.reflexes ?? 0, position) *
        KEEPER_GROWTH_UNIT *
        (0.7 + 1.6 * cleanSheetRate + 0.5 * solidity) *
        appsFactor,
      // Positioning grows with experience, exactly like outfield defending.
      positioning:
        affinity(weights.positioning ?? 0, position) *
        KEEPER_GROWTH_UNIT *
        1.4 *
        experienceFactor(age) *
        // Reading the game is the keeper's own work. Behind a leaky defence
        // he gets *more* practice at it, not less, so the term the team
        // contributes is deliberately the smaller half.
        (0.78 + 0.42 * solidity) *
        appsFactor,
      handling: affinity(weights.handling ?? 0, position) * KEEPER_GROWTH_UNIT * (0.8 + 1.0 * appsFactor),
      // Distribution is drilled every day of the week, so it grows from
      // playing rather than from the assists a keeper almost never gets.
      // Tying it to assists alone left kicking as the one stat on the card
      // that never moved.
      kicking:
        affinity(weights.kicking ?? 0, position) *
        KEEPER_GROWTH_UNIT *
        (1.0 + 0.9 * appsFactor + 0.6 * saturate(ratio(stats.assists, apps), 0.08) + 0.3 * (teamReputation / 5)),
      speed: affinity(weights.speed ?? 0, position) * PACE_GROWTH_UNIT * paceAgeFactor(age) * (0.5 + 0.5 * appsFactor),
    };
  }

  // Team defensive solidity: goals-conceded-while-playing isn't tracked for
  // outfield players, so reputation stands in for "how organised is this back line".
  const teamSolidity = 0.5 + 0.5 * (teamReputation / 5);

  // Per-appearance rates, judged against what an elite season looks like for this
  // role, then discounted by how strong the opposition actually was. Twenty goals
  // in a reputation-0 league is a worse teacher than twelve in a reputation-5 one.
  const elite = ROLE_ELITE_RATES[ROLE_BY_POSITION[position]];
  const level = competitionFactor(context.clubLevel);
  const goalRate = saturate(ratio(stats.goals, apps), elite.goals) * level;
  const assistRate = saturate(ratio(stats.assists, apps), elite.assists) * level;
  const creationRate = saturate(ratio(stats.goals + stats.assists, apps), elite.creation) * level;

  return {
    // A goal is worth far more to a striker's Finishing at 19 than at 31.
    // A small apps-based floor keeps a quiet season from being a totally wasted one.
    shooting:
      affinity(weights.shooting ?? 0, position) *
      (productionAgeValue(age) * goalRate * GOAL_GROWTH_UNIT + PRODUCTION_FLOOR * appsFactor),
    // Same idea, mirrored for Passing and assists.
    passing:
      affinity(weights.passing ?? 0, position) *
      (productionAgeValue(age) * assistRate * ASSIST_GROWTH_UNIT + PRODUCTION_FLOOR * appsFactor),
    // Dribbling grows with total chance creation (goals + assists), not tied to age.
    dribbling:
      affinity(weights.dribbling ?? 0, position) *
      (DRIBBLE_GROWTH_UNIT * creationRate + DRIBBLE_FLOOR * appsFactor),
    // Defending grows with experience and how solid the team was in front of it — it rewards age, not youth.
    defending: affinity(weights.defending ?? 0, position) * DEFENDING_GROWTH_UNIT * experienceFactor(age) * appsFactor * teamSolidity,
    // Pace is a pure athletic curve: it needs minutes to train, but no stat drives it.
    pace: affinity(weights.pace ?? 0, position) * PACE_GROWTH_UNIT * paceAgeFactor(age) * (0.5 + 0.5 * appsFactor),
    // Physical is entirely about how many games the body has been put through.
    physical: affinity(weights.physical ?? 0, position) * PHYSICAL_GROWTH_UNIT * physicalAgeFactor(age) * appsFactor,
  };
}

/**
 * Seasonal erosion once a player is past their physical prime.
 *
 * Two things make this bite where the old version didn't: it ramps up steeply
 * through the thirties, and it scales with how high the attribute already is.
 * A 90-rated sprinter loses far more absolute pace per season than a 55-rated
 * one, which is both realistic and what stops elite veterans from coasting.
 */
function declineSeverity(age: number): number {
  if (age <= 26) return 0;
  if (age <= 28) return 0.38;
  if (age <= 30) return 0.7;
  if (age <= 32) return 1.2;
  if (age <= 34) return 1.8;
  if (age <= 36) return 2.4;
  return 3.0;
}

/**
 * Years of grace before ageing bites, by position. Measured aging curves put
 * wingers at a peak of ~26.1 and fading fastest, centre-backs at ~27.5 and
 * fading slowest, with keepers lasting longest of all. Applied as an offset on
 * the age fed into `declineSeverity`, so a centre-back at 32 ages like a
 * winger at 29.
 */
const DECLINE_GRACE: Record<PositionCode, number> = {
  LW: -1, RW: -1, LM: -1, RM: -1,
  ST: 0, CAM: 0, LB: 0, RB: 0, CM: 0,
  CDM: 1, CB: 2, GK: 3,
};

function declineTriggers(
  position: PositionCode,
  age: number,
  attributes: Attributes,
  overall: number,
  potential: number,
): Partial<Record<AttributeKey, number>> {
  // A player who still has a lot of unrealised talent keeps improving in ways
  // that offset the athletic decline — which is exactly how a late bloomer can
  // still be climbing at 31 while a maxed-out peer is already fading. Someone
  // who has wrung out every drop of their potential gets no such protection.
  const completion = clamp(overall / Math.max(1, potential), 0.5, 1);
  const severity = declineSeverity(age - DECLINE_GRACE[position]) * completion;
  if (severity <= 0) return {};
  const keys = attributeKeysFor(position);
  return Object.fromEntries(
    keys.map((key) => {
      // Anything meaningfully above a journeyman level has further to fall.
      const levelFactor = Math.max(0.35, attributes[key] / 58);
      return [key, -severity * DECLINE_SHARES[key] * levelFactor];
    }),
  );
}

/** How a season went relative to expectation — the headline reason a career takes off or stalls. */
export type SeasonForm = "breakout" | "normal" | "slump";

/** Odds of a genuine breakout, before playing time is taken into account. */
function breakoutBaseChance(age: number): number {
  if (age <= 19) return 0.2;
  if (age <= 22) return 0.16;
  if (age <= 25) return 0.08;
  if (age <= 28) return 0.03;
  return 0.008;
}

/**
 * A season-defining breakout has to be earned on the pitch. Below this many
 * appearances (rough cutoff between "low rotation" and a real run in the
 * side) the roll is simply unavailable — a Lamine Yamal season needs to have
 * actually been played, not inferred from eleven cameo appearances.
 */
const MIN_BREAKOUT_APPEARANCES = 20;

/**
 * Rolls the season's form. Most years land in a narrow band around 1, but a
 * young player who is actually getting minutes has a real (if small) chance of
 * a season that changes everything — and a matching chance of one that goes
 * nowhere. This is what keeps two identical-looking careers from playing out
 * the same way.
 */
function rollSeasonForm(
  rng: Rng,
  age: number,
  appsFactor: number,
  appearances: number,
): { rng: Rng; form: SeasonForm; multiplier: number } {
  const opportunity = appearances < MIN_BREAKOUT_APPEARANCES ? 0 : Math.min(1, appsFactor * 1.8);
  const breakout = chance(rng, breakoutBaseChance(age) * opportunity);
  if (breakout.success) {
    const magnitude = nextFloat(breakout.rng, 2.4, 4.0);
    return { rng: magnitude.rng, form: "breakout", multiplier: magnitude.value };
  }

  const slump = chance(breakout.rng, 0.1);
  if (slump.success) {
    const magnitude = nextFloat(slump.rng, 0.35, 0.65);
    return { rng: magnitude.rng, form: "slump", multiplier: magnitude.value };
  }

  const noise = nextFloat(slump.rng, 0.85, 1.15);
  return { rng: noise.rng, form: "normal", multiplier: noise.value };
}

/**
 * Applies one season's growth and age-related decline attribute by attribute,
 * then reads OVR back off the result — nothing here targets a pre-decided
 * overall. `bonusShares` (an active training focus) adds a flat nudge to a
 * couple of chosen attributes on top of the natural triggers.
 *
 * Decline is deliberately *not* touched by form: a bad season doesn't slow
 * your ageing, and a great one doesn't stop it.
 */
export function applyGrowth(
  rng: Rng,
  attributes: Attributes,
  context: GrowthContext,
  bonusShares?: Partial<Record<AttributeKey, number>>,
): { rng: Rng; attributes: Attributes; form: SeasonForm } {
  const { position } = context;
  const keys = attributeKeysFor(position);

  const appsFactor = saturate(context.stats.appearances, 34);
  const rolled = rollSeasonForm(
    rng,
    ageCurveShift(context.age, context.developmentProfile),
    appsFactor,
    context.stats.appearances,
  );

  const triggers = growthTriggers(context);
  const decline = declineTriggers(
    position,
    context.age,
    attributes,
    context.overall,
    context.potential,
  );
  const tap = trainability(ageCurveShift(context.age, context.developmentProfile), context.potential);
  const coaching = coachingFactor(context.clubLevel);
  const ceilingBrake = potentialTaper(context.overall, context.potential);
  // A hostile crowd drags, an adoring one lifts — deliberately a narrow band so
  // it flavours a season rather than deciding it.
  const confidence = 0.92 + 0.16 * clamp(context.confidence / 100, 0, 1);

  const next: Attributes = { ...attributes };
  for (const key of keys) {
    const gain = triggers[key] ?? 0;
    const fade = decline[key] ?? 0;
    const bonus = bonusShares?.[key] ? bonusShares[key]! * 4.5 : 0;
    const ceiling = attributeCeiling(context.potential, key, position);
    const headroom = headroomFactor(attributes[key], ceiling);
    const lead = leadBrake(attributes[key], context.overall);
    const earned =
      (gain + bonus) *
      tap *
      coaching *
      ceilingBrake *
      rolled.multiplier *
      confidence *
      context.traitGrowth *
      headroom *
      lead;
    next[key] = clampAttr(attributes[key] + earned + fade * context.traitDecline);
  }

  return { rng: rolled.rng, attributes: next, form: rolled.form };
}

/** The least a training focus may move the attributes it targets, in points. */
const TRAINING_FLOOR = 1;

/** How far dedication may carry an attribute past the ceiling it was born with. */
const TRAINING_OVERREACH = 4;

/**
 * Guarantees that a training focus actually paid.
 *
 * The bias `applyGrowth` adds is real but not reliably *visible*: a veteran's
 * decline can eat it, a bad form roll can leave it under half a point, and the
 * even redistribution that trophy bonuses and event deltas apply to the whole
 * card can push the focused attribute back down again. Picking a focus and
 * watching the number sit still reads as the choice having been ignored, so
 * whatever else happened over the period, the attributes the player chose end
 * it at least a full point up.
 *
 * Allowed to beat the player's potential, but only by
 * `TRAINING_OVERREACH`. Potential describes where a career drifts to on its
 * own and work the player chose to put in should be able to beat that, but
 * uncapped it was worth a dozen points on a single attribute across a
 * career: pick the same focus every time and one stat walked from its
 * ceiling to 99 whatever the player was born with, which is most of the
 * reason 99s turned up on cards that had no business carrying one.
 */
export function enforceTrainingFloor(
  attributes: Attributes,
  before: Attributes,
  shares: Partial<Record<AttributeKey, number>>,
  position: PositionCode,
  potential?: number,
): Attributes {
  const next = { ...attributes };
  for (const key of attributeKeysFor(position)) {
    if (!shares[key]) continue;
    const limit =
      potential === undefined
        ? 99
        : Math.min(99, attributeCeiling(potential, key, position) + TRAINING_OVERREACH);
    const floor = Math.min(limit, clampAttr(before[key] + TRAINING_FLOOR));
    if (next[key] < floor) next[key] = floor;
  }
  return next;
}

/**
 * Applies a flat OVR nudge (career-event bonuses) evenly across the card.
 * Give it the player's potential and the nudge respects each attribute's own
 * ceiling instead of walking the whole card to 99.
 */
export function shiftOverall(
  attributes: Attributes,
  position: PositionCode,
  delta: number,
  potential?: number,
): Attributes {
  if (delta === 0) return attributes;
  const target = computeOverall(attributes, position) + delta;
  return normalizeToOverall(attributes, position, target, potential);
}

export function roundedAttributes(attributes: Attributes, position: PositionCode): Record<string, number> {
  const keys = attributeKeysFor(position);
  return Object.fromEntries(keys.map((key) => [key, Math.round(attributes[key])]));
}
