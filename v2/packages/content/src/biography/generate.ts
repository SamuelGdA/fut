import { type Career, stream } from "@craque/engine";
import { getCompetition } from "@craque/world";
import { interpolate, type Locale, pluralForm, type Vars } from "../i18n";
import { bioEn } from "../locales/bio.en";
import { bioEs } from "../locales/bio.es";
import { type BioMessages, bioPt } from "../locales/bio.pt";
import { REAL_RECORDS, recordText } from "../records";
import { careerText, clubName, displayName } from "../text";
import { bioFacts, type BioFacts } from "./facts";
import { CHAPTER_CAPS, CHAPTERS, type ChapterId, type CountKey, THEMES, type ThemeId, type Words } from "./themes";

/**
 * A biografia (GDD 25), montada em passos:
 *
 * 1. cada tema lê os fatos e diz se vale contar (saliência), com idade e
 *    variáveis;
 * 2. de cada grupo de temas que dizem a mesma coisa, fica só o mais saliente;
 * 3. linhas com idade vão para o capítulo cuja faixa etária desta carreira as
 *    contém; o Legado nunca é refilado;
 * 4. cada capítulo fica com as mais salientes até o limite, na ordem da idade;
 * 5. de cada tema sai a redação que menos repete palavras já usadas no
 *    artigo (nomes de clube e de pessoa não contam) e que não começa como a
 *    frase anterior ("Aos 19, ... Aos 19, ..." soa como lista).
 *
 * Empates vão para o sorteio no fluxo `bio`, que inclui o idioma: a mesma
 * carreira conta a mesma história, e cada idioma pode escolher outra redação.
 */

export const BIO_TEXTS: Readonly<Record<Locale, BioMessages>> = { pt: bioPt, es: bioEs, en: bioEn };

export interface BioChapter {
  readonly id: ChapterId;
  readonly title: string;
  readonly lines: readonly string[];
}

export interface Biography {
  readonly chapters: readonly BioChapter[];
  /** Os temas escolhidos, na ordem do artigo (para testes e para o laboratório). */
  readonly themes: readonly ThemeId[];
}

interface Picked {
  readonly id: ThemeId;
  readonly chapter: ChapterId;
  readonly salience: number;
  readonly age: number | null;
  readonly vars: Vars;
  /** Sorteio fixo do tema, para desempatar sem depender da ordem do código. */
  readonly tie: number;
}

function wordsFor(locale: Locale, texts: BioMessages): Words {
  return {
    club: (id) => clubName(id),
    competition: (id) => getCompetition(id)?.names[locale] ?? id,
    injury: (type) => careerText(locale, `injuries.${type}`),
    record: (id) => {
      const record = REAL_RECORDS.find((candidate) => candidate.id === id);
      return record ? recordText(locale, record).name : id;
    },
    count: (key: CountKey, count: number) => interpolate(pluralForm(locale, texts.counts[key], count), { count }),
  };
}

/** Faixas de idade dos capítulos desta carreira: [início do Ascensão, do Auge, da Reta final]. */
function chapterBounds(facts: BioFacts): readonly [number, number, number] {
  const rise = Math.max(facts.firstAge + 1, facts.breakthrough?.age ?? facts.earlyStarter?.age ?? Math.min(20, facts.lastAge));
  const peakStart = Math.max(rise, facts.peakWindow?.[0] ?? rise);
  const lateStart = Math.max(peakStart + 1, (facts.peakWindow?.[1] ?? peakStart) + 1);
  return [rise, peakStart, lateStart];
}

function chapterOf(age: number, bounds: readonly [number, number, number]): ChapterId {
  if (age < bounds[0]) return "origin";
  if (age < bounds[1]) return "rise";
  if (age < bounds[2]) return "peak";
  return "late";
}

function contentWords(text: string, stopwords: ReadonlySet<string>, ignored: ReadonlySet<string>): string[] {
  return text
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 4 && !stopwords.has(word) && !ignored.has(word));
}

