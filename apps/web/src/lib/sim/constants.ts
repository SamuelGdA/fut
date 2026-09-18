/**
 * Balance constants lifted verbatim from the live Copero career simulator
 * bundle so progression, trophies and awards behave identically.
 */

export type GameMode = "long" | "normal";

/**
 * Difficulty is a separate axis from `GameMode`. Mode decides *pacing* (how
 * many seasons a decision covers); difficulty decides how unforgiving the
 * football is. They combine freely.
 */
export type Difficulty = "normal" | "hard";

/**
 * Hard mode is not "the same game with worse numbers" — it is the game with
 * the cushions taken out, aimed at what a real career actually looks like:
 *
 * - Elite talent is genuinely rare. Most professionals top out as squad
 *   players, and the odds here say so.
 * - Improvement is slower and the body goes earlier.
 * - Clubs are impatient. A season on the bench gets you moved on, not coached.
 * - The market is colder: the offers that arrive are a rung below what your
 *   level would suggest, so climbing has to be earned twice.
 * - Injuries, including the career-defining kind, are commoner.
 *
 * Every value is a multiplier on the normal game so there is exactly one place
 * to reason about the difference.
 */
export interface DifficultyConfig {
  /** Weight multipliers per talent tier, applied before the roll. */
  talentTierWeight: Record<TalentTier, number>;
  /** Scales every attribute gain. */
  growth: number;
  /** Scales age-related decline (higher = fades faster). */
  decline: number;
  /** Scales the per-season injury roll. */
  injury: number;
  /** Extra weight on the career-threatening injury event. */
  severeInjury: number;
  /** Subtracted from the reputation band offers are drawn from. */
  offerReputationPenalty: number;
  /** Scales negative fan-support swings (positive swings are untouched). */
  fanPenalty: number;
  /** Periods of poor usage a club tolerates before letting the player go. */
  patience: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  normal: {
    talentTierWeight: { prospect: 1, talent: 1, star: 1, phenomenon: 1, generational: 1 },
    growth: 1,
    decline: 1,
    injury: 1,
    severeInjury: 1,
    offerReputationPenalty: 0,
    fanPenalty: 1,
    patience: 1,
  },
  hard: {
    // 28/34/22/11/5 becomes roughly 45/34/15/4/1 once renormalised.
    talentTierWeight: { prospect: 1.6, talent: 1, star: 0.68, phenomenon: 0.38, generational: 0.28 },
    growth: 0.82,
    decline: 1.3,
    injury: 1.8,
    severeInjury: 1.9,
    offerReputationPenalty: 1,
    fanPenalty: 1.4,
    patience: 0,
  },
};

export const START_AGE = 16;
export const START_OVERALL = 50;
export const START_MARKET_VALUE = 100_000;
export const RETIREMENT_AGE = 40;

export const MODE_CONFIG: Record<
  GameMode,
  {
    periodLengthSeasons: number;
    personalEventCount: [number, number];
    substitutePeriodsBeforeNonRenewal: number;
    lowRotationPeriodsBeforeNonRenewal: number;
  }
> = {
  long: {
    periodLengthSeasons: 1,
    personalEventCount: [6, 7],
    substitutePeriodsBeforeNonRenewal: 2,
    lowRotationPeriodsBeforeNonRenewal: 3,
  },
  normal: {
    periodLengthSeasons: 2,
    personalEventCount: [3, 4],
    substitutePeriodsBeforeNonRenewal: 1,
    lowRotationPeriodsBeforeNonRenewal: 2,
  },
};

export type PositionCode =
  | "LW" | "ST" | "RW"
  | "LM" | "CAM" | "RM"
  | "LB" | "CM" | "RB"
  | "CDM" | "CB"
  | "GK";

export type PlayerRole = "attacker" | "creator" | "support" | "defensive" | "goalkeeper";

export const ROLE_POSITIONS: Record<PlayerRole, PositionCode[]> = {
  attacker: ["LW", "ST", "RW"],
  creator: ["LM", "CAM", "RM"],
  support: ["LB", "CM", "RB"],
  defensive: ["CDM", "CB"],
  goalkeeper: ["GK"],
};

/**
 * The back line, for the purposes of what a season is judged on.
 *
 * Wider than the `defensive` role, which puts the full-backs in with the
 * central midfielders: a right-back's job is defending whatever the growth
 * model calls them. A holding midfielder is in for the same reason — nobody
 * reads their season off their goal tally either.
 */
