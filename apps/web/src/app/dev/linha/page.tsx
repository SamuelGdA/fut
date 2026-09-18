"use client";

/**
 * Dev-only stress sheet for the career timeline.
 *
 * Built from the worst cases the simulation actually produces — the longest
 * club name in the dataset (38 characters) and the most decorated single
 * spell observed across 400 careers (33 honours) — so the layout can be
 * judged against the extremes rather than against whatever a lucky save
 * happens to hand over.
 */

import { CareerTimeline } from "@/components/CareerTimeline";
import { startCareer, type CareerState, type SeasonSnapshot } from "@/lib/sim/career";
import { createStartingAttributes } from "@/lib/sim/attributes";
import { EMPTY_STATS } from "@/lib/sim/constants";
import type { AwardKey, ClubTrophyKey } from "@craque/data";

const CLUB_TROPHIES: ClubTrophyKey[] = [
  "league", "cup", "continental_primary", "domestic_super_cup",
  "league_cup", "continental_secondary", "club_world_cup", "continental_super_cup",
];
const AWARDS: AwardKey[] = ["ballon_dor", "golden_boot"];

function season(
  index: number,
  age: number,
  teamId: string,
  trophies: ClubTrophyKey[],
  awards: AwardKey[],
): SeasonSnapshot {
  return {
    id: `s-${index}`,
    index,
    periodIndex: index,
    age,
    teamId,
    leagueTier: 1,
    onLoan: false,
    overall: 80,
    attributes: createStartingAttributes("ST", 80),
    marketValue: 1_000_000,
    stats: { ...EMPTY_STATS, appearances: 45, goals: 20, assists: 8 },
    trophies,
    awards,
    relegated: false,
    promoted: false,
    suspended: false,
    knock: null,
    shirtNumber: 9,
  };
}

/** A spell of `n` seasons at one club, carrying `honours` trophies in total. */
function spell(startIndex: number, startAge: number, teamId: string, n: number, honours: number) {
  const out: SeasonSnapshot[] = [];
  let left = honours;
  for (let k = 0; k < n; k++) {
    const take = Math.min(left, Math.ceil(honours / n));
    left -= take;
    const trophies: ClubTrophyKey[] = [];
    const awards: AwardKey[] = [];
    for (let x = 0; x < take; x++) {
      if (x % 5 === 4) awards.push(AWARDS[x % AWARDS.length]);
      else trophies.push(CLUB_TROPHIES[x % CLUB_TROPHIES.length]);
    }
    out.push(season(startIndex + k, startAge + k, teamId, trophies, awards));
  }
  return out;
}

function buildCareer(): CareerState {
  const base = startCareer("timeline-stress", "normal",
    { lastName: "Teste", foot: "right", countryIso: "BR", position: "ST" }, "normal");

  const seasons: SeasonSnapshot[] = [
    // Longest club name in the dataset, heavily decorated.
    ...spell(0, 16, "central-cordoba-de-santiago", 6, 33),
    // Long name, no honours at all.
    ...spell(6, 22, "gimnasia-lp", 2, 0),
    // Long name, a couple of honours.
    ...spell(8, 24, "borussia-monchengladbach", 3, 4),
    // Short name, one honour.
    ...spell(11, 27, "flamengo", 1, 1),
    // Long name again, a single season with a single trophy.
    ...spell(12, 28, "estudiantes-de-rio-cuarto", 1, 1),
    // A very long spell with a moderate haul.
    ...spell(13, 29, "central-cordoba-de-santiago", 10, 12),
  ];

  return {
    ...base,
    phase: "summary",
    seasons,
    firstCallUpAge: 21,
    nationalTeamStats: { ...EMPTY_STATS, caps: 90 },
    player: { ...base.player, age: 39 },
  };
}

export default function TimelineStress() {
  const career = buildCareer();
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="font-display text-2xl font-black">Linha do tempo — casos extremos</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Nome de clube mais longo do dataset (38 caracteres) e o período mais condecorado visto em
        400 carreiras (33 taças). Se couber aqui, cabe em qualquer save.
      </p>

      <div className="mt-6 flex flex-wrap items-start gap-6">
        {[240, 300, 360, 420].map((w) => (
          <div key={w} style={{ width: w }}>
            <p className="mb-1 font-mono text-[10px] text-muted-2">largura {w}px</p>
            <CareerTimeline career={career} />
          </div>
        ))}
      </div>
    </main>
  );
}
