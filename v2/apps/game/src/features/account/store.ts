import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { create } from "zustand";
import { safeStorage } from "../../services/storage";
import { cloudClient, errorCode, isNetworkError } from "./client";
import { ACCOUNTS_ENABLED, hasStoredSession } from "./config";
import type { ChallengeStreak, Profile, Trophy } from "./schemas";

/** O Zod só chega com a primeira ação de conta: a abertura do jogo continua leve (D62). */
const schemas = () => import("./schemas");

/**
 * A conta do jogador (D112). Estados:
 *
 * - `off`: este build não tem Supabase; o jogo roda só no aparelho, como antes.
 * - `checking`: havia sessão guardada (ou um retorno do Google/e-mail na URL)
 *   e o cliente está conferindo.
 * - `guest`: visitante. Joga tudo; não entra no ranking nem coleciona conquistas.
 * - `member`: logado. Perfil e troféus vêm do banco; o @ é obrigatório antes de jogar.
 *
 * Erros voltam como códigos curtos (`invalid`, `taken`, `network`...) que a
 * tela traduz; nada de mensagem crua do servidor na interface.
 */

export type AccountStatus = "off" | "checking" | "guest" | "member";

/** Avisos da volta de um link (e-mail, Google) ou de uma ação da conta. */
export type AccountNotice = "confirmedElsewhere" | "linkExpired" | "oauthError" | "signedOut" | "deleted" | "imported" | null;

export interface AccountUser {
  readonly id: string;
  readonly email: string | null;
  /** Como esta conta entra: `google`, `email` ou os dois (contas ligadas pelo mesmo e-mail). */
  readonly providers: readonly string[];
}

export type DataStatus = "idle" | "loading" | "ready" | "error";

interface AccountState {
  status: AccountStatus;
  user: AccountUser | null;
  profile: Profile | null;
  trophies: Trophy[];
  /** Nota de hoje e sequências do Desafio (D118); `null` até o banco responder. */
  streak: ChallengeStreak | null;
  dataStatus: DataStatus;
  /** A sessão veio de um link de recuperação: a tela pede a senha nova. */
  recovery: boolean;
  notice: AccountNotice;
  /** Quantas conquistas do aparelho entraram na conta no último login. */
  imported: number;
  init(): Promise<void>;
  /** Baixa o cliente e confere a sessão: para o login e o ranking. */
  ensureClient(): Promise<SupabaseClient | null>;
  refresh(): Promise<void>;
  signInWithGoogle(): Promise<string | null>;
  signInWithEmail(email: string, password: string): Promise<string | null>;
  signUp(email: string, password: string, username: string): Promise<{ error: string | null; confirm: boolean }>;
  resendConfirmation(email: string): Promise<string | null>;
  requestPasswordReset(email: string): Promise<string | null>;
  updatePassword(password: string): Promise<string | null>;
  checkUsername(username: string): Promise<"free" | "taken" | "invalid" | "network">;
  setUsername(username: string): Promise<string | null>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<string | null>;
  clearNotice(): void;
}

