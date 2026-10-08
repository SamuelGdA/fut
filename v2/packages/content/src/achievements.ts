import {
  BIG_FIVE,
  bestWorldCupStage,
  type Career,
  type ChallengeStatus,
  clubConfederation,
  clubCountry,
  finalLegacy,
  movementOf,
  type SeasonRecord,
  seasonsByClub,
  stintSizes,
  titlesOfKind,
  traitorMoves,
} from "@craque/engine";
import { interpolate, type Locale } from "./i18n";
import { achievementsEn } from "./locales/achievements.en";
import { achievementsEs } from "./locales/achievements.es";
import { type AchievementsMessages, achievementsPt } from "./locales/achievements.pt";
import { careerRecords, REAL_RECORDS, compareRecord, recordText } from "./records";
import { COMPETITIONS, getCompetition } from "@craque/world";

/**
 * As conquistas (GDD 28.2): permanentes entre carreiras, em oito grupos. Saem
 * do que a carreira guarda (histórico e diário), do resultado do desafio e de
 * dois contadores entre carreiras. As `anytime` podem cair no meio da
 * carreira (o aviso toca na hora); as `end` só fazem sentido com a carreira
 * terminada. As que têm contagem mostram o progresso.
 */

export const ACHIEVEMENT_GROUPS = ["career", "titles", "awards", "national", "loyalty", "road", "challenge", "curious", "records", "secret"] as const;
export type AchievementGroup = (typeof ACHIEVEMENT_GROUPS)[number];

export interface AchievementContext {
  readonly career: Career;
  /** O resultado do desafio, se a carreira é de desafio. */
  readonly challenge: ChallengeStatus | null;
  /** Carreiras terminadas antes desta. */
  readonly finishedBefore: number;
  /** Dias distintos com tentativa ranqueada, contando esta se ela for ranqueada. */
  readonly rankedDays: number;
}

export interface AchievementProgress {
  readonly value: number;
  readonly target: number;
}

export interface Achievement {
  readonly id: string;
  readonly group: AchievementGroup;
  readonly when: "anytime" | "end";
  /** Conquista de contagem: o alvo, e a contagem de agora. A tela mostra o progresso. */
  readonly target?: number;
  readonly count?: (context: AchievementContext) => number;
  /** A contagem é entre carreiras (carreiras terminadas, dias ranqueados), não de uma carreira só. */
  readonly across?: boolean;
  /** Sem contagem: sim ou não. */
  readonly check?: (context: AchievementContext) => boolean;
}

const peak = (career: Career) => career.history.reduce((top, record) => Math.max(top, record.ovrEnd), 0);
const has = (career: Career, test: (record: SeasonRecord) => boolean) => career.history.some(test);
const seasonsWhere = (career: Career, test: (record: SeasonRecord) => boolean) => career.history.filter(test).length;
const total = (career: Career, pick: (record: SeasonRecord) => number) => career.history.reduce((sum, record) => sum + pick(record), 0);
const won = (record: SeasonRecord, award: string) => (record.awards.won as readonly string[]).includes(award);

/** Países (do clube) onde ganhou a liga da primeira divisão. */
function leagueCountries(career: Career, only?: ReadonlySet<string>): number {
  const countries = new Set<string>();
  for (const record of career.history) {
    if (titlesOfKind(record, "league") === 0) continue;
    const country = clubCountry(record.club);
    if (country && (!only || only.has(country))) countries.add(country);
  }
  return countries.size;
}

/** Subiu com um clube e, depois, ganhou a liga da primeira divisão com ele. */
function promotedToGlory(career: Career): boolean {
  const promoted = new Set<string>();
  for (const record of career.history) {
    if (promoted.has(record.club) && titlesOfKind(record, "league") > 0) return true;
    if (movementOf(record) === "promoted") promoted.add(record.club);
  }
  return false;
}

/** Subiu com um clube e, depois, ganhou o principal torneio continental com ele. */
function promotedToContinent(career: Career): boolean {
  const promoted = new Set<string>();
  for (const record of career.history) {
    if (promoted.has(record.club) && titlesOfKind(record, "continental1") > 0) return true;
    if (movementOf(record) === "promoted") promoted.add(record.club);
  }
  return false;
}

