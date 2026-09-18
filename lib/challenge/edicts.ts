import type { CareerMetrics } from "./metrics";
import type { Mission } from "./missions";

/**
 * The rule you are not allowed to break today.
 *
 * A brief on its own is a target, and a target has an optimal line: sign for
 * the biggest club that will play you, train, repeat. Once a player has found
 * that line the daily stops being a decision and becomes a routine — which was
 * the single biggest problem with the old one-mission format.
 *
 * An edict removes a move from the board. "No permanent transfer before 24"
 * and "never sign for a giant" are the same career with two completely
 * different best lines, and neither is the line the player already knows. It
 * is also the cheapest source of variety in the whole design: one predicate
 * each, and every edict multiplies against every combination of briefs.
 *
 * Edicts are judged on the finished career, never mid-run, so the player is
 * free to work out for themselves whether a given move is still legal.
 */
export interface Edict {
  id: string;
  /** Locale key suffix under `challenge.edicts.<key>`. */
  key: string;
  /** True while the rule survived the whole career. */
  holds: (m: CareerMetrics) => boolean;
  /**
   * A brief this edict would make impossible rather than hard. A "stay at one
   * club" edict beside a "play in five countries" brief is not a challenge,
   * it is a zero — so the dealer checks this before putting them on the same
   * day.
   */
  conflictsWith?: (mission: Mission) => boolean;
  /**
   * Present only for a "floor" edict — one that demands a minimum by the end
   * of the career (today, only `exile`) rather than the usual "ceiling" that
   * starts satisfied and breaks forever the moment a line is crossed. `holds`
   * is `false` by default for a floor edict until the minimum is actually
   * reached, so the live HUD cannot treat that the same as a broken ceiling —
   * a 16-year-old who has played for exactly one club has not failed
   * anything yet, they just haven't gotten there. When set, the HUD renders
   * this as a progress row like a mission instead of a danger banner.
   */
  progress?: (m: CareerMetrics) => { current: number; target: number };
}

/**
 * `biggestClubReputation` is the mean of a club's domestic and international
 * standing, so 3.5 is roughly "a side that expects to win its league".
 */
const GIANT_REPUTATION = 3.5;

export const EDICTS: Edict[] = [
  {
    // Forces the player to build somewhere small first, which is exactly the
    // move the greedy line never makes.
    id: "no_early_moves",
    key: "no_early_moves",
    holds: (m) => m.firstPermanentTransferAge === null || m.firstPermanentTransferAge >= 24,
    conflictsWith: (mission) => mission.id === "globetrotter" || mission.id === "journeyman",
  },
  {
    id: "two_clubs_max",
    key: "two_clubs_max",
    holds: (m) => m.clubCount <= 2,
    conflictsWith: (mission) =>
      mission.id === "globetrotter" || mission.id === "journeyman" || mission.id === "double_legend",
  },
  {
    // Every trophy has to be won somewhere that was not supposed to win it.
    id: "no_giants",
    key: "no_giants",
    holds: (m) => m.biggestClubReputation < GIANT_REPUTATION,
    conflictsWith: (mission) =>
      mission.id === "continental_king" || mission.id === "world_class" || mission.id === "trophy_hoarder",
  },
  {
    id: "one_country",
    key: "one_country",
    holds: (m) => m.countryCount <= 1,
    conflictsWith: (mission) => mission.id === "globetrotter",
  },
  {
    id: "top_flight_only",
    key: "top_flight_only",
    holds: (m) => m.seasonsInSecondTier === 0,
    conflictsWith: (mission) => mission.id === "underdog_idol" || mission.id === "riser",
  },
  {
    id: "no_loans",
    key: "no_loans",
    holds: (m) => m.loanSpells === 0,
    conflictsWith: (mission) => mission.id === "no_loans",
  },
  {
    // The opposite pressure to `two_clubs_max`: nothing is ever allowed to
    // become home, so fan support and club standing never compound.
    id: "never_settle",
    key: "never_settle",
    holds: (m) => m.longestSpellSeasons <= 4,
    conflictsWith: (mission) =>
      mission.id === "one_club_legend" || mission.id === "loyal_servant" || mission.id === "homecoming",
  },
  {
    // Turning down every marquee shirt costs real fan support now that taking
    // one raises what the crowd expects.
    id: "no_marquee_number",
    key: "no_marquee_number",
    holds: (m) => m.seasonsWithMarqueeNumber === 0,
    conflictsWith: (mission) => mission.id === "marquee_number",
  },
  {
    id: "never_relegated",
    key: "never_relegated",
    holds: (m) => m.relegations === 0,
    conflictsWith: (mission) => mission.id === "riser" || mission.id === "resilient",
  },
  {
    // Leave young and never look back — the reverse of the comfortable path.
    id: "exile",
    key: "exile",
    holds: (m) => m.countryCount >= 3,
    progress: (m) => ({ current: Math.min(m.countryCount, 3), target: 3 }),
    conflictsWith: (mission) =>
      mission.id === "one_club_legend" || mission.id === "loyal_servant" || mission.id === "homecoming",
  },
];

export function edictById(id: string): Edict | undefined {
  return EDICTS.find((e) => e.id === id);
}
