import { type CareerKey, type CareerPluralKey, careerPlural, careerText } from "@craque/content/career-text";
import { usePrefs } from "../store/prefs";
import { formatMoney, formatNumber, formatOrdinal, formatPercent, upperName } from "./format";
import {
  type MessageKey,
  type MessagePluralKey,
  translate,
  translatePlural,
} from "./translate";
import type { Locale, Vars } from "./types";

export interface Translator {
  locale: Locale;
  t(key: MessageKey, vars?: Vars): string;
  tp(key: MessagePluralKey, count: number, vars?: Vars): string;
  /** Texto de jogo do pacote de conteúdo (posições, papéis, missões, eventos). */
  c(key: CareerKey, vars?: Vars): string;
  cp(key: CareerPluralKey, count: number, vars?: Vars): string;
  number(value: number, options?: Intl.NumberFormatOptions): string;
  percent(ratio: number): string;
  money(euros: number): string;
  ordinal(value: number): string;
  upper(name: string): string;
}

export function makeTranslator(locale: Locale): Translator {
  return {
    locale,
    t: (key, vars) => translate(locale, key, vars),
    tp: (key, count, vars) => translatePlural(locale, key, count, vars),
    c: (key, vars) => careerText(locale, key, vars),
    cp: (key, count, vars) => careerPlural(locale, key, count, vars),
    number: (value, options) => formatNumber(value, locale, options),
    percent: (ratio) => formatPercent(ratio, locale),
    money: (euros) => formatMoney(euros, locale),
    ordinal: (value) => formatOrdinal(value, locale),
    upper: (name) => upperName(name, locale),
  };
}

/** Tradutor do idioma atual. Troca de idioma re-renderiza quem usa. */
export function useT(): Translator {
  const locale = usePrefs((state) => state.locale);
  return makeTranslator(locale);
}
