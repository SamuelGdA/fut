/**
 * The card's rarity spec: the one place the bands, the geometry and the plate
 * colours are written down.
 *
 * The card exists twice by necessity. The one on screen is laid out by the
 * browser; the one in the shared image is painted onto a canvas, because an
 * exported image cannot be laid out. What must never be twice is the
 * *definition*: which ratings are gold, where a band starts and ends, how
 * bright the plate gets near the top of one, and what shape the shield is.
 *
 * Those lived in the React component, which meant the canvas painter had to
 * import a component to find out what colour to paint, and the two palettes
 * could drift apart silently. Both now read from here.
 *
 * This file is deliberately free of any renderer. The DOM styles are CSS
 * strings and the canvas styles are colour stops, which is the one place the
 * two genuinely differ: the same gradient expressed the two ways each renderer
 * can consume.
 */

export type CardTier = "bronze" | "silver" | "gold" | "icon";

/**
 * Four bands, not five.
 *
 * Bronze to 64, silver through 74, a long gold stretch to 93, and a white ICON
 * card reserved for the last six points. The gold band is deliberately the
 * widest: it is where almost every real career lives, and splitting it further
 * made two cards a single point apart look like different classes of player.
 */
export const TIER_BANDS: readonly { tier: CardTier; min: number; max: number }[] = [
  { tier: "icon", min: 94, max: 99 },
  { tier: "gold", min: 75, max: 93 },
  { tier: "silver", min: 65, max: 74 },
  { tier: "bronze", min: 0, max: 64 },
];

export function cardTier(overall: number): CardTier {
  return TIER_BANDS.find((band) => overall >= band.min)?.tier ?? "bronze";
}

/**
 * How far up its own band a rating sits, 0 at the floor and 1 at the ceiling.
 *
 * This drives the polish on the plate: a 93 is the best gold there is and
 * should look it, while a 75 has only just arrived. Kept as a ratio within the
 * band rather than as an absolute so every tier has its own full range of
 * brilliance to climb.
 */
export function tierProgress(overall: number): number {
  const band = TIER_BANDS.find((entry) => overall >= entry.min) ?? TIER_BANDS[TIER_BANDS.length - 1]!;
  const span = band.max - band.min;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (overall - band.min) / span));
}

/**
 * Card geometry per size, in pixels.
 *
 * Fixed rather than a width plus an aspect ratio. The card is often a flex
 * item inside a stretching row, and a stretched cross-size beats
 * `aspect-ratio`, so the old card silently grew taller than 7:10 depending on
 * what happened to sit next to it.
 */
export const FC_CARD_SIZES = {
  xs: { w: 124, h: 177 },
  sm: { w: 164, h: 234 },
  md: { w: 232, h: 331 },
  lg: { w: 300, h: 429 },
} as const;

export type FcCardSize = keyof typeof FC_CARD_SIZES;

/**
 * The shield. Square shoulders, straight sides, a foot tapering to a point.
 *
 * The flat zone runs to 78% so the stat grid never lands inside the taper.
 * Expressed as fractions so the canvas painter can trace the same outline at
 * any size; `SHIELD_CLIP_PATH` is the same polygon as a CSS value.
 */
export const SHIELD_POINTS: readonly (readonly [number, number])[] = [
  [0.5, 0],
  [1, 0.045],
  [1, 0.78],
  [0.5, 1],
  [0, 0.78],
  [0, 0.045],
];

export const SHIELD_CLIP_PATH =
  "polygon(50% 0%, 100% 4.5%, 100% 78%, 50% 100%, 0% 78%, 0% 4.5%)";

/** How the plate reads in the DOM, as CSS. */
export interface TierDomStyle {
  /** The metal itself, top-left to bottom-right. */
  plate: string;
  /** A brighter band swept across the middle of the plate. */
  sheen: string;
  ink: string;
  sub: string;
  /** Hairline separating the name from the numbers. */
  rule: string;
  /** Colour of the diagonal streaks. */
  streak: string;
}

