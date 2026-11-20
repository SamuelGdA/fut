import { GOOGLE_CLIENT_ID } from "./config";

/**
 * Entrar com Google sem sair do site (D123). O botão "Continuar com Google" e
 * a abertura da tela de login pedem ao Google Identity Services a janelinha
 * do próprio navegador ("Fazer login em futeiro.com com google.com"). Ela
 * devolve um token de identidade, que o Supabase troca por sessão
 * (`signInWithIdToken`), sem a página do Google e sem o endereço do Supabase.
 *
 * O script do Google só baixa na tela de login: o resto do jogo continua sem
 * nada dele. Quando a janelinha não pode aparecer (navegador sem suporte,
 * script bloqueado, o jogador fechou há pouco e o navegador segura um tempo),
 * o botão cai no login de antes, pela página do Google.
 *
 * O nonce protege contra token reaproveitado: o Google assina o hash SHA-256
 * dele dentro do token, e o Supabase confere esse hash com o nonce cru.
 */

interface CredentialResponse {
  credential?: string;
}

interface PromptMoment {
  isNotDisplayed?(): boolean;
  isSkippedMoment?(): boolean;
  getSkippedReason?(): string;
}

interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    nonce: string;
    auto_select: boolean;
    cancel_on_tap_outside: boolean;
    context: "signin";
    itp_support: boolean;
    use_fedcm_for_prompt: boolean;
  }): void;
  prompt(listener?: (moment: PromptMoment) => void): void;
  cancel(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } };
  }
}

export const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

let loading: Promise<GoogleIdentity | null> | null = null;

/** Baixa o script do Google uma vez; `null` sem ID de cliente ou se não carregar. */
export function loadGoogleIdentity(language: string): Promise<GoogleIdentity | null> {
  if (!GOOGLE_CLIENT_ID || typeof document === "undefined") return Promise.resolve(null);
  loading ??= new Promise((resolve) => {
    const ready = () => resolve(window.google?.accounts?.id ?? null);
    if (window.google?.accounts?.id) {
      ready();
      return;
    }
    const script = document.createElement("script");
    script.src = `${GOOGLE_SCRIPT}?hl=${encodeURIComponent(language)}`;
    script.async = true;
    script.onload = ready;
    script.onerror = () => {
      // Deixa tentar de novo na próxima vez (a rede pode voltar).
      loading = null;
      script.remove();
      resolve(null);
    };
    document.head.appendChild(script);
  });
  return loading;
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Nonce cru (vai para o Supabase) e o hash SHA-256 em hexadecimal (vai para o Google). */
export async function makeNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = toHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const hashed = toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)));
  return { raw, hashed };
}

/** O que a janelinha fez: deu o token, o jogador fechou, ou ela não pôde aparecer. */
export type OneTapOutcome = { kind: "credential"; token: string; nonce: string } | { kind: "closed" } | { kind: "unavailable" };

/** Fechar de propósito não é falha: o botão não troca de caminho sozinho. */
const CLOSED_REASONS = new Set(["user_cancel", "tap_outside"]);

let pending: ((outcome: OneTapOutcome) => void) | null = null;

/**
 * Abre a janelinha e espera o resultado, que pode nunca vir (o jogador deixa
 * a janelinha aberta). Uma por vez: chamar de novo substitui a anterior (a
 * primeira resolve como fechada).
 */
export async function promptGoogle(language: string): Promise<OneTapOutcome> {
  const identity = await loadGoogleIdentity(language);
  if (!identity || !GOOGLE_CLIENT_ID || !crypto.subtle) return { kind: "unavailable" };
  const nonce = await makeNonce();
  pending?.({ kind: "closed" });
  identity.cancel();
  return new Promise<OneTapOutcome>((resolve) => {
    let settled = false;
    const finish = (outcome: OneTapOutcome) => {
      if (settled) return;
      settled = true;
      if (pending === finish) pending = null;
      resolve(outcome);
    };
    pending = finish;
    identity.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => finish(response.credential ? { kind: "credential", token: response.credential, nonce: nonce.raw } : { kind: "unavailable" }),
      nonce: nonce.hashed,
      auto_select: false,
      cancel_on_tap_outside: false,
      context: "signin",
      itp_support: true,
      use_fedcm_for_prompt: true,
    });
    identity.prompt((moment) => {
      if (moment.isNotDisplayed?.()) {
        finish({ kind: "unavailable" });
        return;
      }
      if (moment.isSkippedMoment?.()) {
        const reason = moment.getSkippedReason?.() ?? "";
        finish(CLOSED_REASONS.has(reason) ? { kind: "closed" } : { kind: "unavailable" });
      }
      // Com o FedCM, o Google não avisa que a janelinha apareceu: quem decide é
      // o jogador, sem prazo. Ela só volta pelo token ou pelo "pulou".
    });
  });
}

/** Fecha a janelinha (ao sair da tela de login). */
export function cancelGoogle(): void {
  pending?.({ kind: "closed" });
  window.google?.accounts?.id?.cancel();
}
