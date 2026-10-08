import { useReducedMotion } from "motion/react";
import { type CSSProperties, useMemo } from "react";

interface ConfettiProps {
  /** Muda para disparar outra leva. */
  burst: number;
  /** Quantos papéis. */
  count?: number;
  /** Cores da leva: o ouro da glória, a cor do clube, o giz. */
  colors?: readonly string[];
}

const DEFAULT_COLORS = ["var(--glory)", "var(--club, var(--good))", "var(--fg)", "#f6d77a"];

interface Piece {
  readonly id: number;
  readonly style: CSSProperties;
  readonly shape: "strip" | "square" | "dot";
}

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Confete curto, só em título ou prêmio (GDD 33.1). Os papéis saem do alto do
 * centro, abrem para os lados e caem girando. Tudo em CSS (`transform` e
 * `opacity`), sem laço de animação no JavaScript. Com movimento reduzido, não
 * existe.
 */
export function Confetti({ burst, count = 70, colors = DEFAULT_COLORS }: ConfettiProps) {
  const reduced = useReducedMotion();
  const pieces = useMemo<Piece[]>(() => {
    if (burst === 0) return [];
    return Array.from({ length: count }, (_, id) => {
      const spread = random(-1, 1);
      const shapes = ["strip", "square", "dot"] as const;
      return {
        id: burst * 1000 + id,
        shape: shapes[id % shapes.length] ?? "strip",
        style: {
          "--x0": `${spread * 6}vw`,
          "--x1": `${spread * random(28, 52)}vw`,
          "--y1": `${random(-34, -12)}vh`,
          "--x2": `${spread * random(34, 60) + random(-8, 8)}vw`,
          "--r": `${random(-900, 900)}deg`,
          "--dur": `${random(1.7, 2.6)}s`,
          "--delay": `${random(0, 0.25)}s`,
          "--w": `${random(6, 11)}px`,
          background: colors[id % colors.length],
        } as CSSProperties,
      };
    });
  }, [burst, count, colors]);

  if (reduced || pieces.length === 0) return null;
  return (
    <div className="confetti" aria-hidden="true" key={burst}>
      {pieces.map((piece) => (
        <i key={piece.id} data-shape={piece.shape} style={piece.style} />
      ))}
    </div>
  );
}
