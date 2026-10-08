import type { SeasonRecord } from "@craque/engine";
import { getCompetition } from "@craque/world";
import { interpolate, type Locale } from "./i18n";
import { recordsEn } from "./locales/records.en";
import { recordsEs } from "./locales/records.es";
import { type RecordsMessages, recordsPt } from "./locales/records.pt";

/**
 * Recordes reais (GDD 26): marcas documentadas do futebol de verdade, com
 * valor, detentor e detalhe, comparadas com a carreira (igualado ou
 * superado). Os detentores em atividade têm a data da conferência em `asOf`;
 * as marcas fechadas não mudam mais.
 *
 * Ficaram de fora as marcas sem uma fonte de consenso na conferência
 * (2026-09): assistências, jogos sem sofrer gol de goleiro, Liga Europa,
 * Sul-Americana e as ligas da França e do Brasil (D24).
 */

export const RECORDS_CHECKED = "2026-09";

export type RecordGroup = "global" | "continental" | "league" | "streak";

export const RECORD_IDS = [
  "careerGoals",
  "ballonDor",
  "worldCups",
  "seasonGoals",
  "careerTitles",
  "goldenShoes",
  "internationalGoals",
  "caps",
  "careerGames",
  "championsLeague",
  "libertadores",
  "leagueEngland",
  "leagueSpain",
  "leagueItaly",
  "leagueGermany",
  "ballonStreak",
  "leagueStreak",
  "primaryStreak",
] as const;

export type RecordId = (typeof RECORD_IDS)[number];

export interface RealRecord {
  readonly id: RecordId;
  readonly group: RecordGroup;
  /** A marca real. */
  readonly value: number;
  /** Mês da conferência, para quem ainda está jogando e pode aumentar a marca. */
  readonly asOf: string | null;
  /** Como a carreira é medida: soma, melhor temporada ou maior sequência. */
  readonly measure: "sum" | "best" | "streak";
  /** O que cada temporada soma (ou vale, ou conta para a sequência). */
  readonly season: (record: SeasonRecord) => number;
}

const kindOf = (id: string) => getCompetition(id)?.kind ?? null;
const countryOf = (id: string) => getCompetition(id)?.country ?? null;
const BIG_FIVE = new Set(["ENG", "ESP", "ITA", "GER", "FRA"]);
const count = (record: SeasonRecord, matches: (id: string) => boolean) => record.titles.filter(matches).length;
const leagueIn = (country: string) => (record: SeasonRecord) =>
  count(record, (id) => kindOf(id) === "league" && countryOf(id) === country);

export const REAL_RECORDS: readonly RealRecord[] = [
  { id: "careerGoals", group: "global", value: 979, asOf: "2026-09", measure: "sum", season: (r) => r.production.goals + r.national.goals },
  { id: "ballonDor", group: "global", value: 8, asOf: null, measure: "sum", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0) },
  { id: "worldCups", group: "global", value: 3, asOf: null, measure: "sum", season: (r) => count(r, (id) => kindOf(id) === "worldCup") },
  { id: "seasonGoals", group: "global", value: 73, asOf: null, measure: "best", season: (r) => r.production.goals },
  { id: "careerTitles", group: "global", value: 46, asOf: "2026-09", measure: "sum", season: (r) => r.titles.length },
  { id: "goldenShoes", group: "global", value: 6, asOf: null, measure: "sum", season: (r) => (r.awards.won.includes("goldenShoe") ? 1 : 0) },
  { id: "internationalGoals", group: "global", value: 146, asOf: "2026-09", measure: "sum", season: (r) => r.national.goals },
  { id: "caps", group: "global", value: 234, asOf: "2026-09", measure: "sum", season: (r) => r.national.games },
  { id: "careerGames", group: "global", value: 1390, asOf: null, measure: "sum", season: (r) => r.games + r.national.games },
  { id: "championsLeague", group: "continental", value: 6, asOf: null, measure: "sum", season: (r) => count(r, (id) => id === "cont1:UEFA") },
  { id: "libertadores", group: "continental", value: 6, asOf: null, measure: "sum", season: (r) => count(r, (id) => id === "cont1:CONMEBOL") },
  { id: "leagueEngland", group: "league", value: 13, asOf: null, measure: "sum", season: leagueIn("ENG") },
  { id: "leagueSpain", group: "league", value: 12, asOf: null, measure: "sum", season: leagueIn("ESP") },
  { id: "leagueItaly", group: "league", value: 10, asOf: null, measure: "sum", season: leagueIn("ITA") },
  { id: "leagueGermany", group: "league", value: 13, asOf: null, measure: "sum", season: leagueIn("GER") },
  { id: "ballonStreak", group: "streak", value: 4, asOf: null, measure: "streak", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0) },
  {
    id: "leagueStreak",
    group: "streak",
    value: 11,
    asOf: null,
    measure: "streak",
    season: (r) => (r.titles.some((id) => kindOf(id) === "league" && BIG_FIVE.has(countryOf(id) ?? "")) ? 1 : 0),
  },
  { id: "primaryStreak", group: "streak", value: 5, asOf: null, measure: "streak", season: (r) => (r.titles.some((id) => kindOf(id) === "continental1") ? 1 : 0) },
];

