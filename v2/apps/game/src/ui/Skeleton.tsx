import type { CSSProperties } from "react";
import { cn } from "./cn";

/**
 * Esqueleto de carregamento (D112): a forma do conteúdo que vem do servidor,
 * com um brilho que passa devagar (parado com movimento reduzido). Só
 * desenho: quem envolve diz ao leitor de tela que está carregando.
 */
export function Skeleton({ className, style, round = false }: { className?: string; style?: CSSProperties; round?: boolean }) {
  return <span aria-hidden="true" className={cn("skeleton", round && "rounded-full", className)} style={style} />;
}
