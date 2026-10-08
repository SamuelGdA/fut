import { CAREER_SEASONS, type CoachCareer } from "@craque/engine/coach";
import { BookOpen, Flag as FlagIcon, Trophy } from "lucide-react";
import { useState } from "react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { ConfirmDialog } from "../../ui/Overlays";
import { SectionRule } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";
import { signed } from "../../ui/tone";
import { OfferCard } from "./Offers";
import { Fact } from "./shared";
import { competitionName } from "./text";

/**
 * Avaliação anual (spec 14): objetivo, confiança da diretoria com o termo que
 * mais pesou, tolerância pelo histórico, reputação e títulos. Depois, as
 * propostas: ficar (se o clube quiser), mudar ou encerrar. Na última
 * temporada, só o legado.
 */
export function ReviewView({
  career,
  onDecide,
  busy,
}: {
  career: CoachCareer;
  onDecide(choice: "stay" | "retire" | "finish" | { offer: string }): void;
  busy: boolean;
}) {
  const t = useTecnicoT();
  const { tt, ordinal } = t;
  const review = career.review;
  const entry = career.history[career.history.length - 1];
  const [confirmRetire, setConfirmRetire] = useState(false);
  if (!review || !entry) return null;
  const last = career.seasonIndex >= CAREER_SEASONS - 1;
  const repDelta = Math.round(review.reputationAfter - review.reputationBefore);

  return (
    <section className="tec-results" aria-labelledby="tec-review-title">
      <div className="tec-results-scroll">
        <p className="eyebrow text-glory">{tt("review.eyebrow")}</p>
        <h2 id="tec-review-title" className="display text-3xl leading-none font-black uppercase">
          {review.dismissed ? t.g("evaluation.dismissed") : review.objectiveMet ? tt("review.met") : tt("review.missed")}
        </h2>
        <p className="text-sm text-muted">{t.g(`evaluation.reasons.${review.reason}`)}</p>
        {!review.dismissed ? <p className="text-sm">{t.g(`evaluation.tolerance.${review.tolerance}`)}</p> : null}

        <dl>
          <Fact label={tt("review.confidence")}>
            <span data-tone={review.confidence >= 50 ? "good" : review.confidence >= 35 ? "neutral" : "bad"} className="text-tone">
              {review.confidence}
            </span>
          </Fact>
          {review.position !== null ? (
            <Fact label={tt("header.objective")}>
              {ordinal(review.position)} / {entry.tableSize} · {t.g(`objectives.${entry.objective.kind}.name`)}
            </Fact>
          ) : null}
          <Fact label={tt("review.reputation")}>
            {Math.round(review.reputationAfter)} ({signed(repDelta)})
          </Fact>
        </dl>

        <div className="flex flex-wrap gap-2">
          {entry.promoted ? <Chip tone="good" glyph>{tt("review.promoted")}</Chip> : null}
          {entry.relegated ? <Chip tone="bad" glyph>{tt("review.relegated")}</Chip> : null}
          {entry.titles.map((title) => (
            <Chip key={title} tone="glory" glyph>
              <Trophy size={12} aria-hidden="true" />
              {competitionName(title, t.locale)}
            </Chip>
          ))}
        </div>

        {last ? (
          <p className="text-sm text-glory">{tt("review.lastSeason")}</p>
        ) : (
          <section className="flex flex-col gap-3">
            <SectionRule>{tt("offers.seasonTitle")}</SectionRule>
            <p className="text-sm text-muted">{tt("offers.seasonLead")}</p>
            {career.offers.length === 0 ? <p className="text-sm">{tt("review.noOffers")}</p> : null}
            {career.offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} career={career} busy={busy} onAccept={() => onDecide(offer.stay ? "stay" : { offer: offer.id })} />
            ))}
          </section>
        )}
      </div>
      <div className="tec-advance">
        {last ? (
          <>
            <span />
            <Button
              size="lg"
              onClick={() => {
                feedback("reveal");
                onDecide("finish");
              }}
            >
              <BookOpen size={18} aria-hidden="true" />
              {tt("review.finish")}
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            onClick={() => {
              feedback("select");
              setConfirmRetire(true);
            }}
          >
            <FlagIcon size={16} aria-hidden="true" />
            {tt("review.retire")}
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmRetire}
        onOpenChange={setConfirmRetire}
        title={tt("history.retireTitle")}
        description={tt("history.retireBody")}
        confirmLabel={tt("history.retireConfirm")}
        cancelLabel={tt("common.cancel")}
        onConfirm={() => onDecide("retire")}
      />
    </section>
  );
}
