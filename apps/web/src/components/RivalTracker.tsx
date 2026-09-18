"use client";

import { useI18n } from "@/lib/i18n/context";
import { MetaRow } from "./MetaRow";
import { rivalOverallAt } from "@/lib/sim/engine";
import type { CareerState } from "@/lib/sim/career";

/**
 * The generational rival, live.
 *
 * Until now the rival existed only in event copy and in one line of the
 * end-of-career summary — you were told you had one, then found out twenty
 * years later how it went. Tracking it season by season is what turns it into
 * a rivalry: every year you can see whether the gap is closing or opening, and
 * a decision that costs you a season of growth now has a face attached to it.
 *
 * Renders nothing until a rival exists, which is deliberate — most careers
 * never get one, and an empty slot would advertise the absence.
 */
export function RivalTracker({ career, compact = false }: { career: CareerState; compact?: boolean }) {
  const { t } = useI18n();
  const rival = career.rival;
  if (!rival) return null;

  const age = career.player.age;
  const mine = career.player.overall;
  const theirs = rivalOverallAt(rival, age);
  const gap = mine - theirs;

  // Last season's gap, so the readout says which way it is moving rather than
  // only where it stands. Needs a season the rival already existed for.
  const previous = career.seasons[career.seasons.length - 1] ?? null;
  const previousGap = previous ? previous.overall - rivalOverallAt(rival, previous.age) : null;
  const trend = previousGap === null ? 0 : gap - previousGap;

  const ahead = gap > 0;
  const level = gap === 0;
  const accent = level ? "text-muted" : ahead ? "text-pitch" : "text-danger";

  const standing = t(
    level ? "career.rivalLevel" : ahead ? "career.rivalAhead" : "career.rivalBehind",
  );

  // Two lines normally, one when the window is short. The compact form keeps
  // the scoreline — which is what the rivalry is actually read from — and
  // moves the name and the standing into the tooltip; the row above it has to
  // come out of the same 57 pixels the smaller card gave back.
  if (compact) {
    return (
      <MetaRow
        compact
        label={t("career.rivalLabel")}
        title={`${rival.name}: ${standing}`}
        valueClass="tabular-nums"
        value={
          <>
            {mine}
            <span className="px-0.5 text-[9px] font-bold text-muted-2">×</span>
            <span className={accent}>{theirs}</span>
          </>
        }
      />
    );
  }

  return (
    <MetaRow
      label={t("career.rivalLabel")}
      // The word carries the state; the colour only reinforces it.
      value={standing}
      valueClass={accent}
    >
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate font-display text-[11px] font-black">
          {rival.name}
        </span>
        <span className="shrink-0 font-display text-[11px] font-black tabular-nums">
          {mine}
          <span className="px-0.5 text-[9px] font-bold text-muted-2">×</span>
          <span className={accent}>{theirs}</span>
        </span>
        {trend !== 0 && (
          <span
            className={`shrink-0 text-[9px] font-bold ${trend > 0 ? "text-pitch" : "text-danger"}`}
            title={t(trend > 0 ? "career.rivalGapClosing" : "career.rivalGapOpening")}
          >
            <span aria-hidden>{trend > 0 ? "▲" : "▼"}</span> {Math.abs(trend)}
          </span>
        )}
      </div>
    </MetaRow>
  );
}
