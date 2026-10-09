import type { ReactNode } from "react";
import { cn } from "./cn";
import { InfoTip } from "./InfoTip";
import { Delta } from "./Signals";
import { TONE_GLYPH, type Tone } from "./tone";

interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Variação desde a última temporada. */
  delta?: number;
  /** Explicação em linguagem simples (GDD 36: número nu sempre explicado). */
  hint?: string;
  className?: string;
}

/** Um número grande com rótulo, no estilo de grafismo de transmissão. */
export function StatTile({ label, value, delta, hint, className }: StatTileProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-sm border border-line bg-panel-2 px-3 py-2.5", className)}>
      <div className="flex min-w-0 items-center justify-between gap-1">
        {/* Altura de linha maior que a do eyebrow: o truncate cortava o til e o acento das maiúsculas. */}
        <span className="eyebrow truncate py-0.5 leading-[1.3]">{label}</span>
        {hint ? <InfoTip label={label}>{hint}</InfoTip> : null}
      </div>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="display numeric text-3xl font-extrabold whitespace-nowrap text-fg sm:text-4xl">{value}</span>
        {delta !== undefined && delta !== 0 ? <Delta value={delta} /> : null}
      </div>
    </div>
  );
}

interface MeterProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  /** Faixa em palavras ao lado do rótulo ("Querido"). */
  band?: string;
  /** Texto completo para leitor de tela. Padrão: "valor de máximo". */
  valueText?: string;
  tone?: Tone | "club";
  /** Barra em gomos, como a de fôlego de um jogo de futebol. */
  segments?: boolean;
  /** Mostra o número à direita da barra. */
  showValue?: boolean;
  className?: string;
}

/** Medidor de 0 a 100 com papel de medidor acessível (GDD 36). */
export function Meter({
  label,
  value,
  min = 0,
  max = 100,
  band,
  valueText,
  tone = "good",
  segments = false,
  showValue = false,
  className,
}: MeterProps) {
  const span = max - min;
  const ratio = span > 0 ? Math.min(1, Math.max(0, (value - min) / span)) : 0;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText ?? (band ? `${value}, ${band}` : `${value}`)}
      data-tone={tone}
      className={className}
    >
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="eyebrow">{label}</span>
        <span className="flex items-baseline gap-2">
          {band ? <span className="text-tone text-sm font-semibold">{band}</span> : null}
          {showValue ? <span className="numeric text-sm font-bold text-fg">{value}</span> : null}
        </span>
      </div>
      <div className="meter-track" data-segments={segments || undefined}>
        <div className="meter-fill" style={{ transform: `scaleX(${ratio})` }} />
      </div>
    </div>
  );
}

interface AttributeBarProps {
  abbr: string;
  name: string;
  value: number;
}

/** Linha de atributo: sigla, barra e número. A barra é o próprio valor em %. */
export function AttributeBar({ abbr, name, value }: AttributeBarProps) {
  const ratio = Math.min(1, Math.max(0, value / 99));
  return (
    <div className="grid grid-cols-[2.75rem_1fr_2rem] items-center gap-3">
      <span className="eyebrow text-fg">
        <abbr title={name} className="no-underline">
          {abbr}
        </abbr>
      </span>
      <div className="meter-track" aria-hidden="true">
        <div className="meter-fill" data-tone="good" style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <span className="display numeric text-right text-xl font-extrabold">
        <span className="sr-only">{name}: </span>
        {value}
      </span>
    </div>
  );
}

interface OddsBarProps {
  /** Chance de dar certo, de 0 a 1. */
  success: number;
  goodLabel: string;
  badLabel: string;
  formatPercent(ratio: number): string;
}

/** Barra de chance de uma escolha arriscada: ▲ dá certo, ▼ dá errado. */
export function OddsBar({ success, goodLabel, badLabel, formatPercent }: OddsBarProps) {
  const good = Math.min(1, Math.max(0, success));
  const bad = 1 - good;
  return (
    <div>
      <div className="odds" aria-hidden="true">
        <span data-tone="good" style={{ flexBasis: `${good * 100}%` }} />
        <span data-tone="bad" style={{ flexBasis: `${bad * 100}%` }} />
      </div>
      <div className="numeric mt-1.5 flex justify-between gap-3 text-xs font-semibold">
        <span data-tone="good" className="text-tone">
          <span aria-hidden="true">{TONE_GLYPH.good} </span>
          {goodLabel} {formatPercent(good)}
        </span>
        <span data-tone="bad" className="text-tone text-right">
          <span aria-hidden="true">{TONE_GLYPH.bad} </span>
          {badLabel} {formatPercent(bad)}
        </span>
      </div>
    </div>
  );
}
