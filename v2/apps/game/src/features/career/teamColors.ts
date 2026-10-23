import { lighten } from "@craque/art";
import { type CountryCode, getClub, getClubKit, getCountry, type KitPattern } from "@craque/world";
import { relativeLuminance } from "./clubColors";

/**
 * As cores de um time na transmissão de uma decisão de partida (D83).
 *
 * - `band`: as cores da faixa (o cachecol do clube no pé do placar, a bandeira
 *   da seleção); `kit` diz como desenhar: o padrão da camisa ou a bandeira.
 * - `glow` e `glow2`: o brilho lateral do palco. Uma cor escura demais para
 *   brilhar no fundo noturno é clareada; preto, branco e cinza viram um brilho
 *   prateado, mais discreto (`neutral`).
 */
export interface TeamColors {
  readonly kit: KitPattern | "flag";
  readonly band: readonly [string, string, string];
  /** Um detalhe no centro da bandeira (o sol de Maio, a esfera armilar). */
  readonly mark: string | null;
  readonly glow: string;
  readonly glow2: string;
  readonly neutral: boolean;
  readonly neutral2: boolean;
}

/** Brilho de preto, branco e cinza: prata fria, que não puxa para cor nenhuma. */
export const SILVER_GLOW = "#cfd8e3";

/** Branco levemente frio, para não estourar a faixa. */
const WHITE = "#f4f6fa";

interface NationColors {
  readonly band: readonly [string, string, string];
  readonly glow: readonly [string, string];
  readonly mark?: string;
  readonly kit?: KitPattern;
}

/**
 * As identidades das seleções mais vistas, conferidas à mão: a bandeira na
 * faixa e as cores da camisa no brilho. O resto deriva do uniforme dos dados.
 */