export const DEFENDER_POSITIONS: PositionCode[] = ["CB", "LB", "RB", "CDM"];

export function isDefender(position: PositionCode): boolean {
  return DEFENDER_POSITIONS.includes(position);
}
export const ALL_POSITIONS: PositionCode[] = Object.values(ROLE_POSITIONS).flat();

/**
 * Per-appearance output that counts as an outstanding season *for that role*.
 * Growth is measured against these rather than an absolute figure, so a holding
 * midfielder creating 0.06 chances a game is rewarded as richly as a striker
 * scoring 0.62 — otherwise defensive roles are permanently judged against
 * numbers their position never produces.
 */
export const ROLE_ELITE_RATES: Record<PlayerRole, { goals: number; assists: number; creation: number }> = {
  attacker: { goals: 0.62, assists: 0.2, creation: 0.78 },
  creator: { goals: 0.42, assists: 0.3, creation: 0.7 },
  support: { goals: 0.08, assists: 0.13, creation: 0.2 },
  defensive: { goals: 0.05, assists: 0.045, creation: 0.09 },
  goalkeeper: { goals: 0.01, assists: 0.05, creation: 0.05 },
};

// ---------------------------------------------------------------------------
// Talent / potential
// ---------------------------------------------------------------------------

/**
 * Every career rolls a hidden ceiling, the way Football Manager rolls Potential
 * Ability. It is the single biggest source of replay variety: two careers with
 * identical decisions play out completely differently depending on how much
 * raw talent the dice handed you. It is deliberately a *soft* ceiling — growth
 * stalls near it rather than stopping dead, so it never feels like a cage.
 */
export type TalentTier = "prospect" | "talent" | "star" | "phenomenon" | "generational";

export const TALENT_TIERS: { tier: TalentTier; weight: number; range: [number, number] }[] = [
  { tier: "prospect", weight: 28, range: [70, 78] },
  { tier: "talent", weight: 34, range: [77, 85] },
  { tier: "star", weight: 22, range: [85, 91] },
  { tier: "phenomenon", weight: 11, range: [91, 96] },
  { tier: "generational", weight: 5, range: [96, 99] },
];

export const TALENT_TIER_ORDER: TalentTier[] = TALENT_TIERS.map((t) => t.tier);

/**
 * Career appearances before the scouting read-out sharpens. Hidden potential is
 * only interesting if the player can eventually plan around it, so it resolves
 * from "unknown" to a two-tier band to an exact call as the career unfolds.
 */
/**
 * When the scouting read-out sharpens, as `{ age, appearances }` gates that
 * must *both* be cleared.
 *
 * Appearances alone was the old rule and it broke the game's main tension: a
 * teenager who played two full seasons at a small club knew by 18 whether the
 * save was worth continuing, so the honest move was always to restart until a
 * good tier showed up. Age is now the binding constraint, so the answer
 * arrives once the career is already underway and the decision has been paid
 * for rather than previewed.
 *
 * `rumour` deliberately reports a band that can be wrong (see `scoutedTalent`):
 * at 21 nobody actually knows, and a read-out that is never wrong is just the
 * answer with extra steps.
 */
export const TALENT_REVEAL_GATES = {
  rumour: { age: 22, appearances: 75 },
  approximate: { age: 27, appearances: 230 },
  exact: { age: 32, appearances: 440 },
};

// ---------------------------------------------------------------------------
// Personality
// ---------------------------------------------------------------------------

/**
 * Rolled alongside `potential`, and the second axis of replay variety: talent
 * decides how high you *can* go, personality decides how the journey feels
 * getting there. Each trait nudges event odds and one growth lever, never
 * enough to override a decision, always enough to colour it.
 */
export type PersonalityTrait =
  | "determined"
  | "fragile"
  | "professional"
  | "hothead"
  | "leader"
  | "showman";

export const PERSONALITY_TRAITS: { trait: PersonalityTrait; weight: number }[] = [
  { trait: "determined", weight: 22 },
  { trait: "professional", weight: 20 },
  { trait: "leader", weight: 16 },
  { trait: "showman", weight: 16 },
  { trait: "hothead", weight: 14 },
  { trait: "fragile", weight: 12 },
];

export interface TraitEffects {
  /** Multiplier on the odds a risky career-event choice pays off. */
  gambleOdds: number;
  /** Multiplier on season growth — the "works harder" axis. */
  growth: number;
  /** Multiplier on age decline — professionals last longer. */
  decline: number;
  /** Flat bonus to fan support earned each season. */
  fanSupport: number;
}

