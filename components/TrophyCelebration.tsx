"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "motion";
import { useI18n } from "@/lib/i18n/context";
import { TrophyImage } from "./Media";

export interface CelebrationItem {
  id: string;
  kind: "trophy" | "award" | "callUp";
  name: string;
  imageUrl?: string;
  age: number;
}

/** Deterministic scatter so the burst reads as chaotic without re-randomising per render. */
const CONFETTI = Array.from({ length: 26 }, (_, i) => {
  const golden = (i * 137.508) % 100;
  return {
    left: `${golden}%`,
    color: ["var(--gold)", "var(--pitch)", "var(--flood)"][i % 3],
    size: 5 + ((i * 7) % 6),
    drift: ((i * 53) % 120) - 60,
    spin: ((i * 97) % 540) + 180,
    delay: ((i * 31) % 26) / 100,
  };
});

const EYEBROW_KEY: Record<CelebrationItem["kind"], string> = {
  trophy: "career.trophyWonEyebrow",
  award: "career.awardWonEyebrow",
  callUp: "career.firstCallUpEyebrow",
};

/**
 * Full-screen moment when a trophy, an individual award or a first call-up
 * lands — one at a time off a queue in CareerScreen.
 *
 * Choreographed with `motion` rather than CSS keyframes because the sequence
 * needs real orchestration (a spring on the trophy, a staggered particle burst,
 * a light sweep) that would be unreadable as six separate keyframe rules. The
 * library drives the Web Animations API, so all of this runs off the main
 * thread and costs ~2.6kb.
 */
export function TrophyCelebration({
  item,
  onDismiss,
}: {
  item: CelebrationItem | null;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const itemId = item?.id;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !itemId) return;
    // Honour the OS-level preference; the overlay still shows, it just appears.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const q = <T extends Element>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

    const trophy = root.querySelector<HTMLElement>("[data-celebrate='trophy']");
    if (trophy) {
      animate(
        trophy,
        { scale: [0.2, 1.18, 1], rotate: [-25, 8, 0] },
        { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      );
    }

    const rays = root.querySelector<HTMLElement>("[data-celebrate='rays']");
    if (rays) {
      animate(rays, { opacity: [0, 0.5, 0.22], scale: [0.6, 1.35] }, { duration: 1.1, ease: "easeOut" });
    }

    const confetti = q<HTMLElement>("[data-celebrate='confetti']");
    if (confetti.length > 0) {
      animate(
        confetti,
        { y: [0, 320], opacity: [1, 1, 0], rotate: [0, 420] },
        { duration: 1.5, delay: stagger(0.022), ease: "easeIn" },
      );
    }

    const text = q<HTMLElement>("[data-celebrate='text']");
    if (text.length > 0) {
      animate(
        text,
        { opacity: [0, 1], y: [14, 0] },
        { duration: 0.5, delay: stagger(0.08, { startDelay: 0.25 }), ease: "easeOut" },
      );
    }
  }, [itemId]);

  if (!item) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-background/88 p-4 backdrop-blur-sm"
      onClick={onDismiss}
      role="dialog"
      aria-live="polite"
    >
      <div
        className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-gold/30 bg-surface px-10 py-9 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti sits above the panel background but below the content. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              data-celebrate="confetti"
              className="absolute -top-3 block rounded-[2px]"
              style={{
                left: c.left,
                width: c.size,
                height: c.size,
                background: c.color,
                transform: `translateX(${c.drift}px) rotate(${c.spin}deg)`,
              }}
            />
          ))}
        </div>

        <div
          data-celebrate="rays"
          className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(245,196,81,0.5), transparent 22%, rgba(245,196,81,0.5) 44%, transparent 66%, rgba(245,196,81,0.5) 88%, transparent)",
          }}
        />

        <p
          data-celebrate="text"
          className="relative text-xs font-bold uppercase tracking-[0.24em] text-gold"
        >
          {t(EYEBROW_KEY[item.kind])}
        </p>

        <div
          data-celebrate="trophy"
          className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/25"
        >
          <TrophyImage src={item.imageUrl} alt={item.name} className="h-20 w-20" />
        </div>

        <h2
          data-celebrate="text"
          className="relative max-w-[24ch] font-display text-2xl font-black leading-tight"
        >
          {item.name}
        </h2>
        <p data-celebrate="text" className="relative text-sm text-muted">
          {t("career.celebrationAt", { age: item.age })}
        </p>

        <button
          data-celebrate="text"
          type="button"
          onClick={onDismiss}
          className="relative mt-1 rounded-full bg-gold px-6 py-2 text-xs font-black uppercase tracking-wide text-[#2a1d02] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          {t("career.tapToContinue")}
        </button>
      </div>
    </div>
  );
}
