import { create } from "zustand";
import { useAdPreview } from "./preview";
import { type InterstitialPlace, interstitialAllowed } from "./slots";

/**
 * O intersticial (D135): um pedido por pausa natural, com limite de
 * frequência (`interstitialAllowed`). Hoje só abre a moldura de prévia; na
 * integração de verdade, cada pedido vira um `adBreak({ type: "next" })` da
 * H5 Games Ads, que tem o próprio limite e a própria tela.
 */

/** Começo da sessão: o primeiro intersticial espera 2 minutos a partir daqui. */
const SESSION_START = typeof performance === "undefined" ? 0 : performance.now();
let last: number | null = null;

interface InterstitialState {
  open: InterstitialPlace | null;
  close(): void;
}

export const useInterstitial = create<InterstitialState>((set) => ({
  open: null,
  close: () => set({ open: null }),
}));

/** Pede um intersticial nesta pausa. Devolve se ele abriu. */
export function requestInterstitial(place: InterstitialPlace): boolean {
  const { on, uncapped } = useAdPreview.getState();
  if (!on || useInterstitial.getState().open !== null) return false;
  const since = performance.now() - SESSION_START;
  if (!uncapped && !interstitialAllowed(since, last)) return false;
  last = since;
  useInterstitial.setState({ open: place });
  return true;
}
