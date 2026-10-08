import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ActionKind, CoachCareer, CoachCommand } from "@craque/engine/coach";
import { ClipboardList, Landmark, LayoutGrid, MoreHorizontal, Users } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { type Screen, useNavigation } from "../../app/navigation";
import { clubStyle } from "../../features/career/clubColors";
import { useTecnico } from "../../features/tecnico/store";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { feedback } from "../../services/feedback";
import { Loading } from "../../ui/Loading";
import { ConfirmDialog } from "../../ui/Overlays";
import { notify } from "../../ui/toast/notify";
import { ClubView } from "./ClubView";
import { CompetitionsView } from "./CompetitionsView";
import { EventView, MatchEventView } from "./EventViews";
import { Header } from "./Header";
import { HistoryView } from "./HistoryView";
import { OfferCard } from "./Offers";
import { ProcessSheet } from "./Process";
import { ResultsView } from "./Results";
import { ReviewView } from "./Review";
import { type FreeView, StageView } from "./Stage";
import { SquadView } from "./SquadView";
import { TeamView } from "./TeamView";

const TABS = ["stage", "squad", "team", "club", "more"] as const;
type Tab = (typeof TABS)[number];
const TAB_ICONS = { stage: LayoutGrid, squad: Users, team: ClipboardList, club: Landmark, more: MoreHorizontal } as const;
const EXPLORE = ["squad", "team", "competitions", "history"] as const;
type Explore = (typeof EXPLORE)[number];

/**
 * O Técnico (GDD 56): a tela muda pela fase do motor, não pela rota.
 * Propostas, etapa (ações), evento, decisão no jogo, resultados e avaliação.
 * No celular, abas embaixo (Etapa, Elenco, Time, Clube, Mais) e a etapa cabe
 * sem rolar; no PC, o clube à esquerda, a etapa no meio e a exploração à
 * direita. Nada é salvo (D51): sair pede confirmação, e recarregar ou fechar
 * a página avisa que a carreira acaba.
 */
