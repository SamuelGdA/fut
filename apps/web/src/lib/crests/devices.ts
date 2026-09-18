/**
 * The symbol library.
 *
 * Every device is drawn inside a 100x100 box and gets scaled into the middle of
 * the badge by the composer. Three layers, painted in this order:
 *
 *   body   — the silhouette, in the ink colour
 *   detail — cut-outs (eyes, panels, arches), in the halo colour, so they read
 *            as holes punched through the silhouette
 *   top    — small marks back in ink, on top of the cut-outs (pupils, hubs)
 *
 * Rules that keep these legible at 16px, which is the size they are actually
 * used at in the career table:
 *
 *   - one silhouette, no scenes
 *   - nothing thinner than ~6 units (≈1px at 16px)
 *   - detail is optional garnish; the silhouette alone must carry the symbol
 *
 * `scale` trims a device that would otherwise crowd the disc (wide wings) or
 * pushes up one that reads too small (a lone star).
 */

export interface Device {
  body: string;
  detail?: string;
  top?: string;
  /** Multiplier on the default device box. 1 = 56% of the badge width. */
  scale?: number;
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

/** Repeats `markup` around the centre, `count` times. */
function radial(markup: string, count: number, from = 0): string {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const angle = from + i * step;
    return angle === 0 ? markup : `<g transform="rotate(${angle.toFixed(2)} 50 50)">${markup}</g>`;
  }).join("");
}

/** Five-pointed star, centred on (cx, cy) with circumradius r. */
export function star(cx: number, cy: number, r: number, rotation = 0): string {
  const inner = r * 0.395;
  const pts: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : inner;
    const a = ((rotation - 90 + i * 36) * Math.PI) / 180;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `<path d="M${pts.join("L")}Z"/>`;
}

