import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { m } from "motion/react";
import { type ReactNode, useId } from "react";
import { cn } from "./cn";
import type { Tone } from "./tone";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Nome acessível quando o rótulo é curto demais ("PT") ou só ícone. */
  ariaLabel?: string;
  /** Cor da opção quando marcada, por exemplo vermelho para "Difícil". */
  tone?: Tone | "club";
}

interface SegmentedProps<T extends string> {
  value: T;
  onValueChange(value: T): void;
  options: readonly SegmentedOption<T>[];
  /** Rótulo do grupo para leitor de tela. */
  label: string;
  /** Ocupa a largura inteira, com opções de mesmo tamanho. */
  block?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Escolha única entre poucas opções, com semântica de grupo de rádio (setas
 * do teclado navegam) e um marcador que desliza para a opção ativa.
 */
export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  label,
  block = false,
  size = "md",
  className,
}: SegmentedProps<T>) {
  const layoutId = useId();

  const handleChange = (next: unknown) => {
    const match = options.find((option) => option.value === next);
    if (match && match.value !== value) onValueChange(match.value);
  };

  return (
    <RadioGroup
      value={value}
      onValueChange={handleChange}
      aria-label={label}
      className={cn("seg", className)}
      data-block={block || undefined}
      data-size={size}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <Radio.Root
            key={option.value}
            value={option.value}
            aria-label={option.ariaLabel}
            className="seg-item"
            data-tone={option.tone}
          >
            {checked ? (
              <m.span
                layoutId={`seg-${layoutId}`}
                className="seg-thumb"
                transition={{ type: "spring", stiffness: 520, damping: 42 }}
              />
            ) : null}
            <span className="seg-label">{option.label}</span>
          </Radio.Root>
        );
      })}
    </RadioGroup>
  );
}
