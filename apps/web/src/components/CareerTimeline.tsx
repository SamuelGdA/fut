"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "motion";
import { countryName, useI18n } from "@/lib/i18n/context";
import { ClubCrest, Flag, TrophyImage } from "./Media";
import { getTeam } from "@craque/data";
import { areRivals } from "@craque/data";
import { clubStanding, nationalStanding } from "@/lib/sim/engine";
import { resolveTrophy } from "@/lib/trophyDisplay";
import {
  AWARD_IMAGES,
  CLUB_TROPHY_IMPORTANCE,
  NATIONAL_TROPHY_IMPORTANCE,
  type AwardKey,
  type ClubTrophyKey,
  type NationalTrophyKey,
  type TrophyKey,
} from "@craque/data";
import type { CareerState } from "@/lib/sim/career";
import type { ClubStanding } from "@/lib/sim/constants";

/**
 * The most honour icons one spell shows before collapsing the rest into a
 * count. The strip used to be unbounded and shared a wrapping row with the
 * standing badges, so a decorated spell at a giant grew into a tall block of
 * loose icons that dwarfed the club it belonged to.
 */
const TIMELINE_HONOUR_LIMIT = 8;

/** A full starter season's worth of appearances — the yardstick for "actually played". */
const STARTER_SEASON_APPEARANCES = 40;

interface ClubSpell {
  type: "club";
  age: number;
  teamId: string;
  from: number;
  to: number;
  seasons: number;
  /** Seasons across *every* spell at this club — what the standing is judged on. */
  clubSeasons: number;
  trophies: { key: TrophyKey; name: string; imageUrl?: string }[];
  awards: AwardKey[];
  standing: ClubStanding;
  /** Left this club to sign directly for one of its real, known rivals. */
  traitor: boolean;
}

interface CallUpEntry {
  type: "callup";
  age: number;
  standing: Exclude<ClubStanding, "passing"> | null;
}

type TimelineEntry = ClubSpell | CallUpEntry;

const STANDING_STYLE: Record<ClubStanding, string> = {
  passing: "bg-surface-2 text-muted-2",
  regular: "bg-white/10 text-muted",
  idol: "bg-pitch/15 text-pitch",
  legend: "bg-gold/15 text-gold",
};

/**
 * The whole career as one vertical strip: every club spell in order, what was
 * won there, what that club's fans ended up calling you, and the moment the
 * national team came calling. Consecutive seasons at the same club collapse
 * into a single spell, so a ten-year stay reads as one chapter rather than
 * ten rows.
 */
