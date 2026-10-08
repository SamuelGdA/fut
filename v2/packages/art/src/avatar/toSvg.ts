import { NEUTRAL_KIT, type KitDef, type KitPattern } from "../data";
import {
  EYE_COLORS,
  EYEBROW_OFFSET_DEFAULT,
  EYE_OFFSET_DEFAULT,
  FEATURE_SIZE_DEFAULT,
  FEATURE_SIZE_MAX,
  HAIR_COLORS,
  HAIR_HIDING_ACCESSORIES,
  MOUTH_OFFSET_DEFAULT,
  NOSE_OFFSET_DEFAULT,
  SKIN_TONES,
  skinShadow,
  type AccessoryStyle,
  type AvatarConfig,
  type BeardStyle,
  type EyebrowStyle,
  type EyeShape,
  type HairStyle,
  type MoleSpot,
  type MouthStyle,
  type NoseShape,
} from "./config";

/**
 * The layered flat-vector portrait, as a string of SVG.
 *
 * It used to be a React component, which made it the one piece of art in the
 * game that only existed as markup a browser had already laid out. The share
 * poster therefore had to mount an invisible copy of the player's avatar
 * off-screen, find the `<svg>` node in the DOM, clone it, patch width and
 * height onto the clone and serialise it back to a string, all so it could be
 * handed to an `<img>` and painted. That worked and was absurd.
 *
 * As a string it is just art, like the crests and the trophies: the app drops
 * it into the page, the poster turns it into a data URI, and neither needs the
 * other to have rendered first.
 *
 * `null` config renders the neutral grey silhouette used for a player who has
 * not opened the customiser.
 */

export interface AvatarSvgOptions {
  /** Colours the jersey. Independent of the face; defaults to neutral grey. */
  kit?: KitDef | null;
  /** The backdrop square. Off inside the player card, on in the customiser. */
  showBackground?: boolean;
  /**
   * Fill for that backdrop. A CSS custom property works when the markup is
   * inlined into the page and does not when it is encoded into a data URI, so
   * the caller decides rather than this file guessing.
   */
  backgroundColor?: string;
  /** Written straight onto the root element. */
  className?: string;
  /**
   * Prefix for the one internal id (the jersey clip). Two avatars on one page
   * share a clip of the identical shape, so a collision is harmless, but a
   * caller that wants them distinct can say so.
   */
  idPrefix?: string;
  /** Explicit pixel size, for callers that need intrinsic dimensions. */
  size?: number;
}

const VIEW = 200;

const attrs = (pairs: Record<string, string | number | undefined>): string =>
  Object.entries(pairs)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");

// ---------------------------------------------------------------------------
// Jersey
// ---------------------------------------------------------------------------

const TORSO_PATH = "M16 200c0-42 36-58 84-58s84 16 84 58Z";

function jerseyPattern(pattern: KitPattern, accent: string): string {
  if (pattern === "solid") return "";

  if (pattern === "vertical_stripes") {
    const bands = [12, 54, 96, 138, 180];
    const bars = bands
      .map((x, i) => (i % 2 === 1 ? `<rect x="${x}" y="140" width="21" height="60"/>` : ""))
      .join("");
    return `<g fill="${accent}">${bars}</g>`;
  }

  if (pattern === "horizontal_stripes") {
    const bands = [140, 156, 172, 188];
    const bars = bands
      .map((y, i) => (i % 2 === 0 ? `<rect x="0" y="${y}" width="200" height="8"/>` : ""))
      .join("");
    return `<g fill="${accent}">${bars}</g>`;
  }

  if (pattern === "diagonal_sash") {
    return `<g transform="rotate(-38 100 168)"><rect x="78" y="128" width="24" height="96" fill="${accent}"/></g>`;
  }

  // checkerboard
  const size = 21;
  const squares: string[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if ((row + col) % 2 === 0) continue;
      squares.push(`<rect x="${col * size}" y="${140 + row * size}" width="${size}" height="${size}"/>`);
    }
  }
  return `<g fill="${accent}">${squares.join("")}</g>`;
}

function jersey(kit: KitDef, clipId: string): string {
  return [
    "<g>",
    `<defs><clipPath id="${clipId}"><path d="${TORSO_PATH}"/></clipPath></defs>`,
    `<path d="${TORSO_PATH}" fill="${kit.base}"/>`,
    `<g clip-path="url(#${clipId})">${jerseyPattern(kit.pattern, kit.accent)}</g>`,
    `<path d="M82 146q18 12 36 0" stroke="${kit.accent}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.85"/>`,
    "</g>",
  ].join("");
}

