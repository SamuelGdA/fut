"use client";

import { countryName, useI18n } from "@/lib/i18n/context";
import { Flag, PositionIcons } from "./Media";
import type { CareerState } from "@/lib/sim/career";

export function NationalTeamFooter({ career }: { career: CareerState }) {
  const { t, locale } = useI18n();
  const country = career.player.nationality;
  const stats = career.nationalTeamStats;
  const isGk = career.player.role === "goalkeeper";
  const capped = stats.caps > 0;

  return (
    <div
      className="sticky bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur"
      title={t("career.hints.nationalTeam")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          {/* A national side is its flag — no federation crest beside it. */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2/50 ring-1 ring-inset ring-black/25">
            <Flag src={country.flag_url} alt={countryName(country, locale)} dim={!capped} className="h-full w-full object-cover" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-2">
              {t("career.nationalTeam")}
              <PositionIcons />
            </p>
            <p className="text-sm font-semibold">{countryName(country, locale)}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-center">
          <Item label={t("career.appearances")} value={stats.caps} />
          {isGk ? (
            <>
              <Item label={t("career.cleanSheets")} value={stats.cleanSheets} />
              <Item label={t("career.goalsConceded")} value={stats.goalsConceded} />
            </>
          ) : (
            <>
              <Item label={t("career.goals")} value={stats.goals} />
              <Item label={t("career.assists")} value={stats.assists} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-base font-bold">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">{label}</p>
    </div>
  );
}
