import { GA_MEASUREMENT_ID } from "./config";

/**
 * Os scripts do Google (D113), carregados só depois de "Aceitar todos". Antes
 * disso, nada do Google chega ao navegador. Usa o Consent Mode v2: o padrão é
 * negado e só vira concedido com a escolha do jogador; voltar para "Somente
 * essenciais" nega de novo e para de medir na hora. Os endereços aqui estão
 * liberados na Content-Security-Policy (`build/securityHeaders.ts`).
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const DENIED = { ad_storage: "denied", analytics_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" } as const;
const GRANTED = { ad_storage: "granted", analytics_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" } as const;

let analyticsLoaded = false;
let analyticsActive = false;

function gtag(...args: unknown[]): void {
  window.gtag?.(...args);
}

function addScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.append(script);
}

/** Liga a medição (só chamada com consentimento). Nunca manda e-mail, @ ou id da conta. */
export function enableAnalytics(): void {
  if (!GA_MEASUREMENT_ID) return;
  analyticsActive = true;
  if (analyticsLoaded) {
    gtag("consent", "update", GRANTED);
    return;
  }
  analyticsLoaded = true;
  window.dataLayer = window.dataLayer ?? [];
  // O gtag oficial precisa do objeto `arguments`, não de um array.
  window.gtag = function gtagShim() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  gtag("consent", "default", DENIED);
  gtag("consent", "update", GRANTED);
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false, allow_google_signals: false });
  addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`);
}

/** Volta para "Somente essenciais": nega o consentimento e apaga os cookies do Analytics deste site. */
export function disableAnalytics(): void {
  analyticsActive = false;
  if (!analyticsLoaded) return;
  gtag("consent", "update", DENIED);
  const host = window.location.hostname;
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim() ?? "";
    if (!/^_ga/.test(name)) continue;
    for (const domain of ["", `; domain=${host}`, `; domain=.${host.split(".").slice(-2).join(".")}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

/** Uma tela aberta, como página virtual (a URL do jogo quase nunca muda). */
export function trackScreen(screen: string): void {
  if (!analyticsActive || !GA_MEASUREMENT_ID) return;
  gtag("event", "page_view", { page_title: screen, page_location: `${window.location.origin}/${screen}` });
}
