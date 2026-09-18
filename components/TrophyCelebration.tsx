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

const EYEBROW_KEY: Record<CelebrationItem["kind"], string> = {
  trophy: "career.trophyWonEyebrow",
  award: "career.awardWonEyebrow",
  callUp: "career.firstCallUpEyebrow",
};

/** Deterministic scatter so the burst reads as chaotic without re-randomising per render. */
/** How long a single toast stays up before fading itself out. */
const TOAST_MS = 4200;
/** A haul has more to read than a single trophy, so it lingers a little longer. */
const HAUL_EXTRA_MS = 1600;
/** Never stack more than this many at once — a treble plus an award is the realistic worst case. */
const MAX_VISIBLE = 4;

/**
 * What you won, said without stopping the game.
 *
 * This used to be a full-screen modal with a "tap to continue" button, shown
 * one item at a time off a queue — so a treble meant three separate clicks
 * before you could get back to your career, every single season. Trophies are
 * supposed to be the reward, not a chore.
 *
 * Now they arrive as a self-dismissing stack in the corner: everything that
 * landed this season is visible at once, nothing blocks the page underneath,
 * and a click only ever hurries a card along rather than being required.
 */
export function TrophyToasts({
  items,
  onExpire,
}: {
  items: CelebrationItem[];
  onExpire: (id: string) => void;
}) {
  if (items.length === 0) return null;

  // One thing won gets its own card. Several things won at once get a single
  // card that says so.
  //
  // They used to arrive as a stack of separate cards, each on its own timer
  // staggered behind the last — so a treble put four cards on screen and then
  // shuffled the remaining ones upward every 700ms as each expired. The
  // movement made a good moment read as a glitch. A haul is one event, so it
  // is now one card that holds still.
  if (items.length === 1) {
    return (
      <div className="flex w-full flex-col gap-2" aria-live="polite">
        <Toast item={items[0]} onExpire={() => onExpire(items[0].id)} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2" aria-live="polite">
      <HaulToast items={items} onExpire={() => items.forEach((i) => onExpire(i.id))} />
    </div>
  );
}

/**
 * Everything won in one season, on one card.
 *
 * The medals are the headline; the names sit under them in a single compact
 * block so a five-trophy year is still one glance rather than five.
 */
function HaulToast({ items, onExpire }: { items: CelebrationItem[]; onExpire: () => void }) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const expireRef = useRef(onExpire);
  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  const shown = items.slice(0, MAX_VISIBLE);
  const hidden = items.length - shown.length;

  useEffect(() => {
    const root = rootRef.current;
    // A haul earns a little longer on screen than a single trophy, because
    // there is more to read — but it is still one lifetime, not a cascade.
    const lifetime = TOAST_MS + HAUL_EXTRA_MS;
    const timer = window.setTimeout(() => expireRef.current(), lifetime);
    if (!root) return () => window.clearTimeout(timer);

    const medals = Array.from(root.querySelectorAll<HTMLElement>("[data-celebrate='medal']"));
    if (medals.length > 0) {
      animate(
        medals,
        { scale: [0.3, 1.15, 1], rotate: [-20, 6, 0] },
        { duration: 0.6, delay: stagger(0.07), ease: [0.22, 1, 0.36, 1] },
      );
    }
    const fade = window.setTimeout(() => {
      animate(root, { opacity: [1, 0], x: [0, 24] }, { duration: 0.35, ease: "easeIn" });
    }, lifetime - 350);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(fade);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      onClick={() => expireRef.current()}
      className="animate-toast-in pointer-events-auto relative flex w-full cursor-pointer flex-col gap-2 overflow-hidden rounded-2xl border border-gold/30 bg-surface/95 px-3 py-2.5 shadow-xl backdrop-blur-sm"
    >
      <div className="relative flex items-center gap-2">
        {shown.map((item) => (
          <span
            key={item.id}
            data-celebrate="medal"
            title={item.name}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/25"
          >
            <TrophyImage src={item.imageUrl} alt={item.name} className="h-6 w-6" />
          </span>
        ))}
        {hidden > 0 && (
          <span className="shrink-0 font-display text-xs font-black text-gold">+{hidden}</span>
        )}
      </div>

      <div className="relative min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold">
          {t("career.celebrationHaul", { count: items.length })}
        </p>
        <p className="truncate font-display text-sm font-black leading-tight" title={items.map((i) => i.name).join(" · ")}>
          {items.map((i) => i.name).join(" · ")}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
          {t("career.celebrationAt", { age: items[0].age })}
        </p>
      </div>
    </div>
  );
}

function Toast({ item, onExpire }: { item: CelebrationItem; onExpire: () => void }) {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  // The expiry callback lives in a ref so the timer below is armed exactly
  // once per toast: putting `onExpire` in the effect's deps would re-arm it on
  // every parent render and the card would never actually leave.
  const expireRef = useRef(onExpire);
  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const root = rootRef.current;
    const lifetime = TOAST_MS;
    const timer = window.setTimeout(() => expireRef.current(), lifetime);

    if (!root) return () => window.clearTimeout(timer);

    // The slide-in is a CSS class on the card itself, so this behaves exactly
    // like the outcome toast sitting beside it in the rail. Gating the whole
    // entrance behind this check was why the trophy notification sat perfectly
    // still while the notification next to it animated.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.clearTimeout(timer);
    }

    const medal = root.querySelector<HTMLElement>("[data-celebrate='medal']");
    if (medal) {
      animate(medal, { scale: [0.3, 1.15, 1], rotate: [-20, 6, 0] }, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
    }

    // Fade out just before the timer fires, so it leaves rather than blinks.
    const fade = window.setTimeout(() => {
      animate(root, { opacity: [1, 0], x: [0, 24] }, { duration: 0.35, ease: "easeIn" });
    }, lifetime - 350);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(fade);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      onClick={() => expireRef.current()}
      className="animate-toast-in pointer-events-auto relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-gold/30 bg-surface/95 py-2.5 pl-2.5 pr-4 shadow-xl backdrop-blur-sm"
    >
      <div
        data-celebrate="medal"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/25"
      >
        <TrophyImage src={item.imageUrl} alt={item.name} className="h-8 w-8" />
      </div>

      <div className="relative min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold">
          {t(EYEBROW_KEY[item.kind])}
        </p>
        <p className="truncate font-display text-sm font-black leading-tight">{item.name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-2">
          {t("career.celebrationAt", { age: item.age })}
        </p>
      </div>
    </div>
  );
}
