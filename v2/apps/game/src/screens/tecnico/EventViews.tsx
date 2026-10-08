import type { CoachCareer, CoachEvent } from "@craque/engine/coach";
import { getClub } from "@craque/world";
import { Play, Swords, Timer } from "lucide-react";
import { playerRow } from "../../features/tecnico/view";
import { type TecnicoTranslator, useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";
import { Crest } from "../../ui/Media";
import { Chip } from "../../ui/Signals";
import { EffectChips } from "./shared";
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
 * a chance quando há risco. Depois da escolha, o resultado e o botão de
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
        <div className="tec-card">
          <p className="eyebrow">{tt("event.eyebrow")}</p>
          <h2 id="tec-event-title" className="display mt-1 text-2xl font-black uppercase">
            {career.matchEventArmed ? tt("event.kinds.match") : tt("event.eyebrow")}
          </h2>
          <p className="mt-2 text-sm text-muted">{career.matchEventArmed ? tt("event.matchArmed") : tt("event.noEvent")}</p>
        </div>
      )}
      <UpcomingGames career={career} />
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

/** Os próximos jogos do período, para a espera do evento ter contexto. */
function UpcomingGames({ career }: { career: CoachCareer }) {
  const t = useTecnicoT();
  const { tt } = t;
  const club = career.coach?.club ?? "";
  const games = career.fixtures.filter((fixture) => !fixture.result && (fixture.home === club || fixture.away === club)).slice(0, 5);
  if (games.length === 0) return null;
  return (
    <div className="tec-card tec-upcoming">
      <p className="eyebrow mb-1">{tt("competitions.upcoming")}</p>
      <ul className="flex flex-col gap-1">
        {games.map((fixture) => {
          const home = fixture.home === club;
          const opponent = home ? fixture.away : fixture.home;
          return (
            <li key={fixture.id} className="flex items-center gap-2 text-sm">
              <Crest club={opponent} size={18} decorative />
              <span className="min-w-0 flex-1 truncate">{getClub(opponent)?.name ?? opponent}</span>
              <span className="truncate text-2xs text-muted">{competitionName(fixture.competition, t.locale)}</span>
              <span className="text-2xs text-faint">{fixture.neutral ? tt("competitions.neutral") : home ? tt("competitions.home") : tt("competitions.away")}</span>
            </li>
          );
        })}
      </ul>
    </div>
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
      <p className="mt-2 text-sm">{t.g(`events.${event.id}.body`, vars)}</p>
      {chosen && outcomeKey ? (
        <div className="mt-3 rounded-sm border border-line bg-panel-2 p-3" data-tone={event.outcome === "failure" ? "bad" : "good"}>
          <p className="eyebrow text-tone">{tt("event.outcome")}</p>
          <p className="mt-1 text-sm font-semibold">{t.g(`events.${event.id}.options.${chosen.id}.label`, vars)}</p>
          <p className="mt-1 text-sm">{t.g(`events.${event.id}.options.${chosen.id}.${outcomeKey}`, vars)}</p>
          <div className="mt-2">
            <EffectChips effects={event.outcome === "failure" ? chosen.failure : chosen.success} t={t} />
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2" role="group" aria-label={tt("event.choose")}>
          <p className="eyebrow">{tt("event.choose")}</p>
          {event.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="tec-choice tec-choice-row"
              onClick={() => {
                feedback("select");
                onChoose(option.id);
              }}
            >
              <span className="min-w-0 flex-1 text-left">
                <span className="block font-semibold">{t.g(`events.${event.id}.options.${option.id}.label`, vars)}</span>
                <EffectChips effects={option.success} t={t} />
                {option.chance !== null && option.failure.length > 0 ? (
                  <span className="mt-1 block text-2xs text-faint">
                    {tt("event.outcome")}: <EffectChips effects={option.failure} t={t} />
                  </span>
                ) : null}
              </span>
              <span className={cn("shrink-0 text-2xs font-semibold", option.chance === null ? "text-muted" : "text-glory")}>
                {option.chance === null ? tt("event.noRisk") : tt("event.chance", { percent: t.percent(option.chance) })}
              </span>
            </button>
          ))}
        </div>
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
        <p className="text-sm text-muted">{t.g(`matchEvent.situations.${situation}.body`, vars)}</p>
        <div className="mt-3 flex flex-col gap-2" role="group" aria-label={tt("match.choose")}>
          {event.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="tec-choice tec-choice-row"
              disabled={busy}
              onClick={() => {
                feedback("whistle");
                onChoose(option.id);
              }}
            >
              <span className="min-w-0 flex-1 text-left">
                <span className="block font-semibold">{t.g(`matchEvent.options.${option.id}.label`)}</span>
                <span className="block text-xs text-muted">{t.g(`matchEvent.options.${option.id}.hint`)}</span>
                {option.odds ? (
                  <span className="numeric mt-0.5 block text-2xs text-faint">
                    {t.g("matchEvent.odds", { win: t.percent(option.odds.win), draw: t.percent(option.odds.draw), loss: t.percent(option.odds.loss) })}
                  </span>
                ) : null}
              </span>
              {option.chance !== null ? (
                <span className="flex shrink-0 flex-col items-end text-right">
                  <span className="text-2xs text-muted">{t.g("matchEvent.goal", { goal: t.g(`matchEvent.options.${option.id}.goal`) })}</span>
                  <span className="display numeric text-2xl leading-none font-black text-glory">{t.percent(option.chance)}</span>
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
