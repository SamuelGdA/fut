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
export interface Mission {
  id: string;
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
    key: "goal_machine",
    role: "attacker",
    unit: "goals",
    progress: (m) => m.totalGoals,
    target: 172,
  },
  {
    id: "playmaker",
    key: "playmaker",
    role: "outfield",
    unit: "assists",
    progress: (m) => m.totalAssists,
    target: 99,
  },
  {
    id: "trophy_hoarder",
    key: "trophy_hoarder",
    role: "any",
    unit: "trophies",
    progress: (m) => m.totalTrophies,
    target: 5,
  },
  {
    id: "collector",
    key: "collector",
    role: "any",
    unit: "points",
    // Breadth first, depth second: five different cups beat five league titles.
    progress: (m) => m.distinctTrophyTypes * 12 + m.totalTrophies * 2,
    target: 34,
  },
  {
    id: "prodigy",
    key: "prodigy",
    role: "any",
    unit: "overall",
    progress: (m) => m.overallByAge(21),
    target: 68,
  },
  {
    id: "late_bloomer",
    key: "late_bloomer",
    role: "any",
    unit: "points",
    // Rewards a career still climbing when most are flattening out.
    progress: (m) => m.peakOverall + Math.max(0, m.peakAge - 26) * 5,
    target: 89,
  },
  {
    id: "underdog_idol",
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
    key: "globetrotter",
    role: "any",
    unit: "points",
    progress: (m) => m.countryCount * 18 + m.totalTrophies * 2,
    target: 62,
  },
  {
    id: "national_hero",
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
    key: "iron_man",
    role: "any",
    unit: "apps",
    progress: (m) => m.totalAppearances,
    target: 660,
  },
  {
    id: "no_loans",
    key: "no_loans",
    role: "any",
    unit: "overall",
    progress: (m) => m.peakOverall,
    target: 76,
    rule: (m) => m.loanSpells === 0,
  },
  {
    id: "continental_king",
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
    key: "beloved",
    role: "any",
    unit: "points",
    progress: (m) => Math.round(m.finalFanSupport),
    target: 88,
  },
  {
    id: "marquee_number",
    key: "marquee_number",
    role: "any",
    unit: "seasons",
    progress: (m) => m.seasonsWithMarqueeNumber,
    target: 22,
  },
  {
    id: "journeyman",
    key: "journeyman",
    role: "any",
    unit: "points",
    progress: (m) => m.clubCount * 5 + m.totalTrophies,
    target: 40,
  },
  {
    id: "homecoming",
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
    key: "sharpshooter",
    role: "attacker",
    unit: "goals",
    progress: (m) => m.bestSeasonGoals,
    target: 18,
  },
  {
    id: "youth_to_star",
    key: "youth_to_star",
    role: "any",
    unit: "overall",
    // Pure development: how far the player was taken from where they started.
    progress: (m) => m.peakOverall - 50,
    target: 31,
  },
  {
    id: "unbreakable",
    key: "unbreakable",
    role: "any",
    unit: "overall",
    progress: (m) => m.peakOverall,
    target: 76,
    rule: (m) => m.severeInjuryAge === null && m.relegations === 0,
  },
  {
    id: "individual_glory",
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
    key: "double_legend",
    role: "any",
    unit: "points",
    progress: (m) => m.legendClubs.length * 40 + m.idolClubs.length * 12,
    target: 40,
  },
  {
    id: "loyal_servant",
    key: "loyal_servant",
    role: "any",
    unit: "seasons",
    progress: (m) => (m.clubs.length === 0 ? 0 : Math.max(...m.clubs.map((c) => c.seasons))),
    target: 12,
  },
  {
    id: "clean_sheet_wall",
    key: "clean_sheet_wall",
    role: "goalkeeper",
    unit: "cleanSheets",
    progress: (m) => m.totalCleanSheets,
    target: 187,
  },
  {
    id: "riser",
    key: "riser",
    role: "any",
    unit: "points",
    progress: (m) => m.promotions * 25 + m.leagueTitles * 15 + m.peakOverall / 2,
    target: 131,
  },
  {
    id: "domestic_dominance",
    key: "domestic_dominance",
    role: "any",
    unit: "points",
    progress: (m) => m.leagueTitles * 10 + m.cupTitles * 6,
    target: 20,
  },
  {
    id: "world_class",
    key: "world_class",
    role: "any",
    unit: "overall",
    progress: (m) => m.peakOverall,
    target: 81,
  },
  {
    id: "veteran",
    key: "veteran",
    role: "any",
    unit: "overall",
    progress: (m) => m.overallByAge(40) - Math.max(0, 38 - m.retirementAge) * 4,
    target: 78,
  },
  {
    id: "complete_career",
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
