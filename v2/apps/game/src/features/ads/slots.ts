import type { Screen } from "../../app/navigation";

/**
 * O registro central dos espaços de anúncio (D134, estudo em
 * `docs/analise-monetizacao.md`). Cada espaço tem um ID, um tipo, o tamanho
 * IAB exato no PC e no celular (ou `null` quando não aparece ali) e as telas em
 * que mora. Ligar, desligar ou mudar um espaço é mudar uma linha aqui.
 *
 * Por enquanto é só a PRÉVIA: nenhum espaço chama rede de anúncio. O tamanho
 * reservado é o do anúncio de verdade, então trocar a moldura pelo anúncio,
 * na fase de integração, não mexe no layout (CLS 0).
 */

export interface AdSize {
  readonly width: number;
  readonly height: number;
}

/** Os formatos IAB usados no jogo. */
export const IAB = {
  leaderboard: { width: 728, height: 90 },
  mediumRectangle: { width: 300, height: 250 },
  skyscraper: { width: 160, height: 600 },
  halfPage: { width: 300, height: 600 },
  mobileBanner: { width: 320, height: 50 },
  largeMobileBanner: { width: 320, height: 100 },
} as const satisfies Record<string, AdSize>;

/** Abaixo desta largura vale o tamanho do celular; daqui para cima, o do PC. */
export const AD_DESKTOP_MIN = 768;

/** No conteúdo (entre blocos) ou dentro do intervalo do sorteio (recompensado). */
export type InlineKind = "inline" | "reward";

export interface InlineSlot {
  readonly kind: InlineKind;
  readonly desktop: AdSize | null;
  readonly mobile: AdSize | null;
  readonly screens: readonly Screen[];
}

export const AD_SLOTS = {
  "hub-rodape": { kind: "inline", desktop: IAB.leaderboard, mobile: IAB.largeMobileBanner, screens: ["hub"] },
  "resumo-numeros": { kind: "inline", desktop: IAB.leaderboard, mobile: IAB.mediumRectangle, screens: ["summary", "shared"] },
  "resumo-jornal": { kind: "inline", desktop: IAB.leaderboard, mobile: IAB.mediumRectangle, screens: ["summary", "shared"] },
  "desafio-ranking": { kind: "inline", desktop: IAB.mediumRectangle, mobile: IAB.mediumRectangle, screens: ["challenge"] },
  "conquistas-rodape": { kind: "inline", desktop: IAB.leaderboard, mobile: IAB.mediumRectangle, screens: ["achievements", "hall"] },
  "perfil-rodape": { kind: "inline", desktop: IAB.leaderboard, mobile: IAB.mediumRectangle, screens: ["profile"] },
  "sorteio-recompensado": { kind: "reward", desktop: IAB.mediumRectangle, mobile: IAB.mediumRectangle, screens: ["career"] },
} as const satisfies Record<string, InlineSlot>;

export type AdSlotId = keyof typeof AD_SLOTS;

/** Os dois arranha-céus de cada lado. */
export type RailSide = "left" | "right";

/** Formatos do trilho, do maior (rende mais) para o menor. */
export const RAIL_FORMATS: readonly AdSize[] = [IAB.halfPage, IAB.skyscraper];

/** Folga mínima de cada lado do trilho (cobre a barra de rolagem). */
export const RAIL_GUTTER = 24;

/** Espaço livre embaixo do trilho, para ele não encostar no pé da tela. */
export const RAIL_BOTTOM = 16;

export interface RailPlace {
  /** Largura do conteúdo mais largo da tela, medida no PC: o trilho mora fora dela. */
  readonly content: number;
  /** Barra fixa abaixo do topo (a dos capítulos do resumo): o trilho começa embaixo dela. */
  readonly below?: number;
}

/**
 * Telas com trilhos fixos (D134). O trilho só aparece se couber inteiro na
 * margem que sobra fora do conteúdo. Login, perfil (que vira login para quem
 * não tem conta), aparência, laboratório, erro e o Técnico ficam de fora.
 * O Início do Craque e o antigo arquivo de carreiras abrem a tela de quem é
 * você (D110); o hall abre as conquistas.
 */
export const RAIL_SCREENS: Readonly<Partial<Record<Screen, RailPlace>>> = {
  hub: { content: 1216 },
  home: { content: 1312 },
  identity: { content: 1312 },
  archived: { content: 1312 },
  challenge: { content: 1312 },
  summary: { content: 896, below: 56 },
  shared: { content: 896, below: 56 },
  hall: { content: 1152 },
  achievements: { content: 1152 },
  terms: { content: 736 },
  privacy: { content: 736 },
};

/** As três colunas da carreira (D118): os trilhos dela moram fora delas, abaixo do cabeçalho. */
export const CAREER_CONTENT = 1280;

/**
 * Altura ocupada acima do anúncio do trilho: a barra do topo (56), a folga
 * (16) e o rótulo "Publicidade" (18); na carreira, também o cabeçalho do
 * jogador (82).
 */
export const RAIL_TOP = { page: 90, career: 172 } as const;

/**
 * O maior trilho que cabe na tela, ou `null`. Cabe quando a margem livre de
 * cada lado comporta o anúncio mais a folga dos dois lados e a altura comporta
 * o anúncio inteiro abaixo do topo.
 */
export function railFormat(viewportWidth: number, viewportHeight: number, contentWidth: number, top: number): AdSize | null {
  const margin = (viewportWidth - contentWidth) / 2;
  return RAIL_FORMATS.find((format) => margin >= format.width + 2 * RAIL_GUTTER && viewportHeight >= top + format.height + RAIL_BOTTOM) ?? null;
}

/** A âncora do celular: só em telas de leitura, sem barra fixa embaixo e sem login (D134). */
export const ANCHOR_SIZE = IAB.mobileBanner;
export const ANCHOR_SCREENS: readonly Screen[] = ["summary", "shared", "hall", "achievements"];

/** A âncora só entra depois que a pessoa rola isto: nunca cobre os botões do topo da tela. */
export const ANCHOR_REVEAL = 240;

/** `728×90`, como o mercado escreve. */
export function sizeLabel(size: AdSize): string {
  return `${size.width}×${size.height}`;
}
