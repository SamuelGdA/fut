import type { CareerMetrics } from "./metrics";

/**
 * A daily mission.
 *
 * Three rules shape every entry here.
 *
 * **It has to cut against the obvious line.** If a mission just says "get the
 * highest overall", every player takes the same decisions — always sign for
 * the bigger club, always train — and the challenge stops being a decision and
 * becomes a script. The interesting missions make the greedy move wrong.
 *
 * **`progress` must be a slope, never a gate.** An earlier draft gated missions
 * on things like "won a Ballon d'Or", and measurement showed that scoring zero
 * in *sixty out of sixty* hard-mode careers — a whole day where nobody can
 * separate themselves. Every mission now returns a number a decent run moves,
 * with the rare achievements as large bonuses on top rather than the price of
 * entry.
 *
 * **It has to be reachable in the position it's dealt to.** `role` exists so a
 * clean-sheet brief never lands on a striker.
 */
/**
 * What a mission pulls the career towards.
 *
 * The day deals three briefs and scores the best two, which is only a decision
 * if the three want incompatible careers — so the dealer draws one from each
 * of three different axes. Loyalty and journey genuinely fight each other;
 * two goal-scoring briefs do not.
 */
export type MissionAxis =
  | "output"
  | "silverware"
  | "loyalty"
  | "journey"
  | "growth"
  | "underdog"
  | "national"
  | "longevity"
  | "accolades";

export interface Mission {
  id: string;
  axis: MissionAxis;
  /** Locale key suffix under `challenge.missions.<id>`. */
  key: string;
  /**
   * How far this career got, as a raw number — higher is always better.
   * The unit is the mission's own; `target` is what full marks looks like.
   */
  progress: (m: CareerMetrics) => number;
  /**
   * Progress that counts as a complete success. Calibrated against measured
   * hard-mode outcomes rather than guessed — roughly the 85th percentile of
   * what a competent run reaches, so hitting it is an achievement and beating
   * it is still possible.
   */
  target: number;
  /**
   * Optional hard rule. Breaking it doesn't zero the run — it caps it, so a
   * player who slipped late still beats one who never got going, but can never
   * beat a clean run.
   */
  rule?: (m: CareerMetrics) => boolean;
  /**
   * Which positions this mission can fairly be dealt to. A clean-sheet
   * mission handed to a striker is not hard, it is impossible — and an
   * impossible day means an all-zero leaderboard.
   */
  role: "any" | "goalkeeper" | "attacker" | "outfield";
  /**
   * Briefs that pull the opposite way hard enough that holding both is not a
   * trade-off, it is a contradiction: "never transfer" against "win a league
   * in three countries" is not a hand, it is a wasted slot. Declared one way
   * round; the dealer reads it symmetrically.
   *
   * Only genuine cancellations belong here. Briefs that merely compete for
   * the same seasons are exactly what the day is supposed to be about.
   */
  excludes?: string[];
  /** Short value shown next to the score. */
  unit:
    | "goals" | "assists" | "trophies" | "overall" | "caps"
    | "seasons" | "clubs" | "apps" | "cleanSheets" | "points";
}

/** Standing is worth points on a curve rather than as a yes/no. */
function standingPoints(standing: string): number {
  if (standing === "legend") return 40;
  if (standing === "idol") return 18;
  if (standing === "regular") return 6;
  return 0;
}

