"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { injuryName } from "@/lib/data/injuryNames";
import type { Headline } from "@/lib/sim/career";

const TONE_STYLE: Record<Headline["tone"], string> = {
  good: "border-l-pitch",
  bad: "border-l-danger",
  neutral: "border-l-line",
};

/**
 * A glyph beside the stripe, because a 2px coloured border is exactly the kind
 * of cue that disappears for a colour-blind reader — and it reads faster for
 * everyone else too.
 */
const TONE_GLYPH: Record<Headline["tone"], string> = {
  good: "▲",
  bad: "▼",
  neutral: "•",
};

const TONE_TEXT: Record<Headline["tone"], string> = {
  good: "text-pitch",
  bad: "text-danger",
  neutral: "text-muted-2",
};

type ToneFilter = "all" | Headline["tone"];

const FILTERS: ToneFilter[] = ["all", "good", "bad"];

/**
 * The back pages of the career.
 *
 * Two shapes from one component. `rail` is the live side panel: newest first,
 * no chrome, so the thing that just happened is the thing you read. `archive`
 * is the end-of-career version, where the feed stops being a ticker and
 * becomes something to browse — oldest first so it reads as a story, grouped
 * by age, and filterable when a decorated career runs to a hundred lines.
 */
export function HeadlinesFeed({
  headlines,
  variant = "rail",
}: {
  headlines: Headline[];
  variant?: "rail" | "archive";
}) {
  const { t, locale } = useI18n();
  const archive = variant === "archive";
  const [tone, setTone] = useState<ToneFilter>("all");
  const [oldestFirst, setOldestFirst] = useState(true);

  // The sim stores an injury as its raw key, since it has no idea what
  // language the page is in — resolve it to a readable name here.
  const localise = (headline: Headline): Record<string, string> =>
    headline.vars.injury
      ? { ...headline.vars, injury: injuryName(locale, headline.vars.injury) }
      : headline.vars;

  const shown = useMemo(() => {
    if (!archive) return [...headlines].reverse();
    const filtered = tone === "all" ? headlines : headlines.filter((h) => h.tone === tone);
    return oldestFirst ? filtered : [...filtered].reverse();
  }, [archive, headlines, tone, oldestFirst]);

  // Counts drive the filter chips, so a career with no bad years says so
  // instead of offering a filter that leads to an empty list.
  const counts = useMemo(
    () => ({
      all: headlines.length,
      good: headlines.filter((h) => h.tone === "good").length,
      bad: headlines.filter((h) => h.tone === "bad").length,
      neutral: headlines.filter((h) => h.tone === "neutral").length,
    }),
    [headlines],
  );

  return (
    <section className="panel flex h-full min-h-0 flex-col p-3">
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2" title={t("career.hints.headlines")}>
          {t("career.headlinesTitle")}
          {archive && headlines.length > 0 && (
            <span className="ml-1.5 font-mono text-[10px] text-muted-2/70">{headlines.length}</span>
          )}
        </h2>

        {archive && headlines.length > 1 && (
          <div className="flex items-center gap-1">
            {FILTERS.filter((f) => counts[f] > 0).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTone(f)}
                aria-pressed={tone === f}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  tone === f
                    ? "border-pitch/60 bg-pitch/15 text-pitch"
                    : "border-line bg-surface-2/60 text-muted-2 hover:text-fg"
                }`}
              >
                {f !== "all" && (
                  <span className="mr-0.5" aria-hidden>
                    {TONE_GLYPH[f]}
                  </span>
                )}
                {t(`career.headlineFilter.${f}`)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOldestFirst((v) => !v)}
              className="rounded-full border border-line bg-surface-2/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-2 transition-colors hover:text-fg"
            >
              {t(oldestFirst ? "career.headlineOrderOldest" : "career.headlineOrderNewest")}
            </button>
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="text-xs italic text-muted-2">{t("career.headlinesEmpty")}</p>
      ) : (
        <ul className="scrollbar-thin -mr-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {shown.map((headline, i) => {
            // In the archive, an age only gets announced once — the run of
            // lines under it all belong to that season.
            const newAge = archive && shown[i - 1]?.age !== headline.age;
            return (
              <li key={headline.id}>
                {newAge && (
                  <p className="mb-1 mt-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-muted-2 first:mt-0">
                    {t("career.celebrationAt", { age: headline.age })}
                  </p>
                )}
                <div
                  className={`animate-fade-in rounded-r-md border-l-2 bg-surface-2/40 py-1.5 pl-2.5 pr-2 ${TONE_STYLE[headline.tone]}`}
                >
                  {/* break-words: a long unbroken club name (Mönchengladbach,
                      Kaiserslautern) otherwise refuses to wrap and spills past
                      the card instead. */}
                  <p className="break-words text-[11px] leading-snug">
                    <span className={`mr-1 text-[9px] font-black ${TONE_TEXT[headline.tone]}`} aria-hidden>
                      {TONE_GLYPH[headline.tone]}
                    </span>
                    {t(`headlines.${headline.key}`, localise(headline))}
                  </p>
                  {!archive && (
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-2">
                      {t("career.celebrationAt", { age: headline.age })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
