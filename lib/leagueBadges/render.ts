/**
 * Generated league badges, for the competitions the asset set never shipped.
 *
 * The twenty-four leagues that came with the game all have real brand artwork,
 * so nothing needed this until a second division was added to eight countries
 * that had none. Drawing eight one-off files would have been the obvious move
 * and the wrong one: the moment a ninth league is added the problem is back.
 * This builds them the way `lib/trophies` builds a missing trophy and
 * `lib/crests` builds a club badge, from the country's own colours and the
 * league's own initials, so the whole set reads as one family.
 *
 * **Never a circle.** Both places a league badge appears put it immediately
 * beside a club crest, and every club crest is a disc. A round league badge
 * would read as a second club. A flat-topped shield is the universal
 * competition mark and is unmistakably not a disc even at ten pixels, which is
 * the size it is actually drawn at on the player card.
 *
 * Output is a data URI, like the crests, so it drops into the same `<img>` the
 * shipped SVGs use and so the share-card exporter — which refuses external
 * images and would taint its canvas on one — keeps working.
 */

import { fieldDefs, renderField, type FieldInput, type FieldKind } from "@/lib/crests/fields";
import { contrastInk, darken, isLight } from "@/lib/crests/palette";

export interface LeagueBadgeSpec {
  /** Field colour. */
  base: string;
  /** Stripes, bands and the frame. */
  accent: string;
  /** Third band, for the tricolours. */
  third?: string;
  field: FieldKind;
  /** Stripe or band count. */
  n?: number;
  flip?: boolean;
  /** Two or three letters struck into the foot. ASCII only — see `toDataUri`. */
  mark: string;
  /** Second tier and below get a darker field and a steel foot. */
  tier: number;
}

/**
 * Square, though the shield is not.
 *
 * The share card lays the badge out in a square box beside a square club crest
 * (`fcCardCanvas.ts`) and both UI call sites force square classes, so a 4:5
 * viewBox would sit visibly narrower than its neighbours. Explicit `width` and
 * `height` as well as the viewBox, because `drawContain` reads `naturalWidth`
 * and an SVG with only a viewBox reports zero.
 */
const VIEW = 100;

/** Flat shoulders, straight sides, a rounded point — a competition shield. */
const SHIELD = "M14 8h72v46c0 22-16 33-36 40C30 87 14 76 14 54Z";

/** The band the initials are struck into, so they read over any field. */
const FOOT = "M14 54h72c0 8-2 14-5 19H19c-3-5-5-11-5-19Z";

export function renderLeagueBadgeSvg(spec: LeagueBadgeSpec): string {
  const id = "l";
  const secondary = spec.tier > 1;
  const base = secondary ? darken(spec.base, 0.28) : spec.base;
  const foot = secondary ? "#7C858F" : spec.accent;
  const input: FieldInput = {
    field: spec.field,
    base,
    accent: spec.accent,
    third: spec.third,
    n: spec.n,
    flip: spec.flip,
  };
  const defs = fieldDefs(id, input);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}">`,
    defs ? `<defs>${defs}<clipPath id="${id}-c"><path d="${SHIELD}"/></clipPath></defs>` : `<defs><clipPath id="${id}-c"><path d="${SHIELD}"/></clipPath></defs>`,
    `<path d="${SHIELD}" fill="${spec.field === "gradient" ? `url(#${id}-g)` : base}"/>`,
    `<g clip-path="url(#${id}-c)">${renderField(input)}</g>`,
    `<path d="${FOOT}" fill="${foot}"/>`,
    `<path d="${FOOT}" fill="#ffffff" opacity="0.14"/>`,
    `<text x="50" y="70" text-anchor="middle" font-family="Archivo, Arial Black, sans-serif" font-size="${spec.mark.length > 2 ? 17 : 21}" font-weight="900" fill="${contrastInk(foot)}">${spec.mark}</text>`,
    // A hairline of the accent so the shield keeps an edge on a dark panel.
    `<path d="${SHIELD}" fill="none" stroke="${isLight(base) ? "#00000038" : "#ffffff40"}" stroke-width="3"/>`,
    `</svg>`,
  ].join("");
}

/**
 * Percent-encodes what an `<img src>` needs. Taken from `lib/crests`, not from
 * `lib/trophies`: the crest version escapes `%` and `&` as well, which pure
 * geometry can get away with skipping but a `<text>` node cannot.
 */
function toDataUri(svg: string): string {
  const body = svg
    .replace(/\s+/g, " ")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/&/g, "%26")
    .replace(/"/g, "%22")
    .replace(/ /g, "%20");
  return `data:image/svg+xml,${body}`;
}

const uriCache = new Map<string, string>();

/** Cached data URI for a spec. `key` should be stable per league. */
export function leagueBadgeDataUri(key: string, spec: LeagueBadgeSpec): string {
  const hit = uriCache.get(key);
  if (hit) return hit;
  const uri = toDataUri(renderLeagueBadgeSvg(spec));
  uriCache.set(key, uri);
  return uri;
}
