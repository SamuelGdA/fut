import { getClub } from "@craque/world";
import { financeLabel, wageBillOf, type CoachCareer, type PeriodReport } from "@craque/engine/coach";
import { ArrowRight, ChevronDown, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Chip, Delta } from "../../ui/Signals";
import { signed } from "../../ui/tone";
import { playerRow } from "../../features/tecnico/view";
import { PlayerPeek } from "./PlayerPeek";
import { EventText } from "./EventText";
import { Crest } from "../../ui/Media";
import { Fact } from "./shared";
import { Resolution } from "./DecisionUX";
import { CountUp } from "../../ui/CountUp";
import { StageSteps } from "./Stage";
import { competitionName, momentText, playerName, roundName } from "./text";
import { SeasonHonours } from "./SeasonHonours";
import { d66 } from "../../i18n/tecnico/d66";
import { revisionText } from "../../i18n/tecnico/revision";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="tec-report-block">
      <summary><span className="tec-report-symbol" aria-hidden="true">●</span><strong>{title}</strong><ChevronDown size={17} aria-hidden="true" /></summary>
      <div className="tec-report-content">{children}</div>
    </details>
  );
}

/**
 * Resumo do período (spec 16): liga, copas, objetivo, evolução do elenco,
 * lesões, relações com motivo, dinheiro, momentos, promessas e
 * características novas. No lento, o primeiro turno é parcial.
 */
