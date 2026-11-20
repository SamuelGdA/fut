import type { LegacyLevel, SeasonRecord } from "@craque/engine";
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

/** Linhas de destaques na imagem (D128): o resto vira "+N" no fim da segunda. */
export const SHARE_SHELF_ROWS = 2;

/**
 * Quantas peças cabem na faixa e de que tamanho, em até duas linhas (D128):
 * poucas peças ficam grandes, muitas encolhem até o mínimo, e o que não cabe
 * nas duas linhas vira "+N", na última casa.
 */
export function shareShelf(count: number, width: number, rows: number = SHARE_SHELF_ROWS): { art: number; shown: number; more: number; perRow: number } {
  const gap = 14;
  const cell = (art: number) => Math.round(art * 0.8) + 44;
  const perRow = (art: number) => Math.max(1, Math.floor((width + gap) / (cell(art) + gap)));
  // Duas linhas de peça e legenda (até duas linhas de texto) cabem entre os
  // números e o rodapé só até 56 px de arte, com folga para o nome mais
  // comprido; acima disso, a legenda da segunda linha invadia o rodapé.
  for (const art of [56, 50, 46]) {
    if (count <= perRow(art) * rows) return { art, shown: count, more: 0, perRow: perRow(art) };
  }
  const fits = perRow(46) * rows;
  // Uma casa fica para o "+N".
  return { art: 46, shown: fits - 1, more: count - (fits - 1), perRow: perRow(46) };
}

/** Quantos clubes a imagem mostra no rodapé (D128). */
export const SHARE_CLUBS = 5;

const LEGACY_RANK: Readonly<Record<LegacyLevel, number>> = { none: 0, respected: 1, idol: 2, legend: 3 };

interface ClubSummary {
  readonly club: string;
  readonly legacy: LegacyLevel;
  readonly traitor: boolean;
  readonly games: number;
  readonly titles: number;
  readonly from: number;
}

/**
 * Os clubes do rodapé da imagem (D128). O da carta do auge fica de fora: ele
 * já está em destaque. Entram os clubes em que o jogador deixou legado
 * (respeitado, ídolo ou lenda), do maior legado para o menor e, no empate,
 * por títulos e depois jogos ali; nunca um clube que ele traiu. O clube em que
 * a carreira começou de verdade (o primeiro com jogos, sem traição) entra
 * sempre, no fim, mesmo sem legado. Com espaço sobrando, entram os de mais
 * jogos.
 */
export function shareClubs(history: readonly SeasonRecord[], exclude: string | null, limit: number = SHARE_CLUBS): string[] {
  const byClub = new Map<string, ClubSummary>();
  for (const record of history) {
    if (record.loan && record.clubGames === 0) continue;
    const current = byClub.get(record.club);
    byClub.set(record.club, {
      club: record.club,
      // O legado que vale é o do fim da última passagem pelo clube.
      legacy: record.legacy,
      traitor: (current?.traitor ?? false) || record.traitor,
      games: (current?.games ?? 0) + record.clubGames,
      titles: (current?.titles ?? 0) + record.titles.length,
      from: current?.from ?? record.year,
    });
  }
  const clubs = [...byClub.values()].filter((club) => club.club !== exclude && !club.traitor);
  const base = clubs.filter((club) => club.games > 0).sort((a, b) => a.from - b.from)[0] ?? null;
  const ranked = clubs
    .filter((club) => LEGACY_RANK[club.legacy] > 0)
    .sort((a, b) => LEGACY_RANK[b.legacy] - LEGACY_RANK[a.legacy] || b.titles - a.titles || b.games - a.games || a.from - b.from);
  const chosen = ranked.slice(0, base && !ranked.slice(0, limit).includes(base) ? limit - 1 : limit);
  if (base && !chosen.includes(base)) chosen.push(base);
  for (const club of [...clubs].sort((a, b) => b.games - a.games || a.from - b.from)) {
    if (chosen.length >= limit) break;
    if (!chosen.includes(club) && club.games > 0) chosen.splice(base && chosen.includes(base) ? chosen.indexOf(base) : chosen.length, 0, club);
  }
  return chosen.map((club) => club.club);
}
