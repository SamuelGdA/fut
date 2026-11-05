import type { SeasonRecord } from "@craque/engine";
import type { AwardKey } from "@craque/world";
import { showcaseItems, type ShowcaseItem } from "./showcase";

/**
 * A imagem compartilhável da carreira (D118): 1200 × 630, a proporção 1,91:1
 * que as redes usam na prévia de link. Cabe numa tela só, sem rolar.
 */
export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;

/** Os prêmios individuais que abrem os destaques, nesta ordem. */
const AWARD_ORDER: readonly AwardKey[] = ["ballonDor", "goldenGlove", "youngPlayer", "kingOfAmerica", "goldenShoe"];

/**
 * Os destaques da imagem: primeiro os prêmios individuais (Bola de Ouro,
 * Yashin, Kopa, Rei da América e Chuteira de Ouro), depois os títulos pela
 * importância. Os prêmios de competição (craque e artilheiro de um torneio)
 * ficam de fora: a imagem é curta e eles já estão na vitrine do resumo.
 */
export function shareHighlights(history: readonly SeasonRecord[]): ShowcaseItem[] {
  const items = showcaseItems(history);
  const awards = items
    .filter((item) => item.kind === "award" && !item.competition && AWARD_ORDER.includes(item.id))
    .sort((a, b) => AWARD_ORDER.indexOf(a.id as AwardKey) - AWARD_ORDER.indexOf(b.id as AwardKey));
  const titles = items.filter((item) => item.kind === "title");
  return [...awards, ...titles];
}

/**
 * Quantas peças cabem na faixa e de que tamanho: poucas peças ficam grandes,
 * muitas encolhem até o mínimo, e o resto vira "+N".
 */
export function shareShelf(count: number, width: number): { art: number; shown: number; more: number } {
  const gap = 14;
  const cell = (art: number) => Math.round(art * 0.8) + 44;
  for (const art of [96, 84, 72, 64]) {
    const fits = Math.floor((width + gap) / (cell(art) + gap));
    if (count <= fits) return { art, shown: count, more: 0 };
  }
  const fits = Math.floor((width + gap) / (cell(64) + gap));
  // Uma casa fica para o "+N".
  return { art: 64, shown: fits - 1, more: count - (fits - 1) };
}
