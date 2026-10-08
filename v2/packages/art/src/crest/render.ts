/**
 * Composes a club identity spec into a circular badge.
 *
 * The badge is always the same three concentric parts, which is what makes 399
 * different clubs look like one set:
 *
 *   rim    — a solid ring, r 44.5 → 50, almost always the club's second colour
 *   field  — the disc inside it, carrying the pattern (see fields.ts)
 *   device — one silhouette in the middle (see devices.ts)
 *
 * Output is an `<img>`-ready data URI rather than inline JSX on purpose: the
 * share-card exporter (lib/shareCard.ts) rasterises the DOM through
 * <foreignObject> and inlines a computed style onto every element it walks, so
 * an inline <svg> would get its geometry trampled. An <img> is opaque to it,
 * and a data: URI already satisfies its "no external images" requirement.
 */

import { DEVICES, type DeviceKey } from "./devices";
import { fieldDefs, isBusyField, renderField, type FieldKind } from "./fields";
import { contrastInk, darken, lighten, separates, temper } from "../palette";

export interface CrestSpec {
  /** Dominant colour of the disc. */
  base: string;
  /** Second colour: stripes, sash, and the rim unless `rim` says otherwise. */
  accent: string;
  /** Only used by the three-colour fields. */
  third?: string;
  /** Silhouette colour. Defaults to white or near-black over `base`. */
  ink?: string;
  /** Ring colour. Defaults to `accent`. */
  rim?: string;
  field: FieldKind;
  device: DeviceKey;
  /** Stripe / hoop / check / ray count, where the field takes one. */
  n?: number;
  /** Mirrors the asymmetric fields (sash, diagonal, corner). */
  flip?: boolean;
  /** Fine size nudge on the device, 1 = default. */
  size?: number;
}

const VIEW = 100;
/** Where the field stops and the ring begins. */
const FIELD_R = 44.5;
/** Device box as a fraction of the full badge. */
const DEVICE_BOX = 56;

function resolve(spec: CrestSpec) {
  const base = temper(spec.base);
  const accent = temper(spec.accent);
  const ink = spec.ink ? temper(spec.ink) : contrastInk(base);
  const rim = spec.rim
    ? temper(spec.rim)
    : separates(accent, base)
      ? accent
      : darken(base, 0.42);
  // The halo is what lifts the silhouette off a striped or quartered field. It
  // is the field's own dominant colour, so on a plain field it disappears and
  // the device sits flush — same rule, two different looks, no special case.
  const halo = separates(ink, base) ? base : contrastInk(ink);
  return { base, accent, ink, rim, halo };
}

export function renderCrestSvg(spec: CrestSpec): string {
  const { base, accent, ink, rim, halo } = resolve(spec);
  const device = DEVICES[spec.device] ?? DEVICES.markShield;

  const fieldInput = { field: spec.field, base, accent, third: spec.third, n: spec.n, flip: spec.flip };
  const gradient = fieldDefs("g", fieldInput);
  const fill = spec.field === "gradient" ? "url(#g)" : base;

  const boxSize = DEVICE_BOX * (device.scale ?? 1) * (spec.size ?? 1);
  const offset = (VIEW - boxSize) / 2;
  const scale = boxSize / 100;
  const haloWidth = isBusyField(spec.field) ? 5 : 0;

  // `none` and any future empty device leave the field to speak for itself.
  //
  // The silhouette is painted with a gradient rather than one flat colour, and
  // dropped onto a soft shadow. Flat single-fill devices read as stickers
  // pasted onto the disc; two tones and a shadow make the same shape look
  // struck into the badge, which is the difference between these looking
  // drawn and looking placed. The detail layer keeps its own lighter tone, so
  // eyes, panels and arches stay legible as cut-outs.
  const symbol = !device.body
    ? ""
    : [
        haloWidth
          ? `<g fill='${halo}' stroke='${halo}' stroke-width='${haloWidth}' stroke-linejoin='round' stroke-linecap='round'>${device.body}</g>`
          : "",
        `<g fill='#000' opacity='0.18' transform='translate(0 2.4)'>${device.body}</g>`,
        `<g fill='url(#d)'>${device.body}</g>`,
        device.detail ? `<g fill='${halo}'>${device.detail}</g>` : "",
        device.top ? `<g fill='url(#dt)'>${device.top}</g>` : "",
      ].join("");

  return [
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${VIEW} ${VIEW}'>`,
    `<defs>`,
    `<clipPath id='c'><circle cx='50' cy='50' r='${FIELD_R}'/></clipPath>`,
    // One shared light model across every badge — a soft top-left light and a
    // bottom vignette. Weak enough to stay flat and modern, strong enough that
    // the set reads as one system rather than 399 flat stickers.
    `<radialGradient id='s' cx='0.34' cy='0.24' r='0.92'>`,
    `<stop offset='0' stop-color='#fff' stop-opacity='0.09'/>`,
    `<stop offset='0.52' stop-color='#fff' stop-opacity='0'/>`,
    `<stop offset='1' stop-color='#000' stop-opacity='0.15'/>`,
    `</radialGradient>`,
    // Two tones down the silhouette: lit along the top edge, settling into
    // the ink at the foot. Subtle on purpose — at 16px this reads as weight,
    // not as a gradient.
    `<linearGradient id='d' x1='0' y1='0' x2='0' y2='1'>`,
    `<stop offset='0' stop-color='${lighten(ink, 0.3)}'/>`,
    `<stop offset='0.55' stop-color='${ink}'/>`,
    `<stop offset='1' stop-color='${darken(ink, 0.22)}'/>`,
    `</linearGradient>`,
    // The top layer (pupils, hubs) sits a shade brighter so it never
    // disappears into the shaded foot of the body beneath it.
    `<linearGradient id='dt' x1='0' y1='0' x2='0' y2='1'>`,
    `<stop offset='0' stop-color='${lighten(ink, 0.36)}'/>`,
    `<stop offset='1' stop-color='${ink}'/>`,
    `</linearGradient>`,
    gradient,
    `</defs>`,
    `<circle cx='50' cy='50' r='50' fill='${rim}'/>`,
    `<g clip-path='url(#c)'>`,
    `<rect x='0' y='0' width='100' height='100' fill='${fill}'/>`,
    renderField(fieldInput),
    `</g>`,
    symbol
      ? `<g transform='translate(${offset.toFixed(2)} ${offset.toFixed(2)}) scale(${scale.toFixed(4)})'>${symbol}</g>`
      : "",
    // Hairline where the field meets the ring, then the outer edge, so the
    // badge keeps a crisp silhouette on both the dark app chrome and white.
    `<circle cx='50' cy='50' r='${FIELD_R}' fill='none' stroke='#000' stroke-opacity='0.2' stroke-width='1'/>`,
    `<circle cx='50' cy='50' r='50' fill='url(#s)'/>`,
    `<circle cx='50' cy='50' r='49' fill='none' stroke='#000' stroke-opacity='0.25' stroke-width='2'/>`,
    `</svg>`,
  ].join("");
}

/**
 * Percent-encodes only what an `<img src>` and `fetch()` actually need. Full
 * `encodeURIComponent` would roughly double the string, and these end up in the
 * markup once per crest on screen.
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

/** Cached data URI for a spec. `key` should be stable per club. */
export function crestDataUri(key: string, spec: CrestSpec): string {
  const hit = uriCache.get(key);
  if (hit) return hit;
  const uri = toDataUri(renderCrestSvg(spec));
  uriCache.set(key, uri);
  return uri;
}