/** Caiu com um clube e, depois, ganhou a liga com ele. */
function comeback(career: Career): boolean {
  const relegated = new Set<string>();
  for (const record of career.history) {
    if (relegated.has(record.club) && titlesOfKind(record, "league") > 0) return true;
    if (movementOf(record) === "relegated") relegated.add(record.club);
  }
  return false;
}

/** Voltou ao primeiro clube depois de sair dele de vez (o vaivém de empréstimo não conta). */
function homecoming(career: Career): boolean {
  const stints = stintSizes(career.history);
  const first = stints[0]?.club;
  if (first === undefined) return false;
  return stints.some((stint, index) => index >= 2 && stint.club === first && !stint.loan && !stints[index - 1]?.loan);
}

const legends = (career: Career) => [...finalLegacy(career.history).values()].filter((level) => level === "legend").length;

export const ACHIEVEMENTS: readonly Achievement[] = [
  ...REAL_RECORDS.map((record): Achievement => ({
    id: `record:${record.id}`, group: "records", when: "anytime", target: record.value,
    count: ({ career }) => compareRecord(record, career.history).value,
  })),
  ...COMPETITIONS.map((competition): Achievement => ({
    id: `title:${competition.id}`, group: "titles", when: "anytime",
    check: ({ career }) => has(career, (season) => season.titles.includes(competition.id)),
  })),
  { id: "retireAtDebut", group: "loyalty", when: "end", check: ({ career }) => {
    const first = career.history.find((season) => season.games > 0);
    const last = career.history[career.history.length - 1];
    return career.end !== null && first !== undefined && last?.club === first.club && career.contract?.club === first.club;
  } },
  { id: "newPassport", group: "secret", when: "anytime", check: ({ career }) => career.nationality !== career.setup.identity.nationality },
  // Carreira.
  { id: "firstCareer", group: "career", when: "end", check: ({ career }) => career.end !== null },
  { id: "tenCareers", group: "career", when: "end", across: true, target: 10, count: ({ finishedBefore }) => finishedBefore + 1 },
  { id: "fullDistance", group: "career", when: "end", check: ({ career }) => career.end?.reason === "age" },
  { id: "ovr90", group: "career", when: "anytime", check: ({ career }) => peak(career) >= 90 },
  { id: "ovr95", group: "career", when: "anytime", check: ({ career }) => peak(career) >= 95 },
  {
    id: "clubThreeHundred",
    group: "career",
    when: "anytime",
    target: 300,
    count: ({ career }) => {
      const games = new Map<string, number>();
      for (const record of career.history) games.set(record.club, (games.get(record.club) ?? 0) + record.games);
      return Math.max(0, ...games.values());
    },
  },

  // Títulos.
  { id: "firstTitle", group: "titles", when: "anytime", check: ({ career }) => has(career, (record) => record.titles.length > 0) },
  {
    id: "perfectSeason",
    group: "titles",
    when: "anytime",
    check: ({ career }) =>
      has(career, (record) => titlesOfKind(record, "league") > 0 && titlesOfKind(record, "cup") > 0 && titlesOfKind(record, "continental1") > 0),
  },
  { id: "continentalKing", group: "titles", when: "anytime", check: ({ career }) => has(career, (record) => titlesOfKind(record, "continental1") > 0) },
  { id: "worldChampion", group: "titles", when: "anytime", check: ({ career }) => has(career, (record) => titlesOfKind(record, "worldCup") > 0) },
  { id: "twentyTitles", group: "titles", when: "anytime", target: 20, count: ({ career }) => total(career, (record) => record.titles.length) },
  { id: "threeBigFive", group: "titles", when: "anytime", target: 3, count: ({ career }) => leagueCountries(career, BIG_FIVE) },
  { id: "allBigFive", group: "titles", when: "anytime", target: 5, count: ({ career }) => leagueCountries(career, BIG_FIVE) },
  { id: "promotedToGlory", group: "titles", when: "anytime", check: ({ career }) => promotedToGlory(career) },
  { id: "promotedToContinent", group: "titles", when: "anytime", check: ({ career }) => promotedToContinent(career) },

  // Prêmios.
  { id: "ballonDor", group: "awards", when: "anytime", check: ({ career }) => has(career, (record) => won(record, "ballonDor")) },
  { id: "fiveBallons", group: "awards", when: "anytime", target: 5, count: ({ career }) => seasonsWhere(career, (record) => won(record, "ballonDor")) },
  {
    id: "ballonAbroad",
    group: "awards",
    when: "anytime",
    check: ({ career }) => has(career, (record) => won(record, "ballonDor") && clubConfederation(record.club) !== "UEFA"),
  },
  { id: "goldenShoe", group: "awards", when: "anytime", check: ({ career }) => has(career, (record) => won(record, "goldenShoe")) },
  { id: "goldenGlove", group: "awards", when: "anytime", check: ({ career }) => has(career, (record) => won(record, "goldenGlove")) },
  { id: "youngPlayer", group: "awards", when: "anytime", check: ({ career }) => has(career, (record) => won(record, "youngPlayer")) },
  { id: "scoringTitle", group: "awards", when: "anytime", check: ({ career }) => has(career, (record) => won(record, "topScorer")) },
  { id: "bestOfCompetition", group: "awards", when: "anytime", check: ({ career }) => has(career, (record) => won(record, "bestPlayer")) },

  // Seleção.
  { id: "firstCap", group: "national", when: "anytime", check: ({ career }) => has(career, (record) => record.national.games > 0) },
  { id: "hundredCaps", group: "national", when: "anytime", target: 100, count: ({ career }) => total(career, (record) => record.national.games) },
  { id: "nationsChampion", group: "national", when: "anytime", check: ({ career }) => has(career, (record) => titlesOfKind(record, "nationsCup") > 0) },
  // Fases da Copa: 7 é a final, 8 é campeão.
  { id: "worldCupFinal", group: "national", when: "anytime", check: ({ career }) => bestWorldCupStage(career.history) >= 7 },

  // Lealdade.
  { id: "oneClubMan", group: "loyalty", when: "end", check: ({ career }) => career.history.length >= 10 && seasonsByClub(career.history).size === 1 },
  { id: "legend", group: "loyalty", when: "anytime", check: ({ career }) => legends(career) >= 1 },
  { id: "threeLegends", group: "loyalty", when: "anytime", target: 3, count: ({ career }) => legends(career) },
  { id: "homecoming", group: "loyalty", when: "anytime", check: ({ career }) => homecoming(career) },

  // Estrada.
  {
    id: "fiveCountries",
    group: "road",
    when: "anytime",
    target: 5,
    count: ({ career }) => new Set(career.history.map((record) => clubCountry(record.club) ?? record.club)).size,
  },
  {
    id: "threeContinents",
    group: "road",
    when: "anytime",
    target: 3,
    count: ({ career }) => new Set(career.history.map((record) => clubConfederation(record.club) ?? "")).size,
  },
  { id: "titlesThreeCountries", group: "road", when: "anytime", target: 3, count: ({ career }) => leagueCountries(career) },
  { id: "eightClubs", group: "road", when: "anytime", target: 8, count: ({ career }) => seasonsByClub(career.history).size },
  { id: "tenClubs", group: "road", when: "anytime", target: 10, count: ({ career }) => seasonsByClub(career.history).size },

  // Desafio.
  { id: "challengeFirst", group: "challenge", when: "end", check: ({ challenge }) => challenge !== null },
  { id: "challenge700", group: "challenge", when: "end", check: ({ challenge }) => (challenge?.total ?? 0) >= 700 },
  { id: "challenge900", group: "challenge", when: "end", check: ({ challenge }) => (challenge?.total ?? 0) >= 900 },
  {
    id: "challengeClean",
    group: "challenge",
    when: "end",
    check: ({ challenge }) => challenge !== null && (challenge.edict.state === "intact" || challenge.edict.state === "met") && challenge.erased === 0,
  },
  { id: "challengeAllThree", group: "challenge", when: "end", check: ({ challenge }) => challenge !== null && challenge.missions.every((item) => item.ratio >= 1) },
  { id: "challengeWeek", group: "challenge", when: "end", across: true, target: 7, count: ({ rankedDays }) => rankedDays },

  // Curiosas.
  { id: "fiftyGoals", group: "curious", when: "anytime", check: ({ career }) => has(career, (record) => record.production.goals >= 50) },
  // A marca de Messi em 2011-12: rara, mas ao alcance de quem for extraordinário (D33 e D42).
  { id: "seventyThree", group: "curious", when: "anytime", check: ({ career }) => has(career, (record) => record.production.goals >= 73) },
  { id: "anyRecord", group: "curious", when: "anytime", check: ({ career }) => careerRecords(career.history).some((result) => result.status === "beaten") },
  {
    id: "lateBloomer",
    group: "secret",
    when: "end",
    check: ({ career }) => {
      const top = peak(career);
      const first = career.history.find((record) => record.ovrEnd === top);
      return top >= 80 && (first?.age ?? 0) >= 31;
    },
  },
  { id: "comeback", group: "secret", when: "anytime", check: ({ career }) => comeback(career) },
  { id: "turncoat", group: "secret", when: "anytime", check: ({ career }) => traitorMoves(career) > 0 },
  { id: "assistSeason", group: "curious", when: "anytime", check: ({ career }) => has(career, (record) => record.production.assists >= 20) },
];

