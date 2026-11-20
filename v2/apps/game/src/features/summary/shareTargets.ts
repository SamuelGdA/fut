/**
 * Compartilhar a carreira (D132). As redes não aceitam imagem anexada por um
 * link de site: WhatsApp, X, Facebook, Telegram e Reddit recebem só texto e
 * endereço. A imagem aparece porque o endereço é o link curto da carreira
 * (`futeiro.com/c/<código>`), cuja prévia é a imagem dela. Discord não tem
 * link de compartilhar: a mensagem é copiada e, colada, mostra a prévia.
 * Instagram só recebe arquivo pelo aplicativo: no celular, pelo
 * compartilhamento do aparelho; no computador, a imagem é baixada.
 */

export type ShareNetwork = "whatsapp" | "x" | "facebook" | "telegram" | "reddit" | "discord" | "instagram";

export const SHARE_NETWORKS: readonly ShareNetwork[] = ["whatsapp", "x", "facebook", "telegram", "reddit", "discord", "instagram"];

/** O endereço que abre o compartilhamento em cada rede, ou `null` (Discord e Instagram não têm). */
export function networkUrl(network: ShareNetwork, message: string, link: string): string | null {
  const text = encodeURIComponent(message);
  const url = encodeURIComponent(link);
  switch (network) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${message}\n${link}`)}`;
    case "x":
      return `https://x.com/intent/post?text=${text}&url=${url}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${text}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${url}&title=${text}`;
    default:
      return null;
  }
}

/** A mensagem com o link, para colar onde não há botão (Discord, conversa qualquer). */
export function messageWithLink(message: string, link: string): string {
  return `${message.trim()}\n${link}`;
}

/** Converte a imagem para JPEG: cerca de um quarto do PNG, e as prévias carregam mais rápido. */
export async function toJpeg(png: Blob, quality = 0.86): Promise<Blob> {
  const bitmap = await createImageBitmap(png);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("sem canvas");
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("sem jpeg"))), "image/jpeg", quality);
  });
}

/** Pede ao site o link curto da carreira (o Worker guarda a imagem e o replay). */
export async function createShortLink(image: Blob, token: string, name: string, lang: string): Promise<string> {
  const form = new FormData();
  form.set("image", image, "carreira.jpg");
  form.set("token", token);
  form.set("name", name);
  form.set("lang", lang);
  const response = await fetch(`${import.meta.env.BASE_URL}api/compartilhar`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`link curto: ${response.status}`);
  const body = (await response.json()) as { url?: unknown };
  if (typeof body.url !== "string" || !/^https?:\/\/[^/]+\/c\/[A-Za-z0-9]{10}$/.test(body.url)) throw new Error("link curto inválido");
  return body.url;
}

/** O nome como gente escreve ("DA SILVA" vira "Da Silva"), para a mensagem e a prévia. */
export function displayName(surname: string, locale: string): string {
  return surname
    .toLocaleLowerCase(locale)
    .replace(/(^|[\s'-])(\p{L})/gu, (_match, before: string, letter: string) => `${before}${letter.toLocaleUpperCase(locale)}`);
}
