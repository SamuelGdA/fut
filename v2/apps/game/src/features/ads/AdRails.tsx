import { type CSSProperties, useSyncExternalStore } from "react";
import { AdFrame } from "./AdFrame";
import { useAdPreview } from "./preview";
import { type AdSize, railFormat } from "./slots";

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
  /** Largura do conteúdo mais largo da tela: o trilho mora fora dela. */
  content: number;
  /** Altura ocupada acima do trilho (barra do topo e o que mais houver). */
  top: number;
  /** Barra fixa da própria tela abaixo do topo (a dos capítulos do resumo). */
  below?: number;
  /** Prefixo dos IDs: `trilho` nas telas comuns, `carreira-trilho` no jogo. */
  prefix: "trilho" | "carreira-trilho";
  /**
   * `fixed`: presos à janela (telas comuns, não empurram nada). `contained`:
   * dentro do corpo da carreira, que não rola (D118).
   */
  anchor: "fixed" | "contained";
}

/**
 * Os trilhos laterais do PC (D134): um arranha-céu de cada lado, centrado na
 * margem que sobra fora do conteúdo. Sobe para 300×600 quando há margem e
 * some quando nem o 160×600 cabe com folga, então nunca espremem o jogo.
 */
export function AdRails({ content, top, below = 0, prefix, anchor }: AdRailsProps) {
  const on = useAdPreview((state) => state.on);
  const [width, height] = useViewport();
  if (!on) return null;
  const format = railFormat(width, height, content, top + below);
  if (!format) return null;
  return (
    <>
      <Rail side="left" id={`${prefix}-esquerdo`} format={format} content={content} below={below} anchor={anchor} />
      <Rail side="right" id={`${prefix}-direito`} format={format} content={content} below={below} anchor={anchor} />
    </>
  );
}

function Rail({ side, id, format, content, below, anchor }: { side: "left" | "right"; id: string; format: AdSize; content: number; below: number; anchor: AdRailsProps["anchor"] }) {
  const style = { "--rail-content": `${content}px`, "--rail-below": `${below}px` } as CSSProperties;
  return <AdFrame id={id} kind="rail" desktop={format} mobile={null} className="ad-rail" style={style} side={side} anchor={anchor} />;
}