export const ACHIEVEMENT_IDS: readonly string[] = ACHIEVEMENTS.map((item) => item.id);

const BY_ID = new Map(ACHIEVEMENTS.map((item) => [item.id, item]));

export function getAchievement(id: string): Achievement | null {
  return BY_ID.get(id) ?? null;
}

export function achievementProgress(achievement: Achievement, context: AchievementContext): AchievementProgress | null {
  if (!achievement.count || achievement.target === undefined) return null;
  return { value: Math.min(achievement.count(context), achievement.target), target: achievement.target };
}

export function achievementMet(achievement: Achievement, context: AchievementContext): boolean {
  const progress = achievementProgress(achievement, context);
  if (progress) return progress.value >= progress.target;
  return achievement.check?.(context) ?? false;
}

/**
 * A contagem de cada conquista de contagem desta carreira (as de uma carreira
 * só), para guardar com ela no Hall: a tela de conquistas mostra o progresso
 * sem refazer carreira nenhuma.
 */
export function careerAchievementCounts(career: Career, challenge: ChallengeStatus | null): Record<string, number> {
  const context: AchievementContext = { career, challenge, finishedBefore: 0, rankedDays: 0 };
  const counts: Record<string, number> = {};
  for (const item of ACHIEVEMENTS) {
    if (item.count && !item.across) counts[item.id] = item.count(context);
  }
  return counts;
}