/** O endereço de volta dos links: a tela de login, que termina o que o link começou. */
export function authRedirect(mode?: "nova-senha"): string {
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${window.location.origin}${base}login${mode ? `?modo=${mode}` : ""}`;
}

/** Os parâmetros que o Supabase devolve na URL (query e fragmento). */
export function readAuthParams(location: { search: string; hash: string }): { code: string | null; error: string | null; errorCode: string | null; mode: string | null } {
  const query = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.startsWith("#") ? location.hash.slice(1) : "");
  return {
    code: query.get("code"),
    error: query.get("error") ?? fragment.get("error"),
    errorCode: query.get("error_code") ?? fragment.get("error_code"),
    mode: query.get("modo"),
  };
}

/** Tira da barra de endereço o que o link trouxe, sem recarregar e sem mexer no estado da tela. */
function cleanAuthParams(): void {
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ["code", "error", "error_code", "error_description", "modo", "type"]) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (/^#(?:error|access_token)=/.test(url.hash)) {
    url.hash = "";
    changed = true;
  }
  if (changed) window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function userOf(session: Session): AccountUser {
  const providers = new Set<string>();
  for (const identity of session.user.identities ?? []) providers.add(identity.provider);
  if (providers.size === 0 && typeof session.user.app_metadata["provider"] === "string") providers.add(session.user.app_metadata["provider"]);
  return { id: session.user.id, email: session.user.email ?? null, providers: [...providers].sort() };
}

/** Código curto de um erro do Auth, para a tela. */
function authError(error: unknown): string {
  if (isNetworkError(error)) return "network";
  const code = errorCode(error);
  if (code === "invalid_credentials" || /invalid login credentials/i.test(code)) return "invalid";
  if (code === "email_not_confirmed" || /email not confirmed/i.test(code)) return "unconfirmed";
  if (code === "weak_password" || /password/i.test(code)) return "weakPassword";
  if (code === "same_password") return "samePassword";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || /rate limit/i.test(code)) return "rateLimit";
  if (code === "signup_disabled" || code === "provider_disabled" || /not enabled|disabled/i.test(code)) return "disabled";
  if (code === "user_already_exists" || code === "email_exists") return "exists";
  return "unknown";
}

let initializing: Promise<void> | null = null;
let listening = false;
/** Contas que já trouxeram as conquistas do aparelho nesta aba. */
const importedFor = new Set<string>();

export const useAccount = create<AccountState>()((set, get) => {
  /** Lê perfil e troféus do banco. Só as colunas da tela (D114). */
  async function loadData(client: SupabaseClient, user: AccountUser): Promise<void> {
    set({ dataStatus: "loading" });
    const { PROFILE_COLUMNS, TROPHY_COLUMNS, profileSchema, trophySchema, challengeStreakSchema } = await schemas();
    const [profile, trophies, streak] = await Promise.all([
      client.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).maybeSingle(),
      client.from("user_trophies").select(TROPHY_COLUMNS),
      client.rpc("meu_desafio"),
    ]);
    const parsedStreak = challengeStreakSchema.array().safeParse(streak.data ?? []);
    set({ streak: parsedStreak.success ? (parsedStreak.data[0] ?? null) : null });
    if (get().user?.id !== user.id) return;
    const parsedProfile = profile.data ? profileSchema.safeParse(profile.data) : null;
    const parsedTrophies = trophySchema.array().safeParse(trophies.data ?? []);
    if (profile.error || trophies.error || !parsedProfile?.success || !parsedTrophies.success) {
      set({ dataStatus: "error" });
      return;
    }
    set({ profile: parsedProfile.data, trophies: parsedTrophies.data, dataStatus: "ready" });
  }

  /** As conquistas que o aparelho guardou como visitante entram na conta, uma vez por login. */
  async function importLocal(client: SupabaseClient, user: AccountUser): Promise<void> {
    if (importedFor.has(user.id)) return;
    importedFor.add(user.id);
    const { useHall } = await import("../hall/store");
    await useHall.getState().load();
    const ids = useHall.getState().achievements.filter((row) => !row.account).map((row) => row.id);
    if (ids.length === 0) return;
    const { data, error } = await client.rpc("importar_conquistas", { p_ids: ids.slice(0, 400) });
    if (error || typeof data !== "number" || data === 0 || get().user?.id !== user.id) return;
    set({ imported: data, notice: "imported" });
    await loadData(client, user);
  }

  async function applySession(client: SupabaseClient, session: Session | null): Promise<void> {
    if (!session) {
      set({ status: "guest", user: null, profile: null, trophies: [], streak: null, dataStatus: "idle", recovery: false });
      return;
    }
    const user = userOf(session);
    const same = get().user?.id === user.id && get().status === "member";
    set({ status: "member", user });
    if (same && get().dataStatus === "ready") return;
    await loadData(client, user);
    void importLocal(client, user);
  }

  function listen(client: SupabaseClient): void {
    if (listening) return;
    listening = true;
    client.auth.onAuthStateChange((event, session) => {
      // O Supabase pede para não chamar o cliente dentro deste aviso: o trabalho sai do laço.
      window.setTimeout(() => {
        if (event === "PASSWORD_RECOVERY") set({ recovery: true });
        if (event === "SIGNED_OUT") void applySession(client, null);
        else if (event === "SIGNED_IN" || event === "USER_UPDATED") void applySession(client, session);
      }, 0);
    });
  }

  return {
    status: ACCOUNTS_ENABLED ? (hasStoredSession((key) => safeStorage.getItem(key)) ? "checking" : "guest") : "off",
    user: null,
    profile: null,
    trophies: [],
    streak: null,
    dataStatus: "idle",
    recovery: false,
    notice: null,
    imported: 0,

    init() {
      initializing ??= (async () => {
        if (!ACCOUNTS_ENABLED || typeof window === "undefined") {
          set({ status: ACCOUNTS_ENABLED ? "guest" : "off" });
          return;
        }
        const params = readAuthParams(window.location);
        const stored = hasStoredSession((key) => safeStorage.getItem(key));
        if (!params.code && !params.error && !stored) {
          set({ status: "guest" });
          return;
        }
        set({ status: "checking" });
        const client = await get().ensureClient();
        if (!client) {
          set({ status: "guest" });
          return;
        }
        if (params.error) set({ notice: params.errorCode === "otp_expired" ? "linkExpired" : "oauthError" });
        if (params.code) {
          try {
            const { data, error } = await client.auth.exchangeCodeForSession(params.code);
            if (error) {
              // Link de confirmação aberto em outro navegador: o e-mail já foi confirmado, falta entrar.
              set({ notice: /verifier/i.test(`${error.name} ${error.message}`) ? "confirmedElsewhere" : "linkExpired" });
            } else if ((data as { redirectType?: unknown }).redirectType === "recovery" || params.mode === "nova-senha") {
              set({ recovery: true });
            }
          } catch (error) {
            set({ notice: isNetworkError(error) ? "oauthError" : "linkExpired" });
          }
        }
        cleanAuthParams();
        try {
          const { data } = await client.auth.getSession();
          await applySession(client, data.session);
        } catch {
          set({ status: "guest" });
        }
      })();
      return initializing;
    },

    async ensureClient() {
      const pending = cloudClient();
      if (!pending) return null;
      try {
        const client = await pending;
        listen(client);
        return client;
      } catch {
        return null;
      }
    },

    async refresh() {
      const client = await get().ensureClient();
      const user = get().user;
      if (client && user) await loadData(client, user);
    },

    async signInWithGoogle() {
      const client = await get().ensureClient();
      if (!client) return "network";
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: authRedirect(), queryParams: { prompt: "select_account" } },
      });
      return error ? authError(error) : null;
    },

    async signInWithEmail(email, password) {
      const { emailSchema } = await schemas();
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success || password.length === 0) return "invalid";
      const client = await get().ensureClient();
      if (!client) return "network";
      try {
        const { data, error } = await client.auth.signInWithPassword({ email: parsedEmail.data, password });
        if (error) return authError(error);
        await applySession(client, data.session);
        return null;
      } catch (error) {
        return authError(error);
      }
    },

    async signUp(email, password, username) {
      const { emailSchema, passwordSchema, usernameSchema } = await schemas();
      const parsedEmail = emailSchema.safeParse(email);
      const parsedPassword = passwordSchema.safeParse(password);
      const parsedUsername = usernameSchema.safeParse(username);
      if (!parsedEmail.success) return { error: "email", confirm: false };
      if (!parsedPassword.success) return { error: "weakPassword", confirm: false };
      if (!parsedUsername.success) return { error: "username", confirm: false };
      const availability = await get().checkUsername(parsedUsername.data);
      if (availability === "taken") return { error: "taken", confirm: false };
      if (availability === "network") return { error: "network", confirm: false };
      const client = await get().ensureClient();
      if (!client) return { error: "network", confirm: false };
      try {
        const { data, error } = await client.auth.signUp({
          email: parsedEmail.data,
          password: parsedPassword.data,
          options: { emailRedirectTo: authRedirect(), data: { username: parsedUsername.data } },
        });
        if (error) return { error: authError(error), confirm: false };
        if (data.session) {
          await applySession(client, data.session);
          return { error: null, confirm: false };
        }
        return { error: null, confirm: true };
      } catch (error) {
        return { error: authError(error), confirm: false };
      }
    },

    async resendConfirmation(email) {
      const { emailSchema } = await schemas();
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success) return "email";
      const client = await get().ensureClient();
      if (!client) return "network";
      const { error } = await client.auth.resend({ type: "signup", email: parsedEmail.data, options: { emailRedirectTo: authRedirect() } });
      return error ? authError(error) : null;
    },

    async requestPasswordReset(email) {
      const { emailSchema } = await schemas();
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success) return "email";
      const client = await get().ensureClient();
      if (!client) return "network";
      const { error } = await client.auth.resetPasswordForEmail(parsedEmail.data, { redirectTo: authRedirect("nova-senha") });
      // Nunca diz se o e-mail tem conta: só a falha de rede e o limite de envios aparecem.
      if (!error) return null;
      const code = authError(error);
      return code === "network" || code === "rateLimit" ? code : null;
    },

    async updatePassword(password) {
      const { passwordSchema } = await schemas();
      const parsed = passwordSchema.safeParse(password);
      if (!parsed.success) return "weakPassword";
      const client = await get().ensureClient();
      if (!client) return "network";
      const { error } = await client.auth.updateUser({ password: parsed.data });
      if (error) return authError(error);
      set({ recovery: false });
      return null;
    },

    async checkUsername(username) {
      const { usernameSchema } = await schemas();
      const parsed = usernameSchema.safeParse(username);
      if (!parsed.success) return "invalid";
      const client = await get().ensureClient();
      if (!client) return "network";
      const { data, error } = await client.rpc("username_disponivel", { nome: parsed.data });
      if (error) return "network";
      return data === true ? "free" : "taken";
    },

    async setUsername(username) {
      // Objeto estrito: só `username` sai daqui, nunca outro campo do perfil.
      const { profileUpdateSchema } = await schemas();
      const parsed = profileUpdateSchema.safeParse({ username });
      if (!parsed.success) return "username";
      const client = await get().ensureClient();
      const user = get().user;
      if (!client || !user) return "network";
      const { data, error } = await client.from("profiles").update(parsed.data).eq("id", user.id).select("username").maybeSingle();
      if (error) {
        if (error.code === "23505") return "taken";
        if (error.code === "23514") return "username";
        if (/username_recente/.test(error.message)) return "recent";
        return isNetworkError(error) ? "network" : "unknown";
      }
      if (!data) return "unknown";
      const profile = get().profile;
      if (profile) set({ profile: { ...profile, username: parsed.data.username } });
      else await loadData(client, user);
      return null;
    },

    async signOut() {
      const client = await get().ensureClient();
      try {
        await client?.auth.signOut({ scope: "local" });
      } catch {
        /* Sem internet: a sessão local sai do mesmo jeito. */
      }
      set({ status: "guest", user: null, profile: null, trophies: [], streak: null, dataStatus: "idle", recovery: false, notice: "signedOut" });
    },

    async deleteAccount() {
      const client = await get().ensureClient();
      const user = get().user;
      if (!client || !user) return "network";
      const { error } = await client.rpc("excluir_conta");
      if (error) return isNetworkError(error) ? "network" : "unknown";
      try {
        await client.auth.signOut({ scope: "local" });
      } catch {
        /* A conta já não existe; a sessão local sai de qualquer jeito. */
      }
      set({ status: "guest", user: null, profile: null, trophies: [], streak: null, dataStatus: "idle", recovery: false, notice: "deleted" });
      return null;
    },

    clearNotice() {
      set({ notice: null });
    },
  };
});
