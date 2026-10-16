import { useEffect, useState, type RefObject } from "react";

/** A prévia acompanha coleções grandes; o PNG não corta as últimas taças. */
export function usePosterHeight(ref: RefObject<HTMLElement | null>, open: boolean): number {
  const [height, setHeight] = useState(1350);
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    let observer: ResizeObserver | undefined;
    // A folha monta seu portal depois do efeito do pai. Aguardar o nó evita
    // manter a prévia em 1350 quando a coleção precisa de mais altura.
    const connect = () => {
      const node = ref.current;
      if (!node) { frame = requestAnimationFrame(connect); return; }
      const update = () => setHeight(Math.max(1350, node.scrollHeight));
      observer = new ResizeObserver(update);
      observer.observe(node);
      update();
    };
    connect();
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [ref, open]);
  return height;
}
