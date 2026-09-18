"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n/context";
import { ClubCrest, TrophyImage } from "./Media";
import { getTeam } from "@craque/data";
import { periodRows, type CareerState, type SeasonSnapshot } from "@/lib/sim/career";
import { resolveTrophy } from "@/lib/trophyDisplay";
import { AWARD_IMAGES } from "@craque/data";
import { addStats } from "@/lib/sim/engine";
import { EMPTY_STATS, isDefender } from "@/lib/sim/constants";

export function CareerTable({ career }: { career: CareerState }) {
  const { t } = useI18n();
  const rows = periodRows(career);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLTableRowElement>(null);
  const isGk = career.player.role === "goalkeeper";
  // A back four is not read off goals and assists, so a defender's row
  // carries the number their season is actually judged on as well.
  const showCleanSheets = isDefender(career.player.position);
  const confederation = career.player.nationality.confederation;
  // Clubs that will never take this player back — walked out on for a rival,
  // or run out of town by the stand. It was only ever visible on the summary
  // timeline at the end of a career, so the season it happened in showed
  // nothing at all while the player was still playing.
  //
  // Marked on the last season at that club rather than on all of them: the
  // badge is about the exit, and repeating it down five rows of the same spell
  // says the same thing five times.
  const burntExitAge = new Map<string, number>();
  for (const teamId of career.betrayedClubs ?? []) {
    const last = career.seasons.filter((s) => s.teamId === teamId).pop();
    if (last) burntExitAge.set(teamId, last.age);
  }

  // Keep the season being played in view. The table runs from 16 to 39, so by
  // the middle of a career the row that actually matters has scrolled off the
  // top and the player is looking at their teenage years while deciding their
  // thirties. Scrolls the container rather than calling scrollIntoView, which
  // would drag the whole page along with it.
  //
  // Anchored near the *bottom* of the box rather than centred: centring put the
  // current row in the middle and filled the rest of the view with locked,
  // blank future seasons — for a career still in its teens that's most of the
  // panel showing nothing. Pinning the current row near the bottom instead
  // fills the space above it with the seasons actually played, which is the
  // point of a history table.
  //
  // Re-anchored on resize as well as on the season changing. The box is a
  // fixed slice of a layout that reflows — moving between the stacked and
  // the two-column shell, or simply dragging the window shorter, changes
  // how many rows fit. Anchoring only on `currentAge` left those cases
  // showing whatever happened to be at the old scroll offset, which for a
  // player in their thirties was their teenage years.
  const currentAge = career.player.age;
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;

    const anchor = (smooth: boolean) => {
      const row = currentRef.current;
      if (!row || box.clientHeight === 0) return;
      const padding = 8;
      const target = row.offsetTop + row.clientHeight - box.clientHeight + padding;
      box.scrollTo({
        top: Math.max(0, target),
        behavior:
          smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "smooth"
            : "auto",
      });
    };

    anchor(true);
    const observer = new ResizeObserver(() => anchor(false));
    observer.observe(box);
    return () => observer.disconnect();
  }, [currentAge]);

  // What the empty "?" row is waiting on. `career_event` and `training_focus`
  // are not about signing anywhere, so lumping them in with "Escolhendo
  // clube..." was wrong — a training-focus choice at pre-season was labelled
  // as if the player were picking a new team.
  const pendingLabel =
    career.currentEvent?.type === "career_event"
      ? t("career.careerEventPending")
      : career.currentEvent?.type === "training_focus"
        ? t("career.trainingFocusPending")
        : t("career.choosingClub");

  return (
    // overflow-x-hidden stays as a safety net, but it should never actually
    // trigger any more: `table-fixed` plus the `colgroup` below give the four
    // number columns a hard pixel width up front, so the browser never has to
    // size the table from content — which is what made an auto-layout table a
    // few px wider than its box (leaving overflow-x at its default `visible`
    // next to `overflow-y-auto` also gets computed as `auto` by the spec,
    // which was the actual sideways scrollbar). The old fix clipped the last
    // few pixels of the club name to hide the overflow; this removes the
    // overflow instead, so nothing gets cut.
    <div ref={scrollRef} className="scrollbar-thin h-full overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-surface">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          {/* Wide enough for the "IDADE" header itself, not just a two-digit
              age — at w-9 the label overflowed into the club column next to
              it, which is what actually crowded the two together. */}
          <col className="w-12" />
          <col />
          <col className="w-12" />
          <col className="w-12" />
          <col className="w-12" />
          <col className="w-12" />
          {showCleanSheets && <col className="w-12" />}
        </colgroup>
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-2">
            <th className="px-1.5 py-3" title={t("career.hints.age")}>{t("career.age")}</th>
            <th className="px-1.5 py-3" title={t("career.hints.club")}>{t("career.club")}</th>
            <th className="px-1.5 py-3 text-right" title={t("career.hints.overall")}>{t("career.overall")}</th>
            <th className="px-1.5 py-3 text-right" title={t("career.hints.appearances")}>{t("career.appearances")}</th>
            <th
              className="px-1.5 py-3 text-right"
              title={t(isGk ? "career.hints.cleanSheets" : "career.hints.goals")}
            >
              {isGk ? t("career.cleanSheets") : t("career.goals")}
            </th>
            <th
              className="px-1.5 py-3 text-right"
              title={t(isGk ? "career.hints.goalsConceded" : "career.hints.assists")}
            >
              {isGk ? t("career.goalsConceded") : t("career.assists")}
            </th>
            {showCleanSheets && (
              <th className="px-1.5 py-3 text-right" title={t("career.hints.cleanSheets")}>
                {t("career.cleanSheets")}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.status !== "done") {
              return (
                <tr
                  key={row.age}
                  ref={row.age === currentAge ? currentRef : undefined}
                  className={`border-t border-line ${row.status === "locked" ? "opacity-40" : ""}`}
                >
                  <td className="px-1.5 py-2.5 font-semibold text-muted-2">{row.age}</td>
                  <td className="px-3 py-2.5 text-muted-2">
                    {row.status === "pending" && (
                      <>
                        <span className="block font-semibold text-foreground">?</span>
                        <span className="block text-xs italic">{pendingLabel}</span>
                      </>
                    )}
                  </td>
                  <td className="px-1.5 py-2.5 text-right font-semibold text-muted-2">
                    {row.status === "pending" ? career.player.overall : ""}
                  </td>
                  <td className="px-1.5 py-2.5" />
                  <td className="px-1.5 py-2.5" />
                  <td className="px-1.5 py-2.5" />
                  {showCleanSheets && <td className="px-1.5 py-2.5" />}
                </tr>
              );
            }

            const stats = row.seasons.reduce((acc, s) => addStats(acc, s.stats), { ...EMPTY_STATS });
            const primary = row.seasons[0];
            const team = getTeam(primary.teamId);
            const lastOverall = row.seasons[row.seasons.length - 1].overall;
            const trophies = row.seasons.flatMap((s) =>
              s.trophies.map((k) => resolveTrophy(k, s.teamId, confederation, t, s.leagueTier)),
            );
            const awards = row.seasons.flatMap((s) => s.awards);
            const relegated = row.seasons.some((s) => s.relegated);
            const promoted = row.seasons.some((s) => s.promoted);
            const suspended = row.seasons.some((s) => s.suspended);

            return (
              <tr
                key={row.age}
                ref={row.age === currentAge ? currentRef : undefined}
                className="border-t border-line align-top"
              >
                <td className="px-1.5 py-2.5 font-semibold">{row.age}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    {team && <ClubCrest teamId={team.id} name={team.name} size={18} className="mt-0.5 h-[18px] w-[18px]" />}
                    <div className="min-w-0">
                      <span className="block truncate">{team?.name ?? ""}</span>
                      <ClubBadges
                        seasons={row.seasons}
                        relegated={relegated}
                        promoted={promoted}
                        suspended={suspended}
                        traitor={row.seasons.some(
                          (s) => burntExitAge.get(s.teamId) === s.age,
                        )}
                      />
                      {(trophies.length > 0 || awards.length > 0) && (
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {trophies.map((trophy, i) => (
                            <TrophyImage
                              key={`${trophy.key}-${i}`}
                              src={trophy.imageUrl}
                              alt={trophy.name}
                              className="h-4 w-4"
                            />
                          ))}
                          {awards.map((award, i) => (
                            <TrophyImage key={`${award}-${i}`} src={AWARD_IMAGES[award]} alt={award} className="h-4 w-4" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-1.5 py-2.5 text-right font-semibold">{lastOverall}</td>
                <td className="px-1.5 py-2.5 text-right">{stats.appearances}</td>
                <td className="px-1.5 py-2.5 text-right">{isGk ? stats.cleanSheets : stats.goals}</td>
                <td className="px-1.5 py-2.5 text-right">{isGk ? stats.goalsConceded : stats.assists}</td>
                {showCleanSheets && (
                  <td className="px-1.5 py-2.5 text-right">{stats.cleanSheets}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ClubBadges({
  seasons,
  relegated,
  promoted,
  suspended,
  traitor,
}: {
  seasons: SeasonSnapshot[];
  relegated: boolean;
  promoted: boolean;
  suspended: boolean;
  /** This club will never have the player back — see the note at the caller. */
  traitor: boolean;
}) {
  const { t } = useI18n();
  const onLoan = seasons.some((s) => s.onLoan);
  // Knocks still cost appearances in the sim, but they are deliberately silent
  // in the UI now: a "3 jogos fora" chip on half the rows was noise for
  // something the player never decides on and cannot act upon. The dip in the
  // appearance column is the whole story.
  if (!onLoan && !relegated && !promoted && !suspended && !traitor) return null;

  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1">
      {suspended && (
        <span className="rounded-full bg-danger px-1.5 py-0.5 text-[8px] font-black uppercase leading-none text-white">
          {t("career.suspended")}
        </span>
      )}
      {onLoan && (
        <Tag tone="neutral" title={t("career.joinLoanDescription", { team: "" })}>
          ⇄
        </Tag>
      )}
      {promoted && <Tag tone="good" title={t("career.promotion")}>▲</Tag>}
      {traitor && (
        <span
          className="rounded-full bg-danger/20 px-1.5 py-0.5 text-[8px] font-black uppercase leading-none text-danger"
          title={t("career.traitorHint")}
        >
          {t("career.traitorLabel")}
        </span>
      )}
      {relegated && <Tag tone="bad" title={t("career.relegation")}>{t("career.relegation")}</Tag>}
    </div>
  );
}

function Tag({
  children,
  tone,
  title,
}: {
  children: React.ReactNode;
  tone: "neutral" | "good" | "bad";
  title?: string;
}) {
  const cls =
    tone === "good"
      ? "bg-pitch/15 text-pitch"
      : tone === "bad"
        ? "bg-danger/15 text-danger"
        : "bg-white/10 text-muted-2";
  return (
    <span title={title} className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${cls}`}>
      {children}
    </span>
  );
}