// ---------------------------------------------------------------------------
// Face pieces
// ---------------------------------------------------------------------------

/** Mii-style slider: 0.8x at minimum, 1.35x at maximum. */
function sizeScale(size: number): number {
  return 0.8 + (size / FEATURE_SIZE_MAX) * 0.55;
}

function eyeShape(cx: number, color: string, shape: EyeShape): string {
  if (shape === "closed") {
    return `<path d="M${cx - 8} 88q8 6 16 0" stroke="#2a211c" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  }
  if (shape === "sleepy") {
    return [
      "<g>",
      `<ellipse cx="${cx}" cy="89" rx="9" ry="4.2" fill="#FFFFFF"/>`,
      `<circle cx="${cx}" cy="90" r="3.6" fill="${color}"/>`,
      `<circle cx="${cx}" cy="90" r="1.6" fill="#15110E"/>`,
      `<path d="M${cx - 9.5} 86.5q9.5 -5 19 0" stroke="#2a211c" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      "</g>",
    ].join("");
  }
  if (shape === "almond") {
    return [
      "<g>",
      `<path d="M${cx - 9} 88q3 -6 9 -6.5q6 0.5 9 6.5q-3 6 -9 6.5q-6 -0.5 -9 -6.5Z" fill="#FFFFFF"/>`,
      `<circle cx="${cx}" cy="88" r="4" fill="${color}"/>`,
      `<circle cx="${cx}" cy="88" r="1.8" fill="#15110E"/>`,
      `<circle cx="${cx - 1.4}" cy="86.4" r="1.1" fill="#FFFFFF" opacity="0.9"/>`,
      "</g>",
    ].join("");
  }
  // round (default)
  return [
    "<g>",
    `<ellipse cx="${cx}" cy="88" rx="9" ry="6.5" fill="#FFFFFF"/>`,
    `<circle cx="${cx}" cy="88" r="4.4" fill="${color}"/>`,
    `<circle cx="${cx}" cy="88" r="2" fill="#15110E"/>`,
    `<circle cx="${cx - 1.6}" cy="86.2" r="1.3" fill="#FFFFFF" opacity="0.9"/>`,
    "</g>",
  ].join("");
}

function eyes(color: string, shape: EyeShape, size: number, offset: number): string {
  const scale = sizeScale(size);
  const pair = [78, 122]
    .map(
      (cx) =>
        `<g transform="translate(${cx} 88) scale(${scale}) translate(${-cx} -88)">${eyeShape(cx, color, shape)}</g>`,
    )
    .join("");
  return `<g transform="translate(0 ${offset})">${pair}</g>`;
}

/**
 * Baseline sits 2 units higher than the original draft so the offset slider
 * always has clearance above the eyes, even at max eye size plus max
 * down-offset.
 */
const EYEBROW_PATHS: Record<EyebrowStyle, { d: string; width: number }> = {
  straight: { d: "M68 72h20", width: 4.5 },
  arched: { d: "M68 73q10 -7 20 0", width: 4.5 },
  thick: { d: "M67 72h22", width: 7 },
  thin: { d: "M69 72.5h18", width: 2.6 },
  angled: { d: "M68 75l20 -5", width: 4.5 },
};

function eyebrows(style: EyebrowStyle, color: string, offset: number): string {
  const { d, width } = EYEBROW_PATHS[style];
  const brow = `<path d="${d}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none"/>`;
  return `<g transform="translate(0 ${offset})">${brow}<g transform="translate(200,0) scale(-1,1)">${brow}</g></g>`;
}

const NOSE_ORIGIN = { x: 100, y: 95 };

function noseShape(shape: NoseShape, tone: string): string {
  if (shape === "straight") {
    return [
      `<path d="M99 82h2v18h-2Z" fill="${tone}"/>`,
      `<path d="M94 100q6 5 12 0" stroke="${tone}" stroke-width="2" stroke-linecap="round" fill="none"/>`,
    ].join("");
  }
  if (shape === "button") return `<circle cx="100" cy="98" r="5" fill="${tone}"/>`;
  if (shape === "wide") {
    return `<path d="M100 84c-6 8-9 14-9 16 0 4 4 7 9 7s9-3 9-7c0-2-3-8-9-16Z" fill="${tone}"/>`;
  }
  // small (default)
  return `<path d="M100 88c-4 8-7 12-7 14 0 3 3 5 7 5s7-2 7-5c0-2-3-6-7-14Z" fill="${tone}"/>`;
}

