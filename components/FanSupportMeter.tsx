"use client";

import { useI18n } from "@/lib/i18n/context";
import { MetaRow } from "./MetaRow";
import { fanBand } from "@/lib/sim/engine";
import { briefPositionKey, type ClubBrief } from "@/lib/sim/clubBrief";
import type { PositionCode } from "@/lib/sim/constants";

/** Warmer the more the stand loves you — readable at a glance without the number. */
const BAND_STYLE: Record<ReturnType<typeof fanBand>, { bar: string; text: string }> = {
  // Grey, not red: nobody has an opinion yet.
  unknown: { bar: "bg-muted-2/60", text: "text-muted-2" },
  hostile: { bar: "bg-danger", text: "text-danger" },
  cold: { bar: "bg-muted-2", text: "text-muted-2" },
  warm: { bar: "bg-sky-400", text: "text-sky-300" },
  loved: { bar: "bg-pitch", text: "text-pitch" },
  adored: { bar: "bg-gold", text: "text-gold" },
};

/**
 * How the current club's terraces feel, 0-100. Tracked separately from ability
 * because being *loved* somewhere is its own kind of progress — and it resets
 * the moment you sign elsewhere.
 *
 * The signing brief ("Reconstrução", "Missão salvação"...) is why the bar
 * started where it did and why it swings as hard as it does, but it is not
 * printed here as its own line any more — the offer card already said it at
 * the moment of signing, and repeating it as permanent text under Torcida read
 * as the same fact stated twice. The detail survives as a hover tooltip on the
 * meter itself, so the reasoning is still one click of curiosity away without
 * sitting on the card by default.
 */
export function FanSupportMeter({
  support,
  peakSupport,
  brief,
  position,
  compact = false,
}: {
  support: number;
  /** The highest this crowd has ever had the player, this spell. */
  peakSupport: number;
  brief?: ClubBrief | null;
  position?: PositionCode;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const band = fanBand(support, peakSupport);
  const style = BAND_STYLE[band];
  const hasBrief = brief && brief.key !== "squad_depth" && position;
  const briefDetail = hasBrief
    ? t(`career.brief.briefs.${brief.key}.detail`, {
        role: t(`career.brief.roles.${briefPositionKey(position!)}`),
      })
    : undefined;

  return (
    <MetaRow
      label={t("career.fanSupportLabel")}
      value={t(`career.fanBands.${band}`)}
      valueClass={style.text}
      title={briefDetail}
      compact={compact}
    >
      <div
        className={`h-1 overflow-hidden rounded-full bg-surface-2 ${compact ? "mt-1" : "mt-1.5"}`}
        role="meter"
        aria-valuenow={Math.round(support)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("career.fanSupportLabel")}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${style.bar}`}
          style={{ width: `${Math.max(2, Math.round(support))}%` }}
        />
      </div>
    </MetaRow>
  );
}
