import { type Achievement, ACHIEVEMENT_RARITIES, achievementRarity, ACHIEVEMENTS, achievementText, type AchievementRarity } from "@craque/content";
import { COACH_ACHIEVEMENTS, coachAchievementRarity, coachAchievementText } from "@craque/content/coach";
import type { Locale } from "../../i18n/types";

/**
 * As conquistas dos dois jogos numa lista só (D112), para o perfil e a tela de
 * conquistas: grupo, raridade, alvo e os textos no idioma da tela.
 */

export type AchievementGame = "craque" | "tecnico";

export interface CatalogEntry {
  readonly id: string;
  readonly game: AchievementGame;
  readonly group: string;
  readonly rarity: AchievementRarity;
  readonly secret: boolean;
  readonly achievement: Achievement | null;
}

export const CATALOG: readonly CatalogEntry[] = [
  ...ACHIEVEMENTS.map((achievement): CatalogEntry => ({
    id: achievement.id,
    game: "craque",
    group: achievement.group,
    rarity: achievementRarity(achievement.id),
    secret: achievement.group === "secret",
    achievement,
  })),
  ...COACH_ACHIEVEMENTS.map((achievement): CatalogEntry => ({
    id: achievement.id,
    game: "tecnico",
    group: "tecnico",
    rarity: coachAchievementRarity(achievement.id),
    secret: false,
    achievement: null,
  })),
];

const BY_ID = new Map(CATALOG.map((entry) => [entry.id, entry]));

export function catalogEntry(id: string): CatalogEntry | null {
  return BY_ID.get(id) ?? null;
}

export function entryText(locale: Locale, entry: CatalogEntry): { name: string; description: string } {
  return entry.game === "tecnico" ? coachAchievementText(locale, entry.id) : achievementText(locale, entry.id);
}

/** Da lendária para a comum: a ordem da vitrine do perfil. */
export function rarityRank(rarity: AchievementRarity): number {
  return ACHIEVEMENT_RARITIES.length - ACHIEVEMENT_RARITIES.indexOf(rarity);
}
