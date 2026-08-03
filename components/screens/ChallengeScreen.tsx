"use client";

import { useMemo } from "react";
import { countryName, useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { Flag } from "@/components/Media";
import { getCountryByIso } from "@/lib/data/dataset";
import { getDailyChallenge, todayChallengeId } from "@/lib/challenge/daily";
import { hasRankedAttempt, standings, challengeStats } from "@/lib/challenge/leaderboard";
import { missionById } from "@/lib/challenge/missions";

/**
 * The entry point for today's mission: the brief, the hand everyone is dealt,
 * and the local leaderboard for it. Playing is what actually locks in the
 * hand — this screen only shows what it is.
 */
export function ChallengeScreen() {
  const { t, locale } = useI18n();
  const goToIntro = useCareerStore((s) => s.goToIntro);
  const startChallenge = useCareerStore((s) => s.startChallenge);
  const sound = useSound();

  const challenge = useMemo(() => getDailyChallenge(todayChallengeId()), []);
  const country = getCountryByIso(challenge.countryIso) ?? getCountryByIso("BR")!;
  const alreadyRanked = hasRankedAttempt(challenge.id);
  const board = standings(8);
  const stats = challengeStats();

  return (
    <div className="animate-fade-in mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          {t("challenge.title")}
        </h1>
        <p className="text-sm text-muted">{t("challenge.subtitle")}</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="panel flex flex-col gap-4 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              {t("challenge.objective")}
            </p>
            <h2 className="mt-1 font-display text-xl font-black tracking-tight">
              {t(`challenge.missions.${challenge.mission.key}.title`)}
            </h2>
            <p className="mt-1 text-sm leading-snug text-muted">
              {t(`challenge.missions.${challenge.mission.key}.brief`)}
            </p>
            <p className="mt-2 text-xs font-semibold text-muted-2">
              {t("challenge.target")}: {challenge.mission.target} {t(`challenge.units.${challenge.mission.unit}`)}
            </p>
          </div>

          <div className="rounded-xl bg-surface-2/50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
              {t("challenge.dealtHand")}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flag src={country.flag_url} alt={countryName(country, locale)} className="h-4 w-6" />
                <span className="text-sm font-semibold">{countryName(country, locale)}</span>
              </div>
              <span className="text-muted-2">·</span>
              <span className="text-sm font-semibold">{t(`positions.${challenge.position}`)}</span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-danger">
              {t("challenge.hardNote")}
            </p>
          </div>

          {alreadyRanked && (
            <p className="rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 text-xs leading-snug text-gold">
              {t("challenge.alreadyPlayed")}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              startChallenge();
              sound("whistle");
            }}
            className="mt-auto rounded-full bg-pitch px-6 py-2.5 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            {t("challenge.play")}
          </button>
        </section>

        <section className="panel flex max-h-[min(60vh,28rem)] flex-col p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
            {t("challenge.ranking")}
          </p>

          {stats.played > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              <MiniStat label={t("challenge.played")} value={stats.played} />
              <MiniStat label={t("challenge.yourBest")} value={stats.bestScore} highlight />
              <MiniStat label={t("challenge.average")} value={stats.averageScore} />
              <MiniStat label={t("challenge.cleanRuns")} value={stats.cleanRuns} />
            </div>
          )}

          <div className="scrollbar-thin mt-3 min-h-0 flex-1 overflow-y-auto">
            {board.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">{t("challenge.empty")}</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {board.map((entry, i) => {
                  const mission = missionById(entry.missionId);
                  return (
                    <li
                      key={`${entry.challengeId}-${entry.finishedAt}`}
                      className="flex items-center gap-2.5 rounded-lg bg-surface-2/50 px-3 py-2"
                    >
                      <span className="w-4 shrink-0 text-right font-display text-xs font-black text-muted-2">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{entry.playerName}</p>
                        <p className="truncate text-[10px] text-muted-2">
                          {mission ? t(`challenge.missions.${mission.key}.title`) : entry.missionId}
                          {" · "}
                          {entry.challengeId}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-sm font-black text-gold">
                        {entry.score}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => {
            goToIntro();
            sound("back");
          }}
          className="rounded-full px-5 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          {t("challenge.back")}
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-2/50 px-2 py-1.5 text-center">
      <p className={`font-display text-sm font-black ${highlight ? "text-gold" : ""}`}>{value}</p>
      <p className="truncate text-[8px] font-bold uppercase tracking-wider text-muted-2">{label}</p>
    </div>
  );
}
