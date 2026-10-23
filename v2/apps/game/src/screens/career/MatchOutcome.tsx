import { dramaText, matchOutcomeText } from "@craque/content";
import { matchActionKind, type KeyMatchResult, type Position } from "@craque/engine";
import { getCompetition } from "@craque/world";
import { ArrowRight, Check, X } from "lucide-react";
import { d74 } from "../../i18n/d74";
import { decisionFeedback } from "../../i18n/decisionFeedback";
import { useT } from "../../i18n/useT";
import { TrophyArt } from "../../ui/Media";
import { Button } from "../../ui/Button";
import { useEffect } from "react";
import { feedback } from "../../services/feedback";

export function MatchOutcome({ result, position, onContinue }: { result: KeyMatchResult; position: Position; onContinue(): void }) {
  const { locale } = useT(); const text = d74(locale); const copy = dramaText(locale);
  const labels = decisionFeedback(locale);
  const kind = matchActionKind(position, result.match, result.action);
  const badge = result.success ? kind === "shot" && result.match.scene === "shootout" ? labels.shootout : labels[kind] : kind === "shot" ? labels.missedShot : kind === "pass" ? labels.missedPass : kind === "hold" ? labels.missedHold : labels.missedDefence;
  const champion = result.won && result.match.stage === "final";
  const competition = champion ? getCompetition(result.match.competition) : null;
  const ending = result.match.stage === "league" ? result.score[0] === result.score[1] ? copy.draw : result.won ? text.victory : text.defeat : result.match.stage === "final" ? result.won ? copy.champion : copy.runnerUp : result.won ? copy.advanced : copy.eliminated;
  const Icon = result.success ? Check : X;
  // O som acompanha o aviso do resultado (D87): um para o lance que deu certo, outro para o que não deu.
  useEffect(() => { feedback(result.success ? "hit" : "miss"); }, [result]);
  return <div className="match-outcome" data-success={result.success} data-champion={champion || undefined} data-kind={kind}>
    <div className="match-feedback">
      <div className="match-feedback-top"><span className="match-result-badge"><Icon size={14} aria-hidden="true" />{badge}</span>{competition ? <span className="match-result-trophy"><TrophyArt competition={competition} language={locale} size={48} decorative /></span> : null}</div>
      <div className="match-final"><h3 className="result-title">{copy.fullTime}: {result.score.join(" × ")}{result.penalties ? ` (${copy.penalties} ${result.penalties.join(" × ")})` : ""} · {ending}</h3><p>{matchOutcomeText(locale, result, position)}</p></div>
    </div>
    <Button variant="secondary" block className="match-continue" onClick={onContinue}>{text.continue}<ArrowRight size={17} aria-hidden="true" /></Button>
  </div>;
}
