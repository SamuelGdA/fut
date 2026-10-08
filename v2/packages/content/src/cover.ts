import { type Career, isGoalkeeper, movementOf, type SeasonRecord } from "@craque/engine";
import { AWARDS, type AwardKey, getCompetition, getLeague } from "@craque/world";
import { formatDecimal, interpolate, type Locale } from "./i18n";
import { type RecordResult, recordsBeatenIn, recordText } from "./records";
import { coverEn } from "./locales/cover.en";
import { coverEs } from "./locales/cover.es";
import { type CoverMessages, coverPt } from "./locales/cover.pt";
import { careerPlural, clubName, displayName } from "./text";

/**
 * A capa do jornal de cada temporada (GDD 21.2): a notícia mais importante do
 * ano, escolhida pelo primeiro ângulo que se aplicar, com manchete sorteada
 * pela semente. Uma manchete igual à do ano anterior avança para a próxima.
 * A revelação e o jornal do resumo leem daqui: as duas nunca discordam sobre
 * qual foi a história de uma temporada.
 */

export const COVER_TEXTS: Readonly<Record<Locale, CoverMessages>> = { pt: coverPt, es: coverEs, en: coverEn };

/** Os ângulos na ordem de prioridade. */
export const COVER_ANGLES = [
  "perfect",
  "worldChampion",
  "bestInWorld",
  "continentKing",
  "collector",
  "nationGlory",
  "nationalChampion",
  "honour",
  "bestOfCompetition",
  "scoringTitle",
  "relegated",
  "promoted",
  "almost",
  "debut",
  "cup",
  "superCup",
  "trophy",
  "record",
  "explosion",
  "scorer",
  "playmaker",
  "wall",
  "injured",
  "suspended",
  "prospect",
  "forgotten",
  "newAddress",
  "lastDance",
  "fading",
  "steady",
] as const;

export type CoverAngle = (typeof COVER_ANGLES)[number];
export type CoverTone = "good" | "bad" | "neutral";

const BAD: ReadonlySet<CoverAngle> = new Set(["relegated", "injured", "suspended", "forgotten", "fading"]);
const NEUTRAL: ReadonlySet<CoverAngle> = new Set(["prospect", "newAddress", "lastDance", "steady"]);

export function coverTone(angle: CoverAngle): CoverTone {
  if (BAD.has(angle)) return "bad";
  if (NEUTRAL.has(angle)) return "neutral";
  return "good";
}

/**
 * Prêmios individuais que viram o ângulo "honraria" (a Bola de Ouro tem o seu;
 * a artilharia e o craque de competição também, com o nome da competição).
 */
const HONOURS: readonly AwardKey[] = ["goldenShoe", "goldenGlove", "youngPlayer"];

export interface CoverFacts {
  readonly record: SeasonRecord;
  readonly previous: SeasonRecord | null;
  /** A primeira convocação foi nesta temporada. */
  readonly firstCap: boolean;
  /** Recordes reais que a carreira passou nesta temporada, do mais importante ao menos. */
  readonly beaten?: readonly RecordResult[];
}

export interface CoverPick {
  readonly angle: CoverAngle;
  /** Competição citada na manchete, quando o ângulo é um título. */
  readonly competition: string | null;
  readonly award: AwardKey | null;
  /** O recorde da manchete, no ângulo "Recorde". */
  readonly realRecord: RecordResult | null;
}