export function ResultsView({ career, onContinue }: { career: CoachCareer; onContinue(): void }) {
  const t = useTecnicoT();
  const { tt, money, ordinal } = t;
  const report: PeriodReport | null = career.lastReport;
  if (!report) return null;
  const mention = (id: string) => {
    const player = career.players[id];
    const name = playerName(career, id);
    return player ? <PlayerPeek row={playerRow(career, player)} trigger={<button type="button" className="tec-inline-person">{name}</button>} /> : name;
  };
  const titles = career.history.find(entry => entry.year === report.year && entry.club === report.club)?.titles ?? report.competitions.filter(entry => entry.champion).map(entry => entry.competition);
  const event = career.event;
  const fixture = event?.match ? career.fixtures.find((game) => game.id === event.match?.fixture) : null;
  // O motor registra cada jogo. O relatório reúne motivos iguais para evitar uma parede de linhas.
  const relations = [...report.relations.reduce((grouped, change) => {
    const key = `${change.bar}:${change.reason}`;
    const previous = grouped.get(key);
    grouped.set(key, { ...change, delta: Math.round(((previous?.delta ?? 0) + change.delta) * 100) / 100 });
    return grouped;
  }, new Map<string, PeriodReport["relations"][number]>()).values()];
  return (
    <section className="tec-results" aria-labelledby="tec-results-title">
      <StageSteps career={career} />
      {/* Rola por dentro: entra no Tab, para o teclado chegar ao fim do relatório. */}
      <div className="tec-results-scroll" tabIndex={0} role="region" aria-labelledby="tec-results-title">
        <p className="eyebrow text-glory">{tt("results.eyebrow")}</p>
        <h2 id="tec-results-title" className="display text-3xl leading-none font-black uppercase">
          {report.final ? tt("results.titleSeason") : tt("results.titleHalf")}
        </h2>
        {report.final && (report.awards?.length || titles.length) ? <div className="tec-season-awards"><p className="eyebrow text-glory">{d66(t.locale,"seasonHonours")}</p><SeasonHonours year={report.year} titles={titles} awards={report.awards ?? []} mention={mention} /></div> : null}

        {event?.match && event.chosen && fixture?.result ? <Resolution key={fixture.id} good={event.outcome === "success"} title={tt("ux.matchResult")}>
          <p className="text-sm font-semibold">{t.g(`matchEvent.options.${event.chosen}.label`)}</p>
          <p className="display numeric text-3xl font-black">{fixture.result.home} × {fixture.result.away}</p>
          <p className="text-xs text-muted">{`${getClub(fixture.home)?.name ?? fixture.home} · ${getClub(fixture.away)?.name ?? fixture.away}`}</p>
          <p className="text-sm">{t.g(`matchEvent.${event.outcome === "success" ? "success" : "failure"}`)}</p>
        </Resolution> : null}
        <div className="tec-result-stats">
          {(["won", "drawn", "lost"] as const).map((key, index) => <div key={key} data-tone={index === 0 ? "good" : index === 2 ? "bad" : "neutral"}><span className="eyebrow">{tt(`ux.${index === 0 ? "win" : index === 1 ? "draw" : "loss"}`)}</span><strong className="display numeric"><CountUp to={report.record[key]} /></strong></div>)}

        </div>

        <div className="tec-campaign" aria-label={tt("results.league")}>
          <div className="tec-campaign-heading"><Crest club={report.club} size={54} decorative /><div><p className="eyebrow">{competitionName(report.league, t.locale)}</p><p className="display">{report.position !== null ? ordinal(report.position) : "?"}<span> / {report.tableSize}</span></p></div>{report.final && titles.includes(report.league) ? <Chip tone="glory" glyph><Trophy size={12} aria-hidden="true" />{tt("results.champion")}</Chip> : <Chip tone={report.position !== null && report.position <= report.objective.target ? "good" : "bad"} glyph>{t.g(`objectives.${report.objective.kind}.name`)}</Chip>}</div>
          <div className="tec-campaign-bar" aria-hidden="true">{(["won", "drawn", "lost"] as const).map((key) => <span key={key} data-result={key} style={{ flex: report.record[key] || 0.01 }} />)}</div>
          <div className="tec-campaign-goals"><span><strong className="numeric">{report.record.goalsFor}</strong>{tt("ux.scored")}</span><span><strong className="numeric">{report.record.goalsAgainst}</strong>{tt("ux.conceded")}</span></div>
        </div>

        {report.competitions.length > 0 ? (
          <Block title={tt("results.competitions")}>
            <ul className="flex flex-col gap-1">
              {report.competitions.map((entry) => (
                <li key={entry.competition} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{competitionName(entry.competition, t.locale)}</span>
                  {entry.champion ? (
                    <Chip tone="glory" glyph size="sm">
                      <Trophy size={12} aria-hidden="true" />
                      {tt("results.champion")}
                    </Chip>
                  ) : (
                    <span className="text-xs text-muted">{entry.active ? revisionText(t.locale, "active", { stage: roundName(tt, entry.reached) }) : tt("results.reached", { stage: roundName(tt, entry.reached) })}</span>
                  )}
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        <Block title={tt("results.ovr")}>
          {report.ovrChanges.length === 0 ? (
            <p className="text-sm text-muted">{tt("results.noOvr")}</p>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {report.ovrChanges.slice(0, 12).map((change) => (
                <li key={change.player} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{mention(change.player)}</span>
                  <span className="flex items-center gap-2">
                    {change.developed ? <Chip tone="info" size="sm">{tt("results.developed")}</Chip> : null}
                    <span className="numeric text-muted">
                      {change.from} → {change.to}
                    </span>
                    <Delta value={change.to - change.from} className="text-xs" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Block>

        <Block title={tt("results.injuries")}>
          {report.injuries.length === 0 ? (
            <p className="text-sm text-muted">{tt("results.noInjuries")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {report.injuries.map((injury, index) => (
                <li key={`${injury.player}:${index}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{mention(injury.player)}</span>
                  <span className="text-xs text-bad">{revisionText(t.locale, "injury", { count: injury.days >= 300 ? 2 : 1 })}</span>
                </li>
              ))}
            </ul>
          )}
        </Block>

        {report.relations.length > 0 ? (
          <Block title={tt("results.relations")}>
            <ul className="flex flex-col gap-1">
              {relations.map((change, index) => (
                <li key={`${change.bar}:${change.reason}:${index}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0">
                    <span className="text-muted">{change.bar === "reputation" ? tt("header.reputation") : t.g(`bars.${change.bar}.name`)}: </span>
                    {t.g(`reasons.${change.reason}`)}
                  </span>
                  <span data-tone={change.delta > 0 ? "good" : change.delta < 0 ? "bad" : "neutral"} className="numeric text-tone text-sm font-bold">
                    {signed(change.delta)}
                  </span>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}

        <Block title={tt("results.finance")}>
          <dl>
            <Fact label={tt("club.budget")}>{money(report.finance.budget)}</Fact>
            <Fact label={tt("club.wages")}>{tt("common.perMonth", { money: money(wageBillOf(career, report.club)) })}</Fact>
            <Fact label={tt("club.financeState")}>{career.clubs[report.club] ? t.g(`finance.${financeLabel(career.clubs[report.club]!, wageBillOf(career, report.club))}`) : ""}</Fact>
          </dl>
        </Block>

        {report.moments.length > 0 ? (
          <Block title={tt("results.moments")}>
            <ul className="flex flex-col gap-1 text-sm">
              {report.moments.slice(0, 10).map((moment, index) => (
                <li key={`${moment.kind}:${index}`}>{<EventText career={career} subject={"player" in moment ? moment.player : null} text={momentText(career, moment, t)} />}</li>
              ))}
            </ul>
          </Block>
        ) : null}

        {report.revelations.length > 0 || report.disappointments.length > 0 ? (
          <Block title={tt("results.revelations")}>
            <div className="tec-report-players">
              {[...report.revelations.map((id) => ({ id, good: true })), ...report.disappointments.map((id) => ({ id, good: false }))].map(({ id, good }) => {
                const player = career.players[id];
                if (!player) return null;
                const row = playerRow(career, player);
                return <PlayerPeek key={id} row={row} trigger={<button type="button" className="tec-report-player" data-tone={good ? "good" : "bad"}><span className="tec-report-player-ovr numeric">{row.ovr}</span><span><strong>{row.name}</strong><small className="text-tone">{good ? "▲" : "▼"} {tt(good ? "ux.progress" : "ux.below")}</small></span></button>} />;
              })}
            </div>
          </Block>
        ) : null}

        {report.promises.length > 0 ? (
          <Block title={tt("results.promises")}>
            <ul className="flex flex-col gap-1 text-sm">
              {report.promises.map((promise) => {
                const full = career.promises.find((item) => item.id === promise.id);
                return (
                  <li key={promise.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{full?.player ? mention(full.player) : tt("club.promiseKinds.youth", { count: full?.target ?? 0 })}</span>
                    <Chip tone={promise.status === "kept" ? "good" : promise.status === "broken" ? "bad" : "neutral"} size="sm" glyph>
                      {tt(`club.promiseStatus.${promise.status}`)}
                    </Chip>
                  </li>
                );
              })}
            </ul>
          </Block>
        ) : null}

        {report.newTraits.length > 0 ? (
          <Block title={tt("results.traits")}>
            <ul className="flex flex-col gap-1 text-sm">
              {report.newTraits.map((entry) => (
                <li key={`${entry.player}:${entry.trait}`}>
                  {mention(entry.player)}: <strong>{tt(`squad.traits.${entry.trait}.name`)}</strong>
                </li>
              ))}
            </ul>
          </Block>
        ) : null}
      </div>
      <div className="tec-advance">
        <span />
        <Button
          size="lg"
          onClick={() => {
            feedback("confirm");
            onContinue();
          }}
        >
          {tt("results.next")}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
