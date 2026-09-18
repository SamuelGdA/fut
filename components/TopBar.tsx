"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { SettingsMenu } from "@/components/SettingsMenu";

/** Slim floating bar: wordmark back to the front page, and the settings gear. */
export function TopBar() {
  const { t } = useI18n();
  const screen = useCareerStore((s) => s.screen);
  const career = useCareerStore((s) => s.career);
  const goHome = useCareerStore((s) => s.goHome);
  const giveUpCareer = useCareerStore((s) => s.giveUpCareer);
  const sound = useSound();

  // Two ways out of a career, and they are not the same thing, so each
  // confirms in its own words: leaving throws the save away, retiring keeps
  // everything played and goes to the summary.
  const [confirming, setConfirming] = useState<"leave" | "giveUp" | null>(null);

  // Leaving mid-career throws the career away, so it asks first. From the
  // front page, the identity form or a finished career there is nothing to
  // lose and the click just goes through.
  const inProgress = screen === "career" && career !== null && career.phase === "career";

  const leave = () => {
    setConfirming(null);
    goHome();
    sound("back");
  };

  const giveUp = () => {
    setConfirming(null);
    giveUpCareer();
    sound("back");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => {
            if (screen === "intro") return;
            if (inProgress) {
              setConfirming("leave");
              sound("tick");
              return;
            }
            leave();
          }}
          aria-label={t("nav.home")}
          title={t("nav.home")}
          disabled={screen === "intro"}
          className="rounded-lg transition-opacity hover:opacity-80 disabled:cursor-default disabled:hover:opacity-100"
        >
          <Wordmark />
        </button>

        <div className="flex items-center gap-1">
          {/* Only while there is a career to end. Sits next to the gear
              rather than under it: it is a decision about the save, not a
              preference. */}
          {inProgress && (
            <button
              type="button"
              onClick={() => {
                setConfirming("giveUp");
                sound("tick");
              }}
              aria-label={t("nav.giveUp")}
              title={t("nav.giveUp")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-2 transition-colors hover:bg-surface-2/60 hover:text-danger"
            >
              <BootsIcon />
            </button>
          )}
          <SettingsMenu />
        </div>
      </div>

      {/* Portalled to the body on purpose. The header sets `backdrop-blur`,
          and a backdrop-filter makes an element the containing block for any
          `position: fixed` descendant — so rendering the dialog inside it
          sized `inset-0` against the 56px bar instead of the viewport, and it
          hung off the top of the screen. */}
      {confirming && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center-safe justify-center-safe overflow-y-auto bg-background/80 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm animate-fade-in-up rounded-2xl border border-line bg-surface p-5 text-center shadow-2xl">
            <h2 className="font-display text-lg font-black">
              {t(confirming === "giveUp" ? "nav.giveUpTitle" : "nav.leaveTitle")}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {t(confirming === "giveUp" ? "nav.giveUpDescription" : "nav.leaveDescription")}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirming(null);
                  sound("tick");
                }}
                className="rounded-full bg-pitch px-5 py-2 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                {t(confirming === "giveUp" ? "nav.giveUpCancel" : "nav.leaveCancel")}
              </button>
              <button
                type="button"
                onClick={confirming === "giveUp" ? giveUp : leave}
                className="rounded-full border border-line px-5 py-2 text-sm font-bold text-muted transition-colors hover:text-foreground"
              >
                {t(confirming === "giveUp" ? "nav.giveUpConfirm" : "nav.leaveConfirm")}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </header>
  );
}

/** Boots on the peg: the universal shorthand for calling it a career. */
function BootsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M4 5v7a4 4 0 0 0 4 4h7l4 2.5V19H8a7 7 0 0 1-7-7V5z" strokeLinejoin="round" />
      <path d="M4 12h4" strokeLinecap="round" />
    </svg>
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
