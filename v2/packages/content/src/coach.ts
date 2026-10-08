import type { CoachCareer, SeasonHistory } from "@craque/engine/coach";
import { type CountryCode, getClub, getCountry, getLeague } from "@craque/world";
import { interpolate, type Locale, lookup, type TextKey, type Vars } from "./i18n";
import { coachEn } from "./locales/coach.en";
import { coachEs } from "./locales/coach.es";
import { type CoachMessages, coachPt } from "./locales/coach.pt";
import { generatedName } from "./names/generate";

/**
 * Textos e conquistas do Técnico (GDD 56), em `@craque/content/coach`: o
 * Craque não carrega nada disto. Os nomes dos jogadores gerados (lacunas dos
 * elencos, jovens da base e da IA) saem daqui, pelo id e pela nacionalidade.
 */

export const COACH_TEXTS: Readonly<Record<Locale, CoachMessages>> = { pt: coachPt, es: coachEs, en: coachEn };

export type CoachKey = TextKey<CoachMessages>;

/** Texto do Técnico. Falta no idioma: português. Falta também lá: a própria chave. */
export function coachText(locale: Locale, key: CoachKey | string, vars?: Vars): string {
  const own = lookup(COACH_TEXTS[locale], key);
  if (typeof own === "string") return interpolate(own, vars);
  const fallback = lookup(COACH_TEXTS.pt, key);
  return typeof fallback === "string" ? interpolate(fallback, vars) : key;
}

/** O texto existe (em português, a fonte)? Para a tela escolher entre `result` e `success`. */
export function hasCoachText(key: string): boolean {
  return typeof lookup(COACH_TEXTS.pt, key) === "string";
}

// ------------------------------------------------------------------ nomes

/**
 * Nome de um jogador do Técnico. Os reais têm o nome da fonte; os gerados das
 * lacunas (`g:`) têm nome fixo entre carreiras; os jovens (`y:` e `a:`) nascem
 * na carreira, então o nome também depende da semente.
 */
export function coachPlayerName(seed: string, player: { readonly id: string; readonly name: string; readonly nationality: CountryCode }): string {
  if (player.name) return player.name;
  const key = player.id.startsWith("g:") ? player.id : `${seed}:${player.id}`;
  return generatedName(key, player.nationality);
}

/** Sobrenome para listas apertadas (o último nome do nome completo). */
export function coachShortName(seed: string, player: { readonly id: string; readonly name: string; readonly nationality: CountryCode }): string {
  const full = coachPlayerName(seed, player);
  const parts = full.split(" ");
  return parts.length > 1 ? (parts[parts.length - 1] ?? full) : full;
}

// ------------------------------------------------------------- conquistas

export interface CoachAchievement {
  readonly id: string;
  /** Só faz sentido com a carreira terminada. */
  readonly when: "anytime" | "end";
  readonly check: (career: CoachCareer) => boolean;
}

const seasons = (career: CoachCareer): readonly SeasonHistory[] => career.history.filter((entry) => !entry.partial);
const titles = (career: CoachCareer) => career.history.flatMap((entry) => entry.titles);
const isLeague = (title: string) => title.startsWith("league:");
const countryOf = (club: string) => getClub(club)?.country ?? null;

/** Liga da primeira divisão (o título `league:<id>` diz qual liga foi). */
const topLeague = (title: string) => isLeague(title) && getLeague(title.slice("league:".length))?.division === 1;

export const COACH_ACHIEVEMENTS: readonly CoachAchievement[] = [
  { id: "tecnico:firstSeason", when: "anytime", check: (career) => seasons(career).length >= 1 },
  { id: "tecnico:fullCareer", when: "end", check: (career) => career.ended?.reason === "completed" },
  { id: "tecnico:promotion", when: "anytime", check: (career) => career.history.some((entry) => entry.promoted) },
  { id: "tecnico:twoPromotions", when: "anytime", check: (career) => career.history.filter((entry) => entry.promoted).length >= 2 },
  { id: "tecnico:rescue", when: "anytime", check: (career) => career.history.some((entry) => entry.rescue) },
  { id: "tecnico:firstTitle", when: "anytime", check: (career) => titles(career).length >= 1 },
  {
    id: "tecnico:league",
    when: "anytime",
    check: (career) => career.history.some((entry) => entry.titles.some((title) => topLeague(title))),
  },
  { id: "tecnico:continental", when: "anytime", check: (career) => titles(career).some((title) => title.startsWith("cont1:")) },
  { id: "tecnico:clubWorldCup", when: "anytime", check: (career) => titles(career).includes("clubworldcup") },
  {
    id: "tecnico:underdogWorld",
    when: "anytime",
    check: (career) =>
      career.history.some((entry) => entry.titles.includes("clubworldcup") && getCountry(countryOf(entry.club) ?? "BRA")?.confederation !== "UEFA"),
  },
  {
    id: "tecnico:treble",
    when: "anytime",
    check: (career) =>
      career.history.some(
        (entry) =>
          entry.titles.some((title) => topLeague(title)) &&
          entry.titles.some((title) => title.startsWith("cup:")) &&
          entry.titles.some((title) => title.startsWith("cont1:")),
      ),
  },
  { id: "tecnico:tenTitles", when: "anytime", check: (career) => titles(career).length >= 10 },
  {
    id: "tecnico:fromBottom",
    when: "anytime",
    check: (career) =>
      career.history.some(
        (promotion, index) =>
          promotion.promoted &&
          career.history.slice(index + 1).some((later) => later.club === promotion.club && later.titles.some((title) => topLeague(title))),
      ),
  },
  {
    id: "tecnico:loyal",
    when: "anytime",
    check: (career) => {
      let streak = 0;
      let previous = "";
      for (const entry of seasons(career)) {
        streak = entry.club === previous ? streak + 1 : 1;
        previous = entry.club;
        if (streak >= 10) return true;
      }
      return false;
    },
  },
  {
    id: "tecnico:abroad",
    when: "anytime",
    check: (career) => career.history.some((entry) => countryOf(entry.club) !== career.setup.identity.nationality),
  },
  { id: "tecnico:threeCountries", when: "anytime", check: (career) => new Set(career.history.map((entry) => countryOf(entry.club))).size >= 3 },
  { id: "tecnico:revelations", when: "anytime", check: (career) => Object.values(career.legacy).filter((legacy) => legacy.revealed).length >= 5 },
  {
    id: "tecnico:comeback",
    when: "anytime",
    check: (career) => {
      const fired = career.history.findIndex((entry) => entry.dismissed);
      return fired >= 0 && career.history.slice(fired + 1).some((entry) => entry.titles.length > 0);
    },
  },
  { id: "tecnico:reputation", when: "anytime", check: (career) => career.reputation >= 90 },
];

export const TECNICO_ACHIEVEMENT_IDS: readonly string[] = COACH_ACHIEVEMENTS.map((achievement) => achievement.id);

/** Conquistas cumpridas agora (as `end` só com a carreira terminada). */
export function coachAchievementsMet(career: CoachCareer): string[] {
  return COACH_ACHIEVEMENTS.filter((achievement) => (achievement.when === "anytime" || career.ended) && achievement.check(career)).map(
    (achievement) => achievement.id,
  );
}

/** Nome e descrição de uma conquista do Técnico. */
export function coachAchievementText(locale: Locale, id: string): { name: string; description: string } {
  const key = id.replace(/^tecnico:/, "");
  return {
    name: coachText(locale, `achievements.${key}.name`),
    description: coachText(locale, `achievements.${key}.description`),
  };
}
