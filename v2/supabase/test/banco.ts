import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

/**
 * Um Postgres de verdade (PGlite, em WebAssembly) com o mínimo do Supabase
 * que as migrações usam: os papéis `anon` e `authenticated`, `auth.users` e
 * `auth.uid()` lendo o JWT da requisição. Antes das migrações, o banco dá a
 * `anon` e `authenticated` tudo em tabelas e funções novas, como o Supabase
 * faz por padrão: assim os testes provam que os `revoke` da migração fecham
 * o que precisa ficar fechado.
 */

const MIGRATIONS = fileURLToPath(new URL("../migrations/", import.meta.url));

const SUPABASE_STUB = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(coalesce(
    current_setting('request.jwt.claim.sub', true),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  ), '')::uuid
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant execute on function auth.jwt() to anon, authenticated;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
`;

export async function freshDatabase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const name of readdirSync(MIGRATIONS).filter((file) => file.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS, name), "utf8"));
  }
  return db;
}

/** Cria uma conta como o Supabase Auth faria (o gatilho cria o perfil). */
export async function createUser(db: PGlite, metadata: Record<string, unknown> = {}): Promise<string> {
  const result = await db.query<{ id: string }>("insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id", [
    `${Math.random().toString(36).slice(2)}@exemplo.com`,
    JSON.stringify(metadata),
  ]);
  return result.rows[0]!.id;
}

/**
 * Roda `work` como uma requisição da API: papel `authenticated` com o JWT do
 * usuário, ou `anon` sem usuário. Sempre volta ao superusuário no fim.
 */
export async function as<T>(db: PGlite, user: string | null, work: () => Promise<T>, claims: Record<string, unknown> = {}): Promise<T> {
  await db.exec(`set role ${user ? "authenticated" : "anon"}`);
  await db.query("select set_config('request.jwt.claims', $1, false)", [user ? JSON.stringify({ sub: user, role: "authenticated", ...claims }) : ""]);
  try {
    return await work();
  } finally {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claims', '', false)");
  }
}

/** O erro do Postgres de uma operação que precisa falhar. */
export async function failure(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error("a operação deveria ter falhado");
}