/**
 * As conquistas que a carreira acabou de liberar. No meio da carreira, só as
 * `anytime`; com ela terminada, todas. `unlocked` são as que o jogador já tem,
 * de qualquer carreira.
 */
export function newAchievements(context: AchievementContext, unlocked: ReadonlySet<string>): string[] {
  const ended = context.career.end !== null;
  return ACHIEVEMENTS.filter((item) => !unlocked.has(item.id) && (ended || item.when === "anytime") && achievementMet(item, context)).map(
    (item) => item.id,
  );
}

export const ACHIEVEMENT_TEXTS: Readonly<Record<Locale, AchievementsMessages>> = { pt: achievementsPt, es: achievementsEs, en: achievementsEn };

type ItemTexts = Readonly<Record<string, { readonly name: string; readonly description: string }>>;

export function achievementText(locale: Locale, id: string): { name: string; description: string } {
  if (id.startsWith("record:")) {
    const record = REAL_RECORDS.find((item) => `record:${item.id}` === id);
    if (record) return { name: recordText(locale, record).name, description: interpolate(ACHIEVEMENT_TEXTS[locale].recordGoal, { value: record.value }) };
  }
  if (id.startsWith("title:")) {
    const competition = getCompetition(id.slice(6));
    if (competition) return { name: competition.names[locale], description: interpolate(ACHIEVEMENT_TEXTS[locale].titleGoal, { title: competition.names[locale] }) };
  }
  const entry = (ACHIEVEMENT_TEXTS[locale].items as ItemTexts)[id];
  return entry ? { name: entry.name, description: entry.description } : { name: id, description: "" };
}

export function achievementGroupName(locale: Locale, group: AchievementGroup): string {
  return ACHIEVEMENT_TEXTS[locale].groups[group];
}

export function achievementProgressText(locale: Locale, progress: AchievementProgress): string {
  return interpolate(ACHIEVEMENT_TEXTS[locale].progress, { value: progress.value, target: progress.target });
}
