/**
 * Flat-vector avatar. Everything is drawn from a small set of layered SVG
 * shapes so the whole customiser stays asset-free and instantly recolourable.
 */

export type HairStyle =
  | "bald" | "short" | "sidePart" | "wavy"
  | "curly" | "afro" | "bun" | "long";

export type BeardStyle =
  | "none" | "moustache" | "soulPatch"
  | "chinstrap" | "full";

export type EyebrowStyle = "straight" | "arched" | "thick" | "thin" | "angled";

export type MoleSpot = "none" | "leftCheek" | "rightCheek" | "chin" | "aboveLip";

export type EyeShape = "round" | "almond" | "sleepy" | "closed";

export type NoseShape = "small" | "straight" | "button" | "wide";

export type MouthStyle = "smile" | "grin" | "smirk" | "neutral" | "small";

export type AccessoryStyle = "none" | "headband" | "glasses" | "beret";

/** Mii-style min/max range for the eye and nose size sliders. */
export const FEATURE_SIZE_MIN = 0;
export const FEATURE_SIZE_MAX = 10;
export const FEATURE_SIZE_DEFAULT = 5;

/** Tiny nudge range so the eyebrows can never reach the eyes. */
export const EYEBROW_OFFSET_MIN = -2;
export const EYEBROW_OFFSET_MAX = 2;
export const EYEBROW_OFFSET_DEFAULT = 0;

/** Same small-nudge idea, applied to eyes, nose and mouth. */
export const EYE_OFFSET_MIN = -2;
export const EYE_OFFSET_MAX = 2;
export const EYE_OFFSET_DEFAULT = 0;

export const NOSE_OFFSET_MIN = -2;
export const NOSE_OFFSET_MAX = 2;
export const NOSE_OFFSET_DEFAULT = 0;

export const MOUTH_OFFSET_MIN = -2;
export const MOUTH_OFFSET_MAX = 2;
export const MOUTH_OFFSET_DEFAULT = 0;

export interface AvatarConfig {
  skin: number;
  hair: HairStyle;
  hairColor: number;
  eyebrows: EyebrowStyle;
  eyebrowOffset: number;
  eyes: number;
  eyeShape: EyeShape;
  eyeSize: number;
  eyeOffset: number;
  nose: NoseShape;
  noseSize: number;
  noseOffset: number;
  mouth: MouthStyle;
  mouthOffset: number;
  beard: BeardStyle;
  beardColor: number;
  freckles: boolean;
  mole: MoleSpot;
  accessory: AccessoryStyle;
  accessoryColor: number;
}

/** Skin tones, light to deep. */
export const SKIN_TONES = [
  "#F6D5C0", "#F0C6A8", "#E5B190", "#D99C77", "#C68763",
  "#AE6E4E", "#93583C", "#78462F", "#5D3524", "#43261A",
];

/** Slightly darker companion used for ears/shadow so faces keep depth. */
export function skinShadow(index: number): string {
  const shades = [
    "#E7BEA5", "#E0AF8D", "#D49A78", "#C6875F", "#B2724F",
    "#985C3F", "#7D4830", "#643725", "#4C2A1C", "#341D14",
  ];
  return shades[index] ?? shades[0];
}

export const HAIR_COLORS = [
  "#141110", "#2E2622", "#4A3728", "#6B4A2F", "#8B5E34",
  "#B07C3E", "#D2A857", "#E8CE8E", "#9C9C9C", "#E4E4E4",
  "#B33A2B", "#D4602F", "#3F6FB5", "#7B4BAE", "#2C8C6A", "#C9457F",
];

export const EYE_COLORS = [
  "#3C2A1E", "#5B3A22", "#7A5230", "#2F6B4F", "#3B7F63",
  "#2D5F91", "#4B84BE", "#6E6E77",
];

/** Roughly shortest to longest, so the picker reads as a scale. */
export const HAIR_STYLES: HairStyle[] = [
  "bald", "short", "sidePart", "wavy", "curly", "afro", "bun", "long",
];

