import { useCallback, useState } from "react";

/**
 * A largura de um elemento, acompanhada por ResizeObserver. Devolve um ref de
 * callback (com limpeza, React 19): segue o elemento mesmo quando ele entra
 * depois do componente, como o conteúdo de uma folha que abre mais tarde. O
 * observador avisa logo depois de começar a observar, então a primeira medida
 * chega sem setState síncrono. Antes dela, `fallback`.
 */
export function useElementWidth(fallback: number): [ref: (element: HTMLElement | null) => (() => void) | undefined, width: number] {
  const [width, setWidth] = useState(fallback);
  const ref = useCallback((element: HTMLElement | null) => {
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}
