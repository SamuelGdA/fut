import { type Achievement, ACHIEVEMENT_GROUPS, achievementGroupName, ACHIEVEMENTS, achievementText } from "@craque/content";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "../../app/navigation";
import { type ArchiveEntry, type AttemptEntry, rankedDays } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { formatShortDate } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Loading } from "../../ui/Loading";

/**
 * As conquistas (GDD 28.2): permanentes entre carreiras, em oito grupos. A
 * liberada diz quem liberou e quando; a de contagem mostra o progresso: a
 * melhor carreira do Hall (contagem guardada com ela) ou o contador entre
 * carreiras. É exploração: a página rola.
 */
export function AchievementsScreen() {
  const { t, locale } = useT();
  const go = useNavigation((state) => state.go);
  const status = useHall((state) => state.status);
  const unlocked = useHall((state) => state.achievements);
  const entries = useHall((state) => state.entries);
  const attempts = useHall((state) => state.attempts);

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  const byId = new Map(unlocked.map((row) => [row.id, row]));
  const total = ACHIEVEMENTS.length;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-glory">{t("achievements.eyebrow")}</p>
          <h1 className="display mt-2 text-5xl font-black uppercase sm:text-6xl">{t("achievements.title")}</h1>
          <p className="mt-3 max-w-xl text-muted">{t("achievements.lead")}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="display numeric text-4xl font-black">{t("achievements.count", { count: byId.size, total })}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              feedback("back");
              go("hall");
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t("home.hall")}
          </Button>
        </div>
      </div>

      {status !== "ready" ? (
        <Loading label={t("achievements.loading")} className="min-h-[30dvh]" />
      ) : (
        <div className="flex flex-col gap-8">
          {ACHIEVEMENT_GROUPS.map((group) => {
            const items = ACHIEVEMENTS.filter((item) => item.group === group);
            const done = items.filter((item) => byId.has(item.id)).length;
            return (
              <section key={group} aria-labelledby={`grupo-${group}`}>
                <h2 id={`grupo-${group}`} className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <span className="display text-2xl font-black uppercase">{achievementGroupName(locale, group)}</span>
                  <span className="numeric text-sm text-muted">{t("achievements.count", { count: done, total: items.length })}</span>
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const row = byId.get(item.id);
                    const text = achievementText(locale, item.id);
                    const progress = row ? null : bestProgress(item, entries, attempts);
                    return (
                      <li key={item.id} className="achievement" data-unlocked={row ? true : undefined}>
                        <span className="achievement-mark" aria-hidden="true">
                          {row ? <Check size={20} strokeWidth={3} /> : <Lock size={16} />}
                        </span>
                        <div className="min-w-0">
                          <p className="achievement-name">{text.name}</p>
                          <p className="mt-1 text-sm text-muted">{text.description}</p>
                          {row ? (
                            <p className="mt-1.5 text-2xs text-glory">
                              {t("achievements.by", { surname: row.by, date: formatShortDate(row.at, locale) })}
                            </p>
                          ) : (
                            <p className="mt-1.5 text-2xs text-faint">
                              <span className="sr-only">{t("achievements.locked")}. </span>
                              {progress ? t("achievements.progress", { value: progress.value, target: progress.target }) : null}
                            </p>
                          )}
                          {progress ? (
                            <div className="mission-bar mt-1.5" aria-hidden="true">
                              <span style={{ transform: `scaleX(${Math.min(1, progress.value / progress.target)})` }} />
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** O progresso de uma conquista de contagem: a melhor carreira do Hall, ou o contador entre carreiras. */
function bestProgress(item: Achievement, entries: readonly ArchiveEntry[], attempts: readonly AttemptEntry[]) {
  const target = item.target;
  if (!item.count || target === undefined) return null;
  let value = 0;
  if (item.id === "tenCareers") value = entries.filter((entry) => entry.status === "finished").length;
  else if (item.id === "challengeWeek") value = rankedDays(attempts);
  else for (const entry of entries) value = Math.max(value, entry.counts[item.id] ?? 0);
  return { value: Math.min(value, target), target };
}
