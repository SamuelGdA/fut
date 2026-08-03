"use client";

import { useEffect, useRef, useState } from "react";
import { countryName, useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { PlayerFcCard } from "@/components/PlayerFcCard";
import { TrophyShowcase } from "@/components/PlayerCard";
import { Flag } from "@/components/Media";
import { CareerTimeline } from "@/components/CareerTimeline";
import { CareerBiography } from "@/components/CareerBiography";
import { ShareCardButtons } from "@/components/ShareCardButtons";
import { ShareableSummary } from "@/components/ShareableSummary";
import { HeadlinesFeed } from "@/components/HeadlinesFeed";
import { careerTotals, peakMarketValue, type CareerState } from "@/lib/sim/career";
import { formatMarketValue } from "@/lib/trophyDisplay";
import { ATTRIBUTE_ABBR, attributeKeysFor, computeOverall } from "@/lib/sim/attributes";
import { rivalOverallAt } from "@/lib/sim/engine";
import { BRAND_COPY } from "@/lib/brandCopy";
import { getDailyChallenge, scoreChallenge, type ChallengeResult } from "@/lib/challenge/daily";
import { buildCareerMetrics } from "@/lib/challenge/metrics";
import { recordAttempt, standings } from "@/lib/challenge/leaderboard";
import type { Mission } from "@/lib/challenge/missions";

interface ChallengeOutcome {
  mission: Mission;
  result: ChallengeResult;
  rank: number | null;
  ranked: boolean;
}

/** Scores and records the run the moment a challenge career reaches its summary — once per career. */
function useChallengeOutcome(career: CareerState | null, challengeId: string | null): ChallengeOutcome | null {
  const [outcome, setOutcome] = useState<ChallengeOutcome | null>(null);
  const recordedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!career || !challengeId || career.phase !== "summary") return;
    if (recordedFor.current === challengeId) return;
    recordedFor.current = challengeId;

    const challenge = getDailyChallenge(challengeId);
    const result = scoreChallenge(career, challenge.mission);
    const metrics = buildCareerMetrics(career);
    const entry = recordAttempt({
      challengeId,
      missionId: challenge.mission.id,
      playerName: career.identity.lastName,
      peakOverall: metrics.peakOverall,
      result,
    });
    const rankIndex = entry.ranked
      ? standings(1000).findIndex((e) => e.challengeId === entry.challengeId && e.finishedAt === entry.finishedAt)
      : -1;
    setOutcome({
      mission: challenge.mission,
      result,
      rank: rankIndex >= 0 ? rankIndex + 1 : null,
      ranked: entry.ranked,
    });
  }, [career, challengeId]);

  return outcome;
}