export const TRAIT_EFFECTS: Record<PersonalityTrait, TraitEffects> = {
  determined: { gambleOdds: 1.18, growth: 1.06, decline: 1, fanSupport: 0 },
  professional: { gambleOdds: 1.05, growth: 1.02, decline: 0.85, fanSupport: 1 },
  leader: { gambleOdds: 1.12, growth: 1, decline: 0.95, fanSupport: 3 },
  showman: { gambleOdds: 1, growth: 1, decline: 1, fanSupport: 5 },
  hothead: { gambleOdds: 1.1, growth: 1.03, decline: 1.08, fanSupport: -2 },
  fragile: { gambleOdds: 0.85, growth: 0.97, decline: 1.12, fanSupport: 0 },
};

// ---------------------------------------------------------------------------
// Fan support
// ---------------------------------------------------------------------------

/**
 * How much the stands love you, 0-100, tracked separately from ability. A new
 * signing always starts as an unknown quantity, which is why it resets on every
 * transfer — earning a terrace's trust again is part of the cost of moving.
 */
export const FAN_SUPPORT_START = 45;
/** The very first-ever signing: nobody has heard of this player yet. */
export const FAN_SUPPORT_DEBUT = 0;
export const FAN_SUPPORT_MIN = 0;
export const FAN_SUPPORT_MAX = 100;

/** Bands the UI labels, and the gate for the crowd-reaction career events. */
export const FAN_SUPPORT_BANDS = {
  hostile: 20,
  cold: 40,
  warm: 60,
  loved: 80,
} as const;

// ---------------------------------------------------------------------------
// Club standing
// ---------------------------------------------------------------------------

/**
 * What a club's fans will remember you as. Earned with time *and* silverware —
 * a mercenary who won one cup in a single season is not a legend, and neither
 * is a loyal squad player who never won anything.
 */
export type ClubStanding = "passing" | "regular" | "idol" | "legend";

export type SquadStatus =
  | "starter"
  | "high_rotation"
  | "low_rotation"
  | "substitute"
  | "third_keeper";

/** Baseline overall a club of a given international reputation fields. */
export const TEAM_BASE_OVERALL = [58, 68, 75, 80, 84, 88];

/** [overall, market value] anchors, interpolated linearly. */
export const VALUE_ANCHORS: [number, number][] = [
  [50, 100_000], [55, 250_000], [60, 500_000], [65, 1_200_000],
  [70, 3_000_000], [75, 5_000_000], [80, 15_000_000], [85, 50_000_000],
  [90, 100_000_000], [95, 150_000_000], [99, 250_000_000],
];

/**
 * Club trophy probability by (reputation-adjusted) domestic reputation 0..5.
 * Even a reputation-0 club keeps a tiny non-zero shot at the league title —
 * a real underdog run is rare, but it should never be flatly impossible.
 */
export const CLUB_TROPHY_PROBABILITY = {
  league: [0.004, 0.015, 0.05, 0.25, 0.45, 0.7],
  cup: [0.01, 0.04, 0.1, 0.25, 0.35, 0.4],
};

/**
 * How many clubs actually go up, per country.
 *
 * The sim used one generic playoff roll everywhere, which quietly said every
 * second division promotes the same number of teams. They don't: England,
 * Spain, Italy and France send three up (two automatic plus a playoff),
 * Germany sends two plus a relegation/promotion tie against the top flight's
 * third-bottom, and Argentina's Primera Nacional promotes the champion plus
 * one survivor of a long knockout. `slots` is the total promoted; `playoff`
 * says whether the non-champions go through a knockout, which is far less
 * certain than an automatic place.
 */
export interface PromotionFormat {
  slots: number;
  playoff: boolean;
}

export const PROMOTION_FORMATS: Record<string, PromotionFormat> = {
  ENG: { slots: 3, playoff: true },
  ESP: { slots: 3, playoff: true },
  ITA: { slots: 3, playoff: true },
  FRA: { slots: 3, playoff: true },
  // Two straight up, then a two-legged tie against the Bundesliga's 16th.
  GER: { slots: 3, playoff: true },
  // Champion up automatically; the Reducido produces exactly one more from a
  // very large field, so a strong season is far from enough.
  ARG: { slots: 2, playoff: true },
};

