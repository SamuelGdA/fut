import { Bars } from "./Button";
import { cn } from "./cn";

interface LoadingProps {
  label: string;
  /** Altura mínima da área, para a tela não pular quando o conteúdo chegar. */
  className?: string;
}

/**
 * Aviso de carregamento que só aparece se a espera passar de um instante
 * (D43): a tela que chega rápido (quase todas, com as telas pré-carregadas)
 * nunca pisca "Carregando". O atraso é só de CSS, sem relógio no JavaScript;
 * o leitor de tela ouve o aviso na hora.
 */
export function Loading({ label, className }: LoadingProps) {
  return (
    <div role="status" className={cn("loading-delayed grid place-items-center text-muted", className ?? "min-h-[60dvh]")}>
      <span className="flex items-center gap-3">
        <Bars />
        <span className="eyebrow">{label}</span>
      </span>
    </div>
  );
}