const NATIONS: Readonly<Record<CountryCode, NationColors>> = {
  ARG: { band: ["#74acdf", WHITE, "#74acdf"], mark: "#f6b40e", glow: ["#74acdf", "#f6b40e"] },
  BRA: { band: ["#009c3b", "#ffdf00", "#2f6fd6"], glow: ["#ffdf00", "#009c3b"] },
  URU: { band: ["#5cbfeb", WHITE, "#5cbfeb"], mark: "#fcd116", glow: ["#5cbfeb", "#fcd116"] },
  CHI: { band: ["#0039a6", WHITE, "#d52b1e"], glow: ["#d52b1e", "#0039a6"] },
  COL: { band: ["#fcd116", "#003893", "#ce1126"], glow: ["#fcd116", "#003893"] },
  ECU: { band: ["#ffdd00", "#034ea2", "#ed1c24"], glow: ["#ffdd00", "#034ea2"] },
  PAR: { band: ["#d52b1e", WHITE, "#0038a8"], glow: ["#d52b1e", "#0038a8"] },
  PER: { band: ["#d91023", WHITE, "#d91023"], glow: ["#d91023", WHITE] },
  BOL: { band: ["#d52b1e", "#f9e300", "#007934"], glow: ["#007934", "#f9e300"] },
  VEN: { band: ["#ffcc00", "#00247d", "#cf142b"], glow: ["#a8234a", "#efbf04"] },
  GER: { band: ["#22252b", "#dd0000", "#ffce00"], glow: ["#dd0000", "#ffce00"] },
  FRA: { band: ["#2a4bd7", WHITE, "#e1000f"], glow: ["#2a4bd7", "#e1000f"] },
  ITA: { band: ["#009246", WHITE, "#ce2b37"], glow: ["#1f6fd6", "#009246"] },
  ESP: { band: ["#c60b1e", "#ffc400", "#c60b1e"], glow: ["#c60b1e", "#ffc400"] },
  POR: { band: ["#046a38", "#da291c", "#da291c"], mark: "#ffd700", glow: ["#da291c", "#046a38"] },
  NED: { band: ["#ff7a1a", WHITE, "#21468b"], glow: ["#ff7a1a", "#21468b"] },
  ENG: { band: [WHITE, "#ce1124", WHITE], glow: [WHITE, "#ce1124"] },
  SCO: { band: ["#0065bd", WHITE, "#0065bd"], glow: ["#0065bd", WHITE] },
  WAL: { band: [WHITE, "#d21034", "#00b140"], glow: ["#d21034", "#00b140"] },
  NIR: { band: [WHITE, "#cc0000", WHITE], glow: ["#00a050", WHITE] },
  IRL: { band: ["#169b62", WHITE, "#ff883e"], glow: ["#169b62", "#ff883e"] },
  BEL: { band: ["#22252b", "#fdda24", "#ef3340"], glow: ["#ef3340", "#fdda24"] },
  CRO: { band: ["#ff0000", WHITE, "#171796"], glow: ["#ff0000", "#171796"], kit: "checkerboard" },
  SUI: { band: ["#ff0000", WHITE, "#ff0000"], glow: ["#ff0000", WHITE] },
  AUT: { band: ["#c8102e", WHITE, "#c8102e"], glow: ["#c8102e", WHITE] },
  DEN: { band: ["#c8102e", WHITE, "#c8102e"], glow: ["#c8102e", WHITE] },
  SWE: { band: ["#006aa7", "#fecc00", "#006aa7"], glow: ["#fecc00", "#006aa7"] },
  NOR: { band: ["#ba0c2f", WHITE, "#00205b"], glow: ["#ba0c2f", "#00205b"] },
  ISL: { band: ["#02529c", WHITE, "#dc1e35"], glow: ["#02529c", "#dc1e35"] },
  POL: { band: [WHITE, "#dc143c", "#dc143c"], glow: [WHITE, "#dc143c"] },
  CZE: { band: [WHITE, "#d7141a", "#11457e"], glow: ["#d7141a", "#11457e"] },
  SRB: { band: ["#c6363c", "#0c4076", WHITE], glow: ["#c6363c", "#0c4076"] },
  GRE: { band: ["#0d5eaf", WHITE, "#0d5eaf"], glow: ["#0d5eaf", WHITE] },
  TUR: { band: ["#e30a17", WHITE, "#e30a17"], glow: ["#e30a17", WHITE] },
  UKR: { band: ["#0057b7", "#0057b7", "#ffd700"], glow: ["#0057b7", "#ffd700"] },
  RUS: { band: [WHITE, "#0039a6", "#d52b1e"], glow: ["#d52b1e", "#0039a6"] },
  HUN: { band: ["#ce2939", WHITE, "#477050"], glow: ["#ce2939", "#477050"] },
  ROU: { band: ["#002b7f", "#fcd116", "#ce1126"], glow: ["#fcd116", "#002b7f"] },
  MEX: { band: ["#006847", WHITE, "#ce1126"], glow: ["#006847", "#ce1126"] },
  USA: { band: ["#0a3161", WHITE, "#b31942"], glow: ["#3c6fd6", "#b31942"] },
  CAN: { band: ["#d52b1e", WHITE, "#d52b1e"], glow: ["#d52b1e", WHITE] },
  CRC: { band: ["#002b7f", WHITE, "#ce1126"], glow: ["#ce1126", "#002b7f"] },
  PAN: { band: ["#da121a", WHITE, "#072357"], glow: ["#da121a", "#072357"] },
  JAM: { band: ["#ffcc00", "#009b3a", "#22252b"], glow: ["#ffcc00", "#009b3a"] },
  HON: { band: ["#18c3df", WHITE, "#18c3df"], glow: ["#18c3df", WHITE] },
  JPN: { band: [WHITE, "#bc002d", WHITE], glow: ["#1b3c8c", "#bc002d"] },
  KOR: { band: ["#cd2e3a", WHITE, "#0047a0"], glow: ["#cd2e3a", "#0047a0"] },
  AUS: { band: ["#ffcd00", "#00843d", "#ffcd00"], glow: ["#ffcd00", "#00843d"] },
  KSA: { band: ["#165d31", WHITE, "#165d31"], glow: ["#165d31", WHITE] },
  IRN: { band: ["#239f40", WHITE, "#da0000"], glow: ["#da0000", "#239f40"] },
  QAT: { band: ["#8d1b3d", WHITE, "#8d1b3d"], glow: ["#8d1b3d", WHITE] },
  CHN: { band: ["#ee1c25", "#ffde00", "#ee1c25"], glow: ["#ee1c25", "#ffde00"] },
  NZL: { band: [WHITE, "#22252b", WHITE], glow: [WHITE, "#22252b"] },
  SEN: { band: ["#00853f", "#fdef42", "#e31b23"], glow: ["#00853f", "#fdef42"] },
  MAR: { band: ["#c1272d", "#006233", "#c1272d"], glow: ["#c1272d", "#006233"] },
  NGA: { band: ["#008751", WHITE, "#008751"], glow: ["#008751", WHITE] },
  CMR: { band: ["#007a5e", "#ce1126", "#fcd116"], glow: ["#007a5e", "#fcd116"] },
  GHA: { band: ["#ce1126", "#fcd116", "#006b3f"], mark: "#22252b", glow: ["#fcd116", "#ce1126"] },
  EGY: { band: ["#ce1126", WHITE, "#22252b"], glow: ["#ce1126", WHITE] },
  CIV: { band: ["#f77f00", WHITE, "#009e60"], glow: ["#f77f00", "#009e60"] },
  ALG: { band: ["#006233", WHITE, "#d21034"], glow: ["#006233", "#d21034"] },
  TUN: { band: ["#e70013", WHITE, "#e70013"], glow: ["#e70013", WHITE] },
  RSA: { band: ["#007749", "#ffb81c", "#007749"], glow: ["#ffb81c", "#007749"] },
};

