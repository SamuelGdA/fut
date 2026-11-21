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
  largeRectangle: { width: 336, height: 280 },
  mobileInterstitial: { width: 320, height: 480 },
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
  // D135: no celular, as abas de exploração da carreira (Histórico e Troféus)
  // rolam e ficam fora do laço: um retângulo no fim de cada uma.
  "carreira-historico": { kind: "inline", desktop: null, mobile: IAB.mediumRectangle, screens: ["career"] },
  "carreira-trofeus": { kind: "inline", desktop: null, mobile: IAB.mediumRectangle, screens: ["career"] },
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
  /**
   * D135: quanto o conteúdo pode encolher para o 160×600 caber. Sem isto, a
   * tela nunca encolhe. Notebooks e monitores Full HD do Windows com escala
   * de 125% abrem o site com 1536 px de largura: sem encolher, a carreira
   * (1280 px) não tinha trilho nenhum ali.
   */
  readonly min?: number;
}

/**
 * Telas com trilhos fixos (D134, D135). O trilho só aparece se couber inteiro
 * na margem que sobra fora do conteúdo. Login, perfil (que vira login para
 * quem não tem conta), aparência, laboratório, erro e o Técnico ficam de fora.
 * O Início do Craque e o antigo arquivo de carreiras abrem a tela de quem é
 * você (D110); o hall abre as conquistas. A criação de jogador e o Desafio não
 * encolhem: são telas de começar, com formulário.
 */
export const RAIL_SCREENS: Readonly<Partial<Record<Screen, RailPlace>>> = {
  hub: { content: 1216, min: 1104 },
  home: { content: 1312 },
  identity: { content: 1312 },
  archived: { content: 1312 },
  challenge: { content: 1312 },
  career: { content: 1280, min: 1104 },
  summary: { content: 896 },
  shared: { content: 896 },
  hall: { content: 1152, min: 1056 },
  achievements: { content: 1152, min: 1056 },
  terms: { content: 736 },
  privacy: { content: 736 },
};

/**
 * Altura ocupada acima do anúncio do trilho: a barra do topo (56), a folga
 * (16) e o rótulo "Publicidade" (18). O trilho passa por cima das faixas que
 * cruzam a tela (o cabeçalho do jogador, a barra de capítulos do resumo), na
 * margem, onde elas não têm nada: assim cabe numa janela de 1536 × 730.
 */
export const RAIL_TOP = 90;

export interface RailLayout {
  readonly format: AdSize;
  /** A largura com que o conteúdo fica: a dele, ou menor quando encolheu para o trilho caber. */
  readonly content: number;
}

/**
 * O maior trilho que cabe na tela, ou `null`. Cabe quando a margem livre de
 * cada lado comporta o anúncio mais a folga dos dois lados e a altura comporta
 * o anúncio inteiro abaixo do topo. Se não cabe nem o 160×600 e a tela aceita
 * encolher (`min`), o conteúdo perde só o necessário para ele caber.
 */
export function railLayout(viewportWidth: number, viewportHeight: number, place: RailPlace, top = RAIL_TOP): RailLayout | null {
  const fits = (format: AdSize) => viewportHeight >= top + format.height + RAIL_BOTTOM;
  const margin = (viewportWidth - place.content) / 2;
  const full = RAIL_FORMATS.find((format) => margin >= format.width + 2 * RAIL_GUTTER && fits(format));
  if (full) return { format: full, content: place.content };
  const narrow = RAIL_FORMATS[RAIL_FORMATS.length - 1]!;
  const squeezed = viewportWidth - 2 * (narrow.width + 2 * RAIL_GUTTER);
  if (place.min !== undefined && squeezed >= place.min && fits(narrow)) return { format: narrow, content: squeezed };
  return null;
}

/** A âncora do celular: só em telas de leitura, sem barra fixa embaixo e sem login (D134). */
export const ANCHOR_SIZE = IAB.mobileBanner;
export const ANCHOR_SCREENS: readonly Screen[] = ["summary", "shared", "hall", "achievements", "challenge"];

/** A âncora só entra depois que a pessoa rola isto: nunca cobre os botões do topo da tela. */
export const ANCHOR_REVEAL = 240;

/** `728×90`, como o mercado escreve. */
export function sizeLabel(size: AdSize): string {
  return `${size.width}×${size.height}`;
}

/**
 * D135: o intersticial, em tela cheia, só nas pausas naturais: o começo de
 * uma temporada nova e o fim da carreira, antes do resumo. É o formato que
 * mais rende no celular; o limite de frequência é o que o deixa aceitável.
 * No anúncio de verdade, vem da H5 Games Ads (`adBreak`), o produto do Google
 * para jogos de navegador, que já respeita o Better Ads.
 */
/** O anúncio dentro da tela cheia do intersticial: retrato no celular, retângulo grande no PC. */
export const IAB_INTERSTITIAL = { desktop: IAB.largeRectangle, mobile: IAB.mobileInterstitial } as const;

export const INTERSTITIAL_PLACES = ["temporada", "fim-carreira"] as const;
export type InterstitialPlace = (typeof INTERSTITIAL_PLACES)[number];

/** Nunca nos primeiros 2 minutos da sessão, nunca dois em menos de 3 minutos. */
export const INTERSTITIAL_FIRST_MS = 120_000;
export const INTERSTITIAL_GAP_MS = 180_000;

/** Pode mostrar agora? `since` é o tempo desde o começo da sessão; `last`, o do último (ou `null`). */
export function interstitialAllowed(since: number, last: number | null): boolean {
  if (since < INTERSTITIAL_FIRST_MS) return false;
  return last === null || since - last >= INTERSTITIAL_GAP_MS;
}
