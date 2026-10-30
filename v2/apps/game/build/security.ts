import type { Plugin } from "vite";

/**
 * Cabeçalhos de segurança do site (D114), numa fonte só: o `vite preview`
 * (onde a suíte ponta a ponta joga, então a CSP é testada de verdade), o
 * `_headers` gravado no build (Netlify e Cloudflare Pages leem) e o
 * `vercel.json` da raiz do v2 (um teste confere que ele é igual a isto).
 *
 * A Content-Security-Policy libera só o próprio site, o Supabase e os
 * endereços do Google Analytics e do AdSense (inclusive os quadros dos
 * anúncios). Nenhum script embutido: a abertura e as páginas de erro carregam
 * arquivos de `public/boot/`. `frame-ancestors 'none'` e `X-Frame-Options`
 * impedem o jogo de rodar dentro de iframe de outro site (clickjacking).
 */

const GOOGLE_SCRIPTS = [
  "https://www.googletagmanager.com",
  "https://pagead2.googlesyndication.com",
  "https://*.googlesyndication.com",
  "https://*.adtrafficquality.google",
  "https://www.google.com",
  "https://www.gstatic.com",
  "https://fundingchoicesmessages.google.com",
  "https://*.doubleclick.net",
];

const GOOGLE_CONNECT = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://*.googletagmanager.com",
  "https://pagead2.googlesyndication.com",
  "https://*.googlesyndication.com",
  "https://*.adtrafficquality.google",
  "https://*.doubleclick.net",
  "https://www.google.com",
  "https://fundingchoicesmessages.google.com",
];

const GOOGLE_FRAMES = [
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://www.google.com",
  "https://*.adtrafficquality.google",
  "https://fundingchoicesmessages.google.com",
];

/** O Supabase de qualquer projeto (o endereço exato vem do `.env.local` e não precisa ir para cá). */
const SUPABASE = ["https://*.supabase.co", "wss://*.supabase.co"];

export function contentSecurityPolicy(): string {
  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    ["script-src", ["'self'", ...GOOGLE_SCRIPTS]],
    // React, Motion e os anúncios mexem em `style`; estilo não executa código.
    ["style-src", ["'self'", "'unsafe-inline'"]],
    // Escudos e avatares gerados são `data:`; anúncios trazem imagem de vários domínios do Google.
    ["img-src", ["'self'", "data:", "blob:", "https:"]],
    ["font-src", ["'self'", "data:"]],
    ["connect-src", ["'self'", ...SUPABASE, ...GOOGLE_CONNECT]],
    ["frame-src", GOOGLE_FRAMES],
    ["worker-src", ["'self'", "blob:"]],
    ["manifest-src", ["'self'"]],
    ["media-src", ["'self'", "data:", "blob:"]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
  ];
  return directives.map(([name, values]) => `${name} ${values.join(" ")}`).join("; ");
}

/** Os cabeçalhos do site publicado. */
export function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": contentSecurityPolicy(),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  };
}

/**
 * No desenvolvimento, sem CSP: o Vite injeta um script embutido para o
 * recarregamento rápido do React. O resto vale igual.
 */
export function devSecurityHeaders(): Record<string, string> {
  const { "Content-Security-Policy": _csp, "Strict-Transport-Security": _hsts, ...rest } = securityHeaders();
  return rest;
}

/** O arquivo `_headers` (formato do Netlify e do Cloudflare Pages). */
export function headersFile(): string {
  const lines = ["# Gerado no build por build/security.ts (D114). Não edite à mão.", "/*"];
  for (const [name, value] of Object.entries(securityHeaders())) lines.push(`  ${name}: ${value}`);
  lines.push("", "/sw.js", "  Cache-Control: no-cache", "");
  return lines.join("\n");
}

/** O bloco `headers` do `vercel.json`. */
export function vercelHeaders(): { source: string; headers: { key: string; value: string }[] }[] {
  return [
    { source: "/(.*)", headers: Object.entries(securityHeaders()).map(([key, value]) => ({ key, value })) },
    { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
  ];
}

/**
 * Nenhum segredo vai para o navegador: tudo que começa com `VITE_` entra no
 * JavaScript público. Uma chave secreta do Supabase (`sb_secret_`), um JWT de
 * `service_role` ou uma senha de banco numa dessas variáveis derruba o build.
 */
export function findPublicSecrets(env: Readonly<Record<string, string | undefined>>): string[] {
  const leaks: string[] = [];
  for (const [name, raw] of Object.entries(env)) {
    if (!name.startsWith("VITE_") || !raw) continue;
    const value = raw.trim();
    if (value.startsWith("sb_secret_") || /postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@/.test(value)) {
      leaks.push(name);
      continue;
    }
    const parts = value.split(".");
    if (parts.length === 3 && value.startsWith("eyJ")) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8")) as { role?: unknown };
        if (payload.role === "service_role") leaks.push(name);
      } catch {
        /* não é JWT: segue */
      }
    }
  }
  return leaks;
}

/** Recusa o build com segredo público e grava o `_headers`. */
export function securityPlugin(): Plugin {
  return {
    name: "futeiros-security",
    configResolved(config) {
      const leaks = findPublicSecrets(config.env as Record<string, string | undefined>);
      if (leaks.length > 0) {
        throw new Error(`Segredo numa variável pública (${leaks.join(", ")}): só a chave publicável do Supabase (sb_publishable_) pode ir para o navegador. Tire o segredo do .env.`);
      }
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "_headers", source: headersFile() });
    },
  };
}
