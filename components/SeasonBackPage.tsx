"use client";

import { useI18n } from "@/lib/i18n/context";
import type { BackPage } from "@/lib/sim/backPage";

/**
 * The morning-after splash for the season just played.
 *
 * Deliberately styled as newsprint rather than as another panel: a serif
 * masthead, a rule under it, a big all-caps line. It sits directly above the
 * next decision so the career reads as a run of front pages — you see what the
 * world made of last season before you choose what to do about it.
 */

const TONE_ACCENT: Record<BackPage["tone"], string> = {
  good: "text-pitch",
  bad: "text-danger",
  neutral: "text-fg",
};

const TONE_RULE: Record<BackPage["tone"], string> = {
  good: "bg-pitch/50",
  bad: "bg-danger/50",
  neutral: "bg-line",
};

/** Redundant with the colour, so the tone survives a colour-blind reader. */
const TONE_GLYPH: Record<BackPage["tone"], string> = {
  good: "▲",
  bad: "▼",
  neutral: "•",
};

export function SeasonBackPage({ page }: { page: BackPage }) {
  const { t } = useI18n();

  // The confederation becomes a word here rather than in the simulation,
  // which has no translator of its own.
  const vars = { ...page.vars, continent: t(`backPage.continents.${page.confederation}`) };
  const headline = t(`backPage.angles.${page.angle}.${page.variant}`, vars);
  const masthead = t(`backPage.mastheads.${page.masthead}`);
  // Three different jobs, three different ways of summing up a season.
  const statsKey = page.isGoalkeeper
    ? "backPage.statsLineGk"
    : page.isDefender
      ? "backPage.statsLineDefender"
      : "backPage.statsLine";
  const stats = t(statsKey, {
    apps: String(page.line.appearances),
    goals: String(page.line.goals),
    assists: String(page.line.assists),
    cleanSheets: String(page.line.cleanSheets),
  });

  return (
    <section className="panel animate-fade-in-up overflow-hidden p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-[11px] font-black uppercase tracking-[0.28em] text-muted-2">
          {masthead}
        </p>
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-2">
          {t("career.celebrationAt", { age: page.age })}
        </p>
      </div>

      <div className={`mt-1.5 h-px w-full ${TONE_RULE[page.tone]}`} />

      <h2
        // break-words: a club whose name is one long unbroken word — Borussia
        // Mönchengladbach's second half, for one — otherwise refuses to wrap
        // inside this line and gets sliced off by the section's overflow-hidden.
        className={`mt-2.5 break-words font-display text-lg font-black uppercase leading-[1.1] tracking-tight sm:text-xl ${TONE_ACCENT[page.tone]}`}
      >
        <span className="mr-1.5 align-middle text-[11px]" aria-hidden>
          {TONE_GLYPH[page.tone]}
        </span>
        {headline}
      </h2>

      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-2">{stats}</p>

      {page.clubStars && <ClubStandingMove move={page.clubStars} team={page.vars.team} />}
    </section>
  );
}

/**
 * The club's own standing moving while the player is there.
 *
 * It already moved in the sim — winning things has always made a club a bigger
 * name, and losing that habit has always faded it back — but the number lived
 * entirely inside the transfer market. Printing it here is the difference
 * between "my offers got better for some reason" and "I built this."
 *
 * The arrow and the word carry the direction; the stars are the illustration,
 * never the only signal.
 */
function ClubStandingMove({ move, team }: { move: { from: number; to: number }; team: string }) {
  const { t } = useI18n();
  const up = move.to > move.from;

  return (
    <p
      className={`mt-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-2 text-[11px] font-semibold ${
        up ? "text-pitch" : "text-danger"
      }`}
    >
      <span aria-hidden>{up ? "▲" : "▼"}</span>
      <span>{t(up ? "backPage.clubRose" : "backPage.clubFell", { team })}</span>
      <span className="font-mono tracking-tight text-muted-2" aria-hidden>
        {stars(move.from)} → <span className={up ? "text-pitch" : "text-danger"}>{stars(move.to)}</span>
      </span>
    </p>
  );
}

/** 0-5 standing as filled pips. Decorative — the sentence beside it says the same thing. */
function stars(value: number): string {
  return "★".repeat(value) + "☆".repeat(Math.max(0, 5 - value));
}
