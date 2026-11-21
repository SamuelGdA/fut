import { useOwnAttempts } from "../../features/hall/ownAttempts";
import { type Achievement, ACHIEVEMENT_GROUPS, achievementGroupName, ACHIEVEMENT_RARITIES, achievementRarity, ACHIEVEMENTS, achievementText } from "@craque/content";
import { COACH_ACHIEVEMENTS, coachAchievementRarity, coachAchievementText } from "@craque/content/coach";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { ArrowLeft, BarChart3, LogIn, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { openLogin } from "../../features/account/openLogin";
import { useAccount } from "../../features/account/store";
import { AdSlot } from "../../features/ads/AdSlot";
import { type AttemptEntry, rankedDays } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { formatShortDate } from "../../i18n/format";
import { TECNICO_BLOCKED } from "../../lib/modes";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Segmented } from "../../ui/Segmented";
import { Skeleton } from "../../ui/Skeleton";
import { TrophyIcon } from "./TrophyIcon";

type Game = "craque" | "tecnico";

/** Uma conquista liberada, venha do aparelho ou da conta. */
interface Unlocked {
  readonly at: number;
  /** Em quantas carreiras caiu (só com conta; no aparelho, 0 esconde o selo). */
  readonly quantity: number;
  /** O sobrenome que liberou, só nas conquistas do aparelho. */
  readonly by: string | null;
}

/**
 * Conquistas permanentes (D47, D54 e D112). Sem nuvem no build, como sempre:
 * as do aparelho. Com contas, o visitante vê o convite para entrar (colecionar
 * é de quem tem conta) e quem está logado vê a coleção da conta somada à do
 * aparelho, cada troféu com a quantidade de carreiras em que caiu. Bloqueado
 * fica em cinza; liberado ganha cor e brilho.
 */
export function AchievementsScreen() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const status = useAccount((state) => state.status);
  const hallStatus = useHall((state) => state.status);
  const dataStatus = useAccount((state) => state.dataStatus);

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16">
      {status === "guest" ? (
        <AchievementsGate />
      ) : (
        <>
          <Header />
          {hallStatus !== "ready" || status === "checking" ? (
            <AchievementsSkeleton label={t("achievements.loading")} />
          ) : status === "member" && dataStatus !== "ready" && dataStatus !== "error" ? (
            <AchievementsSkeleton label={t("achievements.syncing")} />
          ) : (
            <Collection />
          )}
          <AdSlot id="conquistas-rodape" className="mt-10" />
        </>
      )}
      {status === "guest" ? null : (
        <Button
          variant="ghost"
          size="sm"
          className="mt-8"
          onClick={() => {
            feedback("back");
            go("hub");
          }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t("brand.hub")}
        </Button>
      )}
    </div>
  );
}

/** O que a tela sabe de cada conquista liberada: a conta primeiro, o aparelho completa. */
function useUnlocked(): Map<string, Unlocked> {
  const local = useHall((state) => state.achievements);
  const status = useAccount((state) => state.status);
  const trophies = useAccount((state) => state.trophies);
  const map = new Map<string, Unlocked>();
  for (const row of local) map.set(row.id, { at: row.at, quantity: 0, by: row.by || null });
  if (status === "member") {
    for (const trophy of trophies) map.set(trophy.id_trophy, { at: Date.parse(trophy.data_desbloqueio), quantity: trophy.quantidade, by: null });
  }
  return map;
}

function Header() {
  const { t } = useT();
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="eyebrow text-glory">{t("achievements.eyebrow")}</p>
        <h1 className="display mt-2 text-5xl font-black uppercase sm:text-6xl">{t("achievements.title")}</h1>
        <p className="mt-3 max-w-xl text-muted">{t("achievements.lead")}</p>
      </div>
    </div>
  );
}

