import { ALL_POSITIONS, type Difficulty, type GameMode, type PositionCode } from "@/lib/sim/constants";
import { createRng, nextInt, pickOne, type Rng } from "@/lib/sim/rng";
import { PLAYABLE_COUNTRY_CODES, COUNTRIES } from "@craque/data";

/**
 * The fixed population of careers every baseline is measured over.
 *
 * Generated rather than stored, because a list of ten thousand rows is not
 * reviewable, and because the generator is itself the specification: a corpus
 * you can read in thirty lines is one you can reason about. What makes it a
 * baseline is that the master seed and the shape below never move. Changing
 * either is a visible diff and invalidates every stored number, which is
 * exactly the property we want.
 */

export interface CareerSpec {
  /** Stable label, used as the key a fingerprint is filed under. */
  id: string;
  seed: string;
  mode: GameMode;
  difficulty: Difficulty;
  countryIso: string;
  position: PositionCode;
  /** How this career answers the decisions it is given. */
  policy: DecisionPolicy;
  /**
   * Seed for the decision stream, when it has to differ from the simulation
   * seed. The daily challenge pins one seed for everybody, so this is the only
   * way to play the same dealt hand down several different lines.
   */
  policySeed?: string;
}

/**
 * How a simulated player chooses.
 *
 * Three, because one is not enough to trust a baseline. `first` walks the
 * lowest-effort line and is the one that reproduces byte for byte with no
 * randomness at all. `ambitious` walks the line a real player takes, which is
 * where the offer market, the briefs and the trophy odds actually get
 * exercised. `varied` spreads across the decision tree so rare branches (the
 * career-threatening injury, the nationality switch, the legend tribute) turn
 * up at all.
 */
export type DecisionPolicy = "first" | "ambitious" | "varied";

/** Countries with a league the simulation actually models. */
const PLAYABLE_ISO: string[] = COUNTRIES.filter(
  (country) => country.fifa_code && PLAYABLE_COUNTRY_CODES.has(country.fifa_code.toUpperCase()),
).map((country) => country.iso_alpha2);

/**
 * Nations that have a national team but no domestic competition here.
 *
 * Kept in deliberately, and only in the wide statistical corpus: a career that
 * has to begin abroad is a real career shape, and the offer and call-up paths
 * it exercises are ones no playable-country career ever reaches.
 */
const FOREIGN_ISO: string[] = ["PT", "NL", "BE", "HR", "SN", "MA", "JP", "KR"];

export interface CorpusShape {
  /** Never change this. Every stored baseline is a function of it. */
  masterSeed: string;
  /** Exactly reproduced careers, digested season by season. */
  fingerprintCount: number;
  /** The wide population the distributions are read off. */
  aggregateCount: number;
  /** Days of the daily challenge audited. */
  challengeDays: number;
  /** The first day audited, so the window never drifts with the calendar. */
  challengeFrom: string;
}

export const CORPUS: CorpusShape = {
  masterSeed: "craque-balance-v1",
  // Twenty per position, which is enough that a change to any one position's
  // weights, curves or output rates cannot hide.
  fingerprintCount: 240,
  // Sized off the rarest thing measured: a generational talent is roughly one
  // hard-mode career in a hundred, and the award targets are expressed as a
  // percentage of those, so the population has to hold enough of them for a
  // percentage to mean anything.
  aggregateCount: 6000,
  challengeDays: 180,
  challengeFrom: "2026-01-01",
};

function positionAt(index: number): PositionCode {
  return ALL_POSITIONS[index % ALL_POSITIONS.length]!;
}

/**
 * The reproducible set: every position, both modes, both difficulties, and a
 * playable country, cycled rather than sampled so the coverage is exact rather
 * than probable.
 */
export function fingerprintCorpus(shape: CorpusShape = CORPUS): CareerSpec[] {
  const specs: CareerSpec[] = [];
  const policies: DecisionPolicy[] = ["first", "ambitious", "varied"];

  for (let i = 0; i < shape.fingerprintCount; i += 1) {
    const position = positionAt(i);
    const mode: GameMode = i % 2 === 0 ? "normal" : "long";
    const difficulty: Difficulty = i % 4 < 2 ? "normal" : "hard";
    const countryIso = PLAYABLE_ISO[i % PLAYABLE_ISO.length]!;
    specs.push({
      id: `fp-${String(i).padStart(3, "0")}-${position}-${mode}-${difficulty}`,
      seed: `${shape.masterSeed}:fp:${i}`,
      mode,
      difficulty,
      countryIso,
      position,
      policy: policies[i % policies.length]!,
    });
  }
  return specs;
}

/**
 * The wide set, drawn off the master seed so it is reproducible without being
 * stored. Skewed towards hard mode, because that is where the challenge lives
 * and where the award targets were written.
 */
export function aggregateCorpus(shape: CorpusShape = CORPUS): CareerSpec[] {
  const specs: CareerSpec[] = [];
  let rng: Rng = createRng(`${shape.masterSeed}:aggregate`);

  const countries = [...PLAYABLE_ISO, ...FOREIGN_ISO];

  for (let i = 0; i < shape.aggregateCount; i += 1) {
    const position = pickOne(rng, ALL_POSITIONS);
    rng = position.rng;
    const country = pickOne(rng, countries);
    rng = country.rng;
    const modeRoll = nextInt(rng, 0, 99);
    rng = modeRoll.rng;
    const difficultyRoll = nextInt(rng, 0, 99);
    rng = difficultyRoll.rng;
    const policyRoll = nextInt(rng, 0, 99);
    rng = policyRoll.rng;

    specs.push({
      id: `ag-${String(i).padStart(5, "0")}`,
      seed: `${shape.masterSeed}:ag:${i}`,
      mode: modeRoll.value < 70 ? "normal" : "long",
      difficulty: difficultyRoll.value < 60 ? "hard" : "normal",
      countryIso: country.item,
      position: position.item,
      policy: policyRoll.value < 20 ? "first" : policyRoll.value < 60 ? "ambitious" : "varied",
    });
  }
  return specs;
}

/** The audited window of daily challenges, as calendar day ids. */
export function challengeDays(shape: CorpusShape = CORPUS): string[] {
  const start = Date.parse(`${shape.challengeFrom}T00:00:00Z`);
  const days: string[] = [];
  for (let i = 0; i < shape.challengeDays; i += 1) {
    days.push(new Date(start + i * 86_400_000).toISOString().slice(0, 10));
  }
  return days;
}
