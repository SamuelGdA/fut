import { siFacebook, siReddit, siTelegram, siWhatsapp, siX } from "simple-icons";
import type { ShareNetwork } from "../features/summary/shareTargets";

/** As marcas das redes (simple-icons, licença CC0), só as usadas no compartilhar (D132, D133). */
export const BRAND_ICONS: Readonly<Record<ShareNetwork, { path: string; hex: string }>> = {
  whatsapp: siWhatsapp,
  x: siX,
  facebook: siFacebook,
  telegram: siTelegram,
  reddit: siReddit,
};

export function brandColor(network: ShareNetwork): string {
  return `#${BRAND_ICONS[network].hex}`;
}
