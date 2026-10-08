import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Valor de partida. */
  from?: number;
  to: number;
  /** Milissegundos. */
  duration?: number;
  /** Espera antes de começar, em milissegundos. */
  delay?: number;
  /** Quando falso, mostra o valor final na hora (o jogador pulou a animação). */
  play?: boolean;
  format?(value: number): string;
  className?: string;
}

/** Desaceleração cúbica: rápido no começo, assentando no valor final. */
function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

/**
 * Número que conta até o valor final (GDD 22, passo 3). Com movimento
 * reduzido, ou quando o jogador pula, o valor final aparece na hora. O leitor
 * de tela ouve só o valor final.
 */
export function CountUp({ from = 0, to, duration = 900, delay = 0, play = true, format, className }: CountUpProps) {
  const reduced = useReducedMotion();
  const animate = play && !reduced && from !== to;
  // Progresso de 0 a 1, mexido só dentro do quadro de animação. Para recomeçar
  // a contagem, quem usa troca a `key`.
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!animate) return;
    let start = 0;
    const tick = (now: number) => {
      if (start === 0) start = now + delay;
      const elapsed = now - start;
      const next = elapsed <= 0 ? 0 : Math.min(1, elapsed / duration);
      setProgress(next);
      if (next < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [animate, duration, delay]);

  const value = animate ? from + (to - from) * easeOut(progress) : to;
  const shown = Math.round(value);
  const text = format ? format(shown) : String(shown);
  const final = format ? format(to) : String(to);
  return (
    <span className={className} data-count={text === final ? "done" : "counting"}>
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{final}</span>
    </span>
  );
}
