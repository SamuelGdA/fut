import { useId } from "react";
import { NEUTRAL_KIT, type KitDef, type KitPattern } from "@/lib/kits";
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
} from "@/lib/avatar/config";

/**
 * Layered flat-vector portrait. When `config` is null it renders the neutral
 * grey silhouette used for players who haven't opened the customiser yet.
 * `kit` is independent of `config` — it colours the jersey and defaults to a
 * neutral grey whenever there's no club yet (creator, intro teaser).
 */
export function Avatar({
  config,
  className = "",
  showBackground = true,
  kit,
}: {
  config: AvatarConfig | null;
  className?: string;
  showBackground?: boolean;
  kit?: KitDef | null;
}) {
  const isPlaceholder = config === null;

  const skin = isPlaceholder ? "#9AA0A6" : SKIN_TONES[config.skin] ?? SKIN_TONES[3];
  const shadow = isPlaceholder ? "#868C92" : skinShadow(config.skin);
  const hairColor = isPlaceholder ? "#B7BCC1" : HAIR_COLORS[config.hairColor] ?? HAIR_COLORS[1];
  const beardColor = isPlaceholder ? "#B7BCC1" : HAIR_COLORS[config.beardColor] ?? hairColor;
  const eyeColor = isPlaceholder ? "#6E6E77" : EYE_COLORS[config.eyes] ?? EYE_COLORS[0];
  const eyeShape: EyeShape = isPlaceholder ? "round" : config.eyeShape ?? "round";
  const eyeSize = isPlaceholder ? FEATURE_SIZE_DEFAULT : config.eyeSize ?? FEATURE_SIZE_DEFAULT;
  const noseShape: NoseShape = isPlaceholder ? "small" : config.nose ?? "small";
  const noseSize = isPlaceholder ? FEATURE_SIZE_DEFAULT : config.noseSize ?? FEATURE_SIZE_DEFAULT;
  const eyebrowOffset = isPlaceholder ? EYEBROW_OFFSET_DEFAULT : config.eyebrowOffset ?? EYEBROW_OFFSET_DEFAULT;
  const eyeOffset = isPlaceholder ? EYE_OFFSET_DEFAULT : config.eyeOffset ?? EYE_OFFSET_DEFAULT;
  const noseOffset = isPlaceholder ? NOSE_OFFSET_DEFAULT : config.noseOffset ?? NOSE_OFFSET_DEFAULT;
  const mouthStyle: MouthStyle = isPlaceholder ? "smile" : config.mouth ?? "smile";
  const mouthOffset = isPlaceholder ? MOUTH_OFFSET_DEFAULT : config.mouthOffset ?? MOUTH_OFFSET_DEFAULT;
  const accessory: AccessoryStyle = isPlaceholder ? "none" : config.accessory ?? "none";
  const accessoryColor = isPlaceholder ? "#B7BCC1" : HAIR_COLORS[config.accessoryColor] ?? hairColor;
  // Hats replace the hair entirely rather than just drawing over it.
  const showHair = !HAIR_HIDING_ACCESSORIES.has(accessory);

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Avatar">
      {showBackground && <rect width="200" height="200" fill="var(--avatar-bg, #1a1d22)" />}

      {/* Jersey, shoulders and neck sit behind the head. */}
      <Jersey kit={kit ?? NEUTRAL_KIT} />
      <rect x="85" y="112" width="30" height="42" rx="12" fill={shadow} />

      {/* Ears tuck behind the face outline. */}
      {!isPlaceholder && (
        <>
          <ellipse cx="59" cy="94" rx="7.5" ry="11" fill={shadow} />
          <ellipse cx="141" cy="94" rx="7.5" ry="11" fill={shadow} />
        </>
      )}

      <ellipse cx="100" cy="88" rx="41" ry="47" fill={skin} />

      {isPlaceholder ? (
        // Neutral silhouette: just a suggestion of hair, no facial features.
        <path d="M100 39c-24 0-38 15-39 33 4-13 15-19 39-19s35 6 39 19c-1-18-15-33-39-33Z" fill="#B7BCC1" />
      ) : (
        <>
          <Freckles show={config.freckles} tone={shadow} />
          <Eyes color={eyeColor} shape={eyeShape} size={eyeSize} offset={eyeOffset} />
          <Eyebrows style={config.eyebrows} color={hairColor} offset={eyebrowOffset} />
          <Nose shape={noseShape} size={noseSize} tone={shadow} offset={noseOffset} />
          <Mole spot={config.mole} />
          <Beard style={config.beard} color={beardColor} />
          <Mouth beard={config.beard} style={mouthStyle} offset={mouthOffset} />
          {showHair && <Hair style={config.hair} color={hairColor} />}
          <Accessory style={accessory} accent={accessoryColor} />
        </>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Jersey
// ---------------------------------------------------------------------------

const TORSO_PATH = "M16 200c0-42 36-58 84-58s84 16 84 58Z";

function Jersey({ kit }: { kit: KitDef }) {
  const clipId = useId();
  const { base, accent, pattern } = kit;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={TORSO_PATH} />
        </clipPath>
      </defs>
      <path d={TORSO_PATH} fill={base} />
      <g clipPath={`url(#${clipId})`}>
        <JerseyPattern pattern={pattern} accent={accent} />
      </g>
      {/* Collar trim */}
      <path d="M82 146q18 12 36 0" stroke={accent} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85" />
    </g>
  );
}

function JerseyPattern({ pattern, accent }: { pattern: KitPattern; accent: string }) {
  if (pattern === "solid") return null;

  if (pattern === "vertical_stripes") {
    const bands = [12, 54, 96, 138, 180];
    return (
      <g fill={accent}>
        {bands.map((x, i) =>
          i % 2 === 1 ? <rect key={x} x={x} y="140" width="21" height="60" /> : null,
        )}
      </g>
    );
  }

  if (pattern === "horizontal_stripes") {
    const bands = [140, 156, 172, 188];
    return (
      <g fill={accent}>
        {bands.map((y, i) =>
          i % 2 === 0 ? <rect key={y} x="0" y={y} width="200" height="8" /> : null,
        )}
      </g>
    );
  }

  if (pattern === "diagonal_sash") {
    return (
      <g transform="rotate(-38 100 168)">
        <rect x="78" y="128" width="24" height="96" fill={accent} />
      </g>
    );
  }

  // checkerboard
  const squares = [];
  const size = 21;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 9; col++) {
      if ((row + col) % 2 === 0) continue;
      squares.push({ x: col * size, y: 140 + row * size, key: `${row}-${col}` });
    }
  }
  return (
    <g fill={accent}>
      {squares.map(({ x, y, key }) => (
        <rect key={key} x={x} y={y} width={size} height={size} />
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Face pieces
// ---------------------------------------------------------------------------

/** Mii-style slider: 0.8x at minimum, 1.35x at maximum. */
function sizeScale(size: number): number {
  return 0.8 + (size / FEATURE_SIZE_MAX) * 0.55;
}

function Eyes({
  color,
  shape,
  size,
  offset,
}: {
  color: string;
  shape: EyeShape;
  size: number;
  offset: number;
}) {
  const scale = sizeScale(size);
  return (
    <g transform={`translate(0 ${offset})`}>
      {[78, 122].map((cx) => (
        <g key={cx} transform={`translate(${cx} 88) scale(${scale}) translate(${-cx} -88)`}>
          <EyeShapeSvg cx={cx} color={color} shape={shape} />
        </g>
      ))}
    </g>
  );
}

function EyeShapeSvg({ cx, color, shape }: { cx: number; color: string; shape: EyeShape }) {
  if (shape === "closed") {
    return <path d={`M${cx - 8} 88q8 6 16 0`} stroke="#2a211c" strokeWidth="2.4" strokeLinecap="round" fill="none" />;
  }

  if (shape === "sleepy") {
    return (
      <g>
        <ellipse cx={cx} cy="89" rx="9" ry="4.2" fill="#FFFFFF" />
        <circle cx={cx} cy="90" r="3.6" fill={color} />
        <circle cx={cx} cy="90" r="1.6" fill="#15110E" />
        <path d={`M${cx - 9.5} 86.5q9.5 -5 19 0`} stroke="#2a211c" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (shape === "almond") {
    return (
      <g>
        <path
          d={`M${cx - 9} 88q3 -6 9 -6.5q6 0.5 9 6.5q-3 6 -9 6.5q-6 -0.5 -9 -6.5Z`}
          fill="#FFFFFF"
        />
        <circle cx={cx} cy="88" r="4" fill={color} />
        <circle cx={cx} cy="88" r="1.8" fill="#15110E" />
        <circle cx={cx - 1.4} cy="86.4" r="1.1" fill="#FFFFFF" opacity="0.9" />
      </g>
    );
  }

  // round (default)
  return (
    <g>
      <ellipse cx={cx} cy="88" rx="9" ry="6.5" fill="#FFFFFF" />
      <circle cx={cx} cy="88" r="4.4" fill={color} />
      <circle cx={cx} cy="88" r="2" fill="#15110E" />
      <circle cx={cx - 1.6} cy="86.2" r="1.3" fill="#FFFFFF" opacity="0.9" />
    </g>
  );
}

// Baseline sits 2 units higher than the original draft so the offset slider
// always has clearance above the eyes, even at max eye size + max down-offset.
const EYEBROW_PATHS: Record<EyebrowStyle, { d: string; width: number }> = {
  straight: { d: "M68 72h20", width: 4.5 },
  arched: { d: "M68 73q10 -7 20 0", width: 4.5 },
  thick: { d: "M67 72h22", width: 7 },
  thin: { d: "M69 72.5h18", width: 2.6 },
  angled: { d: "M68 75l20 -5", width: 4.5 },
};

function Eyebrows({ style, color, offset }: { style: EyebrowStyle; color: string; offset: number }) {
  const { d, width } = EYEBROW_PATHS[style];
  return (
    <g transform={`translate(0 ${offset})`}>
      <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
      <g transform="translate(200,0) scale(-1,1)">
        <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}

const NOSE_ORIGIN = { x: 100, y: 95 };

function Nose({
  shape,
  size,
  tone,
  offset,
}: {
  shape: NoseShape;
  size: number;
  tone: string;
  offset: number;
}) {
  const scale = sizeScale(size);
  const { x, y } = NOSE_ORIGIN;
  return (
    <g transform={`translate(0 ${offset})`}>
      <g transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`} opacity="0.55">
        <NoseShapeSvg shape={shape} tone={tone} />
      </g>
    </g>
  );
}

function NoseShapeSvg({ shape, tone }: { shape: NoseShape; tone: string }) {
  if (shape === "straight") {
    return (
      <>
        <path d="M99 82h2v18h-2Z" fill={tone} />
        <path d="M94 100q6 5 12 0" stroke={tone} strokeWidth="2" strokeLinecap="round" fill="none" />
      </>
    );
  }
  if (shape === "button") {
    return <circle cx="100" cy="98" r="5" fill={tone} />;
  }
  if (shape === "wide") {
    return <path d="M100 84c-6 8-9 14-9 16 0 4 4 7 9 7s9-3 9-7c0-2-3-8-9-16Z" fill={tone} />;
  }
  // small (default)
  return <path d="M100 88c-4 8-7 12-7 14 0 3 3 5 7 5s7-2 7-5c0-2-3-6-7-14Z" fill={tone} />;
}

const MOUTH_PATHS: Record<MouthStyle, { normal: string; narrow: string }> = {
  smile: { normal: "M88 115q12 8 24 0", narrow: "M91 116q9 6 18 0" },
  grin: { normal: "M85 114q15 11 30 0", narrow: "M89 115q11 8 22 0" },
  smirk: { normal: "M88 117q12 5 24 -3", narrow: "M91 117q9 4 18 -2" },
  neutral: { normal: "M89 117h22", narrow: "M92 117h16" },
  small: { normal: "M93 116q7 4 14 0", narrow: "M95 116q5 3 10 0" },
};

function Mouth({ beard, style, offset }: { beard: BeardStyle; style: MouthStyle; offset: number }) {
  // A full beard covers the mouth corners, so it gets a smaller line.
  const wide = beard === "full";
  const { normal, narrow } = MOUTH_PATHS[style];
  return (
    <g transform={`translate(0 ${offset})`}>
      <path
        d={wide ? narrow : normal}
        stroke="#6B3B32"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

function Freckles({ show, tone }: { show: boolean; tone: string }) {
  if (!show) return null;
  const dots = [
    [72, 99], [78, 103], [67, 104], [75, 108],
    [128, 99], [122, 103], [133, 104], [125, 108],
  ];
  return (
    <g fill={tone} opacity="0.75">
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" />
      ))}
    </g>
  );
}

const MOLE_POSITIONS: Record<Exclude<MoleSpot, "none">, [number, number]> = {
  leftCheek: [74, 108],
  rightCheek: [126, 108],
  chin: [100, 128],
  aboveLip: [110, 108],
};

function Mole({ spot }: { spot: MoleSpot }) {
  if (spot === "none") return null;
  const [cx, cy] = MOLE_POSITIONS[spot];
  return <circle cx={cx} cy={cy} r="2.4" fill="#000000" />;
}

// ---------------------------------------------------------------------------
// Hair
// ---------------------------------------------------------------------------

/**
 * Hair.
 *
 * Everything is drawn against the same skull: an ellipse at (100, 88) with
 * radii 41 x 47, so the scalp runs from y=41 at the crown down to about y=78
 * at the temples. Styles that sit on the head share `CAP`, the cap that
 * follows that curve, and differ in what they add on top of it. Keeping one
 * cap is what stops half the set floating above the head and the other half
 * sinking into the eyebrows.
 */

/** The scalp, from temple to temple over the crown. */
const CAP = "M60 84C60 45 75 38 100 38C125 38 140 45 140 84C140 65 122 58 100 58C78 58 60 65 60 84Z";

function Hair({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "bald":
      return null;

    case "short":
      return <path d={CAP} fill={color} />;

    case "sidePart":
      // One shape, no lines.
      //
      // Every version that tried to draw the parting failed differently: two
      // masses with a gap read as a loose patch by the temple, a slot notched
      // into the fringe read as a receding hairline, and a crease stroke had
      // to be drawn twice (once dark, once light) to survive every hair
      // colour, which just put a grey smear across the head.
      //
      // The silhouette carries it instead, which is how flat vector art does
      // a comb-over: the fringe hangs low over one side of the forehead and
      // sweeps up across to the other, and the crown sits off-centre so the
      // near side hugs the skull while the swept side keeps its height.
      // Neither half of that depends on a colour.
      return (
        <path
          d="M60 84C60 49 68 42 78 40C88 35 100 34 111 36C129 39 140 50 140 84C140 68 133 66 121 66C104 65 87 59 76 54C70 55 63 66 60 84Z"
          fill={color}
        />
      );

    case "wavy":
      // The first version put the waves in faint strokes over a plain cap,
      // which at any real size just looked like short hair. The waves are in
      // the silhouette now: the fringe is a run of four scallops, so the
      // shape says wavy before any texture is drawn on it.
      return (
        <g fill={color}>
          <path
            d="M57 90C55 56 72 32 100 32C128 32 145 56 143 90C141 78 138 68 133 64C128 72 121.5 70 116.5 62C111.5 70 105 70 100 62C95 70 88.5 70 83.5 62C78.5 70 72 72 67 64C62 68 59 78 57 90Z"
          />
          {/* Ridges over the crown, strong enough to survive a light hair
              colour. Mirrored about the centre line: the first pass sloped
              them left to right and the whole head read as tilted. */}
          <g fill="none" stroke="#00000038" strokeWidth="3.2" strokeLinecap="round">
            <path d="M66 62C74 52 86 52 94 60C98 64 102 64 106 60C114 52 126 52 134 62" />
            <path d="M74 48C82 40 92 40 100 46C108 40 118 40 126 48" />
          </g>
        </g>
      );

    case "curly":
      // A ring of curls around a filled cap, so the outline is lumpy but the
      // scalp underneath is never bare.
      return (
        <g fill={color}>
          <path d={CAP} />
          <circle cx="66" cy="66" r="12" />
          <circle cx="76" cy="50" r="13" />
          <circle cx="92" cy="42" r="13" />
          <circle cx="108" cy="42" r="13" />
          <circle cx="124" cy="50" r="13" />
          <circle cx="134" cy="66" r="12" />
          <circle cx="100" cy="52" r="14" />
        </g>
      );

    case "afro":
      // A full rounded volume that sits well outside the skull on every side.
      return (
        <g fill={color}>
          <ellipse cx="100" cy="52" rx="49" ry="34" />
          <circle cx="60" cy="62" r="15" />
          <circle cx="140" cy="62" r="15" />
          <circle cx="74" cy="34" r="15" />
          <circle cx="126" cy="34" r="15" />
          <circle cx="100" cy="28" r="16" />
          <path d="M62 76C62 62 78 56 100 56C122 56 138 62 138 76C138 66 121 62 100 62C79 62 62 66 62 76Z" />
        </g>
      );

    case "bun":
      return (
        <g fill={color}>
          <path d={CAP} />
          <path d="M74 46C84 36 116 36 126 46C116 42 84 42 74 46Z" opacity={0.6} />
          <circle cx="100" cy="28" r="13" />
        </g>
      );

    case "long":
      return (
        <g fill={color}>
          <path d="M100 36c-28 0-44 18-44 40v58c0-18 5-30 5-46 0-8 3-14 8-18 8 6 22 8 31 8s23-2 31-8c5 4 8 10 8 18 0 16 5 28 5 46V76c0-22-16-40-44-40Z" />
        </g>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Beard
// ---------------------------------------------------------------------------

function Beard({ style, color }: { style: BeardStyle; color: string }) {
  switch (style) {
    case "none":
      return null;
    case "moustache":
      return <path d="M86 108q14 -7 28 0q-6 6 -14 6q-8 0 -14 -6Z" fill={color} />;
    case "soulPatch":
      return <rect x="95" y="122" width="10" height="9" rx="3" fill={color} />;
    case "chinstrap":
      return (
        <path
          d="M60 92c0 26 18 43 40 43s40-17 40-43c-3 0-5 1-6 3-3 20-16 31-34 31s-31-11-34-31c-1-2-3-3-6-3Z"
          fill={color}
        />
      );
    case "full":
      return (
        <g fill={color}>
          <path d="M64 96L62 106C61 120 74 134 100 137C126 134 139 120 138 106L136 96C127 104 115 109 100 109C85 109 73 104 64 96Z" />
        </g>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Accessories
// ---------------------------------------------------------------------------

function Accessory({ style, accent }: { style: AccessoryStyle; accent: string }) {
  if (style === "none") return null;

  if (style === "headband") {
    return (
      <g>
        <path d="M58 68q42 -28 84 0" stroke="#161616" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M58 68q42 -28 84 0" stroke={accent} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    );
  }

  if (style === "glasses") {
    // Two tinted wraparound lenses joined by a solid bridge piece, with short
    // temple arms toward the ears.
    return (
      <g>
        <path d="M64 87h-8M136 87h9" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" />
        <rect x="92" y="84" width="16" height="7" rx="3" fill="#0a0a0a" />
        {[78, 122].map((cx) => (
          <rect
            key={cx}
            x={cx - 15}
            y="78"
            width="30"
            height="20"
            rx="9"
            fill="rgba(14,16,21,0.92)"
            stroke="#0a0a0a"
            strokeWidth="2"
          />
        ))}
      </g>
    );
  }

  // beret — the only "new" hat that stayed; the stem loop sits flush on the
  // body so it never reads as a stray dot.
  return (
    <path
      d="M60 57c-3-19 15-31 40-31s42 11 41 29c-1 8-9 11-17 8-16-7-32-7-47 0-8 3-16 2-17-6Z"
      fill={accent}
    />
  );
}
