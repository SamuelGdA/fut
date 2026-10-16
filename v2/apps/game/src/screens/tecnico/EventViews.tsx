import { canAffordEvent, eventCost, type CoachCareer, type CoachEvent } from "@craque/engine/coach";
import { getClub } from "@craque/world";
import { Play, Swords, Timer } from "lucide-react";
import { playerRow } from "../../features/tecnico/view";
import { type TecnicoTranslator, useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Crest } from "../../ui/Media";
import { Chip } from "../../ui/Signals";
import { EffectChips } from "./shared";
import { RiskPreview, Resolution } from "./DecisionUX";
import { DecisionPicker } from "./DecisionPicker";
import { EventText } from "./EventText";
import { StageSteps } from "./Stage";
import { competitionName, roundName } from "./text";

/** Valores do texto de um evento: nomes de jogador e clube, dinheiro formatado. */
function eventVars(career: CoachCareer, event: CoachEvent, t: TecnicoTranslator): Record<string, string | number> {
  const vars: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(event.params)) {
    if (key === "buyer" || key === "rival") vars[key] = typeof value === "string" ? (getClub(value)?.name ?? value) : value;
    else if (key === "price" || key === "amount" || key === "cost" || key === "raise") vars[key] = t.money(Number(value));
    else vars[key] = value;
  }
  const subject = event.subject ? career.players[event.subject] : null;
  if (subject) vars["player"] = playerRow(career, subject).name;
  const club = career.coach?.club;
  if (club) vars["club"] = getClub(club)?.name ?? club;
  return vars;
}

/**
 * O evento da etapa (spec 13): um por etapa, sem gastar ação. O texto conta a
 * cena; cada opção mostra o que faz (as pílulas saem dos efeitos do motor) e
 * o risco em linguagem curta. Depois da escolha, o resultado e o botão de
 * simular. Quando o evento é de partida, ele só aparece durante a simulação.
 */
