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
  const branch = kind === "positive" ? copy.positiveOutcome : kind === "negative" ? copy.negativeOutcome : undefined;
  const description = branch?.description ?? copy.outcome ?? "";
  if (!description) return null;

  const preview = eventOptionPreview(key, option.optionKey);
  const previewFlat: EventEffectPreview | null =
    preview && "positive" in preview ? preview[kind === "negative" ? "negative" : "positive"] : (preview as EventEffectPreview | null);

  return (
    <div
      className="fixed right-3 top-[4.5rem] z-50 w-[calc(100%-1.5rem)] max-w-xs sm:right-6"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-2xl ${
          phase === "leaving" ? "animate-toast-out" : "animate-toast-in"
        }`}
        onClick={dismiss}
      >
        <span
          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${kind === "positive" ? "bg-pitch" : "bg-danger"}`}
          aria-hidden
        />
        <div className="min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${kind === "positive" ? "text-pitch" : "text-danger"}`}>
            {t(kind === "positive" ? "career.outcomeGood" : "career.outcomeBad")}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-foreground">
            {description.replace(/\{(\w+)\}/g, (m, k2) => vars[k2] ?? m)}
            {previewFlat && <EffectChips preview={previewFlat} t={t} />}
          </p>
        </div>
      </div>
    </div>
  );
}
