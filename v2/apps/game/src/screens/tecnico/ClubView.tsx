import { type CoachCareer, financeLabel, promiseProgress, FINANCE, wageBillOf } from "@craque/engine/coach";
import { playerRow, budgetSpent } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { SectionRule } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";

import { FinanceMeter } from "./FinanceMeter";

import { PlayerPeek } from "./PlayerPeek";
import { d64 } from "../../i18n/tecnico/d64";
import { Fact } from "./shared";
import { revisionText } from "../../i18n/tecnico/revision";
import { competitionName, roundName } from "./text";


/**
 * Clube (spec 11 e 12): verba para contratações, folha mensal e situação
 * e compromissos com progresso e prazo. Objetivo e relações pertencem ao HUD único.
 * Nenhuma exigência arbitrária de folha: o teto é a regra, e está na tela.
 */
export function ClubView({ career }: { career: CoachCareer }) {
  const t = useTecnicoT();
  const { tt } = t;
  const coach = career.coach;
  if (!coach) return null;
  const club = career.clubs[coach.club];
  if (!club) return null;
  const wages = wageBillOf(career, coach.club);
  const state = financeLabel(club, wages);
  const promises = career.promises.filter((promise) => promise.status === "active");

  return (
    <section className="flex flex-col gap-4" aria-labelledby="tec-club-title">
      <SectionRule as="h2">
        <span id="tec-club-title">{tt("club.title")}</span>
      </SectionRule>

      <div>
        <p className="eyebrow">{tt("club.finances")}</p>
        <FinanceMeter label={tt("club.budget")} used={budgetSpent(career)} limit={coach.budget + budgetSpent(career)} t={t} />
        <FinanceMeter label={tt("club.wages")} used={wages} limit={club.revenue * FINANCE.wageCap / 12} t={t} />
        <dl className="mt-1">
          <Fact label={tt("club.financeState")}>
            <Chip tone={state === "healthy" ? "good" : state === "tight" ? "bad" : "neutral"} size="sm" glyph>
              {t.g(`finance.${state}`)}
            </Chip>
          </Fact>

        </dl>
      </div>

      <div><p className="eyebrow">{d64(t.locale,"clubProgressTitle")}</p><p className="mt-1 text-sm text-muted">{d64(t.locale,"clubProgressCoach")}</p><dl><Fact label={d64(t.locale,"drought")}>{club.titleDrought ? t.ttp("player.seasons",club.titleDrought) : d64(t.locale,"noDrought")}</Fact></dl></div>

      {coach.cupObjectives?.length ? <div><p className="eyebrow">{revisionText(t.locale, "objectives")}</p><dl className="mt-2">{coach.cupObjectives.map((goal) => <Fact key={goal.competition} label={competitionName(goal.competition, t.locale)}>{roundName(tt, goal.target)}</Fact>)}</dl></div> : null}
      <div>
        <p className="eyebrow">{tt("club.promises")}</p>
        {promises.length === 0 ? (
          <p className="mt-1 text-sm text-muted">{tt("club.noPromises")}</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1.5">
            {promises.map((promise) => {
              const player = promise.player ? career.players[promise.player] : null;
              const progress = promiseProgress(career, promise);
              return (
                <li key={promise.id} className="rounded-sm border border-line bg-panel-2 p-2 text-sm">
                  <p className="font-semibold">{player ? <PlayerPeek row={playerRow(career, player)} trigger={<button type="button" className="tec-inline-person">{playerRow(career, player).name}</button>} /> : tt("squad.youthProduct")}</p>
                  <p className="text-xs">{d64(t.locale,"nextStarter")}</p>
                  <div className="tec-agreement-track" role="progressbar" aria-label={d64(t.locale,"nextStarter")} aria-valuemin={0} aria-valuemax={1} aria-valuenow={progress.done}><span style={{width:`${progress.done*100}%`}} /></div>
                  <p className="text-xs">{d64(t.locale,progress.done?"promiseKept":"promisePending")}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
