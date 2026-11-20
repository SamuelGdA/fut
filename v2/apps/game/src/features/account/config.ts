/**
 * A nuvem do Futeiro (D112): endereço e chave publicável do Supabase, lidos
 * do `.env.local` no build. Nada disso fica escrito no código. Sem os dois, o
 * jogo roda como antes, só no aparelho (contas desligadas).
 *
 * A chave publicável foi feita para o navegador: quem protege os dados é o RLS
 * do banco. Uma chave secreta (`sb_secret_`) ou um JWT de `service_role` aqui
 * seria um vazamento; o build recusa (`build/securityHeaders.ts`) e, se
 * chegar até aqui, as contas ficam desligadas.
 */

export interface CloudConfig {
  readonly url: string;
  readonly key: string;
}

const PROJECT_URL = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;
const LOCAL_URL = /^http:\/\/(?:localhost|127\.0\.0\.1):\d{2,5}$/;

/** Chave que nunca pode ir para o navegador. */
export function isSecretKey(key: string): boolean {
  if (key.startsWith("sb_secret_")) return true;
  const parts = key.split(".");
  if (parts.length !== 3 || !key.startsWith("eyJ")) return false;
  try {
    const payload = JSON.parse(atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"))) as { role?: unknown };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

export function readCloudConfig(env: Readonly<Record<string, string | undefined>>): CloudConfig | null {
  const url = env["VITE_SUPABASE_URL"]?.trim().replace(/\/+$/, "") ?? "";
  const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim() ?? "";
  if (!url || !key) return null;
  if (!PROJECT_URL.test(url) && !LOCAL_URL.test(url)) return null;
  if (isSecretKey(key)) return null;
  if (!key.startsWith("sb_publishable_") && !key.startsWith("eyJ")) return null;
  return { url, key };
}

// Campo a campo: o Vite troca só estas duas leituras, sem embutir o ambiente inteiro.
export const CLOUD: CloudConfig | null = readCloudConfig({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

/** O ID público do cliente Google (termina em `.apps.googleusercontent.com`). */
const GOOGLE_CLIENT = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/;

/**
 * ID do cliente OAuth do Google para a janelinha de login do navegador
 * (D123). É público por natureza (vai na página); sem ele, ou fora do formato,
 * o "Continuar com Google" usa só o caminho pela página do Google.
 */
export function readGoogleClientId(value: string | undefined): string {
  const id = value?.trim() ?? "";
  return GOOGLE_CLIENT.test(id) ? id : "";
}

export const GOOGLE_CLIENT_ID = readGoogleClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID);

/** Contas e nuvem ligadas neste build. */
export const ACCOUNTS_ENABLED = CLOUD !== null;

/** Onde o Supabase guarda a sessão (entra na lista de chaves do jogo, GDD 34.1). */
export const AUTH_STORAGE_KEY = "craque.v2.auth";

/** Para onde voltar depois do login (inclusive na volta do Google). */
export const AUTH_RETURN_KEY = "craque.v2.auth.volta";

/**
 * Há uma sessão guardada? Lido sem baixar o Supabase: o visitante nunca baixa
 * a biblioteca só por abrir o jogo.
 */
export function hasStoredSession(read: (key: string) => string | null): boolean {
  try {
    const raw = read(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { refresh_token?: unknown };
    return typeof parsed.refresh_token === "string" && parsed.refresh_token.length > 0;
  } catch {
    return false;
  }
}
