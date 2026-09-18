/**
 * Field patterns — the coloured composition that fills the disc behind the
 * symbol. This is the layer that does most of the recognition work at small
 * sizes: long before anyone can make out a bull or a lighthouse they can read
 * "black-and-white vertical stripes" or "red with a white sash".
 *
 * Every renderer draws inside a 100x100 box that is clipped to the field circle
 * by the composer, so shapes are allowed to overhang the edges.
 */

import { darken, lighten, mix } from "./palette";

export type FieldKind =
  | "solid"
  /** Two vertical halves. */
  | "halves"
  /** Two horizontal halves. */
  | "halvesH"
  /** Classic shirt stripes; `n` = total stripe count (odd reads best). */
  | "stripes"
  /** Wide horizontal bands. */
  | "hoops"
  /** A single fat band across the middle. */
  | "band"
  /** Two stacked bands in different colours — São Paulo's red-and-black. */
  | "bandDouble"
  /** A single fat vertical band down the middle (Spanish/Argentine "franja"). */
  | "bandV"
  /** Diagonal sash. `flip` swaps the shoulder it comes off. */
  | "sash"
  /** Two thin diagonal pinstripes. */
  | "bendThin"
  /** The disc split along a diagonal. */
  | "diagonal"
  /** Heraldic quarters. */
  | "quarters"
  /** Upright cross. */
  | "cross"
  /** Diagonal cross. */
  | "saltire"
  /** Chevron pointing up. */
  | "chevron"
  /** Triangle dropping from the top. */
  | "pile"
  /** Sunburst wedges from the centre. */
  | "rays"
  /** Concentric ring inside the field. */
  | "orbit"
  /** Checkerboard. */
  | "checks"
  /** Three vertical bands using `third`. */
  | "tricolor"
  /** Three horizontal bands using `third`. */
  | "tricolorH"
  /** Wavy horizontal split — coastal and river clubs. */
  | "waves"
  /** Horizon: bottom half accent with a soft arc, like a rising sun. */
  | "horizon"
  /** Single corner wedge. */
  | "corner"
  /** Smooth vertical gradient of the base colour alone. */
  | "gradient";

export interface FieldInput {
  field: FieldKind;
  base: string;
  accent: string;
  third?: string;
  n?: number;
  flip?: boolean;
}

const rect = (x: number, y: number, w: number, h: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;

function stripes(base: string, accent: string, n: number, vertical: boolean): string {
  const count = Math.max(3, n);
  const w = 100 / count;
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) {
    if (i % 2 === 0) continue;
    const at = i * w;
    // A hairline of overlap keeps antialiasing from showing seams when the
    // whole badge is scaled down to 16px.
    out.push(vertical ? rect(at - 0.15, -5, w + 0.3, 110, accent) : rect(-5, at - 0.15, 110, w + 0.3, accent));
  }
  return out.join("");
}

function checks(base: string, accent: string, n: number): string {
  const size = 100 / n;
  const out: string[] = [];
  for (let row = 0; row < n; row += 1) {
    for (let col = 0; col < n; col += 1) {
      if ((row + col) % 2 === 0) continue;
      out.push(rect(col * size - 0.1, row * size - 0.1, size + 0.2, size + 0.2, accent));
    }
  }
  return out.join("");
}

function rays(accent: string, n: number): string {
  const out: string[] = [];
  const step = 360 / n;
  for (let i = 0; i < n; i += 1) {
    if (i % 2 === 1) continue;
    out.push(
      `<path d="M50,50 L50,-20 A70,70 0 0,1 ${(50 + 70 * Math.sin((step * Math.PI) / 180)).toFixed(2)},${(
        50 -
        70 * Math.cos((step * Math.PI) / 180)
      ).toFixed(2)} Z" fill="${accent}" transform="rotate(${(i * step).toFixed(2)} 50 50)"/>`,
    );
  }
  return out.join("");
}

