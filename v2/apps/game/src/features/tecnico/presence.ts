import { create } from "zustand";

/**
 * O que o hub e a casca sabem do Técnico sem carregar o motor: se há uma
 * carreira em memória nesta aba, e onde ela está. A carreira em si vive no
 * store pesado (`store.ts`), que atualiza isto a cada comando. Nada é salvo:
 * recarregar a página encerra a carreira (D51).
 */
export interface TecnicoPresence {
  active: boolean;
  club: string | null;
  year: number | null;
  ended: boolean;
  set(next: Omit<TecnicoPresence, "set">): void;
}

export const useTecnicoPresence = create<TecnicoPresence>()((set) => ({
  active: false,
  club: null,
  year: null,
  ended: false,
  set: (next) => set(next),
}));
