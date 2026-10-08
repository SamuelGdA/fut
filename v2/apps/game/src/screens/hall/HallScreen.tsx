import { getCountry, getCountryKit } from "@craque/world";
import { ArrowRight, Award, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { type ArchiveEntry, type HallFilter, HALL_SORTS, type HallSort, hallList, personalRecords } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { useHallView } from "../../features/hall/view";
import { formatShortDate } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Avatar } from "../../ui/Avatar";
import { Button, IconButton } from "../../ui/Button";
import { Loading } from "../../ui/Loading";
import { Flag } from "../../ui/Media";
import { ConfirmDialog } from "../../ui/Overlays";
import { Panel } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";

/**
 * O Hall da Fama (GDD 28.1): toda carreira terminada ou interrompida, com os
 * recordes pessoais no topo, ordenável e filtrável. Abrir leva ao resumo
 * daquela carreira em modo leitura; apagar pede confirmação. É exploração:
 * a página rola.
 */
export function HallScreen() {
  const { t, tp } = useT();
  const go = useNavigation((state) => state.go);
  const status = useHall((state) => state.status);
  const persistent = useHall((state) => state.persistent);
  const entries = useHall((state) => state.entries);
  const [sort, setSort] = useState<HallSort>("recent");
  const [filter, setFilter] = useState<HallFilter>({ challenge: false, hard: false });
  const [removing, setRemoving] = useState<ArchiveEntry | null>(null);

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  const open = (entry: ArchiveEntry) => {
    feedback("select");
    useHallView.getState().open(entry.id);
    go("archived");
  };

  const list = hallList(entries, sort, filter);
  const records = personalRecords(entries);

  const toggle = (key: keyof HallFilter) => {
    feedback("tick");
    setFilter((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-glory">{t("hall.eyebrow")}</p>
          <h1 className="display mt-2 text-5xl font-black uppercase sm:text-6xl">{t("hall.title")}</h1>
          <p className="mt-3 max-w-xl text-muted">{t("hall.lead")}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            feedback("select");
            go("achievements");
          }}
        >
          <Award size={17} aria-hidden="true" />
          {t("hall.achievementsLink")}
        </Button>
      </div>

      {!persistent ? (
        <p className="mb-5 rounded-sm border border-line bg-panel px-3 py-2 text-sm text-muted" data-tone="bad">
          <span className="text-tone mr-1.5" aria-hidden="true">
            ▼
          </span>
          {t("hall.memory")}
        </p>
      ) : null}

      {status !== "ready" ? (
        <Loading label={t("hall.loading")} className="min-h-[30dvh]" />
      ) : entries.length === 0 ? (
        <Panel>
          <p className="text-muted">{t("hall.empty")}</p>
        </Panel>
      ) : (
        <div className="flex flex-col gap-6">
          {records.length > 0 ? (
            <section aria-labelledby="hall-records">
              <h2 id="hall-records" className="eyebrow mb-3">
                {t("hall.records")}
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {records.map((record) => (
                  <button key={record.key} type="button" className="hall-record" onClick={() => open(record.entry)}>
                    <span className="eyebrow text-2xs">{t(`hall.recordKeys.${record.key}`)}</span>
                    <span className="display numeric text-4xl leading-none font-black">{record.value}</span>
                    <span className="truncate text-sm font-semibold">{record.entry.snapshot.surname}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p id="hall-sort" className="eyebrow mb-2">
                {t("hall.sortLabel")}
              </p>
              {/* Fichas que quebram linha: quatro rótulos em espanhol não cabem lado a lado em 320 px. */}
              <div role="radiogroup" aria-labelledby="hall-sort" className="flex flex-wrap gap-2">
                {HALL_SORTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={sort === value}
                    className="pick-chip"
                    data-checked={sort === value || undefined}
                    onClick={() => {
                      if (value === sort) return;
                      setSort(value);
                      feedback("tick");
                    }}
                  >
                    {t(`hall.sort.${value}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-2">{t("hall.filterLabel")}</p>
              <div className="flex gap-2">
                {(["challenge", "hard"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="pick-chip"
                    aria-pressed={filter[key]}
                    data-checked={filter[key] || undefined}
                    onClick={() => toggle(key)}
                  >
                    {t(`hall.filter.${key}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="eyebrow" aria-live="polite">
            {tp("hall.count", list.length)}
          </p>

          {list.length === 0 ? (
            <p className="text-muted">{t("hall.emptyFiltered")}</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map((entry) => (
                <li key={entry.id}>
                  <HallCard entry={entry} onOpen={() => open(entry)} onRemove={() => setRemoving(entry)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(next) => {
          if (!next) setRemoving(null);
        }}
        title={t("hall.deleteTitle")}
        description={t("hall.deleteBody", { surname: removing?.snapshot.surname ?? "" })}
        confirmLabel={t("hall.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => {
          if (removing) void useHall.getState().remove(removing.id);
          feedback("back");
          setRemoving(null);
        }}
      />
    </div>
  );
}

function HallCard({ entry, onOpen, onRemove }: { entry: ArchiveEntry; onOpen(): void; onRemove(): void }) {
  const { t, tp, c, locale } = useT();
  const { snapshot } = entry;
  const country = getCountry(snapshot.nationality);
  return (
    <article className="hall-card">
      <div className="hall-card-avatar">
        <Avatar config={entry.avatar} kit={country ? getCountryKit(snapshot.nationality) : null} className="h-full w-full" />
      </div>
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="display truncate text-2xl leading-none font-black uppercase">{snapshot.surname}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">
              {country ? <Flag country={country} size={16} language={locale} decorative /> : null}
              <span>{c(`positionAbbr.${snapshot.position}`)}</span>
              <span aria-hidden="true">·</span>
              <span>{t("hall.peak", { ovr: snapshot.peakOvr })}</span>
              <span aria-hidden="true">·</span>
              <span>{tp("hall.seasons", snapshot.seasons)}</span>
            </p>
          </div>
          <IconButton label={t("hall.delete")} size="iconSm" variant="ghost" onClick={onRemove}>
            <Trash2 size={16} aria-hidden="true" />
          </IconButton>
        </div>
        <p className="mt-1.5 text-xs">
          {tp("hall.titles", snapshot.titles)} · {tp("hall.awards", snapshot.awards)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {snapshot.challenge ? (
            <Chip tone="glory" size="sm">
              {t("hall.challenge", { score: snapshot.challenge.score })}
            </Chip>
          ) : null}
          {snapshot.difficulty === "hard" ? (
            <Chip tone="bad" size="sm">
              {t("difficulty.hard.name")}
            </Chip>
          ) : null}
          {entry.status === "interrupted" ? (
            <Chip tone="neutral" variant="outline" size="sm">
              {t("hall.interrupted")}
            </Chip>
          ) : null}
          {entry.alternate ? (
            <Chip tone="info" size="sm">
              {t("hall.alternate")}
            </Chip>
          ) : null}
          <span className="ml-auto text-2xs text-faint">{t("hall.archivedAt", { date: formatShortDate(entry.archivedAt, locale) })}</span>
        </div>
        <Button size="sm" variant="secondary" className="mt-2.5" onClick={onOpen}>
          {t("hall.open")}
          <ArrowRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
