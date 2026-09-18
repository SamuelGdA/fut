import type { League } from "../../types";
import { LEAGUE_ORDER } from "./order";

import arg from "./arg.json";
import bol from "./bol.json";
import bra from "./bra.json";
import chi from "./chi.json";
import col from "./col.json";
import ecu from "./ecu.json";
import eng from "./eng.json";
import esp from "./esp.json";
import fra from "./fra.json";
import ger from "./ger.json";
import ita from "./ita.json";
import mex from "./mex.json";
import par from "./par.json";
import per from "./per.json";
import uru from "./uru.json";
import usa from "./usa.json";
import ven from "./ven.json";

/**
 * One file per country, reassembled into the one list the rest of the game
 * reads.
 *
 * The files are alphabetical because that is what makes a diff reviewable; the
 * assembled list is not, because its order is behaviour. See `order.ts`.
 */
const BY_COUNTRY = [
  arg, bol, bra, chi, col, ecu, eng, esp, fra,
  ger, ita, mex, par, per, uru, usa, ven,
] as unknown as League[][];

const rank = new Map(LEAGUE_ORDER.map((id, index) => [id, index]));

export const LEAGUES: League[] = BY_COUNTRY.flat().sort(
  // A league missing from the order list sorts to the end rather than to the
  // front, so the mistake shows up as new clubs appearing late in the offer
  // pool instead of displacing every existing one. The integrity test is what
  // actually catches it.
  (a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
);

export { LEAGUE_ORDER };
