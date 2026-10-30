import type { LegacyLevel, SeasonRecord } from "@craque/engine";

/**
 * As passagens por clube da carreira, para a linha do tempo e o pôster. Moravam
 * na biografia, que saiu do jogo na D99.
 */

export interface Stint {
  readonly club: string;
  readonly fromAge: number;
  readonly toAge: number;
  readonly fromYear: number;
  readonly toYear: number;
  readonly seasons: number;
  readonly loan: boolean;
  /** Legado no clube ao fim da passagem. */
  readonly legacy: LegacyLevel;
  readonly traitor: boolean;
  /** Força do clube na primeira temporada da passagem. */
  readonly strength: number;
}

/** Temporadas seguidas no mesmo clube viram uma passagem (GDD 24.4). */
export function stintsOf(history: readonly SeasonRecord[]): Stint[] {
  const stints: Stint[] = [];
  for (const record of history) {
    const previous = stints[stints.length - 1];
    if (previous && previous.club === record.club) {
      stints[stints.length - 1] = {
        ...previous,
        toAge: record.age,
        toYear: record.year,
        seasons: previous.seasons + 1,
        legacy: record.legacy,
        traitor: previous.traitor || record.traitor,
      };
    } else {
      stints.push({
        club: record.club,
        fromAge: record.age,
        toAge: record.age,
        fromYear: record.year,
        toYear: record.year,
        seasons: 1,
        loan: record.loan,
        legacy: record.legacy,
        traitor: record.traitor,
        strength: record.clubStrength,
      });
    }
  }
  return stints;
}
