/**
 * Generated trophy artwork, for the competitions the asset set never shipped.
 *
 * Twenty of the game's sixty-eight trophies had no art of their own and all
 * fell back to the same two placeholder files, so a German treble showed three
 * identical gold cups and a South American one showed the same salver twice.
 * Rather than draw twenty one-off files, this builds them the way `lib/crests`
 * builds badges: one silhouette family, a metal, and an accent, combined per
 * competition so the whole set reads as one collection while every piece is
 * still tellable apart on a shelf.
 *
 * Output is a data URI so it drops straight into the same `<img>` the shipped
 * PNGs use, and so the share-card exporter (which refuses external images)
 * keeps working.
 */

/** Silhouettes. Each is drawn into the same 120x210 box the real art uses. */
export type TrophyShape =
  | "cup"
  | "chalice"
  | "salver"
  | "shield"
  | "bowl"
  | "amphora";

export interface TrophySpec {
  shape: TrophyShape;
  /** Body metal. */
  metal: "gold" | "silver" | "bronze";
  /** Ribbon/plinth colour — where a competition's own identity shows. */
  accent: string;
  /** Optional one or two letters struck into the plinth. */
  mark?: string;
}

const METALS: Record<TrophySpec["metal"], { dark: string; mid: string; light: string }> = {
  // Matched to the shipped generic-cup.svg so generated pieces sit beside the
  // photographed ones without looking like a different material.
  gold: { dark: "#8C6529", mid: "#F9B54F", light: "#FFE1A0" },
  silver: { dark: "#7C858F", mid: "#D8DEE6", light: "#F5F8FC" },
  bronze: { dark: "#7A4A22", mid: "#C98A4B", light: "#EBBE8A" },
};

const VIEW_W = 120;
const VIEW_H = 210;

function gradients(id: string, metal: TrophySpec["metal"]): string {
  const m = METALS[metal];
  return [
    `<linearGradient id="${id}-b" x1="0" y1="0" x2="1" y2="0">`,
    `<stop offset="0" stop-color="${m.dark}"/>`,
    `<stop offset="0.26" stop-color="${m.mid}"/>`,
    `<stop offset="0.52" stop-color="${m.light}"/>`,
    `<stop offset="0.74" stop-color="${m.mid}"/>`,
    `<stop offset="1" stop-color="${m.dark}"/>`,
    `</linearGradient>`,
    `<linearGradient id="${id}-d" x1="0" y1="0" x2="1" y2="0">`,
    `<stop offset="0" stop-color="${m.dark}"/>`,
    `<stop offset="0.5" stop-color="${m.mid}"/>`,
    `<stop offset="1" stop-color="${m.dark}"/>`,
    `</linearGradient>`,
  ].join("");
}

/** Plinth + optional struck lettering, shared by every silhouette. */
function base(id: string, accent: string, mark?: string): string {
  return [
    `<rect x="38" y="168" width="44" height="10" rx="3" fill="url(#${id}-d)"/>`,
    `<rect x="28" y="178" width="64" height="20" rx="5" fill="${accent}"/>`,
    `<rect x="28" y="178" width="64" height="6" rx="3" fill="#ffffff" opacity="0.18"/>`,
    mark
      ? `<text x="60" y="193" text-anchor="middle" font-family="Archivo, Arial Black, sans-serif" font-size="12" font-weight="900" fill="#ffffff" opacity="0.92">${mark}</text>`
      : "",
  ].join("");
}

