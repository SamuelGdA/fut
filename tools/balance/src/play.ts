import { chooseOption, startCareer, type CareerState, type DecisionOption } from "@/lib/sim/career";
import { getTeam } from "@craque/data";
import { createRng, nextInt, type Rng } from "@/lib/sim/rng";
import type { CareerSpec, DecisionPolicy } from "./corpus";

/**
 * Plays a whole career without a player, so a baseline can be taken.
 *
 * The policies are not AI. They are three fixed ways of answering, chosen so
 * that between them they walk the parts of the decision tree that matter, and
 * so that the same spec always produces the same career on any machine.
 */

/** Nothing legitimate needs more than this; anything that does is a stuck loop. */
const MAX_DECISIONS = 400;

export interface PlayedCareer {
  spec: CareerSpec;
  state: CareerState;
  /** How many decisions were answered before the career ended. */
  decisions: number;
  /** True when the loop guard fired instead of the career ending on its own. */
  stalled: boolean;
}

function clubReputation(option: DecisionOption): number {
  if (!option.teamId) return -1;
  const team = getTeam(option.teamId);
  if (!team) return -1;
  return (team.domestic_reputation + team.international_reputation) / 2;
}

/**
 * Picks the biggest badge on the table, and stays put when nothing on it is an
 * upgrade. Retirement is only ever taken when it is the only thing offered,
 * so this policy always plays the career out to its natural end.
 */
function ambitiousChoice(options: DecisionOption[]): DecisionOption {
  const playable = options.filter((option) => option.type !== "retire");
  if (playable.length === 0) return options[0]!;
  return playable.reduce((best, option) =>
    clubReturn(option) > clubReturn(best) ? option : best,
  );
}

/**
 * How attractive an option is to the ambitious policy. A club is worth its
 * badge; anything without a club (a training focus, a narrative answer) sits
 * just above the worst club so those decisions still resolve to their first
 * option rather than being treated as the best move on the board.
 */
function clubReturn(option: DecisionOption): number {
  if (option.type === "retire") return -100;
  const reputation = clubReputation(option);
  return reputation >= 0 ? reputation : -0.5;
}

function chooseBy(
  policy: DecisionPolicy,
  options: DecisionOption[],
  rng: Rng,
): { option: DecisionOption; rng: Rng } {
  const survivable = options.filter((option) => option.type !== "retire");
  const pool = survivable.length > 0 ? survivable : options;

  if (policy === "first") return { option: pool[0]!, rng };
  if (policy === "ambitious") return { option: ambitiousChoice(pool), rng };

  const roll = nextInt(rng, 0, pool.length - 1);
  return { option: pool[roll.value]!, rng: roll.rng };
}

export function playCareer(spec: CareerSpec): PlayedCareer {
  let state = startCareer(
    spec.seed,
    spec.mode,
    {
      lastName: "BASELINE",
      foot: "right",
      countryIso: spec.countryIso,
      position: spec.position,
    },
    spec.difficulty,
  );

  // A stream of its own, so how a policy chooses can never disturb the
  // simulation's own sequence of draws.
  let policyRng = createRng(`${spec.policySeed ?? spec.seed}:policy`);
  let decisions = 0;

  while (state.phase === "career" && state.currentEvent && decisions < MAX_DECISIONS) {
    const options = state.currentEvent.options;
    if (options.length === 0) break;
    const picked = chooseBy(spec.policy, options, policyRng);
    policyRng = picked.rng;
    const next = chooseOption(state, picked.option.id);
    // `chooseOption` returns the same object when it refuses a choice, which
    // would spin here forever rather than failing loudly.
    if (next === state) break;
    state = next;
    decisions += 1;
  }

  return {
    spec,
    state,
    decisions,
    stalled: state.phase === "career" && decisions >= MAX_DECISIONS,
  };
}