export function TecnicoScreen() {
  const { tt } = useTecnicoT();
  const go = useNavigation((state) => state.go);
  const setGuard = useNavigation((state) => state.setGuard);
  const career = useTecnico((state) => state.career);
  const busy = useTecnico((state) => state.busy);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [tab, setTab] = useState<Tab>("stage");
  const [explore, setExplore] = useState<Explore>("squad");
  const [leaveTarget, setLeaveTarget] = useState<Screen | null>(null);
  const [confirmRetire, setConfirmRetire] = useState(false);
  // A folha do processo fica aberta enquanto houver processo, salvo se o
  // jogador a esconder (as respostas continuam no motor até concluir).
  const [hiddenFlow, setHiddenFlow] = useState<string | null>(null);

  // Sem carreira em memória (recarregou, ou chegou direto): volta ao hub.
  useEffect(() => {
    if (!career) go("hub", { replace: true, force: true });
    else if (career.phase === "ended") go("tecnicoLegacy", { replace: true, force: true });
  }, [career, go]);

  // Sair pede confirmação; o legado passa direto.
  useEffect(() => {
    setGuard((to) => {
      if (to === "tecnicoLegacy") return true;
      setLeaveTarget(to);
      return false;
    });
    return () => setGuard(null);
  }, [setGuard]);

  // Recarregar ou fechar a página encerra a carreira: o navegador avisa.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const flowKey = career?.flow ? `${career.flow.kind}:${career.flow.number}` : null;
  const sheetOpen = flowKey !== null && hiddenFlow !== flowKey;
  const setSheetOpen = (open: boolean) => setHiddenFlow(open ? null : flowKey);

  if (!career || career.phase === "ended") return <Loading label={tt("common.loading")} className="min-h-[60dvh]" />;

  const run = (command: CoachCommand): string | null => {
    const error = useTecnico.getState().run(command);
    if (error) {
      feedback("back");
      notify({ tone: "bad", title: tt("errors.generic") });
    }
    return error;
  };
  const runHeavy = (command: CoachCommand) => {
    void useTecnico
      .getState()
      .runHeavy(command)
      .then((error) => {
        if (error) notify({ tone: "bad", title: error === "busy" ? tt("errors.busy") : tt("errors.generic") });
      });
  };

  const retire = () => {
    feedback("back");
    run({ type: "retire" });
  };

  const dialogs = (
    <>
        <ConfirmDialog
          open={leaveTarget !== null}
          onOpenChange={(open) => {
            if (!open) setLeaveTarget(null);
          }}
          title={tt("leave.title")}
          description={tt("leave.body")}
          confirmLabel={tt("leave.confirm")}
          cancelLabel={tt("leave.stay")}
          tone="neutral"
          onConfirm={() => {
            const target = leaveTarget ?? "hub";
            setLeaveTarget(null);
            go(target, { force: true });
          }}
        />
        <ConfirmDialog
          open={confirmRetire}
          onOpenChange={setConfirmRetire}
          title={tt("history.retireTitle")}
          description={tt("history.retireBody")}
          confirmLabel={tt("history.retireConfirm")}
          cancelLabel={tt("leave.stay")}
          onConfirm={retire}
        />
    </>
  );

  if (career.phase === "offers") {
    return (
      <>
        <InitialOffers career={career} busy={busy} onAccept={(offer) => runHeavy({ type: "acceptOffer", offer })} />
        {dialogs}
      </>
    );
  }

  const club = career.coach?.club ?? null;
  const openAction = (kind: ActionKind) => {
    if (!run({ type: "openAction", kind })) setHiddenFlow(null);
  };
  const openFree = (view: FreeView) => {
    feedback("select");
    if (desktop) {
      if (view === "squad" || view === "team") setExplore(view);
      return;
    }
    setTab(view);
  };

  const phase: ReactNode = (() => {
    switch (career.phase) {
      case "stage":
        return <StageView career={career} onOpen={openAction} onAdvance={() => run({ type: "advance" })} onFree={openFree} />;
      case "event":
        return (
          <EventView
            career={career}
            busy={busy}
            onChoose={(option) => run({ type: "chooseEvent", option })}
            onSimulate={() => runHeavy({ type: "simulate" })}
          />
        );
      case "matchEvent":
        return <MatchEventView career={career} busy={busy} onChoose={(option) => runHeavy({ type: "chooseMatchEvent", option })} />;
      case "results":
        return <ResultsView career={career} onContinue={() => run({ type: "continue" })} />;
      case "review":
        return <ReviewView career={career} busy={busy} onDecide={(choice) => runHeavy({ type: "decide", choice })} />;
      default:
        return null;
    }
  })();

  const openFlowBanner =
    career.flow && !sheetOpen ? (
      <button type="button" className="tec-flow-banner" onClick={() => setSheetOpen(true)}>
        {tt(`actions.${career.flow.kind}.name`)} · {tt("process.responses")}
      </button>
    ) : null;

  return (
    <div className="career tecnico club-scope" style={clubStyle(club) as CSSProperties}>
      <Header
        career={career}
        onLeave={() => {
          feedback("back");
          setLeaveTarget("hub");
        }}
        onRetire={() => {
          feedback("select");
          setConfirmRetire(true);
        }}
      />
      {desktop ? (
        <main className="career-body">
          <div className="tecnico-columns">
            <aside className="scroll-panel tec-side" aria-label={tt("club.title")}>
              <div className="scroll-panel-inner">
                <ClubView career={career} />
              </div>
            </aside>
            <div className="fit-panel loop-panel tec-center">
              {openFlowBanner}
              {phase}
            </div>
            <BaseTabs.Root
              className="career-explore"
              value={explore}
              onValueChange={(next) => {
                const match = EXPLORE.find((value) => value === next);
                if (match && match !== explore) {
                  setExplore(match);
                  feedback("tick");
                }
              }}
            >
              <BaseTabs.List className="explore-tabs" aria-label={tt("tabs.label")}>
                {EXPLORE.map((value) => (
                  <BaseTabs.Tab key={value} value={value} className="explore-tab">
                    {tt(`tabs.${value}`)}
                  </BaseTabs.Tab>
                ))}
              </BaseTabs.List>
              <BaseTabs.Panel value="squad" className="scroll-panel">
                <div className="scroll-panel-inner">
                  <SquadView career={career} />
                </div>
              </BaseTabs.Panel>
              <BaseTabs.Panel value="team" className="scroll-panel">
                <div className="scroll-panel-inner">
                  <TeamView career={career} run={run} />
                </div>
              </BaseTabs.Panel>
              <BaseTabs.Panel value="competitions" className="scroll-panel">
                <div className="scroll-panel-inner">
                  <CompetitionsView career={career} />
                </div>
              </BaseTabs.Panel>
              <BaseTabs.Panel value="history" className="scroll-panel">
                <div className="scroll-panel-inner">
                  <HistoryView career={career} onRetire={() => setConfirmRetire(true)} />
                </div>
              </BaseTabs.Panel>
            </BaseTabs.Root>
          </div>
        </main>
      ) : (
        <BaseTabs.Root
          className="career-tabs"
          value={tab}
          onValueChange={(next) => {
            const match = TABS.find((value) => value === next);
            if (!match || match === tab) return;
            setTab(match);
            feedback("tick");
          }}
        >
          <main className="career-body">
            <BaseTabs.Panel value="stage" className="fit-panel loop-panel tec-center">
              {openFlowBanner}
              {phase}
            </BaseTabs.Panel>
            <BaseTabs.Panel value="squad" className="scroll-panel">
              <div className="scroll-panel-inner">
                <SquadView career={career} />
              </div>
            </BaseTabs.Panel>
            <BaseTabs.Panel value="team" className="scroll-panel">
              <div className="scroll-panel-inner">
                <TeamView career={career} run={run} />
              </div>
            </BaseTabs.Panel>
            <BaseTabs.Panel value="club" className="scroll-panel">
              <div className="scroll-panel-inner">
                <ClubView career={career} />
              </div>
            </BaseTabs.Panel>
            <BaseTabs.Panel value="more" className="scroll-panel">
              <div className="scroll-panel-inner">
                <CompetitionsView career={career} />
                <HistoryView career={career} onRetire={() => setConfirmRetire(true)} />
              </div>
            </BaseTabs.Panel>
          </main>
          <BaseTabs.List className="tabbar" data-count={TABS.length} aria-label={tt("tabs.label")}>
            {TABS.map((value) => {
              const Icon = TAB_ICONS[value];
              return (
                <BaseTabs.Tab key={value} value={value} className="tabbar-tab">
                  <Icon size={20} aria-hidden="true" />
                  <span className="tabbar-label">{tt(`tabs.${value}`)}</span>
                </BaseTabs.Tab>
              );
            })}
          </BaseTabs.List>
        </BaseTabs.Root>
      )}

      <ProcessSheet career={career} open={sheetOpen && career.flow !== null} onOpenChange={setSheetOpen} run={run} />
      <BusyOverlay busy={busy} />

      {dialogs}
    </div>
  );
}

