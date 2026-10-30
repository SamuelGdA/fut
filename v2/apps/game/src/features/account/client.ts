import type { SupabaseClient } from "@supabase/supabase-js";
import { safeStorage } from "../../services/storage";
import { AUTH_STORAGE_KEY, CLOUD } from "./config";

/**
 * O cliente do Supabase, baixado só quando alguém precisa dele: quem tem
 * sessão guardada, quem abre o login, o ranking do Desafio. O visitante que
 * só joga nunca baixa a biblioteca (a abertura continua leve, D62).
 *
 * Fluxo PKCE: o código do Google e dos e-mails volta na URL e é trocado pela
 * sessão em `store.ts`, que também limpa a barra de endereço.
 */

let client: Promise<SupabaseClient> | null = null;

export function cloudClient(): Promise<SupabaseClient> | null {
  const config = CLOUD;
  if (!config) return null;
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(config.url, config.key, {
      auth: {
        flowType: "pkce",
        storageKey: AUTH_STORAGE_KEY,
        storage: safeStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }),
  );
  return client;
}

/** O código de erro do Postgres/PostgREST ou do Auth, para a tela traduzir. */
export function errorCode(error: unknown): string {
  if (typeof error !== "object" || error === null) return "unknown";
  const record = error as { code?: unknown; message?: unknown; status?: unknown; name?: unknown };
  if (typeof record.code === "string" && record.code.length > 0) return record.code;
  if (typeof record.message === "string") return record.message;
  return "unknown";
}

/** Falha de rede (sem internet, servidor fora): vale tentar de novo depois. */
export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  const text = `${errorCode(error)} ${error instanceof Error ? error.message : ""} ${typeof error === "object" && error !== null && "message" in error ? String((error as { message: unknown }).message) : ""}`;
  return /fetch|network|timeout|Failed to|Load failed|NetworkError|ECONN/i.test(text);
}