export function EventView({ career, onChoose, onSimulate, busy }: { career: CoachCareer; onChoose(option: string): void; onSimulate(): void; busy: boolean }) {
  const t = useTecnicoT();
  const { tt } = t;
  const event = career.event;
  const simulateLabel = career.setup.mode === "fast" ? tt("event.simulateFull") : tt("event.simulateHalf");

  return (
    <section className="tec-event" aria-labelledby="tec-event-title">
      <StageSteps career={career} />
      {event ? (
        <EventCard career={career} event={event} onChoose={onChoose} t={t} />
      ) : (
        <div className="tec-simulation-ready"><Swords size={34} aria-hidden="true" /><h2 id="tec-event-title" className="display">{simulateLabel}</h2></div>
      )}
      {!event || event.chosen ? (
        <div className="tec-advance">
          <span />
          <Button
            size="lg"
            loading={busy}
            onClick={() => {
              feedback("whistle");
              onSimulate();
            }}
          >
            <Play size={18} aria-hidden="true" />
            {simulateLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function EventCard({ career, event, onChoose, t }: { career: CoachCareer; event: CoachEvent; onChoose(option: string): void; t: TecnicoTranslator }) {
  const { tt } = t;
  const vars = eventVars(career, event, t);
  const chosen = event.options.find((option) => option.id === event.chosen) ?? null;
  const outcomeKey = chosen ? (chosen.chance === null ? "result" : event.outcome === "success" ? "success" : "failure") : null;
  return (
    <div className="tec-card">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{tt("event.eyebrow")}</p>
        <Chip tone={event.kind === "crisis" ? "bad" : event.kind === "opportunity" ? "good" : "info"} size="sm">
          {tt(`event.kinds.${event.kind}`)}
        </Chip>
      </div>
      <h2 id="tec-event-title" className="display mt-1 text-2xl leading-tight font-black uppercase">
        {t.g(`events.${event.id}.title`, vars)}
      </h2>
      <div className="tec-scene-line"><p className="tec-event-scene"><EventText career={career} text={t.g(`events.${event.id}.body`, vars)} /></p></div>
      {chosen && outcomeKey ? (
        <Resolution key={`${event.id}:${chosen.id}`} good={event.outcome !== "failure"} title={tt("event.outcome")}>
          <p className="mt-1 text-sm font-semibold">{t.g(`events.${event.id}.options.${chosen.id}.label`, vars)}</p>
          <p className="mt-1 text-sm"><EventText career={career} text={t.g(`events.${event.id}.options.${chosen.id}.${outcomeKey}`, vars)} /></p>
          <div className="mt-2">
            <EffectChips effects={event.outcome === "failure" ? chosen.failure : chosen.success} t={t} />
          </div>
        </Resolution>
      ) : (
<DecisionPicker label={tt("event.choose")} onChoose={onChoose} options={event.options.map((option) => ({ id: option.id, title: t.g(`events.${event.id}.options.${option.id}.label`, vars), canConfirm: canAffordEvent(career, option), detail: <><RiskPreview chance={option.chance} success={option.success} failure={option.failure} t={t} />{!canAffordEvent(career, option) ? <p className="mt-2 text-xs text-bad">{tt("ux.excess", { money: t.money(eventCost(option) - (career.coach?.budget ?? 0)) })}</p> : null}</> }))} />
      )}
    </div>
  );
}

/**
 * Decisão no meio do jogo (spec 12): a simulação pausou no minuto. A tela
 * diz competição, fase, adversário, mando, minuto, placar e agregado; cada
 * opção mostra a chance de dar certo, calculada pelo próprio modelo do jogo.
 * O resultado entra na tabela ou na chave de verdade.
 */
export function MatchEventView({ career, onChoose, busy }: { career: CoachCareer; onChoose(option: string): void; busy: boolean }) {
  const t = useTecnicoT();
  const { tt } = t;
  const event = career.event;
  const match = event?.match;
  const coach = career.coach;
  if (!event || !match || !coach) return null;
  const situation = match.situation;
  const injured = event.subject ? career.players[event.subject] : null;
  const vars = { minute: match.minute, player: injured ? playerRow(career, injured).name : "" };
  const venue = match.home ? tt("competitions.home") : tt("competitions.away");
  return (
    <section className="tec-event" aria-labelledby="tec-match-title">
      <StageSteps career={career} />
      <div className="tec-card tec-match">
        <p className="eyebrow flex items-center gap-2 text-glory">
          <Swords size={14} aria-hidden="true" />
          {tt("match.eyebrow")}
        </p>
        <p className="mt-1 text-xs text-muted">
          {competitionName(match.competition, t.locale)} · {roundName(tt, match.round)} · {venue}
        </p>
        <div className="tec-scoreboard">
          <span className="tec-score-club">
            <Crest club={coach.club} size={36} decorative />
          </span>
          <span className="display numeric text-5xl font-black">
            {match.score[0]}
            <span className="mx-2 text-faint">×</span>
            {match.score[1]}
          </span>
          <span className="tec-score-club">
            <Crest club={match.opponent} size={36} decorative />
          </span>
        </div>
        <p className="text-center text-sm">
          {tt("match.vs")} <strong>{getClub(match.opponent)?.name ?? match.opponent}</strong>
        </p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-glory">
          <Timer size={14} aria-hidden="true" />
          {match.minute}'{match.aggregate ? ` · ${t.g("matchEvent.aggregate", { aggregate: `${match.aggregate[0]} × ${match.aggregate[1]}` })}` : ""}
        </p>
        <h2 id="tec-match-title" className="display mt-3 text-2xl font-black uppercase">
          {t.g(`matchEvent.situations.${situation}.title`, vars)}
        </h2>
        <p className="text-sm text-muted"><EventText career={career} text={t.g(`matchEvent.situations.${situation}.body`, vars)} /></p>
        <DecisionPicker label={tt("match.choose")} disabled={busy} onChoose={onChoose} options={event.options.map((option) => ({
          id: option.id, title: t.g(`matchEvent.options.${option.id}.label`),
          detail: <div className="tec-match-plan"><p>{t.g(`matchEvent.options.${option.id}.hint`)}</p>
            <div className="tec-plan-signals">{option.success.filter((effect) => effect.type === "match").map((effect) => effect.type === "match" ? <span key="posture"><span>{tt("ux.pressure")} <strong>{effect.forMult > 1.1 ? "▲▲" : effect.forMult > 1 ? "▲" : "▼"}</strong></span><span>{tt("ux.exposure")} <strong>{effect.againstMult > 1.1 ? "▲▲" : effect.againstMult > 1 ? "▲" : "▼"}</strong></span></span> : null)}</div>
            <p className="tec-plan-goal"><span>{tt("ux.planGoal")}</span><strong>{t.g(`matchEvent.options.${option.id}.goal`)}</strong></p>
          </div>,
        }))} />
      </div>
    </section>
  );
}
