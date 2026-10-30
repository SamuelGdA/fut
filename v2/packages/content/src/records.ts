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
 * Assistências numa temporada (Messi, todas as competições), jogos sem sofrer
 * gol numa temporada de liga (ter Stegen e Liaño) e a liga francesa
 * (Marquinhos) entraram na D93. Liga Europa, Sul-Americana e a liga do
 * Brasil seguem de fora (D24).
 */

export const RECORDS_CHECKED = "2026-09";

export type RecordGroup = "global" | "continental" | "league" | "streak";

/**
 * Faixa de raridade do recorde (D94), medida em carreiras de Fenômeno: entrada
 * (6% a 15% igualam), raro (2% a 5%), épico (0,5% a 1,5%) e lendário (menos de
 * 0,4%). O relatório `pnpm balance:recordes` confere cada uma.
 */
export type RecordTier = "entry" | "rare" | "epic" | "legendary";
export const RECORD_TIERS: readonly RecordTier[] = ["entry", "rare", "epic", "legendary"];

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
  "seasonAssists",
  "seasonCleanSheets",
  "leagueFrance",
  "championsGames",
] as const;

export type RecordId = (typeof RECORD_IDS)[number];

export interface RealRecord {
  readonly id: RecordId;
  readonly group: RecordGroup;
  readonly tier: RecordTier;
  /** A marca real. */
  readonly value: number;
  /** Mês da conferência, para quem ainda está jogando e pode aumentar a marca. */
  readonly asOf: string | null;
  /** Como a carreira é medida: soma, melhor temporada, maior sequência ou conta da carreira inteira. */
  readonly measure: "sum" | "best" | "streak" | "career";
  /** Com `measure: "career"`: o número lido do histórico até a temporada. */
  readonly career?: (history: readonly SeasonRecord[]) => number;
  /** O que cada temporada soma (ou vale, ou conta para a sequência). */
  readonly season: (record: SeasonRecord) => number;
}

const kindOf = (id: string) => getCompetition(id)?.kind ?? null;
const countryOf = (id: string) => getCompetition(id)?.country ?? null;
const BIG_FIVE = new Set(["ENG", "ESP", "ITA", "GER", "FRA"]);
const count = (record: SeasonRecord, matches: (id: string) => boolean) => record.titles.filter(matches).length;
const leagueIn = (country: string) => (record: SeasonRecord) =>
  count(record, (id) => kindOf(id) === "league" && countryOf(id) === country);
/**
 * Jogos sem sofrer gol só na liga de primeira divisão, como o recorde real
 * (D93), e só como goleiro: o recorde é de goleiro, e um atacante não pode
 * persegui-lo nem vê-lo à vista (D95).
 */
const leagueCleanSheets = (record: SeasonRecord) =>
  record.position !== "gk" ? 0 : record.production.lines.filter((line) => line.kind === "league").reduce((sum, line) => sum + line.cleanSheets, 0);