export const MISSIONS: Mission[] = [
  {
    id: "one_club_legend",
    excludes: ["globetrotter", "journeyman", "double_legend", "homecoming", "riser"],
    axis: "loyalty",
    key: "one_club_legend",
    role: "any",
    unit: "points",
    // Graded on the whole stay, not on reaching legend — the rule below is what
    // enforces the loyalty, this just measures how much was built there.
    progress: (m) =>
      m.firstClub
        ? m.firstClub.seasons * 2 + m.firstClub.trophies * 8 + standingPoints(m.firstClub.standing)
        : 0,
    target: 26,
    rule: (m) => m.permanentTransfers === 0,
  },
  {
    id: "goal_machine",
    axis: "output",
    key: "goal_machine",
    role: "attacker",
    unit: "goals",
    progress: (m) => m.totalGoals,
    target: 172,
  },
  {
    id: "playmaker",
    axis: "output",
    key: "playmaker",
    role: "outfield",
    unit: "assists",
    progress: (m) => m.totalAssists,
    target: 99,
  },
  {
    id: "trophy_hoarder",
    axis: "silverware",
    key: "trophy_hoarder",
    role: "any",
    unit: "trophies",
    progress: (m) => m.totalTrophies,
    target: 5,
  },
  {
    id: "collector",
    axis: "silverware",
    key: "collector",
    role: "any",
    unit: "points",
    // Breadth first, depth second: five different cups beat five league titles.
    progress: (m) => m.distinctTrophyTypes * 12 + m.totalTrophies * 2,
    target: 34,
  },
  {
    id: "prodigy",
    excludes: ["late_bloomer"],
    axis: "growth",
    key: "prodigy",
    role: "any",
    unit: "overall",
    progress: (m) => m.overallByAge(21),
    target: 68,
  },
  {
    id: "late_bloomer",
    axis: "growth",
    key: "late_bloomer",
    role: "any",
    unit: "points",
    // Rewards a career still climbing when most are flattening out.
    progress: (m) => m.peakOverall + Math.max(0, m.peakAge - 26) * 5,
    target: 89,
  },
  {
    id: "underdog_idol",
    excludes: ["world_class", "domestic_dominance", "continental_king"],
    axis: "underdog",
    key: "underdog_idol",
    role: "any",
    unit: "points",
    // Greatness at a small badge counts for more than greatness at a giant.
    progress: (m) =>
      m.clubs.reduce(
        (best, c) => Math.max(best, standingPoints(c.standing) * (1 + (5 - c.reputation) / 5)),
        0,
      ),
    target: 80,
  },
  {
    id: "globetrotter",
    axis: "journey",
    key: "globetrotter",
    role: "any",
    unit: "points",
    progress: (m) => m.countryCount * 18 + m.totalTrophies * 2,
    target: 62,
  },
  {
    id: "national_hero",
    axis: "national",
    key: "national_hero",
    role: "any",
    unit: "points",
    // Caps are scarce on hard, so peak level carries the floor: you cannot get
    // near a national team without being good, and that much always scores.
    progress: (m) => m.peakOverall / 2 + m.caps * 2 + m.worldCups * 60 + m.nationalContinental * 30,
    target: 38,
  },
  {
    id: "iron_man",
    axis: "longevity",
    key: "iron_man",
    role: "any",
    unit: "apps",
    progress: (m) => m.totalAppearances,
    target: 660,
  },
  {
    id: "no_loans",
    axis: "journey",
    key: "no_loans",
    role: "any",
    unit: "overall",
    progress: (m) => m.peakOverall,
    target: 76,
    rule: (m) => m.loanSpells === 0,
  },
  {
    id: "continental_king",
    axis: "silverware",
    key: "continental_king",
    role: "any",
    unit: "points",
    // Continental nights are rare, so reaching the level that plays them is
    // worth something on its own.
    progress: (m) =>
      m.continentalTitles * 45 +
      m.clubWorldCups * 30 +
      m.clubs.reduce((best, c) => Math.max(best, c.reputation), 0) * 8,
    target: 70,
  },
  {
    id: "resilient",
    axis: "underdog",
    key: "resilient",
    role: "any",
    unit: "points",
    // Adversity is a bonus, never a requirement — an earlier version gated this
    // on the career-threatening injury actually happening, which made the score
    // a coin flip rather than a decision.
    progress: (m) =>
      m.peakOverall + (m.severeInjuryAge !== null ? 35 : 0) + m.relegations * 10 + m.promotions * 12,
    target: 117,
  },
  {
    id: "beloved",
    axis: "loyalty",
    key: "beloved",
    role: "any",
    unit: "points",
    progress: (m) => Math.round(m.finalFanSupport),
    target: 88,
  },
  {
    id: "marquee_number",
    axis: "loyalty",
    key: "marquee_number",
    role: "any",
    unit: "seasons",
    progress: (m) => m.seasonsWithMarqueeNumber,
    target: 22,
  },
  {
    id: "journeyman",
    axis: "journey",
    key: "journeyman",
    role: "any",
    unit: "points",
    progress: (m) => m.clubCount * 5 + m.totalTrophies,
    target: 40,
  },
  {
    id: "homecoming",
    excludes: ["globetrotter"],
    axis: "loyalty",
    key: "homecoming",
    role: "any",
    unit: "points",
    // The full story pays most, but every season at the first club counts.
    progress: (m) =>
      (m.firstClub?.seasons ?? 0) * 3 +
      (m.everPlayedForFirstClubAgain ? 25 : 0) +
      (m.retiredAtFirstClub ? 40 : 0),
    target: 43,
  },
  {
    id: "sharpshooter",
    axis: "output",
    key: "sharpshooter",
    role: "attacker",
    unit: "goals",
    progress: (m) => m.bestSeasonGoals,
    target: 18,
  },
  {
    id: "youth_to_star",
    axis: "growth",
    key: "youth_to_star",
    role: "any",
    unit: "overall",
    // Pure development: how far the player was taken from where they started.
    progress: (m) => m.peakOverall - 50,
    target: 31,
  },
  {
    id: "unbreakable",
    axis: "longevity",
    key: "unbreakable",
    role: "any",
    unit: "overall",
    progress: (m) => m.peakOverall,
    target: 76,
    rule: (m) => m.severeInjuryAge === null && m.relegations === 0,
  },
  {
    id: "individual_glory",
    axis: "accolades",
    key: "individual_glory",
    role: "attacker",
    unit: "points",
    // The awards are the ceiling, not the entry fee — reaching the level that
    // contends for them scores on its own.
    progress: (m) => m.ballonDors * 60 + m.goldenBoots * 25 + m.peakOverall / 2,
    target: 38,
  },
  {
    id: "double_legend",
    axis: "journey",
    key: "double_legend",
    role: "any",
    unit: "points",
    progress: (m) => m.legendClubs.length * 40 + m.idolClubs.length * 12,
    target: 40,
  },
  {
    id: "loyal_servant",
    excludes: ["globetrotter", "journeyman"],
    axis: "loyalty",
    key: "loyal_servant",
    role: "any",
    unit: "seasons",
    progress: (m) => (m.clubs.length === 0 ? 0 : Math.max(...m.clubs.map((c) => c.seasons))),
    target: 12,
  },
  {
    id: "clean_sheet_wall",
    axis: "output",
    key: "clean_sheet_wall",
    role: "goalkeeper",
    unit: "cleanSheets",
    progress: (m) => m.totalCleanSheets,
    target: 187,
  },
  {
    id: "riser",
    excludes: ["domestic_dominance", "continental_king"],
    axis: "underdog",
    key: "riser",
    role: "any",
    unit: "points",
    progress: (m) => m.promotions * 25 + m.leagueTitles * 15 + m.peakOverall / 2,
    target: 131,
  },
  {
    id: "domestic_dominance",
    axis: "silverware",
    key: "domestic_dominance",
    role: "any",
    unit: "points",
    progress: (m) => m.leagueTitles * 10 + m.cupTitles * 6,
    target: 20,
  },
  {
    id: "world_class",
    axis: "growth",
    key: "world_class",
    role: "any",
    unit: "overall",
    progress: (m) => m.peakOverall,
    target: 81,
  },
  {
    id: "veteran",
    axis: "longevity",
    key: "veteran",
    role: "any",
    unit: "overall",
    progress: (m) => m.overallByAge(40) - Math.max(0, 38 - m.retirementAge) * 4,
    target: 78,
  },
  {
    id: "poacher",
    axis: "output",
    key: "poacher",
    role: "attacker",
    unit: "points",
    // Rate, not volume: the same tally in half the games is the better
    // striker, and it stops the brief being "play for twenty-four years".
    progress: (m) =>
      m.totalAppearances >= 120 ? Math.round((m.totalGoals / m.totalAppearances) * 100) : 0,
    target: 52,
  },
  {
    id: "creator_in_chief",
    axis: "output",
    key: "creator_in_chief",
    role: "outfield",
    unit: "assists",
    // One unforgettable season rather than a long accumulation.
    progress: (m) => m.bestSeasonAssists,
    target: 17,
  },
  {
    id: "treble_winner",
    axis: "silverware",
    key: "treble_winner",
    role: "any",
    unit: "points",
    // League, cup and continent all count, and the continent counts most.
    progress: (m) => m.leagueTitles * 6 + m.cupTitles * 5 + m.continentalTitles * 14,
    target: 46,
  },
  {
    id: "world_conqueror",
    axis: "silverware",
    key: "world_conqueror",
    role: "any",
    unit: "points",
    progress: (m) => m.clubWorldCups * 40 + m.worldCups * 45 + m.nationalContinental * 20,
    target: 45,
  },
  {
    id: "kept_the_shirt",
    axis: "loyalty",
    key: "kept_the_shirt",
    role: "any",
    excludes: ["globetrotter", "journeyman"],
    unit: "points",
    // Two clubs, no more, and something built at both.
    progress: (m) =>
      m.clubCount <= 2 ? m.seasonsPlayed * 3 + m.totalTrophies * 6 + m.legendClubs.length * 20 : 0,
    target: 84,
  },
  {
    id: "cap_century",
    axis: "national",
    key: "cap_century",
    role: "any",
    unit: "caps",
    progress: (m) => m.caps,
    target: 112,
  },
  {
    id: "international_scorer",
    axis: "national",
    key: "international_scorer",
    role: "outfield",
    unit: "goals",
    progress: (m) => m.nationalGoals,
    target: 44,
  },
  {
    id: "early_call",
    axis: "growth",
    key: "early_call",
    role: "any",
    unit: "points",
    // Rewards being trusted young: the earlier the first cap, the better,
    // and it still has to lead somewhere.
    progress: (m) =>
      m.firstCallUpAge === null ? 0 : Math.max(0, 30 - m.firstCallUpAge) * 6 + m.caps,
    target: 74,
  },
  {
    id: "ever_present",
    axis: "longevity",
    key: "ever_present",
    role: "any",
    unit: "seasons",
    // Seasons that were actually played, not merely survived.
    progress: (m) => m.clubs.reduce((n, c) => n + (c.appearances / Math.max(1, c.seasons) >= 30 ? c.seasons : 0), 0),
    target: 17,
  },
  {
    id: "second_tier_hero",
    axis: "underdog",
    key: "second_tier_hero",
    role: "any",
    excludes: ["world_class", "continental_king", "domestic_dominance"],
    unit: "points",
    progress: (m) => m.promotions * 26 + m.seasonsInSecondTier * 4 + m.totalTrophies * 3,
    target: 62,
  },
  {
    id: "cult_hero",
    axis: "underdog",
    key: "cult_hero",
    role: "any",
    unit: "points",
    // Loved everywhere rather than adored in one place.
    progress: (m) => m.idolClubs.length * 18 + m.legendClubs.length * 26,
    target: 58,
  },
  {
    id: "golden_boot_run",
    axis: "accolades",
    key: "golden_boot_run",
    role: "attacker",
    unit: "points",
    progress: (m) => m.goldenBoots * 22 + m.bestSeasonGoals,
    target: 68,
  },
  {
    id: "decorated",
    axis: "accolades",
    key: "decorated",
    role: "any",
    unit: "points",
    progress: (m) => m.totalAwards * 14 + m.ballonDors * 20,
    target: 58,
  },
  {
    id: "safe_hands",
    axis: "growth",
    key: "safe_hands",
    role: "goalkeeper",
    unit: "points",
    progress: (m) => m.bestSeasonCleanSheets * 3 + Math.max(0, m.peakOverall - 70) * 2,
    target: 96,
  },
  {
    id: "complete_career",
    axis: "accolades",
    key: "complete_career",
    role: "any",
    unit: "points",
    // The all-rounder: something in every column.
    progress: (m) =>
      Math.min(m.totalTrophies, 10) * 6 +
      Math.min(m.caps, 40) +
      Math.min(m.legendClubs.length, 2) * 15 +
      m.peakOverall / 2,
    target: 72,
  },
];

export function missionById(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id);
}
