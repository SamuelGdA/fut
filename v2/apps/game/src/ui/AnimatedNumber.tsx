import { useState } from "react";
import { cn } from "./cn";
import { CountUp } from "./CountUp";

interface AnimatedNumberProps {
  value: number;
  format?(value: number): string;
  /** Mostra a variação (▲ +2) por um instante quando o número muda. */
  showDelta?: boolean;
  className?: string;
}

interface Shown {
  readonly value: number;
  readonly from: number;
  /** Sobe a cada mudança: recomeça a contagem e a animação da variação. */
  readonly version: number;
}

/**
 * Número que sobe ou desce contando quando o valor muda (D43): o OVR do
 * placar, os atributos da carta, os totais do jogador. Na primeira pintura
 * aparece pronto; depois, cada mudança conta do valor antigo ao novo, pisca na
 * cor do sentido (verde subindo, vermelho caindo) e mostra a variação por um
 * instante. O leitor de tela ouve só o valor final. Com movimento reduzido, o
 * valor troca na hora.
 */
export function AnimatedNumber({ value, format, showDelta = true, className }: AnimatedNumberProps) {
  const [shown, setShown] = useState<Shown>({ value, from: value, version: 0 });
  // Estado derivado da prop, guardado durante a pintura (o padrão do React para
  // "valor anterior"): sem efeito, sem pintura extra com o número velho.
  if (shown.value !== value) setShown({ value, from: shown.value, version: shown.version + 1 });
  const delta = shown.version === 0 ? 0 : shown.value - shown.from;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : undefined;
  return (
    <span className={cn("anum", className)} data-change={direction} key={shown.version}>
      <CountUp from={shown.from} to={shown.value} play={shown.version > 0} duration={900} format={format} />
      {showDelta && direction ? (
        <span className="anum-delta numeric" aria-hidden="true">
          {direction === "up" ? "▲" : "▼"}
          {format ? "" : Math.abs(delta)}
        </span>
      ) : null}
    </span>
  );
}
