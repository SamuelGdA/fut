import { create } from "zustand";
import { canStoreImages, countStored, runtimeImageUrls, storeImages } from "../../services/offlineImages";

/**
 * Guardar todas as imagens para jogar sem internet (GDD 37), como estado do
 * app: o download continua com o painel de ajustes fechado e o painel mostra
 * onde ele está quando abre de novo.
 */

export type OfflineStatus = "unsupported" | "idle" | "counting" | "storing" | "done" | "partial" | "full";

interface OfflineState {
  status: OfflineStatus;
  stored: number;
  total: number;
  failed: number;
  /** Lê quantas já estão guardadas. Chamar ao abrir o painel. */
  refresh(): Promise<void>;
  start(): Promise<void>;
  stop(): void;
}

let controller: AbortController | null = null;

export const useOfflineImages = create<OfflineState>()((set, get) => ({
  status: canStoreImages() ? "idle" : "unsupported",
  stored: 0,
  total: 0,
  failed: 0,

  async refresh() {
    if (!canStoreImages() || get().status === "storing") return;
    set({ status: "counting" });
    const urls = runtimeImageUrls();
    try {
      const stored = await countStored(urls);
      set({ status: stored >= urls.length ? "done" : "idle", stored, total: urls.length });
    } catch {
      set({ status: "idle", stored: 0, total: urls.length });
    }
  },

  async start() {
    if (!canStoreImages() || get().status === "storing") return;
    controller = new AbortController();
    const urls = runtimeImageUrls();
    set({ status: "storing", total: urls.length, failed: 0 });
    try {
      const result = await storeImages(
        urls,
        (progress) => set({ stored: progress.done, total: progress.total, failed: progress.failed }),
        controller.signal,
      );
      if (controller.signal.aborted) {
        set({ status: "idle" });
        return;
      }
      set({ status: result.failed > 0 ? "partial" : "done", stored: result.done, failed: result.failed });
    } catch (error) {
      set({ status: error instanceof DOMException && error.name === "QuotaExceededError" ? "full" : "partial" });
    } finally {
      controller = null;
    }
  },

  stop() {
    controller?.abort();
  },
}));