function nose(shape: NoseShape, size: number, tone: string, offset: number): string {
  const scale = sizeScale(size);
  const { x, y } = NOSE_ORIGIN;
  const inner = `<g transform="translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})" opacity="0.55">${noseShape(shape, tone)}</g>`;
  return `<g transform="translate(0 ${offset})">${inner}</g>`;
}

const MOUTH_PATHS: Record<MouthStyle, { normal: string; narrow: string }> = {
  smile: { normal: "M88 115q12 8 24 0", narrow: "M91 116q9 6 18 0" },
  grin: { normal: "M85 114q15 11 30 0", narrow: "M89 115q11 8 22 0" },
  smirk: { normal: "M88 117q12 5 24 -3", narrow: "M91 117q9 4 18 -2" },
  neutral: { normal: "M89 117h22", narrow: "M92 117h16" },
  small: { normal: "M93 116q7 4 14 0", narrow: "M95 116q5 3 10 0" },
};

function mouth(beard: BeardStyle, style: MouthStyle, offset: number): string {
  // A full beard covers the mouth corners, so it gets a smaller line.
  const { normal, narrow } = MOUTH_PATHS[style];
  const d = beard === "full" ? narrow : normal;
  return `<g transform="translate(0 ${offset})"><path d="${d}" stroke="#6B3B32" stroke-width="3.2" stroke-linecap="round" fill="none"/></g>`;
}

const FRECKLE_DOTS: readonly (readonly [number, number])[] = [
  [72, 99], [78, 103], [67, 104], [75, 108],
  [128, 99], [122, 103], [133, 104], [125, 108],
];

