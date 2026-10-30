import { usePrefs } from "../../store/prefs";
import { formatNumber } from "../format";
import { interpolate, lookup } from "../translate";
import type { Locale, Plural, PluralKey, TextKey, Vars } from "../types";
import { makeTranslator, type Translator } from "../useT";
import { contaEn } from "./en";
import { contaEs } from "./es";
import { type ContaMessages, contaPt } from "./pt";

/**
 * Tradutor das telas de conta e das páginas legais (D112 e D113): o
 * dicionário delas (`ct`, `ctp`) e o tradutor comum (`t`). Só essas telas
 * importam este módulo; o hub e os jogos não baixam estes textos.
 */

export const CONTA_DICTIONARIES: Readonly<Record<Locale, ContaMessages>> = { pt: contaPt, es: contaEs, en: contaEn };

export type ContaKey = TextKey<ContaMessages>;
export type ContaPluralKey = PluralKey<ContaMessages>;

function isPlural(value: unknown): value is Plural {
  return typeof value === "object" && value !== null && typeof (value as Plural).one === "string" && typeof (value as Plural).other === "string";
}

export function contaText(locale: Locale, key: ContaKey, vars?: Vars): string {
  const own = lookup(CONTA_DICTIONARIES[locale], key);
  if (typeof own === "string") return interpolate(own, vars);
  const fallback = lookup(CONTA_DICTIONARIES.pt, key);
  return typeof fallback === "string" ? interpolate(fallback, vars) : key;
}

export function contaPlural(locale: Locale, key: ContaPluralKey, count: number, vars?: Vars): string {
  const own = lookup(CONTA_DICTIONARIES[locale], key);
  const entry = isPlural(own) ? own : lookup(CONTA_DICTIONARIES.pt, key);
  if (!isPlural(entry)) return key;
  const rule = new Intl.PluralRules(locale).select(count);
  const template = count === 0 && entry.zero !== undefined ? entry.zero : rule === "one" ? entry.one : entry.other;
  return interpolate(template, { count: formatNumber(count, locale), ...vars });
}

export interface ContaTranslator extends Translator {
  ct(key: ContaKey, vars?: Vars): string;
  ctp(key: ContaPluralKey, count: number, vars?: Vars): string;
}

export function useContaT(): ContaTranslator {
  const locale = usePrefs((state) => state.locale);
  return {
    ...makeTranslator(locale),
    ct: (key, vars) => contaText(locale, key, vars),
    ctp: (key, count, vars) => contaPlural(locale, key, count, vars),
  };
}

/** As seções de uma página legal, na ordem do dicionário. */
export function legalSections(locale: Locale, doc: "terms" | "privacy"): { id: string; title: string; body: string[] }[] {
  const sections = CONTA_DICTIONARIES[locale][doc].sections as Readonly<Record<string, { readonly title: string; readonly body: string }>>;
  return Object.entries(sections).map(([id, section]) => ({ id, title: section.title, body: section.body.split("\n\n") }));
}
