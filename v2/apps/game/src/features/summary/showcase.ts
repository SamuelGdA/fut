import { honours, type SeasonRecord } from "@craque/engine";
import type { AwardKey } from "@craque/world";

/**
 * A vitrine (GDD 24.5): troféus e prêmios agrupados por competição com ×N, numa
 * grade que escolhe o maior tamanho em que a coleção inteira cabe. As legendas
 * saem antes de as peças encolherem demais.
 */

export type ShowcaseItem =
  | { readonly kind: "title"; readonly id: string; readonly count: number; readonly years: readonly number[] }
  | { readonly kind: "award"; readonly id: AwardKey; readonly count: number; readonly years: readonly number[] };

/** Títulos primeiro, os mais repetidos na frente (como o motor agrupa), depois os prêmios. */
export function showcaseItems(history: readonly SeasonRecord[]): ShowcaseItem[] {
  const grouped = honours(history);
  const yearsOf = (matches: (record: SeasonRecord) => boolean) =>
    history.filter(matches).map((record) => record.year);
  return [
    ...grouped.titles.map(
      (honour): ShowcaseItem => ({
        kind: "title",
        id: honour.id,
        count: honour.count,
        years: yearsOf((record) => record.titles.includes(honour.id)),
      }),
    ),
    ...grouped.awards.map(
      (honour): ShowcaseItem => ({
        kind: "award",
        id: honour.id,
        count: honour.count,
        years: yearsOf((record) => record.awards.won.includes(honour.id)),
      }),
    ),
  ];
}

export interface ShowcaseLayout {
  /** Altura da arte do troféu, em px. */
  readonly art: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly labels: boolean;
  readonly columns: number;
  readonly rows: number;
  /** A coleção inteira coube na altura pedida. */
  readonly fits: boolean;
}

/** Tamanhos com legenda, do maior para o menor; abaixo do último, a legenda sai. */
const LABELED = [112, 96, 84, 72, 64] as const;
const BARE = [56, 48, 40, 34] as const;
const SMALLEST = 34;
export const SHOWCASE_GAP = 10;
/** Duas linhas de legenda, mais o espaço do ×N. */
const LABEL_HEIGHT = 34;

function measure(count: number, width: number, maxHeight: number, art: number, labels: boolean): ShowcaseLayout {
  const cellWidth = labels ? Math.max(Math.round(art * 0.8) + 28, 96) : Math.round(art * 0.8) + 18;
  const cellHeight = art + (labels ? LABEL_HEIGHT + 20 : 26);
  const columns = Math.max(1, Math.floor((width + SHOWCASE_GAP) / (cellWidth + SHOWCASE_GAP)));
  const rows = Math.ceil(count / columns);
  const height = rows * cellHeight + Math.max(0, rows - 1) * SHOWCASE_GAP;
  return { art, cellWidth, cellHeight, labels, columns, rows, fits: height <= maxHeight };
}

/**
 * O maior tamanho em que `count` peças cabem em `width` × `maxHeight`. Se nem
 * o menor cabe, devolve o menor mesmo (a vitrine rola), com `fits` falso.
 */
export function showcaseLayout(count: number, width: number, maxHeight: number, maxArt: number = LABELED[0]): ShowcaseLayout {
  const usable = Math.max(width, 120);
  for (const art of LABELED.filter((size) => size <= maxArt)) {
    const layout = measure(count, usable, maxHeight, art, true);
    if (layout.fits) return layout;
  }
  for (const art of BARE) {
    const layout = measure(count, usable, maxHeight, art, false);
    if (layout.fits) return layout;
  }
  return measure(count, usable, maxHeight, SMALLEST, false);
}
