"use client";

import { useI18n } from "@/lib/i18n/context";
import type { PositionCode } from "@/lib/sim/constants";

/** x/y in percent, lifted verbatim from the original's position layout table. */
const LAYOUT: { position: PositionCode; x: number; y: number }[] = [
  { position: "LW", x: 18, y: 14 },
  { position: "ST", x: 50, y: 10 },
  { position: "RW", x: 82, y: 14 },
  { position: "LM", x: 20, y: 38 },
  { position: "CAM", x: 50, y: 26 },
  { position: "RM", x: 80, y: 38 },
  { position: "LB", x: 18, y: 66 },
  { position: "CM", x: 50, y: 42 },
  { position: "RB", x: 82, y: 66 },
  { position: "CDM", x: 50, y: 60 },
  { position: "CB", x: 50, y: 76 },
  { position: "GK", x: 50, y: 92 },
];

export function PositionField({
  value,
  onChange,
}: {
  value: PositionCode | null;
  onChange: (code: PositionCode) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="relative mx-auto aspect-[100/140] max-h-[280px] min-h-[220px] w-full max-w-[220px] overflow-hidden rounded-[10px] bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 shadow-inner shadow-black/40 lg:rounded-lg">
      <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g opacity="0.04">
          <rect x="0" y="0" width="100" height="14" fill="#ffffff" />
          <rect x="0" y="28" width="100" height="14" fill="#ffffff" />
          <rect x="0" y="56" width="100" height="14" fill="#ffffff" />
          <rect x="0" y="84" width="100" height="14" fill="#ffffff" />
          <rect x="0" y="112" width="100" height="14" fill="#ffffff" />
        </g>
        <rect x="1" y="1" width="98" height="138" rx="2" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <line x1="1" y1="70" x2="99" y2="70" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <rect x="26" y="1" width="48" height="21" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <rect x="36" y="1" width="28" height="9" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <path d="M 38 22 A 16 16 0 0 0 62 22" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <rect x="26" y="118" width="48" height="21" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <rect x="36" y="130" width="28" height="9" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
        <path d="M 38 118 A 16 16 0 0 1 62 118" fill="none" stroke="rgba(255, 255, 255)" strokeWidth="0.5" />
      </svg>

      {LAYOUT.map(({ position, x, y }) => {
        const selected = value === position;
        return (
          <button
            key={position}
            type="button"
            aria-pressed={selected}
            aria-label={t(`positions.${position}`)}
            onClick={() => onChange(position)}
            style={{ left: `${x}%`, top: `${y}%` }}
            className={`absolute flex h-8 min-w-13 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-8 sm:min-w-12 lg:text-[11px] lg:font-bold ${
              selected
                ? "scale-110 border border-white bg-white font-black text-emerald-950 shadow-lg shadow-white/30"
                : "border border-emerald-900 bg-emerald-950 text-emerald-100 hover:border-white hover:bg-emerald-900 hover:text-white"
            }`}
          >
            {t(`positions.${position}`)}
          </button>
        );
      })}
    </div>
  );
}
