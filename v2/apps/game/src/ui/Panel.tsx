import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

interface SectionRuleProps {
  children: ReactNode;
  /** Algo à direita da régua: um contador, um link. */
  aside?: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "p";
}

/**
 * Rótulo de seção seguido de régua, como numa página de jornal esportivo.
 * Em tela estreita, o que fica à direita desce para a linha de baixo em vez
 * de empurrar a página para o lado.
 */
export function SectionRule({ children, aside, className, as: Tag = "h3" }: SectionRuleProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <Tag className="eyebrow min-w-0 text-fg">{children}</Tag>
      <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-rule" />
      {aside ? <div className="max-w-full min-w-0">{aside}</div> : null}
    </div>
  );
}

type PanelProps = ComponentProps<"section"> & {
  title?: ReactNode;
  aside?: ReactNode;
  /** Sem preenchimento interno, para conteúdo que vai de borda a borda. */
  flush?: boolean;
};

/** Superfície base: cor chapada, filete de 1 px, canto pequeno. */
export function Panel({ title, aside, flush = false, className, children, ...rest }: PanelProps) {
  return (
    <section className={cn("rounded-md border border-line bg-panel", !flush && "p-4 sm:p-5", className)} {...rest}>
      {title ? (
        <SectionRule aside={aside} className={cn("mb-4", flush && "px-4 pt-4 sm:px-5 sm:pt-5")}>
          {title}
        </SectionRule>
      ) : null}
      {children}
    </section>
  );
}