/** O primeiro ângulo que se aplicar, na ordem da tabela do GDD 21.2. */
export function coverAngle(facts: CoverFacts): CoverPick {
  const { record, previous, firstCap, beaten = [] } = facts;
  const kinds = record.titles.map((id) => ({ id, kind: getCompetition(id)?.kind ?? null }));
  const title = (...wanted: string[]) => kinds.find((entry) => entry.kind !== null && wanted.includes(entry.kind))?.id ?? null;
  const won = (award: AwardKey) => record.awards.won.includes(award);
  const pick = (angle: CoverAngle, competition: string | null = null, award: AwardKey | null = null, realRecord: RecordResult | null = null): CoverPick => ({
    angle,
    competition,
    award,
    realRecord,
  });

  const league = title("league");
  const cup = title("cup");
  const primary = title("continental1");
  if (league && cup && primary) return pick("perfect");
  const worldCup = title("worldCup");
  if (worldCup) return pick("worldChampion", worldCup);
  if (won("ballonDor")) return pick("bestInWorld", null, "ballonDor");
  const continent = primary ?? title("clubWorldCup");
  if (continent) return pick("continentKing", continent);
  if (record.titles.length >= 3) return pick("collector");
  const nations = title("nationsCup");
  if (nations) return pick("nationGlory", nations);
  if (league) return pick("nationalChampion", league);
  const honour = HONOURS.find(won);
  if (honour) return pick("honour", null, honour);
  // Craque e artilharia de competição: a mais importante, a liga antes das copas.
  const crownOf = (award: "topScorer" | "bestPlayer") => {
    const crowns = record.awards.crowns.filter((crown) => crown.award === award);
    return (crowns.find((crown) => getCompetition(crown.competition)?.kind === "league") ?? crowns[0])?.competition ?? null;
  };
  const best = crownOf("bestPlayer");
  if (best) return pick("bestOfCompetition", best, "bestPlayer");
  const scorer = crownOf("topScorer");
  if (scorer) return pick("scoringTitle", scorer, "topScorer");
  const movement = movementOf(record);
  if (movement === "relegated") return pick("relegated");
  if (movement === "promoted") return pick("promoted");
  const ballonRank = record.awards.ballonDor.playerRank;
  if (ballonRank !== null && ballonRank >= 2 && ballonRank <= 3) return pick("almost");
  if (firstCap) return pick("debut");
  const domesticCup = cup ?? title("leagueCup");
  if (domesticCup) return pick("cup", domesticCup);
  // Jogo único (supercopas, Intercontinental) não é campanha: tem manchete própria.
  const oneOff = title("superCup", "continentalSuper", "intercontinental");
  if (oneOff) return pick("superCup", oneOff);
  const other = kinds[0]?.id ?? null;
  if (other) return pick("trophy", other);
  const realRecord = beaten[0] ?? null;
  if (realRecord) return pick("record", null, null, realRecord);

  const delta = record.ovrEnd - record.ovrStart;
  if (delta >= 4 && record.games >= 15) return pick("explosion");
  const keeper = isGoalkeeper(record.position);
  if (!keeper && record.production.goals >= 20) return pick("scorer");
  if (!keeper && record.production.assists >= 10) return pick("playmaker");
  if (keeper && record.production.cleanSheets >= 15) return pick("wall");
  const lost = record.injury?.lostGames ?? 0;
  if (lost > 0 && lost / (record.games + lost) >= 0.2) return pick("injured");
  if (record.suspended) return pick("suspended");
  // Garoto da base com poucos jogos ainda é promessa, não esquecido.
  if (record.age <= 19 && record.games < 10) return pick("prospect");
  if (record.games < 10) return pick("forgotten");
  if (previous === null || previous.club !== record.club) return pick("newAddress");
  if (record.age >= 37) return pick("lastDance");
  if (delta <= -3 && record.games >= 15) return pick("fading");
  return pick("steady");
}

/** FNV-1a de 32 bits: um número estável a partir de um texto. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value >>> 0;
}

function ordinal(value: number, locale: Locale): string {
  if (locale !== "en") return `${value}º`;
  const tens = value % 100;
  if (tens >= 11 && tens <= 13) return `${value}th`;
  const suffix = value % 10 === 1 ? "st" : value % 10 === 2 ? "nd" : value % 10 === 3 ? "rd" : "th";
  return `${value}${suffix}`;
}

/** O jornal da carreira: um dos oito, fixo pela semente. */
export function paperName(locale: Locale, seed: string): string {
  const papers = COVER_TEXTS[locale].papers;
  return papers[hash(`${seed}|jornal`) % papers.length] ?? papers[0] ?? "";
}

