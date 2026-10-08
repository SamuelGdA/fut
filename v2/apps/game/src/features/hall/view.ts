import { create } from "zustand";

/**
 * Qual carreira do Hall está aberta na tela de leitura. Só em memória:
 * recarregar a página nessa tela volta ao Início, como as outras telas que
 * não são a carreira nem o resumo.
 */
interface HallView {
  openId: string | null;
  open(id: string): void;
}

export const useHallView = create<HallView>()((set) => ({
  openId: null,
  open(id) {
    set({ openId: id });
  },
}));
