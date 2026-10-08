import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { Career } from "@craque/engine";
import { CalendarDays, Crosshair, ListOrdered, Trophy, UserRound } from "lucide-react";
import { type CSSProperties, useEffect, useLayoutEffect, useState } from "react";
import { type Screen, useNavigation } from "../../app/navigation";
import { clubStyle } from "../../features/career/clubColors";
import { usePlayAnnouncement } from "../../features/career/playAnnouncement";
import { useCareer } from "../../features/career/store";
import { useT } from "../../i18n/useT";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { feedback } from "../../services/feedback";
import { Loading } from "../../ui/Loading";
import { ConfirmDialog } from "../../ui/Overlays";
import { notify } from "../../ui/toast/notify";
import { CareerHeader } from "./CareerHeader";
import { ChallengePanel } from "./ChallengePanel";
import { EndPanel, HistoryPanel, NationPanel, PlayerPanel, TrophiesPanel } from "./CareerPanels";
import { DecisionPanel } from "./DecisionPanel";
import { NewsBar } from "./NewsBar";
import { PlayFeed } from "./PlayFeed";
import { ResultMessage } from "./ResultMessage";

/**
 * Abas do celular: temporada, jogador e (no desafio) o painel do desafio cabem
 * na tela; histórico e troféus são exploração e rolam.
 */
const TABS = ["season", "player", "history", "trophies"] as const;
const CHALLENGE_TABS = ["season", "player", "challenge", "history", "trophies"] as const;
type CareerTab = (typeof CHALLENGE_TABS)[number];

const TAB_ICONS: Readonly<Record<CareerTab, typeof CalendarDays>> = {
  season: CalendarDays,
  player: UserRound,
  challenge: Crosshair,
  history: ListOrdered,
  trophies: Trophy,
};

/** Abas da coluna de exploração, no desktop. No desafio, o painel do desafio abre primeiro. */
const EXPLORE = ["history", "trophies", "nation"] as const;
const CHALLENGE_EXPLORE = ["challenge", "history", "trophies", "nation"] as const;
type ExploreTab = (typeof CHALLENGE_EXPLORE)[number];

/**
 * A carreira (GDD 5, 14 e 32.5). Lê o save na entrada, mostra a decisão
 * atual e resolve a escolha no motor. O que a escolha produziu aparece na
 * própria tela (D43): o lance em cima da decisão, os números do jogador
 * contando até os valores novos e o jornal da temporada embaixo. Não há
 * janela para fechar: a próxima decisão já está ali. O laço inteiro cabe na
 * tela: a página não rola, só as vistas de exploração rolam por dentro. Sair
 * por qualquer caminho pede confirmação; a carreira continua salva.
 */