export const REAL_RECORDS: readonly RealRecord[] = [
  { id: "careerGoals", group: "global", tier: "epic", value: 979, asOf: "2026-09", measure: "sum", season: (r) => r.production.goals + r.national.goals },
  { id: "ballonDor", group: "global", tier: "legendary", value: 8, asOf: null, measure: "sum", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0) },
  { id: "worldCups", group: "global", tier: "epic", value: 3, asOf: null, measure: "sum", season: (r) => count(r, (id) => kindOf(id) === "worldCup") },
  { id: "seasonGoals", group: "global", tier: "rare", value: 73, asOf: null, measure: "best", season: (r) => r.production.goals },
  { id: "careerTitles", group: "global", tier: "entry", value: 46, asOf: "2026-09", measure: "sum", season: (r) => r.titles.length },
  { id: "goldenShoes", group: "global", tier: "legendary", value: 6, asOf: null, measure: "sum", season: (r) => (r.awards.won.includes("goldenShoe") ? 1 : 0) },
  { id: "internationalGoals", group: "global", tier: "legendary", value: 146, asOf: "2026-09", measure: "sum", season: (r) => r.national.goals },
  { id: "caps", group: "global", tier: "entry", value: 234, asOf: "2026-09", measure: "sum", season: (r) => r.national.games },
  { id: "careerGames", group: "global", tier: "rare", value: 1390, asOf: null, measure: "sum", season: (r) => r.games + r.national.games },
  { id: "championsLeague", group: "continental", tier: "rare", value: 6, asOf: null, measure: "sum", season: (r) => count(r, (id) => id === "cont1:UEFA") },
  { id: "libertadores", group: "continental", tier: "legendary", value: 6, asOf: null, measure: "sum", season: (r) => count(r, (id) => id === "cont1:CONMEBOL") },
  { id: "leagueEngland", group: "league", tier: "legendary", value: 13, asOf: null, measure: "sum", season: leagueIn("ENG") },
  { id: "leagueSpain", group: "league", tier: "epic", value: 12, asOf: null, measure: "sum", season: leagueIn("ESP") },
  { id: "leagueItaly", group: "league", tier: "epic", value: 10, asOf: null, measure: "sum", season: leagueIn("ITA") },
  { id: "leagueGermany", group: "league", tier: "epic", value: 13, asOf: null, measure: "sum", season: leagueIn("GER") },
  { id: "ballonStreak", group: "streak", tier: "legendary", value: 4, asOf: null, measure: "streak", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0) },
  {
    id: "leagueStreak",
    group: "streak",
    tier: "rare",
    value: 11,
    asOf: null,
    measure: "streak",
    season: (r) => (r.titles.some((id) => kindOf(id) === "league" && BIG_FIVE.has(countryOf(id) ?? "")) ? 1 : 0),
  },
  { id: "primaryStreak", group: "streak", tier: "epic", value: 5, asOf: null, measure: "streak", season: (r) => (r.titles.some((id) => kindOf(id) === "continental1") ? 1 : 0) },
  // D93: marcas reais pesquisadas para as três que eram só referência na D92.
  { id: "seasonAssists", group: "global", tier: "rare", value: 32, asOf: null, measure: "best", season: (r) => r.production.assists },
  { id: "seasonCleanSheets", group: "global", tier: "entry", value: 26, asOf: "2026-10", measure: "best", season: leagueCleanSheets },
  { id: "leagueFrance", group: "league", tier: "rare", value: 11, asOf: "2026-10", measure: "sum", season: leagueIn("FRA") },
  // D105: jogos de Champions League (UEFA e Guinness): carreira longa em clube grande. Defensores e goleiros chegam mais.
  { id: "championsGames", group: "continental", tier: "entry", value: 183, asOf: null, measure: "sum", season: (r) => r.production.lines.filter((line) => line.competition === "cont1:UEFA").reduce((sum, line) => sum + line.games, 0) },
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
  for (const [index, season] of history.entries()) {
    const amount = record.season(season);
    if (record.measure === "career") {
      values.push(record.career ? record.career(history.slice(0, index + 1)) : 0);
    } else if (record.measure === "sum") {
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

/**
 * Recordes que a carreira alcançou nesta temporada (D94): igualados ou
 * superados neste ano, com o superado antes. A capa do jornal abre com o
 * primeiro e o selo conta os outros. D101: dentro de cada grupo, o de mais
 * valor primeiro (lendário, épico, raro, clássico); no empate, a ordem do catálogo.
 */
export function recordsReachedIn(history: readonly SeasonRecord[], index: number): RecordResult[] {
  const year = history[index]?.year;
  if (year === undefined) return [];
  const results = careerRecords(history.slice(0, index + 1));
  const byValue = (a: RecordResult, b: RecordResult) => RECORD_TIERS.indexOf(b.record.tier) - RECORD_TIERS.indexOf(a.record.tier);
  return [
    ...results.filter((result) => result.beatenYear === year).sort(byValue),
    ...results.filter((result) => result.reachedYear === year && result.beatenYear !== year).sort(byValue),
  ];
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

/**
 * Os recordes à vista (D94): o que falta para igualar a marca (a partir de
 * `near` da marca) e, já igualada, o 1 que falta para superar. Mostrar o quase
 * é o que transforma uma carreira que ficou perto em vontade de jogar de novo.
 */
export interface RecordChase {
  readonly result: RecordResult;
  /** O que falta, na unidade da marca. */
  readonly missing: number;
  readonly goal: "match" | "beat";
}

export function recordChases(history: readonly SeasonRecord[], near = 0.8): RecordChase[] {
  return careerRecords(history)
    .flatMap((result): RecordChase[] => {
      if (result.status === "matched") return [{ result, missing: 1, goal: "beat" }];
      if (result.status === "short" && result.value >= result.record.value * near && result.value > 0) return [{ result, missing: result.record.value - result.value, goal: "match" }];
      return [];
    })
    .sort((a, b) => b.result.value / b.result.record.value - a.result.value / a.result.record.value);
}

/** A sequência que ainda corre: a que termina na última temporada do histórico. */
function currentStreak(record: RealRecord, history: readonly SeasonRecord[]): number {
  let streak = 0;
  let year: number | null = null;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const season = history[index]!;
    if (record.season(season) <= 0 || (year !== null && season.year !== year - 1)) break;
    streak += 1;
    year = season.year;
  }
  return streak;
}

/**
 * Recordes à vista durante a carreira (D96): só o que a próxima temporada
 * ainda pode mudar. Marca de uma temporada só ("melhor temporada") recomeça
 * do zero todo ano, então não está à vista depois que o ano acaba; sequência
 * só conta enquanto não quebrou, e conta o tamanho atual dela. O resumo da
 * carreira continua usando `recordChases`, com tudo o que ficou perto.
 */
export function liveRecordChases(history: readonly SeasonRecord[], near = 0.8): RecordChase[] {
  return careerRecords(history)
    .flatMap((result): RecordChase[] => {
      const { record } = result;
      if (record.measure === "best") return [];
      const value = record.measure === "streak" ? currentStreak(record, history) : result.value;
      if (value > record.value) return [];
      if (value === record.value) return [{ result: { ...result, value }, missing: 1, goal: "beat" }];
      if (value >= record.value * near && value > 0) return [{ result: { ...result, value }, missing: record.value - value, goal: "match" }];
      return [];
    })
    .sort((a, b) => b.result.value / b.result.record.value - a.result.value / a.result.record.value);
}

