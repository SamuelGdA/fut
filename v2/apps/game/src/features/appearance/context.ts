import { create } from "zustand";

/**
 * De onde o editor de aparência foi aberto. Da Identidade, a camisa do
 * retrato é a da seleção do rascunho; do Desafio do dia, é a da seleção que o
 * dia sorteou, e o editor volta para o desafio.
 */
interface AppearanceContext {
  returnTo: "identity" | "challenge";
  /** Seleção do retrato quando ela não é a do rascunho. */
  nationality: string | null;
  open(returnTo: "identity" | "challenge", nationality: string | null): void;
}

export const useAppearanceContext = create<AppearanceContext>()((set) => ({
  returnTo: "identity",
  nationality: null,
  open(returnTo, nationality) {
    set({ returnTo, nationality });
  },
}));