/** Aviso de "simulando": pintado antes do cálculo, anima mesmo com a página ocupada. */
function BusyOverlay({ busy }: { busy: boolean }) {
  const { tt } = useTecnicoT();
  if (!busy) return null;
  return (
    <div className="tec-busy" role="status" aria-live="polite">
      <div className="tec-busy-card">
        <span className="tec-busy-ball" aria-hidden="true" />
        <p className="display text-2xl font-black uppercase">{tt("common.busy")}</p>
        <p className="text-xs text-muted">{tt("common.busyHint")}</p>
      </div>
    </div>
  );
}

/** As três primeiras propostas (spec 4), antes de o técnico ter clube. */
function InitialOffers({ career, busy, onAccept }: { career: CoachCareer; busy: boolean; onAccept(offer: string): void }) {
  const { tt } = useTecnicoT();
  return (
    <div className="tec-offers-page mx-auto max-w-6xl px-4 pt-6 pb-10">
      <p className="eyebrow text-glory">{tt("offers.initialEyebrow")}</p>
      <h1 className="display mt-2 text-4xl leading-none font-black uppercase sm:text-5xl">{tt("offers.initialTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{tt("offers.initialLead")}</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {career.offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} career={career} busy={busy} onAccept={() => onAccept(offer.id)} />
        ))}
      </div>
      <BusyOverlay busy={busy} />
    </div>
  );
}
