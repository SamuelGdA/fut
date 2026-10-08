import type { ReactNode } from "react";
import { cn } from "./cn";
import { signed, TONE_GLYPH, type Tone } from "./tone";

interface GlyphProps {
  tone: Tone;
  /** Texto para leitor de tela. Sem ele, o glifo é decorativo. */
  label?: string;
  className?: string;
}

/** ▲ ▼ ● ★ ◆ na cor do tom. */
export function Glyph({ tone, label, className }: GlyphProps) {
  return (
    <>
      <span
        data-tone={tone}
        aria-hidden="true"
        className={cn("text-tone inline-block leading-none", className)}
      >
        {TONE_GLYPH[tone]}
      </span>
      {label ? <span className="sr-only">{label}</span> : null}
    </>
  );
}

type ChipVariant = "soft" | "solid" | "outline";

interface ChipProps {
  tone?: Tone | "club";
  variant?: ChipVariant;
  /** Mostra o glifo do tom antes do texto. */
  glyph?: boolean;
  /** `sm`: a pílula das linhas compactas (opções de decisão). */
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
}

const CHIP_VARIANT: Readonly<Record<ChipVariant, string>> = {
  soft: "chip-soft",
  solid: "chip-solid",
  outline: "chip-outline",
};

/** Pílula curta de estado: papel no elenco, pressão, variação de atributo. */
export function Chip({ tone = "neutral", variant = "soft", glyph = false, size = "md", className, children }: ChipProps) {
  const mark = glyph && tone !== "club" ? TONE_GLYPH[tone] : null;
  return (
    <span
      data-tone={tone}
      className={cn(
        "numeric inline-flex items-center gap-1 rounded-xs leading-[1.15] font-bold uppercase",
        size === "sm" ? "min-h-5 px-1.5 py-0.5 text-[10px] tracking-wide" : "min-h-6 px-2 py-1 text-2xs tracking-wider",
        CHIP_VARIANT[variant],
        className,
      )}
    >
      {mark ? <span aria-hidden="true">{mark}</span> : null}
      {children}
    </span>
  );
}

interface DeltaProps {
  value: number;
  /** Texto após o número, como a sigla do atributo. */
  suffix?: string;
  className?: string;
}

/** Variação com glifo e sinal: "▲ +2 FIN", "▼ −1". */
export function Delta({ value, suffix, className }: DeltaProps) {
  const tone: Tone = value > 0 ? "good" : value < 0 ? "bad" : "neutral";
  return (
    <span
      data-tone={tone}
      className={cn("text-tone numeric inline-flex items-center gap-1 text-sm font-bold", className)}
    >
      <span aria-hidden="true" className="text-2xs">
        {TONE_GLYPH[tone]}
      </span>
      {signed(value)}
      {suffix ? <span className="font-semibold">{suffix}</span> : null}
    </span>
  );
}
