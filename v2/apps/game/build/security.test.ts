import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ROUTE_PATHS } from "./routes";
import { contentSecurityPolicy, devSecurityHeaders, findPublicSecrets, headersFile, securityHeaders, vercelHeaders } from "./security";

/** Cabeçalhos de segurança e endereços próprios (D112 e D114). */

describe("Content-Security-Policy", () => {
  const csp = contentSecurityPolicy();
  const directive = (name: string) => csp.split("; ").find((item) => item.startsWith(`${name} `)) ?? "";

  it("não libera script embutido nem eval, e bloqueia ser posto em iframe", () => {
    expect(directive("script-src")).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(directive("frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive("object-src")).toBe("object-src 'none'");
    expect(securityHeaders()["X-Frame-Options"]).toBe("DENY");
  });

  it("libera o Google Analytics, o AdSense e o Supabase, e nada de outro script", () => {
    expect(directive("script-src")).toContain("https://www.googletagmanager.com");
    expect(directive("script-src")).toContain("https://pagead2.googlesyndication.com");
    expect(directive("connect-src")).toContain("https://*.supabase.co");
    expect(directive("connect-src")).toContain("https://*.google-analytics.com");
    expect(directive("frame-src")).toContain("https://*.doubleclick.net");
    for (const source of directive("script-src").split(" ").slice(1)) expect(source === "'self'" || /^https:\/\/[\w*.-]*google|doubleclick|gstatic|googlesyndication|googletagmanager|adtrafficquality/.test(source), source).toBe(true);
  });

  it("o desenvolvimento fica sem CSP (o Vite injeta script), com o resto igual", () => {
    expect(devSecurityHeaders()["Content-Security-Policy"]).toBeUndefined();
    expect(devSecurityHeaders()["X-Frame-Options"]).toBe("DENY");
  });

  it("o _headers e o vercel.json dizem exatamente o mesmo", () => {
    const file = headersFile();
    for (const [name, value] of Object.entries(securityHeaders())) expect(file).toContain(`  ${name}: ${value}`);
    const vercel = JSON.parse(readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8")) as { headers: unknown };
    expect(vercel.headers).toEqual(vercelHeaders());
  });

  it("o index.html não tem script embutido nem evento (a abertura vem de public/boot)", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).not.toMatch(/<script>|<script(?![^>]*\bsrc=)[^>]*>(?!<\/script>)|\son[a-z]+="/);
    expect(html).toContain('<script src="/boot/tema.js"></script>');
    expect(html).toContain('<script src="/boot/abertura.js"></script>');
  });
});

describe("segredo em variável pública", () => {
  const jwt = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.assinatura`;

  it("recusa chave secreta, JWT de service_role e senha de banco", () => {
    expect(findPublicSecrets({ VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc" })).toEqual(["VITE_SUPABASE_PUBLISHABLE_KEY"]);
    expect(findPublicSecrets({ VITE_X: jwt("service_role") })).toEqual(["VITE_X"]);
    expect(findPublicSecrets({ VITE_DB: "postgresql://postgres:senha@db.exemplo.supabase.co:5432/postgres" })).toEqual(["VITE_DB"]);
  });

  it("aceita a publicável, o JWT anônimo e o que não é público", () => {
    expect(findPublicSecrets({ VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc", VITE_ANON: jwt("anon"), SECRET: "sb_secret_abc", VITE_DB: "postgresql://postgres:[YOUR-PASSWORD]@db.x.supabase.co:5432/postgres" })).toEqual(["VITE_DB"]);
    expect(findPublicSecrets({ VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc", VITE_ANON: jwt("anon"), SECRET: "sb_secret_abc" })).toEqual([]);
  });
});

describe("endereços próprios", () => {
  it("o build grava uma página para cada tela com caminho", () => {
    const source = readFileSync(new URL("../src/app/navigation.ts", import.meta.url), "utf8");
    const block = /export const SCREEN_PATHS[^{]*\{([^}]*)\}/.exec(source)?.[1] ?? "";
    const games = /export const GAME_PATHS[^=]*=\s*\{([\s\S]*?)\n\};/.exec(source)?.[1] ?? "";
    const paths = [...block.matchAll(/:\s*"([^"]+)"/g), ...games.matchAll(/path:\s*"([^"]+)"/g)].map((match) => match[1]);
    expect(paths.length).toBe(6);
    expect([...ROUTE_PATHS].sort()).toEqual(paths.sort());
  });
});
