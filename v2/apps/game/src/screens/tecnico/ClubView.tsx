import { type CoachCareer, financeLabel, FINANCE, wageBillOf } from "@craque/engine/coach";
import { playerRow, barTone, barWord, squadBar } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { SectionRule } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";
import { Meter } from "../../ui/Stats";
import { Fact } from "./shared";
import { objectiveText } from "./text";

/**
 * Clube (spec 11 e 12): objetivo, as três relações com explicação curta,
 * finanças (receita, folha e teto, caixa, verba) e promessas com prazo.
 * Nenhuma exigência arbitrária de folha: o teto é a regra, e está na tela.
 */
export function ClubView({ career }: { career: CoachCareer }) {
  const t = useTecnicoT();
  const { tt, money } = t;
  const coach = career.coach;
  if (!coach) return null;
  const club = career.clubs[coach.club];
  if (!club) return null;
  const wages = wageBillOf(career, coach.club);
  const state = financeLabel(club, wages);
  const bars = [
    ["board", coach.board],
    ["fans", coach.fans],
    ["squad", squadBar(career)],
  ] as const;
  const promises = career.promises.filter((promise) => promise.status === "active");
  const deadline = (until: number) => (until % 365 <= 149 && career.setup.mode === "slow" ? tt("club.deadline.half") : tt("club.deadline.season"));

  return (
    <section className="flex flex-col gap-4" aria-labelledby="tec-club-title">
      <SectionRule as="h2">
        <span id="tec-club-title">{tt("club.title")}</span>
      </SectionRule>

      <div>
        <p className="eyebrow">{tt("club.objective")}</p>
        <p className="mt-1 font-semibold">{objectiveText(t, coach)}</p>
        <p className="text-xs text-muted">{tt("club.expected", { position: coach.objective.expected })}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="eyebrow">{tt("club.bars")}</p>
        {bars.map(([bar, value]) => {
          const word = barWord(value);
          return (
            <div key={bar}>
              <Meter label={t.g(`bars.${bar}.name`)} value={value} band={tt(`bars.words.${bar}.${word}`)} tone={barTone(word)} />
              <p className="mt-1 text-2xs text-faint">{t.g(`bars.${bar}.hint`)}</p>
            </div>
          );
        })}
        <div>
          <Meter label={tt("header.reputation")} value={Math.round(career.reputation)} tone="info" showValue />
          <p className="mt-1 text-2xs text-faint">{tt("header.reputationHint")}</p>
        </div>
      </div>

      <div>
        <p className="eyebrow">{tt("club.finances")}</p>
        <dl className="mt-1">
          <Fact label={tt("club.financeState")}>
            <Chip tone={state === "healthy" ? "good" : state === "tight" ? "bad" : "neutral"} size="sm" glyph>
              {t.g(`finance.${state}`)}
            </Chip>
          </Fact>
          <Fact label={tt("club.revenue")}>{money(club.revenue)}</Fact>
          <Fact label={tt("club.wages")}>{tt("common.perMonth", { money: money(wages) })}</Fact>
          <Fact label={tt("club.wageCap")}>{tt("common.perMonth", { money: money((club.revenue * FINANCE.wageCap) / 12) })}</Fact>
          <Fact label={tt("club.cash")}>
            <span className={club.cash < 0 ? "text-bad" : undefined}>{money(club.cash)}</span>
          </Fact>
          <Fact label={tt("club.budget")}>{money(coach.budget)}</Fact>
        </dl>
      </div>

      <div>
        <p className="eyebrow">{tt("club.promises")}</p>
        {promises.length === 0 ? (
          <p className="mt-1 text-sm text-muted">{tt("club.noPromises")}</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1.5">
            {promises.map((promise) => {
              const player = promise.player ? career.players[promise.player] : null;
              return (
                <li key={promise.id} className="rounded-sm border border-line bg-panel-2 p-2 text-sm">
                  <p className="font-semibold">{player ? playerRow(career, player).name : tt("squad.youthProduct")}</p>
                  <p className="text-xs">{tt(`club.promiseKinds.${promise.kind}`, { percent: t.percent(promise.target), count: promise.target })}</p>
                  <p className="text-2xs text-faint">{tt("club.promiseUntil", { when: deadline(promise.until) })}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
