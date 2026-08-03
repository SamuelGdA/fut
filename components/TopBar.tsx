"use client";

import { useEffect } from "react";
import { LOCALES, useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";

/** Slim floating bar: wordmark, language switch, theme and sound toggles. */
export function TopBar() {
  const { locale, setLocale } = useI18n();
  const soundEnabled = useCareerStore((s) => s.soundEnabled);
  const toggleSound = useCareerStore((s) => s.toggleSound);
  const theme = useCareerStore((s) => s.theme);
  const toggleTheme = useCareerStore((s) => s.toggleTheme);
  const sound = useSound();

  // Applies the persisted choice to the document — the CSS default is already
  // dark, so this only ever has to act when the visitor picked light before.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />

        <div className="flex items-center gap-2">
          <div className="pill flex items-center gap-0.5 p-0.5">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  sound("tick");
                }}
                aria-label={l.label}
                title={l.label}
                className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  locale === l.code ? "bg-foreground text-background" : "text-muted-2 hover:text-foreground"
                }`}
              >
                {l.code}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              toggleTheme();
              sound("tick");
            }}
            aria-pressed={theme === "light"}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            className="pill flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-foreground"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            type="button"
            onClick={() => {
              toggleSound();
              if (!soundEnabled) sound("select");
            }}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Desativar som" : "Ativar som"}
            title={soundEnabled ? "Som ligado" : "Som desligado"}
            className="pill flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-foreground"
          >
            {soundEnabled ? <SpeakerOn /> : <SpeakerOff />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Wordmark() {
  return (
    <span className="flex items-baseline gap-1.5 select-none">
      <span className="font-display text-xl font-black tracking-[-0.02em] sm:text-2xl">
        CRA<span className="text-pitch">Q</span>UE
      </span>
      <span className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-muted-2 sm:inline">
        carreira
      </span>
    </span>
  );
}

/** Shown while dark is active — clicking it switches to light, hence "sun". */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

/** Shown while light is active — clicking it switches back to dark. */
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="m22 9-6 6" />
      <path d="m16 9 6 6" />
    </svg>
  );
}