export type RecordStatus = "beaten" | "matched" | "short";

export interface RecordResult {
  readonly record: RealRecord;
  /** A marca da carreira na mesma medida. */
  readonly value: number;
  readonly status: RecordStatus;
  /** Temporada em que a carreira alcançou a marca real (igualou ou passou). */
  readonly reachedYear: number | null;
  readonly reachedAge: number | null;
  /** Temporada em que passou da marca real. */
  readonly beatenYear: number | null;
}

/** A marca da carreira temporada a temporada, na medida do recorde. */
function running(record: RealRecord, history: readonly SeasonRecord[]): number[] {
  const values: number[] = [];
  let total = 0;
  let best = 0;
  let streak = 0;
  let longest = 0;
  let lastYear: number | null = null;
  for (const season of history) {
    const amount = record.season(season);
    if (record.measure === "sum") {
      total += amount;
      values.push(total);
    } else if (record.measure === "best") {
      best = Math.max(best, amount);
      values.push(best);
    } else {
      // Sequência só vale em anos seguidos: a carreira não tem buracos, mas a regra fica explícita.
      const continues = streak > 0 && lastYear !== null && season.year === lastYear + 1;
      streak = amount > 0 ? (continues ? streak + 1 : 1) : 0;
      longest = Math.max(longest, streak);
      values.push(longest);
    }
    lastYear = season.year;
  }
  return values;
}

export function compareRecord(record: RealRecord, history: readonly SeasonRecord[]): RecordResult {
  const values = running(record, history);
  const value = values[values.length - 1] ?? 0;
  const reachedIndex = values.findIndex((current) => current >= record.value);
  const beatenIndex = values.findIndex((current) => current > record.value);
  return {
    record,
    value,
    status: value > record.value ? "beaten" : value === record.value ? "matched" : "short",
    reachedYear: reachedIndex >= 0 ? (history[reachedIndex]?.year ?? null) : null,
    reachedAge: reachedIndex >= 0 ? (history[reachedIndex]?.age ?? null) : null,
    beatenYear: beatenIndex >= 0 ? (history[beatenIndex]?.year ?? null) : null,
  };
}

/** Todos os recordes, na ordem de prestígio, com a marca da carreira. */
export function careerRecords(history: readonly SeasonRecord[]): RecordResult[] {
  return REAL_RECORDS.map((record) => compareRecord(record, history));
}

/** Recordes que a carreira passou exatamente nesta temporada (o ângulo "Recorde" da capa). */
export function recordsBeatenIn(history: readonly SeasonRecord[], index: number): RecordResult[] {
  const year = history[index]?.year;
  if (year === undefined) return [];
  return careerRecords(history.slice(0, index + 1)).filter((result) => result.beatenYear === year);
}

export const RECORD_TEXTS: Readonly<Record<Locale, RecordsMessages>> = { pt: recordsPt, es: recordsEs, en: recordsEn };

export interface RecordText {
  readonly name: string;
  readonly holder: string;
  readonly detail: string;
  /** "Conferido em setembro de 2026", só para detentor em atividade. */
  readonly checked: string | null;
}

export function recordText(locale: Locale, record: RealRecord): RecordText {
  const texts = RECORD_TEXTS[locale];
  const entry = texts.records[record.id];
  return {
    name: entry.name,
    holder: entry.holder,
    detail: entry.detail,
    checked: record.asOf
      ? interpolate(texts.checked, { month: texts.months[Number(record.asOf.slice(5, 7)) - 1] ?? "", year: record.asOf.slice(0, 4) })
      : null,
  };
}
