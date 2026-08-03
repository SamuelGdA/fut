"use client";

import { useEffect, useRef, useState } from "react";
import { countryName, useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { PlayerCard } from "@/components/PlayerCard";
import { CareerTable } from "@/components/CareerTable";
import { DecisionPanel } from "@/components/DecisionPanel";
import { NationalTeamFooter } from "@/components/NationalTeamFooter";
import { TrophyCelebration, type CelebrationItem } from "@/components/TrophyCelebration";
import { OutcomeReveal } from "@/components/OutcomeReveal";
import { HeadlinesFeed } from "@/components/HeadlinesFeed";
import { resolveTrophy } from "@/lib/trophyDisplay";
import { AWARD_IMAGES } from "@/lib/data/trophies";

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
      // A brand new career (including a replay) — nothing to celebrate retroactively.
      seenCareerSeed.current = career.seed;
      seenSeasonCount.current = 0;
      celebratedCallUp.current = false;
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local UI state off the external career store, not deriving render output
      setCelebrationQueue((queue) => [...queue, ...items]);
    }
  }, [career, t, locale]);

  const currentCelebration = celebrationQueue[0] ?? null;
  const dismissCelebration = () => setCelebrationQueue((queue) => queue.slice(1));

  // A genuine side effect (Web Audio) belongs in its own effect, keyed off which
  // item is actually showing so each one in the queue gets its own cue.
  const currentCelebrationId = currentCelebration?.id;
  useEffect(() => {
    if (currentCelebrationId) sound("trophy");
  }, [currentCelebrationId, sound]);

  if (!career) return null;
  const finished = career.phase === "summary";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-3 sm:px-6 lg:h-[calc(100vh-3.5rem)] lg:flex-none">
      {/* A toast in the corner for what a decision led to; a full-screen beat
          only for something worth stopping for, like a trophy. */}
      <OutcomeReveal career={career} />
      <TrophyCelebration item={currentCelebration} onDismiss={dismissCelebration} />

      <div className="shrink-0">
        <PlayerCard career={career} avatar={avatar} />
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <div className="scrollbar-thin lg:h-full lg:overflow-y-auto lg:pr-1">
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
            <DecisionPanel key={career.currentEvent?.id} career={career} />
          )}
        </div>

        {/* Table and back pages share the rail: the numbers, then the story of them. */}
        <div className="grid min-h-[240px] grid-rows-[1fr_auto] gap-3 lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_minmax(0,150px)]">
          <div className="min-h-0">
            <CareerTable career={career} />
          </div>
          <div className="min-h-0">
            <HeadlinesFeed headlines={career.headlines} />
          </div>
        </div>
      </div>

      <div className="mt-3 shrink-0">
        <NationalTeamFooter career={career} />
      </div>
    </div>
  );
}
