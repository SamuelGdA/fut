"use client";

import { forwardRef, useMemo } from "react";
import { countryName, useI18n } from "@/lib/i18n/context";
import { PlayerFcCard } from "@/components/PlayerFcCard";
import { Flag } from "@/components/Media";
import { generateBiography } from "@/lib/bio/generate";
import { computeOverall } from "@/lib/sim/attributes";
import { BRAND_COPY } from "@/lib/brandCopy";
import type { AvatarConfig } from "@/lib/avatar/config";
import type { CareerState } from "@/lib/sim/career";

/**
 * The layout that gets rasterised into a shareable PNG — deliberately not the
 * on-screen summary.
 *
 * The screen version is a responsive dashboard built to fit a viewport; an
 * image that people post is a fixed-width portrait that has to be readable on
 * a phone at a glance. So this is its own composition: the card, who the
 * player was, and the written career, and nothing that only makes sense when
 * you can click it.
 *
 * Rendered off-screen rather than hidden, because the exporter reads computed
 * styles — `display: none` would give it nothing to copy.
 */
export const ShareableSummary = forwardRef<HTMLDivElement, {
  career: CareerState;
  avatar: AvatarConfig | null;
}>(function ShareableSummary({ career, avatar }, ref) {
  const { t, locale } = useI18n();
  const brand = BRAND_COPY[locale];

  const peakSeason = career.seasons.reduce(
    (best, s) => (s.overall > best.overall ? s : best),
    career.seasons[0] ?? null,
  );
  const peakAttributes = peakSeason?.attributes ?? career.player.attributes;
  const peakOvr = peakSeason
    ? Math.round(computeOverall(peakAttributes, career.player.position))
    : career.player.overall;

  const positionLabel = t(`positionsFull.${career.player.position}`);
  const bio = useMemo(
    () => generateBiography(career, locale, positionLabel),
    [career, locale, positionLabel],
  );

  const country = career.player.nationality;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-[-300vw] w-[720px] bg-[#0a0f1a] px-10 py-9"
    >
      <div className="flex flex-col items-center text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
          {t("career.summaryTitle")}
        </p>
        <h1 className="mt-1.5 font-display text-4xl font-black tracking-tight text-foreground">
          {career.identity.lastName}
        </h1>
        <div className="mt-1.5 flex items-center justify-center gap-2 text-sm text-muted">
          <Flag src={country.flag_url} alt={countryName(country, locale)} className="h-4 w-6" />
          <span>{countryName(country, locale)}</span>
          <span className="text-muted-2">·</span>
          <span>{positionLabel}</span>
        </div>

        <div className="mt-5">
          <PlayerFcCard
            size="lg"
            data={{
              overall: peakOvr,
              position: career.player.position,
              attributes: peakAttributes,
              lastName: career.identity.lastName,
              number: peakSeason?.shirtNumber ?? career.shirtNumber,
              country,
              teamId: peakSeason?.teamId ?? null,
              avatar,
            }}
          />
        </div>
        <p className="mt-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-2">
          {brand.peakLabel}
        </p>
      </div>

      <div className="mt-7 border-t border-line pt-6">
        {bio.paragraphs.map((paragraph) => (
          <p
            key={paragraph.chapter}
            className="mb-3 text-[15px] leading-relaxed text-muted last:mb-0"
          >
            {paragraph.sentences.join(" ")}
          </p>
        ))}
      </div>

      <p className="mt-8 text-center text-[11px] font-black uppercase tracking-[0.3em] text-muted-2">
        CRAQUE
      </p>
    </div>
  );
});
