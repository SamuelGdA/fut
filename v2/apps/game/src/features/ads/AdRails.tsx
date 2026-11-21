import { type CSSProperties, useLayoutEffect, useSyncExternalStore } from "react";
import { AdFrame } from "./AdFrame";
import { useAdPreview } from "./preview";
import { type AdSize, type RailPlace, railLayout } from "./slots";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** Largura e altura da janela, como texto para o React comparar sem criar objeto novo. */
function useViewport(): [number, number] {
  const value = useSyncExternalStore(
    subscribe,
    () => `${window.innerWidth}x${window.innerHeight}`,
    () => "0x0",
  );
  const [width = 0, height = 0] = value.split("x").map(Number);
  return [width, height];
}

interface AdRailsProps {
  place: RailPlace;
  /** Prefixo dos IDs: `trilho` nas telas comuns, `carreira-trilho` no jogo. */
  prefix: "trilho" | "carreira-trilho";
}

/**
 * Os trilhos laterais do PC (D134, D135): um arranha-céu de cada lado, preso
 * à janela e centrado na margem que sobra fora do conteúdo. Sobe para 300×600
 * quando há margem; quando nem o 160×600 cabe e a tela aceita, o conteúdo
 * encolhe só o necessário (a raiz ganha `data-ad-squeeze` e `--ad-squeeze`,
 * antes de a tela aparecer, então nada pula). Some quando não cabe.
 */
export function AdRails({ place, prefix }: AdRailsProps) {
  const on = useAdPreview((state) => state.on);
  const [width, height] = useViewport();
  const layout = on ? railLayout(width, height, place) : null;
  const squeeze = layout && layout.content < place.content ? layout.content : null;

  useLayoutEffect(() => {
    if (squeeze === null) return;
    const root = document.documentElement;
    root.setAttribute("data-ad-squeeze", "");
    root.style.setProperty("--ad-squeeze", `${squeeze}px`);
    return () => {
      root.removeAttribute("data-ad-squeeze");
      root.style.removeProperty("--ad-squeeze");
    };
  }, [squeeze]);

  if (!layout) return null;
  return (
    <>
      <Rail side="left" id={`${prefix}-esquerdo`} format={layout.format} content={layout.content} />
      <Rail side="right" id={`${prefix}-direito`} format={layout.format} content={layout.content} />
    </>
  );
}

function Rail({ side, id, format, content }: { side: "left" | "right"; id: string; format: AdSize; content: number }) {
  const style = { "--rail-content": `${content}px` } as CSSProperties;
  return <AdFrame id={id} kind="rail" desktop={format} mobile={null} className="ad-rail" style={style} side={side} anchor="fixed" />;
}
