import { cva, type VariantProps } from "class-variance-authority";

/**
 * Botões com a tipografia de placar. Cantos pequenos, cor chapada, e um
 * afundar de 1 px no toque em vez de brilho.
 */
export const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-sm font-display font-extrabold uppercase tracking-wide leading-none",
    "transition-[background-color,color,border-color,transform,opacity] duration-150 ease-out",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent/88",
        secondary: "border border-rule bg-transparent text-fg hover:border-muted hover:bg-panel-2",
        ghost: "bg-transparent text-muted hover:bg-panel-2 hover:text-fg",
        danger: "border border-bad/60 bg-transparent text-bad hover:bg-bad hover:text-white",
        /** Vermelho cheio: a ação que precisa chamar a atenção (Jogar de novo). */
        alert: "bg-alert text-white hover:bg-alert/88",
        glory: "bg-glory text-canvas hover:bg-glory/88",
        club: "bg-club text-on-club hover:bg-club/88",
      },
      size: {
        sm: "h-9 px-3 text-base",
        md: "h-11 px-5 text-lg",
        lg: "h-13 px-6 text-xl",
        icon: "size-11 p-0",
        iconSm: "size-9 p-0",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      block: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