/** Regular polygon, used for the football panels and the abstract marks. */
function polygon(cx: number, cy: number, r: number, sides: number, rotation = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i += 1) {
    const a = ((rotation - 90 + (i * 360) / sides) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `<path d="M${pts.join("L")}Z"/>`;
}

const circle = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const box = (x: number, y: number, w: number, h: number, r = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ""}/>`;
const eyes = (y: number, dx: number, r: number) => circle(50 - dx, y, r) + circle(50 + dx, y, r);

// ---------------------------------------------------------------------------
// The library
// ---------------------------------------------------------------------------

const DEVICE_TABLE = {
  /**
   * No symbol at all.
   *
   * Some clubs already say everything with colour and pattern — Flamengo's
   * red-and-black hoops, Monaco's diagonal, River's sash. Dropping something in
   * the middle of those does not add recognition, it just covers up the thing
   * that was doing the recognising. The field is the badge.
   */
  none: { body: "" },

  // -- Birds ---------------------------------------------------------------

  /** Heraldic eagle, wings spread. */
  eagle: {
    body: [
      circle(50, 19, 12),
      `<path d="M59,15 L82,21 L59,27 Z"/>`,
      `<path d="M40,30 h20 l-4,38 -6,26 -6,-26 Z"/>`,
      `<path d="M44,36 C29,24 13,17 2,20 c9,7 14,14 15,21 -6,-2 -11,-1 -15,2 9,4 14,10 17,17 l26,10 Z"/>`,
      `<path d="M56,36 C71,24 87,17 98,20 c-9,7 -14,14 -15,21 6,-2 11,-1 15,2 -9,4 -14,10 -17,17 l-26,10 Z"/>`,
    ].join(""),
    detail: circle(54, 17, 3.5),
    scale: 1.14,
  },

  /** Raptor head in profile — the "bird of prey" read without spread wings. */
  eagleHead: {
    body: [
      circle(48, 52, 30),
      `<path d="M72,42 L100,48 L80,60 L72,56 Z"/>`,
      `<path d="M42,24 C32,10 16,5 4,9 c13,5 21,13 25,23 Z"/>`,
    ].join(""),
    detail: circle(60, 44, 5),
  },

  /** Soaring condor — long flat wings, the Andean counterpart to the eagle. */
  condor: {
    body: [
      `<path d="M50,32 c4,0 7,3 7,7 v8 H43 v-8 c0,-4 3,-7 7,-7 Z"/>`,
      `<path d="M44,44 C30,36 12,32 2,38 c9,3 13,7 15,12 -6,0 -11,2 -13,7 9,0 15,4 19,9 l21,10 Z"/>`,
      `<path d="M56,44 C70,36 88,32 98,38 c-9,3 -13,7 -15,12 6,0 11,2 13,7 -9,0 -15,4 -19,9 l-21,10 Z"/>`,
      `<path d="M42,64 h16 l-3,28 h-10 Z"/>`,
    ].join(""),
    detail: `<path d="M44,36 h12 v5 H44 Z"/>`,
    scale: 1.14,
  },

  /** Gull in flight — the twin-curve seabird silhouette. */
  gull: {
    body: `<path d="M3,60 C17,26 34,21 50,44 C66,21 83,26 97,60 C84,40 70,41 56,61 l-6,9 -6,-9 C30,41 16,40 3,60 Z"/>`,
    scale: 1.16,
  },

  /** Perched magpie / crow. */
  magpie: {
    body: [
      circle(64, 22, 13),
      `<path d="M75,19 L96,25 L75,31 Z"/>`,
      `<path d="M58,30 C42,34 28,48 28,64 c0,13 9,23 22,25 l-5,9 h28 l-4,-10 c13,-6 20,-18 18,-31 C85,42 74,32 58,30 Z"/>`,
      `<path d="M28,58 L2,74 L28,74 Z"/>`,
    ].join(""),
    detail: [circle(67, 20, 4), `<path d="M46,48 C36,52 30,62 32,72 l20,-8 Z"/>`].join(""),
  },

  owl: {
    body: [
      `<path d="M50,8 C74,8 90,28 90,54 c0,24 -18,40 -40,40 S10,78 10,54 C10,28 26,8 50,8 Z"/>`,
      `<path d="M13,20 l17,11 -5,-23 Z"/>`,
      `<path d="M87,20 l-17,11 5,-23 Z"/>`,
    ].join(""),
    detail: eyes(46, 16, 15),
    top: eyes(46, 16, 7) + `<path d="M50,52 l7,13 h-14 Z"/>`,
  },

  rooster: {
    body: [
      // Two sweeping tail feathers and a three-peak comb are what carry the
      // "cockerel" read; the body on its own looks like a duck.
      `<path d="M32,58 C10,52 1,28 9,6 c3,22 16,35 32,39 Z"/>`,
      `<path d="M34,70 C12,67 1,46 6,26 c5,20 18,31 34,33 Z"/>`,
      `<path d="M46,14 l5,-12 4,9 6,-11 4,10 7,-8 2,14 Z"/>`,
      circle(61, 29, 16),
      `<path d="M76,25 L99,31 L76,39 Z"/>`,
      `<path d="M60,42 c-5,8 -1,13 4,13 6,0 9,-6 4,-13 Z"/>`,
      `<path d="M52,40 C33,45 21,59 21,73 c0,12 10,20 24,20 17,0 29,-12 31,-27 2,-16 -8,-26 -24,-26 Z"/>`,
      box(38, 91, 6, 8),
      box(54, 91, 6, 8),
    ].join(""),
    detail: circle(66, 26, 5),
  },

  swan: {
    body: [
      circle(77, 15, 11),
      `<path d="M87,12 L100,17 L87,23 Z"/>`,
      // A long thin S-neck is the whole difference between a swan and a duck.
      `<path d="M70,24 C59,34 55,46 57,58 l-14,2 C40,42 47,27 60,16 Z"/>`,
      `<path d="M59,56 C39,49 16,55 8,69 c-5,10 2,19 13,19 h41 c17,0 29,-11 29,-24 0,-9 -7,-16 -17,-15 -8,1 -12,5 -15,7 Z"/>`,
    ].join(""),
    detail: circle(80, 13, 3.5),
  },

  // -- Mammals -------------------------------------------------------------

  /**
   * Lion mask. The mane is a ring of overlapping lobes rather than spikes — a
   * spiked mane collapses into a sunburst below about 30px, which is exactly
   * where these badges live.
   */
  lion: {
    body: radial(circle(50, 21, 13), 11) + circle(50, 50, 34),
    detail: `<path d="M50,22 c17,0 28,12 28,29 0,19 -12,33 -28,33 S22,70 22,51 c0,-17 11,-29 28,-29 Z"/>`,
    top:
      eyes(44, 12, 5) +
      `<path d="M50,54 l7,10 h-14 Z"/><path d="M35,66 c6,9 24,9 30,0 -2,13 -28,13 -30,0 Z"/>` +
      `<path d="M28,32 l14,6 -3,7 -14,-6 Z"/><path d="M72,32 l-14,6 3,7 14,-6 Z"/>`,
  },

  // A third lion in profile was tried twice and read as a cloud both times: a
  // lobed mane and a muzzle fight for the same silhouette at badge size. The
  // mask above and the crowned head below cover every club that needs one.

  bull: {
    body: [
      // Horns sweep out and then hook up, so they can't be mistaken for ears.
      `<path d="M30,40 C16,36 8,26 6,12 c-6,10 -4,26 6,35 6,5 12,7 18,7 Z"/>`,
      `<path d="M70,40 C84,36 92,26 94,12 c6,10 4,26 -6,35 -6,5 -12,7 -18,7 Z"/>`,
      `<path d="M50,26 c-16,0 -26,9 -26,24 0,10 4,19 10,26 l6,20 h20 l6,-20 c6,-7 10,-16 10,-26 0,-15 -10,-24 -26,-24 Z"/>`,
    ].join(""),
    detail: eyes(50, 12, 6) + `<ellipse cx="50" cy="80" rx="13" ry="9"/>`,
    top: eyes(80, 5, 3),
  },

  ram: {
    body: [
      // The curl has to clear the head or the whole thing reads as a koala.
      `<path d="M35,28 C16,21 1,34 3,53 5,71 22,80 33,69 20,72 11,63 11,52 11,39 22,32 35,37 Z"/>`,
      `<path d="M65,28 C84,21 99,34 97,53 95,71 78,80 67,69 80,72 89,63 89,52 89,39 78,32 65,37 Z"/>`,
      `<path d="M50,40 c-11,0 -18,8 -18,20 0,15 8,28 18,36 10,-8 18,-21 18,-36 0,-12 -7,-20 -18,-20 Z"/>`,
      `<path d="M32,48 L14,42 28,60 Z"/>`,
      `<path d="M68,48 L86,42 72,60 Z"/>`,
    ].join(""),
    detail: eyes(60, 9, 5),
  },

  /** Chess-knight profile — the clearest horse silhouette at badge sizes. */
  horse: {
    body: `<path d="M24,96 C24,72 28,54 43,40 L39,17 L52,4 L59,26 C75,30 89,38 96,53 L78,57 L76,67 L59,69 C55,79 53,87 53,96 Z"/>`,
    detail: circle(67, 41, 5) + `<path d="M44,20 C34,32 29,46 28,62 l-11,-5 C19,40 27,27 39,16 Z"/>`,
  },

  /**
   * Wolf head — long muzzle running down to a point. Without it the mask is
   * the same triangle as `cat` and the two become interchangeable.
   */
  wolf: {
    body: `<path d="M11,4 L34,26 c10,-5 22,-5 32,0 L89,4 V40 c0,15 -5,27 -14,35 L50,97 25,75 C16,67 11,55 11,40 Z"/>`,
    detail: eyes(44, 16, 6) + `<path d="M50,58 l-12,12 12,20 12,-20 Z"/>`,
    top: circle(50, 66, 4.5),
  },

  fox: {
    body: `<path d="M9,12 L33,32 c11,-5 23,-5 34,0 L91,12 86,45 c0,11 -6,20 -15,26 L50,93 29,71 C20,65 14,56 14,45 Z"/>`,
    detail: eyes(44, 14, 5.5) + `<path d="M50,58 l-9,9 9,8 9,-8 Z"/>`,
  },

  bear: {
    body: [circle(21, 25, 15), circle(79, 25, 15), `<path d="M50,13 C72,13 87,31 87,54 87,77 71,93 50,93 S13,77 13,54 C13,31 28,13 50,13 Z"/>`].join(""),
    detail: `<ellipse cx="50" cy="70" rx="21" ry="16"/>`,
    top: eyes(47, 14, 5.5) + `<ellipse cx="50" cy="64" rx="9" ry="6.5"/>`,
  },

  /** Big-cat mask — jaguar, puma, panther. */
  cat: {
    body: `<path d="M7,17 l23,15 C36,25 42,21 50,21 s14,4 20,11 L93,17 87,45 c4,6 6,12 6,19 0,20 -18,35 -43,35 S7,84 7,64 c0,-7 2,-13 6,-19 Z"/>`,
    detail: `<path d="M50,57 c-9,0 -15,5 -15,11 0,9 8,15 15,15 s15,-6 15,-15 c0,-6 -6,-11 -15,-11 Z"/>`,
    top: eyes(50, 17, 5.5),
  },

  stag: {
    body: [
      `<path d="M50,50 c-11,0 -18,9 -18,20 0,15 9,26 18,32 9,-6 18,-17 18,-32 0,-11 -7,-20 -18,-20 Z"/>`,
      `<path d="M33,58 L12,48 26,68 Z"/>`,
      `<path d="M67,58 L88,48 74,68 Z"/>`,
      // Two clearly branched tines a side, or the antlers read as rabbit ears.
      `<path d="M43,52 L33,28 L14,25 L17,15 L30,18 L25,5 L35,2 L42,22 L50,46 Z"/>`,
      `<path d="M57,52 L67,28 L86,25 L83,15 L70,18 L75,5 L65,2 L58,22 L50,46 Z"/>`,
    ].join(""),
    detail: eyes(68, 9, 4.5),
  },

  /** Coiled serpent, head raised — the biscione and its cousins. */
  snake: {
    body: [
      `<path d="M50,42 c-22,0 -40,12 -40,28 0,15 16,26 38,26 h30 V80 H50 c-12,0 -22,-4 -22,-10 0,-7 10,-12 24,-12 20,0 34,-11 34,-27 0,-9 -6,-17 -16,-21 l-6,16 c4,2 6,4 6,7 0,6 -8,9 -20,9 Z"/>`,
      `<path d="M62,4 c9,-4 20,0 24,10 l-17,7 Z"/>`,
    ].join(""),
    detail: circle(74, 14, 4),
  },

  elephant: {
    body: [
      `<ellipse cx="50" cy="44" rx="27" ry="30"/>`,
      `<path d="M23,25 C9,20 0,31 2,45 4,60 15,69 27,66 Z"/>`,
      `<path d="M77,25 C91,20 100,31 98,45 96,60 85,69 73,66 Z"/>`,
      `<path d="M42,66 v18 c0,9 6,14 13,14 s12,-6 12,-14 v-6 h-11 v6 c0,2 -3,2 -3,0 V66 Z"/>`,
    ].join(""),
    detail: eyes(42, 13, 5),
  },

  /** Welsh-style dragon head. */
  dragon: {
    body: [
      `<path d="M5,44 C5,25 22,11 44,11 c14,0 26,6 33,16 l18,-9 -8,15 12,6 -15,7 c0,4 -1,8 -3,11 l17,6 -21,4 -6,11 -9,-9 c-6,2 -12,3 -18,3 C22,72 5,63 5,44 Z"/>`,
      `<path d="M30,66 l-8,26 12,-8 8,10 4,-22 Z"/>`,
    ].join(""),
    detail: circle(48, 34, 5),
  },

  bee: {
    body: [
      `<ellipse cx="21" cy="41" rx="19" ry="10" transform="rotate(-32 21 41)"/>`,
      `<ellipse cx="79" cy="41" rx="19" ry="10" transform="rotate(32 79 41)"/>`,
      `<ellipse cx="50" cy="61" rx="24" ry="30"/>`,
      circle(50, 26, 14),
    ].join(""),
    detail: box(27, 49, 46, 8) + box(29, 67, 42, 8),
  },

  // -- Water ---------------------------------------------------------------

  dolphin: {
    body: `<path d="M94,12 C71,13 52,26 40,45 30,41 15,43 6,52 c13,0 19,6 21,15 4,17 19,28 36,28 -15,-9 -23,-21 -21,-34 C44,40 63,21 94,12 Z"/>`,
    detail: circle(76, 25, 4),
  },

  shark: {
    body: `<path d="M3,57 c15,-11 36,-17 57,-17 l14,-25 4,27 c10,2 18,7 22,13 -6,5 -14,9 -25,11 l-5,23 -14,-21 c-21,0 -39,-4 -53,-11 Z"/>`,
    detail: circle(80, 55, 4),
    scale: 1.1,
  },

  fish: {
    body: [
      `<path d="M96,50 C82,31 62,23 46,23 29,23 19,34 15,50 19,66 29,77 46,77 62,77 82,69 96,50 Z"/>`,
      `<path d="M17,50 L1,29 v42 Z"/>`,
      `<path d="M46,25 l11,-16 3,18 Z"/>`,
    ].join(""),
    detail: circle(74, 43, 5),
  },

  wave: {
    body: [
      `<path d="M3,36 C18,19 33,19 50,36 C65,51 78,51 97,33 v17 C78,68 63,68 50,53 34,36 21,36 3,53 Z"/>`,
      `<path d="M3,66 C18,49 33,49 50,66 C65,81 78,81 97,63 v17 C78,98 63,98 50,83 34,66 21,66 3,83 Z"/>`,
    ].join(""),
    scale: 1.1,
  },

  anchor: {
    body: [
      circle(50, 15, 11),
      box(44, 20, 12, 62, 3),
      box(23, 33, 54, 10, 5),
      `<path d="M11,55 l14,5 c2,12 12,20 25,20 s23,-8 25,-20 l14,-5 c0,25 -18,42 -39,42 S11,80 11,55 Z"/>`,
    ].join(""),
    detail: circle(50, 15, 5),
  },

  ship: {
    body: [
      `<path d="M3,64 C20,72 80,72 97,64 l-11,24 H14 Z"/>`,
      box(46, 4, 8, 60),
      `<path d="M44,10 v50 H15 C15,36 27,17 44,10 Z"/>`,
      `<path d="M56,22 v38 h27 C83,44 72,28 56,22 Z"/>`,
    ].join(""),
  },

  lighthouse: {
    body: [
      `<path d="M31,94 L38,36 h24 l7,58 Z"/>`,
      box(32, 26, 36, 10, 3),
      box(41, 15, 18, 11, 2),
      `<path d="M50,3 L61,15 H39 Z"/>`,
      `<path d="M70,14 L96,5 v14 Z"/>`,
      `<path d="M30,14 L4,5 v14 Z"/>`,
    ].join(""),
    detail: `<path d="M36.5,52 h27 l1.2,11 H35.3 Z"/><path d="M34,72 h32 l1.2,11 H32.8 Z"/>`,
  },

  wheelShip: {
    body: [circle(50, 50, 33), radial(box(46, 2, 8, 16, 3), 8)].join(""),
    detail: circle(50, 50, 23),
    top: [circle(50, 50, 8), radial(box(47, 16, 6, 68), 4)].join(""),
  },

  // -- Land & sky ----------------------------------------------------------

  mountain: {
    body: `<path d="M2,88 L31,20 L50,58 L63,38 L98,88 Z"/>`,
    detail: `<path d="M31,20 L41,40 l-5,-4 -5,5 -5,-5 -4,4 Z"/>`,
  },

  volcano: {
    body: [
      `<path d="M2,92 L32,34 h36 l30,58 Z"/>`,
      `<path d="M36,34 L28,4 40,16 50,0 60,16 72,4 64,34 Z"/>`,
    ].join(""),
    detail: `<path d="M32,34 h36 l-8,11 H40 Z"/><path d="M44,50 l14,10 -8,12 12,10 -22,-8 8,-10 Z"/>`,
  },

  sun: {
    body: [circle(50, 50, 27), radial(`<path d="M43,28 L50,2 L57,28 Z"/>`, 8)].join(""),
  },

  /** Crescent, cut with even-odd rather than an arc chain that never closed. */
  moon: {
    body: `<path fill-rule="evenodd" d="M2,50 a46,46 0 1,0 92,0 a46,46 0 1,0 -92,0 Z M26,50 a38,38 0 1,0 76,0 a38,38 0 1,0 -76,0 Z"/>`,
  },

  star: { body: star(50, 50, 49), scale: 0.94 },

  /** Three stars in a triangle — the "titles" motif. */
  starTri: {
    body: [star(50, 26, 25), star(24, 70, 22), star(76, 70, 22)].join(""),
    scale: 1.08,
  },

  /** Compass rose — also reads as a four-pointed star. */
  compass: {
    body: `<path d="M50,1 L60,40 99,50 60,60 50,99 40,60 1,50 40,40 Z"/>`,
    detail: circle(50, 50, 8),
    scale: 1.05,
  },

  bolt: {
    body: `<path d="M60,3 L18,55 h24 l-6,42 46,-58 H60 Z"/>`,
  },

  flame: {
    body: `<path d="M50,3 C63,24 79,36 79,57 A29,29 0 0,1 21,57 C21,36 37,24 50,3 Z"/>`,
    detail: `<path d="M50,36 C57,48 65,54 65,64 A15,15 0 0,1 35,64 C35,54 43,48 50,36 Z"/>`,
  },

  torch: {
    body: [
      `<path d="M50,2 C61,17 71,25 71,38 A21,21 0 0,1 29,38 C29,25 39,17 50,2 Z"/>`,
      `<path d="M32,52 h36 l-6,12 H38 Z"/>`,
      box(42, 64, 16, 34, 3),
      box(35, 76, 30, 9, 3),
    ].join(""),
    detail: `<path d="M50,24 C56,34 61,39 61,46 A11,11 0 0,1 39,46 C39,39 44,34 50,24 Z"/>`,
  },

  /**
   * Leafy tree. A single canopy circle with a trunk line cut through it read
   * as a trident; overlapping lobes read as foliage.
   */
  tree: {
    body: [
      circle(50, 27, 22),
      circle(31, 41, 19),
      circle(69, 41, 19),
      circle(50, 49, 20),
      box(44, 52, 12, 38, 2),
      `<path d="M32,97 h36 l-10,-13 H42 Z"/>`,
    ].join(""),
  },

  pine: {
    body: `<path d="M50,3 L73,37 H63 L83,66 H57 v30 H43 V66 H17 L37,37 H27 Z"/>`,
  },

  palm: {
    body: [
      `<path d="M43,96 C43,71 46,55 57,41 l12,6 C58,60 56,74 56,96 Z"/>`,
      `<path d="M61,40 C49,26 29,24 17,34 31,32 45,36 57,46 Z"/>`,
      `<path d="M61,39 C63,21 53,6 39,4 49,14 53,25 55,41 Z"/>`,
      `<path d="M64,39 C76,21 94,20 99,31 86,27 74,33 66,45 Z"/>`,
      `<path d="M65,43 C82,39 96,47 97,59 86,50 75,50 66,53 Z"/>`,
      `<path d="M59,43 C43,45 32,55 32,67 42,57 51,53 59,53 Z"/>`,
    ].join(""),
  },

  wheat: {
    body: [
      box(45, 58, 10, 40, 4),
      `<path d="M50,2 c10,9 10,23 0,32 -10,-9 -10,-23 0,-32 Z"/>`,
      `<path d="M50,28 c10,9 10,23 0,32 -10,-9 -10,-23 0,-32 Z"/>`,
      `<path d="M38,18 c13,4 19,17 14,30 -13,-4 -19,-17 -14,-30 Z"/>`,
      `<path d="M62,18 c-13,4 -19,17 -14,30 13,-4 19,-17 14,-30 Z"/>`,
      `<path d="M32,44 c13,4 19,17 14,30 -13,-4 -19,-17 -14,-30 Z"/>`,
      `<path d="M68,44 c-13,4 -19,17 -14,30 13,-4 19,-17 14,-30 Z"/>`,
    ].join(""),
  },

  laurel: {
    body: [
      `<path d="M50,94 C24,86 8,64 8,40 8,26 14,14 24,6 c8,10 10,22 8,34 -3,16 2,34 18,44 Z"/>`,
      `<path d="M50,94 C76,86 92,64 92,40 92,26 86,14 76,6 c-8,10 -10,22 -8,34 3,16 -2,34 -18,44 Z"/>`,
    ].join(""),
    detail: [
      `<ellipse cx="26" cy="30" rx="11" ry="6" transform="rotate(-40 26 30)"/>`,
      `<ellipse cx="30" cy="52" rx="11" ry="6" transform="rotate(-15 30 52)"/>`,
      `<ellipse cx="40" cy="72" rx="11" ry="6" transform="rotate(20 40 72)"/>`,
      `<ellipse cx="74" cy="30" rx="11" ry="6" transform="rotate(40 74 30)"/>`,
      `<ellipse cx="70" cy="52" rx="11" ry="6" transform="rotate(15 70 52)"/>`,
      `<ellipse cx="60" cy="72" rx="11" ry="6" transform="rotate(-20 60 72)"/>`,
    ].join(""),
    scale: 1.08,
  },

  trefoil: {
    body: [circle(50, 27, 19), circle(27, 53, 19), circle(73, 53, 19), `<path d="M45,62 c0,17 -4,27 -11,35 h32 c-7,-8 -11,-18 -11,-35 Z"/>`].join(""),
  },

  grapes: {
    body: [
      circle(50, 40, 12),
      circle(31, 52, 12),
      circle(69, 52, 12),
      circle(41, 68, 12),
      circle(59, 68, 12),
      circle(50, 85, 11),
      `<path d="M52,30 C56,14 70,6 86,9 82,23 70,31 55,30 Z"/>`,
    ].join(""),
  },

  cactus: {
    body: [
      `<path d="M39,97 V44 a11,11 0 0,1 22,0 v53 Z"/>`,
      `<path d="M39,63 H29 a9,9 0 0,0 -9,9 v17 h13 V74 h6 Z"/>`,
      `<path d="M61,55 h10 a9,9 0 0,1 9,9 v22 H67 V66 h-6 Z"/>`,
    ].join(""),
  },

  leaf: {
    body: `<path d="M88,8 C50,8 18,32 12,64 c-2,10 0,20 6,28 C48,88 78,60 88,8 Z"/>`,
    detail: `<path d="M84,12 C56,40 34,66 18,92 l-6,-4 C28,60 52,32 80,7 Z"/>`,
  },

  // -- Made things ---------------------------------------------------------

  ball: {
    body: circle(50, 50, 45),
    detail: [polygon(50, 50, 18, 5), radial(`<path d="M46.5,33 V3 h7 v30 Z"/>`, 5)].join(""),
  },

  boot: {
    body: [
      `<path d="M8,36 h27 c5,0 8,3 10,8 l7,15 c3,7 9,10 18,12 13,3 22,9 22,18 v7 H8 Z"/>`,
    ].join(""),
    detail: box(14, 88, 12, 8, 3) + box(38, 88, 12, 8, 3) + box(66, 88, 12, 8, 3),
  },

  goal: {
    body: [`<path d="M4,86 V22 h92 v64 H84 V34 H16 v52 Z"/>`, box(30, 34, 5, 52), box(65, 34, 5, 52), box(16, 47, 68, 5), box(16, 66, 68, 5)].join(""),
  },

  crown: {
    body: [`<path d="M7,72 L14,24 L32,45 L50,13 L68,45 L86,24 L93,72 Z"/>`, box(7, 72, 86, 15, 3)].join(""),
    detail: circle(28, 80, 4) + circle(50, 80, 4) + circle(72, 80, 4),
  },

  keys: {
    body: [
      `<g transform="rotate(-28 50 50)">${circle(50, 12, 12)}${box(44, 20, 12, 70, 2)}${box(56, 62, 14, 9)}${box(56, 77, 12, 9)}</g>`,
      `<g transform="rotate(28 50 50)">${circle(50, 12, 12)}${box(44, 20, 12, 70, 2)}${box(30, 62, 14, 9)}${box(32, 77, 12, 9)}</g>`,
    ].join(""),
    detail: `<g transform="rotate(-28 50 50)">${circle(50, 12, 5)}</g><g transform="rotate(28 50 50)">${circle(50, 12, 5)}</g>`,
  },

  swords: {
    body: (() => {
      const sword = [
        `<path d="M50,2 l6,16 v48 h-12 V18 Z"/>`,
        box(27, 66, 46, 8, 3),
        box(45, 74, 10, 16),
        circle(50, 94, 7),
      ].join("");
      return `<g transform="rotate(-34 50 50)">${sword}</g><g transform="rotate(34 50 50)">${sword}</g>`;
    })(),
  },

  cannon: {
    body: [
      // A flared cylindrical muzzle, not a point — a pointed barrel just reads
      // as an arrow.
      box(6, 26, 74, 20, 4),
      box(80, 21, 14, 30, 3),
      circle(11, 36, 12),
      `<path d="M22,48 h16 l50,34 -10,12 Z"/>`,
      circle(36, 70, 22),
    ].join(""),
    // Ring + hub so the wheel does not merge into the trail as one dark blob.
    detail: `<path fill-rule="evenodd" d="M36,70 m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0 Z M36,70 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 Z"/>`,
  },

  hammers: {
    body: [
      `<g transform="rotate(-30 50 50)">${box(45, 22, 11, 74, 3)}${box(25, 8, 50, 20, 4)}</g>`,
      `<g transform="rotate(30 50 50)">${box(45, 22, 11, 74, 3)}${box(25, 8, 50, 20, 4)}</g>`,
    ].join(""),
  },

  gear: {
    body: [circle(50, 50, 34), radial(box(43, 3, 14, 20, 3), 8)].join(""),
    detail: circle(50, 50, 14),
  },

  train: {
    body: [box(14, 40, 72, 30, 6), box(23, 16, 15, 24, 3), box(7, 66, 86, 11, 4), circle(30, 83, 11), circle(70, 83, 11)].join(""),
    detail: circle(30, 83, 4) + circle(70, 83, 4) + box(55, 46, 24, 13, 3),
  },

  /** Winged wheel — the railway clubs' mark. */
  wingedWheel: {
    body: [
      circle(50, 60, 28),
      `<path d="M23,42 C10,36 3,26 3,16 c15,4 26,9 34,17 Z"/>`,
      `<path d="M77,42 C90,36 97,26 97,16 c-15,4 -26,9 -34,17 Z"/>`,
    ].join(""),
    detail: circle(50, 60, 17),
    top: circle(50, 60, 7) + radial(`<path d="M47,36 h6 v24 h-6 Z"/>`, 4),
  },

  /** Crossed pickaxes. A single upright pick just reads as a letter T. */
  picks: {
    body: (() => {
      const pick =
        `<path d="M50,3 C33,3 18,9 7,20 l9,10 C25,21 37,16 50,16 s25,5 34,14 l9,-10 C82,9 67,3 50,3 Z"/>` +
        box(45, 12, 10, 84, 3);
      return `<g transform="rotate(-27 50 50)">${pick}</g><g transform="rotate(27 50 50)">${pick}</g>`;
    })(),
  },

  /** Oil derrick: crown platform and two braces, or it just reads as an "A". */
  derrick: {
    body: [
      box(28, 6, 44, 10, 2),
      `<path d="M12,90 L33,16 h34 l21,74 H74 L57,30 H43 L26,90 Z"/>`,
      box(30, 40, 40, 9),
      box(21, 64, 58, 9),
      box(6, 90, 88, 9, 2),
    ].join(""),
  },

  /** Saw-tooth mill roof under a smokestack — the textile and steel towns. */
  chimney: {
    body: [
      `<path d="M3,95 V60 l14,-15 v15 l14,-15 v15 l14,-15 v50 Z"/>`,
      `<path d="M57,95 L61,28 h18 l4,67 Z"/>`,
      box(54, 18, 32, 10, 2),
    ].join(""),
    detail: box(9, 72, 9, 12) + box(23, 72, 9, 12) + box(37, 72, 9, 12) + box(63, 46, 14, 9),
  },

  // -- Architecture --------------------------------------------------------

  tower: {
    body: [box(33, 27, 34, 69), `<path d="M50,2 L72,27 H28 Z"/>`, box(27, 88, 46, 9, 2)].join(""),
    detail: `<path d="M50,38 a9,9 0 0,1 9,9 v18 H41 V47 a9,9 0 0,1 9,-9 Z"/>`,
  },

  castle: {
    body: [
      `<path d="M4,95 V36 h6 v-7 h7 v7 h6 v-7 h7 v7 h6 v59 Z"/>`,
      `<path d="M64,95 V36 h6 v-7 h7 v7 h6 v-7 h7 v7 h6 v59 Z"/>`,
      `<path d="M30,95 V20 h7 v-8 h8 v8 h10 v-8 h8 v8 h7 v75 Z"/>`,
    ].join(""),
    detail: `<path d="M42,95 V68 a8,8 0 0,1 16,0 v27 Z"/>`,
  },

  arches: {
    body: [box(3, 25, 94, 16), box(7, 41, 86, 54)].join(""),
    detail: [
      `<path d="M15,95 V68 a10,10 0 0,1 20,0 v27 Z"/>`,
      `<path d="M40,95 V68 a10,10 0 0,1 20,0 v27 Z"/>`,
      `<path d="M65,95 V68 a10,10 0 0,1 20,0 v27 Z"/>`,
    ].join(""),
  },

  /** Single-span arch bridge — reads far better small than a cable bridge. */
  bridge: {
    body: [
      box(2, 22, 96, 12, 2),
      `<path d="M4,92 V74 C4,46 24,26 50,26 s46,20 46,48 v18 H82 V74 c0,-19 -14,-33 -32,-33 S18,55 18,74 v18 Z"/>`,
      // Water rather than a plinth, so the arch reads as a bridge and not a gate.
      `<path d="M2,90 q12,-8 24,0 t24,0 t24,0 t24,0 v9 H2 Z"/>`,
    ].join(""),
  },

  dome: {
    body: [
      `<path d="M50,7 C69,7 81,23 81,42 v5 H19 v-5 C19,23 31,7 50,7 Z"/>`,
      box(14, 47, 72, 11),
      box(21, 58, 58, 37),
      box(47, 0, 6, 9),
    ].join(""),
    detail: `<path d="M42,95 V72 a8,8 0 0,1 16,0 v23 Z"/>`,
  },

  column: {
    body: [`<path d="M50,3 L88,22 H12 Z"/>`, box(23, 26, 54, 12, 2), `<path d="M33,38 h34 l4,48 H29 Z"/>`, box(19, 86, 62, 12, 2)].join(""),
    detail: box(39, 42, 5, 40) + box(48, 42, 5, 40) + box(57, 42, 5, 40),
  },

  gate: {
    body: [box(4, 11, 92, 13, 2), box(9, 24, 82, 71)].join(""),
    detail: `<path d="M31,95 V56 a19,19 0 0,1 38,0 v39 Z"/>`,
  },

  obelisk: {
    body: [`<path d="M50,3 L61,26 L58,84 H42 L39,26 Z"/>`, box(31, 84, 38, 12, 2)].join(""),
    detail: box(46, 34, 8, 40),
  },

  pyramid: {
    body: `<path d="M50,7 L97,90 H3 Z"/>`,
    detail: `<path d="M50,7 L97,90 H50 Z"/>`,
  },

  windmill: {
    body: [
      `<path d="M33,96 L40,42 h20 l7,54 Z"/>`,
      `<g transform="rotate(24 50 36)">${box(46, 2, 8, 68, 2)}${box(16, 32, 68, 8, 2)}</g>`,
    ].join(""),
    detail: circle(50, 36, 6),
  },

  skyline: {
    body: `<path d="M3,93 V54 h13 V40 h10 v14 h8 V27 h6 v-9 h6 v9 h6 v27 h8 V43 h10 v11 h10 V36 h8 v57 Z"/>`,
    detail: box(8, 62, 6, 8) + box(20, 62, 6, 8) + box(45, 40, 6, 8) + box(74, 52, 6, 8),
  },

  /**
   * Bowl with floodlights. The pitch inside is rectangular on purpose — an
   * ellipse inside an ellipse reads as an eye, which it did on the first pass.
   */
  stadium: {
    body: [
      `<path d="M6,10 h16 v7 h-5 v18 h-6 V17 H6 Z"/>`,
      `<path d="M78,10 h16 v7 h-5 v18 h-6 V17 h-5 Z"/>`,
      `<ellipse cx="50" cy="60" rx="46" ry="32"/>`,
    ].join(""),
    detail: box(22, 44, 56, 32, 4),
    top: box(48.5, 44, 3, 32) + circle(50, 60, 7),
  },

  wall: {
    body: box(5, 28, 90, 62, 4),
    detail: [box(5, 44, 90, 5), box(5, 66, 90, 5), box(30, 28, 5, 16), box(65, 28, 5, 16), box(18, 49, 5, 17), box(48, 49, 5, 17), box(78, 49, 5, 17), box(30, 71, 5, 19), box(65, 71, 5, 19)].join(""),
  },

  // -- Emblems -------------------------------------------------------------

  fleur: {
    body: [
      `<path d="M50,2 C43,17 39,27 39,37 c0,8 4,15 11,19 7,-4 11,-11 11,-19 0,-10 -4,-20 -11,-35 Z"/>`,
      `<path d="M39,46 C27,35 10,39 10,54 c0,13 12,21 26,17 -6,-6 -8,-15 -8,-25 Z"/>`,
      `<path d="M61,46 C73,35 90,39 90,54 c0,13 -12,21 -26,17 6,-6 8,-15 8,-25 Z"/>`,
      box(29, 63, 42, 10, 3),
      `<path d="M43,73 c0,11 -2,19 -7,25 h28 c-5,-6 -7,-14 -7,-25 Z"/>`,
    ].join(""),
  },

  crossHeraldic: {
    body: `<path d="M39,3 h22 v36 h36 v22 H61 v36 H39 V61 H3 V39 h36 Z"/>`,
  },

  crossLorraine: {
    body: `<path d="M42,3 h16 v17 h20 v16 H58 v20 h30 v16 H58 v25 H42 V72 H12 V56 h30 V36 H22 V20 h20 Z"/>`,
  },

  diamond: {
    body: `<path d="M50,3 L97,50 50,97 3,50 Z"/>`,
    detail: `<path d="M50,25 L75,50 50,75 25,50 Z"/>`,
    top: `<path d="M50,40 L60,50 50,60 40,50 Z"/>`,
  },

  /** Corinthian helm — dome, nose bar, two eye slots, plume across the top. */
  helmet: {
    body: [
      `<path d="M50,2 C34,2 25,10 25,20 h50 C75,10 66,2 50,2 Z"/>`,
      `<path d="M50,16 C28,16 16,32 16,54 v42 h20 V76 h28 v20 h20 V54 C84,32 72,16 50,16 Z"/>`,
    ].join(""),
    detail: box(22, 40, 22, 14, 2) + box(56, 40, 22, 14, 2) + box(37, 62, 26, 14, 2),
  },

  /** Gaucho hat — a low crown over a very wide brim. */
  hat: {
    body: [
      `<path d="M28,56 l3,-24 c2,-13 10,-20 19,-20 s17,7 19,20 l3,24 Z"/>`,
      `<path d="M2,62 c0,-8 21,-13 48,-13 s48,5 48,13 -21,15 -48,15 S2,70 2,62 Z"/>`,
    ].join(""),
    detail: `<path d="M30,44 h40 l1,9 H29 Z"/>`,
  },

  /** Top hat — the Fluminense cartola and its cousins. */
  topHat: {
    body: [box(30, 6, 40, 60, 3), `<path d="M8,66 c0,-6 19,-9 42,-9 s42,3 42,9 -19,10 -42,10 S8,72 8,66 Z"/>`].join(""),
    detail: box(30, 48, 40, 12),
  },

  pennant: {
    body: [box(15, 5, 9, 91, 3), `<path d="M24,10 h60 l-15,21 15,21 H24 Z"/>`].join(""),
  },

  feather: {
    body: `<path d="M86,7 C55,12 31,34 22,62 l-9,25 21,-9 C64,68 84,40 86,7 Z"/>`,
    detail: `<path d="M20,84 C36,58 58,34 84,12"/>`,
  },

  /** Bass drum head-on with crossed sticks — a side-on drum read as a barrel. */
  drum: {
    body: circle(50, 50, 45),
    detail: circle(50, 50, 33),
    top: `<g transform="rotate(38 50 50)">${box(16, 45, 68, 10, 5)}</g><g transform="rotate(-38 50 50)">${box(16, 45, 68, 10, 5)}</g>`,
  },

  mask: {
    body: `<path d="M50,9 C74,9 91,24 91,44 c0,27 -21,48 -41,48 S9,71 9,44 C9,24 26,9 50,9 Z"/>`,
    detail: `<path d="M22,38 c6,-7 20,-7 26,0 -6,8 -20,8 -26,0 Z"/><path d="M52,38 c6,-7 20,-7 26,0 -6,8 -20,8 -26,0 Z"/><path d="M32,64 c10,10 26,10 36,0 -4,14 -32,14 -36,0 Z"/>`,
  },

  horseshoe: {
    body: `<path d="M50,5 C28,5 12,23 12,47 v41 h22 V47 c0,-10 7,-18 16,-18 s16,8 16,18 v41 h22 V47 C88,23 72,5 50,5 Z"/>`,
    detail: circle(23, 74, 4) + circle(77, 74, 4) + circle(24, 55, 4) + circle(76, 55, 4),
  },

  plane: {
    body: `<path d="M50,3 c6,0 11,9 11,20 v11 l36,21 v13 l-36,-11 v19 l13,11 v8 l-24,-7 -24,7 v-8 l13,-11 V57 L3,68 V55 l36,-21 V23 C39,12 44,3 50,3 Z"/>`,
  },

  bell: {
    body: [
      `<path d="M50,6 a7,7 0 0,1 7,7 c15,7 21,19 21,36 0,15 4,23 8,27 H14 c4,-4 8,-12 8,-27 0,-17 6,-29 21,-36 a7,7 0 0,1 7,-7 Z"/>`,
      circle(50, 87, 9),
    ].join(""),
  },

  trident: {
    body: [
      box(44, 2, 12, 94),
      `<path d="M6,8 h13 v34 c0,8 5,13 12,14 v13 C17,68 6,56 6,42 Z"/>`,
      `<path d="M94,8 H81 v34 c0,8 -5,13 -12,14 v13 c14,-1 25,-13 25,-27 Z"/>`,
      box(28, 56, 44, 11, 3),
    ].join(""),
  },

  cherries: {
    body: [
      circle(30, 72, 21),
      circle(72, 76, 19),
      `<path d="M52,7 c-9,21 -17,37 -23,51 l9,4 c6,-14 14,-31 22,-52 Z"/>`,
      `<path d="M56,7 c6,23 13,43 19,58 l-9,3 C60,52 53,30 48,9 Z"/>`,
      `<path d="M38,4 c15,-5 28,-1 35,8 -13,-2 -24,0 -32,7 Z"/>`,
    ].join(""),
    detail: circle(23, 65, 5) + circle(66, 70, 4.5),
  },

  globe: {
    body: circle(50, 50, 46),
    detail: [
      box(4, 46, 92, 8),
      box(15, 26, 70, 6),
      box(15, 68, 70, 6),
      // Meridian as an elliptical ring rather than two slivers, which just
      // looked like extra latitude lines.
      `<path fill-rule="evenodd" d="M28,50 a22,46 0 1,0 44,0 a22,46 0 1,0 -44,0 Z M37,50 a13,38 0 1,0 26,0 a13,38 0 1,0 -26,0 Z"/>`,
    ].join(""),
  },

  /** Crowned lion — the most formal of the three, for the royal-blue sides. */
  lionRampant: {
    body: [
      `<path d="M21,28 L26,5 L37,16 L50,1 L63,16 L74,5 L79,28 Z"/>`,
      box(21, 28, 58, 8, 2),
      [0, 45, 90, 135, 180, 225, 270, 315]
        .map((a) => {
          const r = (a * Math.PI) / 180;
          return circle(+(50 + 23 * Math.cos(r)).toFixed(1), +(67 + 23 * Math.sin(r)).toFixed(1), 12);
        })
        .join(""),
      circle(50, 67, 25),
    ].join(""),
    detail: `<path d="M50,45 c12,0 20,9 20,21 0,14 -9,24 -20,24 s-20,-10 -20,-24 c0,-12 8,-21 20,-21 Z"/>`,
    top: eyes(62, 9, 4.5) + `<path d="M50,70 l6,9 h-12 Z"/><path d="M39,80 c5,7 17,7 22,0 -2,10 -20,10 -22,0 Z"/>`,
  },

  /** Amphora — potteries and ceramics towns. */
  amphora: {
    body: [
      `<path d="M35,8 h30 v10 c12,9 19,23 19,39 0,20 -15,35 -34,35 S16,77 16,57 c0,-16 7,-30 19,-39 Z"/>`,
      `<path d="M17,29 C5,32 1,44 8,54 l9,-5 C13,44 14,38 20,36 Z"/>`,
      `<path d="M83,29 C95,32 99,44 92,54 l-9,-5 c4,-5 3,-11 -3,-13 Z"/>`,
      box(33, 88, 34, 9, 3),
    ].join(""),
    detail: box(23, 44, 54, 9),
  },

  /** Gabled pavilion — the little wooden stand behind a historic ground. */
  pavilion: {
    body: [`<path d="M50,5 L95,45 H84 v50 H16 V45 H5 Z"/>`, box(66, 14, 12, 21)].join(""),
    detail: `<path d="M42,95 V66 h16 v29 Z"/>` + box(24, 52, 14, 14) + box(62, 52, 14, 14),
  },

  sailboat: {
    body: [
      `<path d="M48,5 v57 H15 Z"/>`,
      `<path d="M56,23 v39 h29 Z"/>`,
      `<path d="M5,68 h90 l-14,23 H19 Z"/>`,
    ].join(""),
  },

  bat: {
    body: [
      `<path d="M50,30 c-4,0 -8,2 -10,6 -9,-14 -24,-22 -39,-22 5,8 6,16 3,23 5,-2 10,-1 15,2 -6,4 -9,9 -9,15 9,-6 19,-7 27,-2 -2,4 -3,8 -2,11 4,-5 10,-8 15,-8 s11,3 15,8 c1,-3 0,-7 -2,-11 8,-5 18,-4 27,2 0,-6 -3,-11 -9,-15 5,-3 10,-4 15,-2 -3,-7 -2,-15 3,-23 -15,0 -30,8 -39,22 -2,-4 -6,-6 -10,-6 Z"/>`,
      `<path d="M41,29 L35,9 l11,11 Z"/>`,
      `<path d="M59,29 l6,-20 -11,11 Z"/>`,
    ].join(""),
    scale: 1.12,
  },

  submarine: {
    body: [
      `<path d="M6,52 c0,-11 20,-19 44,-19 s41,8 41,19 -17,19 -41,19 S6,63 6,52 Z"/>`,
      box(41, 20, 18, 15, 3),
      box(48, 6, 5, 15),
      `<path d="M86,38 l10,-9 v46 l-10,-9 Z"/>`,
    ].join(""),
    detail: circle(30, 52, 6) + circle(50, 52, 6) + circle(70, 52, 6),
  },

  pomegranate: {
    body: [
      `<path d="M50,17 C72,17 88,35 88,57 88,78 72,93 50,93 S12,78 12,57 C12,35 28,17 50,17 Z"/>`,
      `<path d="M41,19 L34,2 l9,7 7,-9 7,9 9,-7 -7,17 Z"/>`,
    ].join(""),
    detail: circle(37, 49, 7) + circle(63, 49, 7) + circle(50, 36, 7) + circle(50, 63, 7) + circle(33, 70, 6) + circle(67, 70, 6),
  },

  crescentStar: {
    body: `<path d="M54,8 A42,42 0 1,0 54,92 A34,34 0 1,1 54,8 Z"/>` + star(78, 50, 20),
  },

  /** Plump perched songbird — canaries and their many namesakes. */
  songbird: {
    body: [
      circle(62, 30, 16),
      `<path d="M74,27 L95,33 L74,39 Z"/>`,
      `<path d="M52,38 C34,42 22,56 22,70 c0,12 10,21 24,21 15,0 27,-9 31,-22 3,-12 -2,-23 -11,-29 Z"/>`,
      `<path d="M23,66 L2,80 24,83 Z"/>`,
      box(43, 88, 5, 10),
      box(56, 88, 5, 10),
    ].join(""),
    detail: circle(66, 27, 4.5) + `<path d="M40,56 C30,60 26,70 30,79 l21,-11 Z"/>`,
  },

  /** Bird rising with upswept wings — body and fanned tail, not just a V. */
  birdFlight: {
    body: [
      `<path d="M3,58 C15,24 34,17 47,42 l3,6 3,-6 C66,17 85,24 97,58 84,34 70,37 58,62 l-8,14 -8,-14 C30,37 16,34 3,58 Z"/>`,
      `<path d="M50,38 c6,0 11,5 11,12 0,9 -5,18 -11,34 -6,-16 -11,-25 -11,-34 0,-7 5,-12 11,-12 Z"/>`,
    ].join(""),
    scale: 1.12,
  },

  goat: {
    body: [
      `<path d="M50,37 c-12,0 -20,8 -20,21 0,16 8,30 20,38 12,-8 20,-22 20,-38 0,-13 -8,-21 -20,-21 Z"/>`,
      `<path d="M36,35 C24,23 18,10 22,1 c6,10 14,19 20,25 Z"/>`,
      `<path d="M64,35 C76,23 82,10 78,1 c-6,10 -14,19 -20,25 Z"/>`,
      `<path d="M29,43 L7,36 22,54 Z"/>`,
      `<path d="M71,43 L93,36 78,54 Z"/>`,
      `<path d="M43,92 c1,7 13,7 14,0 Z"/>`,
    ].join(""),
    detail: eyes(58, 10, 5),
  },

  /** Tudor rose — English county heraldry. */
  rose: {
    body: radial(circle(50, 22, 21), 5) + circle(50, 50, 21),
    detail: radial(circle(50, 25, 9), 5) + circle(50, 50, 11),
  },

  /** Open book — the university clubs. Page lines are what sell it. */
  book: {
    body: `<path d="M50,22 C38,11 20,9 6,13 v67 c14,-4 32,-2 44,9 12,-11 30,-13 44,-9 V13 C80,9 62,11 50,22 Z"/>`,
    detail: [
      box(46, 24, 8, 66),
      box(14, 33, 26, 6),
      box(14, 46, 26, 6),
      box(14, 59, 26, 6),
      box(60, 33, 26, 6),
      box(60, 46, 26, 6),
      box(60, 59, 26, 6),
    ].join(""),
  },

  violin: {
    body: [
      // The waist has to be drawn explicitly — two stacked bouts with smooth
      // joins just come out as an oval.
      `<path d="M50,30 C36,30 26,37 26,46 c0,6 4,10 10,13 C29,63 22,68 22,76 c0,13 13,21 28,21 s28,-8 28,-21 c0,-8 -7,-13 -14,-17 6,-3 10,-7 10,-13 0,-9 -10,-16 -24,-16 Z"/>`,
      box(45, 2, 10, 32),
      `<path d="M38,1 h24 v10 c0,7 -5,12 -12,12 s-12,-5 -12,-12 Z"/>`,
    ].join(""),
    detail: circle(33, 74, 5) + circle(67, 74, 5) + box(47, 32, 6, 58),
  },

  /** Guitar — the deeper waist and round sound hole separate it from `violin`. */
  guitar: {
    body: [
      `<path d="M37,2 h26 v13 H37 Z"/>`,
      box(44, 13, 12, 26),
      `<path d="M50,34 c-14,0 -25,8 -25,18 0,7 5,13 12,16 -9,4 -15,12 -15,22 0,13 13,22 28,22 s28,-9 28,-22 c0,-10 -6,-18 -15,-22 7,-3 12,-9 12,-16 0,-10 -11,-18 -25,-18 Z"/>`,
    ].join(""),
    detail: circle(50, 68, 12),
  },

  /** Same head as `horse`, with the stripes cut through it. */
  zebra: {
    body: `<path d="M24,96 C24,72 28,54 43,40 L39,17 L52,4 L59,26 C75,30 89,38 96,53 L78,57 L76,67 L59,69 C55,79 53,87 53,96 Z"/>`,
    detail: [
      `<path d="M45,34 l24,-2 1,9 -24,2 Z"/>`,
      `<path d="M36,52 l40,-2 1,9 -40,2 Z"/>`,
      `<path d="M29,70 l32,-2 1,9 -33,2 Z"/>`,
      `<path d="M25,88 l27,-2 1,9 -28,2 Z"/>`,
    ].join(""),
  },

  /** Broad mastiff head — heavier and squarer than the wolf. */
  dog: {
    body: `<path d="M18,17 C9,17 5,26 7,36 l5,15 c-3,6 -3,14 1,20 8,12 22,18 37,18 s29,-6 37,-18 c4,-6 4,-14 1,-20 l5,-15 c2,-10 -2,-19 -11,-19 -6,0 -13,5 -17,13 -7,-4 -15,-6 -23,-6 s-16,2 -23,6 C31,22 24,17 18,17 Z"/>`,
    detail: eyes(50, 16, 6) + `<ellipse cx="50" cy="74" rx="17" ry="11"/>`,
    top: `<ellipse cx="50" cy="70" rx="7" ry="5"/>`,
  },

  /** Crux — the Southern Cross, five stars as they actually sit. */
  southernCross: {
    body: [star(52, 8, 15), star(20, 46, 13), star(84, 52, 13), star(56, 62, 17), star(40, 88, 10)].join(""),
    scale: 1.06,
  },

  /** Crossed oars — the rowing clubs that later took up football. */
  oars: {
    body: (() => {
      // Narrow blade, long shaft: fatter blades merge into a bow tie once the
      // two are crossed.
      const oar = `<path d="M50,1 c7,0 12,10 12,23 0,10 -3,17 -8,21 v51 h-8 V45 c-5,-4 -8,-11 -8,-21 C38,11 43,1 50,1 Z"/>`;
      return `<g transform="rotate(-52 50 50)">${oar}</g><g transform="rotate(52 50 50)">${oar}</g>`;
    })(),
    scale: 1.06,
  },

  seahorse: {
    body: [
      `<path d="M62,7 c-14,0 -25,10 -25,23 0,8 4,15 11,19 -11,6 -18,17 -18,29 0,15 11,25 23,25 9,0 16,-4 20,-11 l-11,-6 c-2,4 -5,6 -9,6 -6,0 -11,-6 -11,-14 0,-11 8,-19 19,-24 13,-5 21,-15 21,-27 C82,16 74,7 62,7 Z"/>`,
      `<path d="M38,19 L14,23 38,32 Z"/>`,
      `<path d="M67,5 l11,-4 -5,11 9,-2 -5,11 Z"/>`,
    ].join(""),
    detail: circle(53, 21, 4.5),
  },

  // -- Abstract marks (used by the automatic derivation) -------------------

  markX: {
    body: `<path d="M14,10 h22 l50,80 H64 Z"/><path d="M64,10 h22 L36,90 H14 Z"/>`,
  },
  markV: {
    body: `<path d="M50,12 L96,58 74,58 50,34 26,58 4,58 Z"/><path d="M50,50 L96,96 74,96 50,72 26,96 4,96 Z"/>`,
  },
  markRing: {
    body: circle(50, 50, 46),
    detail: circle(50, 50, 26),
    top: circle(50, 50, 11),
  },
  markTri: {
    body: `<path d="M50,6 L94,84 H6 Z"/>`,
    detail: `<path d="M50,34 L74,76 H26 Z"/>`,
  },
  markBars: {
    body: box(10, 16, 80, 17, 4) + box(10, 42, 80, 17, 4) + box(10, 68, 56, 17, 4),
  },
  markHex: {
    body: polygon(50, 50, 47, 6),
    detail: polygon(50, 50, 27, 6),
  },
  markArrow: {
    body: `<path d="M50,4 L92,50 H70 v44 H30 V50 H8 Z"/>`,
  },
  markPulse: {
    body: `<path d="M4,54 h20 L38,20 l16,62 12,-30 h30 v16 H76 L58,96 42,36 32,70 H4 Z"/>`,
  },
  markShield: {
    body: `<path d="M50,3 L92,17 v34 C92,74 74,90 50,97 26,90 8,74 8,51 V17 Z"/>`,
    detail: `<path d="M50,20 L76,29 v22 c0,14 -11,25 -26,30 -15,-5 -26,-16 -26,-30 V29 Z"/>`,
  },
  markSpiral: {
    body: [circle(50, 50, 46)].join(""),
    detail: `<path d="M50,12 A38,38 0 1,1 12,50 h18 A20,20 0 1,0 50,30 Z"/>`,
  },
} satisfies Record<string, Device>;

export type DeviceKey = keyof typeof DEVICE_TABLE;

/**
 * `satisfies` above keeps the key union exact; this re-widens the values so
 * callers can read `.detail` / `.scale` off any device without narrowing.
 */
export const DEVICES: Record<DeviceKey, Device> = DEVICE_TABLE;

export const DEVICE_KEYS = Object.keys(DEVICES) as DeviceKey[];

/** The abstract subset — safe to hand to a club we know nothing about. */
export const NEUTRAL_DEVICE_KEYS: DeviceKey[] = [
  "markX",
  "markV",
  "markRing",
  "markTri",
  "markBars",
  "markHex",
  "markArrow",
  "markPulse",
  "markShield",
  "markSpiral",
  "star",
  "diamond",
  "crossHeraldic",
  "compass",
  "ball",
  "bolt",
  "flame",
  "crown",
  "laurel",
  "wave",
  "mountain",
  "tower",
];
