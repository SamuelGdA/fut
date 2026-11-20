import type { Page, Route } from "@playwright/test";
import { googleSimulado } from "./apoio";

/**
 * O Supabase da suíte (D112): o build de teste (`--mode e2e`, `.env.e2e`)
 * aponta para um projeto que não existe, e estas rotas respondem no lugar
 * dele. Assim a suíte joga o login, o @, o perfil e o ranking sem rede e sem
 * tocar o banco de verdade, e confere o que o jogo enviou.
 */

export const SUPABASE = "https://e2e-futeiros.supabase.co";
export const USER_ID = "8d0f7c2e-1a2b-4c3d-9e8f-0123456789ab";
export const AUTH_KEY = "craque.v2.auth";

export interface Chamada {
  readonly method: string;
  readonly path: string;
  readonly search: string;
  readonly body: unknown;
}

export interface Nuvem {
  profile: Record<string, unknown>;
  trophies: { id_trophy: string; quantidade: number; data_desbloqueio: string }[];
  ranking: { posicao: number; username: string; pontos: number; total: number; voce: boolean }[];
  /** @ que já têm dono. */
  taken: Set<string>;
  /** Senha aceita no login por e-mail. */
  password: string;
  /** Atraso das leituras do perfil, para ver os esqueletos. */
  delay: number;
  calls: Chamada[];
}

export function perfil(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    username: "craque_e2e",
    criado_em: "2026-10-01T12:00:00Z",
    carreiras: 12,
    temporadas: 190,
    partidas: 6120,
    gols: 2840,
    assistencias: 1210,
    jogos_sem_sofrer: 40,
    titulos: 88,
    premios: 61,
    bolas_de_ouro: 5,
    melhor_ovr: 96,
    desafios: 7,
    melhor_desafio: 884,
    carreiras_tecnico: 2,
    temporadas_tecnico: 31,
    titulos_tecnico: 17,
    progresso: { twentyTitles: 14, hundredCaps: 62 },
    ...extra,
  };
}

const base64url = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** Uma sessão como a do Supabase, com um JWT sem assinatura de verdade (o cliente não confere). */
export function sessao(email = "jogador@exemplo.com"): Record<string, unknown> {
  const now = Math.floor(Date.now() / 1000);
  const token = `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url({ sub: USER_ID, email, role: "authenticated", aud: "authenticated", exp: now + 3600, iat: now })}.assinatura-e2e`;
  return {
    access_token: token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "refresh-e2e",
    user: {
      id: USER_ID,
      aud: "authenticated",
      role: "authenticated",
      email,
      app_metadata: { provider: "google", providers: ["google", "email"] },
      user_metadata: {},
      identities: [
        { id: "1", identity_id: "1", user_id: USER_ID, provider: "google", identity_data: {}, created_at: "2026-10-01T12:00:00Z" },
        { id: "2", identity_id: "2", user_id: USER_ID, provider: "email", identity_data: {}, created_at: "2026-10-01T12:00:00Z" },
      ],
      created_at: "2026-10-01T12:00:00Z",
    },
  };
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "access-control-expose-headers": "*",
};

async function json(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
}

