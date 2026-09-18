"use client";

/**
 * Reference sheet for the club identity system.
 *
 * Not part of the game — it exists so the whole set can be judged as a set:
 * at the sizes the game actually renders them, on both the dark chrome and a
 * light surface, with the derived ones flagged. Adding a club? Open this,
 * check it does not collide with its league-mates, and move on.
 */

import { useMemo, useState } from "react";
import { LEAGUES } from "@craque/data";
import { getCrestSpec, isCuratedCrest, teamCrestUrl } from "@craque/art";

const SIZES = [16, 20, 28, 44, 72] as const;

/**
 * Club ids that are deliberately not in clubs.ts, standing in for whatever
 * gets added to the dataset next. They prove the fallback puts an unknown side
 * inside the same visual system instead of leaving a hole.
 */
const FUTURE_CLUBS = [
  "sporting-cp",
  "fc-porto",
  "ajax",
  "galatasaray",
  "shakhtar-donetsk",
  "urawa-red-diamonds",
  "mamelodi-sundowns",
  "al-hilal",
];

export default function CrestGallery() {
  const [size, setSize] = useState<number>(44);
  const [light, setLight] = useState(false);
  const [query, setQuery] = useState("");

  const leagues = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEAGUES.map((league) => ({
      league,
      teams: league.teams.filter(
        (t) => !q || t.name.toLowerCase().includes(q) || t.id.includes(q) || league.name.toLowerCase().includes(q),
      ),
    })).filter((entry) => entry.teams.length > 0);
  }, [query]);

  const total = LEAGUES.reduce((sum, l) => sum + l.teams.length, 0);
  const derived = LEAGUES.flatMap((l) => l.teams).filter((t) => !isCuratedCrest(t.id)).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-black">Identidades circulares</h1>
        <p className="mt-1 text-sm text-muted">
          {total} clubes · {total - derived} desenhados à mão · {derived} derivados automaticamente
        </p>
      </header>

      <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center gap-3 border-b border-line bg-background/95 py-3 backdrop-blur">
        <div className="flex items-center gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                size === s ? "bg-foreground text-background" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLight((v) => !v)}
          className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted hover:text-foreground"
        >
          {light ? "fundo claro" : "fundo escuro"}
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filtrar clube ou liga…"
          className="min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-3 py-1.5 text-xs outline-none placeholder:text-muted-2 focus:border-pitch"
        />
      </div>

      {leagues.map(({ league, teams }) => (
        <section key={league.id} className="mb-10">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted-2">
            {league.name} · {league.country_fifa_code}
          </h2>
          <div
            className={`grid gap-4 rounded-xl p-4 ${light ? "bg-white" : "bg-surface-2/40"}`}
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(96, size + 60)}px, 1fr))` }}
          >
            {teams.map((team) => {
              const spec = getCrestSpec(team.id);
              return (
                <figure key={team.id} className="flex flex-col items-center gap-1.5 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={teamCrestUrl(team.id)}
                    alt={team.name}
                    width={size}
                    height={size}
                    style={{ width: size, height: size }}
                  />
                  <figcaption
                    className={`text-[10px] leading-tight ${light ? "text-neutral-600" : "text-muted"}`}
                  >
                    <span className="block font-semibold">{team.short_name || team.name}</span>
                    <span className={light ? "text-neutral-400" : "text-muted-2"}>
                      {spec.field}
                      {spec.n ? `·${spec.n}` : ""} / {spec.device}
                    </span>
                    {!isCuratedCrest(team.id) && (
                      <span className="mt-0.5 block font-bold text-amber-500">derivado</span>
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      ))}

      {!query && (
        <section className="mb-10">
          <h2 className="mb-1 font-display text-sm font-bold uppercase tracking-wide text-muted-2">
            Clubes futuros · derivação automática
          </h2>
          <p className="mb-3 max-w-2xl text-xs text-muted">
            Ids que não existem em <code>clubs.ts</code>. Um clube novo no dataset entra no mesmo
            sistema sozinho — cor, campo e símbolo saem do id e das cores dele, sempre iguais entre
            sessões. Depois é só escrever a linha à mão para assumir o lugar.
          </p>
          <div
            className={`grid gap-4 rounded-xl p-4 ${light ? "bg-white" : "bg-surface-2/40"}`}
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(96, size + 60)}px, 1fr))` }}
          >
            {FUTURE_CLUBS.map((id) => {
              const spec = getCrestSpec(id);
              return (
                <figure key={id} className="flex flex-col items-center gap-1.5 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={teamCrestUrl(id)} alt={id} style={{ width: size, height: size }} />
                  <figcaption className={`text-[10px] leading-tight ${light ? "text-neutral-600" : "text-muted"}`}>
                    <span className="block font-semibold">{id}</span>
                    <span className={light ? "text-neutral-400" : "text-muted-2"}>
                      {spec.field}
                      {spec.n ? `·${spec.n}` : ""} / {spec.device}
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