/** Countries with a second flight but no entry above fall back to this. */
export const DEFAULT_PROMOTION_FORMAT: PromotionFormat = { slots: 2, playoff: true };

export function promotionFormat(fifaCode: string | undefined): PromotionFormat {
  if (!fifaCode) return DEFAULT_PROMOTION_FORMAT;
  return PROMOTION_FORMATS[fifaCode.trim().toUpperCase()] ?? DEFAULT_PROMOTION_FORMAT;
}

/** Second-division title odds, keyed by overall ceiling. */
export const SECOND_TIER_LEAGUE_ODDS: [number, number][] = [
  [64, 0.03], [69, 0.04], [74, 0.06], [79, 0.09],
  [84, 0.13], [87, 0.18], [89, 0.25], [99, 0.3],
];

/**
 * Promotion odds for finishing well *without* winning the second division
 * outright — a real second tier promotes several clubs a season (automatic
 * spots plus a playoff), not just the champion, so these sit meaningfully
 * above the title odds at every overall band rather than being a fraction of
 * them.
 */
export const SECOND_TIER_PLAYOFF_ODDS: [number, number][] = [
  [64, 0.08], [69, 0.12], [74, 0.16], [79, 0.22],
  [84, 0.28], [87, 0.35], [89, 0.42], [99, 0.5],
];

export const CONTINENTAL_TROPHY_PROBABILITY = {
  continental_primary: [0.0008, 0.003, 0.05, 0.15, 0.2, 0.3],
  continental_secondary: [0.02, 0.06, 0.15, 0.02, 0, 0],
  /**
   * Conference League. Peaks a notch below the Europa League because that is
   * who actually enters it — the clubs finishing sixth or seventh, not the ones
   * dropping out of the Champions League. Zero at the top: a giant is never in
   * this competition in the first place.
   */
  continental_tertiary: [0.03, 0.06, 0.045, 0.008, 0, 0],
};

/**
 * Second domestic knockout (England's EFL Cup). Lower than the FA Cup at the
 * top — big clubs rotate heavily in the early rounds — and better than it at
 * the bottom, because the draw is kinder and second-tier sides go deep.
 */
export const LEAGUE_CUP_PROBABILITY = [0.02, 0.05, 0.09, 0.18, 0.24, 0.28];

/**
 * Super cups are decided over a single match, so they sit far closer to a coin
 * flip than a league season does — reputation only tilts it. Which row applies
 * depends on how the club qualified:
 *
 *   domesticDouble    won league *and* cup, so it faces a runner-up
 *   domesticSingle    won one of the two, facing the other winner
 *   continentalPrime  Champions League / Libertadores winner, the favourite
 *   continentalSecond Europa League / Sudamericana winner, the underdog
 */
export const SUPER_CUP_PROBABILITY = {
  domesticDouble: [0.6, 0.62, 0.64, 0.66, 0.68, 0.7],
  domesticSingle: [0.44, 0.46, 0.48, 0.5, 0.52, 0.54],
  continentalPrime: [0.5, 0.52, 0.54, 0.56, 0.58, 0.6],
  continentalSecond: [0.34, 0.36, 0.38, 0.4, 0.42, 0.44],
};

/**
 * One match gives a great player less room to drag a side through than a
 * 38-game league does, so the star-player boost is halved for super cups.
 */
export const SUPER_CUP_STAR_BOOST_DAMPING = 0.5;

/**
 * Club World Cup odds by confederation and continental reputation (0-5).
 * Ranked by real footballing hierarchy — UEFA clearly ahead, CONMEBOL a clear
 * second, then CAF/AFC/CONCACAF bunched together, OFC last — but every
 * confederation keeps a non-zero shot at the top of its own reputation scale,
 * however small. Team strength still does the rest via `starBoost`.
 */
export const CLUB_WORLD_CUP_PROBABILITY: Record<string, number[]> = {
  UEFA: [0.0003, 0.001, 0.005, 0.05, 0.1, 0.15],
  CONMEBOL: [0.0001, 0.0003, 0.0008, 0.002, 0.006, 0.02],
  CAF: [0.00003, 0.00008, 0.0002, 0.0006, 0.0015, 0.004],
  AFC: [0.00003, 0.00008, 0.0002, 0.0006, 0.0015, 0.004],
  CONCACAF: [0.00005, 0.0001, 0.0003, 0.0008, 0.0015, 0.003],
  OFC: [0.00001, 0.00003, 0.00008, 0.0002, 0.0005, 0.0012],
};

