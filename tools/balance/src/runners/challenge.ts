import { getDailyChallenge, challengeMissions, scoreChallenge } from "@/lib/challenge/daily";
import { buildCareerMetrics } from "@/lib/challenge/metrics";
import { ALL_POSITIONS } from "@/lib/sim/constants";
import { challengeDays } from "../corpus";
import { playCareer } from "../play";
import { digest } from "../digest";
import { rate, share, spread, type Spread } from "../stats";

/**
 * The daily challenge, audited over a fixed window of days.
 *
 * Two questions. Is every day dealable, which is a correctness property and
 * has to be exactly zero failures: three different axes, at least one position
 * that can chase all three, no declared contradiction, and an edict that kills
 * none of them. And is every day winnable, which is a balance property: a day
 * whose best achievable score is near zero is a day nobody can separate
 * themselves on, and that was a real failure mode before the brief scoring
 * became a slope rather than a gate.
 */

export interface ChallengeReport {
  days: number;
  /** Must be zero. Anything here is a dealer bug, not a balance question. */
  failures: {
    fewerThanThreeAxes: string[];
    noSharedPosition: string[];
    contradiction: string[];
    edictConflict: string[];
  };
  /** The exact hand each day deals, so a dealer change is visible. */
  dealDigest: string;
  positionShare: Record<string, { count: number; pct: number }>;
  countryShare: Record<string, { count: number; pct: number }>;
  missionAppearances: Record<string, { count: number; pct: number }>;
  edictAppearances: Record<string, { count: number; pct: number }>;
  /**
   * Which brief gets held back, by id.
   *
   * Not by index: the dealt order is not exposed, and the hidden brief is
   * always last in the list the challenge hands out, so an index would measure
   * the shape of that list rather than the dealer. What the rotation is
   * actually for is that the same hand plays differently depending on which
   * third of it is sealed, and the id is what shows whether that happens.
   */
  hiddenMissionShare: Record<string, { count: number; pct: number }>;
  /** A sampled play-through of each day, to see what a score looks like. */
  scores: {
    sampledDays: number;
    runsPerDay: number;
    best: Spread;
    mean: Spread;
    edictHeldPct: number;
    zeroScoreDays: string[];
  };
}

/** How many days of the window are actually played out, and how hard. */
const SCORE_SAMPLE_DAYS = 30;
const RUNS_PER_DAY = 6;

function auditDeals() {
  const days = challengeDays();
  const failures: ChallengeReport["failures"] = {
    fewerThanThreeAxes: [],
    noSharedPosition: [],
    contradiction: [],
    edictConflict: [],
  };

  const positions: string[] = [];
  const countries: string[] = [];
  const missions: string[] = [];
  const edicts: string[] = [];
  const hiddenMissions: string[] = [];
  const deals: unknown[] = [];

  for (const day of days) {
    const challenge = getDailyChallenge(day);
    const hand = challengeMissions(challenge);

    if (new Set(hand.map((mission) => mission.axis)).size < 3) {
      failures.fewerThanThreeAxes.push(day);
    }

    const shared = ALL_POSITIONS.filter((position) =>
      hand.every((mission) => {
        if (mission.role === "any") return true;
        if (mission.role === "goalkeeper") return position === "GK";
        if (mission.role === "outfield") return position !== "GK";
        return ["ST", "LW", "RW", "CAM"].includes(position);
      }),
    );
    if (shared.length === 0) failures.noSharedPosition.push(day);

    const contradicts = hand.some((mission) =>
      hand.some((other) => other !== mission && mission.excludes?.includes(other.id)),
    );
    if (contradicts) failures.contradiction.push(day);

    if (hand.some((mission) => challenge.edict.conflictsWith?.(mission))) {
      failures.edictConflict.push(day);
    }

    positions.push(challenge.position);
    countries.push(challenge.countryIso);
    for (const mission of hand) missions.push(mission.id);
    edicts.push(challenge.edict.id);
    hiddenMissions.push(challenge.hiddenMission.id);
    deals.push({
      day,
      position: challenge.position,
      country: challenge.countryIso,
      missions: hand.map((mission) => mission.id),
      hidden: challenge.hiddenMission.id,
      edict: challenge.edict.id,
    });
  }

  return {
    days: days.length,
    failures,
    dealDigest: digest(deals),
    positionShare: share(positions),
    countryShare: share(countries),
    missionAppearances: share(missions),
    edictAppearances: share(edicts),
    hiddenMissionShare: share(hiddenMissions),
  };
}

function sampleScores(): ChallengeReport["scores"] {
  const days = challengeDays().slice(0, SCORE_SAMPLE_DAYS);
  const bests: number[] = [];
  const means: number[] = [];
  const zeroScoreDays: string[] = [];
  let edictHeld = 0;
  let runs = 0;

  for (const day of days) {
    const challenge = getDailyChallenge(day);
    const dayScores: number[] = [];

    for (let run = 0; run < RUNS_PER_DAY; run += 1) {
      const played = playCareer({
        id: `${day}-${run}`,
        // Everybody in the world gets this seed on this day, which is the
        // whole point of the format, so the seed is fixed and the *decisions*
        // are what vary. Without a per-run decision seed the three policies
        // would just repeat themselves twice each.
        seed: challenge.seed,
        policySeed: `${challenge.seed}:run:${run}`,
        mode: "normal",
        difficulty: "hard",
        countryIso: challenge.countryIso,
        position: challenge.position,
        // One run of each fixed line, then four exploratory ones. Repeating
        // the fixed policies would repeat their careers exactly: neither of
        // them reads the decision stream at all.
        policy: run === 0 ? "first" : run === 1 ? "ambitious" : "varied",
      });
      if (played.state.seasons.length === 0) continue;
      const result = scoreChallenge(played.state, challenge);
      dayScores.push(result.score);
      if (result.edictHeld) edictHeld += 1;
      runs += 1;
      // Referenced so the metrics builder is exercised too: it is what the
      // briefs are scored from, and a change there moves every score.
      void buildCareerMetrics(played.state);
    }

    if (dayScores.length === 0) continue;
    const best = Math.max(...dayScores);
    bests.push(best);
    means.push(dayScores.reduce((sum, value) => sum + value, 0) / dayScores.length);
    if (best <= 0) zeroScoreDays.push(day);
  }

  return {
    sampledDays: days.length,
    runsPerDay: RUNS_PER_DAY,
    best: spread(bests),
    mean: spread(means),
    edictHeldPct: rate(runs, edictHeld),
    zeroScoreDays,
  };
}

export function runChallenge(): ChallengeReport {
  return { ...auditDeals(), scores: sampleScores() };
}
