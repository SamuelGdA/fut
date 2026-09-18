"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import {
  BANK_MIN_AGE,
  HIDDEN_REVEAL_AGE,
  getDailyChallenge,
  liveTwilightStatus,
  type DailyChallenge,
} from "@/lib/challenge/daily";
import { buildCareerMetrics } from "@/lib/challenge/metrics";
import type { Mission } from "@/lib/challenge/missions";
import type { CareerState } from "@/lib/sim/career";

/**
 * The day's brief, live, while the challenge is being played.
 *
 * A three-objective format only creates a decision if the player can see where
 * they stand on each one — otherwise "which do I sacrifice" is a guess rather
 * than a judgement. So every brief shows real progress against its target,
 * recomputed from the career as it stands.
 *
 * Two things are deliberately withheld. The third brief stays sealed until the
 * reveal age, because knowing it from the start would let the whole career be
 * planned from the menu. And nothing here says which two are currently
 * counting — the player can see the numbers and work that out themselves.
 */
export function ChallengeHud({ career }: { career: CareerState }) {
  const { t } = useI18n();
  const challengeId = useCareerStore((s) => s.challengeId);

  const challenge = useMemo<DailyChallenge | null>(
    () => (challengeId ? getDailyChallenge(challengeId) : null),
    [challengeId],
  );
  const metrics = useMemo(() => buildCareerMetrics(career), [career]);

  if (!challenge) return null;

  const revealed = career.player.age >= HIDDEN_REVEAL_AGE;
  const edictHolds = challenge.edict.holds(metrics);
  const edictProgress = challenge.edict.progress?.(metrics);
  const canBank = career.player.age >= BANK_MIN_AGE;
  const twilight = liveTwilightStatus(career, metrics);

  return (
    <section className="panel p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          {t("challenge.objective")}
        </h2>
        <p className="text-[10px] text-muted-2">{t("challenge.bestTwoRule")}</p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {challenge.openMissions.map((mission) => (
          <MissionRow key={mission.id} mission={mission} metrics={metrics} t={t} />
        ))}
        {revealed ? (
          <MissionRow mission={challenge.hiddenMission} metrics={metrics} t={t} justRevealed />
        ) : (
          <li className="rounded-lg border border-dashed border-line px-2.5 py-1.5">
            <p className="text-[11px] font-semibold text-muted-2">
              🔒 {t("challenge.hiddenBriefNote", { age: HIDDEN_REVEAL_AGE })}
            </p>
          </li>
        )}
      </ul>

      {edictProgress ? (
        <div
          className={`mt-2 rounded-lg px-2.5 py-1.5 ${
            edictHolds ? "bg-pitch/10" : "bg-surface-2/50"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="min-w-0 truncate text-[11px] font-bold">
              {t(`challenge.edicts.${challenge.edict.key}.title`)}
            </p>
            <p
              className={`shrink-0 font-mono text-[10px] tabular-nums ${edictHolds ? "text-pitch" : "text-muted-2"}`}
            >
              {edictProgress.current}/{edictProgress.target}
            </p>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-background/60">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${edictHolds ? "bg-pitch" : "bg-muted-2"}`}
              style={{ width: `${Math.max(2, (edictProgress.current / edictProgress.target) * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div
          className={`mt-2 rounded-lg border px-2.5 py-1.5 ${
            edictHolds ? "border-line bg-surface-2/50" : "border-danger/50 bg-danger/10"
          }`}
        >
          <p className="flex items-center gap-1.5 text-[11px] font-semibold">
            <span className={edictHolds ? "text-muted-2" : "text-danger"} aria-hidden>
              {edictHolds ? "🚫" : "✕"}
            </span>
            <span className={edictHolds ? "text-muted" : "text-danger"}>
              {t(`challenge.edicts.${challenge.edict.key}.title`)}
            </span>
            {!edictHolds && (
              <span className="ml-auto shrink-0 text-[10px] font-black uppercase tracking-wider text-danger">
                {t("challenge.ruleBroken")}
              </span>
            )}
          </p>
        </div>
      )}

      {canBank &&
        (twilight.fadedSeasons > 0 ? (
          <p className="mt-1.5 text-[10px] font-bold leading-snug text-danger">
            {t("challenge.twilightPenalty", {
              seasons: twilight.fadedSeasons,
              percent: Math.round((1 - twilight.multiplier) * 100),
            })}
          </p>
        ) : (
          <p className="mt-1.5 text-[10px] leading-snug text-muted-2">
            {t("challenge.bankRule", { age: BANK_MIN_AGE })}
          </p>
        ))}
    </section>
  );
}

function MissionRow({
  mission,
  metrics,
  t,
  justRevealed,
}: {
  mission: Mission;
  metrics: ReturnType<typeof buildCareerMetrics>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  justRevealed?: boolean;
}) {
  const progress = Math.max(0, mission.progress(metrics));
  const pct = Math.min(100, (progress / mission.target) * 100);
  const done = progress >= mission.target;
  const brief = t(`challenge.missions.${mission.key}.brief`);

  return (
    <li
      // The brief is on every row as a tooltip: the two open ones were read on
      // the pre-match card and are easy to forget twenty seasons later.
      title={brief}
      className={`rounded-lg px-2.5 py-1.5 ${
        justRevealed ? "bg-gold/10 ring-1 ring-gold/25" : "bg-surface-2/50"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-bold">
          {t(`challenge.missions.${mission.key}.title`)}
        </p>
        {/* The unit belongs next to the number. Several briefs are scored on
            a points curve rather than on a raw count, and "34/34" with no
            unit read as a demand for thirty-four trophies. */}
        <p
          className={`shrink-0 font-mono text-[10px] tabular-nums ${done ? "text-pitch" : "text-muted-2"}`}
          title={`${Math.round(progress)}/${mission.target} ${t(`challenge.units.${mission.unit}`)}`}
        >
          {Math.round(progress)}/{mission.target}
          <span className="ml-1 font-sans text-[9px] normal-case opacity-70">
            {t(`challenge.unitsShort.${mission.unit}`)}
          </span>
        </p>
      </div>
      {/* The third brief is sealed until the reveal age, so unlike the other
          two it was never read on the pre-match card. Printing it in full the
          moment it opens is the only chance the player gets to learn what it
          actually asks for — the title alone ("Temporada mágica") says
          nothing about what to go and do. */}
      {justRevealed && <p className="mt-0.5 text-[10px] leading-snug text-muted">{brief}</p>}
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-background/60">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${done ? "bg-pitch" : "bg-muted-2"}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
    </li>
  );
}
