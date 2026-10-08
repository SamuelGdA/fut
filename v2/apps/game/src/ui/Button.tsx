import type { ComponentProps, ReactNode } from "react";
import { type ButtonVariantProps, buttonVariants } from "./button-variants";
import { cn } from "./cn";

export type ButtonProps = ComponentProps<"button"> &
  ButtonVariantProps & {
    /** Mostra o carregador de barras e bloqueia o botão. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Bars /> : null}
      {children}
    </button>
  );
}

export type IconButtonProps = Omit<ButtonProps, "children" | "size"> & {
  /** Rótulo acessível e dica nativa. Ícone sem texto sempre tem nome. */
  label: string;
  size?: "icon" | "iconSm";
  children: ReactNode;
};

export function IconButton({
  label,
  size = "icon",
  variant = "ghost",
  children,
  ...rest
}: IconButtonProps) {
  return (
    <Button aria-label={label} title={label} size={size} variant={variant} {...rest}>
      {children}
    </Button>
  );
}

/** Três barras de placar subindo e descendo. */
export function Bars() {
  return (
    <span className="bars" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