export const TIER_DOM_STYLE: Record<CardTier, TierDomStyle> = {
  bronze: {
    plate: "linear-gradient(155deg,#6f4520 0%,#9c6531 22%,#c68a4c 46%,#a06a34 68%,#6b421e 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,228,190,0.55) 50%,transparent 66%)",
    ink: "#33200d",
    sub: "rgba(51,32,13,0.66)",
    rule: "rgba(51,32,13,0.28)",
    streak: "rgba(255,226,186,0.55)",
  },
  silver: {
    plate: "linear-gradient(155deg,#7e8894 0%,#aab4c0 22%,#dfe6ee 46%,#b3bdc9 68%,#7a838f 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,255,255,0.72) 50%,transparent 66%)",
    ink: "#20262e",
    sub: "rgba(32,38,46,0.66)",
    rule: "rgba(32,38,46,0.26)",
    streak: "rgba(255,255,255,0.7)",
  },
  gold: {
    plate: "linear-gradient(155deg,#9a6d12 0%,#caa032 22%,#f2d271 46%,#d3a839 68%,#8f6410 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,246,214,0.7) 50%,transparent 66%)",
    ink: "#3a2905",
    sub: "rgba(58,41,5,0.66)",
    rule: "rgba(58,41,5,0.26)",
    streak: "rgba(255,247,219,0.75)",
  },
  // Near-white platinum with warm gold ink, so the last six points of a career
  // read as something else entirely.
  icon: {
    plate: "linear-gradient(155deg,#cfc8ba 0%,#efe9dd 20%,#fffdf7 46%,#e6dfd0 70%,#c6bdac 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,255,255,0.9) 50%,transparent 66%)",
    ink: "#4a3a16",
    sub: "rgba(74,58,22,0.62)",
    rule: "rgba(74,58,22,0.24)",
    streak: "rgba(255,252,242,0.85)",
  },
};

/** The same plates as canvas colour stops. */
export interface TierCanvasStyle {
  /** Metal, top-left to bottom-right (the CSS 155deg gradient). */
  plate: [number, string][];
  ink: string;
  sub: string;
  streak: string;
  sheen: string;
}

export const TIER_CANVAS_STYLE: Record<CardTier, TierCanvasStyle> = {
  bronze: {
    plate: [
      [0, "#6f4520"],
      [0.22, "#9c6531"],
      [0.46, "#c68a4c"],
      [0.68, "#a06a34"],
      [1, "#6b421e"],
    ],
    ink: "#33200d",
    sub: "rgba(51,32,13,0.66)",
    streak: "rgba(255,226,186,0.55)",
    sheen: "rgba(255,228,190,0.55)",
  },
  silver: {
    plate: [
      [0, "#7e8894"],
      [0.22, "#aab4c0"],
      [0.46, "#dfe6ee"],
      [0.68, "#b3bdc9"],
      [1, "#7a838f"],
    ],
    ink: "#20262e",
    sub: "rgba(32,38,46,0.66)",
    streak: "rgba(255,255,255,0.7)",
    sheen: "rgba(255,255,255,0.72)",
  },
  gold: {
    plate: [
      [0, "#9a6d12"],
      [0.22, "#caa032"],
      [0.46, "#f2d271"],
      [0.68, "#d3a839"],
      [1, "#8f6410"],
    ],
    ink: "#3a2905",
    sub: "rgba(58,41,5,0.66)",
    streak: "rgba(255,247,219,0.75)",
    sheen: "rgba(255,246,214,0.7)",
  },
  icon: {
    plate: [
      [0, "#cfc8ba"],
      [0.2, "#efe9dd"],
      [0.46, "#fffdf7"],
      [0.7, "#e6dfd0"],
      [1, "#c6bdac"],
    ],
    ink: "#4a3a16",
    sub: "rgba(74,58,22,0.62)",
    streak: "rgba(255,252,242,0.85)",
    sheen: "rgba(255,255,255,0.9)",
  },
};
