/**
 * O fragmento do link de carreira (GDD 29.2), sem dependência nenhuma: a
 * abertura do jogo só precisa saber se a URL tem um link, e isto entra no
 * pacote inicial. Ler e refazer a carreira fica em `shareLink.ts`, que só
 * carrega com a tela do link.
 */

export const SHARE_PREFIX = "#c=";

/** O token do link, se a URL tiver um. */
export function readShareHash(hash: string): string | null {
  return hash.startsWith(SHARE_PREFIX) && hash.length > SHARE_PREFIX.length ? hash.slice(SHARE_PREFIX.length) : null;
}