export function SummaryScreen() {
  const { t, locale } = useI18n();
  const brand = BRAND_COPY[locale];
  const career = useCareerStore((s) => s.career);
  const avatar = useCareerStore((s) => s.draft.avatar);
  const replay = useCareerStore((s) => s.replay);
  const challengeId = useCareerStore((s) => s.challengeId);
  const sound = useSound();
  // The PNG is rendered from its own off-screen layout, not from this screen —
  // a shared image wants a fixed-width portrait, not a responsive dashboard.
  const exportRef = useRef<HTMLDivElement>(null);
  const challengeOutcome = useChallengeOutcome(career, challengeId);

  if (!career) return null;

  const totals = careerTotals(career);
  const country = career.player.nationality;
  const isGk = career.player.role === "goalkeeper";

  // The card shown here is the player at their absolute peak, not at retirement.
  const peakSeason = career.seasons.reduce(
    (best, s) => (s.overall > best.overall ? s : best),
    career.seasons[0] ?? null,
  );
  const peakAttributes = peakSeason?.attributes ?? career.player.attributes;
  const peakOvr = peakSeason
    ? Math.round(computeOverall(peakAttributes, career.player.position))
    : career.player.overall;
  const keys = attributeKeysFor(career.player.position);
  // The rival is measured at his own peak, same as the player is — but not
  // everyone reaches the OVR threshold that earns one in the first place.
  const rivalPeak = career.rival ? rivalOverallAt(career.rival, 28) : null;

  return (
    <div className="animate-fade-in mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-3 sm:px-6 lg:h-[calc(100vh-3.5rem)] lg:flex-none lg:flex-row lg:gap-5">
      {/* Left rail on desktop: the card is the identity of the save, so it
          stays put while everything written about it scrolls beside it. */}
      <ShareableSummary ref={exportRef} career={career} avatar={avatar} />

      <div className="flex shrink-0 flex-col items-center text-center lg:w-[248px] lg:justify-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-gold">
          {t("career.summaryTitle")}
        </p>
        <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl">
          {career.identity.lastName}
        </h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted">
          <Flag src={country.flag_url} alt={countryName(country, locale)} className="h-4 w-6" />
          <span>{countryName(country, locale)}</span>
          <span className="text-muted-2">·</span>
          <span>{t(`positions.${career.player.position}`)}</span>
        </div>

        <div className="mt-3">
          <PlayerFcCard
            reveal
            size="md"
            data={{
              overall: peakOvr,
              position: career.player.position,
              attributes: peakAttributes,
              lastName: career.identity.lastName,
              // The number worn during the peak season, not today's — this card
              // is a snapshot of that moment, shirt included.
              number: peakSeason?.shirtNumber ?? career.shirtNumber,
              country,
              teamId: peakSeason?.teamId ?? null,
              avatar,
            }}
          />
        </div>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-2">
          {brand.peakLabel}
        </p>

        <div className="mt-3" data-share-exclude>
          <ShareCardButtons target={exportRef} playerName={career.identity.lastName} />
        </div>

        <button
          type="button"
          onClick={() => {
            replay();
            sound("confirm");
          }}
          data-share-exclude
          className="mt-3 hidden rounded-full bg-pitch px-6 py-2 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98] lg:block"
        >
          {t("career.replay")}
        </button>
      </div>

      <div className="scrollbar-thin mt-3 min-h-0 flex-1 overflow-y-auto lg:mt-0 lg:pr-1">
        {challengeOutcome && (
          <div className="panel mb-3 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  {t("challenge.result")}
                </p>
                <p className="mt-1 truncate font-display text-sm font-black">
                  {t(`challenge.missions.${challengeOutcome.mission.key}.title`)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-2xl font-black text-gold">{challengeOutcome.result.score}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">
                  {challengeOutcome.result.progress}/{challengeOutcome.result.target}{" "}
                  {t(`challenge.units.${challengeOutcome.mission.unit}`)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  challengeOutcome.ranked ? "bg-pitch/20 text-pitch" : "bg-surface-2 text-muted-2"
                }`}
              >
                {t(challengeOutcome.ranked ? "challenge.ranked" : "challenge.friendly")}
              </span>
              {!challengeOutcome.result.cleanRun && (
                <span className="rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-danger">
                  {t("challenge.ruleBroken")}
                </span>
              )}
              {challengeOutcome.rank !== null && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-2">
                  #{challengeOutcome.rank} · {t("challenge.ranking")}
                </span>
              )}
            </div>
          </div>
        )}

        {/* The written career leads: it's the part that makes this save feel
            like a specific player rather than a table of numbers. */}
        <div className="mb-3">
          <CareerBiography career={career} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <section className="panel p-3">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
              {t("career.totals")}
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              <Metric label={t("career.historySeasons")} value={career.seasons.length} />
              <Metric label={t("career.appearances")} value={totals.appearances} />
              {isGk ? (
                <>
                  <Metric label={t("career.cleanSheets")} value={totals.cleanSheets} />
                  <Metric label={t("career.goalsConceded")} value={totals.goalsConceded} />
                </>
              ) : (
                <>
                  <Metric label={t("career.goals")} value={totals.goals} />
                  <Metric label={t("career.assists")} value={totals.assists} />
                </>
              )}
              <Metric label={t("career.marketValue")} value={formatMarketValue(peakMarketValue(career))} />
              <Metric label={t("career.trophies")} value={totals.trophies} highlight />
              <Metric label={t("career.awards")} value={totals.awards} highlight />
              <Metric label="OVR" value={peakOvr} highlight />
            </div>

            {/* Who you spent a career being compared to — only ever assigned once
                OVR crossed the threshold that earns a rival at all. */}
            {career.rival && rivalPeak !== null && (
              <div className="mt-2 rounded-xl bg-surface-2/50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">
                  {t("career.rivalLabel")}
                </p>
                <div className="mt-0.5 flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate font-display text-sm font-black">
                    {career.rival.name}
                  </span>
                  <span
                    className={`shrink-0 font-display text-sm font-black ${
                      peakOvr >= rivalPeak ? "text-pitch" : "text-danger"
                    }`}
                  >
                    {peakOvr} × {rivalPeak}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="panel p-3">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
              {brand.attributesLabel}
            </h2>
            <div className="flex flex-col gap-1.5">
              {keys.map((key) => {
                const value = Math.round(peakAttributes[key]);
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-8 text-[10px] font-black tracking-wider text-muted-2">
                      {ATTRIBUTE_ABBR[key]}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pitch-deep to-pitch transition-[width] duration-700"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-display text-xs font-black">{value}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <CareerTimeline career={career} />

          <TrophyShowcase career={career} />
        </div>

        <div className="mt-3">
          <HeadlinesFeed headlines={career.headlines} />
        </div>
      </div>

      {/* Below lg the whole page scrolls, so the replay button belongs at the
          natural end of the document rather than pinned to the left rail. */}
      <div className="mt-3 flex shrink-0 justify-center lg:hidden">
        <button
          type="button"
          onClick={() => {
            replay();
            sound("confirm");
          }}
          className="rounded-full bg-pitch px-8 py-2.5 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          {t("career.replay")}
        </button>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface-2/50 px-3 py-2.5 text-center">
      <p className={`font-display text-lg font-black ${highlight ? "text-gold" : ""}`}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">{label}</p>
    </div>
  );
}
