"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LOCALES, useI18n } from "@/lib/i18n/context";
import { useCareerStore, VOLUME_STEPS } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";

/**
 * Everything that changes how the game presents itself, behind one gear.
 *
 * These are preferences, not gameplay: language, light/dark, how loud the
 * synth kit is, and the colour-blind palette. They used to be three separate
 * icons competing with the wordmark for the top bar; grouping them keeps the
 * bar quiet and leaves room to add settings later without redesigning it.
 */
export function SettingsMenu() {
  const { t, locale, setLocale } = useI18n();
  const soundEnabled = useCareerStore((s) => s.soundEnabled);
  const toggleSound = useCareerStore((s) => s.toggleSound);
  const volume = useCareerStore((s) => s.volume);
  const setVolume = useCareerStore((s) => s.setVolume);
  const theme = useCareerStore((s) => s.theme);
  const toggleTheme = useCareerStore((s) => s.toggleTheme);
  const sound = useSound();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Applies the persisted theme to the document.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Click-away and Escape, so the popover behaves like every other menu the
  // player has used today.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const muted = !soundEnabled || volume <= 0;
  // The slider reads the *chosen* level even while muted, so unmuting restores
  // it rather than jumping to full.
  const step = VOLUME_STEPS.reduce(
    (best, v, i) => (Math.abs(v - volume) < Math.abs(VOLUME_STEPS[best] - volume) ? i : best),
    0,
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          sound("tick");
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t("settings.title")}
        title={t("settings.title")}
        className={`pill flex h-8 w-8 items-center justify-center transition-colors ${
          open ? "text-foreground" : "text-muted hover:text-foreground"
        }`}
      >
        <GearIcon spinning={open} />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t("settings.title")}
          className="scrollbar-thin absolute right-0 top-10 z-50 max-h-[calc(100dvh-4rem)] w-64 animate-fade-in-up overflow-y-auto rounded-2xl border border-line bg-surface p-3 shadow-2xl"
        >
          <Row label={t("settings.language")}>
            <div className="flex gap-0.5 rounded-full bg-surface-2 p-0.5">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLocale(l.code);
                    sound("tick");
                  }}
                  aria-pressed={locale === l.code}
                  title={l.label}
                  className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    locale === l.code ? "bg-foreground text-background" : "text-muted-2 hover:text-foreground"
                  }`}
                >
                  {l.code}
                </button>
              ))}
            </div>
          </Row>

          <Row label={t("settings.theme")}>
            <div className="flex gap-0.5 rounded-full bg-surface-2 p-0.5">
              <Segment
                active={theme === "dark"}
                onClick={() => {
                  if (theme !== "dark") toggleTheme();
                  sound("tick");
                }}
                label={t("settings.themeDark")}
              >
                <MoonIcon />
              </Segment>
              <Segment
                active={theme === "light"}
                onClick={() => {
                  if (theme !== "light") toggleTheme();
                  sound("tick");
                }}
                label={t("settings.themeLight")}
              >
                <SunIcon />
              </Segment>
            </div>
          </Row>

          <div className="mt-2 border-t border-line/70 pt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-2">
                {t("settings.volume")}
              </span>
              <span className="font-display text-[11px] font-black tabular-nums text-muted">
                {muted ? t("settings.muted") : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleSound();
                  // Unmuting should be audible; muting obviously shouldn't be.
                  if (muted && volume > 0) sound("select");
                }}
                aria-pressed={muted}
                aria-label={muted ? t("settings.unmute") : t("settings.mute")}
                title={muted ? t("settings.unmute") : t("settings.mute")}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors hover:text-foreground"
              >
                {muted ? <SpeakerOff /> : <SpeakerOn />}
              </button>

              <input
                type="range"
                min={0}
                max={VOLUME_STEPS.length - 1}
                step={1}
                value={step}
                onChange={(e) => setVolume(VOLUME_STEPS[Number(e.target.value)])}
                // A cue on release rather than on every step, or dragging the
                // slider machine-guns the speaker.
                onPointerUp={() => sound("tick")}
                onKeyUp={() => sound("tick")}
                aria-label={t("settings.volume")}
                className="volume-slider min-w-0 flex-1"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-2">{label}</span>
      {children}
    </div>
  );
}

function Segment({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-6 w-7 items-center justify-center rounded-full transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-2 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function GearIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-300 ${spinning ? "rotate-45" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m22 9-6 6" />
      <path d="m16 9 6 6" />
    </svg>
  );
}