export const BEARD_STYLES: BeardStyle[] = [
  "none", "moustache", "soulPatch",
  "chinstrap", "full",
];

export const EYEBROW_STYLES: EyebrowStyle[] = ["straight", "arched", "thick", "thin", "angled"];

export const MOLE_SPOTS: MoleSpot[] = ["none", "leftCheek", "rightCheek", "chin", "aboveLip"];

export const EYE_SHAPES: EyeShape[] = ["round", "almond", "sleepy", "closed"];

export const NOSE_SHAPES: NoseShape[] = ["small", "straight", "button", "wide"];

export const MOUTH_STYLES: MouthStyle[] = ["smile", "grin", "smirk", "neutral", "small"];

export const ACCESSORY_STYLES: AccessoryStyle[] = ["none", "headband", "glasses", "beret"];

/** Accessories that cover the scalp entirely, so hair is skipped underneath them. */
export const HAIR_HIDING_ACCESSORIES: ReadonlySet<AccessoryStyle> = new Set(["beret"]);

/** Sensible starting point once the player opens the customiser. */
export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 3,
  hair: "short",
  hairColor: 1,
  eyebrows: "straight",
  eyebrowOffset: EYEBROW_OFFSET_DEFAULT,
  eyes: 0,
  eyeShape: "round",
  eyeSize: FEATURE_SIZE_DEFAULT,
  eyeOffset: EYE_OFFSET_DEFAULT,
  nose: "small",
  noseSize: FEATURE_SIZE_DEFAULT,
  noseOffset: NOSE_OFFSET_DEFAULT,
  mouth: "smile",
  mouthOffset: MOUTH_OFFSET_DEFAULT,
  beard: "none",
  beardColor: 1,
  freckles: false,
  mole: "none",
  accessory: "none",
  accessoryColor: 1,
};

/** Deterministic-ish shuffle for the "surprise me" button. */
export function randomAvatar(): AvatarConfig {
  const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
  const hairColor = Math.floor(Math.random() * HAIR_COLORS.length);
  return {
    skin: Math.floor(Math.random() * SKIN_TONES.length),
    hair: pick(HAIR_STYLES),
    hairColor,
    eyebrows: pick(EYEBROW_STYLES),
    eyebrowOffset: Math.floor(Math.random() * (EYEBROW_OFFSET_MAX - EYEBROW_OFFSET_MIN + 1)) + EYEBROW_OFFSET_MIN,
    eyes: Math.floor(Math.random() * EYE_COLORS.length),
    eyeShape: pick(EYE_SHAPES),
    eyeSize: Math.floor(Math.random() * (FEATURE_SIZE_MAX + 1)),
    eyeOffset: Math.floor(Math.random() * (EYE_OFFSET_MAX - EYE_OFFSET_MIN + 1)) + EYE_OFFSET_MIN,
    nose: pick(NOSE_SHAPES),
    noseSize: Math.floor(Math.random() * (FEATURE_SIZE_MAX + 1)),
    noseOffset: Math.floor(Math.random() * (NOSE_OFFSET_MAX - NOSE_OFFSET_MIN + 1)) + NOSE_OFFSET_MIN,
    mouth: pick(MOUTH_STYLES),
    mouthOffset: Math.floor(Math.random() * (MOUTH_OFFSET_MAX - MOUTH_OFFSET_MIN + 1)) + MOUTH_OFFSET_MIN,
    beard: pick(BEARD_STYLES),
    beardColor: hairColor,
    freckles: Math.random() < 0.3,
    mole: Math.random() < 0.35 ? pick(MOLE_SPOTS.slice(1)) : "none",
    accessory: Math.random() < 0.3 ? pick(ACCESSORY_STYLES.slice(1)) : "none",
    accessoryColor: Math.floor(Math.random() * HAIR_COLORS.length),
  };
}
