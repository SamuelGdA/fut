import type { Position } from "@craque/engine";
import type { CSSProperties, KeyboardEvent } from "react";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";

/** Onde cada posição fica no gramado, em % (ataque para cima). */
const SPOTS: ReadonlyArray<{ position: Position; x: number; y: number }> = [
  { position: "st", x: 50, y: 15 },
  { position: "lw", x: 18, y: 22 },
  { position: "rw", x: 82, y: 22 },
  { position: "cam", x: 50, y: 34 },
  { position: "lm", x: 14, y: 46 },
  { position: "rm", x: 86, y: 46 },
  { position: "cm", x: 50, y: 50 },
  { position: "cdm", x: 50, y: 63 },
  { position: "lb", x: 16, y: 72 },
  { position: "rb", x: 84, y: 72 },
  { position: "cb", x: 50, y: 77 },
  { position: "gk", x: 50, y: 91 },
];


interface PositionPitchProps {
  value: Position | null;
  onValueChange(position: Position): void;
}

/**
 * Escolha de posição num campo desenhado (GDD 6.2): as 12 posições onde elas
 * jogam. Semântica de grupo de rádio. Embaixo, só o nome da posição marcada.
 */
export function PositionPitch({ value, onValueChange }: PositionPitchProps) {
  const { t, c } = useT();

  const pick = (position: Position) => {
    if (position !== value) feedback("select");
    onValueChange(position);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = SPOTS[(index + step + SPOTS.length) % SPOTS.length];
    if (!next) return;
    pick(next.position);
    const target = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-position="${next.position}"]`);
    target?.focus();
  };


  return (
    <div className="pitch-wrap">
      <div className="pitch" role="radiogroup" aria-label={t("identity.position")}>
        <svg className="pitch-lines" viewBox="0 0 68 96" preserveAspectRatio="none" aria-hidden="true">
          <rect x="2" y="2" width="64" height="92" />
          <line x1="2" y1="48" x2="66" y2="48" />
          <circle cx="34" cy="48" r="8" />
          <rect x="15" y="2" width="38" height="15" />
          <rect x="25" y="2" width="18" height="5.5" />
          <rect x="15" y="79" width="38" height="15" />
          <rect x="25" y="88.5" width="18" height="5.5" />
          <path d="M 27.5 17 A 8 8 0 0 0 40.5 17" />
          <path d="M 27.5 79 A 8 8 0 0 1 40.5 79" />
        </svg>
        {SPOTS.map((spot, index) => {
          const checked = spot.position === value;
          return (
            <button
              key={spot.position}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={c(`positions.${spot.position}`)}
              tabIndex={checked || (value === null && index === 0) ? 0 : -1}
              data-position={spot.position}
              data-checked={checked || undefined}
              className="pitch-spot"
              style={{ "--x": `${spot.x}%`, "--y": `${spot.y}%` } as CSSProperties}
              onClick={() => pick(spot.position)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              {c(`positionAbbr.${spot.position}`)}
            </button>
          );
        })}
      </div>

      <p className="pitch-caption" aria-live="polite">
        {value ? <span className="display text-xl font-extrabold uppercase">{c(`positions.${value}`)}</span> : <span className="text-sm text-muted">{t("identity.positionHint")}</span>}
      </p>
    </div>
  );
}
