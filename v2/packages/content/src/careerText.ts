import { formatDecimal, interpolate, isPlural, type Locale, lookup, pluralForm, type PluralKey, type TextKey, type Vars } from "./i18n";
import { careerEn } from "./locales/career.en";
import { careerEs } from "./locales/career.es";
import { type CareerMessages, careerPt } from "./locales/career.pt";

/**
 * Os textos curtos da carreira (posições, papéis, missões, efeitos, avisos),
 * sem motor e sem eventos. A casca do jogo usa isto desde o primeiro desenho,
 * então fica num módulo próprio (`@craque/content/career-text`): os textos dos
 * 42 eventos e o motor só chegam quando a carreira abre.
 */

export const CAREER_TEXTS: Readonly<Record<Locale, CareerMessages>> = { pt: careerPt, es: careerEs, en: careerEn };

export type CareerKey = TextKey<CareerMessages>;
export type CareerPluralKey = PluralKey<CareerMessages>;

/** Texto da carreira. Falta no idioma: português. Falta também lá: a própria chave. */
export function careerText(locale: Locale, key: CareerKey, vars?: Vars): string {
  const own = lookup(CAREER_TEXTS[locale], key);
  if (typeof own === "string") return interpolate(own, vars);
  const fallback = lookup(CAREER_TEXTS.pt, key);
  return typeof fallback === "string" ? interpolate(fallback, vars) : key;
}

/** Texto com plural. `{count}` recebe o número formatado no idioma. */
export function careerPlural(locale: Locale, key: CareerPluralKey, count: number, vars?: Vars): string {
  const own = lookup(CAREER_TEXTS[locale], key);
  const entry = isPlural(own) ? own : lookup(CAREER_TEXTS.pt, key);
  if (!isPlural(entry)) return key;
  return interpolate(pluralForm(locale, entry, count), { count: formatDecimal(count, locale, 0), ...vars });
}
