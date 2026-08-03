"use client";

import { useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { PlayerFcCard } from "@/components/PlayerFcCard";
import { getCountryByIso } from "@/lib/data/dataset";
import { createStartingAttributes } from "@/lib/sim/attributes";
import { BRAND_COPY } from "@/lib/brandCopy";
import type { Difficulty, GameMode } from "@/lib/sim/constants";

const MODES: GameMode[] = ["long", "normal"];
const DIFFICULTIES: Difficulty[] = ["normal", "hard"];

export function IntroScreen() {
  const { t, locale } = useI18n();
  const brand = BRAND_COPY[locale];
  const mode = useCareerStore((s) => s.mode);
  const setMode = useCareerStore((s) => s.setMode);
  const difficulty = useCareerStore((s) => s.difficulty);
  const setDifficulty = useCareerStore((s) => s.setDifficulty);
  const goToIdentity = useCareerStore((s) => s.goToIdentity);
  const goToChallenge = useCareerStore((s) => s.goToChallenge);
  const draft = useCareerStore((s) => s.draft);
  const sound = useSound();

  // Teaser card: shows the player's saved look if they have one.
  const country = getCountryByIso(draft.countryIso ?? "BR") ?? getCountryByIso("BR")!;
  const teaserPosition = draft.position ?? "ST";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:gap-14 lg:py-16">
      <div className="animate-fade-in-up w-full lg:w-[55%]">
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-pitch">
          {brand.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-[2.6rem] font-black leading-[0.95] tracking-[-0.02em] sm:text-6xl">
          {brand.headlineTop}
          <br />
          <span className="bg-gradient-to-r from-gold via-flood to-pitch bg-clip-text text-transparent">
            {brand.headlineAccent}
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {brand.subtitle}
        </p>

        <div className="mt-8" role="radiogroup" aria-label={t("intro.title")}>
          <div className="pill inline-flex p-1">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => {
                  setMode(m);
                  sound("tick");
                }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                  mode === m ? "bg-foreground text-background" : "text-muted-2 hover:text-foreground"
                }`}
              >
                {t(`intro.modes.${m}.title`)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{t(`intro.modes.${mode}.description`)}</p>
        </div>

        {/* Difficulty is its own axis: mode sets the pacing, this sets how
            unforgiving the football is. */}
        <div className="mt-5" role="radiogroup" aria-label={t("intro.difficultyTitle")}>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-2">
            {t("intro.difficultyTitle")}
          </p>
          <div className="pill inline-flex p-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={difficulty === d}
                onClick={() => {
                  setDifficulty(d);
                  sound("tick");
                }}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                  difficulty === d
                    ? d === "hard"
                      ? "bg-danger text-white"
                      : "bg-foreground text-background"
                    : "text-muted-2 hover:text-foreground"
                }`}
              >
                {t(`intro.difficulties.${d}.title`)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{t(`intro.difficulties.${difficulty}.description`)}</p>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              goToIdentity();
              sound("confirm");
            }}
            className="group relative overflow-hidden rounded-full bg-pitch px-8 py-3 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {t("intro.start")}
          </button>
          <button
            type="button"
            onClick={() => {
              goToChallenge();
              sound("select");
            }}
            className="rounded-full border border-gold/40 bg-gold/10 px-6 py-3 text-sm font-black uppercase tracking-wide text-gold transition-all hover:bg-gold/20 active:scale-[0.98]"
          >
            {t("challenge.title")}
          </button>
          <span className="text-xs text-muted-2">
            {brand.startHint}
          </span>
        </div>

        <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 text-center">
          {brand.stats.map(([value, label]) => (
            <div key={label} className="panel px-3 py-3">
              <dt className="font-display text-2xl font-black text-gold">{value}</dt>
              <dd className="text-[10px] font-bold uppercase tracking-wider text-muted-2">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative flex w-full items-center justify-center lg:w-[45%]">
        <div className="absolute h-72 w-72 rounded-full bg-pitch/15 blur-[110px]" aria-hidden />
        <div className="animate-float-soft">
          <PlayerFcCard
            size="lg"
            data={{
              overall: 87,
              position: teaserPosition,
              attributes: createStartingAttributes(teaserPosition, 87),
              lastName: draft.lastName.toUpperCase() || "VOCÊ",
              country,
              teamId: null,
              avatar: draft.avatar,
            }}
          />
        </div>
      </div>
    </div>
  );
}