/** Responde pelo Supabase. Devolve o estado, que o teste pode mudar e conferir. */
export async function simularNuvem(page: Page, inicio: Partial<Nuvem> = {}): Promise<Nuvem> {
  const nuvem: Nuvem = {
    profile: perfil(),
    trophies: [],
    ranking: [],
    taken: new Set(["ja_existe"]),
    password: "senha1234",
    delay: 0,
    calls: [],
    ...inicio,
  };
  await page.route(`${SUPABASE}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS });
      return;
    }
    let body: unknown;
    try {
      body = request.postDataJSON();
    } catch {
      body = request.postData();
    }
    nuvem.calls.push({ method, path: url.pathname, search: url.search, body });
    const path = url.pathname;

    // ------------------------------------------------------------- auth
    if (path === "/auth/v1/authorize") {
      await route.fulfill({ status: 200, headers: { "content-type": "text/html" }, body: "<!doctype html><title>Google (simulado)</title><h1>Google (simulado)</h1>" });
      return;
    }
    if (path === "/auth/v1/token") {
      const grant = url.searchParams.get("grant_type");
      if (grant === "password") {
        const data = body as { email?: string; password?: string };
        if (data.password !== nuvem.password) {
          await json(route, { code: "invalid_credentials", error_code: "invalid_credentials", msg: "Invalid login credentials" }, 400);
          return;
        }
        await json(route, sessao(data.email));
        return;
      }
      await json(route, sessao());
      return;
    }
    if (path === "/auth/v1/user") return json(route, (sessao().user as object));
    if (path === "/auth/v1/logout") return route.fulfill({ status: 204, headers: CORS });
    if (path === "/auth/v1/signup") {
      const data = body as { email?: string };
      // Confirmação de e-mail ligada: a conta nasce sem sessão.
      return json(route, { id: "novo", aud: "authenticated", role: "", email: data.email, identities: [{ provider: "email" }], created_at: new Date().toISOString(), app_metadata: {}, user_metadata: {} });
    }
    if (path === "/auth/v1/recover" || path === "/auth/v1/resend" || path === "/auth/v1/otp") return json(route, {});

    // ------------------------------------------------------------- dados
    if (path === "/rest/v1/profiles" && method === "GET") {
      if (nuvem.delay) await new Promise((resolve) => setTimeout(resolve, nuvem.delay));
      return json(route, [nuvem.profile]);
    }
    if (path === "/rest/v1/profiles" && method === "PATCH") {
      const data = body as { username?: string };
      const name = data.username ?? "";
      if (nuvem.taken.has(name)) return json(route, { code: "23505", message: "duplicate key value violates unique constraint" }, 409);
      nuvem.profile = { ...nuvem.profile, username: name };
      return json(route, { username: name });
    }
    if (path === "/rest/v1/user_trophies") {
      if (nuvem.delay) await new Promise((resolve) => setTimeout(resolve, nuvem.delay));
      return json(route, nuvem.trophies);
    }
    if (path === "/rest/v1/rpc/username_disponivel") {
      const name = (body as { nome?: string }).nome ?? "";
      return json(route, !nuvem.taken.has(name) && name !== "admin");
    }
    if (path === "/rest/v1/rpc/importar_conquistas") return json(route, 0);
    if (path === "/rest/v1/rpc/registrar_conquistas") return json(route, ((body as { p_ids?: unknown[] }).p_ids ?? []).length);
    if (path === "/rest/v1/rpc/registrar_carreira") return json(route, { nova: true, ranqueada: true });
    if (path === "/rest/v1/rpc/ranking_desafio") return json(route, nuvem.ranking);
    if (path === "/rest/v1/rpc/excluir_conta") return route.fulfill({ status: 204, headers: CORS });

    await json(route, { message: `rota não simulada: ${method} ${path}` }, 404);
  });
  return nuvem;
}

/**
 * Entra logado: a sessão vai para o armazenamento antes de o jogo abrir (só na
 * primeira abertura da aba, como as preferências), e o Supabase é simulado.
 */
export async function comConta(page: Page, inicio: Partial<Nuvem> = {}): Promise<Nuvem> {
  const nuvem = await simularNuvem(page, inicio);
  await page.addInitScript(
    ({ key, value }) => {
      if (window.sessionStorage.getItem("craque-e2e-conta")) return;
      window.sessionStorage.setItem("craque-e2e-conta", "1");
      window.localStorage.setItem(key, value);
    },
    { key: AUTH_KEY, value: JSON.stringify(sessao()) },
  );
  return nuvem;
}

/** As chamadas feitas para um caminho (ex.: `/rest/v1/rpc/registrar_carreira`). */
export function chamadas(nuvem: Nuvem, path: string): Chamada[] {
  return nuvem.calls.filter((call) => call.path === path);
}

/**
 * O botão oficial do Google (D123), simulado: o script falso guarda o que o
 * jogo passou ao `initialize` e ao `renderButton` em `window.__gis` e desenha
 * um botão "Continuar como Jogador E2E". O clique faz o papel da janelinha do
 * navegador: entrega o token na hora.
 */
export async function simularGoogle(page: Page): Promise<void> {
  googleSimulado.add(page);
  await page.route("https://accounts.google.com/**", async (route) => {
    if (!new URL(route.request().url()).pathname.startsWith("/gsi/client")) {
      await route.abort();
      return;
    }
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/javascript" },
      body: `(() => {
        let options = null;
        window.__gis = { renders: 0 };
        window.google = { accounts: { id: {
          initialize(value) { options = value; Object.assign(window.__gis, { client_id: value.client_id, nonce: value.nonce, fedcm: value.use_fedcm_for_button }); },
          renderButton(parent, button) {
            window.__gis.renders += 1;
            Object.assign(window.__gis, { width: button.width, theme: button.theme, locale: button.locale });
            const element = document.createElement("button");
            element.type = "button";
            element.textContent = "Continuar como Jogador E2E";
            element.style.width = button.width + "px";
            element.style.height = "40px";
            element.addEventListener("click", () => options.callback({ credential: "token-google-e2e" }));
            parent.replaceChildren(element);
          },
          cancel() {},
        } } };
      })();`,
    });
  });
}
