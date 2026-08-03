"use client";

import { useI18n } from "@/lib/i18n/context";
import { fanBand } from "@/lib/sim/engine";

/** Warmer the more the stand loves you — readable at a glance without the number. */
const BAND_STYLE: Record<ReturnType<typeof fanBand>, { bar: string; text: string }> = {
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
 */
export function FanSupportMeter({ support }: { support: number }) {
  const { t } = useI18n();
  const band = fanBand(support);
  const style = BAND_STYLE[band];

  return (
    <div className="rounded-xl bg-background/60 px-2.5 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-2">
          {t("career.fanSupportLabel")}
        </span>
        <span className={`font-display text-[11px] font-black ${style.text}`}>
          {t(`career.fanBands.${band}`)}
        </span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2"
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
    </div>
  );
}
