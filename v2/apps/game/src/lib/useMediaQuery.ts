import { useSyncExternalStore } from "react";

/**
 * Acompanha uma media query. A carreira usa para trocar as abas do celular
 * pelas três colunas do desktop (GDD 32.5): o mesmo conteúdo, montado de
 * outro jeito, sem esconder nada.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => (typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false),
    () => false,
  );
}
