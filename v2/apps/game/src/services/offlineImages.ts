import { CLUBS, COMPETITIONS } from "@craque/world";
import { clubCrestUrl, competitionTrophyUrl } from "../lib/assets";
import { IMAGE_CACHE, RUNTIME_IMAGE_PATTERN } from "./cacheNames";

/**
 * Guardar todas as imagens para jogar sem internet (GDD 37). Escudos e troféus
 * entram no cache conforme aparecem; quem quer o jogo inteiro offline, sem
 * nenhum escudo desenhado no lugar do real, pede para guardar tudo de uma vez
 * nos Ajustes. As imagens vão para o mesmo cache que o service worker lê, então
 * passam a sair dali na hora.
 */

/** O navegador guarda respostas para usar sem internet (Cache Storage). */
export function canStoreImages(): boolean {
  return typeof caches !== "undefined" && typeof fetch === "function";
}

/** Os endereços das imagens reais que entram conforme aparecem, sem repetir. */
export function runtimeImageUrls(): string[] {
  const urls = new Set<string>();
  for (const club of CLUBS) urls.add(clubCrestUrl(club, "real"));
  for (const competition of COMPETITIONS) urls.add(competitionTrophyUrl(competition, "real"));
  // Bandeiras, selos de liga e prêmios entram na instalação; aqui só o que entra conforme aparece.
  return [...urls].filter((url) => RUNTIME_IMAGE_PATTERN.test(url));
}

const absolute = (url: string) => new URL(url, window.location.origin).href;

/** Quantas destas imagens já estão guardadas. */
export async function countStored(urls: readonly string[]): Promise<number> {
  if (!canStoreImages()) return 0;
  const cache = await caches.open(IMAGE_CACHE);
  const stored = new Set((await cache.keys()).map((request) => request.url));
  return urls.filter((url) => stored.has(absolute(url))).length;
}

export interface StoreProgress {
  readonly done: number;
  readonly total: number;
  readonly failed: number;
}

/** Quantas imagens baixam ao mesmo tempo: rápido sem engasgar o jogo. */
const PARALLEL = 6;

/**
 * Baixa e guarda as que faltam, `PARALLEL` por vez. Para no `signal`. Falha
 * de uma imagem não para as outras; o resultado diz quantas falharam.
 */
export async function storeImages(urls: readonly string[], onProgress: (progress: StoreProgress) => void, signal: AbortSignal): Promise<StoreProgress> {
  const cache = await caches.open(IMAGE_CACHE);
  const stored = new Set((await cache.keys()).map((request) => request.url));
  const missing = urls.map(absolute).filter((url) => !stored.has(url));
  const total = urls.length;
  let done = total - missing.length;
  let failed = 0;
  onProgress({ done, total, failed });

  let next = 0;
  const worker = async () => {
    while (next < missing.length && !signal.aborted) {
      const url = missing[next];
      next += 1;
      if (!url) continue;
      try {
        const response = await fetch(url, { signal, cache: "no-cache" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await cache.put(url, response);
        done += 1;
      } catch (error) {
        if (signal.aborted) return;
        // Cota cheia não passa de imagem em imagem: para tudo.
        if (error instanceof DOMException && error.name === "QuotaExceededError") throw error;
        failed += 1;
      }
      onProgress({ done, total, failed });
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  return { done, total, failed };
}

/** O tamanho das imagens desse cache, medido no build (`vite.config.ts`). */
export const RUNTIME_IMAGE_BYTES: number = __RUNTIME_IMAGE_BYTES__;
