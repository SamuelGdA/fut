import { nextInt, type Rng } from "./rng";
import type { PositionCode } from "./constants";

/**
 * The numbers a squad actually associates with each position — the ones a club
 * hands out as a statement rather than as admin. Everything else in a squad
 * list is just a number, which is why the initial draw mostly lands outside
 * this set: you are sixteen, and the 10 shirt belongs to someone else.
 */
export const PRESTIGE_NUMBERS_BY_POSITION: Record<PositionCode, number[]> = {
  GK: [1, 12, 13],
  ST: [7, 9, 10, 11],
  LW: [7, 9, 10, 11],
  RW: [7, 9, 10, 11],
  CAM: [5, 6, 8, 10],
  CM: [5, 6, 8, 10],
  CDM: [5, 6, 8, 10],
  LB: [2, 3, 6],
  RB: [2, 3, 6],
  CB: [3, 4, 5],
  LM: [7, 8, 10, 11],
  RM: [7, 8, 10, 11],
};

/**
 * The first-team numbers that belong to each position, in the traditional
 * 1-11 reading of a team sheet.
 *
 * Only used for the legend's tribute, which is the one moment a player picks
 * their own shirt. The board opening the whole list meant a striker could be
 * offered the 4, which is not a tribute — it is a filing error. A goalkeeper
 * has exactly one number here, and that is the point of it.
 */
export const LEGEND_NUMBERS_BY_POSITION: Record<PositionCode, number[]> = {
  GK: [1],
  RB: [2, 4],
  LB: [3, 6],
  CB: [3, 4, 5, 6],
  CDM: [4, 5, 6, 8],
  CM: [6, 8, 10],
  CAM: [8, 10, 11],
  LM: [7, 11],
  RM: [7, 11],
  LW: [7, 10, 11],
  RW: [7, 10, 11],
  ST: [9, 10, 11],
};

/** Squad numbers handed out to nobody in particular start here. */
export const SQUAD_NUMBER_MIN = 12;
export const SQUAD_NUMBER_MAX = 99;

/**
 * Odds a first-ever squad number happens to be one of the position's marquee
 * shirts. Deliberately low — a teenager walking straight into the 9 is a story
 * precisely because it almost never happens.
 */
const INITIAL_PRESTIGE_CHANCE = 0.18;

/** How many shirts the club puts on the table when it offers an upgrade. */
const UPGRADE_OFFER_SIZE = 3;
/** How many the board offers when a legend gets to name their own number. */
const TRIBUTE_OFFER_SIZE = 5;

/** The first-team shirts this position wears, 1-11. */
export function legendNumbersFor(position: PositionCode): number[] {
  return LEGEND_NUMBERS_BY_POSITION[position] ?? [];
}

export function prestigeNumbersFor(position: PositionCode): number[] {
  return PRESTIGE_NUMBERS_BY_POSITION[position] ?? [];
}

/** True for the shirts that read as "this is our player" rather than admin. */
export function isPrestigeNumber(position: PositionCode, value: number): boolean {
  return prestigeNumbersFor(position).includes(value);
}

function pickDistinct(rng: Rng, pool: number[], count: number): { rng: Rng; picked: number[] } {
  const remaining = [...pool];
  const picked: number[] = [];
  let cur = rng;
  while (picked.length < count && remaining.length > 0) {
    const roll = nextInt(cur, 0, remaining.length - 1);
    cur = roll.rng;
    picked.push(remaining.splice(roll.value, 1)[0]);
  }
  return { rng: cur, picked };
}

/**
 * The shirt handed over on signing a first professional contract. Mostly a
 * forgettable two-digit number; occasionally, the club takes a punt and gives
 * the kid something that means something.
 */
export function rollInitialShirtNumber(
  rng: Rng,
  position: PositionCode,
): { rng: Rng; value: number } {
  const prestige = prestigeNumbersFor(position);
  const gate = nextInt(rng, 1, 100);
  let cur = gate.rng;

  if (prestige.length > 0 && gate.value <= Math.round(INITIAL_PRESTIGE_CHANCE * 100)) {
    const pick = nextInt(cur, 0, prestige.length - 1);
    return { rng: pick.rng, value: prestige[pick.value] };
  }

  const generic = nextInt(cur, SQUAD_NUMBER_MIN, SQUAD_NUMBER_MAX);
  cur = generic.rng;
  return { rng: cur, value: generic.value };
}

/**
 * The shirts a club puts on the table when a player has earned a promotion in
 * the squad list. Only ever the position's marquee numbers, and never the one
 * already on the player's back.
 */
export function rollShirtUpgradeOffer(
  rng: Rng,
  position: PositionCode,
  current: number,
): { rng: Rng; numbers: number[] } {
  const pool = prestigeNumbersFor(position).filter((n) => n !== current);
  const { rng: after, picked } = pickDistinct(rng, pool, Math.min(UPGRADE_OFFER_SIZE, pool.length));
  return { rng: after, numbers: picked.sort((a, b) => a - b) };
}

/**
 * A legend gets to name their number, drawn from the first-team shirts their
 * position actually wears. A striker is offered the 9, 10 or 11; a keeper is
 * offered the 1, because that is the only one there is.
 */
export function rollLegendTributeOffer(
  rng: Rng,
  position: PositionCode,
  current: number,
): { rng: Rng; numbers: number[] } {
  const pool = legendNumbersFor(position).filter((n) => n !== current);
  const { rng: after, picked } = pickDistinct(
    rng,
    pool,
    Math.min(TRIBUTE_OFFER_SIZE, pool.length),
  );
  return { rng: after, numbers: picked.sort((a, b) => a - b) };
}