/**
 * Odds of winning the annual intercontinental title, per confederation.
 *
 * Played the season after winning the continent, between that season's
 * champions. The ordering is the real one — the European champion starts
 * favourite, the South American champion is the one who beats them often
 * enough to matter, and the rest are live outsiders rather than makeweights.
 * Every confederation can win it; only the odds differ.
 */
export const INTERCONTINENTAL_ODDS: Record<string, number> = {
  UEFA: 0.58,
  CONMEBOL: 0.12,
  CONCACAF: 0.03,
  AFC: 0.035,
  CAF: 0.025,
  OFC: 0.01,
};

/**
 * Confederations whose champion plays for the intercontinental in the same
 * season he won the continent, rather than the following one.
 *
 * The match is in December. South America, North America and Oceania play
 * calendar-year seasons, so their champion is crowned a few weeks earlier
 * and plays it straight away; Europe, Asia and Africa finish in May and
 * come back for it the December after, which is the next season.
 */
export const INTERCONTINENTAL_SAME_SEASON = new Set(["CONMEBOL", "CONCACAF", "OFC"]);

/**
 * Odds of winning the month-long world championship, per confederation.
 *
 * A far bigger field than the intercontinental — more European entrants than
 * anyone else — so any single club's chance is lower, and Europe's collective
 * weight tells more. Still winnable from anywhere: Corinthians and Corínthians
 * again, São Paulo, Internacional and Al-Hilal are all real answers.
 */
export const CLUB_WORLD_CUP_CHAMPION_ODDS: Record<string, number> = {
  UEFA: 0.42,
  CONMEBOL: 0.075,
  CONCACAF: 0.02,
  AFC: 0.02,
  CAF: 0.015,
  OFC: 0.005,
};

/**
 * How far back the world championship looks when deciding who is in it.
 *
 * It runs once every four years and takes the continental champions of the
 * cycle, so winning the continent books a place for the whole cycle rather
 * than for the following season only.
 */
export const CLUB_WORLD_CUP_QUALIFYING_SEASONS = 4;

/** Continental national-team title odds by country continental reputation. */
export const NATIONAL_CONTINENTAL_PROBABILITY = [0.00001, 0.02, 0.05, 0.1, 0.2, 0.3, 0.8];

/** Odds the national team qualifies for the World Cup. */
export const WORLD_CUP_QUALIFY_PROBABILITY = [0.05, 0.5, 0.8, 1, 1, 1, 1];

/** Odds of actually winning the World Cup, by country FIFA reputation. */
export const WORLD_CUP_WIN_PROBABILITY = [0.000001, 0.005, 0.05, 0.08, 0.12, 0.18];

/** Minimum overall to be called up, by country international reputation. */
export const CALL_UP_THRESHOLD = [60, 70, 74, 78, 80, 83];

export const CONTINENTAL_TOURNAMENT_START_AGE = 17;
export const CLUB_WORLD_CUP_START_AGE = 19;
export const WORLD_CUP_START_AGE = 18;
export const TOURNAMENT_CYCLE_YEARS = 4;

/** Overall at which a player drags a modest club up a reputation notch. */
export const STAR_PLAYER_OVERALL = 90;

export const EMPTY_STATS = {
  appearances: 0,
  goals: 0,
  assists: 0,
  cleanSheets: 0,
  goalsConceded: 0,
};

export const BASE_MODIFIERS = {
  immediateOverallDelta: 0,
  permanentOverallDelta: 0,
  /**
   * Permanently lowers the hidden ceiling this career can ever grow back to.
   *
   * Every other penalty here is something the player recovers from, because
   * growth always pulls back toward `potential`. This is the only modifier
   * that moves the ceiling itself — which is what makes a bad injury a scar
   * rather than a bad month.
   */
  potentialDelta: 0,
  /** One-off swing in how the current club's fans feel about the player. */
  fanSupportDelta: 0,
  /**
   * Permanent change to how impatient the current club's crowd is.
   *
   * A reward with no cost is not a decision — the player takes it every time.
   * Accepting the number 10, or a testimonial in your honour, buys goodwill
   * today and raises the bar for every season after it, which is exactly how
   * it works at a real club.
   */
  briefPatienceDelta: 0,
  statsMultiplier: 1,
  roleShift: 0,
  suspended: false,
  deferredOverallDelta: 0,
  leagueTrophyProbabilityMultiplier: 1,
  domesticCupTrophyProbabilityMultiplier: 1,
  continentalPrimaryTrophyProbabilityMultiplier: 1,
  continentalSecondaryTrophyProbabilityMultiplier: 1,
  clubWorldCupTrophyProbabilityMultiplier: 1,
};

