"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import localesJson from "./locales.json";

export type Locale = "es" | "en" | "pt";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];

/** The locale bundle is the one shipped by the original game, kept verbatim. */
type LocaleTree = Record<string, unknown>;
const locales = localesJson as unknown as Record<Locale, LocaleTree>;

function lookup(tree: LocaleTree, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object") return (node as Record<string, unknown>)[key];
    return undefined;
  }, tree);
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a dot path, interpolating `{placeholders}`. */
  t: (path: string, vars?: Record<string, string | number>) => string;
  /** Read an arbitrary node (objects/arrays) from the locale tree. */
  raw: <T = unknown>(path: string) => T | undefined;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pt");

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) => {
      const value = lookup(locales[locale], path) ?? lookup(locales.es, path);
      if (typeof value !== "string") return path;
      if (!vars) return value;
      return value.replace(/\{(\w+)\}/g, (match, key) =>
        vars[key] !== undefined ? String(vars[key]) : match,
      );
    },
    [locale],
  );

  const raw = useCallback(
    <T,>(path: string) => (lookup(locales[locale], path) ?? lookup(locales.es, path)) as T | undefined,
    [locale],
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t, raw }), [locale, t, raw]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Country names are stored per-locale on the country record itself. */
export function countryName(
  country: { name_en: string; name_es: string; name_pt: string },
  locale: Locale,
): string {
  if (locale === "en") return country.name_en;
  if (locale === "pt") return country.name_pt;
  return country.name_es;
}
