import { careerRecords, type RecordResult, type Stint, stintsOf } from "@craque/content";
import { type Career, careerTotals, isDefender, isGoalkeeper, type LegacyLevel, peakSeason, type SeasonRecord } from "@craque/engine";
import { type AwardKey, getClub } from "@craque/world";

/**
 * O que o resumo mostra, tirado da carreira terminada (GDD 24). Funções puras:
 * a tela e o pôster leem daqui, e os testes também.
 */

export type NumberKey =
  | "seasons"
  | "games"
  | "goals"
  | "assists"
  | "cleanSheets"
  | "conceded"
  | "titles"
  | "awards"
  | "peakOvr"
  | "peakValue"
  | "nationalGames"
  | "nationalGoals"
  | "clubs"
  | "countries";

export interface SummaryNumber {
  readonly key: NumberKey;
  readonly value: number;
}

/**
 * Os números da carreira (GDD 24.3): no gol, jogos sem sofrer e gols sofridos;
 * na defesa, os dois grupos; no resto, gols e assistências.
 */
export function summaryNumbers(career: Career): SummaryNumber[] {
  const history = career.history;
  const totals = careerTotals(history);
  const position = career.player.position;
  const keeper = isGoalkeeper(position);
  const defender = isDefender(position);
  const conceded = history.reduce((total, record) => total + record.production.conceded, 0);
  const peakValue = Math.max(0, ...history.map((record) => record.marketValue));
  const countries = new Set(history.map((record) => getClub(record.club)?.country ?? record.club)).size;
  const numbers: Array<SummaryNumber | null> = [
    { key: "seasons", value: totals.seasons },
    { key: "games", value: totals.games },
    keeper ? null : { key: "goals", value: totals.goals },
    keeper ? null : { key: "assists", value: totals.assists },
    keeper || defender ? { key: "cleanSheets", value: totals.cleanSheets } : null,
    keeper ? { key: "conceded", value: conceded } : null,
    { key: "titles", value: totals.titles },
    { key: "awards", value: totals.awards },
    { key: "peakOvr", value: totals.peakOvr },
    { key: "peakValue", value: peakValue },
    { key: "nationalGames", value: totals.nationalGames },
    keeper ? null : { key: "nationalGoals", value: totals.nationalGoals },
    { key: "clubs", value: totals.clubs },
    { key: "countries", value: countries },
  ];
  return numbers.filter((item): item is SummaryNumber => item !== null);
}

/** Os seis números do pôster (GDD 29.1), os que mais dizem sobre a posição. */
export function posterNumbers(career: Career): SummaryNumber[] {
  const keeper = isGoalkeeper(career.player.position);
  const all = new Map(summaryNumbers(career).map((item) => [item.key, item]));
  const wanted: NumberKey[] = keeper
    ? ["games", "cleanSheets", "titles", "awards", "nationalGames", "seasons"]
    : ["games", "goals", "assists", "titles", "awards", "nationalGames"];
  return wanted.flatMap((key) => {
    const item = all.get(key);
    return item ? [item] : [];
  });
}

/** A curva do OVR temporada a temporada, para o gráfico do resumo e do pôster. */
export function ovrCurve(history: readonly SeasonRecord[]): Array<{ year: number; age: number; ovr: number }> {
  return history.map((record) => ({ year: record.year, age: record.age, ovr: record.ovrEnd }));
}

export type TimelineHonour =
  | { readonly kind: "title"; readonly id: string; readonly year: number }
  | { readonly kind: "award"; readonly id: AwardKey; readonly year: number };

export type TimelineItem =
  | {
      readonly kind: "stint";
      readonly stint: Stint;
      /** Legado no clube na carreira inteira (GDD 24.4), não só nesta passagem. */
      readonly legacy: LegacyLevel;
      readonly traitor: boolean;
      readonly honours: readonly TimelineHonour[];
    }
  | { readonly kind: "debut"; readonly age: number; readonly year: number };

/** Até 8 honras por passagem; o resto vira "+N" (GDD 24.4). */
export const TIMELINE_HONOURS = 8;

/** Passagens por clube e a estreia na seleção, na ordem da idade (GDD 24.4). */
export function timeline(career: Career): TimelineItem[] {
  const history = career.history;
  const clubLegacy = new Map<string, LegacyLevel>();
  for (const record of history) clubLegacy.set(record.club, record.legacy);
  const items: TimelineItem[] = stintsOf(history).map((stint) => {
    const seasons = history.filter((record) => record.club === stint.club && record.age >= stint.fromAge && record.age <= stint.toAge);
    const honours: TimelineHonour[] = seasons.flatMap((record) => [
      ...record.titles.map((id): TimelineHonour => ({ kind: "title", id, year: record.year })),
      ...record.awards.won.map((id): TimelineHonour => ({ kind: "award", id, year: record.year })),
    ]);
    return {
      kind: "stint",
      stint,
      legacy: clubLegacy.get(stint.club) ?? "none",
      traitor: career.bonds[stint.club]?.traitor ?? false,
      honours,
    };
  });
  if (career.firstCapAge !== null) {
    const debutYear = history.find((record) => record.age === career.firstCapAge)?.year ?? null;
    if (debutYear !== null) {
      const at = items.findIndex((item) => item.kind === "stint" && item.stint.fromAge > (career.firstCapAge ?? 0));
      const debut: TimelineItem = { kind: "debut", age: career.firstCapAge, year: debutYear };
      if (at === -1) items.push(debut);
      else items.splice(at, 0, debut);
    }
  }
  return items;
}

/** A carta do auge (GDD 24.2): a temporada de maior OVR, com clube e número daquela temporada. */
export function peakCard(career: Career): SeasonRecord | null {
  return peakSeason(career.history);
}

/**
 * Os recordes reais que a carreira passou ou igualou (GDD 26), do mais
 * importante ao menos. Sem nenhum, o resumo não mostra a seção (D43): recorde
 * "a caminho" não é recorde.
 */
export function summaryRecords(history: readonly SeasonRecord[]): RecordResult[] {
  return careerRecords(history).filter((result) => result.status !== "short");
}
