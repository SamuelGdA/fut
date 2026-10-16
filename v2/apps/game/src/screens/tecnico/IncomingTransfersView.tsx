import { salePreview, type CoachCareer, type CoachCommand } from "@craque/engine/coach";
import { ArrowRight, Check, X } from "lucide-react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { revisionText } from "../../i18n/tecnico/revision";
import { d67 } from "../../i18n/tecnico/d67";
import { playerRow } from "../../features/tecnico/view";
import { Button } from "../../ui/Button";
import { Chip } from "../../ui/Signals";
import { SectionRule } from "../../ui/Panel";
import { PlayerPeek } from "./PlayerPeek";
import { ClubTag, PlayerLine } from "./shared";

/** A mesma identidade, hierarquia e peças do laboratório e das negociações. */
export function IncomingTransfersView({ career, run }: { career: CoachCareer; run(command: CoachCommand): string | null }) {
  const t = useTecnicoT();
  return <section className="tec-results" aria-labelledby="tec-incoming-title">
    <div className="tec-results-scroll" tabIndex={0} role="region" aria-labelledby="tec-incoming-title">
      <p className="eyebrow text-glory">{t.tt("process.responses")}</p>
      <h2 id="tec-incoming-title" className="display border-l-4 border-club pl-3 text-3xl leading-none font-black uppercase">{revisionText(t.locale, "transferTitle")}</h2>
      <p className="text-sm text-muted">{revisionText(t.locale, "transferHint")}</p>
      <SectionRule>{d67(t.locale, "saleOffers")}</SectionRule>
      <ul className="tec-incoming-offers">{career.transferOffers.map((offer) => {
        const player = career.players[offer.player];
        if (!player) return null;
        const preview = salePreview(career, offer), row = playerRow(career, player);
        return <li key={offer.id} className="tec-incoming-card" data-status={offer.status}>
          <PlayerPeek row={row} trigger={<button type="button" className="tec-incoming-player"><PlayerLine row={row} t={t} /></button>} />
          <div className="tec-incoming-deal">
            <div className="min-w-0"><p className="eyebrow mb-1">{d67(t.locale, "buyer")}</p><p className="flex min-w-0 items-center gap-2"><ArrowRight size={16} className="shrink-0 text-muted" aria-hidden="true" /><ClubTag club={offer.buyer ?? ""} size={24} /></p></div>
            <dl className="tec-incoming-fee"><dt className="eyebrow">{d67(t.locale, "offerValue")}</dt><dd className="display numeric text-3xl font-extrabold text-glory">{t.money(offer.price)}</dd></dl>
          </div>
          <div className="tec-incoming-actions">{offer.status === "pending" ? <>
            <Button size="sm" disabled={!preview.ok} onClick={() => run({ type: "respondTransfer", item: offer.id, decision: "accept" })}><Check size={16} aria-hidden="true" />{t.tt("common.accept")}</Button>
            <Button size="sm" variant="secondary" onClick={() => run({ type: "respondTransfer", item: offer.id, decision: "decline" })}><X size={16} aria-hidden="true" />{t.tt("common.decline")}</Button>
            {!preview.ok ? <p className="text-xs text-bad" role="status">{preview.blockers.map((reason) => t.tt(`process.blockers.${(["budget", "cash", "wages", "registration", "squad", "promise", "gone", "notPending"] as const).find((key) => key === reason) ?? "gone"}`)).join(" · ")}</p> : null}
          </> : <span role="status"><Chip tone={offer.status === "accepted" ? "good" : "neutral"} glyph>{t.tt(offer.status === "accepted" ? "process.accepted" : "process.declined")}</Chip></span>}</div>
        </li>;
      })}</ul>
    </div>
    <div className="tec-advance"><span /><Button onClick={() => run({ type: "continueTransfers" })}>{t.tt("common.continue")}<ArrowRight size={18} aria-hidden="true" /></Button></div>
  </section>;
}
