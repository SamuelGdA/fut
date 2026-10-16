import { create } from "zustand";
import { readCoachSave } from "./save";

/**
 * O que o hub e a casca sabem do Técnico sem carregar o motor: se há uma
 * carreira em andamento no registro local ou nesta aba, e onde ela está. A carreira em si vive no
 * store pesado (`store.ts`), que atualiza isto a cada comando. Setup e comandos são salvos até o encerramento (D61).
 */
export interface TecnicoPresence {
  active: boolean;
  club: string | null;
  year: number | null;
  ended: boolean;
  set(next: Omit<TecnicoPresence, "set">): void;
}

const saved = readCoachSave();
export const useTecnicoPresence = create<TecnicoPresence>()((set) => ({
  active: saved !== null,
  club: saved?.club ?? null,
  year: saved?.year ?? null,
  ended: false,
  set: (next) => set(next),
}));
