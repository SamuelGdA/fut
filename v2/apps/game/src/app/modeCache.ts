import { CODE_CACHE } from "../services/cacheNames";

export type CachedGame = "craque" | "tecnico";

/** Depois de escolher o jogo, guarda somente seu grafo para a próxima abertura offline. */
export async function cacheGame(game: CachedGame, cancelled: () => boolean): Promise<void> {
  if (!("caches" in window) || !("serviceWorker" in navigator)) return;
  await navigator.serviceWorker.ready;
  if (cancelled()) return;
  const response = await fetch(`${import.meta.env.BASE_URL}game-cache.json`, { cache: "no-cache" });
  if (!response.ok) return;
  const manifest: unknown = await response.json();
  if (!manifest || typeof manifest !== "object" || !(game in manifest)) return;
  const files = (manifest as Record<string, unknown>)[game];
  if (!Array.isArray(files) || !files.every((file): file is string => typeof file === "string" && /^assets\/[a-zA-Z0-9_.-]+\.(?:js|css|woff2)$/.test(file))) return;
  const cache = await caches.open(CODE_CACHE);
  // Lotes curtos deixam as requisições da tela atual passar primeiro.
  for (let start = 0; start < files.length; start += 4) {
    if (cancelled()) return;
    const missing: string[] = [];
    for (const file of files.slice(start, start + 4)) {
      const url = `${import.meta.env.BASE_URL}${file}`;
      if (!(await cache.match(url, { ignoreVary: true }))) missing.push(url);
    }
    if (missing.length) await cache.addAll(missing);
  }
  document.documentElement.dataset[`offline${game === "craque" ? "Craque" : "Tecnico"}`] = "ready";
}
