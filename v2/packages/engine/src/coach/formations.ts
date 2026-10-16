import type { Position } from "../player/positions";
import type { FormationId } from "./types";

/** As 11 vagas de cada formação, do goleiro ao ataque. */
export const FORMATION_SLOTS: Readonly<Record<FormationId, readonly Position[]>> = {
  "3-4-3": ["gk", "cb", "cb", "cb", "rm", "cm", "cm", "lm", "rw", "st", "lw"],
  "5-4-1": ["gk", "rb", "cb", "cb", "cb", "lb", "rm", "cm", "cm", "lm", "st"],
  "4-4-2": ["gk", "rb", "cb", "cb", "lb", "rm", "cm", "cm", "lm", "st", "st"],
  "4-3-3": ["gk", "rb", "cb", "cb", "lb", "cm", "cdm", "cm", "rw", "st", "lw"],
  "4-2-3-1": ["gk", "rb", "cb", "cb", "lb", "cdm", "cm", "rw", "cam", "lw", "st"],
  "3-5-2": ["gk", "cb", "cb", "cb", "rm", "cm", "cdm", "cm", "lm", "st", "st"],
  "5-3-2": ["gk", "rb", "cb", "cb", "cb", "lb", "cm", "cdm", "cm", "st", "st"],
  "4-1-4-1": ["gk", "rb", "cb", "cb", "lb", "cdm", "rm", "cm", "cm", "lm", "st"],
};
