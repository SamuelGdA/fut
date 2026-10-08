import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";
import { cn } from "../../ui/cn";

export interface ChoiceOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Imagem antes do rótulo: bandeira, escudo. */
  icon?: ReactNode;
  /** Nome completo para leitor de tela quando o rótulo é uma sigla. */
  ariaLabel?: string;
}

interface ChoiceStripProps<T extends string> {
  value: T;
  onValueChange(value: T): void;
  options: readonly ChoiceOption<T>[];
  label: string;
  className?: string;
}

/**
 * Escolha única entre muitas opções (países, confederações, camisas). As
 * pílulas quebram linha em vez de rolar para o lado, então nenhuma opção fica
 * escondida fora da tela. Semântica de grupo de rádio: setas navegam.
 */
export function ChoiceStrip<T extends string>({
  value,
  onValueChange,
  options,
  label,
  className,
}: ChoiceStripProps<T>) {
  const handleChange = (next: unknown) => {
    const match = options.find((option) => option.value === next);
    if (match && match.value !== value) onValueChange(match.value);
  };

  return (
    <RadioGroup
      value={value}
      onValueChange={handleChange}
      aria-label={label}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {options.map((option) => (
        <Radio.Root key={option.value} value={option.value} aria-label={option.ariaLabel} className="pick-chip">
          {option.icon}
          <span className="truncate">{option.label}</span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
