/**
 * Monetização e medição (D113): tudo GENÉRICO até o dono do jogo ligar de
 * verdade. Sem `VITE_GA_MEASUREMENT_ID` e sem `VITE_ADSENSE_CLIENT`, nada do
 * Google é baixado e o aviso de cookies nem aparece (não há o que consentir).
 * Os espaços de anúncio são só prévia por enquanto (D134, `features/ads`):
 * nenhum chama rede de anúncio. Para ligar: preencha as variáveis no `.env.local` (modelo em
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

/** Há algo que precise de consentimento neste build? */
export const TRACKERS_ENABLED = GA_MEASUREMENT_ID !== null || ADSENSE_CLIENT !== null;

/** E-mail de contato das páginas legais (`VITE_CONTACT_EMAIL`). */
export const CONTACT_EMAIL = clean(import.meta.env.VITE_CONTACT_EMAIL, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
