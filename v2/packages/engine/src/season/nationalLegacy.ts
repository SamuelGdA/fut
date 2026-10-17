import type { CountryCode } from "@craque/world";
import type { SeasonRecord } from "../career/types";
import { clamp } from "../math";
import { isOffensive } from "./production";

/** Memória esportiva da seleção: números, protagonismo e títulos, relativos ao país. */
export function nationalLegacy(history: readonly SeasonRecord[], nationality: CountryCode, strength: number): { level: "none" | "respected" | "idol" | "legend"; games: number; goals: number; score: number } {
  let games = 0, goals = 0, score = 0;
  for (const season of history) {
    if (season.nationality !== nationality || season.national.games === 0) continue;
    const national = season.national;
    games += national.games; goals += national.goals;
    score += national.games + (isOffensive(season.position) ? national.goals * 0.8 + national.assists * 0.6 : national.cleanSheets * 1.2 + national.assists * 0.6);
    score += national.games * clamp(season.ovrEnd - strength, 0, 25) * 0.04;
    score += national.competitions.filter(entry => entry.champion).reduce((sum, entry) => sum + (entry.competition === "worldcup" ? 45 : 22), 0);
  }
  const standard = clamp(0.65 + (strength - 60) / 40, 0.6, 1.5);
  const level = score >= 200 * standard && games >= 95 * standard ? "legend"
    : score >= 110 * standard && games >= 55 * standard ? "idol"
    : score >= 40 * standard && games >= 20 * standard ? "respected" : "none";
  return { level, games, goals, score };
}
