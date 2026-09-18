/**
 * Automatic identity for a club nobody has hand-authored yet.
 *
 * This is what makes the system scalable: drop a new team into
 * lib/data/leagues.json and it gets a badge that belongs to the same set —
 * same rim, same disc, same device box — without anyone touching this folder.
 * Add a curated entry to clubs.ts later and it simply takes over.
 *
 * Everything is derived from the team id, so a given club always gets the same
 * badge on every device and every session. Nothing is random at runtime.
 */

import { getKitForTeam } from "@/lib/kits";
import { getTeam } from "@/lib/data/dataset";
import { NEUTRAL_DEVICE_KEYS, type DeviceKey } from "./devices";
import type { FieldKind } from "./fields";
import { isLight, lighten, separates } from "./palette";
import type { CrestSpec } from "./render";

/** FNV-1a. Small, stable, and good enough to spread ids across the tables. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Fields a derived club can land on. Deliberately excludes the loudest ones
 * (rays, checks, saltire) — those are reserved for clubs that actually wear
 * them, so an unknown side never shouts louder than a curated one.
 */
const DERIVED_FIELDS: FieldKind[] = [
  "solid",
  "halves",
  "stripes",
  "hoops",
  "band",
  "bandV",
  "sash",
  "diagonal",
  "quarters",
  "cross",
  "chevron",
  "corner",
  "gradient",
  "bendThin",
];

const STRIPE_COUNTS = [5, 7, 9];

/**
 * Last-resort palette, for an id with no dataset row at all. Grey badges would
 * be technically correct and visually useless, so pick a football colour off
 * the hash instead — the set still looks like it belongs to the game.
 */
const FALLBACK_BASES = [
  "#c8102e",
  "#0a3d91",
  "#0b7a3b",
  "#e8a400",
  "#5a2d82",
  "#0f5f6b",
  "#b4460e",
  "#1b2838",
  "#7a1f3d",
  "#00738c",
  "#4b7f2b",
  "#8a1c1c",
];
const FALLBACK_ACCENTS = ["#ffffff", "#12161f", "#f2c14e"];

export function deriveSpec(teamId: string): CrestSpec {
  const team = getTeam(teamId);
  const kit = getKitForTeam(teamId);
  const seed = hash(teamId);

  const known = Boolean(team?.primary_color);
  const base = known ? (kit.base ?? team!.primary_color) : FALLBACK_BASES[seed % FALLBACK_BASES.length];
  let accent = known ? kit.accent : FALLBACK_ACCENTS[(seed >>> 4) % FALLBACK_ACCENTS.length];
  if (!separates(accent, base)) accent = isLight(base) ? "#12161f" : lighten(base, 0.7);

  // The kit already tells us how this club dresses, so honour it when it says
  // something specific and only fall back to the hash for plain shirts.
  let field: FieldKind;
  switch (known ? kit.pattern : "solid") {
    case "vertical_stripes":
      field = "stripes";
      break;
    case "horizontal_stripes":
      field = "hoops";
      break;
    case "diagonal_sash":
      field = "sash";
      break;
    case "checkerboard":
      field = "checks";
      break;
    default:
      field = DERIVED_FIELDS[seed % DERIVED_FIELDS.length];
  }

  // A second, independent slice of the hash picks the symbol, so two clubs that
  // happen to share a field almost never share a device as well.
  const device: DeviceKey = NEUTRAL_DEVICE_KEYS[(seed >>> 8) % NEUTRAL_DEVICE_KEYS.length];

  return {
    base,
    accent,
    field,
    device,
    n: STRIPE_COUNTS[(seed >>> 16) % STRIPE_COUNTS.length],
    flip: ((seed >>> 20) & 1) === 1,
  };
}
