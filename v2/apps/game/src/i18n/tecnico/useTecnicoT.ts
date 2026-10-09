import { coachText } from "@craque/content/coach";
import { usePrefs } from "../../store/prefs";
import { lookup, interpolate } from "../translate";
import type { Locale, Plural, PluralKey, TextKey, Vars } from "../types";
import { formatNumber } from "../format";
import { makeTranslator, type Translator } from "../useT";
import { tecnicoEn } from "./en";
import { tecnicoEs } from "./es";
import { type TecnicoMessages, tecnicoPt } from "./pt";

/**
 * Tradutor do Técnico: o dicionário da interface do Técnico (`tt`, `ttp`),
 * os textos de jogo do pacote de conteúdo (`g`) e o tradutor comum (`t`,
 * dinheiro, números). Só as telas do Técnico importam este módulo.
 */

export const TECNICO_DICTIONARIES: Readonly<Record<Locale, TecnicoMessages>> = { pt: tecnicoPt, es: tecnicoEs, en: tecnicoEn };

export type TecnicoKey = TextKey<TecnicoMessages>;
export type TecnicoPluralKey = PluralKey<TecnicoMessages>;

function isPlural(value: unknown): value is Plural {
  return typeof value === "object" && value !== null && typeof (value as Plural).one === "string" && typeof (value as Plural).other === "string";
}

export function tecnicoText(locale: Locale, key: TecnicoKey, vars?: Vars): string {
  const own = lookup(TECNICO_DICTIONARIES[locale], key);
  if (typeof own === "string") return interpolate(own, vars);
  const fallback = lookup(TECNICO_DICTIONARIES.pt, key);
  return typeof fallback === "string" ? interpolate(fallback, vars) : key;
}

export function tecnicoPlural(locale: Locale, key: TecnicoPluralKey, count: number, vars?: Vars): string {
  const own = lookup(TECNICO_DICTIONARIES[locale], key);
  const entry = isPlural(own) ? own : lookup(TECNICO_DICTIONARIES.pt, key);
  if (!isPlural(entry)) return key;
  const rule = new Intl.PluralRules(locale).select(count);
  const template = count === 0 && entry.zero !== undefined ? entry.zero : rule === "one" ? entry.one : entry.other;
  return interpolate(template, { count: formatNumber(count, locale), ...vars });
}

export interface TecnicoTranslator extends Translator {
  tt(key: TecnicoKey, vars?: Vars): string;
  ttp(key: TecnicoPluralKey, count: number, vars?: Vars): string;
  /** Texto de jogo do Técnico (eventos, conversas, motivos), pelo caminho do dicionário de conteúdo. */
  g(key: string, vars?: Vars): string;
}

export function makeTecnicoTranslator(locale: Locale): TecnicoTranslator {
  return {
    ...makeTranslator(locale),
    tt: (key, vars) => tecnicoText(locale, key, vars),
    ttp: (key, count, vars) => tecnicoPlural(locale, key, count, vars),
    g: (key, vars) => coachText(locale, key, vars),
  };
}

export function useTecnicoT(): TecnicoTranslator {
  const locale = usePrefs((state) => state.locale);
  return makeTecnicoTranslator(locale);
}
