import { createRng, nextInt, pickWeighted } from "./rng";
import { teamBaseOverall } from "./engine";
import type { Player } from "./engine";
import type { PositionCode } from "./constants";
import { getLeagueOfTeam } from "@/lib/data/dataset";
import type { Team } from "@/lib/data/dataset";

/**
 * What a club actually wants from this signing.
 *
 * Every offer used to be interchangeable once you'd read the club name and its
 * reputation — the decision was "which badge is biggest". A brief gives each
 * one a reason it wants *this* player at *this* moment, which is the part that
 * makes two offers from similarly sized clubs feel like different choices.
 *
 * It is not cosmetic. The brief sets how much goodwill the player starts with
 * and how quickly the terraces turn: arriving as the replacement for a club
 * legend means an impatient crowd and a short rope, while being signed as one
 * for the future buys real time.
 */
export type ClubBriefKey =
  | "replace_idol"
  | "marquee"
  | "savior"
  | "rebuild"
  | "project"
  | "understudy"
  | "prove_it"
  | "homecoming"
  | "squad_depth";

export interface ClubBrief {
  key: ClubBriefKey;
  /** Starting fan support at the new club, 0–100. */
  startingSupport: number;
  /**
   * Multiplier on how hard the crowd swings against a bad season. Above 1 is
   * an impatient stand.
   */
  patience: number;
}

/** The position group a club is filling — used for the "replace the idol" read. */
function positionLabelKey(position: PositionCode): string {
  if (position === "GK") return "gk";
  if (position === "CB" || position === "LB" || position === "RB") return "defender";
  if (position === "CDM" || position === "CM") return "midfielder";
  if (position === "CAM" || position === "LM" || position === "RM") return "creator";
  return "forward";
}

/**
 * `demand` is the bar, in fan-support points, that a season has to clear before
 * the terraces count it as delivering on the brief. It is subtracted from the
 * raw season reaction, so the same 15-goal season is a triumph for a teenager
 * signed as one for the future and a disappointment for the man bought to
 * replace a legend. This is what makes the brief a real expectation rather
 * than a label on the offer card.
 */
const PROFILES: Record<ClubBriefKey, { startingSupport: number; patience: number; demand: number }> = {
  // Filling a departed idol's shirt: the stand is already comparing you.
  replace_idol: { startingSupport: 46, patience: 1.45, demand: 9 },
  // Signed as the face of the project — huge goodwill, huge expectation.
  marquee: { startingSupport: 66, patience: 1.35, demand: 9 },
  // Brought in to keep a struggling club up.
  savior: { startingSupport: 58, patience: 1.25, demand: 5 },
  // A club picking itself up off the floor; the crowd is grateful you came.
  rebuild: { startingSupport: 60, patience: 0.85, demand: 2 },
  // One for the future: nobody expects anything yet.
  project: { startingSupport: 52, patience: 0.7, demand: 0 },
  // Signed to learn behind someone better. Minutes are the reward, not the start.
  understudy: { startingSupport: 48, patience: 0.75, demand: 1 },
  // A move that raises eyebrows — the crowd wants to be convinced.
  prove_it: { startingSupport: 45, patience: 1.2, demand: 5 },
  // They already know you.
  homecoming: { startingSupport: 70, patience: 0.8, demand: 2 },
  // Just another body in the squad.
  squad_depth: { startingSupport: 50, patience: 1, demand: 4 },
};

/** How much of a season's fan reaction is eaten by simply meeting the brief. */
export function briefDemand(key: ClubBriefKey): number {
  return PROFILES[key].demand;
}

export interface BriefContext {
  player: Player;
  team: Team;
  /** True when the player has been at this club before. */
  returning: boolean;
  /** The club just went down, or is in the second tier. */
  rebuilding: boolean;
  /** How the last season went, for the "prove it" read. */
  lastSeasonWasPoor: boolean;
}

/**
 * Picks the brief for one offer. Weighted rather than deterministic so the
 * same club can want different things in different careers, but every weight
 * is gated on the situation actually being true — a club three divisions below
 * the player never signs them as an understudy.
 */
export function rollClubBrief(seed: string, context: BriefContext): ClubBrief {
  const { player, team, returning, rebuilding, lastSeasonWasPoor } = context;
  const base = teamBaseOverall(team);
  const gap = player.overall - base;

  // A club is "big" if it carries weight either at home or abroad — a domestic
  // giant from a smaller league and a mid-table side from a huge one both count.
  // Reading only `domestic_reputation` put barely 9% of clubs above the bar,
  // which made the two most interesting briefs almost never fire.
  const prestige = Math.max(team.domestic_reputation, team.international_reputation);
  const bigClub = prestige >= 3;
  const eliteClub = prestige >= 4;

  const weights: { item: ClubBriefKey; weight: number }[] = [
    { item: "squad_depth", weight: 12 },
  ];

  if (returning) weights.push({ item: "homecoming", weight: 70 });
  if (rebuilding) weights.push({ item: "rebuild", weight: 45 });

  // Signed well above the club's level: you are the story.
  if (gap >= 4 && bigClub) weights.push({ item: "marquee", weight: 45 });
  if (gap >= 6 && !bigClub) weights.push({ item: "marquee", weight: 25 });
  // A superclub signing an already-made player is a marquee move by definition,
  // even though the level gap is nothing.
  if (eliteClub && player.overall >= 82) weights.push({ item: "marquee", weight: 30 });

  // A small club buying someone clearly better wants rescuing.
  if (gap >= 3 && !bigClub && prestige <= 1) weights.push({ item: "savior", weight: 30 });

  // Big clubs replace people. Arriving at one at roughly its own level is
  // stepping into a shirt somebody else just took off.
  if (bigClub && gap >= -4) weights.push({ item: "replace_idol", weight: 34 });

  // Young and below the club's level: bought for later.
  if (player.age <= 22 && gap < 2) weights.push({ item: "project", weight: 42 });

  // Below the level at a serious club: you are behind someone.
  if (gap <= -3 && prestige >= 2) weights.push({ item: "understudy", weight: 40 });

  if (lastSeasonWasPoor && player.age >= 24) weights.push({ item: "prove_it", weight: 22 });
  // A veteran arriving anywhere has to answer the same question.
  if (player.age >= 31) weights.push({ item: "prove_it", weight: 16 });

  const picked = pickWeighted(createRng(`${seed}:brief:${team.id}:${player.age}`), weights);
  const profile = PROFILES[picked.item];

  // A little spread so two identical briefs don't start on identical numbers.
  const jitter = nextInt(picked.rng, -3, 3).value;
  return {
    key: picked.item,
    startingSupport: Math.min(85, Math.max(25, profile.startingSupport + jitter)),
    patience: profile.patience,
  };
}

/**
 * Whether a club counts as rebuilding for brief purposes: currently outside
 * the top flight of its own country.
 */
export function isRebuildingClub(team: Team, tier: number): boolean {
  const league = getLeagueOfTeam(team.id);
  if (!league) return false;
  return tier > 1;
}

/** Token used by the copy layer to name the shirt being filled. */
export function briefPositionKey(position: PositionCode): string {
  return positionLabelKey(position);
}
