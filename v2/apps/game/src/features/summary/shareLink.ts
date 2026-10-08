import type { AvatarConfig } from "@craque/art";
import type { CareerSave } from "@craque/engine";
import { sanitizeAvatar } from "../appearance/avatarSchema";
import { SHARE_PREFIX } from "./shareHash";

/**
 * "Copiar link" (GDD 29.2): a carreira inteira no fragmento da URL. Vai o
 * replay (setup e escolhas, como o save) e o avatar, comprimidos com
 * `deflate-raw` e em base64 de URL. Abrir o link refaz a carreira por replay e
 * mostra o resumo em modo leitura; o save de quem abre nunca é tocado.
 *
 * O fragmento não vai para o servidor: a carreira não sai do navegador de
 * quem compartilha até alguém abrir o link.
 */

export { readShareHash, SHARE_PREFIX } from "./shareHash";

/** `z`: comprimido. `j`: JSON puro, para navegador sem CompressionStream. */
type Encoding = "z" | "j";

export interface SharedCareer {
  readonly save: CareerSave;
  readonly avatar: AvatarConfig | null;
}

export class ShareError extends Error {
  readonly code: "format" | "data";

  constructor(code: "format" | "data", message: string) {
    super(message);
    this.name = "ShareError";
    this.code = code;
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const response = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await response.arrayBuffer());
}

function canCompress(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

/** O texto que vai depois de `#c=`. */
export async function encodeShare(save: CareerSave, avatar: AvatarConfig | null): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify({ ...save, avatar }));
  if (!canCompress()) return `j${toBase64Url(json)}`;
  return `z${toBase64Url(await pipe(json, new CompressionStream("deflate-raw")))}`;
}

/** Lê o texto do link sem confiar nele. O replay valida as escolhas depois. */
export async function decodeShare(token: string): Promise<SharedCareer> {
  const encoding = token.charAt(0) as Encoding;
  if (encoding !== "z" && encoding !== "j") throw new ShareError("format", "link sem formato conhecido");
  let bytes: Uint8Array;
  try {
    bytes = fromBase64Url(token.slice(1));
    if (encoding === "z") {
      if (!canCompress()) throw new ShareError("format", "este navegador não lê links comprimidos");
      bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
    }
  } catch (error) {
    if (error instanceof ShareError) throw error;
    throw new ShareError("format", "link corrompido");
  }
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new ShareError("data", "link sem carreira");
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new ShareError("data", "link sem carreira");
  const { avatar, ...save } = value as Record<string, unknown>;
  return { save: save as unknown as CareerSave, avatar: sanitizeAvatar(avatar) };
}

export function shareUrl(token: string, location: Pick<Location, "origin" | "pathname"> = window.location): string {
  return `${location.origin}${location.pathname}${SHARE_PREFIX}${token}`;
}
