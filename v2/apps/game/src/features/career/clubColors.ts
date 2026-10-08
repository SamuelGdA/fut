import { contrastInk, darken, lighten } from "@craque/art";
import { getClub, getCountry } from "@craque/world";
import type { CSSProperties } from "react";

/**
 * A cor do clube como acento da tela (GDD 32.2, token `club`).
 *
 * - `--club-solid` e `--on-club-solid`: a cor de verdade, para blocos chapados
 *   (faixa da carta, placar do cabeçalho), com tinta que contrasta.
 * - `--club` e `--on-club`: o acento para filetes, abas, bordas e texto. Uma
 *   cor de clube que some no fundo escuro (azul-marinho, preto) é clareada até
 *   aparecer; no tema claro, escurecida. A régua é o contraste da WCAG (GDD
 *   36): 4,5:1 contra o fundo mais próximo da cor em cada tema, com folga para
 *   o fundo tingido dos chips.
 */

const NEUTRAL = "#3fb26a";

/**
 * Os fundos de referência: a superfície mais clara do tema escuro e a mais
 * escura do tema claro (a cor das linhas). Ler sobre elas é ler sobre todas.
 */
export const DARK_REFERENCE = "#2b3631";
export const LIGHT_REFERENCE = "#dad4c7";
/** Contraste mínimo do acento, um pouco acima de 4,5 por causa do chip tingido. */
export const ACCENT_CONTRAST = 4.8;

/** Luminância relativa da WCAG, de 0 a 1. */
export function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (start: number) => {
    const c = (parseInt(value.slice(start, start + 2), 16) || 0) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Contraste da WCAG entre duas cores, de 1 a 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** Clareia (tema escuro) ou escurece (tema claro) aos poucos até o acento ter contraste contra o fundo. */
function readable(color: string, background: string, move: (hex: string, amount: number) => string): string {
  let current = color;
  for (let step = 0; step < 24 && contrastRatio(current, background) < ACCENT_CONTRAST; step += 1) current = move(current, 0.08);
  return current;
}

/** Luminância percebida, só para escolher o lado da faixa da carta. */
function perceived(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (start: number) => parseInt(value.slice(start, start + 2), 16) || 0;
  return (0.299 * channel(0) + 0.587 * channel(2) + 0.114 * channel(4)) / 255;
}

export interface ClubPalette {
  readonly solid: string;
  readonly onSolid: string;
  /**
   * Fundo da faixa da carta: um tom vizinho da cor, para a camisa do retrato
   * (que é a própria cor do clube) não sumir no fundo.
   */
  readonly band: string;
  readonly darkAccent: string;
  readonly lightAccent: string;
}

const cache = new Map<string, ClubPalette>();

export function colorPalette(color: string): ClubPalette {
  const cached = cache.get(color);
  if (cached) return cached;
  const band = perceived(color) < 0.22 ? lighten(color, 0.22) : darken(color, 0.32);
  const palette: ClubPalette = {
    solid: color,
    onSolid: contrastInk(color),
    band,
    darkAccent: readable(color, DARK_REFERENCE, lighten),
    lightAccent: readable(color, LIGHT_REFERENCE, darken),
  };
  cache.set(color, palette);
  return palette;
}

export function clubPalette(clubId: string | null | undefined): ClubPalette {
  return colorPalette(getClub(clubId)?.color ?? NEUTRAL);
}

function styleOf(palette: ClubPalette): CSSProperties {
  return {
    "--club-solid": palette.solid,
    "--on-club-solid": palette.onSolid,
    "--club-band": palette.band,
    "--on-club-band": contrastInk(palette.band),
    "--club-dark": palette.darkAccent,
    "--club-light": palette.lightAccent,
    "--on-club-dark": contrastInk(palette.darkAccent),
    "--on-club-light": contrastInk(palette.lightAccent),
  } as CSSProperties;
}

/** Variáveis CSS do clube para pendurar num contêiner (`.club-scope` escolhe o acento pelo tema). */
export function clubStyle(clubId: string | null | undefined): CSSProperties {
  return styleOf(clubPalette(clubId));
}

/** Sem clube, a carta usa a cor da seleção do jogador. */
export function nationStyle(code: string | null | undefined): CSSProperties {
  return styleOf(colorPalette(getCountry(code)?.color ?? NEUTRAL));
}
