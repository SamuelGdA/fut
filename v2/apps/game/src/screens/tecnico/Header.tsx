import { getLeague } from "@craque/world";
import { Menu } from "@base-ui/react/menu";
import { canRetire, type CoachCareer, leaguePosition, leagueState, titleAmbition } from "@craque/engine/coach";
import { d67 } from "../../i18n/tecnico/d67";
import { Flag as FlagIcon, Home, MoreVertical } from "lucide-react";
import { barTone, barWord, squadBar } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { IconButton } from "../../ui/Button";
import { Crest } from "../../ui/Media";
import { InfoTip } from "../../ui/InfoTip";
import { clubName, objectiveText, periodLabel, competitionName, roundName } from "./text";
import { revisionText } from "../../i18n/tecnico/revision";

/** O cabeçalho é a única casa do objetivo, classificação, reputação e relações. */
export function Header({ career, onLeave, onRetire }: { career: CoachCareer; onLeave(): void; onRetire(): void }) {
  const t = useTecnicoT();
  const { tt } = t;
  const coach = career.coach;
  if (!coach) return null;
  const state = leagueState(career, coach.club);
  const position = (state?.table?.find((row) => row.club === coach.club)?.played ?? 0) > 0 ? leaguePosition(career, coach.club) : null;
  const league = state ? getLeague(state.id.replace(/^league:/, "")) : null;
  const bars = [["board", coach.board], ["fans", coach.fans], ["squad", squadBar(career)]] as const;
  return <header className="career-header tec-hud">
    <div className="tec-hud-identity"><Crest club={coach.club} size={40} decorative plain /><div><p className="display tec-hud-club">{clubName(coach.club)}</p><p className="text-xs text-muted">{career.setup.identity.name} · {career.year}{career.setup.mode === "slow" ? ` · ${periodLabel(career, tt)}` : ""}</p></div></div>
    <div className="tec-hud-goal"><span className="eyebrow">{tt("header.objective")}</span><strong>{revisionText(t.locale, "target", { count: coach.objective.target })}</strong><InfoTip label={tt("header.objective")}><p>{objectiveText(t, coach)}</p>{titleAmbition(career).weight > 0 ? <p className="mt-2"><strong>{d67(t.locale, "ambitionTitle")}</strong><br />{d67(t.locale, "ambitionHint")}</p> : null}{coach.cupObjectives?.length ? <div className="mt-2 flex flex-col gap-2">{coach.cupObjectives.map((goal) => <p key={goal.competition}><strong>{competitionName(goal.competition, t.locale)}</strong><br />{revisionText(t.locale, "goal", { stage: roundName(tt, goal.target) })}</p>)}</div> : null}</InfoTip>
      {position !== null ? <span className="tec-hud-rank numeric"><span>{tt("ux.leaguePlace")}</span> {t.ordinal(position)} <span className="tec-hud-league">{league?.name ?? tt("results.league")}</span></span> : null}
    </div>
    <ul className="tec-bars" aria-label={tt("club.bars")}>{bars.map(([bar, value]) => {
      const word = barWord(value);
      return <li key={bar} className="tec-bar" data-tone={barTone(word)}><span className="tec-bar-name">{t.g(`bars.${bar}.name`)}</span><span className="tec-bar-track" aria-hidden="true"><span style={{ transform: `scaleX(${Math.max(0.02, value / 100)})` }} /></span><span className="tec-bar-word text-tone">{tt(`bars.words.${bar}.${word}`)}</span><span className="sr-only">{Math.round(value)}</span><InfoTip label={t.g(`bars.${bar}.name`)}>{t.g(`bars.${bar}.hint`)}</InfoTip></li>;
    })}</ul>
    <div className="tec-hud-reputation"><span className="eyebrow">{tt("header.reputation")}</span><strong className="numeric">{Math.round(career.reputation)}</strong><InfoTip label={tt("header.reputation")}>{tt("header.reputationHint")}</InfoTip></div>
    <Menu.Root><Menu.Trigger render={<IconButton label={tt("header.leave")} size="iconSm"><MoreVertical size={18} aria-hidden="true" /></IconButton>} /><Menu.Portal><Menu.Positioner side="bottom" align="end" sideOffset={6} className="layer-popover"><Menu.Popup className="popover-popup min-w-56 p-1.5"><Menu.Item className="menu-item" onClick={onLeave}><Home size={16} aria-hidden="true" />{tt("header.leave")}</Menu.Item>{canRetire(career) ? <Menu.Item className="menu-item" onClick={onRetire}><FlagIcon size={16} aria-hidden="true" />{tt("header.retire")}</Menu.Item> : null}</Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>
  </header>;
}