export function CareerScreen() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const setGuard = useNavigation((state) => state.setGuard);
  const status = useCareer((state) => state.status);
  const career = useCareer((state) => state.career);
  const avatar = useCareer((state) => state.avatar);
  const latest = useCareer((state) => state.play);
  const review = useCareer((state) => state.review);
  const alternate = useCareer((state) => state.alternate);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [tab, setTab] = useState<CareerTab>("season");
  const [leaveTarget, setLeaveTarget] = useState<Screen | null>(null);
  const [confirmRetire, setConfirmRetire] = useState(false);
  const announcement = usePlayAnnouncement(career, latest);

  // Antes da primeira pintura: o replay é síncrono, e a tela já abre pronta.
  useLayoutEffect(() => {
    useCareer.getState().hydrate();
  }, []);

  // Sem carreira para mostrar (save de outra versão, quebrado ou apagado): Início.
  useEffect(() => {
    if (status === "empty" || status === "stale" || status === "invalid") go("home", { replace: true, force: true });
  }, [status, go]);

  // Sair pede confirmação (GDD 5). O resumo passa direto.
  useEffect(() => {
    setGuard((to) => {
      if (to === "summary") return true;
      setLeaveTarget(to);
      return false;
    });
    return () => setGuard(null);
  }, [setGuard]);

  if (!career) {
    return (
      <Loading label={t("career.loading")} className="min-h-[60dvh]" />
    );
  }

  const onChoose = (optionId: string): boolean => {
    const ok = useCareer.getState().choose(optionId);
    if (!ok) notify({ tone: "bad", title: t("career.stale") });
    return ok;
  };

  // Rever uma temporada do histórico: ela aparece no lugar do lance (no celular, a aba da temporada abre).
  const onReplay = (index: number) => {
    useCareer.getState().reviewSeason(index);
    setTab("season");
  };
  const closeReview = () => {
    feedback("back");
    useCareer.getState().closeReview();
  };

  const openSummary = () => {
    feedback("reveal");
    useCareer.getState().markSummary();
    go("summary", { force: true });
  };

  const retire = () => {
    feedback("back");
    useCareer.getState().retire();
    go("summary", { force: true });
  };

  const club = career.contract?.club ?? career.history[career.history.length - 1]?.club ?? null;
  const challenge = typeof career.setup.challengeId === "string";
  const tabs: readonly CareerTab[] = challenge ? CHALLENGE_TABS : TABS;
  const original = alternate && career.decision?.id === alternate.decision ? alternate.original : null;
  const shown = review ?? latest;
  // O jornal acompanha a última temporada do que está à vista (o lance, ou a revista).
  const newsIndex = shown?.pages.reduce<number | null>((found, page) => (page.kind === "season" ? page.index : found), null) ?? null;
  const decision = career.end ? (
    <EndPanel career={career} onSummary={openSummary} />
  ) : (
    <DecisionPanel career={career} onChoose={onChoose} original={original} />
  );
  const feed = (compact: boolean) =>
    shown ? (
      <PlayFeed key={shown.id} career={career} play={shown} reviewing={review !== null} onCloseReview={closeReview} compact={compact} />
    ) : null;
  const news = newsIndex !== null ? <NewsBar career={career} index={newsIndex} fresh={review === null && (latest?.fresh ?? false)} /> : null;

  return (
    <div className="career club-scope" style={clubStyle(club) as CSSProperties}>
      {/* O lance de cada jogada, numa frase, para o leitor de tela (D43). A região fica sempre lá. */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <CareerHeader
        career={career}
        alternate={alternate !== null}
        onLeave={() => {
          feedback("back");
          setLeaveTarget("home");
        }}
        onRetire={() => {
          feedback("select");
          setConfirmRetire(true);
        }}
      />

      {desktop ? (
        <main className="career-body">
          <div className="career-columns">
            <aside className="fit-panel" aria-label={t("career.tabs.player")}>
              <PlayerPanel career={career} avatar={avatar} />
            </aside>
            <div className="fit-panel loop-panel">
              {decision}
              {news}
            </div>
            <div className="career-right">
              <ResultMessage career={career} play={review === null ? latest : null} />
              {feed(false)}
              <ExploreColumn career={career} onReplay={onReplay} challenge={challenge} />
            </div>
          </div>
        </main>
      ) : (
        <BaseTabs.Root
          className="career-tabs"
          value={tab}
          onValueChange={(next) => {
            const match = tabs.find((candidate) => candidate === next);
            if (!match || match === tab) return;
            setTab(match);
            feedback("tick");
          }}
        >
          <main className="career-body">
            <BaseTabs.Panel value="season" className="fit-panel loop-panel">
              <ResultMessage career={career} play={review === null ? latest : null} />
              {feed(true)}
              {decision}
              {news}
            </BaseTabs.Panel>
            <BaseTabs.Panel value="player" className="fit-panel">
              <PlayerPanel career={career} avatar={avatar} />
            </BaseTabs.Panel>
            {challenge ? (
              <BaseTabs.Panel value="challenge" className="fit-panel">
                <ChallengePanel career={career} />
              </BaseTabs.Panel>
            ) : null}
            <BaseTabs.Panel value="history" className="scroll-panel">
              <div className="scroll-panel-inner">
                <HistoryPanel career={career} onReplay={onReplay} />
                <section aria-label={t("career.tabs.nation")}>
                  <h2 className="eyebrow mb-3">{t("career.tabs.nation")}</h2>
                  <NationPanel career={career} />
                </section>
              </div>
            </BaseTabs.Panel>
            <BaseTabs.Panel value="trophies" className="scroll-panel">
              <div className="scroll-panel-inner">
                <TrophiesPanel career={career} />
              </div>
            </BaseTabs.Panel>
          </main>
          <BaseTabs.List className="tabbar" data-count={tabs.length} aria-label={t("career.tabs.label")}>
            {tabs.map((value) => {
              const Icon = TAB_ICONS[value];
              return (
                <BaseTabs.Tab key={value} value={value} className="tabbar-tab">
                  <Icon size={20} aria-hidden="true" />
                  <span className="tabbar-label">{t(`career.tabs.${value}`)}</span>
                </BaseTabs.Tab>
              );
            })}
          </BaseTabs.List>
        </BaseTabs.Root>
      )}

      <ConfirmDialog
        open={leaveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setLeaveTarget(null);
        }}
        title={t("career.leaveTitle")}
        description={t("career.leaveBody")}
        confirmLabel={t("career.leaveConfirm")}
        cancelLabel={t("career.stay")}
        tone="neutral"
        onConfirm={() => {
          const target = leaveTarget ?? "home";
          setLeaveTarget(null);
          go(target, { force: true });
        }}
      />
      <ConfirmDialog
        open={confirmRetire}
        onOpenChange={setConfirmRetire}
        title={t("career.retireTitle")}
        description={t("career.retireBody", { age: Math.min(career.age, 40) })}
        confirmLabel={t("career.retireConfirm")}
        cancelLabel={t("career.stay")}
        onConfirm={retire}
      />
    </div>
  );
}

