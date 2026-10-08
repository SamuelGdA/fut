import { type Country, type CountryCode, COUNTRIES, PLAYABLE_COUNTRIES } from "@craque/world";
import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { foldText, INTL_LOCALE } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Flag } from "../../ui/Media";

interface NationalityPickerProps {
  value: CountryCode | null;
  onValueChange(code: CountryCode): void;
}

const PLAYABLE: ReadonlySet<string> = new Set(PLAYABLE_COUNTRIES);

/**
 * Nacionalidade (GDD 6.2): os 211 países, busca sem acento, ordem alfabética
 * no idioma atual e, no topo, os países com liga jogável.
 */
export function NationalityPicker({ value, onValueChange }: NationalityPickerProps) {
  const { t, locale } = useT();
  const [query, setQuery] = useState("");
  const inputId = useId();

  const sorted = useMemo(() => {
    const collator = new Intl.Collator(INTL_LOCALE[locale]);
    return [...COUNTRIES].sort((a, b) => collator.compare(a.names[locale], b.names[locale]));
  }, [locale]);

  const folded = foldText(query);
  const matches = (country: Country) =>
    folded.length === 0 || foldText(country.names[locale]).includes(folded) || country.code.toLowerCase() === folded;
  const suggested = sorted.filter((country) => PLAYABLE.has(country.code) && matches(country));
  const rest = sorted.filter((country) => (folded.length > 0 || !PLAYABLE.has(country.code)) && matches(country));
  const list = folded.length > 0 ? rest : null;

  const pick = (code: CountryCode) => {
    if (code !== value) feedback("select");
    onValueChange(code);
  };

  const row = (country: Country) => (
    <button
      key={country.code}
      type="button"
      role="option"
      aria-selected={country.code === value}
      className="country-row"
      onClick={() => pick(country.code)}
    >
      <Flag country={country} size={20} language={locale} decorative />
      <span className="min-w-0 flex-1 truncate">{country.names[locale]}</span>
      <span className="numeric text-xs opacity-70">{country.code}</span>
    </button>
  );

  return (
    <div className="nation-picker">
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          {t("identity.search")}
        </label>
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("identity.search")}
          autoComplete="off"
          spellCheck={false}
          className="search-input"
        />
      </div>
      <div className="country-list" role="listbox" aria-label={t("identity.nationality")}>
        {list ? (
          list.length > 0 ? (
            list.map(row)
          ) : (
            <p className="p-4 text-sm text-muted">{t("identity.searchEmpty")}</p>
          )
        ) : (
          <>
            <p className="eyebrow sticky top-0 z-[1] border-b border-line bg-panel-2 px-3 py-2">{t("identity.suggested")}</p>
            {suggested.map(row)}
            <p className="eyebrow sticky top-0 z-[1] border-b border-line bg-panel-2 px-3 py-2">{t("identity.allCountries")}</p>
            {rest.map(row)}
          </>
        )}
      </div>
    </div>
  );
}
