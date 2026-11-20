import {
  checkShare,
  cleanLanguage,
  cleanName,
  fromBase64,
  MAX_IMAGE_BYTES,
  MAX_TOKEN_LENGTH,
  newShareId,
  SHARE_ID,
  SHARE_TTL_SECONDS,
  sharePage,
  type StoredShare,
  toBase64,
} from "./share";

/**
 * O Worker do futeiro.com (D132). O site continua sendo arquivos estáticos:
 * só `/api/*` e `/c/*` passam por aqui (`run_worker_first` no wrangler.jsonc);
 * o resto vai direto para os arquivos.
 *
 * - `POST /api/compartilhar`: guarda a imagem da carreira e o link de replay,
 *   devolve `{ url }` com o endereço curto.
 * - `GET /c/<código>`: a página com a prévia da carreira (Open Graph).
 * - `GET /c/<código>.jpg`: a imagem.
 *
 * Defesas: só o próprio site envia (Origin), limite de envios por endereço de
 * rede, imagem só JPEG ou PNG de 1200 × 630 e até 450 KB, link só no formato
 * do jogo, e tudo some sozinho depois de seis meses.
 */

interface KVNamespace {
  get(key: string, type: "text"): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  COMPARTILHADAS?: KVNamespace;
  COMPARTILHAR_LIMITE?: RateLimit;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Frame-Options": "DENY",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...SECURITY_HEADERS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

function notFound(): Response {
  return new Response("Não encontrado", { status: 404, headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" } });
}

async function store(request: Request, env: Env): Promise<Response> {
  const origin = new URL(request.url).origin;
  if (request.headers.get("Origin") !== origin) return json({ error: "origin" }, 403);
  if (!env.COMPARTILHADAS) return json({ error: "indisponivel" }, 503);
  const length = Number(request.headers.get("Content-Length") ?? "0");
  if (length > MAX_IMAGE_BYTES + MAX_TOKEN_LENGTH + 4096) return json({ error: "size" }, 413);
  if (env.COMPARTILHAR_LIMITE) {
    const key = request.headers.get("CF-Connecting-IP") ?? "sem-ip";
    const { success } = await env.COMPARTILHAR_LIMITE.limit({ key });
    if (!success) return json({ error: "limite" }, 429);
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "form" }, 400);
  }
  const file = form.get("image");
  if (!file || typeof file === "string") return json({ error: "image" }, 400);
  const image = new Uint8Array(await file.arrayBuffer());
  const token = form.get("token");
  const problem = checkShare(image, token);
  if (problem) return json({ error: problem }, 400);
  const id = newShareId();
  const share: StoredShare = {
    v: 1,
    type: image[0] === 0x89 ? "image/png" : "image/jpeg",
    image: toBase64(image),
    token: token as string,
    name: cleanName(form.get("name")),
    lang: cleanLanguage(form.get("lang")),
  };
  await env.COMPARTILHADAS.put(`c:${id}`, JSON.stringify(share), { expirationTtl: SHARE_TTL_SECONDS });
  return json({ url: `${origin}/c/${id}` }, 201);
}

async function read(env: Env, id: string): Promise<StoredShare | null> {
  if (!env.COMPARTILHADAS || !SHARE_ID.test(id)) return null;
  const raw = await env.COMPARTILHADAS.get(`c:${id}`, "text");
  if (!raw) return null;
  try {
    const share = JSON.parse(raw) as StoredShare;
    return share.v === 1 ? share : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env, _context: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/compartilhar") {
      return request.method === "POST" ? store(request, env) : json({ error: "metodo" }, 405);
    }
    const match = /^\/c\/([A-Za-z0-9]+)(\.(?:jpg|png))?$/.exec(url.pathname);
    if (match && (request.method === "GET" || request.method === "HEAD")) {
      const share = await read(env, match[1]!);
      if (!share) return notFound();
      if (match[2]) {
        return new Response(fromBase64(share.image), {
          headers: { ...SECURITY_HEADERS, "Content-Type": share.type, "Cache-Control": "public, max-age=31536000, immutable" },
        });
      }
      return new Response(sharePage(url.origin, match[1]!, share), {
        headers: {
          ...SECURITY_HEADERS,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
          "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
