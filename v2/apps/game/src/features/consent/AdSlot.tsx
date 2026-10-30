import { useEffect, useRef } from "react";
import { useT } from "../../i18n/useT";
import { IS_DEV } from "../../lib/env";
import { cn } from "../../ui/cn";
import { ADSENSE_CLIENT, type AdPlacement, adSlotId } from "./config";
import { enableAds, fillAd } from "./google";
import { trackingAllowed, useConsent } from "./store";

/**
 * Um espaço de anúncio (D113). GENÉRICO por enquanto: sem
 * `VITE_ADSENSE_CLIENT` e o bloco do espaço no `.env.local`, em produção não
 * desenha nada (nem um buraco), e em desenvolvimento mostra uma moldura
 * tracejada com o nome do espaço, para ver onde o anúncio vai cair. Com tudo
 * configurado, o anúncio só carrega depois de "Aceitar todos". Nunca entra no
 * laço da carreira: o laço cabe numa tela (D23).
 */
export function AdSlot({ placement, className }: { placement: AdPlacement; className?: string }) {
  const { t } = useT();
  const choice = useConsent((state) => state.choice);
  const slot = adSlotId(placement);
  const ready = ADSENSE_CLIENT !== null && slot !== null && trackingAllowed(choice);
  const filled = useRef(false);

  useEffect(() => {
    if (!ready || filled.current) return;
    if (!enableAds()) return;
    filled.current = true;
    fillAd();
  }, [ready]);

  if (ready) {
    return (
      <aside className={cn("ad-slot", className)} aria-label={t("ads.label")}>
        <span className="ad-slot-label" aria-hidden="true">{t("ads.label")}</span>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT ?? undefined}
          data-ad-slot={slot ?? undefined}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </aside>
    );
  }

  if (!IS_DEV) return null;
  return (
    <aside className={cn("ad-slot ad-slot-placeholder", className)} aria-label={t("ads.label")} data-placement={placement}>
      <span className="ad-slot-label">{t("ads.label")} · {placement}</span>
      <p className="text-xs text-faint">{t("ads.placeholder")}</p>
    </aside>
  );
}
