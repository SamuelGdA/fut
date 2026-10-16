import { usePrefs } from "../store/prefs";

/** A escolha salva no jogo prevalece sobre a configuração de movimento do PC. */
export function useReducedMotion(): boolean {
  return usePrefs((state) => state.motion === "reduced");
}
