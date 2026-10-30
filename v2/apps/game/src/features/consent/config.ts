/**
 * Monetização e medição (D113): tudo GENÉRICO até o dono do jogo ligar de
 * verdade. Sem `VITE_GA_MEASUREMENT_ID` e sem `VITE_ADSENSE_CLIENT`, nada do
 * Google é baixado, o aviso de cookies nem aparece (não há o que consentir) e
 * os espaços de anúncio só aparecem em desenvolvimento, como moldura
 * tracejada. Para ligar: preencha as variáveis no `.env.local` (modelo em
 * `.env.example`) e siga o README, seção "Anúncios e Analytics".
 */

const clean = (value: string | undefined, pattern: RegExp): string | null => {
  const trimmed = value?.trim() ?? "";
  return pattern.test(trimmed) ? trimmed : null;
};

/** ID de medição do Google Analytics 4 (`G-XXXXXXXXXX`). */
export const GA_MEASUREMENT_ID = clean(import.meta.env.VITE_GA_MEASUREMENT_ID, /^G-[A-Z0-9]{6,12}$/);

/** ID de editor do AdSense (`ca-pub-0000000000000000`). */
export const ADSENSE_CLIENT = clean(import.meta.env.VITE_ADSENSE_CLIENT, /^ca-pub-\d{10,20}$/);

/** Os espaços de anúncio do jogo. Nenhum fica no laço da carreira (o laço cabe numa tela, D23). */
export const AD_PLACEMENTS = ["perfil", "resumo", "conquistas"] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

/** O bloco do AdSense de cada espaço (`VITE_ADSENSE_SLOT_PERFIL` e assim por diante), lido campo a campo. */
const SLOTS: Readonly<Record<AdPlacement, string | undefined>> = {
  perfil: import.meta.env.VITE_ADSENSE_SLOT_PERFIL,
  resumo: import.meta.env.VITE_ADSENSE_SLOT_RESUMO,
  conquistas: import.meta.env.VITE_ADSENSE_SLOT_CONQUISTAS,
};

export function adSlotId(placement: AdPlacement): string | null {
  return clean(SLOTS[placement], /^\d{6,14}$/);
}

/** Há algo que precise de consentimento neste build? */
export const TRACKERS_ENABLED = GA_MEASUREMENT_ID !== null || ADSENSE_CLIENT !== null;

/** E-mail de contato das páginas legais (`VITE_CONTACT_EMAIL`). */
export const CONTACT_EMAIL = clean(import.meta.env.VITE_CONTACT_EMAIL, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
