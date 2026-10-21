import { dramaAction, dramaDecision, dramaHint, dramaOption, dramaText } from "@craque/content";
import { type Career, type KeyMatchResult, type VeteranPath } from "@craque/engine";
import { matchOptionHint, matchOptionText } from "../../features/career/matchPresentation";
import { getClub, getCompetition, getCountry } from "@craque/world";
import { ArrowUpRight, Check, Crosshair, Eye, GraduationCap, Megaphone, Shield, Swords, Users, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Crest, Flag } from "../../ui/Media";
import { LedScore } from "./LedScore";
import { MatchOutcome } from "./MatchOutcome";
import { d74 } from "../../i18n/d74";
import { decisionFeedback } from "../../i18n/decisionFeedback";
import { promiseChips, veteranChips } from "../../i18n/d78";
import { Chip } from "../../ui/Signals";

const PATH_ICONS = { maestro: Eye, captain: Megaphone, poacher: Crosshair, guardian: Shield, athlete: Zap, mentor: GraduationCap };

export function DramaDecisionPanel({ career, onChoose, original, result, onContinue }: { career: Career; onChoose(id: string): boolean; original: string | null; result?: KeyMatchResult | null; onContinue?: () => void }) {
  const { locale, t } = useT();
  const title = useRef<HTMLHeadingElement>(null);
  const decision = career.decision;
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [decision?.id, result]);
  if (!decision) return null;
  const copy = dramaText(locale);
  const flow = d74(locale);
  const text = dramaDecision(locale, career, decision);
  const match = decision.match;
  const selected = result ? decision.options.find((option) => option.kind === "drama" && option.action === result.action) : null;
  const scoreChanged = result && match && result.score.some((value, index) => value !== match.score[index]);
  const name = (id: string) => match?.national ? getCountry(id)?.names[locale] ?? id : getClub(id)?.short ?? id;
  const team = (id: string) => match?.national ? <Flag country={getCountry(id)!} language={locale} size={22} decorative /> : <Crest club={id} size={28} decorative />;
  return <section className="decision drama-decision" data-kind={decision.kind} aria-labelledby={`decisao-${decision.id}`}>
    {match ? <div className="match-broadcast">
      <div className="match-broadcast-top"><span className="match-live"><i aria-hidden="true" />{copy.live}</span><span>{decision.year}</span></div>
      <p className="match-competition">{getCompetition(match.competition)?.names[locale] ?? match.competition}</p>
      <p className="match-stage">{copy.stages[match.stage]}</p>
      <div className="match-scoreboard"><span>{team(match.team)}<b>{name(match.team)}</b></span><strong data-updated={scoreChanged || undefined}><LedScore score={result?.score ?? match.score} previous={result ? match.score : undefined} /></strong><span>{team(match.opponent)}<b>{name(match.opponent)}</b></span></div>
      <p className="match-minute">{result ? copy.fullTime : `${match.minute}′`} <span>•</span> {match.scene === "shootout" ? copy.penalties : copy.stages[match.stage]}</p>
    </div> : <p className="eyebrow">{decision.year} · {decision.age}{decision.kind === "promise" ? ` · ${copy.active}` : ""}</p>}
    {result ? <><h2 ref={title} tabIndex={-1} id={`decisao-${decision.id}`} className="sr-only">{flow.outcome}</h2>{selected?.kind === "drama" && match ? <div className="match-selected-choice"><span className="eyebrow">{decisionFeedback(locale).selected}</span><button type="button" className="option drama-option" aria-pressed="true" disabled><span className="option-main"><span className="option-title">{matchOptionText(locale, match, selected.action, career.player.position)}</span></span><Check size={18} aria-hidden="true" /></button></div> : null}<MatchOutcome result={result} position={career.player.position} onContinue={onContinue ?? (() => {})} /></> : <><div className="drama-heading"><h2 ref={title} tabIndex={-1} id={`decisao-${decision.id}`} className="decision-title outline-none">{text.title}</h2><p className="decision-body">{text.body}</p></div>
    <div className="decision-options drama-options" data-layout={decision.kind === "veteran" ? "grid" : undefined} role="group" aria-labelledby={`decisao-${decision.id}`}>
      {decision.options.map((option) => {
        if (option.kind !== "drama") return null;
        const path = decision.kind === "veteran";
        const Icon = path ? PATH_ICONS[option.action as VeteranPath] : option.action === "team" || option.action === "leave" ? Users : option.action === "safe" || option.action === "humble" ? Shield : option.action === "left" || option.action === "right" || option.action === "take" ? Crosshair : Swords;
        const chips = path ? veteranChips(locale, option.action as VeteranPath, career.player.position === "gk") : null;
        const promise = decision.promises?.find(item => item.level === option.action);
        const matchLabel = match ? matchOptionText(locale, match, option.action, career.player.position) : null;
        return <button type="button" className="option drama-option" data-path={path ? option.action : undefined} key={option.id} data-original={original === option.id ? t("career.originalChoice") : undefined} title={path ? dramaHint(locale, option.action, career.player.position) : undefined} onClick={() => { feedback("confirm"); onChoose(option.id); }}>
          <span className="option-icon"><Icon size={18} aria-hidden="true" /></span><span className="option-main"><span className="option-title">{promise ? dramaAction(locale, option.action) : matchLabel ?? dramaOption(locale, decision, option, career.player.position)}</span>{promise ? <span className="promise-option-target">{promise.target}+ {copy[promise.metric]}</span> : null}{chips ? <span className="veteran-effects"><Chip tone="good" glyph size="sm">{chips[0]}</Chip><Chip tone="bad" glyph size="sm">{chips[1]}</Chip><span className="sr-only">{dramaHint(locale, option.action, career.player.position)}</span></span> : promise ? <span className="promise-option-effects">{promiseChips(locale, promise.level).map((chip) => <Chip key={chip.text} tone={chip.tone} glyph={chip.tone !== "neutral"} size="sm">{chip.text}</Chip>)}</span> : <span className="drama-hint">{match ? matchOptionHint(locale, match, option.action, career.player.position) : dramaHint(locale, option.action, career.player.position)}</span>}</span>{!path ? <ArrowUpRight size={16} aria-hidden="true" /> : null}
        </button>;
      })}
    </div>
    </>}
  </section>;
}
