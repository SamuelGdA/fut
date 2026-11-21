import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useT } from "../../i18n/useT";
import { AdFrame } from "./AdFrame";
import { useInterstitial } from "./interstitial";
import { IAB_INTERSTITIAL } from "./slots";

/**
 * A prévia do intersticial (D135): tela cheia escurecida com o anúncio no meio
 * (320×480 no celular, 336×280 no PC) e o botão de fechar sempre à vista. Abre
 * só pelos pedidos de `requestInterstitial`, nas pausas naturais.
 */
export function AdInterstitial() {
  const { t } = useT();
  const open = useInterstitial((state) => state.open);
  const close = useInterstitial((state) => state.close);
  return (
    <Dialog.Root open={open !== null} onOpenChange={(next) => (next ? undefined : close())}>
      <Dialog.Portal>
        <Dialog.Backdrop className="ad-interstitial-backdrop" />
        <Dialog.Popup className="ad-interstitial">
          <Dialog.Title className="sr-only">{t("ads.interstitial.title")}</Dialog.Title>
          <Dialog.Close className="ad-interstitial-close">
            <X size={18} aria-hidden="true" />
            <span>{t("ads.interstitial.close")}</span>
          </Dialog.Close>
          {open ? <AdFrame id={`intersticial-${open}`} kind="interstitial" desktop={IAB_INTERSTITIAL.desktop} mobile={IAB_INTERSTITIAL.mobile} /> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
