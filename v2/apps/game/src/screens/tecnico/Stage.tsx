import { useReducedMotion } from "../../lib/useReducedMotion";
import { PlayerPeek } from "./PlayerPeek";
import { playerRow } from "../../features/tecnico/view";
import { revisionText } from "../../i18n/tecnico/revision";
import { coachPlayerName } from "@craque/content/coach";
import { ACTION_KINDS, type ActionKind, ACTIONS_PER_STAGE, canStartAction, type CoachCareer, predictabilityHint } from "@craque/engine/coach";
import {
  ArrowRight,
  Banknote,
  Dumbbell,
  HandCoins,
  MessagesSquare,
  ShoppingCart,
  Sprout,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { m } from "motion/react";
import { useState } from "react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { ConfirmDialog } from "../../ui/Overlays";
import { notify } from "../../ui/toast/notify";
import { InfoTip } from "../../ui/InfoTip";



export const ACTION_ICONS: Readonly<Record<ActionKind, LucideIcon>> = {
  sell: Banknote,
  buy: ShoppingCart,
  train: Dumbbell,
  develop: TrendingUp,
  youth: Sprout,
  locker: MessagesSquare,
  funds: HandCoins,
};

/** Passos da etapa (spec 5): Planejar, Ações, Evento, Simular, Resultados. */
export function StageSteps({ career }: { career: CoachCareer }) {
  const { tt } = useTecnicoT();
  const steps = ["plan", "actions", "event", "simulate", "results"] as const;
  const current =
    career.phase === "stage" ? (career.actionsUsed === 0 ? 0 : 1) : career.phase === "event" ? 2 : career.phase === "matchEvent" ? 3 : career.phase === "results" ? 4 : 4;
  return (
    <ol className="tec-steps" aria-label={tt("steps.label")}>
      {steps.map((step, index) => (
        <li key={step} data-state={index < current ? "done" : index === current ? "current" : "todo"} aria-current={index === current ? "step" : undefined}>
          <span className="tec-step-dot" aria-hidden="true" />
          <span className="tec-step-name">{tt(`steps.${step}`)}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * A etapa (spec 5 e 6): até 3 ações entre as 7, repetíveis; atividades
 * livres sem gastar ação; e o botão para o evento. Ação bloqueada diz por
 * quê. Abrir um processo não gasta: só confirmar.
 */
export function StageView({
  career,
  onOpen,
  onAdvance,
}: {
  career: CoachCareer;
  onOpen(kind: ActionKind): void;
  onAdvance(): void;
}) {
  const t = useTecnicoT();
  const { tt, ttp } = t;
  const reduced = useReducedMotion() === true;
  const coach = career.coach;
  const [confirmAdvance, setConfirmAdvance] = useState(false);
  if (!coach) return null;
  const left = ACTIONS_PER_STAGE - career.actionsUsed;
  const hint = predictabilityHint(coach.predictability.value);

  const open = (kind: ActionKind) => {
    const check = canStartAction(career, kind);
    if (!check.ok) {
      feedback("back");
      const reason = check.reason ?? "phase";
      const known = ["phase", "flowOpen", "noActions", "noCandidates", "fundsLimit", "noneToDevelop"] as const;
      const match = known.find((item) => item === reason) ?? "phase";
      notify({ tone: "bad", title: tt(`stage.blocked.${match}`) });
      return;
    }
    feedback("select");
    onOpen(kind);
  };

  return (
    <section className="tec-stage" aria-labelledby="tec-stage-title">
      <StageSteps career={career} />
      {career.half === 0 && (career.news.arrivals.length > 0 || career.news.retired.length > 0) ? <div className="tec-season-news" role="status">{(["arrivals", "retired"] as const).map((kind) => career.news[kind].length ? <p key={kind}><strong>{revisionText(t.locale, kind)}</strong><span>{career.news[kind].map((id) => { const player = career.players[id], legacy = career.legacy[id]; const source = player ?? legacy?.peak; const name = source ? coachPlayerName(career.setup.seed, source) : id; return <span key={id} className="inline-flex mr-2">{source ? <PlayerPeek row={playerRow(player ? career : { ...career, year: legacy?.peakYear ?? career.year }, { ...source, injury: null })} trigger={<button type="button" className="tec-inline-person">{name}</button>} /> : name}</span>; })}</span></p> : null)}</div> : null}
      <div className="tec-command-hero"><div><p className="eyebrow">{tt("ux.command")}</p><p className="display tec-command-title">{tt("ux.prepare")}</p><p className="text-xs">{tt("ux.lead")}</p></div></div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="tec-stage-title" className="display text-2xl leading-none font-black uppercase">
          {tt("stage.actionsTitle")}
        </h2>
        <p className="flex items-center gap-2 text-sm font-semibold" data-tone={left > 0 ? "good" : "neutral"}>
          <span className="text-tone">{ttp("stage.actionsLeft", left)}</span>
          {hint ? <InfoTip label={tt("stage.predictability")}>{tt("stage.predictability")}</InfoTip> : null}
        </p>
      </div>
      <div className="tec-slots" aria-hidden="true">
        {Array.from({ length: ACTIONS_PER_STAGE }, (_, index) => {
          const used = career.actions[index];
          const Icon = used ? ACTION_ICONS[used.kind] : null;
          return (
            <span key={index} className="tec-slot" data-used={used ? true : undefined}>
              {Icon ? <Icon size={14} /> : null}
              {used ? tt(`actions.${used.kind}.name`) : index + 1}
            </span>
          );
        })}
      </div>
      <div className="tec-stage-help"><span className="eyebrow">{tt("ux.lead")}</span><InfoTip label={tt("stage.actionsTitle")}>{tt("stage.actionsHint")}</InfoTip></div>
      <div className="tec-actions">
        {ACTION_KINDS.map((kind) => {
          const Icon = ACTION_ICONS[kind];
          const check = canStartAction(career, kind);
          return (
            <m.button key={kind} whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: 0.97 }} type="button" className="tec-action" data-disabled={check.ok ? undefined : true} aria-disabled={!check.ok} onClick={() => open(kind)}>
              <Icon size={20} aria-hidden="true" className="tec-action-icon" />
              <span className="tec-action-name">{tt(`actions.${kind}.name`)}</span>
              <span className="tec-action-hint">{tt(`actions.${kind}.hint`)}</span>
            </m.button>
          );
        })}
      </div>

      <div className="tec-advance">
        <span />
        <Button
          size="lg"
          onClick={() => {
            if (left > 0) {
              feedback("select");
              setConfirmAdvance(true);
              return;
            }
            feedback("confirm");
            onAdvance();
          }}
        >
          {tt("stage.advance")}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmAdvance}
        onOpenChange={setConfirmAdvance}
        title={tt("stage.advance")}
        description={tt("stage.advanceUnused")}
        confirmLabel={tt("stage.advanceConfirm")}
        cancelLabel={tt("common.cancel")}
        tone="neutral"
        onConfirm={() => {
          feedback("confirm");
          onAdvance();
        }}
      />
    </section>
  );
}
