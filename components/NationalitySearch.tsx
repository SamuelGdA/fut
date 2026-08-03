"use client";

import { useMemo, useState } from "react";
import { COUNTRIES } from "@/lib/data/dataset";
import { countryName, useI18n } from "@/lib/i18n/context";
import { Flag } from "./Media";

const INITIAL_VISIBLE = 24;

export function NationalitySearch({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (iso: string) => void;
}) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const sorted = useMemo(
    () =>
      [...COUNTRIES]
        .filter((c) => c.iso_alpha2)
        .sort((a, b) => countryName(a, locale).localeCompare(countryName(b, locale), locale)),
    [locale],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => countryName(c, locale).toLowerCase().includes(q));
  }, [sorted, query, locale]);

  const visible = expanded || query ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const showMore = !query && !expanded && filtered.length > INITIAL_VISIBLE;

  return (
    <div>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-2">{t("identity.nationalityTitle")}</h2>

      <div className="relative mb-2.5">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.34-4.34" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("identity.nationalitySearchPlaceholder")}
          className="w-full rounded-full border border-line bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-2 focus:outline-none focus:ring-1 focus:ring-pitch"
        />
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-2">{t("identity.nationalityEmpty")}</p>
      ) : (
        <div className="scrollbar-thin grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
          {visible.map((c) => {
            const selected = value === c.iso_alpha2;
            return (
              <button
                key={c.iso_alpha2}
                type="button"
                onClick={() => onChange(c.iso_alpha2)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                  selected ? "bg-foreground text-background" : "text-muted hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Flag src={c.flag_url} alt={countryName(c, locale)} className="h-3.5 w-5 shrink-0" />
                <span className="truncate">{countryName(c, locale)}</span>
              </button>
            );
          })}
        </div>
      )}

      {showMore && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2.5 w-full rounded-lg border border-line py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-2 transition-colors hover:text-foreground"
        >
          {t("identity.showMoreCountries")}
        </button>
      )}
    </div>
  );
}
