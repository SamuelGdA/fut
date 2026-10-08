import { type Career, movementOf } from "@craque/engine";
import { AWARDS, getCompetition } from "@craque/world";
import { interpolate, type Locale } from "./i18n";
import { headlinesEn } from "./locales/headlines.en";
import { headlinesEs } from "./locales/headlines.es";
import { type HeadlinesMessages, headlinesPt } from "./locales/headlines.pt";
import { recordsBeatenIn, recordText } from "./records";
import { careerText, clubName } from "./text";

/**
 * As manchetes da carreira (GDD 21.1): as notícias pequenas de cada temporada,
 * que o jornal do resumo imprime na coluna "Também nesta temporada". Saem do
 * histórico (títulos, prêmios, acesso, lesão, recorde) e do diário da carreira
 * (transferência, camisa, convocação). Guardadas como chave, variáveis e tom;
 * o texto sai na hora, no idioma de quem lê.
 */

export const HEADLINE_KEYS = [
  "title",
  "award",
  "topScorer",
  "bestPlayer",
  "ballonPodium",
  "record",
  "firstCap",
  "promoted",
  "relegated",
  "explosion",
  "transfer",
  "transferTraitor",
  "loan",
  "released",
  "shirt",
  "injury",
] as const;

export type HeadlineKey = (typeof HEADLINE_KEYS)[number];
export type HeadlineTone = "good" | "bad" | "neutral";

export interface CareerHeadline {
  readonly year: number;
  readonly age: number;
  readonly key: HeadlineKey;
  readonly tone: HeadlineTone;
  readonly text: string;
}

/** No máximo isto por carreira (GDD 21.1). */
export const HEADLINES_MAX = 300;

/** Lesão que vira notícia: dez jogos ou mais fora. */
const SERIOUS_INJURY_GAMES = 10;

/** Explosão que vira notícia (GDD 21.1): +5 de OVR com 15 jogos ou mais. */
const EXPLOSION_DELTA = 5;

export const HEADLINE_TEXTS: Readonly<Record<Locale, HeadlinesMessages>> = { pt: headlinesPt, es: headlinesEs, en: headlinesEn };

const TONE: Readonly<Record<HeadlineKey, HeadlineTone>> = {
  title: "good",
  award: "good",
  topScorer: "good",
  bestPlayer: "good",
  ballonPodium: "good",
  record: "good",
  firstCap: "good",
  promoted: "good",
  relegated: "bad",
  explosion: "good",
  transfer: "neutral",
  transferTraitor: "bad",
  loan: "neutral",
  released: "bad",
  shirt: "neutral",
  injury: "bad",
};

/** Todas as manchetes da carreira, temporada a temporada, na ordem em que aconteceram. */
export function careerHeadlines(locale: Locale, career: Career): CareerHeadline[] {
  const texts = HEADLINE_TEXTS[locale];
  const headlines: CareerHeadline[] = [];
  const add = (year: number, age: number, key: HeadlineKey, vars: Record<string, string | number> = {}) => {
    headlines.push({ year, age, key, tone: TONE[key], text: interpolate(texts[key], vars) });
  };

  career.history.forEach((record, index) => {
    const { year, age } = record;
    // Primeiro o que aconteceu na escolha e durante a temporada (o diário).
    for (const entry of career.log) {
      if (entry.year !== year) continue;
      switch (entry.kind) {
        case "transfer":
          add(year, age, entry.loan ? "loan" : entry.traitor ? "transferTraitor" : "transfer", { club: clubName(entry.to) });
          break;
        case "released":
          add(year, age, "released", { club: clubName(entry.club) });
          break;
        case "shirt":
          add(year, age, "shirt", { number: entry.number });
          break;
        case "firstCap":
          add(year, age, "firstCap", { age: entry.age });
          break;
        default:
          break;
      }
    }
    // Depois, o que a temporada deixou no histórico.
    for (const id of record.titles) add(year, age, "title", { competition: getCompetition(id)?.names[locale] ?? id });
    // Artilharia e craque saem por competição, com o nome dela; os outros prêmios, pelo nome do prêmio.
    for (const key of record.awards.won) if (key !== "topScorer" && key !== "bestPlayer") add(year, age, "award", { award: AWARDS[key].names[locale] });
    for (const crown of record.awards.crowns) {
      const competition = getCompetition(crown.competition)?.names[locale] ?? crown.competition;
      if (crown.award === "topScorer") add(year, age, "topScorer", { competition, goals: crown.goals });
      else add(year, age, "bestPlayer", { competition });
    }
    const rank = record.awards.ballonDor.playerRank;
    if (rank !== null && rank >= 2 && rank <= 3) add(year, age, "ballonPodium", { rank: ordinalOf(rank, locale) });
    for (const result of recordsBeatenIn(career.history, index)) add(year, age, "record", { record: recordText(locale, result.record).name });
    const movement = movementOf(record);
    if (movement === "promoted") add(year, age, "promoted", { club: clubName(record.club) });
    if (movement === "relegated") add(year, age, "relegated", { club: clubName(record.club) });
    if (record.ovrEnd - record.ovrStart >= EXPLOSION_DELTA && record.games >= 15) add(year, age, "explosion", { ovr: record.ovrEnd });
    if (record.injury && record.injury.lostGames >= SERIOUS_INJURY_GAMES) {
      add(year, age, "injury", { injury: careerText(locale, `injuries.${record.injury.type}`) });
    }
  });
  return headlines.slice(0, HEADLINES_MAX);
}

/** As manchetes de uma temporada, as boas primeiro (o jornal imprime as que couberem). */
export function seasonHeadlines(headlines: readonly CareerHeadline[], year: number): CareerHeadline[] {
  const order: Readonly<Record<HeadlineTone, number>> = { good: 0, bad: 1, neutral: 2 };
  return headlines.filter((headline) => headline.year === year).sort((a, b) => order[a.tone] - order[b.tone]);
}

function ordinalOf(value: number, locale: Locale): string {
  if (locale !== "en") return `${value}º`;
  return value === 2 ? "2nd" : value === 3 ? "3rd" : `${value}th`;
}
