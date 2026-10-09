import type { ClubOffer, CoachCareer } from "@craque/engine/coach";
import { getClub, getCountry } from "@craque/world";
import { PenLine, RefreshCw } from "lucide-react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Crest } from "../../ui/Media";
import { Chip } from "../../ui/Signals";
import type { Tone } from "../../ui/tone";
import { clubName, objectiveText } from "./text";

const DIFFICULTY_TONE: Readonly<Record<number, Tone>> = { 1: "good", 2: "good", 3: "neutral", 4: "bad", 5: "bad" };
const FINANCE_TONE: Readonly<Record<ClubOffer["finances"], Tone>> = { healthy: "good", balanced: "neutral", tight: "bad" };

/**
 * Cartão de proposta (spec 4 e 14): clube, divisão, força, finanças, verba,
 * folha, receita, objetivo e dificuldade. A dificuldade junta a meta, a
 * saúde do caixa e a pressão do tamanho do clube: clube maior não é emprego
 * mais fácil.
 */
export function OfferCard({ offer, career, onAccept, busy }: { offer: ClubOffer; career: CoachCareer; onAccept(): void; busy: boolean }) {
  const t = useTecnicoT();
  const { tt, money, number, percent, locale } = t;
  const club = getClub(offer.club);
  const country = club ? getCountry(club.country) : null;
  const abroad = club ? club.country !== career.setup.identity.nationality : false;
  return (
    <article className="tec-offer" data-stay={offer.stay || undefined}>
      <header className="flex items-center gap-3">
        <Crest club={offer.club} size={44} decorative />
        <div className="min-w-0 flex-1">
          {offer.stay ? <p className="eyebrow text-glory">{tt("offers.stayLabel")}</p> : null}
          <h3 className="display truncate text-2xl leading-none font-black uppercase">{clubName(offer.club)}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span>{tt("offers.division", { division: offer.division })}</span>
            {country ? <span>· {country.names[locale]}</span> : null}
            {abroad ? <Chip tone="info" size="sm">{tt("offers.abroad")}</Chip> : null}
          </p>
        </div>
        <div className="text-right">
          <p className="eyebrow">{tt("offers.strength")}</p>
          <p className="display numeric text-3xl leading-none font-black" title={tt("offers.strengthHint")}>
            {number(Math.round(offer.strength))}
          </p>
        </div>
      </header>
      <p className="mt-3 text-sm">
        <span className="text-muted">{tt("offers.objective")}: </span>
        <strong>{objectiveText(t, offer)}</strong>
      </p>
      <dl className="tec-offer-facts">
        <div>
          <dt>{tt("offers.budget")}</dt>
          <dd>{money(offer.budget)}</dd>
        </div>
        <div>
          <dt>{tt("offers.wages")}</dt>
          <dd>{tt("common.perMonth", { money: money(offer.wageBill) })}</dd>
        </div>
        <div>
          <dt>{tt("offers.revenue")}</dt>
          <dd>{money(offer.revenue)}</dd>
        </div>
        <div>
          <dt>{tt("offers.finances")}</dt>
          <dd>
            <Chip tone={FINANCE_TONE[offer.finances]} size="sm" glyph>
              {t.g(`finance.${offer.finances}`)}
            </Chip>
          </dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Chip tone={DIFFICULTY_TONE[offer.difficulty] ?? "neutral"} glyph>
          {tt("offers.difficulty")}: {tt(`offers.difficultyLevels.${String(Math.min(5, Math.max(1, offer.difficulty))) as "1" | "2" | "3" | "4" | "5"}`)}
        </Chip>
        {offer.fictionalShare >= 0.25 ? (
          <span className="text-2xs text-faint">{tt("offers.fictional", { percent: percent(offer.fictionalShare) })}</span>
        ) : null}
        <Button
          size="sm"
          loading={busy}
          onClick={() => {
            feedback("confirm");
            onAccept();
          }}
        >
          {offer.stay ? <RefreshCw size={15} aria-hidden="true" /> : <PenLine size={15} aria-hidden="true" />}
          {offer.stay ? tt("offers.stay") : tt("offers.accept")}
        </Button>
      </div>
    </article>
  );
}
