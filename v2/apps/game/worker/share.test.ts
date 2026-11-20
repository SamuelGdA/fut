import { describe, expect, it } from "vitest";
import worker from "./index";
import { checkShare, cleanName, escapeHtml, MAX_IMAGE_BYTES, newShareId, readImageSize, SHARE_ID, sharePage } from "./share";

/** Carreiras compartilhadas pelo link curto (D132). */

/** Um cabeçalho de JPEG com o tamanho pedido (o resto do arquivo não importa para a leitura). */
function jpeg(width: number, height: number, padding = 2000): Uint8Array {
  const head = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, ...new Array(14).fill(0), 0xff, 0xc0, 0x00, 0x11, 0x08, height >> 8, height & 255, width >> 8, width & 255, 0x03];
  const bytes = new Uint8Array(head.length + padding);
  bytes.set(head);
  return bytes;
}

function png(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(64);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, height);
  return bytes;
}

const TOKEN = "zAbC123_-xyz";

class MemoryKV {
  readonly data = new Map<string, { value: string; ttl?: number }>();
  async get(key: string) {
    return this.data.get(key)?.value ?? null;
  }
  async put(key: string, value: string, options?: { expirationTtl?: number }) {
    this.data.set(key, { value, ttl: options?.expirationTtl });
  }
}

function env(options: { limited?: boolean } = {}) {
  const kv = new MemoryKV();
  return {
    kv,
    env: {
      ASSETS: { fetch: async () => new Response("arquivo estático") },
      COMPARTILHADAS: kv,
      COMPARTILHAR_LIMITE: { limit: async () => ({ success: !options.limited }) },
    },
  };
}

function post(form: FormData, origin = "https://futeiro.com") {
  return new Request("https://futeiro.com/api/compartilhar", { method: "POST", body: form, headers: { Origin: origin } });
}

function formWith(image: Uint8Array, token: string = TOKEN, name = "Samuel", lang = "pt") {
  const form = new FormData();
  form.set("image", new Blob([image.slice().buffer], { type: "image/jpeg" }), "carreira.jpg");
  form.set("token", token);
  form.set("name", name);
  form.set("lang", lang);
  return form;
}

const context = { waitUntil: () => undefined };

describe("regras do link curto", () => {
  it("lê largura e altura do JPEG e do PNG", () => {
    expect(readImageSize(jpeg(1200, 630))).toEqual({ type: "image/jpeg", width: 1200, height: 630 });
    expect(readImageSize(png(1200, 630))).toEqual({ type: "image/png", width: 1200, height: 630 });
    expect(readImageSize(new TextEncoder().encode("<svg></svg>"))).toBeNull();
  });

  it("aceita só a imagem da carreira e o link do jogo", () => {
    expect(checkShare(jpeg(1200, 630), TOKEN)).toBeNull();
    expect(checkShare(jpeg(800, 600), TOKEN)).toBe("dimensions");
    expect(checkShare(jpeg(1200, 630, MAX_IMAGE_BYTES), TOKEN)).toBe("size");
    expect(checkShare(new TextEncoder().encode("GIF89a"), TOKEN)).toBe("image");
    expect(checkShare(jpeg(1200, 630), "https://outro.site")).toBe("token");
    expect(checkShare(jpeg(1200, 630), "z<script>")).toBe("token");
  });

  it("código curto sem letras que se confundem", () => {
    const id = newShareId();
    expect(id).toMatch(SHARE_ID);
    expect(id).not.toMatch(/[0O1lI]/);
  });

  it("nome limpo e página sem HTML injetado", () => {
    expect(cleanName('<b>Sam"uel</b>')).toBe("bSamuelb");
    expect(escapeHtml(`"><script>`)).toBe("&quot;&gt;&lt;script&gt;");
    const html = sharePage("https://futeiro.com", "AbCdEfGhJk", { name: "Samuel", lang: "pt", token: TOKEN, type: "image/jpeg" });
    expect(html).toContain('<meta property="og:image" content="https://futeiro.com/c/AbCdEfGhJk.jpg">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain("A carreira de Samuel no Futeiro");
    expect(html).toContain(`url=https://futeiro.com/#c=${TOKEN}`);
    expect(html).not.toMatch(/<script/i);
    expect(sharePage("https://futeiro.com", "AbCdEfGhJk", { name: "", lang: "en", token: TOKEN, type: "image/jpeg" })).toContain("A career on Futeiro");
  });
});

describe("Worker", () => {
  it("guarda, devolve o link curto, mostra a página com a prévia e a imagem", async () => {
    const { kv, env: bindings } = env();
    const response = await worker.fetch(post(formWith(jpeg(1200, 630))), bindings, context);
    expect(response.status).toBe(201);
    const { url } = (await response.json()) as { url: string };
    expect(url).toMatch(/^https:\/\/futeiro\.com\/c\/[A-Za-z0-9]{10}$/);
    const id = url.split("/").pop()!;
    expect(kv.data.get(`c:${id}`)?.ttl).toBe(180 * 24 * 60 * 60);

    const page = await worker.fetch(new Request(url), bindings, context);
    expect(page.headers.get("Content-Type")).toContain("text/html");
    expect(page.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
    expect(await page.text()).toContain(`/c/${id}.jpg`);

    const image = await worker.fetch(new Request(`${url}.jpg`), bindings, context);
    expect(image.headers.get("Content-Type")).toBe("image/jpeg");
    expect(readImageSize(new Uint8Array(await image.arrayBuffer()))).toEqual({ type: "image/jpeg", width: 1200, height: 630 });
  });

  it("recusa outro site, limite estourado, imagem errada e método errado", async () => {
    const { env: bindings } = env();
    expect((await worker.fetch(post(formWith(jpeg(1200, 630)), "https://outro.site"), bindings, context)).status).toBe(403);
    expect((await worker.fetch(post(formWith(jpeg(640, 480))), bindings, context)).status).toBe(400);
    expect((await worker.fetch(post(formWith(jpeg(1200, 630))), env({ limited: true }).env, context)).status).toBe(429);
    expect((await worker.fetch(new Request("https://futeiro.com/api/compartilhar"), bindings, context)).status).toBe(405);
  });

  it("código que não existe dá 404; o resto do site segue para os arquivos", async () => {
    const { env: bindings } = env();
    expect((await worker.fetch(new Request("https://futeiro.com/c/AbCdEfGhJk"), bindings, context)).status).toBe(404);
    // Código fora do formato nem chega ao armazenamento.
    expect((await worker.fetch(new Request("https://futeiro.com/c/curto"), bindings, context)).status).toBe(404);
    expect(await (await worker.fetch(new Request("https://futeiro.com/craque"), bindings, context)).text()).toBe("arquivo estático");
  });
});