export interface SeasonCover {
  readonly year: number;
  readonly angle: CoverAngle;
  readonly tone: CoverTone;
  readonly paper: string;
  readonly dateline: string;
  readonly headline: string;
  readonly support: string;
  /** Qual das manchetes do ângulo saiu, para a regra de não repetir. */
  readonly index: number;
  readonly supportIndex: number;
}

/** Sorteia uma redação, avançando para a próxima se repetiria a do ano anterior. */
function pickIndex(key: string, size: number, repeated: number | null): number {
  const index = hash(key) % size;
  return repeated !== null && index === repeated ? (index + 1) % size : index;
}

/** As capas de todas as temporadas da carreira, na ordem do histórico. */
export function seasonCovers(locale: Locale, career: Career): SeasonCover[] {
  const texts = COVER_TEXTS[locale];
  const seed = career.setup.seed;
  const surname = displayName(career.setup.identity.surname, locale);
  const paper = paperName(locale, seed);
  const covers: SeasonCover[] = [];

  career.history.forEach((record, position) => {
    const previous = position > 0 ? (career.history[position - 1] ?? null) : null;
    const picked = coverAngle({ record, previous, firstCap: career.firstCapAge === record.age, beaten: recordsBeatenIn(career.history, position) });
    const entry = texts.angles[picked.angle];
    const last = covers[covers.length - 1];
    const sameAngle = last !== undefined && last.angle === picked.angle;
    const index = pickIndex(`${seed}|${record.year}|${picked.angle}`, entry.headlines.length, sameAngle ? last.index : null);
    const supportIndex = pickIndex(`${seed}|${record.year}|${picked.angle}|apoio`, entry.support.length, sameAngle ? last.supportIndex : null);

    const keeper = isGoalkeeper(record.position);
    const realRecord = picked.realRecord;
    const realText = realRecord ? recordText(locale, realRecord.record) : null;
    const vars = {
      surname,
      club: clubName(record.club),
      league: getLeague(record.league)?.name ?? "",
      competition: picked.competition ? (getCompetition(picked.competition)?.names[locale] ?? "") : "",
      award: picked.award ? AWARDS[picked.award].names[locale] : "",
      year: record.year,
      age: record.age,
      rank: ordinal(record.awards.ballonDor.playerRank ?? 0, locale),
      count: record.titles.length,
      ovr: record.ovrEnd,
      games: record.games,
      goals: record.production.goals,
      assists: record.production.assists,
      cleanSheets: record.production.cleanSheets,
      gamesText: careerPlural(locale, "stats.gamesCount", record.games),
      goalsText: careerPlural(locale, "stats.goalsCount", record.production.goals),
      assistsText: careerPlural(locale, "stats.assistsCount", record.production.assists),
      cleanSheetsText: careerPlural(locale, "stats.cleanSheetsCount", record.production.cleanSheets),
      productionText: keeper
        ? careerPlural(locale, "stats.cleanSheetsCount", record.production.cleanSheets)
        : careerPlural(locale, "stats.goalsCount", record.production.goals),
      record: realText?.name ?? "",
      holder: realText?.holder ?? "",
      mark: realRecord ? formatDecimal(realRecord.record.value, locale, 0) : "",
      value: realRecord ? formatDecimal(realRecord.value, locale, 0) : "",
    };
    covers.push({
      year: record.year,
      angle: picked.angle,
      tone: coverTone(picked.angle),
      paper,
      dateline: interpolate(texts.dateline, { year: record.year }),
      headline: interpolate(entry.headlines[index] ?? entry.headlines[0] ?? "", vars),
      support: interpolate(entry.support[supportIndex] ?? entry.support[0] ?? "", vars),
      index,
      supportIndex,
    });
  });
  return covers;
}