export type Modifiers = typeof BASE_MODIFIERS & {
  roleOverride?: SquadStatus;
  nationalTournament?: string;
  nationalTournamentParticipation?: "skip" | "force";
  /** Forces a specific club trophy to be won/skipped, used by injury_at_peak. */
  clubTrophyOverride?: { trophy: string; result: "force" | "skip" };
  /** Forces a specific national trophy to be won/skipped, used by decisive_penalty. */
  nationalTrophyOverride?: { trophy: string; result: "force" | "skip" };
  /**
   * Marks the club being left as one that will never sign the player again.
   * Set by the supporters' variant of `dressing_room_fallout`: you can fall
   * out with a manager and be forgiven, but not with the stand.
   */
  betrayCurrentClub?: boolean;
};

/** Chance of a random injury striking during a season. */
export const INJURY_PROBABILITY = 0.02;

/**
 * Everyday knocks: the pulled muscle that costs a month, not the injury that
 * costs a career.
 *
 * The sim had exactly one kind of injury — the rare, career-altering decision
 * event — so every other season was played at perfect fitness and read as flat.
 * These never surface as a headline or a decision; they just quietly take a
 * few games off the return, which is what makes a full, uninterrupted season
 * feel earned instead of default.
 */
export const KNOCK_BASE_PROBABILITY = 0.2;

/** Extra chance per year over 29 — bodies stop bouncing back. */
export const KNOCK_AGE_RAMP = 0.022;

export const KNOCK_TYPES: { type: string; weight: number; matches: [number, number] }[] = [
  { type: "muscle_strain", weight: 30, matches: [2, 5] },
  { type: "ankle_knock", weight: 24, matches: [2, 4] },
  { type: "bruised_knee", weight: 16, matches: [2, 4] },
  { type: "back_spasm", weight: 12, matches: [3, 6] },
  { type: "groin_strain", weight: 10, matches: [4, 8] },
  { type: "illness", weight: 8, matches: [1, 3] },
];

export const INJURY_TYPES: { type: string; weight: number; overallDelta: number }[] = [
  { type: "hamstring", weight: 24, overallDelta: -3 },
  { type: "meniscus", weight: 18, overallDelta: -2 },
  { type: "acl", weight: 14, overallDelta: -5 },
  { type: "tibia_fibula", weight: 8, overallDelta: -8 },
  { type: "achilles", weight: 4, overallDelta: -10 },
  { type: "ankle_sprain", weight: 14, overallDelta: -1 },
  { type: "calf_tear", weight: 8, overallDelta: -2 },
  { type: "metatarsal_fracture", weight: 5, overallDelta: -4 },
  { type: "shoulder_dislocation", weight: 3, overallDelta: -4 },
  { type: "disc_hernia", weight: 2, overallDelta: -5 },
];

export function injuryOverallDelta(type: string): number {
  return INJURY_TYPES.find((i) => i.type === type)?.overallDelta ?? -3;
}

/**
 * The injuries that end careers rather than interrupt them, and how much of
 * the player's ceiling never comes back.
 *
 * Ordinary injuries cost overall the player simply regrows, because growth
 * always pulls back toward `potential`. These lower `potential` itself, so the
 * career genuinely never returns to what it was going to be. That is a heavy
 * thing to do to a save, which is why it is deliberately rare.
 */
export const SEVERE_INJURY_TYPES: { type: string; weight: number; potentialLoss: number }[] = [
  { type: "acl_rupture", weight: 34, potentialLoss: 6 },
  { type: "achilles_rupture", weight: 24, potentialLoss: 8 },
  { type: "double_leg_fracture", weight: 16, potentialLoss: 10 },
  { type: "chronic_pubalgia", weight: 16, potentialLoss: 4 },
  { type: "knee_cartilage", weight: 10, potentialLoss: 5 },
];

/**
 * Selection weight for a career-threatening injury, against the 20-100 the
 * ordinary events carry. Low on purpose, and narrowed further by the age
 * window in `eligibleCareerEvents` — measured at roughly one career in twenty,
 * which is often enough to be a real risk hanging over a save and rare enough
 * that it stays a story when it lands.
 */
export const SEVERE_INJURY_WEIGHT = 26;
