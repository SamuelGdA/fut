"use client";

/**
 * Dev-only sheet for the generated trophy artwork.
 *
 * Twenty competitions ship without a trophy image; these are what they get
 * instead. Shown at the two sizes the game actually uses — the 16px row in the
 * career table and the larger showcase tile — because a shape that reads at
 * 96px can turn to mush at 16.
 */

import { TROPHY_ART, trophyDataUri, type TrophySpec } from "@craque/art";

const SHAPES: TrophySpec["shape"][] = ["cup", "chalice", "salver", "shield", "bowl", "amphora"];
const METALS: TrophySpec["metal"][] = ["gold", "silver", "bronze"];

export default function TrophySheet() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="font-display text-2xl font-black">Taças geradas</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        As {Object.keys(TROPHY_ART).length} competições que não têm arte própria. Mostradas a 96px e
        a 16px — o tamanho da linha na tabela de carreira.
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          por competição
        </h2>
        <div className="flex flex-wrap gap-5">
          {Object.entries(TROPHY_ART).map(([key, spec]) => (
            <div key={key} className="flex w-[130px] flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={trophyDataUri(spec)} alt={key} className="h-24 w-auto" />
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={trophyDataUri(spec)} alt="" className="h-4 w-auto" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={trophyDataUri(spec)} alt="" className="h-6 w-auto" />
              </div>
              <span className="text-center font-mono text-[9px] leading-tight text-muted-2">
                {key}
                <br />
                {spec.shape} · {spec.metal}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          todas as formas × metais
        </h2>
        <div className="flex flex-wrap gap-5">
          {SHAPES.flatMap((shape) =>
            METALS.map((metal) => (
              <div key={shape + metal} className="flex w-[110px] flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={trophyDataUri({ shape, metal, accent: "#1d3f8f", mark: "AB" })}
                  alt={`${shape} ${metal}`}
                  className="h-24 w-auto"
                />
                <span className="font-mono text-[9px] text-muted-2">
                  {shape} · {metal}
                </span>
              </div>
            )),
          )}
        </div>
      </section>
    </main>
  );
}
