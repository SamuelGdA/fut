/**
 * Compartilhar a carreira (D133). No computador, cada botão abre a rede já na
 * tela de postar ou mandar, com a mensagem e o endereço do jogo: as redes não
 * aceitam imagem vinda de um site, então a imagem vai à parte, baixada pelo
 * jogador. Só entram redes que abrem essa tela; as que só copiariam o texto
 * (Discord, Instagram) ficam de fora. No celular, o compartilhamento do
 * aparelho leva a imagem e o texto juntos, sem esta lista.
 */

export type ShareNetwork = "whatsapp" | "x" | "facebook" | "telegram" | "reddit";

export const SHARE_NETWORKS: readonly ShareNetwork[] = ["whatsapp", "x", "facebook", "telegram", "reddit"];

/** O endereço que abre a tela de postar ou mandar em cada rede, com a mensagem e o link. */
export function networkUrl(network: ShareNetwork, message: string, link: string): string {
  const text = encodeURIComponent(message);
  const url = encodeURIComponent(link);
  switch (network) {
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(messageWithLink(message, link))}`;
    case "x":
      return `https://x.com/intent/post?text=${text}&url=${url}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${text}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${url}&title=${text}`;
  }
}

/** A mensagem com o link numa linha própria. */
export function messageWithLink(message: string, link: string): string {
  return `${message.trim()}\n${link}`;
}

/** O nome como gente escreve ("DA SILVA" vira "Da Silva"), para a mensagem. */
export function displayName(surname: string, locale: string): string {
  return surname
    .toLocaleLowerCase(locale)
    .replace(/(^|[\s'-])(\p{L})/gu, (_match, before: string, letter: string) => `${before}${letter.toLocaleUpperCase(locale)}`);
}
