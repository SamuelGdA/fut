"use client";

/**
 * Dev-only contact sheet for league badges.
 *
 * Every league at the three sizes that exist: ten pixels beside a club crest in
 * a transfer offer, fourteen in the taper of the player card, and large enough
 * to actually see. A badge that reads at 96px and turns to mush at 10 is no use,
 * and 10 is where it mostly lives.
 *
 * The generated badge is shown for every league, including the twenty-four that
 * ship real artwork, so the family can be judged as a whole rather than only
 * where it happens to be used.
 */

import { useState } from "react";
import { LEAGUES } from "@/lib/data/dataset";
import { generatedLeagueBadge, leagueLogoUrl } from "@/lib/leagueBadges";
import { ClubCrest } from "@/components/Media";

const SIZES = [10, 14, 28, 96];

export default function LeagueBadgeSheet() {
  const [light, setLight] = useState(false);
  const generatedOnly = LEAGUES.filter((l) => !l.logo_url);

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="font-display text-2xl font-black">Escudos de liga</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        {LEAGUES.length} ligas, {generatedOnly.length} sem arte própria. Os tamanhos são os que o
        jogo usa de verdade: 10px na oferta de transferência, 14px na carta.
      </p>

      <button
        type="button"
        onClick={() => setLight((v) => !v)}
        className="mt-4 rounded-full border border-line px-4 py-1.5 text-xs font-bold text-muted"
      >
        fundo {light ? "claro" : "escuro"}
      </button>

      <section className={`mt-6 rounded-xl p-5 ${light ? "bg-[#eef1f6]" : "bg-[#0d1420]"}`}>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          sem arte própria — o que o jogo mostra
        </h2>
        <div className="flex flex-col gap-3">
          {generatedOnly.map((league) => (
            <div key={league.id} className="flex items-center gap-4">
              {SIZES.map((size) => (
                <span key={size} className="shrink-0" style={{ width: size, height: size }}>
                  <ClubCrest
                    src={leagueLogoUrl(league)}
                    name={league.name}
                    size={size}
                    className="h-full w-full"
                  />
                </span>
              ))}
              <span className={`font-mono text-[11px] ${light ? "text-[#4b5567]" : "text-muted-2"}`}>
                {league.name} · {league.country_fifa_code} · t{league.tier}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={`mt-6 rounded-xl p-5 ${light ? "bg-[#eef1f6]" : "bg-[#0d1420]"}`}>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          todas as ligas — arte enviada à esquerda, gerada à direita
        </h2>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {LEAGUES.map((league) => (
            <div key={league.id} className="flex items-center gap-3">
              <span className="h-7 w-7 shrink-0">
                <ClubCrest
                  src={league.logo_url}
                  name={league.name}
                  size={28}
                  className="h-full w-full"
                />
              </span>
              <span className="text-muted-2">→</span>
              <span className="h-7 w-7 shrink-0">
                <ClubCrest
                  src={generatedLeagueBadge(league)}
                  name={league.name}
                  size={28}
                  className="h-full w-full"
                />
              </span>
              <span className={`truncate font-mono text-[11px] ${light ? "text-[#4b5567]" : "text-muted-2"}`}>
                {league.name} · {league.country_fifa_code} · t{league.tier}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