function freckles(show: boolean, tone: string): string {
  if (!show) return "";
  const dots = FRECKLE_DOTS.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="1.7"/>`).join("");
  return `<g fill="${tone}" opacity="0.75">${dots}</g>`;
}

const MOLE_POSITIONS: Record<Exclude<MoleSpot, "none">, [number, number]> = {
  leftCheek: [74, 108],
  rightCheek: [126, 108],
  chin: [100, 128],
  aboveLip: [110, 108],
};

function mole(spot: MoleSpot): string {
  if (spot === "none") return "";
  const [cx, cy] = MOLE_POSITIONS[spot];
  return `<circle cx="${cx}" cy="${cy}" r="2.4" fill="#000000"/>`;
}

// ---------------------------------------------------------------------------
// Hair
// ---------------------------------------------------------------------------

/**
 * Everything is drawn against the same skull: an ellipse at (100, 88) with
 * radii 41 x 47, so the scalp runs from y=41 at the crown down to about y=78
 * at the temples. Styles that sit on the head share `CAP`, the cap that
 * follows that curve, and differ in what they add on top of it. Keeping one
 * cap is what stops half the set floating above the head and the other half
 * sinking into the eyebrows.
 */
const CAP = "M60 84C60 45 75 38 100 38C125 38 140 45 140 84C140 65 122 58 100 58C78 58 60 65 60 84Z";

function hair(style: HairStyle, color: string): string {
  switch (style) {
    case "bald":
      return "";

    case "short":
      return `<path d="${CAP}" fill="${color}"/>`;

    case "sidePart":
      /*
       * One shape, no lines.
       *
       * Every version that tried to draw the parting failed differently: two
       * masses with a gap read as a loose patch by the temple, a slot notched
       * into the fringe read as a receding hairline, and a crease stroke had
       * to be drawn twice (once dark, once light) to survive every hair
       * colour, which just put a grey smear across the head.
       *
       * The silhouette carries it instead, which is how flat vector art does
       * a comb-over: the fringe hangs low over one side of the forehead and
       * sweeps up across to the other, and the crown sits off-centre so the
       * near side hugs the skull while the swept side keeps its height.
       * Neither half of that depends on a colour.
       */
      return `<path d="M60 84C60 49 68 42 78 40C88 35 100 34 111 36C129 39 140 50 140 84C140 68 133 66 121 66C104 65 87 59 76 54C70 55 63 66 60 84Z" fill="${color}"/>`;

    case "wavy":
      /*
       * The first version put the waves in faint strokes over a plain cap,
       * which at any real size just looked like short hair. The waves are in
       * the silhouette now: the fringe is a run of four scallops, so the
       * shape says wavy before any texture is drawn on it.
       *
       * The ridges are mirrored about the centre line; the first pass sloped
       * them left to right and the whole head read as tilted.
       */
      return [
        `<g fill="${color}">`,
        '<path d="M57 90C55 56 72 32 100 32C128 32 145 56 143 90C141 78 138 68 133 64C128 72 121.5 70 116.5 62C111.5 70 105 70 100 62C95 70 88.5 70 83.5 62C78.5 70 72 72 67 64C62 68 59 78 57 90Z"/>',
        '<g fill="none" stroke="#00000038" stroke-width="3.2" stroke-linecap="round">',
        '<path d="M66 62C74 52 86 52 94 60C98 64 102 64 106 60C114 52 126 52 134 62"/>',
        '<path d="M74 48C82 40 92 40 100 46C108 40 118 40 126 48"/>',
        "</g>",
        "</g>",
      ].join("");

    case "curly":
      // A ring of curls around a filled cap, so the outline is lumpy but the
      // scalp underneath is never bare.
      return [
        `<g fill="${color}">`,
        `<path d="${CAP}"/>`,
        '<circle cx="66" cy="66" r="12"/>',
        '<circle cx="76" cy="50" r="13"/>',
        '<circle cx="92" cy="42" r="13"/>',
        '<circle cx="108" cy="42" r="13"/>',
        '<circle cx="124" cy="50" r="13"/>',
        '<circle cx="134" cy="66" r="12"/>',
        '<circle cx="100" cy="52" r="14"/>',
        "</g>",
      ].join("");

    case "afro":
      // A full rounded volume that sits well outside the skull on every side.
      return [
        `<g fill="${color}">`,
        '<ellipse cx="100" cy="52" rx="49" ry="34"/>',
        '<circle cx="60" cy="62" r="15"/>',
        '<circle cx="140" cy="62" r="15"/>',
        '<circle cx="74" cy="34" r="15"/>',
        '<circle cx="126" cy="34" r="15"/>',
        '<circle cx="100" cy="28" r="16"/>',
        '<path d="M62 76C62 62 78 56 100 56C122 56 138 62 138 76C138 66 121 62 100 62C79 62 62 66 62 76Z"/>',
        "</g>",
      ].join("");

    case "bun":
      return [
        `<g fill="${color}">`,
        `<path d="${CAP}"/>`,
        '<path d="M74 46C84 36 116 36 126 46C116 42 84 42 74 46Z" opacity="0.6"/>',
        '<circle cx="100" cy="28" r="13"/>',
        "</g>",
      ].join("");

    case "long":
      return `<g fill="${color}"><path d="M100 36c-28 0-44 18-44 40v58c0-18 5-30 5-46 0-8 3-14 8-18 8 6 22 8 31 8s23-2 31-8c5 4 8 10 8 18 0 16 5 28 5 46V76c0-22-16-40-44-40Z"/></g>`;

    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Beard
// ---------------------------------------------------------------------------

function beard(style: BeardStyle, color: string): string {
  switch (style) {
    case "none":
      return "";
    case "moustache":
      return `<path d="M86 108q14 -7 28 0q-6 6 -14 6q-8 0 -14 -6Z" fill="${color}"/>`;
    case "soulPatch":
      return `<rect x="95" y="122" width="10" height="9" rx="3" fill="${color}"/>`;
    case "chinstrap":
      return `<path d="M60 92c0 26 18 43 40 43s40-17 40-43c-3 0-5 1-6 3-3 20-16 31-34 31s-31-11-34-31c-1-2-3-3-6-3Z" fill="${color}"/>`;
    case "full":
      return `<g fill="${color}"><path d="M64 96L62 106C61 120 74 134 100 137C126 134 139 120 138 106L136 96C127 104 115 109 100 109C85 109 73 104 64 96Z"/></g>`;
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Accessories
// ---------------------------------------------------------------------------

function accessory(style: AccessoryStyle, accent: string): string {
  if (style === "none") return "";

  if (style === "headband") {
    return [
      "<g>",
      '<path d="M58 68q42 -28 84 0" stroke="#161616" stroke-width="11" stroke-linecap="round" fill="none"/>',
      `<path d="M58 68q42 -28 84 0" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`,
      "</g>",
    ].join("");
  }

  if (style === "glasses") {
    // Two tinted wraparound lenses joined by a solid bridge piece, with short
    // temple arms toward the ears.
    const lenses = [78, 122]
      .map(
        (cx) =>
          `<rect x="${cx - 15}" y="78" width="30" height="20" rx="9" fill="rgba(14,16,21,0.92)" stroke="#0a0a0a" stroke-width="2"/>`,
      )
      .join("");
    return [
      "<g>",
      '<path d="M64 87h-8M136 87h9" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round"/>',
      '<rect x="92" y="84" width="16" height="7" rx="3" fill="#0a0a0a"/>',
      lenses,
      "</g>",
    ].join("");
  }

  // beret: the stem loop sits flush on the body so it never reads as a stray dot.
  return `<path d="M60 57c-3-19 15-31 40-31s42 11 41 29c-1 8-9 11-17 8-16-7-32-7-47 0-8 3-16 2-17-6Z" fill="${accent}"/>`;
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

export function renderAvatarSvg(
  config: AvatarConfig | null,
  options: AvatarSvgOptions = {},
): string {
  const {
    kit = null,
    showBackground = true,
    backgroundColor = "var(--avatar-bg, #1a1d22)",
    className,
    idPrefix = "cq-av",
    size,
  } = options;

  const placeholder = config === null;
  const clipId = `${idPrefix}-torso`;

  const skin = placeholder ? "#9AA0A6" : SKIN_TONES[config.skin] ?? SKIN_TONES[3]!;
  const shadow = placeholder ? "#868C92" : skinShadow(config.skin);
  const hairColor = placeholder ? "#B7BCC1" : HAIR_COLORS[config.hairColor] ?? HAIR_COLORS[1]!;
  const beardColor = placeholder ? "#B7BCC1" : HAIR_COLORS[config.beardColor] ?? hairColor;
  const eyeColor = placeholder ? "#6E6E77" : EYE_COLORS[config.eyes] ?? EYE_COLORS[0]!;
  const accessoryStyle: AccessoryStyle = placeholder ? "none" : config.accessory ?? "none";
  const accessoryColor = placeholder ? "#B7BCC1" : HAIR_COLORS[config.accessoryColor] ?? hairColor;
  // Hats replace the hair entirely rather than drawing over it.
  const showHair = !HAIR_HIDING_ACCESSORIES.has(accessoryStyle);

  const face = placeholder
    ? // Neutral silhouette: just a suggestion of hair, no facial features.
      '<path d="M100 39c-24 0-38 15-39 33 4-13 15-19 39-19s35 6 39 19c-1-18-15-33-39-33Z" fill="#B7BCC1"/>'
    : [
        freckles(config.freckles, shadow),
        eyes(
          eyeColor,
          config.eyeShape ?? "round",
          config.eyeSize ?? FEATURE_SIZE_DEFAULT,
          config.eyeOffset ?? EYE_OFFSET_DEFAULT,
        ),
        eyebrows(config.eyebrows, hairColor, config.eyebrowOffset ?? EYEBROW_OFFSET_DEFAULT),
        nose(
          config.nose ?? "small",
          config.noseSize ?? FEATURE_SIZE_DEFAULT,
          shadow,
          config.noseOffset ?? NOSE_OFFSET_DEFAULT,
        ),
        mole(config.mole),
        beard(config.beard, beardColor),
        mouth(config.beard, config.mouth ?? "smile", config.mouthOffset ?? MOUTH_OFFSET_DEFAULT),
        showHair ? hair(config.hair, hairColor) : "",
        accessory(accessoryStyle, accessoryColor),
      ].join("");

  const root = attrs({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: `0 0 ${VIEW} ${VIEW}`,
    width: size,
    height: size,
    class: className,
    role: "img",
    "aria-label": "Avatar",
  });

  return [
    `<svg${root}>`,
    showBackground ? `<rect width="${VIEW}" height="${VIEW}" fill="${backgroundColor}"/>` : "",
    // Jersey, shoulders and neck sit behind the head.
    jersey(kit ?? NEUTRAL_KIT, clipId),
    `<rect x="85" y="112" width="30" height="42" rx="12" fill="${shadow}"/>`,
    // Ears tuck behind the face outline.
    placeholder
      ? ""
      : `<ellipse cx="59" cy="94" rx="7.5" ry="11" fill="${shadow}"/><ellipse cx="141" cy="94" rx="7.5" ry="11" fill="${shadow}"/>`,
    `<ellipse cx="100" cy="88" rx="41" ry="47" fill="${skin}"/>`,
    face,
    "</svg>",
  ].join("");
}

/**
 * The same portrait as a data URI, for the canvas exporter.
 *
 * Percent-encoded rather than base64: the markup is short and UTF-8 safe, and
 * a readable URI is a readable bug report. The background defaults off and the
 * size is explicit, because an SVG carrying only a viewBox can be reported as
 * 0x0 by an `<img>`.
 */
export function avatarDataUri(
  config: AvatarConfig | null,
  options: AvatarSvgOptions = {},
): string {
  const markup = renderAvatarSvg(config, {
    showBackground: false,
    size: 400,
    ...options,
  });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
