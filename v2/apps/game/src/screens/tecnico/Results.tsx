import type { CoachCareer, PeriodReport } from "@craque/engine/coach";
import { ArrowRight, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { SectionRule } from "../../ui/Panel";
import { Chip, Delta } from "../../ui/Signals";
import { signed } from "../../ui/tone";
import { Fact } from "./shared";
import { StageSteps } from "./Stage";
import { competitionName, momentText, playerName, roundName } from "./text";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <SectionRule>{title}</SectionRule>
      {children}
    </section>
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
  return (
    <section className="tec-results" aria-labelledby="tec-results-title">
      <StageSteps career={career} />
      <div className="tec-results-scroll">
        <p className="eyebrow text-glory">{tt("results.eyebrow")}</p>
        <h2 id="tec-results-title" className="display text-3xl leading-none font-black uppercase">
          {report.final ? tt("results.titleSeason") : tt("results.titleHalf")}
        </h2>

        <Block title={tt("results.league")}>
          <dl>
            {report.position !== null ? (
              <Fact label={tt("header.objective")}>
                {ordinal(report.position)} / {report.tableSize} · {t.g(`objectives.${report.objective.kind}.name`)}
              </Fact>
            ) : null}
            <Fact label={tt("results.record")}>
              {tt("common.record", { won: report.record.won, drawn: report.record.drawn, lost: report.record.lost })} ·{" "}
              {tt("common.goals", { for: report.record.goalsFor, against: report.record.goalsAgainst })}
            </Fact>
          </dl>
        </Block>

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
                    <span className="text-xs text-muted">{tt("results.reached", { stage: roundName(tt, entry.reached) })}</span>
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
                  <span className="min-w-0 truncate">{playerName(career, change.player)}</span>
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
                  <span className="min-w-0 truncate">{playerName(career, injury.player)}</span>
                  <span className="text-xs text-bad">{t.ttp("common.days", injury.days)}</span>
                </li>
              ))}
            </ul>
          )}
        </Block>

        {report.relations.length > 0 ? (
          <Block title={tt("results.relations")}>
            <ul className="flex flex-col gap-1">
              {report.relations.map((change, index) => (
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
            <Fact label={tt("results.revenue")}>{money(report.finance.revenue)}</Fact>
            <Fact label={tt("results.wages")}>{money(-report.finance.wages)}</Fact>
            <Fact label={tt("results.transfers")}>{money(report.finance.transfers)}</Fact>
            <Fact label={tt("results.prizes")}>{money(report.finance.prizes)}</Fact>
            <Fact label={tt("header.cash")}>{money(report.finance.cash)}</Fact>
            <Fact label={tt("header.budget")}>{money(report.finance.budget)}</Fact>
          </dl>
        </Block>

        {report.moments.length > 0 ? (
          <Block title={tt("results.moments")}>
            <ul className="flex flex-col gap-1 text-sm">
              {report.moments.slice(0, 10).map((moment, index) => (
                <li key={`${moment.kind}:${index}`}>{momentText(career, moment, t)}</li>
              ))}
            </ul>
          </Block>
        ) : null}

        {report.revelations.length > 0 || report.disappointments.length > 0 ? (
          <Block title={tt("results.revelations")}>
            <p className="text-sm">{report.revelations.map((id) => playerName(career, id)).join(", ") || "-"}</p>
            {report.disappointments.length > 0 ? (
              <p className="text-sm text-muted">
                {tt("results.disappointments")}: {report.disappointments.map((id) => playerName(career, id)).join(", ")}
              </p>
            ) : null}
          </Block>
        ) : null}

        {report.promises.length > 0 ? (
          <Block title={tt("results.promises")}>
            <ul className="flex flex-col gap-1 text-sm">
              {report.promises.map((promise) => {
                const full = career.promises.find((item) => item.id === promise.id);
                return (
                  <li key={promise.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{full?.player ? playerName(career, full.player) : tt("club.promiseKinds.youth", { count: full?.target ?? 0 })}</span>
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
                  {playerName(career, entry.player)}: <strong>{tt(`squad.traits.${entry.trait}.name`)}</strong>
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
