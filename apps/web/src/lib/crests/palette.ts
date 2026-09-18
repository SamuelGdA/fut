/**
 * Colour helpers shared by the crest system.
 *
 * Everything here works on `#rrggbb` strings because that is what the dataset
 * and the kit database already speak; nothing else in the game needs a colour
 * model, so there is no dependency to pull in for this.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function toRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0,
  };
}

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}

/** Perceived brightness, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const { r, g, b } = toRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isLight(hex: string): boolean {
  return luminance(hex) > 0.62;
}

export function darken(hex: string, amount: number): string {
  const { r, g, b } = toRgb(hex);
  const k = 1 - amount;
  return toHex({ r: r * k, g: g * k, b: b * k });
}

export function lighten(hex: string, amount: number): string {
  const { r, g, b } = toRgb(hex);
  return toHex({
    r: r + (255 - r) * amount,
    g: g + (255 - g) * amount,
    b: b + (255 - b) * amount,
  });
}

export function mix(a: string, b: string, t: number): string {
  const ca = toRgb(a);
  const cb = toRgb(b);
  return toHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

/** Crude but sufficient separation metric — max channel distance, 0..1. */
export function distance(a: string, b: string): number {
  const ca = toRgb(a);
  const cb = toRgb(b);
  return Math.max(Math.abs(ca.r - cb.r), Math.abs(ca.g - cb.g), Math.abs(ca.b - cb.b)) / 255;
}

/** Whether two colours are far enough apart to stack one on the other. */
export function separates(a: string, b: string): boolean {
  return Math.abs(luminance(a) - luminance(b)) > 0.22 || distance(a, b) > 0.45;
}

/** Black or white, whichever survives on top of `hex`. */
export function contrastInk(hex: string): string {
  return isLight(hex) ? "#12161f" : "#ffffff";
}

/**
 * Pull a colour away from pure white / pure black just enough that the rim and
 * the field never melt into each other or into the app's dark background.
 */
export function temper(hex: string): string {
  const l = luminance(hex);
  if (l > 0.96) return "#f2f4f7";
  if (l < 0.05) return "#0d1017";
  return hex;
}
