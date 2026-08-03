"use client";

import { useI18n } from "@/lib/i18n/context";
import { ClubCrest, TrophyImage } from "./Media";
import { getTeam } from "@/lib/data/dataset";
import { periodRows, type CareerState, type SeasonSnapshot } from "@/lib/sim/career";
import { resolveTrophy } from "@/lib/trophyDisplay";
import { AWARD_IMAGES } from "@/lib/data/trophies";
import { addStats } from "@/lib/sim/engine";
import { EMPTY_STATS } from "@/lib/sim/constants";

export function CareerTable({ career }: { career: CareerState }) {
  const { t } = useI18n();
  const rows = periodRows(career);
  const isGk = career.player.role === "goalkeeper";
  const confederation = career.player.nationality.confederation;

  const pendingLabel =
    career.currentEvent?.type === "career_event"
      ? t("career.careerEventPending")
      : t("career.choosingClub");

  return (
    <div className="scrollbar-thin h-full overflow-y-auto rounded-2xl border border-line bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted-2">
            <th className="px-3 py-3">{t("career.age")}</th>
            <th className="px-3 py-3">{t("career.club")}</th>
            <th className="px-3 py-3 text-right">{t("career.overall")}</th>
            <th className="px-3 py-3 text-right">{t("career.appearances")}</th>
            <th className="px-3 py-3 text-right">
              {isGk ? t("career.cleanSheets") : t("career.goals")}
            </th>
            <th className="px-3 py-3 text-right">
              {isGk ? t("career.goalsConceded") : t("career.assists")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.status !== "done") {
              return (
                <tr
                  key={row.age}
                  className={`border-t border-line ${row.status === "locked" ? "opacity-40" : ""}`}
                >
                  <td className="px-3 py-2.5 font-semibold text-muted-2">{row.age}</td>
                  <td className="px-3 py-2.5 text-muted-2">
                    {row.status === "pending" && (
                      <>
                        <span className="block font-semibold text-foreground">?</span>
                        <span className="block text-xs italic">{pendingLabel}</span>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-muted-2">
                    {row.status === "pending" ? career.player.overall : ""}
                  </td>
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5" />
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
              <tr key={row.age} className="border-t border-line align-top">
                <td className="px-3 py-2.5 font-semibold">{row.age}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    {team && <ClubCrest src={team.logo_url} name={team.name} size={18} className="mt-0.5 h-[18px] w-[18px]" />}
                    <div className="min-w-0">
                      <span className="block truncate">{team?.name ?? ""}</span>
                      <ClubBadges
                        seasons={row.seasons}
                        relegated={relegated}
                        promoted={promoted}
                        suspended={suspended}
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
                <td className="px-3 py-2.5 text-right font-semibold">{lastOverall}</td>
                <td className="px-3 py-2.5 text-right">{stats.appearances}</td>
                <td className="px-3 py-2.5 text-right">{isGk ? stats.cleanSheets : stats.goals}</td>
                <td className="px-3 py-2.5 text-right">{isGk ? stats.goalsConceded : stats.assists}</td>
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
}: {
  seasons: SeasonSnapshot[];
  relegated: boolean;
  promoted: boolean;
  suspended: boolean;
}) {
  const { t } = useI18n();
  const onLoan = seasons.some((s) => s.onLoan);
  if (!onLoan && !relegated && !promoted && !suspended) return null;

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
      {promoted && <Tag tone="good">▲</Tag>}
      {relegated && <Tag tone="bad">{t("career.relegation")}</Tag>}
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