/** Distância máxima entre canais, de 0 a 1: perto de 0 é a mesma cor. */
function distance(a: string, b: string): number {
  const channel = (hex: string, start: number) => parseInt(hex.replace("#", "").slice(start, start + 2), 16) || 0;
  return Math.max(...[0, 2, 4].map((start) => Math.abs(channel(a, start) - channel(b, start)))) / 255;
}

/** Croma (máximo menos mínimo dos canais): baixo é preto, branco ou cinza. */
function chroma(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((start) => (parseInt(value.slice(start, start + 2), 16) || 0) / 255);
  return Math.max(...channels) - Math.min(...channels);
}

export function isNeutral(hex: string): boolean {
  return chroma(hex) < 0.18;
}

/**
 * A cor que brilha no palco. Azul-marinho, vinho e verde-garrafa somem no
 * fundo noturno: clareiam aos poucos até a luminância mínima. Preto, branco e
 * cinza viram prata.
 */
export function glowOf(hex: string): string {
  if (isNeutral(hex)) return SILVER_GLOW;
  let current = hex.toLowerCase();
  for (let step = 0; step < 10 && relativeLuminance(current) < 0.1; step += 1) current = lighten(current, 0.1);
  return current;
}

/**
 * A cor de uma faixa sobre a placa escura do cabeçalho: azul-marinho e vinho
 * clareiam até aparecer; preto vira um grafite que ainda se lê como preto.
 */
export function bandOf(hex: string): string {
  if (relativeLuminance(hex) >= 0.05) return hex.toLowerCase();
  if (isNeutral(hex)) return "#3b414b";
  let current = hex;
  for (let step = 0; step < 10 && relativeLuminance(current) < 0.06; step += 1) current = lighten(current, 0.08);
  return current;
}

function unique(colors: readonly string[]): string[] {
  return colors.reduce<string[]>((list, color) => (list.some((other) => distance(other, color) < 0.1) ? list : [...list, color.toLowerCase()]), []);
}

function fromGlows(band: readonly [string, string, string], glow: readonly [string, string], kit: TeamColors["kit"], mark: string | null): TeamColors {
  return { kit, band: [bandOf(band[0]), bandOf(band[1]), bandOf(band[2])], mark, glow: glowOf(glow[0]), glow2: glowOf(glow[1]), neutral: isNeutral(glow[0]), neutral2: isNeutral(glow[1]) };
}

/** A seleção: a identidade conferida, ou a bandeira montada com o uniforme dos dados. */
export function nationColors(code: CountryCode): TeamColors {
  const curated = NATIONS[code];
  if (curated) return fromGlows(curated.band, curated.glow, curated.kit ?? "flag", curated.mark ?? null);
  const country = getCountry(code);
  const colors = unique([country?.color, country?.kit.base, country?.kit.accent, country?.kit.third].filter((color): color is string => Boolean(color)));
  const [first = "#4b5563", second = WHITE, third = first] = colors;
  // O brilho prefere a cor mais viva do uniforme: um branco não brilha no lugar do vermelho.
  const vivid = [...colors].sort((a, b) => chroma(b) - chroma(a));
  return fromGlows([first, second, third], [vivid[0] ?? first, vivid[1] ?? second], "flag", null);
}

/**
 * O clube: a camisa curada (padrão e duas cores) para a faixa; a cor do clube
 * e a segunda cor da camisa para o brilho.
 */
export function clubColors(id: string): TeamColors {
  const kit = getClubKit(id);
  const primary = getClub(id)?.color ?? kit.base;
  const second = unique([primary, kit.base, kit.accent]).find((color) => distance(color, primary) >= 0.1) ?? kit.accent;
  return fromGlows([kit.base, kit.accent, kit.base], [primary, second], kit.pattern, null);
}

export function teamColors(id: string, national: boolean): TeamColors {
  return national ? nationColors(id) : clubColors(id);
}