/** A coluna de exploração do desktop: histórico, troféus e seleção, rolando por dentro. */
function ExploreColumn({ career, onReplay, challenge }: { career: Career; onReplay(index: number): void; challenge: boolean }) {
  const { t } = useT();
  const explore: readonly ExploreTab[] = challenge ? CHALLENGE_EXPLORE : EXPLORE;
  const [tab, setTab] = useState<ExploreTab>(challenge ? "challenge" : "history");
  return (
    <BaseTabs.Root
      className="career-explore"
      value={tab}
      onValueChange={(next) => {
        const match = explore.find((candidate) => candidate === next);
        if (!match || match === tab) return;
        setTab(match);
        feedback("tick");
      }}
    >
      <BaseTabs.List className="explore-tabs" aria-label={t("career.tabs.explore")}>
        {explore.map((value) => (
          <BaseTabs.Tab key={value} value={value} className="explore-tab">
            {t(`career.tabs.${value}`)}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {challenge ? (
        <BaseTabs.Panel value="challenge" className="scroll-panel">
          <div className="scroll-panel-inner">
            <ChallengePanel career={career} />
          </div>
        </BaseTabs.Panel>
      ) : null}
      <BaseTabs.Panel value="history" className="scroll-panel">
        <div className="scroll-panel-inner">
          <HistoryPanel career={career} onReplay={onReplay} />
        </div>
      </BaseTabs.Panel>
      <BaseTabs.Panel value="trophies" className="scroll-panel">
        <div className="scroll-panel-inner">
          <TrophiesPanel career={career} />
        </div>
      </BaseTabs.Panel>
      <BaseTabs.Panel value="nation" className="scroll-panel">
        <div className="scroll-panel-inner">
          <NationPanel career={career} />
        </div>
      </BaseTabs.Panel>
    </BaseTabs.Root>
  );
}