export function renderField({ field, base, accent, third, n, flip }: FieldInput): string {
  const t = third ?? lighten(accent, 0.45);

  switch (field) {
    case "solid":
      return "";

    case "gradient":
      // Declared by the composer; nothing to draw on top of the gradient fill.
      return "";

    case "halves":
      return rect(50, -5, 55, 110, accent);

    case "halvesH":
      return rect(-5, 50, 110, 55, accent);

    case "stripes":
      return stripes(base, accent, n ?? 7, true);

    case "hoops":
      return stripes(base, accent, n ?? 7, false);

    case "band":
      return rect(-5, 36, 110, 28, accent);

    case "bandDouble":
      return rect(-5, 30, 110, 21, accent) + rect(-5, 51, 110, 21, t);

    case "bandV":
      return rect(36, -5, 28, 110, accent);

    case "sash":
      return `<rect x="-30" y="35" width="160" height="30" fill="${accent}" transform="rotate(${
        flip ? 45 : -45
      } 50 50)"/>`;

    case "bendThin":
      return [
        `<rect x="-30" y="28" width="160" height="11" fill="${accent}" transform="rotate(${flip ? 45 : -45} 50 50)"/>`,
        `<rect x="-30" y="61" width="160" height="11" fill="${accent}" transform="rotate(${flip ? 45 : -45} 50 50)"/>`,
      ].join("");

    case "diagonal":
      return flip
        ? `<path d="M-5,-5 L105,-5 L-5,105 Z" fill="${accent}"/>`
        : `<path d="M105,-5 L105,105 L-5,105 Z" fill="${accent}"/>`;

    case "quarters":
      return rect(-5, -5, 55, 55, accent) + rect(50, 50, 55, 55, accent);

    case "cross":
      return rect(38, -5, 24, 110, accent) + rect(-5, 38, 110, 24, accent);

    case "saltire":
      return [
        `<rect x="-40" y="39" width="180" height="22" fill="${accent}" transform="rotate(45 50 50)"/>`,
        `<rect x="-40" y="39" width="180" height="22" fill="${accent}" transform="rotate(-45 50 50)"/>`,
      ].join("");

    case "chevron":
      return `<path d="M50,10 L108,68 L108,102 L50,44 L-8,102 L-8,68 Z" fill="${accent}"/>`;

    case "pile":
      return `<path d="M-5,-5 L105,-5 L50,105 Z" fill="${accent}"/>`;

    case "rays":
      return rays(accent, n ?? 12);

    case "orbit":
      return `<circle cx="50" cy="50" r="35" fill="none" stroke="${accent}" stroke-width="13"/>`;

    case "checks":
      return checks(base, accent, n ?? 4);

    case "tricolor":
      return rect(33.3, -5, 33.6, 110, accent) + rect(66.7, -5, 38, 110, t);

    case "tricolorH":
      return rect(-5, 33.3, 110, 33.6, accent) + rect(-5, 66.7, 110, 38, t);

    case "waves":
      return [
        `<path d="M-5,58 C15,46 30,70 50,58 C70,46 85,70 105,58 L105,105 L-5,105 Z" fill="${accent}"/>`,
        `<path d="M-5,72 C15,60 30,84 50,72 C70,60 85,84 105,72 L105,105 L-5,105 Z" fill="${mix(
          accent,
          "#ffffff",
          0.28,
        )}" opacity="0.55"/>`,
      ].join("");

    case "horizon":
      return [
        rect(-5, 56, 110, 50, accent),
        `<circle cx="50" cy="56" r="26" fill="${t}"/>`,
      ].join("");

    case "corner":
      return flip
        ? `<path d="M105,-5 L105,60 L40,-5 Z" fill="${accent}"/>`
        : `<path d="M-5,-5 L60,-5 L-5,60 Z" fill="${accent}"/>`;

    default:
      return "";
  }
}

/** Fields where the symbol needs a halo to stay legible. */
export function isBusyField(field: FieldKind): boolean {
  return (
    field !== "solid" && field !== "gradient" && field !== "horizon" && field !== "corner"
  );
}

/** Optional `<defs>` content a field needs (only the gradient uses one). */
export function fieldDefs(id: string, { field, base }: FieldInput): string {
  if (field !== "gradient") return "";
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(
    base,
    0.22,
  )}"/><stop offset="1" stop-color="${darken(base, 0.3)}"/></linearGradient>`;
}