export function CareerTimeline({ career }: { career: CareerState }) {
  const { t, locale } = useI18n();
  const listRef = useRef<HTMLOListElement>(null);
  const confederation = career.player.nationality.confederation;

  const spells: ClubSpell[] = [];
  for (const season of career.seasons) {
    const last = spells[spells.length - 1];
    const trophies = season.trophies.map((key) => {
      const resolved = resolveTrophy(key, season.teamId, confederation, t, season.leagueTier);
      return { key, name: resolved.name, imageUrl: resolved.imageUrl };
    });

    if (last && last.teamId === season.teamId) {
      last.to = season.age;
      last.seasons += 1;
      last.trophies.push(...trophies);
      last.awards.push(...season.awards);
    } else {
      spells.push({
        type: "club",
        age: season.age,
        teamId: season.teamId,
        from: season.age,
        to: season.age,
        seasons: 1,
        clubSeasons: 1,
        trophies: [...trophies],
        awards: [...season.awards],
        standing: "passing",
        traitor: false,
      });
    }
  }

  // Standing is judged per *club*, not per spell — two separate stints at the
  // same club should add up into one legacy there. Trophies are weighted
  // (a cup isn't a Champions League) and playing time is measured against a
  // full starter season, so someone who barely featured never reads as a
  // legend just because the team around them won things.
  const byClub = new Map<string, { seasons: number; trophyScore: number; appearances: number }>();
  for (const season of career.seasons) {
    const acc = byClub.get(season.teamId) ?? { seasons: 0, trophyScore: 0, appearances: 0 };
    acc.seasons += 1;
    acc.appearances += season.stats.appearances;
    for (const key of season.trophies) {
      acc.trophyScore += CLUB_TROPHY_IMPORTANCE[key as ClubTrophyKey] ?? 0;
    }
    byClub.set(season.teamId, acc);
  }
  for (const spell of spells) {
    const acc = byClub.get(spell.teamId)!;
    const team = getTeam(spell.teamId);
    const clubReputation = team ? (team.domestic_reputation + team.international_reputation) / 2 : 0;
    spell.standing = clubStanding({
      seasons: acc.seasons,
      trophyScore: acc.trophyScore,
      clubReputation,
      playedShare: acc.appearances / acc.seasons / STARTER_SEASON_APPEARANCES,
    });
    spell.clubSeasons = acc.seasons;
  }

  // Clubs that will never have this player back, marked on the spell that
  // ended it. Two ways to get there and the badge reads the same for both:
  //
  //  - walking straight into a genuine rival's shirt, judged against real
  //    derbies (see lib/data/rivalries.ts) rather than "same league", because
  //    two clubs sharing a division is not a rivalry on its own;
  //  - being run out of town by the club's own supporters, which the sim
  //    records on the career itself. That one used only to block future
  //    offers, so the row where it happened showed nothing at all.
  const runOut = new Set(career.betrayedClubs ?? []);
  for (let i = 0; i < spells.length; i += 1) {
    const left = spells[i];
    if (runOut.has(left.teamId)) left.traitor = true;
    const joined = spells[i + 1];
    if (!joined || left.teamId === joined.teamId) continue;
    if (areRivals(left.teamId, joined.teamId)) left.traitor = true;
  }

  const entries: TimelineEntry[] = [...spells];
  if (career.firstCallUpAge !== null) {
    let nationalTrophyScore = 0;
    for (const season of career.seasons) {
      for (const key of season.trophies) {
        const weight = NATIONAL_TROPHY_IMPORTANCE[key as NationalTrophyKey];
        if (weight) nationalTrophyScore += weight;
      }
    }
    const nation = career.player.nationality;
    const countryReputation = (nation.continental_reputation + nation.fifa_reputation + nation.international_reputation) / 3;
    entries.push({
      type: "callup",
      age: career.firstCallUpAge,
      standing: nationalStanding({
        caps: career.nationalTeamStats.caps,
        trophyScore: nationalTrophyScore,
        countryReputation,
      }),
    });
  }
  entries.sort((a, b) => a.age - b.age);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>("li"));
    if (rows.length === 0) return;
    animate(
      rows,
      { opacity: [0, 1], x: [-12, 0] },
      { duration: 0.4, delay: stagger(0.06), ease: "easeOut" },
    );
  }, []);

  return (
    <section className="panel p-3">
      <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
        {t("career.timelineTitle")}
      </h2>

      <ol ref={listRef} className="relative flex flex-col gap-2 pl-4">
        {/* The spine the whole career hangs off. */}
        <span className="absolute bottom-2 left-[5px] top-2 w-px bg-line" aria-hidden />

        {entries.map((entry, i) => {
          if (entry.type === "callup") {
            return (
              <li key={`callup-${i}`} className="relative">
                <span
                  className={`absolute -left-4 top-2.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${
                    entry.standing === "legend" ? "bg-gold" : entry.standing === "idol" ? "bg-pitch" : "bg-flood"
                  }`}
                  aria-hidden
                />
                <div className="flex items-center gap-2 rounded-lg bg-flood/10 px-2.5 py-2">
                  <Flag
                    src={career.player.nationality.flag_url}
                    alt={countryName(career.player.nationality, locale)}
                    className="h-4 w-6 shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-flood">
                    {t("career.firstCallUpEyebrow")}
                  </span>
                  {entry.standing && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${STANDING_STYLE[entry.standing]}`}
                    >
                      {t(`career.standings.${entry.standing}`)}
                    </span>
                  )}
                  <span className="shrink-0 font-display text-[10px] font-bold text-muted-2">{entry.age}</span>
                </div>
              </li>
            );
          }

          const spell = entry;
          const team = getTeam(spell.teamId);
          // Silverware and individual honours share one bounded strip, so the
          // row's height depends on one number rather than two.
          const honours = [
            ...spell.trophies.map((tr) => ({ name: tr.name, imageUrl: tr.imageUrl })),
            ...spell.awards.map((aw) => ({ name: t(`awards.${aw}`), imageUrl: AWARD_IMAGES[aw] })),
          ];
          const shown = honours.slice(0, TIMELINE_HONOUR_LIMIT);
          const hidden = honours.length - shown.length;
          const allHonourNames = honours.map((h) => h.name).join(" · ");

          return (
            <li key={`${spell.teamId}-${i}`} className="relative">
              <span
                className={`absolute -left-4 top-2.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${
                  spell.traitor
                    ? "bg-danger"
                    : spell.standing === "legend"
                      ? "bg-gold"
                      : spell.standing === "idol"
                        ? "bg-pitch"
                        : "bg-muted-2"
                }`}
                aria-hidden
              />

              <div className="min-w-0 rounded-lg bg-surface-2/50 px-2.5 py-2">
                {/* Club and years. `min-w-0` has to be on the row *and* on the
                    name, or the name refuses to shrink and gets sliced by the
                    panel edge instead of ellipsing — which is what kept
                    clipping club names in the narrow summary rail. */}
                <div className="flex min-w-0 items-center gap-2">
                  {team && (
                    <ClubCrest teamId={team.id} name={team.name} size={20} className="h-5 w-5 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold" title={team?.name ?? undefined}>
                    {team?.name ?? "-"}
                  </span>
                  <span className="shrink-0 font-display text-[10px] font-bold tabular-nums text-muted-2">
                    {spell.from === spell.to ? spell.from : `${spell.from}-${spell.to}`}
                  </span>
                </div>

                {/* Standing and length. Kept apart from the honours so a heavily
                    decorated spell cannot push these onto their own lines. */}
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${STANDING_STYLE[spell.standing]}`}
                    title={t(`career.standingHints.${spell.standing}`)}
                  >
                    {t(`career.standings.${spell.standing}`)}
                  </span>
                  {spell.traitor && (
                    <span
                      className="shrink-0 rounded bg-danger/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-danger"
                      title={t("career.traitorHint")}
                    >
                      {t("career.traitorLabel")}
                    </span>
                  )}
                  {/* Club total, not spell length — otherwise a returning legend
                      reads as "Legend · 2 seasons", which contradicts itself. */}
                  <span className="min-w-0 truncate text-[9px] text-muted-2">
                    {spell.clubSeasons === 1
                      ? t("career.seasonAt")
                      : t("career.seasonsAt", { count: spell.clubSeasons })}
                  </span>
                </div>

                {/* One tidy, strictly single-line trophy strip. It used to be
                    an unbounded wrapping row sharing space with the badges
                    above, so a decorated spell grew into a tall block of
                    loose icons. */}
                {honours.length > 0 && (
                  <div className="mt-1.5 flex min-w-0 items-center gap-1" title={allHonourNames}>
                    {shown.map((h, hi) => (
                      <TrophyImage
                        key={`h-${hi}`}
                        src={h.imageUrl}
                        alt={h.name}
                        className="h-4 w-4 shrink-0"
                      />
                    ))}
                    {hidden > 0 && (
                      <span className="shrink-0 font-display text-[9px] font-black tabular-nums text-muted-2">
                        +{hidden}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