function body(id: string, shape: TrophyShape): string {
  const b = `url(#${id}-b)`;
  const d = `url(#${id}-d)`;
  switch (shape) {
    case "cup":
      // The classic two-handled cup.
      return [
        `<path d="M34 28h52v42c0 18-11 30-26 30S34 88 34 70z" fill="${b}"/>`,
        `<path d="M34 34H20c-9 0-13 7-13 15 0 15 12 23 25 23" fill="none" stroke="${d}" stroke-width="8" stroke-linecap="round"/>`,
        `<path d="M86 34h14c9 0 13 7 13 15 0 15-12 23-25 23" fill="none" stroke="${d}" stroke-width="8" stroke-linecap="round"/>`,
        `<rect x="52" y="100" width="16" height="34" fill="${d}"/>`,
        `<path d="M40 134h40l6 34H34z" fill="${b}"/>`,
        `<rect x="30" y="22" width="60" height="9" rx="3" fill="${d}"/>`,
      ].join("");
    case "chalice":
      // Tall and stemmed — the continental-final look.
      return [
        `<path d="M30 22h60l-8 56c-3 20-12 30-22 30S41 98 38 78z" fill="${b}"/>`,
        `<path d="M30 30H16c-8 0-11 8-8 16 4 12 15 18 26 18" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>`,
        `<path d="M90 30h14c8 0 11 8 8 16-4 12-15 18-26 18" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>`,
        `<rect x="54" y="108" width="12" height="30" fill="${d}"/>`,
        `<ellipse cx="60" cy="144" rx="30" ry="8" fill="${b}"/>`,
        `<path d="M32 144h56l-4 24H36z" fill="${d}"/>`,
      ].join("");
    case "salver":
      // A flat presentation plate: the super-cup silhouette.
      return [
        `<ellipse cx="60" cy="82" rx="50" ry="50" fill="${b}"/>`,
        `<ellipse cx="60" cy="82" rx="38" ry="38" fill="none" stroke="${d}" stroke-width="4"/>`,
        `<ellipse cx="60" cy="82" rx="24" ry="24" fill="${d}" opacity="0.55"/>`,
        `<rect x="52" y="132" width="16" height="36" fill="${d}"/>`,
      ].join("");
    case "shield":
      // Literally a shield, for the competitions that are one.
      return [
        `<path d="M60 20 106 34v52c0 30-24 48-46 56-22-8-46-26-46-56V34z" fill="${b}"/>`,
        `<path d="M60 34 92 44v42c0 22-17 35-32 41-15-6-32-19-32-41V44z" fill="none" stroke="${d}" stroke-width="4"/>`,
        `<rect x="52" y="150" width="16" height="18" fill="${d}"/>`,
      ].join("");
    case "bowl":
      // Wide and shallow, sat low on its foot.
      return [
        `<path d="M14 46h92c0 34-20 56-46 56S14 80 14 46z" fill="${b}"/>`,
        `<rect x="10" y="38" width="100" height="10" rx="5" fill="${d}"/>`,
        `<rect x="52" y="102" width="16" height="32" fill="${d}"/>`,
        `<ellipse cx="60" cy="138" rx="34" ry="9" fill="${b}"/>`,
        `<path d="M30 140h60l-4 28H34z" fill="${d}"/>`,
      ].join("");
    case "amphora":
      // Narrow-necked, tall handles — the continental super cups.
      return [
        `<path d="M46 24h28l10 26c8 20 4 42-14 52h-20c-18-10-22-32-14-52z" fill="${b}"/>`,
        `<path d="M46 36H30c-10 0-14 10-9 20 5 10 14 14 22 14" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>`,
        `<path d="M74 36h16c10 0 14 10 9 20-5 10-14 14-22 14" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/>`,
        `<rect x="52" y="102" width="16" height="32" fill="${d}"/>`,
        `<path d="M36 134h48l6 34H30z" fill="${b}"/>`,
        `<rect x="42" y="18" width="36" height="9" rx="3" fill="${d}"/>`,
      ].join("");
  }
}

export function renderTrophySvg(spec: TrophySpec): string {
  const id = "t";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" width="${VIEW_W}" height="${VIEW_H}">`,
    `<defs>${gradients(id, spec.metal)}</defs>`,
    body(id, spec.shape),
    base(id, spec.accent, spec.mark),
    `</svg>`,
  ].join("");
}

/** Percent-encoded so it drops straight into an `<img src>`. */
export function trophyDataUri(spec: TrophySpec): string {
  const svg = renderTrophySvg(spec)
    .replace(/#/g, "%23")
    .replace(/"/g, "'")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s{2,}/g, " ");
  return `data:image/svg+xml,${svg}`;
}
