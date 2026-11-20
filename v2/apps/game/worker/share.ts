/**
 * Carreiras compartilhadas (D132). O jogo manda a imagem da carreira (1200 ×
 * 630) e o link de replay; o Worker guarda os dois e devolve um endereço curto,
 * `futeiro.com/c/<código>`. Essa página tem a imagem da carreira na prévia
 * (Open Graph): é isso que faz WhatsApp, X, Discord, Telegram e afins
 * mostrarem a imagem junto da mensagem. Quem abre o link vai para o resumo da
 * carreira no jogo.
 *
 * Aqui ficam as regras, sem nada da Cloudflare: o tamanho e o formato aceitos,
 * o código curto e a página. O `index.ts` liga isso ao armazenamento.
 */

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;
/** A imagem chega em JPEG (cerca de 150 KB); o limite deixa folga e barra uso como depósito de arquivos. */
export const MAX_IMAGE_BYTES = 450 * 1024;
/** O link de replay (`z...` comprimido, ou `j...`), como o "Copiar carreira" gera. */
export const MAX_TOKEN_LENGTH = 8000;
export const MAX_NAME_LENGTH = 24;
/** Quanto tempo o link curto vale: seis meses. */
export const SHARE_TTL_SECONDS = 180 * 24 * 60 * 60;
export const SHARE_ID_LENGTH = 10;
export const SHARE_ID = /^[A-Za-z0-9]{10}$/;
const TOKEN = /^[zj][A-Za-z0-9_\-=]+$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export type ShareLanguage = "pt" | "es" | "en";
export type ImageType = "image/jpeg" | "image/png";

export interface StoredShare {
  readonly v: 1;
  readonly type: ImageType;
  /** A imagem em base64. */
  readonly image: string;
  readonly token: string;
  readonly name: string;
  readonly lang: ShareLanguage;
}

/** Código curto, sem letras que se confundem (0/O, 1/l/I). */
export function newShareId(random: (bytes: Uint8Array<ArrayBuffer>) => Uint8Array = (bytes) => crypto.getRandomValues(bytes)): string {
  const bytes = random(new Uint8Array(SHARE_ID_LENGTH));
  let id = "";
  for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length];
  return id;
}

/** Largura e altura lidas do cabeçalho do PNG ou do JPEG; `null` se não for um dos dois. */
export function readImageSize(bytes: Uint8Array): { type: ImageType; width: number; height: number } | null {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { type: "image/png", width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1]!;
    // Marcadores sem tamanho.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
    // Início de quadro (SOF0 a SOF15, menos DHT, JPG e DAC): altura e largura.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { type: "image/jpeg", height: (bytes[offset + 5]! << 8) | bytes[offset + 6]!, width: (bytes[offset + 7]! << 8) | bytes[offset + 8]! };
    }
    offset += 2 + length;
  }
  return null;
}

/** Só letras, números, espaço, hífen e apóstrofo; o resto sai. */
export function cleanName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFC").replace(/[^\p{L}\p{N} '-]/gu, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function cleanLanguage(value: unknown): ShareLanguage {
  return value === "es" || value === "en" ? value : "pt";
}

export type ShareProblem = "image" | "size" | "dimensions" | "token";

/** Confere o que o jogo mandou. Devolve o problema, ou `null` se está tudo certo. */
export function checkShare(image: Uint8Array, token: unknown): ShareProblem | null {
  if (image.byteLength === 0) return "image";
  if (image.byteLength > MAX_IMAGE_BYTES) return "size";
  const size = readImageSize(image);
  if (!size) return "image";
  if (size.width !== SHARE_WIDTH || size.height !== SHARE_HEIGHT) return "dimensions";
  if (typeof token !== "string" || token.length > MAX_TOKEN_LENGTH || !TOKEN.test(token)) return "token";
  return null;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

const COPY: Record<ShareLanguage, { title: (name: string) => string; anonymous: string; description: string; open: string; locale: string; htmlLang: string }> = {
  pt: {
    title: (name) => `A carreira de ${name} no Futeiro`,
    anonymous: "Uma carreira no Futeiro",
    description: "Veja os números, os títulos e o caminho dessa carreira. Monte o seu jogador e escolha a sua história em futeiro.com.",
    open: "Abrir a carreira no Futeiro",
    locale: "pt_BR",
    htmlLang: "pt-BR",
  },
  es: {
    title: (name) => `La carrera de ${name} en Futeiro`,
    anonymous: "Una carrera en Futeiro",
    description: "Mira los números, los títulos y el camino de esta carrera. Arma tu jugador y elige tu historia en futeiro.com.",
    open: "Abrir la carrera en Futeiro",
    locale: "es_ES",
    htmlLang: "es",
  },
  en: {
    title: (name) => `${name}'s career on Futeiro`,
    anonymous: "A career on Futeiro",
    description: "See the numbers, the titles and the path of this career. Build your player and choose your story at futeiro.com.",
    open: "Open the career on Futeiro",
    locale: "en_US",
    htmlLang: "en",
  },
};

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * A página do link curto. Robôs de prévia leem as metatags; pessoas seguem
 * na hora para o resumo da carreira (`/#c=...`), sem JavaScript.
 */
export function sharePage(origin: string, id: string, share: Pick<StoredShare, "name" | "lang" | "token" | "type">): string {
  const copy = COPY[share.lang];
  const title = share.name ? copy.title(share.name) : copy.anonymous;
  const url = `${origin}/c/${id}`;
  const image = `${origin}/c/${id}.${share.type === "image/png" ? "png" : "jpg"}`;
  const target = `${origin}/#c=${share.token}`;
  const meta = (key: string, value: string, attribute: "property" | "name" = "property") => `<meta ${attribute}="${key}" content="${escapeHtml(value)}">`;
  return `<!doctype html>
<html lang="${copy.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(copy.description)}">
<meta name="robots" content="noindex">
${meta("og:type", "website")}
${meta("og:site_name", "Futeiro")}
${meta("og:title", title)}
${meta("og:description", copy.description)}
${meta("og:url", url)}
${meta("og:locale", copy.locale)}
${meta("og:image", image)}
${meta("og:image:secure_url", image)}
${meta("og:image:type", share.type)}
${meta("og:image:width", String(SHARE_WIDTH))}
${meta("og:image:height", String(SHARE_HEIGHT))}
${meta("og:image:alt", title)}
${meta("twitter:card", "summary_large_image", "name")}
${meta("twitter:title", title, "name")}
${meta("twitter:description", copy.description, "name")}
${meta("twitter:image", image, "name")}
<link rel="canonical" href="${escapeHtml(url)}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(target)}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f0e8;color:#141a17;font:600 16px/1.5 system-ui,sans-serif}a{color:#2f7d4c}</style>
</head>
<body>
<p><a href="${escapeHtml(target)}">${escapeHtml(copy.open)}</a></p>
</body>
</html>
`;
}
