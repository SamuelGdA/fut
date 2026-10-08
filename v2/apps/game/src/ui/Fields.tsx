import { Slider } from "@base-ui/react/slider";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { type ReactNode, useId } from "react";
import { cn } from "./cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange(checked: boolean): void;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Interruptor com rótulo clicável. O nome acessível vem só do rótulo e a
 * descrição entra como descrição, para o leitor de tela não repetir texto.
 */
export function Switch({ checked, onCheckedChange, label, description, disabled, className }: SwitchProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  return (
    <div className={cn("flex min-h-11 items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={cn("block text-sm font-semibold text-fg", disabled ? "cursor-not-allowed" : "cursor-pointer")}
        >
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="mt-0.5 text-xs text-faint">
            {description}
          </p>
        ) : null}
      </div>
      <BaseSwitch.Root
        id={id}
        nativeButton
        render={<button type="button" />}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next)}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
        className="switch"
      >
        <BaseSwitch.Thumb className="switch-thumb" />
      </BaseSwitch.Root>
    </div>
  );
}

interface StepSliderProps {
  value: number;
  min: number;
  max: number;
  label: string;
  /** Texto do valor para leitor de tela ("75%", "Mudo"). */
  valueText: string;
  onValueChange(value: number): void;
  /** Chamado ao soltar: é aí que o "toque" de confirmação toca. */
  onValueCommitted?(value: number): void;
  /** Desbota a barra sem esquecer o nível escolhido. */
  dimmed?: boolean;
}

function firstValue(value: number | readonly number[], fallback: number): number {
  if (typeof value === "number") return value;
  return value[0] ?? fallback;
}

/** Deslizador em passos inteiros, com marcas embaixo de cada passo. */
export function StepSlider({
  value,
  min,
  max,
  label,
  valueText,
  onValueChange,
  onValueCommitted,
  dimmed = false,
}: StepSliderProps) {
  const steps = Math.max(0, max - min) + 1;
  return (
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={1}
      onValueChange={(next) => onValueChange(firstValue(next, min))}
      onValueCommitted={(next) => onValueCommitted?.(firstValue(next, min))}
      className="slider"
      data-muted={dimmed || undefined}
    >
      <Slider.Control className="slider-control">
        <Slider.Track className="slider-track">
          <Slider.Indicator className="slider-indicator" />
          <Slider.Thumb
            className="slider-thumb"
            getAriaLabel={() => label}
            getAriaValueText={() => valueText}
          />
        </Slider.Track>
      </Slider.Control>
      <div className="slider-ticks" aria-hidden="true">
        {Array.from({ length: steps }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </Slider.Root>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onValueChange(value: string): void;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
  error?: string;
  /** Contador à direita do rótulo, já formatado ("7/16"). */
  counter?: string;
  autoFocus?: boolean;
}

/** Campo de texto de uma linha, com dica e erro ligados ao campo. */
export function TextField({
  label,
  value,
  onValueChange,
  maxLength,
  placeholder,
  hint,
  error,
  counter,
  autoFocus,
}: TextFieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ?? hint;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="eyebrow text-fg">
          {label}
        </label>
        {counter ? <span className="numeric text-xs text-faint">{counter}</span> : null}
      </div>
      <input
        id={id}
        className="field-input"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        autoFocus={autoFocus}
        enterKeyHint="done"
      />
      {note ? (
        <p id={noteId} className={cn("mt-1.5 text-xs", error ? "text-bad" : "text-faint")}>
          {note}
        </p>
      ) : null}
    </div>
  );
}
