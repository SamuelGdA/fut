/**
 * Circular club identities.
 *
 *   import { teamCrestUrl } from "@/lib/crests";
 *   <img src={teamCrestUrl(team.id)} />
 *
 * Every club in the game gets one, curated (clubs.ts) or derived (derive.ts),
 * so callers never have to handle a missing badge.
 */

import { CLUB_CRESTS } from "./clubs";
import { deriveSpec } from "./derive";
import { crestDataUri, renderCrestSvg, type CrestSpec } from "./render";

export type { CrestSpec } from "./render";
export type { FieldKind } from "./fields";
export type { DeviceKey } from "./devices";
export { CLUB_CRESTS } from "./clubs";

const specCache = new Map<string, CrestSpec>();

/** The identity a club resolves to, curated or derived. */
export function getCrestSpec(teamId: string): CrestSpec {
  const hit = specCache.get(teamId);
  if (hit) return hit;
  const spec = CLUB_CRESTS[teamId] ?? deriveSpec(teamId);
  specCache.set(teamId, spec);
  return spec;
}

/** Whether this club's identity was designed by hand rather than derived. */
export function isCuratedCrest(teamId: string): boolean {
  return teamId in CLUB_CRESTS;
}

/** Ready to drop straight into an `<img src>`. Cached per club. */
export function teamCrestUrl(teamId: string | null | undefined): string | undefined {
  if (!teamId) return undefined;
  return crestDataUri(teamId, getCrestSpec(teamId));
}

/** Raw SVG markup — for the gallery page and for anything that inlines it. */
export function teamCrestSvg(teamId: string): string {
  return renderCrestSvg(getCrestSpec(teamId));
}
