/**
 * Que tipo de erro chegou à barreira (GDD 34.4 e 37). Duas famílias pedem
 * conversas diferentes com o jogador:
 *
 * - `chunk`: um pedaço do jogo não baixou. Ou saiu uma versão nova enquanto a
 *   aba estava aberta (o arquivo antigo sumiu do servidor), ou o aparelho está
 *   sem internet e aquele pedaço ainda não estava guardado. Recarregar resolve.
 * - `render`: um erro de verdade ao desenhar a tela.
 */
export type ErrorKind = "chunk" | "render";

const CHUNK_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i,
  /error loading dynamically imported module/i,
  /unable to preload css/i,
  /loading (css )?chunk .* failed/i,
];

export function errorKind(error: unknown): ErrorKind {
  if (error instanceof Error) {
    if (error.name === "ChunkLoadError") return "chunk";
    if (CHUNK_PATTERNS.some((pattern) => pattern.test(error.message))) return "chunk";
  }
  return "render";
}

/** O texto de um erro desconhecido, para os detalhes técnicos. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  return String(error);
}

/** O aparelho diz que está sem internet. Sem a API, supõe que está com. */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
