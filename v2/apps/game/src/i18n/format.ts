import type { Locale } from "./types";

/** Locale do Intl para cada idioma do jogo. */
export const INTL_LOCALE: Readonly<Record<Locale, string>> = {
  pt: "pt-BR",
  es: "es-ES",
  en: "en-GB",
};

/** Valor do atributo `lang` do documento para cada idioma. */
export const HTML_LANG: Readonly<Record<Locale, string>> = {
  pt: "pt-BR",
  es: "es",
  en: "en",
};

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], options).format(value);
}

export function formatPercent(ratio: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(ratio);
}

/**
 * Valor de mercado em euros, no formato curto do jogo (GDD 9.10):
 * "€180M", "€12,5M" (pt, es) ou "€12.5M" (en); abaixo de um milhão,
 * "€850 mil" (pt) ou "€850K" (es, en).
 */
export function formatMoney(euros: number, locale: Locale): string {
  const value = Math.max(0, euros);
  const thousands = Math.round(value / 1000);

  if (thousands < 1000) {
    const k = formatNumber(thousands, locale);
    return locale === "pt" ? `€${k} mil` : `€${k}K`;
  }

  const millions = value / 1_000_000;
  const digits = millions < 100 ? 1 : 0;
  const m = formatNumber(millions, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  return `€${m}M`;
}

/** Ordinal curto: "3º" em português e espanhol, "3rd" em inglês. */
export function formatOrdinal(value: number, locale: Locale): string {
  if (locale !== "en") return `${value}º`;
  const tens = value % 100;
  if (tens >= 11 && tens <= 13) return `${value}th`;
  const suffix = value % 10 === 1 ? "st" : value % 10 === 2 ? "nd" : value % 10 === 3 ? "rd" : "th";
  return `${value}${suffix}`;
}

/** Sobrenome em maiúsculas pela regra do idioma, sem espaços nas pontas. */
export function upperName(name: string, locale: Locale): string {
  return name.trim().toLocaleUpperCase(INTL_LOCALE[locale]);
}

/** Compara textos sem acento e sem caixa, para buscas como a de países. */
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Um dia do desafio (`AAAA-MM-DD`, UTC) no jeito do idioma: "2 de outubro",
 * "2 de octubre", "2 October". Lido em UTC, então o dia nunca escorrega pelo
 * fuso de quem joga.
 */
export function formatChallengeDay(id: string, locale: Locale, withYear = false): string {
  const [year, month, day] = id.split("-").map(Number);
  const instant = Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1);
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(instant);
}

/** Uma data guardada (milissegundos desde a época), curta e no fuso de quem joga: "02/10/2026". */
export function formatShortDate(instant: number, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "2-digit", month: "2-digit", year: "numeric" }).format(instant);
}

/** Contagem regressiva em horas, minutos e segundos: "05:12:33". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
