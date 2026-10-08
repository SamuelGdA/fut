import { type Achievement, ACHIEVEMENT_GROUPS, achievementGroupName, ACHIEVEMENTS, achievementText } from "@craque/content";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { type AttemptEntry, rankedDays } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { formatShortDate } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Loading } from "../../ui/Loading";

/** Conquistas permanentes em dez abas; contagens agregadas sem arquivos de carreiras (D47). */
export function AchievementsScreen() {
  const { t, locale } = useT();
  const go = useNavigation((state) => state.go);
  const status = useHall((state) => state.status);
  const unlocked = useHall((state) => state.achievements);
  const progressCounts = useHall((state) => state.progress);
  const finished = useHall((state) => state.finished);
  const [tab, setTab] = useState<(typeof ACHIEVEMENT_GROUPS)[number]>("career");
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
              go("home");
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t("nav.home")}
          </Button>
        </div>
      </div>

      {status !== "ready" ? (
        <Loading label={t("achievements.loading")} className="min-h-[30dvh]" />
      ) : (
        <BaseTabs.Root className="flex flex-col gap-8" value={tab} onValueChange={(value) => {
          const next = ACHIEVEMENT_GROUPS.find((group) => group === value);
          if (next && next !== tab) { setTab(next); feedback("tick"); }
        }}>
          <BaseTabs.List className="flex flex-wrap gap-2" aria-label={t("achievements.title")}>
            {ACHIEVEMENT_GROUPS.map((group) => (
              <BaseTabs.Tab key={group} value={group} className="explore-tab" data-active={tab === group || undefined}>
                {achievementGroupName(locale, group)}
              </BaseTabs.Tab>
            ))}
          </BaseTabs.List>
          {ACHIEVEMENT_GROUPS.filter((group) => group === tab).map((group) => {
            const items = ACHIEVEMENTS.filter((item) => item.group === group);
            const done = items.filter((item) => byId.has(item.id)).length;
            return (
              <BaseTabs.Panel key={group} value={group}>
                <h2 id={`titulo-${group}`} className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <span className="display text-2xl font-black uppercase">{achievementGroupName(locale, group)}</span>
                  <span className="numeric text-sm text-muted">{t("achievements.count", { count: done, total: items.length })}</span>
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const row = byId.get(item.id);
                    const text = group === "secret" && !row ? { name: t("achievements.secretName"), description: t("achievements.secretHint") } : achievementText(locale, item.id);
                    const progress = row ? null : bestProgress(item, progressCounts, finished, attempts);
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
              </BaseTabs.Panel>
            );
          })}
        </BaseTabs.Root>
      )}
    </div>
  );
}

/** O progresso de uma conquista de contagem: as melhores contagens agregadas, ou o contador entre carreiras. */
function bestProgress(item: Achievement, counts: Readonly<Record<string, number>>, finished: number, attempts: readonly AttemptEntry[]) {
  const target = item.target;
  if (!item.count || target === undefined) return null;
  let value: number;
  if (item.id === "tenCareers") value = finished;
  else if (item.id === "challengeWeek") value = rankedDays(attempts);
  else value = counts[item.id] ?? 0;
  return { value: Math.min(value, target), target };
}
