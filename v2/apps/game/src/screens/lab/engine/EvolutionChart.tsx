import type { DevelopmentSeason } from "@craque/engine";
import type { PointerEvent } from "react";
import type { PopulationBand } from "./population";

/**
 * Curva de OVR dos 16 aos 39 anos contra a faixa de jogadores parecidos.
 *
 * As linhas são um SVG esticado (cada unidade é 1% da área), com traço que
 * não escala; rótulos, marcas e o ponto escolhido são HTML por cima. Assim o
 * gráfico fica nítido de 320 px ao desktop sem medir nada.
 */

const FIRST_AGE = 16;
const LAST_AGE = 39;
const OVR_TOP = 99;
const OVR_BOTTOM = 40;
const GRID = [50, 60, 70, 80, 90] as const;
const AGE_TICKS = [16, 20, 24, 28, 32, 36, 39] as const;

const xOf = (age: number) => ((age - FIRST_AGE) / (LAST_AGE - FIRST_AGE)) * 100;
const yOf = (ovr: number) =>
  ((OVR_TOP - Math.min(OVR_TOP, Math.max(OVR_BOTTOM, ovr))) / (OVR_TOP - OVR_BOTTOM)) * 100;

function points(values: readonly number[]): string {
  return values.map((value, index) => `${xOf(FIRST_AGE + index)},${yOf(value)}`).join(" ");
}

interface EvolutionChartProps {
  seasons: readonly DevelopmentSeason[];
  band: PopulationBand;
  selectedAge: number;
  onSelectAge(age: number): void;
  /** Descrição completa da curva para leitor de tela. */
  label: string;
  legend: { player: string; band: string; median: string };
}

export function EvolutionChart({ seasons, band, selectedAge, onSelectAge, label, legend }: EvolutionChartProps) {
  const ovr = seasons.map((season) => season.ovr);
  const area = `${points(band.p90)} ${[...band.p10]
    .map((value, index) => ({ value, index }))
    .reverse()
    .map(({ value, index }) => `${xOf(FIRST_AGE + index)},${yOf(value)}`)
    .join(" ")}`;
  const selected = seasons.find((season) => season.age === selectedAge);

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const age = Math.round(FIRST_AGE + ratio * (LAST_AGE - FIRST_AGE));
    if (age !== selectedAge) onSelectAge(age);
  };

  return (
    <figure className="evo-chart">
      <div className="evo-frame">
        <div className="evo-axis-y" aria-hidden="true">
          {GRID.map((value) => (
            <span key={value} style={{ top: `${yOf(value)}%` }}>
              {value}
            </span>
          ))}
        </div>

        <div
          className="evo-plot"
          role="img"
          aria-label={label}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            pick(event);
          }}
          onPointerMove={(event) => {
            if (event.buttons > 0) pick(event);
          }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {GRID.map((value) => (
              <line key={value} x1="0" x2="100" y1={yOf(value)} y2={yOf(value)} className="evo-grid" />
            ))}
            <polygon points={area} className="evo-band" />
            <polyline points={points(band.p50)} className="evo-median" />
            <line x1={xOf(selectedAge)} x2={xOf(selectedAge)} y1="0" y2="100" className="evo-cursor" />
            <polyline points={points(ovr)} className="evo-line" />
          </svg>

          {seasons.map((season) =>
            season.form === "normal" ? null : (
              <span
                key={season.age}
                aria-hidden="true"
                data-tone={season.form === "explosion" ? "good" : "bad"}
                className="evo-mark text-tone"
                data-form={season.form}
                style={{ left: `${xOf(season.age)}%`, top: `${yOf(season.ovr)}%` }}
              >
                {season.form === "explosion" ? "▲" : "▼"}
              </span>
            ),
          )}

          {selected ? (
            <span
              aria-hidden="true"
              className="evo-dot"
              style={{ left: `${xOf(selected.age)}%`, top: `${yOf(selected.ovr)}%` }}
            />
          ) : null}
        </div>

        <div className="evo-axis-x" aria-hidden="true">
          {AGE_TICKS.map((age) => (
            <span key={age} style={{ left: `${xOf(age)}%` }}>
              {age}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <i aria-hidden="true" className="evo-key evo-key-line" />
          {legend.player}
        </span>
        <span className="inline-flex items-center gap-2">
          <i aria-hidden="true" className="evo-key evo-key-band" />
          {legend.band}
        </span>
        <span className="inline-flex items-center gap-2">
          <i aria-hidden="true" className="evo-key evo-key-median" />
          {legend.median}
        </span>
      </figcaption>
    </figure>
  );
}
