"use client";

import { useEffect, useRef, useState } from "react";
import { countryName, useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { PlayerCard, TrophyShowcase } from "@/components/PlayerCard";
import { DecisionPanel } from "@/components/DecisionPanel";
import { NationalTeamFooter } from "@/components/NationalTeamFooter";
import { TrophyToasts, type CelebrationItem } from "@/components/TrophyCelebration";
import { OutcomeReveal } from "@/components/OutcomeReveal";
import { SeasonBackPage } from "@/components/SeasonBackPage";
import { ChallengeHud } from "@/components/ChallengeHud";
import { buildBackPage, type BackPage } from "@/lib/sim/backPage";
import type { CareerState } from "@/lib/sim/career";
import { getLeagueOfTeam, getTeam } from "@/lib/data/dataset";
import { isDefender, RETIREMENT_AGE } from "@/lib/sim/constants";
import { resolveTrophy } from "@/lib/trophyDisplay";
import { AWARD_IMAGES } from "@/lib/data/trophies";

/**
 * The splash for the season just played.
 *
 * Derived rather than stored: it is a pure read of the snapshots, so it
 * survives a reload for free and can never drift out of sync with the career.
 * The season before it is built too, only so the paper knows not to print the
 * same words two years running.
 */
function latestBackPage(career: CareerState): BackPage | null {
  const n = career.seasons.length;
  if (n === 0) return null;

  const build = (index: number, previousPage: BackPage | null): BackPage | null => {
    const season = career.seasons[index];
    const team = season ? getTeam(season.teamId) : null;
    if (!season || !team) return null;
    return buildBackPage(career.seed, {
      season,
      previous: career.seasons[index - 1] ?? null,
      teamName: team.name,
      firstCallUp: career.firstCallUpAge === season.age,
      isGoalkeeper: career.player.position === "GK",
      isDefender: isDefender(career.player.position),
      confederation:
        getLeagueOfTeam(team.id)?.confederation ?? career.player.nationality.confederation,
      retirementAge: RETIREMENT_AGE,
      previousPage,
    });
  };

  return build(n - 1, n >= 2 ? build(n - 2, null) : null);
}

export function CareerScreen() {
  const { t, locale } = useI18n();
  const career = useCareerStore((s) => s.career);
  const avatar = useCareerStore((s) => s.draft.avatar);
  const viewSummary = useCareerStore((s) => s.viewSummary);
  const sound = useSound();

  // Celebrate the moment a new trophy or award lands — queued so a period that
  // won several things at once (a treble, a trophy plus an award) shows each
  // one in turn rather than only the last. This mirrors career (an external
  // store) rather than deriving from it, so it stays in an effect.
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationItem[]>([]);
  const seenSeasonCount = useRef(0);
  const seenCareerSeed = useRef<string | null>(null);
  const celebratedCallUp = useRef(false);

  useEffect(() => {
    if (!career) return;
    if (seenCareerSeed.current !== career.seed) {
      // First sight of this career. Everything already in it counts as seen:
      // for a new career that is nothing, and for one restored from a reload
      // it is the whole history — which stops a refresh from replaying every
      // trophy the player ever won as a fresh celebration.
      seenCareerSeed.current = career.seed;
      seenSeasonCount.current = career.seasons.length;
      celebratedCallUp.current = career.firstCallUpAge !== null;
      return;
    }
    if (career.seasons.length <= seenSeasonCount.current) return;

    const confederation = career.player.nationality.confederation;
    const newSeasons = career.seasons.slice(seenSeasonCount.current);
    seenSeasonCount.current = career.seasons.length;

    const items: CelebrationItem[] = [];

    // The first senior call-up is a milestone in its own right, and only ever fires once.
    if (career.firstCallUpAge !== null && !celebratedCallUp.current) {
      celebratedCallUp.current = true;
      items.push({
        id: `${career.seed}-callup`,
        kind: "callUp",
        name: countryName(career.player.nationality, locale),
        imageUrl: career.player.nationality.flag_url,
        age: career.firstCallUpAge,
      });
    }

    for (const season of newSeasons) {
      for (const key of season.trophies) {
        const resolved = resolveTrophy(key, season.teamId, confederation, t, season.leagueTier);
        items.push({
          id: `${season.id}-t-${key}`,
          kind: "trophy",
          name: resolved.name,
          imageUrl: resolved.imageUrl,
          age: season.age,
        });
      }
      for (const award of season.awards) {
        items.push({
          id: `${season.id}-a-${award}`,
          kind: "award",
          name: t(`awards.${award}`),
          imageUrl: AWARD_IMAGES[award],
          age: season.age,
        });
      }
    }

    if (items.length > 0) {
      // Replaces rather than appends. Clicking through decisions faster than
      // the toasts expire used to build a backlog, so a player three seasons
      // on was still being told about a cup they won before the last transfer.
      // Whatever just happened is the only thing worth announcing.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local UI state off the external career store, not deriving render output
      setCelebrationQueue(items);
      // One cue per *batch*, played right here rather than in an effect keyed
      // off the front of the queue. Toasts each expire on their own timer, so
      // once the first one's timeout removed it, the second became
      // `celebrationQueue[0]` with a different id — a `topCelebrationId`-keyed
      // effect saw that as a brand new celebration and replayed the sound for
      // every toast in the batch as it aged out, roughly once every 700ms. A
      // treble sounded like the cue stuttering three times instead of playing
      // once.
      sound("trophy");
    }
  }, [career, t, locale, sound]);

  // Toasts remove themselves on a timer; a click only hurries one along.
  const expireCelebration = (id: string) =>
    setCelebrationQueue((queue) => queue.filter((c) => c.id !== id));

  if (!career) return null;
  const finished = career.phase === "summary";

  // The splash for the season just played. Derived rather than stored: it is a
  // pure read of the last snapshot, so it survives a reload for free and never
  // has to be kept in sync with the career state.
  const backPage = latestBackPage(career);

  return (
    <div className="scrollbar-thin mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 overflow-y-auto px-4 py-3 sm:px-6 lg:overflow-hidden">
      {/* One rail for every notification. These used to be two independent
          fixed layers at the same z-index, so a trophy toast landed directly
          on top of the outcome of the decision that won it. The rail is inert;
          only the cards inside it take clicks. */}
      <div className="pointer-events-none fixed inset-x-3 top-[4.5rem] z-50 mx-auto flex max-w-xs flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:mx-0">
        <OutcomeReveal career={career} />
        <TrophyToasts items={celebrationQueue} onExpire={expireCelebration} />
      </div>

      <div className="shrink-0">
        <PlayerCard career={career} avatar={avatar} />
      </div>

      {/* `min-h-0`/`flex-1` only from `lg:` on: they force this grid to
          collapse to the exact leftover space so its own panels can scroll
          internally, which needs the shell above to have a bounded height —
          true only in the locked one-screen desktop layout. Below `lg` the
          shell scrolls as a whole instead, so this grid has no bounded
          height to collapse into; forcing it there anyway shrank it to zero
          and let its content spill out on top of whatever came after it
          (the sticky national-team footer). */}
      <div className="grid grid-cols-1 gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_320px]">
        <div className="scrollbar-thin lg:min-h-0 lg:h-full lg:overflow-y-auto lg:pr-1">
          {finished ? (
            <section className="panel animate-fade-in-up p-5 text-center">
              <h2 className="font-display text-xl font-black">{t("career.careerEndedTitle")}</h2>
              <p className="mt-1 text-sm text-muted">{t("career.careerEndedDescription")}</p>
              <button
                type="button"
                onClick={() => {
                  viewSummary();
                  sound("cardReveal");
                }}
                className="mt-4 rounded-full bg-gold px-6 py-2.5 text-sm font-black uppercase tracking-wide text-[#2a1d02] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                {t("career.viewSummary")}
              </button>
            </section>
          ) : (
            <div className="flex flex-col gap-3">
              <ChallengeHud career={career} />
              {backPage && <SeasonBackPage key={backPage.age} page={backPage} />}
              <DecisionPanel key={career.currentEvent?.id} career={career} />
            </div>
          )}
        </div>

        {/* The rail belongs to the trophy cabinet.

            It used to hold the season table and a headline feed. Both were
            the wrong shape for it: the table is wide and short, so a tall
            narrow column showed two rows of it, while the cabinet is a grid
            of small icons that fills a tall column and never outgrows it. So
            they swapped — the table now runs across the top beside the card.
            The headline feed is gone: every line it carried is replayed in
            the newspaper at the end, and in-game it spent a third of the rail
            repeating what the back page above the decision had just said.

            Below lg the rail is hidden rather than stacked underneath — a
            phone cannot show both columns without the page growing past one
            screen, and between the two the decision is what needs to be
            there. */}
        <div className="hidden min-h-0 lg:block">
          <TrophyShowcase career={career} />
        </div>
      </div>

      {/* No margin of its own: the shell is a `gap-3` column, so `mt-3` here
          spaced the footer twice and cost the decision above it a dozen
          pixels it could not spare. */}
      <div className="shrink-0">
        <NationalTeamFooter career={career} />
      </div>
    </div>
  );
}
