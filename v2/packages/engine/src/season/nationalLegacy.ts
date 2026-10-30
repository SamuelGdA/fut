import { type CountryCode, WORLD_CUP_TITLES } from "@craque/world";
import type { SeasonRecord } from "../career/types";
import { clamp } from "../math";
import { isOffensive } from "./production";

/** A tradição da seleção decide o título que faz uma lenda (D106). */
export type NationalTradition = "worldCup" | "continental" | "numbers";

/** Força a partir da qual uma seleção sem Copa cobra ao menos o título continental (D106). */
export const CONTINENTAL_DEMAND_FROM = 82;

/** D108: quanto um título da Liga das Nações vale no legado, em relação ao continental. */
export const NATIONS_LEAGUE_SHARE = 0.4;

/**
 * D106: campeã do mundo cobra a Copa (Brasil, Alemanha, Argentina...); a forte
 * que nunca ganhou cobra a Copa ou o continental (Portugal, Holanda,
 * Bélgica); as outras fazem lenda com números e protagonismo.
 */
export function nationalTradition(nationality: CountryCode, strength: number): NationalTradition {
  if ((WORLD_CUP_TITLES[nationality] ?? 0) > 0) return "worldCup";
  return strength >= CONTINENTAL_DEMAND_FROM ? "continental" : "numbers";
}

/** Memória esportiva da seleção: números, protagonismo e títulos, relativos ao país. */
export function nationalLegacy(history: readonly SeasonRecord[], nationality: CountryCode, strength: number): { level: "none" | "respected" | "idol" | "legend"; games: number; goals: number; assists: number; cleanSheets: number; score: number; tradition: NationalTradition; worldCup: boolean; continental: boolean; capped: boolean } {
  let games = 0, goals = 0, assists = 0, cleanSheets = 0, score = 0;
  let worldCup = false, continental = false;
  // D106: numa seleção menor, o título continental (Copa Ouro, Copa da Ásia)
  // pesa mais na memória do país do que a Eurocopa pesa para a Espanha.
  const continentalWeight = 22 * clamp(1 + (CONTINENTAL_DEMAND_FROM - strength) / 20, 1, 1.6);
  for (const season of history) {
    if (season.nationality !== nationality || season.national.games === 0) continue;
    const national = season.national;
    games += national.games; goals += national.goals; assists += national.assists; cleanSheets += national.cleanSheets;
    score += national.games + (isOffensive(season.position) ? national.goals * 0.8 + national.assists * 0.6 : national.cleanSheets * 1.2 + national.assists * 0.6);
    score += national.games * clamp(season.ovrEnd - strength, 0, 25) * 0.04;
    for (const entry of national.competitions) {
      if (!entry.champion) continue;
      // D108: a Liga das Nações soma 40% do continental e não vale como o título que o país cobra.
      if (entry.kind === "worldCup") { worldCup = true; score += 45; } else if (entry.kind === "nationsLeague") score += NATIONS_LEAGUE_SHARE * continentalWeight; else { if (entry.kind === "nationsCup") continental = true; score += continentalWeight; }
    }
  }
  const standard = clamp(0.65 + (strength - 60) / 40, 0.6, 1.5);
  const tradition = nationalTradition(nationality, strength);
  // A lenda pelos números ainda precisa do título que o país cobra; sem ele, fica em ídolo.
  const crowned = tradition === "worldCup" ? worldCup : tradition === "continental" ? worldCup || continental : true;
  const byNumbers = score >= 200 * standard && games >= 95 * standard ? "legend"
    : score >= 110 * standard && games >= 55 * standard ? "idol"
    : score >= 40 * standard && games >= 20 * standard ? "respected" : "none";
  const level = byNumbers === "legend" && !crowned ? "idol" : byNumbers;
  return { level, games, goals, assists, cleanSheets, score, tradition, worldCup, continental, capped: byNumbers === "legend" && !crowned };
}
