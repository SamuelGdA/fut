"use client";

import { LOCALES, useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full border border-card-border bg-card/60 p-1">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-label={l.label}
          title={l.label}
          className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
            locale === l.code ? "bg-foreground text-background" : "text-muted-2 hover:text-foreground"
          }`}
        >
          {l.code}
        </button>
      ))}
    </div>
  );
}
