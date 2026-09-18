"use client";

/**
 * Dev-only contact sheet for the player card.
 *
 * Every rarity band at both ends of its range, at every size, so a change to
 * the plate can be judged against the whole set at once rather than by
 * replaying careers until the right rating turns up.
 */

import { PlayerFcCard } from "@/components/PlayerFcCard";
import { cardTier, tierProgress } from "@craque/art";
import { createStartingAttributes } from "@/lib/sim/attributes";
import { getCountryByIso } from "@craque/data";
import type { PositionCode } from "@/lib/sim/constants";

const RATINGS = [45, 64, 65, 74, 75, 84, 93, 94, 96, 99];
const SIZES = ["xs", "sm", "md", "lg"] as const;

export default function CardSheet() {
  const country = getCountryByIso("BR")!;
  const position: PositionCode = "ST";

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="font-display text-2xl font-black">Cartas — todas as faixas</h1>
      <p className="mt-1 text-sm text-muted">
        Bronze 0–64 · Prata 65–74 · Ouro 75–93 · Branca (ICON) 94–99. O brilho sobe conforme a
        carta chega ao topo da própria faixa.
      </p>

      {SIZES.map((size) => (
        <section key={size} className="mt-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
            size = {size}
          </h2>
          <div className="flex flex-wrap items-start gap-4">
            {RATINGS.map((ovr) => (
              <div key={ovr} className="flex flex-col items-center gap-1">
                <PlayerFcCard
                  size={size}
                  data={{
                    overall: ovr,
                    position,
                    attributes: createStartingAttributes(position, ovr),
                    lastName: "SILVA",
                    number: 10,
                    country,
                    teamId: "flamengo",
                    avatar: null,
                  }}
                />
                <span className="font-mono text-[10px] text-muted-2">
                  {ovr} · {cardTier(ovr)} · {Math.round(tierProgress(ovr) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* A stretching flex row: the exact context that used to make the card
          grow taller than 7:10. All of these must stay the same shape. */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-2">
          dentro de um flex com items-stretch (regressão de tamanho)
        </h2>
        <div className="flex items-stretch gap-4" style={{ height: 420 }}>
          <div className="flex justify-center">
            <PlayerFcCard
              size="sm"
              data={{
                overall: 82,
                position,
                attributes: createStartingAttributes(position, 82),
                lastName: "SILVA",
                number: 9,
                country,
                teamId: "santos",
                avatar: null,
              }}
            />
          </div>
          <div className="flex-1 rounded-xl border border-line" />
        </div>
      </section>
    </main>
  );
}
