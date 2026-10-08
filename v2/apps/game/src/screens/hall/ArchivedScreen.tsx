import { type Career, CareerError, ENGINE_VERSION, replay } from "@craque/engine";
import { getClub, getCountry, getCountryKit } from "@craque/world";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "../../app/navigation";
import { useCareer } from "../../features/career/store";
import type { ArchiveEntry } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { useHallView } from "../../features/hall/view";
import { formatShortDate } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { Loading } from "../../ui/Loading";
import { Flag } from "../../ui/Media";
import { Panel } from "../../ui/Panel";
import { notify } from "../../ui/toast/notify";
import { SummaryView } from "../summary/SummaryView";

/**
 * Uma carreira do Hall da Fama em modo leitura (GDD 28.1). Feita nesta versão
 * do motor, o replay refaz o resumo inteiro; de outra versão, fica o retrato
 * (GDD 34.2). O "E se...?" vale aqui também, para carreiras comuns.
 */
export function ArchivedScreen() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const openId = useHallView((state) => state.openId);
  const status = useHall((state) => state.status);
  const entry = useHall((state) => state.entries.find((item) => item.id === openId) ?? null);

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  const back = () => {
    feedback("back");
    go("hall");
  };

  if (status !== "ready") {
    return (
      <Loading label={t("hall.loading")} className="min-h-[60dvh]" />
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-10 pb-16">
        <Panel>
          <p className="text-muted">{t("hall.entryMissing")}</p>
          <Button className="mt-4" variant="secondary" onClick={back}>
            <ArrowLeft size={17} aria-hidden="true" />
            {t("summary.backToHall")}
          </Button>
        </Panel>
      </div>
    );
  }

  const career = entry.save.engine === ENGINE_VERSION ? replayEntry(entry) : null;
  if (!career) return <StaleEntry entry={entry} onBack={back} />;

  const challenge = typeof career.setup.challengeId === "string";
  const branch = (index: number) => {
    if (useCareer.getState().branch(entry.save, entry.avatar, index)) {
      feedback("whistle");
      go("career");
    } else {
      notify({ tone: "bad", title: t("summary.whatIf.failed") });
    }
  };

  return (
    <SummaryView
      career={career}
      avatar={entry.avatar}
      mode="archived"
      alternate={entry.alternate}
      onHome={() => go("hall")}
      onBranch={challenge ? undefined : branch}
    />
  );
}

function replayEntry(entry: ArchiveEntry): Career | null {
  try {
    return replay(entry.save);
  } catch (error) {
    if (error instanceof CareerError) return null;
    throw error;
  }
}

/** Carreira de outra versão do motor: o retrato guardado, com o aviso claro (GDD 34.2). */
function StaleEntry({ entry, onBack }: { entry: ArchiveEntry; onBack(): void }) {
  const { t, tp, c, locale } = useT();
  const { snapshot } = entry;
  const country = getCountry(snapshot.nationality);
  const club = snapshot.clubs[0] ? getClub(snapshot.clubs[0]) : null;
  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-16">
      <Panel data-tone="bad" className="border-l-4 border-l-bad">
        <p className="eyebrow text-tone">{t("hall.staleTitle")}</p>
        <p className="mt-2 text-sm text-muted">{t("hall.staleBody")}</p>
        <div className="mt-5 flex items-center gap-4">
          <div className="hall-card-avatar">
            <Avatar config={entry.avatar} kit={country ? getCountryKit(snapshot.nationality) : null} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <p className="display truncate text-3xl font-black uppercase">{snapshot.surname}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
              {country ? <Flag country={country} size={18} language={locale} decorative /> : null}
              <span>{c(`positions.${snapshot.position}`)}</span>
              <span aria-hidden="true">·</span>
              <span>{t("hall.peak", { ovr: snapshot.peakOvr })}</span>
              <span aria-hidden="true">·</span>
              <span>{tp("hall.seasons", snapshot.seasons)}</span>
            </p>
            {club ? (
              <p className="mt-1 text-sm">
                {t("hall.staleClubs")}: {club.name}
              </p>
            ) : null}
            <p className="mt-1 text-2xs text-faint">{t("hall.archivedAt", { date: formatShortDate(entry.archivedAt, locale) })}</p>
          </div>
        </div>
        <Button className="mt-5" variant="secondary" onClick={onBack}>
          <ArrowLeft size={17} aria-hidden="true" />
          {t("summary.backToHall")}
        </Button>
      </Panel>
    </div>
  );
}
