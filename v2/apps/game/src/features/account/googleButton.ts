import { GOOGLE_CLIENT_ID } from "./config";

/**
 * Entrar com Google sem sair do site (D123). A tela de login mostra o botão
 * oficial do Google ("Continuar como Fulano"), desenhado pelo Google Identity
 * Services. O clique abre a janelinha do próprio navegador ("Fazer login em
 * futeiro.com com google.com", FedCM) e ela devolve um token de identidade,
 * que o Supabase troca por sessão (`signInWithIdToken`). Nada de página do
 * Google nem do endereço do Supabase.
 *
 * O botão abre a janelinha a cada clique, mesmo depois de o jogador cancelar.
 * A janelinha automática (One Tap) não é usada: depois de cancelada, o
 * navegador a segura por horas, e o botão parecia quebrado.
 *
 * O script do Google só baixa na tela de login. Se ele não carregar (rede,
 * bloqueador), a tela mostra o botão do jogo, que vai pela página do Google.
 *
 * O nonce protege contra token reaproveitado: o Google assina o hash SHA-256
 * dele dentro do token, e o Supabase confere esse hash com o nonce cru. Cada
 * desenho do botão tem um nonce novo.
 */

interface CredentialResponse {
  credential?: string;
}

export interface GoogleButtonOptions {
  type: "standard";
  theme: "outline" | "filled_black";
  size: "large";
  text: "continue_with";
  shape: "rectangular";
  logo_alignment: "left";
  width: number;
  locale: string;
}

interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    nonce: string;
    auto_select: boolean;
    context: "signin";
    itp_support: boolean;
    use_fedcm_for_button: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
  cancel(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentity } };
  }
}

export const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

/** Largura do botão do Google: ele aceita de 200 a 400 pixels. */
export function googleButtonWidth(available: number): number {
  return Math.max(200, Math.min(400, Math.floor(available)));
}

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

/**
 * Desenha o botão oficial dentro de `parent`. `onCredential` recebe o token e o
 * nonce cru quando o jogador escolhe a conta. Devolve `false` quando o botão do
 * Google não pôde ser desenhado (a tela mostra o do jogo).
 */
export async function renderGoogleButton(
  parent: HTMLElement,
  options: Pick<GoogleButtonOptions, "theme" | "width" | "locale">,
  onCredential: (token: string, nonce: string) => void,
): Promise<boolean> {
  const identity = await loadGoogleIdentity(options.locale);
  if (!identity || !GOOGLE_CLIENT_ID || !crypto.subtle) return false;
  const nonce = await makeNonce();
  identity.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      if (response.credential) onCredential(response.credential, nonce.raw);
    },
    nonce: nonce.hashed,
    auto_select: false,
    context: "signin",
    itp_support: true,
    use_fedcm_for_button: true,
  });
  parent.replaceChildren();
  identity.renderButton(parent, {
    type: "standard",
    theme: options.theme,
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    logo_alignment: "left",
    width: googleButtonWidth(options.width),
    locale: options.locale,
  });
  return true;
}
