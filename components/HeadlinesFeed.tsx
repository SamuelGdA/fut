"use client";

import { useI18n } from "@/lib/i18n/context";
import { injuryName } from "@/lib/data/injuryNames";
import type { Headline } from "@/lib/sim/career";

const TONE_STYLE: Record<Headline["tone"], string> = {
  good: "border-l-pitch",
  bad: "border-l-danger",
  neutral: "border-l-line",
};

/**
 * The back pages of the career. Purely cosmetic, but it turns a column of
 * numbers into a story you can scroll back through — newest first, so the thing
 * that just happened is the thing you read.
 */
export function HeadlinesFeed({ headlines }: { headlines: Headline[] }) {
  const { t, locale } = useI18n();
  const newestFirst = [...headlines].reverse();

  // The sim stores an injury as its raw key, since it has no idea what
  // language the page is in — resolve it to a readable name here.
  const localise = (headline: Headline): Record<string, string> =>
    headline.vars.injury
      ? { ...headline.vars, injury: injuryName(locale, headline.vars.injury) }
      : headline.vars;

  return (
    <section className="panel flex h-full min-h-0 flex-col p-3">
      <h2 className="mb-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
        {t("career.headlinesTitle")}
      </h2>

      {newestFirst.length === 0 ? (
        <p className="text-xs italic text-muted-2">{t("career.headlinesEmpty")}</p>
      ) : (
        <ul className="scrollbar-thin -mr-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {newestFirst.map((headline) => (
            <li
              key={headline.id}
              className={`animate-fade-in rounded-r-md border-l-2 bg-surface-2/40 py-1.5 pl-2.5 pr-2 ${TONE_STYLE[headline.tone]}`}
            >
              <p className="text-[11px] leading-snug">
                {t(`headlines.${headline.key}`, localise(headline))}
              </p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-2">
                {t("career.celebrationAt", { age: headline.age })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
