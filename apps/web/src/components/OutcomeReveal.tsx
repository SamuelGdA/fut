"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { careerEventCopyBase, EffectChips, careerEventVars, type EventOptionCopy } from "./DecisionPanel";
import { eventOptionPreview, type EventEffectPreview } from "@/lib/sim/careerEvents";
import type { CareerState } from "@/lib/sim/career";

const VISIBLE_MS = 5200;
const EXIT_MS = 260;

type Phase = "hidden" | "entering" | "leaving";

/**
 * The player just gambled on something — a quiet toast in the corner says
 * whether it paid off, with the exact numbers behind it, and clears itself.
 * Unlike a trophy (a genuine "stop and look at this" moment worth a click to
 * dismiss), this is a footnote to the decision you already made — it shouldn't
 * make you click through it to get back to the game.
 */
export function OutcomeReveal({ career }: { career: CareerState }) {
  const { t, raw, locale } = useI18n();
  const outcome = career.lastOutcome;

  // Track which decision's outcome is currently showing, independent of
  // `career` (an external store) so a re-render never re-triggers the timer.
  const shownFor = useRef<{ seed: string; step: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("hidden");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    for (const id of timers.current) clearTimeout(id);
    timers.current = [];
  };

  const dismiss = () => {
    clearTimers();
    setPhase("leaving");
    timers.current.push(setTimeout(() => setPhase("hidden"), EXIT_MS));
  };

  useEffect(() => {
    if (!outcome) return;
    const already = shownFor.current?.seed === career.seed && shownFor.current?.step === career.step;
    if (already) return;
    shownFor.current = { seed: career.seed, step: career.step };
    clearTimers();
    setPhase("entering");
    timers.current.push(
      setTimeout(() => setPhase("leaving"), VISIBLE_MS),
      setTimeout(() => setPhase("hidden"), VISIBLE_MS + EXIT_MS),
    );
    return clearTimers;
  }, [career.seed, career.step, outcome]);

  if (phase === "hidden" || !outcome) return null;

  const { event, optionId, kind } = outcome;
  const key = event.eventKey!;
  const option = event.options.find((o) => o.id === optionId);
  if (!option?.optionKey) return null;

  // Shirt options carry their own number, which the shared event vars can't
  // hold — each option on that decision offered a different one.
  const sharedVars = careerEventVars(career, event, t, locale);
  const vars =
    option.shirtNumber !== undefined
      ? { ...sharedVars, number: String(option.shirtNumber) }
      : sharedVars;
  const basePath = careerEventCopyBase(key, event.variantKey, raw);
  const options = raw<Record<string, EventOptionCopy>>(`${basePath}.options`) ?? {};
  const copy = options[option.optionKey] ?? {};
  const branch =
    kind === "positive" ? copy.positiveOutcome : kind === "negative" ? copy.negativeOutcome : undefined;

  // A choice with no gamble in it is usually a trade: the board’s priority
  // doubles one competition’s odds and halves the other’s, and both halves are
  // the answer to "what happened". A gambled version of the same option prints
  // one branch or the other; a settled one prints both.
  const lines =
    branch?.description !== undefined
      ? [branch.description]
      : copy.outcome !== undefined
        ? [copy.outcome]
        : [copy.positiveOutcome?.description, copy.negativeOutcome?.description].filter(
            (line): line is string => Boolean(line),
          );
  if (lines.length === 0) return null;

  // Green for a gamble that paid, red for one that did not, and a plain
  // reading for a choice that was never a gamble — which is most of them.
  const accent =
    kind === "positive" ? "text-pitch" : kind === "negative" ? "text-danger" : "text-muted";
  const glyph = kind === "positive" ? "▲" : kind === "negative" ? "▼" : "●";
  const eyebrow =
    kind === "positive"
      ? "career.outcomeGood"
      : kind === "negative"
        ? "career.outcomeBad"
        : "career.outcomeNeutral";

  const preview = eventOptionPreview(key, option.optionKey);
  const previewFlat: EventEffectPreview | null =
    preview && "positive" in preview ? preview[kind === "negative" ? "negative" : "positive"] : (preview as EventEffectPreview | null);

  return (
    <div
      // Positioned by the shared notification rail rather than by itself:
      // trophy toasts and this used to be two independent fixed layers at the
      // same z-index and landed on top of each other.
      className="pointer-events-auto w-full"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-2xl ${
          phase === "leaving" ? "animate-toast-out" : "animate-toast-in"
        }`}
        onClick={dismiss}
      >
        {/* A glyph rather than a plain dot: the dot's colour was the only
            thing separating a good outcome from a bad one at a glance. */}
        <span
          className={`mt-px shrink-0 text-[11px] font-black leading-none ${accent}`}
          aria-hidden
        >
          {glyph}
        </span>
        <div className="min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${accent}`}>
            {t(eyebrow)}
          </p>
          {lines.map((line, i) => (
            <p key={i} className="mt-0.5 text-xs leading-snug text-foreground">
              {line.replace(/\{(\w+)\}/g, (m, k2) => vars[k2] ?? m)}
              {i === lines.length - 1 && previewFlat && (
                <EffectChips preview={previewFlat} t={t} />
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
