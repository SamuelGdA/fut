import { roundedAttributes } from "@/lib/sim/attributes";
import type { CareerState, SeasonSnapshot } from "@/lib/sim/career";
import { fingerprintCorpus, type CareerSpec } from "../corpus";
import { digest } from "../digest";
import { playCareer } from "../play";

/**
 * The exact mirror.
 *
 * Every other runner in this folder measures whether the game still *feels*
 * the same. This one measures whether it is the same, season by season, down
 * to the rounded attribute. A refactor that preserves behaviour leaves every
 * digest below untouched; one that does not says so immediately, and says
 * which career and which season it happened in.
 *
 * Per-season digests cost some file size and buy the thing that matters when
 * a regression does turn up: a diff that points at age 24 of one career
 * instead of at a wall of changed hashes.
 */

export interface SeasonPrint {
  age: number;
  digest: string;
}

export interface CareerPrint {
  id: string;
  /** The whole career, in one value. */
  digest: string;
  /** Readable enough that a diff is legible without re-running anything. */
  summary: {
    seasons: number;
    decisions: number;
    peakOverall: number;
    finalOverall: number;
    appearances: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    trophies: number;
    awards: number;
    caps: number;
    clubs: number;
    talentTier: string;
    potential: number;
    trait: string;
    retirementReason: string;
    rival: string;
  };
  seasonPrints: SeasonPrint[];
}

export interface FingerprintReport {
  corpusSize: number;
  stalled: string[];
  careers: CareerPrint[];
}

/**
 * Everything about a season that the player can see, and nothing else.
 *
 * Deliberately excludes the generator state and the pending decision: those
 * are implementation, and a refactor is allowed to change how many draws it
 * takes to reach the same football. It does include the rounded attributes,
 * because the card is the thing the game is actually about.
 */
function seasonShape(season: SeasonSnapshot, position: string) {
  return {
    age: season.age,
    teamId: season.teamId,
    tier: season.leagueTier,
    onLoan: season.onLoan,
    suspended: season.suspended,
    overall: season.overall,
    attributes: roundedAttributes(season.attributes, position as never),
    marketValue: Math.round(season.marketValue),
    stats: season.stats,
    trophies: [...season.trophies].sort(),
    awards: [...season.awards].sort(),
    relegated: season.relegated,
    promoted: season.promoted,
    shirtNumber: season.shirtNumber,
    knock: season.knock ? { type: season.knock.type, missed: season.knock.matchesMissed } : null,
    clubStars: season.clubStars ?? null,
  };
}

function careerShape(state: CareerState) {
  const position = state.player.position;
  return {
    identity: {
      position,
      nationality: state.player.nationality.fifa_code,
      mode: state.mode,
      difficulty: state.difficulty,
    },
    talent: {
      tier: state.player.talentTier,
      potential: state.player.potential,
      trait: state.player.trait,
      profile: state.player.developmentProfile,
    },
    seasons: state.seasons.map((season) => seasonShape(season, position)),
    national: state.nationalTeamStats,
    firstCallUpAge: state.firstCallUpAge,
    fanSupport: Math.round(state.fanSupport),
    shirtNumber: state.shirtNumber,
    betrayedClubs: [...(state.betrayedClubs ?? [])].sort(),
    rival: state.rival ? { name: state.rival.name, potential: state.rival.potential } : null,
    retirementReason: state.retirementReason,
    headlineKeys: state.headlines.map((headline) => `${headline.age}:${headline.key}`),
  };
}

function summarise(state: CareerState, decisions: number): CareerPrint["summary"] {
  const totals = state.seasons.reduce(
    (acc, season) => ({
      appearances: acc.appearances + season.stats.appearances,
      goals: acc.goals + season.stats.goals,
      assists: acc.assists + season.stats.assists,
      cleanSheets: acc.cleanSheets + season.stats.cleanSheets,
      trophies: acc.trophies + season.trophies.length,
      awards: acc.awards + season.awards.length,
    }),
    { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, trophies: 0, awards: 0 },
  );

  return {
    seasons: state.seasons.length,
    decisions,
    peakOverall: state.seasons.reduce((max, s) => Math.max(max, s.overall), state.player.overall),
    finalOverall: state.player.overall,
    ...totals,
    caps: state.nationalTeamStats.caps,
    clubs: new Set(state.seasons.map((season) => season.teamId)).size,
    talentTier: state.player.talentTier,
    potential: state.player.potential,
    trait: state.player.trait,
    retirementReason: state.retirementReason ?? "none",
    rival: state.rival?.name ?? "none",
  };
}

export function printCareer(spec: CareerSpec): { print: CareerPrint; stalled: boolean } {
  const played = playCareer(spec);
  const position = played.state.player.position;

  return {
    stalled: played.stalled,
    print: {
      id: spec.id,
      digest: digest(careerShape(played.state)),
      summary: summarise(played.state, played.decisions),
      seasonPrints: played.state.seasons.map((season) => ({
        age: season.age,
        digest: digest(seasonShape(season, position)),
      })),
    },
  };
}

export function runFingerprints(): FingerprintReport {
  const specs = fingerprintCorpus();
  const careers: CareerPrint[] = [];
  const stalled: string[] = [];

  for (const spec of specs) {
    const result = printCareer(spec);
    careers.push(result.print);
    if (result.stalled) stalled.push(spec.id);
  }

  return { corpusSize: specs.length, stalled, careers };
}
