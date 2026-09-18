/**
 * Which generated trophy each competition gets.
 *
 * Only competitions whose shipped artwork is missing appear here — anything
 * with a real photograph keeps it. The pairings are not arbitrary: a
 * competition that *is* a shield gets the shield, the domestic super cups get
 * the salver their real trophies mostly are, and the continental super cups
 * get the amphora so they never read as a domestic one. Colours come from the
 * competition's own identity, which is what keeps thirteen super cups apart.
 *
 * Keys are namespaced because the source tables collide: the English super cup
 * and the English league cup are both filed under "ENG".
 */

import { trophyDataUri, type TrophySpec } from "./render";

const spec = (
  shape: TrophySpec["shape"],
  metal: TrophySpec["metal"],
  accent: string,
  mark?: string,
): TrophySpec => ({ shape, metal, accent, mark });

/** `super:<FIFA>` · `leaguecup:<FIFA>` · `cup:<id>` · `cont:<CONF>:<key>` · `league:<id>` */
export const TROPHY_ART: Record<string, TrophySpec> = {
  // --- Domestic super cups ---
  // The Community Shield is a shield, so it gets one.
  "super:ENG": spec("shield", "silver", "#1d3f8f", "FA"),
  "super:ESP": spec("salver", "gold", "#c60b1e", "ES"),
  "super:ITA": spec("salver", "silver", "#0b7a3b", "IT"),
  "super:GER": spec("salver", "silver", "#12161c", "DE"),
  "super:FRA": spec("salver", "gold", "#0b2d7a", "FR"),
  "super:BRA": spec("salver", "gold", "#0f9d55", "BR"),
  "super:ARG": spec("salver", "silver", "#6cace4", "AR"),
  "super:MEX": spec("salver", "gold", "#0b6b3a", "MX"),
  "super:CHI": spec("salver", "silver", "#c8102e", "CL"),
  "super:COL": spec("salver", "gold", "#f5c400", "CO"),
  "super:ECU": spec("salver", "gold", "#f5c400", "EC"),
  "super:URU": spec("salver", "silver", "#6cace4", "UY"),
  "super:PAR": spec("salver", "silver", "#c8102e", "PY"),

  // --- League cups ---
  "leaguecup:ENG": spec("cup", "silver", "#1d3f8f", "EFL"),

  // --- Domestic cups with no shipped art ---
  "cup:bol-copa-bolivia": spec("cup", "silver", "#0b7a3b", "BOL"),
  "cup:per-copa-bicentenario": spec("cup", "gold", "#c8102e", "PER"),

  // --- One-off intercontinental title ---
  // Amphora, like the continental super cups: one match between champions.
  "cup:intercontinental": spec("amphora", "gold", "#7a1f2b", "IC"),

  // --- Continental ---
  "cont:UEFA:continental_tertiary": spec("chalice", "silver", "#0b8f6a", "UECL"),
  "cont:UEFA:continental_super_cup": spec("amphora", "silver", "#0b2d7a", "UEFA"),
  "cont:CONMEBOL:continental_super_cup": spec("amphora", "gold", "#0b6b8f", "CSF"),

  // --- Leagues with no shipped art ---
  "league:liga-bolivia": spec("bowl", "gold", "#0b7a3b", "BOL"),
  // The eight CONMEBOL second divisions. Silver rather than gold: a second
  // tier should read as the quieter metal beside its own top flight.
  "league:copa-simon-bolivar": spec("bowl", "silver", "#007934", "CSB"),
  "league:primera-b": spec("bowl", "silver", "#D52B1E", "PB"),
  "league:torneo-dimayor": spec("bowl", "silver", "#FFE800", "TD"),
  "league:ligapro-serie-b": spec("bowl", "silver", "#DA0010", "SB"),
  "league:division-intermedia": spec("bowl", "silver", "#D52B1E", "DI"),
  "league:liga2": spec("bowl", "silver", "#D91023", "L2"),
  "league:segunda-division-uruguaya": spec("bowl", "silver", "#0057B8", "SD"),
  "league:liga-futve-2": spec("bowl", "silver", "#C32148", "FV2"),
};

/** Shape used when a competition has no curated entry of its own. */
const FALLBACK: Record<string, TrophySpec> = {
  league: spec("bowl", "gold", "#8a6a1f"),
  cup: spec("cup", "silver", "#3a4657"),
  super_cup: spec("salver", "silver", "#3a4657"),
  continental: spec("chalice", "silver", "#1d3f8f"),
};

export type TrophyArtCategory = keyof typeof FALLBACK;

/** Art for a competition that has none of its own. Always returns something. */
export function generatedTrophyUrl(
  artKey: string | null | undefined,
  category: TrophyArtCategory = "cup",
): string {
  const curated = artKey ? TROPHY_ART[artKey] : undefined;
  return trophyDataUri(curated ?? FALLBACK[category] ?? FALLBACK.cup!);
}

/** True when a url is absent or one of the shared placeholder files. */
export function isPlaceholderArt(url: string | undefined | null): boolean {
  return !url || /\/generic-(cup|super-cup|league)\.svg$/.test(url);
}

export { renderTrophySvg, trophyDataUri } from "./render";
export type { TrophySpec, TrophyShape } from "./render";
