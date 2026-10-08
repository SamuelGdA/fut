import { create } from "zustand";

/**
 * A fila de avisos de conquista (GDD 28.2). Quem libera a conquista já manda o
 * texto pronto, então quem avisa não precisa do conteúdo nem do motor. Durante
 * a revelação da temporada a fila espera: o aviso "Primeira taça" não pode
 * estragar a página que vai mostrar o título.
 */

export interface UnlockNotice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

interface UnlockState {
  queue: UnlockNotice[];
  /** Verdadeiro enquanto a revelação está aberta. */
  held: boolean;
  push(notices: readonly UnlockNotice[]): void;
  hold(held: boolean): void;
  /** Tira tudo da fila, para avisar. */
  take(): UnlockNotice[];
}

export const useUnlocks = create<UnlockState>()((set, get) => ({
  queue: [],
  held: false,
  push(notices) {
    if (notices.length === 0) return;
    set((state) => ({ queue: [...state.queue, ...notices.filter((notice) => !state.queue.some((queued) => queued.id === notice.id))] }));
  },
  hold(held) {
    if (get().held !== held) set({ held });
  },
  take() {
    const queue = get().queue;
    if (queue.length > 0) set({ queue: [] });
    return queue;
  },
}));
