import { AnimatePresence, m, useIsPresent } from "motion/react";
import type { Career } from "@craque/engine";
import { type ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { useT } from "../../i18n/useT";
import { d74 } from "../../i18n/d74";

export function SeasonDecision({ career, onSettled, blocked, children, recallable = [], viewing = null, onRecall }: { career: Career; presentation?: Career; onSettled?(): void; blocked?: boolean; children: ReactNode; recallable?: readonly number[]; viewing?: number | null; onRecall?(index: number | null): void }) {
  const reduced = useReducedMotion(); const { locale, t } = useT(); const progress = career.decision?.progress;
  const windowRef = useRef<HTMLDivElement>(null);
  const wasBlocked = useRef(false);
  useEffect(() => {
    if (wasBlocked.current && !blocked) {
      const active = document.activeElement;
      // O título só pode receber foco depois de sair de inert. Menu e exploração mantêm seu foco.
      if (active === document.body || active?.closest(".season-decision-slide")) windowRef.current?.querySelector<HTMLElement>("[data-active] .decision-title")?.focus({ preventScroll: true });
    }
    wasBlocked.current = Boolean(blocked);
  }, [blocked]);
  const label = progress ? d74(locale).progress.replace("{index}", String(progress.index)).replace("{total}", String(progress.total)).replace("{year}", String(career.world.year)) : "";
  // A linha de progresso viaja dentro do card (D85): cada decisão chega com a sua e a janela não muda de altura depois do deslize.
  return <div className="season-decision">
    <div ref={windowRef} className="season-decision-window" inert={blocked || undefined}><AnimatePresence initial={false} onExitComplete={onSettled}><SeasonSlide key={career.decision?.id ?? "end"} reduced={reduced}>{children}{progress && progress.total > 1 ? <div className="season-progress" role="group" aria-label={label}><span>{Array.from({ length: progress.total }, (_, index) => {
      const step = index + 1;
      const dot = <i data-state={step < progress.index ? "done" : step === progress.index ? "current" : "next"} data-viewing={viewing === step || undefined} />;
      // D106: a bolinha de uma decisão já respondida abre o resultado dela, só para ler; a atual volta para a decisão em aberto.
      if (onRecall && recallable.includes(step)) return <button key={index} type="button" className="season-progress-step" aria-pressed={viewing === step} aria-label={t("career.recall.open", { index: step })} onClick={() => onRecall(viewing === step ? null : step)}>{dot}</button>;
      if (onRecall && step === progress.index && viewing !== null) return <button key={index} type="button" className="season-progress-step" aria-label={t("career.recall.back")} onClick={() => onRecall(null)}>{dot}</button>;
      return <span key={index} className="season-progress-step" aria-hidden="true">{dot}</span>;
    })}</span><small>{viewing !== null ? t("career.recall.viewing", { index: viewing, total: progress.total }) : label}</small></div> : null}</SeasonSlide></AnimatePresence></div>
  </div>;
}

function SeasonSlide({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const present = useIsPresent();
  return <m.div className="season-decision-slide" data-active={present || undefined} aria-hidden={!present || undefined} inert={!present || undefined} initial={reduced ? false : { x: "100%" }} animate={{ x: "0%" }} exit={{ x: reduced ? "0%" : "-100%" }} transition={{ duration: reduced ? 0 : .56, ease: [.32, 0, .18, 1] }}>{children}</m.div>;
}
