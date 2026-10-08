/**
 * O pôster da carreira (GDD 29): PNG de 1080 × 1350 desenhado do próprio DOM
 * pelo modern-screenshot, que só carrega quando alguém pede o pôster. Escudos,
 * bandeiras, troféus e avatar são do mesmo endereço do jogo (ou já vêm em
 * data URL), então entram embutidos sem bloqueio de CORS; as fontes são
 * esperadas antes de desenhar.
 */

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;
/** O fundo do pôster, igual ao da paleta escura fixa. */
export const POSTER_BACKGROUND = "#0d1110";
/** URL temporário do arquivo some depois disto (GDD 29.2). */
export const BLOB_URL_TTL = 60_000;

/** `craque-<sobrenome>.png`, sem acento nem espaço; sem sobrenome, `craque-carreira.png`. */
export function posterFileName(surname: string, showSurname: boolean): string {
  const slug = surname
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return showSurname && slug.length > 0 ? `craque-${slug}.png` : "craque-carreira.png";
}

/** Espera fontes e imagens do nó, para o desenho não sair com letra trocada ou buraco. */
async function settle(node: HTMLElement): Promise<void> {
  if (typeof document !== "undefined" && document.fonts) await document.fonts.ready;
  const images = [...node.querySelectorAll("img")];
  await Promise.all(
    images.map(async (image) => {
      // As imagens do pôster são `lazy`, como no resto do jogo: fora da tela, nunca carregariam.
      image.loading = "eager";
      if (image.complete && image.naturalWidth > 0) return;
      try {
        await image.decode();
      } catch {
        // Imagem quebrada não segura o pôster: sai sem ela.
      }
    }),
  );
}

export async function renderPoster(node: HTMLElement): Promise<Blob> {
  await settle(node);
  const { domToBlob } = await import("modern-screenshot");
  return domToBlob(node, {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    scale: 1,
    type: "image/png",
    backgroundColor: POSTER_BACKGROUND,
    timeout: 15_000,
  });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), BLOB_URL_TTL);
}

/** O navegador aceita compartilhar arquivo de imagem? Testado com um arquivo-sonda (GDD 29.2). */
export function canShareImage(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function" || typeof File === "undefined") return false;
  try {
    return navigator.canShare({ files: [new File([new Uint8Array([0])], "sonda.png", { type: "image/png" })] });
  } catch {
    return false;
  }
}

export type ShareOutcome = "shared" | "cancelled" | "failed";

/** Compartilha o PNG. Cancelar não é erro (GDD 29.2). */
export async function shareImage(blob: Blob, fileName: string, title: string, text: string): Promise<ShareOutcome> {
  try {
    await navigator.share({ files: [new File([blob], fileName, { type: "image/png" })], title, text });
    return "shared";
  } catch (error) {
    return error instanceof DOMException && error.name === "AbortError" ? "cancelled" : "failed";
  }
}