export function biography(locale: Locale, career: Career): Biography {
  const texts = BIO_TEXTS[locale];
  const facts = bioFacts(career);
  const words = wordsFor(locale, texts);
  const bounds = chapterBounds(facts);
  const random = (...parts: Array<string | number>) => stream(facts.seed, "bio", locale, ...parts).next();

  // 1. Os temas que valem contar.
  const candidates: Picked[] = [];
  for (const id of Object.keys(THEMES) as ThemeId[]) {
    const theme = THEMES[id];
    const read = theme.read(facts, words);
    if (!read || read.salience <= 0) continue;
    // 3. Linhas com idade vão para o capítulo da idade; o Legado fica onde está.
    const chapter = theme.chapter !== "legacy" && read.age !== null ? chapterOf(read.age, bounds) : theme.chapter;
    candidates.push({ id, chapter, salience: read.salience, age: read.age, vars: { surname: displayName(facts.surname, locale), ...read.vars }, tie: random("tema", id) });
  }

  // 2. Um tema por grupo.
  const byGroup = new Map<string, Picked>();
  for (const candidate of candidates) {
    const group = THEMES[candidate.id].group;
    const current = byGroup.get(group);
    if (!current || candidate.salience > current.salience || (candidate.salience === current.salience && candidate.tie > current.tie)) {
      byGroup.set(group, candidate);
    }
  }
  const kept = [...byGroup.values()];

  // 4. Limite por capítulo, os mais salientes; depois, a ordem da idade.
  const chosen = new Map<ChapterId, Picked[]>();
  for (const chapter of CHAPTERS) {
    const lines = kept
      .filter((candidate) => candidate.chapter === chapter)
      .sort((a, b) => b.salience - a.salience || b.tie - a.tie)
      .slice(0, CHAPTER_CAPS[chapter])
      .sort((a, b) => (a.age ?? Number.POSITIVE_INFINITY) - (b.age ?? Number.POSITIVE_INFINITY) || b.salience - a.salience);
    chosen.set(chapter, lines);
  }

  // 5. A redação que menos repete o que o artigo já disse.
  const stopwords = new Set(texts.stopwords.split(" "));
  const used = new Set<string>();
  let previousOpening = "";
  const order: ThemeId[] = [];
  const chapters: BioChapter[] = [];
  for (const chapter of CHAPTERS) {
    const lines: string[] = [];
    for (const picked of chosen.get(chapter) ?? []) {
      const variants = texts.themes[picked.id];
      // Valores das variáveis (clube, rival, competição) não contam como repetição.
      const ignored = new Set(Object.values(picked.vars).flatMap((value) => contentWords(String(value), new Set(), new Set())));
      let best = 0;
      let bestScore = Number.POSITIVE_INFINITY;
      let bestTie = -1;
      variants.forEach((variant, index) => {
        const sameOpening = opening(interpolate(variant, picked.vars), locale) === previousOpening ? OPENING_PENALTY : 0;
        const repeated = contentWords(variant, stopwords, ignored).filter((word) => used.has(word)).length + sameOpening;
        const tie = random("redação", picked.id, index);
        if (repeated < bestScore || (repeated === bestScore && tie > bestTie)) {
          best = index;
          bestScore = repeated;
          bestTie = tie;
        }
      });
      const template = variants[best] ?? variants[0] ?? "";
      for (const word of contentWords(template, stopwords, ignored)) used.add(word);
      const line = capitalize(interpolate(template, picked.vars), locale);
      previousOpening = opening(line, locale);
      lines.push(line);
      order.push(picked.id);
    }
    if (lines.length > 0) chapters.push({ id: chapter, title: texts.chapters[chapter], lines });
  }
  return { chapters, themes: order };
}

/** Repetir o começo da frase anterior pesa como duas palavras repetidas. */
const OPENING_PENALTY = 2;

/** As duas primeiras palavras da frase, para comparar começos. */
function opening(text: string, locale: Locale): string {
  return text.toLocaleLowerCase(locale).split(/[^\p{L}\p{N}]+/u).filter(Boolean).slice(0, 2).join(" ");
}

/** Frase que começa com um número ou com um nome já sai certa; com letra minúscula, sobe. */
function capitalize(text: string, locale: Locale): string {
  const first = text.charAt(0);
  return first.toLocaleUpperCase(locale) + text.slice(1);
}