/** O visitante que abre as conquistas (D112): o convite para entrar. */
function AchievementsGate() {
  const { t, locale } = useT();
  const go = useNavigation((state) => state.go);
  const points = [
    { icon: Trophy, text: t("account.gate.points.trophies") },
    { icon: Medal, text: t("account.gate.points.ranking") },
    { icon: BarChart3, text: t("account.gate.points.stats") },
  ];
  // Três troféus de vitrine, bloqueados: mostram o que espera do outro lado.
  const preview = ["title:cont1:CONMEBOL", "ballonDor", "record:careerGoals"];
  return (
    <section className="achievements-gate" aria-labelledby="gate-title">
      <div className="achievements-gate-trophies" aria-hidden="true">
        {preview.map((id, index) => (
          <TrophyIcon key={id} id={id} group={index === 2 ? "records" : "titles"} rarity={index === 0 ? "epic" : "legendary"} unlocked={false} label="" language={locale} size="lg" />
        ))}
      </div>
      <p className="eyebrow text-glory">{t("account.gate.eyebrow")}</p>
      <h1 id="gate-title" className="display mt-2 text-5xl font-black uppercase sm:text-6xl">{t("account.gate.title")}</h1>
      <p className="mt-3 max-w-xl text-lg text-fg">{t("account.gate.body")}</p>
      <ul className="auth-perks mt-5">
        {points.map(({ icon: Icon, text }) => (
          <li key={text}>
            <span className="auth-perk-icon" aria-hidden="true"><Icon size={16} /></span>
            {text}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap gap-2">
        <Button
          size="lg"
          variant="glory"
          onClick={() => {
            feedback("confirm");
            openLogin("achievements");
          }}
        >
          <LogIn size={18} aria-hidden="true" />
          {t("account.gate.action")}
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => {
            feedback("back");
            go("hub");
          }}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {t("account.gate.back")}
        </Button>
      </div>
    </section>
  );
}

function AchievementsSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <Skeleton className="mb-6 h-11 w-full max-w-sm" />
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-9 w-24" />)}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <li key={index} className="achievement">
            <Skeleton round className="size-12" />
            <span className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Collection() {
  const { t, tp, locale } = useT();
  const status = useAccount((state) => state.status);
  const cloudProgress = useAccount((state) => state.profile?.progresso);
  const localProgress = useHall((state) => state.progress);
  const finished = useHall((state) => state.finished);
  const attempts = useOwnAttempts();
  const cloudCareers = useAccount((state) => state.profile?.carreiras ?? 0);
  const [tab, setTab] = useState<(typeof ACHIEVEMENT_GROUPS)[number]>("career");
  const [game, setGame] = useState<Game>("craque");
  const unlocked = useUnlocked();
  const member = status === "member";

  // Com conta, vale a melhor contagem entre o aparelho e a nuvem.
  const progressCounts: Record<string, number> = { ...localProgress };
  if (member && cloudProgress) for (const [id, value] of Object.entries(cloudProgress)) progressCounts[id] = Math.max(progressCounts[id] ?? 0, value);
  const careers = member ? Math.max(finished, cloudCareers) : finished;

  const total = game === "craque" || TECNICO_BLOCKED ? ACHIEVEMENTS.length : COACH_ACHIEVEMENTS.length;
  const done = game === "craque" || TECNICO_BLOCKED ? ACHIEVEMENTS.filter((item) => unlocked.has(item.id)).length : COACH_ACHIEVEMENTS.filter((item) => unlocked.has(item.id)).length;

  const footnote = (row: Unlocked | undefined) => {
    if (!row) return null;
    if (member && row.quantity > 0) return `${tp("achievements.quantity", row.quantity)} · ${t("achievements.firstTime", { date: formatShortDate(row.at, locale) })}`;
    return row.by ? t("achievements.by", { surname: row.by, date: formatShortDate(row.at, locale) }) : t("achievements.firstTime", { date: formatShortDate(row.at, locale) });
  };
  const label = (name: string, row: Unlocked | undefined) =>
    row ? `${t("achievements.trophyUnlocked", { name })}${row.quantity > 0 ? `, ${tp("achievements.quantity", row.quantity).toLocaleLowerCase(locale)}` : ""}` : t("achievements.trophyLocked", { name });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* D124: com o Técnico bloqueado, só as conquistas do Craque aparecem. */}
        {TECNICO_BLOCKED ? null : <div className="w-full max-w-sm">
          <Segmented<Game>
            block
            className="seg-games"
            label={t("achievements.title")}
            value={game}
            onValueChange={(next) => {
              setGame(next);
              feedback("tick");
            }}
            options={[
              { value: "craque", label: t("brand.games.craque") },
              { value: "tecnico", label: t("brand.games.tecnico") },
            ]}
          />
        </div>}
        <p className="display numeric text-4xl font-black">{t("achievements.count", { count: done, total })}</p>
      </div>

      {game === "tecnico" && !TECNICO_BLOCKED ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortTecnico(locale).map((item) => {
            const row = unlocked.get(item.id);
            const text = coachAchievementText(locale, item.id);
            const rarity = coachAchievementRarity(item.id);
            return (
              <li key={item.id} className="achievement" data-unlocked={row ? true : undefined} data-rarity={rarity}>
                <TrophyIcon className="achievement-mark" id={item.id} group="tecnico" rarity={rarity} unlocked={row !== undefined} quantity={row?.quantity} label={label(text.name, row)} language={locale} />
                <div className="min-w-0">
                  <p className="achievement-name">{text.name}</p>
                  <p className="mt-1 text-sm text-muted">{text.description}</p>
                  <span className="achievement-rarity">{t(`achievements.rarity.${rarity}`)}</span>
                  {row ? <p className="mt-1.5 text-2xs text-glory">{footnote(row)}</p> : <p className="sr-only">{t("achievements.locked")}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <BaseTabs.Root
          className="flex flex-col gap-8"
          value={tab}
          onValueChange={(value) => {
            const next = ACHIEVEMENT_GROUPS.find((group) => group === value);
            if (next && next !== tab) {
              setTab(next);
              feedback("tick");
            }
          }}
        >
          <BaseTabs.List className="flex flex-wrap gap-2" aria-label={t("achievements.title")}>
            {ACHIEVEMENT_GROUPS.map((group) => (
              <BaseTabs.Tab key={group} value={group} className="explore-tab" data-active={tab === group || undefined}>
                {achievementGroupName(locale, group)}
              </BaseTabs.Tab>
            ))}
          </BaseTabs.List>
          {ACHIEVEMENT_GROUPS.filter((group) => group === tab).map((group) => {
            const items = sortByRarity(ACHIEVEMENTS.filter((item) => item.group === group), group, unlocked, locale);
            const groupDone = items.filter((item) => unlocked.has(item.id)).length;
            return (
              <BaseTabs.Panel key={group} value={group}>
                <h2 id={`titulo-${group}`} className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
                  <span className="display text-2xl font-black uppercase">{achievementGroupName(locale, group)}</span>
                  <span className="numeric text-sm text-muted">
                    {group === "records" ? t("achievements.recordsCollection", { count: groupDone, total: items.length }) : t("achievements.count", { count: groupDone, total: items.length })}
                  </span>
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const row = unlocked.get(item.id);
                    const hidden = group === "secret" && !row;
                    const text = hidden ? { name: t("achievements.secretName"), description: t("achievements.secretHint") } : achievementText(locale, item.id);
                    const progress = row ? null : bestProgress(item, progressCounts, careers, attempts);
                    // A secreta não entrega a raridade antes de cair (D94).
                    const rarity = hidden ? null : achievementRarity(item.id);
                    return (
                      <li key={item.id} className="achievement" data-unlocked={row ? true : undefined} data-rarity={rarity ?? undefined}>
                        <TrophyIcon
                          className="achievement-mark"
                          id={hidden ? "secret" : item.id}
                          group={item.group}
                          rarity={rarity}
                          unlocked={row !== undefined}
                          quantity={row?.quantity}
                          label={label(text.name, row)}
                          language={locale}
                        />
                        <div className="min-w-0">
                          <p className="achievement-name">{text.name}</p>
                          <p className="mt-1 text-sm text-muted">{text.description}</p>
                          {rarity ? <span className="achievement-rarity">{t(`achievements.rarity.${rarity}`)}</span> : null}
                          {row ? (
                            <p className="mt-1.5 text-2xs text-glory">{footnote(row)}</p>
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
    </>
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

/**
 * D106: cada aba vai da comum à lendária e, dentro da mesma raridade, em ordem
 * alfabética do nome no idioma da tela. A secreta ainda fechada não entrega
 * nome nem raridade, então fica no fim, na ordem do catálogo.
 */
function sortByRarity(items: readonly Achievement[], group: string, unlocked: ReadonlyMap<string, unknown>, locale: Parameters<typeof achievementText>[0]): Achievement[] {
  const hidden = (item: Achievement) => group === "secret" && !unlocked.has(item.id);
  const shown = items.filter((item) => !hidden(item));
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  shown.sort((a, b) =>
    ACHIEVEMENT_RARITIES.indexOf(achievementRarity(a.id)) - ACHIEVEMENT_RARITIES.indexOf(achievementRarity(b.id))
    || collator.compare(achievementText(locale, a.id).name, achievementText(locale, b.id).name));
  return [...shown, ...items.filter(hidden)];
}

/** As do Técnico seguem a mesma ordem (D112): da comum à lendária, e o nome. */
function sortTecnico(locale: Parameters<typeof achievementText>[0]) {
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return [...COACH_ACHIEVEMENTS].sort((a, b) =>
    ACHIEVEMENT_RARITIES.indexOf(coachAchievementRarity(a.id)) - ACHIEVEMENT_RARITIES.indexOf(coachAchievementRarity(b.id))
    || collator.compare(coachAchievementText(locale, a.id).name, coachAchievementText(locale, b.id).name));
}

