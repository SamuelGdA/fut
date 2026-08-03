import { chance, clamp, createRng, nextFloat, nextInt, pickOne, pickWeighted, type Rng } from "./rng";
import type { Attributes } from "./attributes";
import {
  ALL_POSITIONS,
  BASE_MODIFIERS,
  CALL_UP_THRESHOLD,
  CLUB_TROPHY_PROBABILITY,
  CLUB_WORLD_CUP_PROBABILITY,
  CLUB_WORLD_CUP_START_AGE,
  CONTINENTAL_TOURNAMENT_START_AGE,
  CONTINENTAL_TROPHY_PROBABILITY,
  EMPTY_STATS,
  NATIONAL_CONTINENTAL_PROBABILITY,
  ROLE_POSITIONS,
  FAN_SUPPORT_BANDS,
  FAN_SUPPORT_MAX,
  FAN_SUPPORT_MIN,
  PERSONALITY_TRAITS,
  SECOND_TIER_LEAGUE_ODDS,
  SECOND_TIER_PLAYOFF_ODDS,
  STAR_PLAYER_OVERALL,
  DIFFICULTY_CONFIG,
  type Difficulty,
  TALENT_REVEAL_APPEARANCES,
  TRAIT_EFFECTS,
  TALENT_TIER_ORDER,
  TALENT_TIERS,
  TEAM_BASE_OVERALL,
  TOURNAMENT_CYCLE_YEARS,
  VALUE_ANCHORS,
  WORLD_CUP_QUALIFY_PROBABILITY,
  WORLD_CUP_START_AGE,
  WORLD_CUP_WIN_PROBABILITY,
  type ClubStanding,
  type Modifiers,
  type PersonalityTrait,
  type PlayerRole,
  type PositionCode,
  type SquadStatus,
  type TalentTier,
  type TraitEffects,
} from "./constants";
import {
  getConfederationTrophies,
  getCountryByFifa,
  getLeagueByTier,
  getLeagueOfTeam,
  hasDomesticCup,
  type Country,
  type Team,
} from "@/lib/data/dataset";
import type { AwardKey, ClubTrophyKey, TrophyKey } from "@/lib/data/trophies";

export interface SeasonStats {
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
}

export interface Player {
  age: number;
  /** Derived from `attributes` via the position's OVR weights. */
  overall: number;
  attributes: Attributes;
  marketValue: number;
  position: PositionCode;
  role: PlayerRole;
  nationality: Country;
  developmentProfile: "early" | "normal" | "late";
  /** Hidden soft ceiling on OVR for this career — see `rollPotential`. */
  potential: number;
  /** Bucket `potential` fell into, used for the in-game scouting read-out. */
  talentTier: TalentTier;
  /** Personality, rolled per career — colours event odds and growth. */
  trait: PersonalityTrait;
  currentTeamId: string | null;
}

export interface NationalTournament {
  trophy: "national_continental" | "world_cup";
  age: number;
  selectionQualified: boolean;
}

// ---------------------------------------------------------------------------
// Roles & squad status
// ---------------------------------------------------------------------------

export function roleForPosition(position: PositionCode): PlayerRole {
  const entry = (Object.entries(ROLE_POSITIONS) as [PlayerRole, PositionCode[]][]).find(
    ([, list]) => list.includes(position),
  );
  if (!entry) throw new Error(`Unsupported career position: ${position}`);
  return entry[0];
}

export function isSupportedPosition(position: string): position is PositionCode {
  return ALL_POSITIONS.includes(position as PositionCode);
}

export function teamBaseOverall(team: Team): number {
  return TEAM_BASE_OVERALL[clamp(team.international_reputation, 0, 5)];
}

/** Where the player sits in the pecking order given how far above the club's level they are. */
export function squadStatusFromGap(gap: number, isGoalkeeper: boolean): SquadStatus {
  if (isGoalkeeper) {
    if (gap >= 0) return "starter";
    if (gap >= -6) return "substitute";
    return "third_keeper";
  }
  if (gap >= 0) return "starter";
  if (gap >= -4) return "high_rotation";
  if (gap >= -8) return "low_rotation";
  return "substitute";
}

export function squadStatusAtTeam(player: Player, team: Team): SquadStatus {
  return squadStatusFromGap(player.overall - teamBaseOverall(team), player.role === "goalkeeper");
}

export function shiftSquadStatus(
  status: SquadStatus,
  isGoalkeeper: boolean,
  shift: number,
): SquadStatus {
  if (shift === 0) return status;
  const ladder: SquadStatus[] = isGoalkeeper
    ? ["third_keeper", "substitute", "starter"]
    : ["substitute", "low_rotation", "high_rotation", "starter"];
  const idx = ladder.indexOf(status);
  return ladder[clamp(idx + shift, 0, ladder.length - 1)] ?? status;
}

export function isBenchStatus(status: SquadStatus): boolean {
  return status === "substitute" || status === "third_keeper";
}

// ---------------------------------------------------------------------------
// Market value
// ---------------------------------------------------------------------------

function ageValueMultiplier(age: number): number {
  if (age <= 18) return 1.5;
  if (age <= 22) return 1.2;
  if (age <= 26) return 1;
  if (age <= 30) return 0.9;
  if (age <= 32) return 0.8;
  if (age <= 34) return 0.6;
  return 0.2;
}

function roundValue(value: number): number {
  if (value >= 10_000_000) return Math.round(value / 1_000_000) * 1_000_000;
  if (value >= 1_000_000) return Math.round(value / 100_000) * 100_000;
  return Math.round(value / 10_000) * 10_000;
}

export function marketValue(rng: Rng, overall: number, age: number): { rng: Rng; value: number } {
  const ovr = clamp(overall, 50, 99);
  const lowIdx = Math.max(0, VALUE_ANCHORS.findLastIndex(([o]) => o <= ovr));
  const low = VALUE_ANCHORS[lowIdx];
  const high = VALUE_ANCHORS.find(([o]) => o >= ovr) ?? VALUE_ANCHORS[VALUE_ANCHORS.length - 1];
  const [lowOvr, lowVal] = low;
  const [highOvr, highVal] = high;
  const t = highOvr === lowOvr ? 0 : (ovr - lowOvr) / (highOvr - lowOvr);
  const base = lowVal + (highVal - lowVal) * t;
  const jitter = nextFloat(rng, 0.95, 1.05);
  return { rng: jitter.rng, value: roundValue(base * ageValueMultiplier(age) * jitter.value) };
}

// ---------------------------------------------------------------------------
// Development
// ---------------------------------------------------------------------------

export function pickDevelopmentProfile(seed: string, position: PositionCode): "early" | "normal" | "late" {
  if (position === "GK") return "normal";
  const r = nextFloat(createRng(`${seed}:development-profile`), 0, 1);
  if (r.value < 0.1) return "early";
  if (r.value < 0.2) return "late";
  return "normal";
}

/**
 * Rolls the career's hidden ceiling. Drawn from its own seeded stream so it is
 * fixed for a given seed (replaying a seed gives the same player) without
 * consuming the main RNG the rest of the sim walks.
 */
export function rollPotential(
  seed: string,
  difficulty: Difficulty = "normal",
): { potential: number; talentTier: TalentTier } {
  // Hard mode reweights the tiers rather than shrinking the ranges: a
  // generational talent is still a generational talent when one turns up, it
  // just almost never does.
  const tierWeight = DIFFICULTY_CONFIG[difficulty].talentTierWeight;
  const tierRoll = pickWeighted(
    createRng(`${seed}:potential-tier`),
    TALENT_TIERS.map((t) => ({ item: t, weight: t.weight * tierWeight[t.tier] })),
  );
  const [min, max] = tierRoll.item.range;
  const within = nextFloat(tierRoll.rng, min, max);
  return { potential: Math.round(within.value), talentTier: tierRoll.item.tier };
}

/**
 * Rolls the career's personality. Drawn off its own seeded stream so it is
 * stable per seed and independent of the potential roll.
 */
export function rollPersonality(seed: string): PersonalityTrait {
  const picked = pickWeighted(
    createRng(`${seed}:personality`),
    PERSONALITY_TRAITS.map((t) => ({ item: t.trait, weight: t.weight })),
  );
  return picked.item;
}

/** Combined trait effects, so callers never have to know which trait is active. */
export function traitEffects(trait: PersonalityTrait): TraitEffects {
  return TRAIT_EFFECTS[trait];
}

// ---------------------------------------------------------------------------
// Fan support
// ---------------------------------------------------------------------------

export type FanBand = "hostile" | "cold" | "warm" | "loved" | "adored";

export function fanBand(support: number): FanBand {
  if (support < FAN_SUPPORT_BANDS.hostile) return "hostile";
  if (support < FAN_SUPPORT_BANDS.cold) return "cold";
  if (support < FAN_SUPPORT_BANDS.warm) return "warm";
  if (support < FAN_SUPPORT_BANDS.loved) return "loved";
  return "adored";
}

/**
 * How the terraces react to a season. Output and silverware win them over,
 * a season spent injured or on the bench cools them off, and simply staying
 * put earns a little trust every year.
 */
export function fanSupportDelta(
  stats: SeasonStats,
  trophies: number,
  role: PlayerRole,
  trait: PersonalityTrait,
): number {
  // A season watched from the treatment room or the bench costs you real goodwill.
  if (stats.appearances === 0) return -14;

  const minutes = clamp(stats.appearances / 34, 0, 1);
  const production =
    role === "goalkeeper"
      ? clamp(stats.cleanSheets / Math.max(1, stats.appearances) / 0.4, 0, 1)
      : clamp((stats.goals + stats.assists) / Math.max(1, stats.appearances) / 0.5, 0, 1);

  // Deliberately starts negative: simply being on the payroll loses a terrace's
  // patience, and you claw it back with minutes, output and silverware. A squad
  // player drifts down, a star climbs fast — which is what makes the crowd
  // reaction events actually reachable in both directions.
  const earned = -6 + minutes * 8 + production * 12 + trophies * 6;
  return earned + TRAIT_EFFECTS[trait].fanSupport;
}

export function applyFanSupport(current: number, delta: number): number {
  return clamp(current + delta, FAN_SUPPORT_MIN, FAN_SUPPORT_MAX);
}

// ---------------------------------------------------------------------------
// Club standing
// ---------------------------------------------------------------------------

export interface ClubStandingInput {
  /** Seasons on the books at this club, across every spell. */
  seasons: number;
  /** Importance-weighted trophy total (see CLUB_TROPHY_IMPORTANCE) — a cup counts
   *  for less than a Champions League. */
  trophyScore: number;
  /** 0-5 reputation of the club — the bigger the badge, the more it takes to matter there. */
  clubReputation: number;
  /** Average share of a starter's minutes actually played across those seasons, 0-1+. */
  playedShare: number;
}

/**
 * What this club's fans will remember you as. Scales with the club's own
 * size: one trophy already makes you a legend at a small side, but the same
 * trophy is a footnote at a giant, who needs several — and genuinely
 * important ones — before the terraces start calling you a legend. Either
 * way it also requires having actually played: winning things while barely
 * featuring earns loyalty, not devotion.
 */
export function clubStanding(input: ClubStandingInput): ClubStanding {
  const rep = clamp(input.clubReputation, 0, 5);
  const tiers: { standing: Exclude<ClubStanding, "passing">; minSeasons: number; minTrophyScore: number; minPlayedShare: number }[] = [
    { standing: "legend", minSeasons: Math.round(4 + rep * 0.6), minTrophyScore: 1 + rep * 1.1, minPlayedShare: 0.55 },
    { standing: "idol", minSeasons: Math.round(2 + rep * 0.5), minTrophyScore: 0.4 + rep * 0.55, minPlayedShare: 0.4 },
    { standing: "regular", minSeasons: Math.round(1 + rep * 0.4), minTrophyScore: 0, minPlayedShare: 0 },
  ];
  for (const tier of tiers) {
    if (
      input.seasons >= tier.minSeasons &&
      input.trophyScore >= tier.minTrophyScore &&
      input.playedShare >= tier.minPlayedShare
    ) {
      return tier.standing;
    }
  }
  return "passing";
}

export interface NationalStandingInput {
  /** Career-total senior caps. */
  caps: number;
  /** Importance-weighted national-trophy total (see NATIONAL_TROPHY_IMPORTANCE). */
  trophyScore: number;
  /** 0-5ish reputation of the nation itself — winning it all means more for a small footballing country. */
  countryReputation: number;
}

/**
 * What the country will remember you as. A Copa América doesn't make anyone a
 * Brazil legend — the bar rises with how good the national side already is —
 * but the same trophy can define a career for a footballing minnow. Trophies
 * are required either way: caps alone, however many, are loyalty, not glory.
 */
export function nationalStanding(input: NationalStandingInput): Exclude<ClubStanding, "passing"> | null {
  const rep = clamp(input.countryReputation, 0, 5);
  if (input.caps >= 40 + rep * 10 && input.trophyScore >= 0.5 + rep * 0.9) return "legend";
  if (input.caps >= 20 + rep * 6 && input.trophyScore >= 0.2 + rep * 0.5) return "idol";
  return null;
}

// ---------------------------------------------------------------------------
// Rival
// ---------------------------------------------------------------------------

export type RivalGroup = "attacker" | "midfielder" | "defender" | "goalkeeper";

export interface RivalPlayer {
  name: string;
  countryFifa: string;
  group: RivalGroup;
  /** Their own hidden ceiling, so the rivalry tracks a real career arc. */
  potential: number;
}

/** Which of the four broad rival groups a position belongs to — no PE/CA/PD split. */
const RIVAL_GROUP_BY_POSITION: Record<PositionCode, RivalGroup> = {
  ST: "attacker", LW: "attacker", RW: "attacker",
  CAM: "midfielder", LM: "midfielder", RM: "midfielder", CM: "midfielder", CDM: "midfielder",
  LB: "defender", CB: "defender", RB: "defender",
  GK: "goalkeeper",
};

export function rivalGroupForPosition(position: PositionCode): RivalGroup {
  return RIVAL_GROUP_BY_POSITION[position];
}

/**
 * A pool of clearly-fictional, winking parodies of real greats — never the
 * actual name — grouped so a striker only ever measures up against other
 * attackers, a centre-back against other defenders, and so on. Every entry is
 * at most 14 characters (it has to fit in a summary-card row and a timeline
 * chip without truncating), and the wink is styled to the player's own
 * background rather than defaulting every single one to a Brazilian
 * "-inho"/"-ão" ending regardless of where they're actually from.
 */
const RIVAL_POOL: Record<RivalGroup, string[]> = {
  attacker: [
    "Cris Seven", "Lamimi Jamal", "Kiliam Mbappô", "Elling Haaland", "Ney Jr. Marés",
    "Vini Jotinha", "Karim Benzebum", "Lewangolski", "Mo Salahdin",
    "Tonio Griezou", "Harry Kaner", "Luis Suaritez", "Kun Aguerito",
    "Zlatan Ibraca", "Wazza Roo", "Titi Henriq", "Ronny Gaúcho",
    "Gareth Balenço", "Rah Sterlini", "Marc Rushford",
  ],
  midfielder: [
    "Zinedino Zizu", "Xavito Hernán", "Iniestita", "Luka Modrata",
    "Toni Kroosler", "Kevin De Bruin", "Andrea Pirlone", "Kakázinho",
    "Paulo Pogbar", "Mesut Özilo", "Frank Lampart", "Steve Gerrardo",
    "Xabi Alonzito", "Berna Silveira", "Ilkay Gündocra", "Sergi Busquito",
    "Casemirão", "Fabin Monstro", "Jude Bellingo", "Pedrito Gonza",
  ],
  defender: [
    "Puyolito", "Sergio Ramoso", "Paolo Maldento", "Franco Baresio",
    "Fabio Canavaro", "Gerard Piquito", "Virgil VanDike", "Thiago Silvão",
    "Marcelo Vierão", "Beto Carlitos", "Dani Alvinho", "Cafuzinho Rei",
    "Giorgi Chiello", "Leo Bonuccio", "Vince Kompania", "Johnny Terrius",
    "Rio Ferdinan", "Nando Hierrito", "Alessio Nesti", "David Alabama",
  ],
  goalkeeper: [
    "Gigi Buffone", "Iker Casillón", "Manuel Neuros", "Thibaut Courto",
    "Aliss Beckinho", "Edersão Moraes", "Jan Oblakito", "Marc TerStegen",
    "Gigio Donnarum", "Petr Cechuk", "Edwin VanSaris", "Pete Schmichel",
    "Oliver Kahnio", "Julinho Cesar", "Nelsinho Dida",
  ],
};

/** Overall a player must reach before the game bothers assigning them a rival at all. */
export const RIVAL_ASSIGNMENT_THRESHOLD = 80;

/**
 * The generational rival: a made-up contemporary in the same position group
 * who chases the same Golden Boot and Ballon d'Or you do. Purely narrative,
 * but it gives the numbers on the summary screen — and a handful of career
 * events — someone to be measured against. Only rolled once the player is
 * actually good enough to plausibly have a rival at all.
 */
export function rollRival(seed: string, ownCountryFifa: string, position: PositionCode): RivalPlayer {
  const group = rivalGroupForPosition(position);
  const picked = pickOne(createRng(`${seed}:rival-name`), RIVAL_POOL[group]);
  // Usually a foreigner, occasionally a compatriot fighting you for the same shirt.
  const sameCountry = chance(picked.rng, 0.25);
  const potentialRoll = nextInt(sameCountry.rng, 84, 97);
  return {
    name: picked.item,
    countryFifa: sameCountry.success ? ownCountryFifa : "",
    group,
    potential: potentialRoll.value,
  };
}

/**
 * What the rival is rated at a given age — a plain bell-ish arc peaking at 28,
 * so the head-to-head on the summary screen reads like a real career rather
 * than a flat number.
 */
export function rivalOverallAt(rival: RivalPlayer, age: number): number {
  const peakAge = 28;
  const distance = Math.abs(age - peakAge);
  const falloff = age < peakAge ? distance * 2.4 : distance * 1.9;
  return Math.round(clamp(rival.potential - falloff, 45, 99));
}

/**
 * What the player is allowed to know about their own ceiling. Coaches can only
 * judge a teenager so far — the read-out starts blank, narrows to a two-tier
 * band once there's a body of work, and only becomes exact for an established
 * professional.
 */
export function scoutedTalent(
  talentTier: TalentTier,
  careerAppearances: number,
): { certainty: "unknown" | "approximate" | "exact"; tiers: TalentTier[] } {
  if (careerAppearances < TALENT_REVEAL_APPEARANCES.approximate) {
    return { certainty: "unknown", tiers: [] };
  }
  if (careerAppearances >= TALENT_REVEAL_APPEARANCES.exact) {
    return { certainty: "exact", tiers: [talentTier] };
  }
  // Straddle the true tier with a neighbour so the read-out is useful but still hedged.
  const idx = TALENT_TIER_ORDER.indexOf(talentTier);
  const lo = Math.max(0, Math.min(idx, TALENT_TIER_ORDER.length - 2));
  return { certainty: "approximate", tiers: [TALENT_TIER_ORDER[lo], TALENT_TIER_ORDER[lo + 1]] };
}

// ---------------------------------------------------------------------------
// Season statistics
// ---------------------------------------------------------------------------

function overallGapBucket(gap: number): number {
  if (gap >= 10) return 0;
  if (gap >= 6) return 1;
  if (gap >= 3) return 2;
  if (gap >= -2) return 3;
  if (gap >= -5) return 4;
  if (gap >= -9) return 5;
  return 6;
}

function appearanceRange(status: SquadStatus, isGoalkeeper: boolean): [number, number] {
  if (isGoalkeeper) {
    if (status === "starter") return [42, 50];
    if (status === "third_keeper") return [0, 4];
    return [2, 12];
  }
  if (status === "starter") return [40, 50];
  if (status === "high_rotation") return [25, 39];
  if (status === "low_rotation") return [15, 24];
  return [5, 14];
}

const GOAL_RATES: Record<PlayerRole, number[]> = {
  attacker: [1.1, 0.85, 0.65, 0.5, 0.3, 0.15, 0.05],
  creator: [0.85, 0.6, 0.45, 0.3, 0.2, 0.1, 0.05],
  support: [0.15, 0.1, 0.08, 0.05, 0.02, 0, 0],
  defensive: [0.1, 0.08, 0.06, 0.04, 0.02, 0, 0],
  goalkeeper: [0, 0, 0, 0, 0, 0, 0],
};

const ASSIST_RATES: Record<PlayerRole, number[]> = {
  attacker: [0.4, 0.3, 0.2, 0.15, 0.1, 0.08, 0.05],
  creator: [0.6, 0.45, 0.35, 0.25, 0.15, 0.08, 0.05],
  support: [0.35, 0.25, 0.18, 0.12, 0.07, 0.03, 0.02],
  defensive: [0.1, 0.07, 0.05, 0.03, 0.01, 0, 0],
  goalkeeper: [0, 0, 0, 0, 0, 0, 0],
};

function teamStrengthMultiplier(domesticReputation: number): number {
  return [0.55, 0.75, 0.95, 1, 1.1, 1.2][clamp(domesticReputation, 0, 5)];
}

function overallOutputMultiplier(overall: number): number {
  const o = clamp(overall, 40, 99);
  if (o <= 65) return 0.6;
  if (o <= 80) return 0.6 + ((o - 65) / 15) * 0.25;
  if (o <= 85) return 0.85 + ((o - 80) / 5) * 0.15;
  if (o <= 95) return 1 + ((o - 85) / 10) * 0.1;
  return 1.1;
}

function concededMultiplier(gap: number): number {
  if (gap >= 10) return 0.5;
  if (gap >= 6) return 0.75;
  if (gap >= 3) return 0.9;
  if (gap >= -2) return 1;
  if (gap >= -5) return 1.1;
  if (gap >= -9) return 1.2;
  return 1.35;
}

function appearanceMultiplier(team: Team): number {
  if (team.domestic_reputation === 0) return 0.7;
  if (team.domestic_reputation === 1) return 0.8;
  if (team.continental_reputation === 0) return 0.9;
  return 1;
}

export function simulateSeasonStats(
  rng: Rng,
  player: Player,
  team: Team,
  modifiers: Modifiers,
): { rng: Rng; stats: SeasonStats; status: SquadStatus } {
  const isGk = player.role === "goalkeeper";
  const base = teamBaseOverall(team);
  const gap = player.overall - base;
  const baseStatus =
    modifiers.roleOverride ??
    shiftSquadStatus(squadStatusFromGap(gap, isGk), isGk, modifiers.roleShift);

  // A benched player at a bigger club still gets a small shot at seizing a real chance this
  // season — smaller the closer the gap, but never quite zero even at a huge club.
  let cur = rng;
  let status = baseStatus;
  const onBench = status === "substitute" || status === "third_keeper" || status === "low_rotation";
  if (!modifiers.roleOverride && onBench) {
    const breakthroughChance = clamp(0.08 - Math.abs(Math.min(0, gap)) * 0.003, 0.015, 0.08);
    const roll = chance(cur, breakthroughChance);
    cur = roll.rng;
    if (roll.success) status = shiftSquadStatus(baseStatus, isGk, 1);
  }

  const range = appearanceRange(status, isGk);
  const appsRoll = nextInt(cur, range[0], range[1]);
  cur = appsRoll.rng;
  // A fitter body holds up to more minutes — Physical nudges appearances within the squad-status band.
  const physicalBoost = 0.85 + 0.3 * (player.attributes.physical / 99);
  const appearances = modifiers.suspended
    ? 0
    : Math.round(appsRoll.value * appearanceMultiplier(team) * physicalBoost);

  if (isGk) {
    const concededBase = [1.4, 1.3, 1.1, 0.9, 0.7, 0.5][clamp(team.domestic_reputation, 0, 5)];
    const jitter = nextFloat(cur, 0.9, 1.1);
    cur = jitter.rng;
    const goalsConceded = Math.max(
      0,
      Math.round(appearances * concededBase * concededMultiplier(gap) * jitter.value),
    );
    const cleanSheets =
      appearances === 0
        ? 0
        : Math.max(
            0,
            Math.round(
              appearances * clamp(0.42 - (goalsConceded / Math.max(1, appearances)) * 0.12, 0.05, 0.5),
            ),
          );
    return {
      rng: cur,
      status,
      stats: {
        ...EMPTY_STATS,
        appearances,
        cleanSheets: Math.max(0, Math.round(cleanSheets * modifiers.statsMultiplier)),
        goalsConceded: Math.max(0, Math.round(goalsConceded * modifiers.statsMultiplier)),
      },
    };
  }

  const bucket = overallGapBucket(gap);
  const jitter = nextFloat(cur, 0.9, 1.1);
  cur = jitter.rng;
  const strength = teamStrengthMultiplier(team.domestic_reputation);
  const output = overallOutputMultiplier(player.overall);
  const scale = strength * jitter.value * modifiers.statsMultiplier * output;
  // Shooting and Passing feed back into the very stats that grow them.
  const shootingBoost = 0.7 + 0.6 * (player.attributes.shooting / 99);
  const passingBoost = 0.7 + 0.6 * (player.attributes.passing / 99);

  return {
    rng: cur,
    status,
    stats: {
      ...EMPTY_STATS,
      appearances,
      goals: Math.max(0, Math.round(appearances * GOAL_RATES[player.role][bucket] * scale * shootingBoost)),
      assists: Math.max(0, Math.round(appearances * ASSIST_RATES[player.role][bucket] * scale * passingBoost)),
    },
  };
}

// ---------------------------------------------------------------------------
// Trophies
// ---------------------------------------------------------------------------

function isTournamentYear(age: number, startAge: number): boolean {
  return age >= startAge && (age - startAge) % TOURNAMENT_CYCLE_YEARS === 0;
}

/** A superstar lifts a mid-table club's effective reputation by one notch. */
function effectiveReputation(overall: number, reputation: number): number {
  return overall >= STAR_PLAYER_OVERALL && reputation < 3 ? Math.min(5, reputation + 1) : reputation;
}

function starBoost(gap: number): number {
  if (gap >= 10) return 1.6;
  if (gap >= 6) return 1.3;
  if (gap >= 3) return 1.1;
  return 1;
}

function secondTierPromotionOdds(overall: number): number {
  return SECOND_TIER_LEAGUE_ODDS.find(([ceiling]) => overall <= ceiling)?.[1] ?? 0.3;
}

/** Odds of going up via a strong finish (automatic spot or playoff), independent of winning the title. */
export function secondTierPlayoffOdds(overall: number): number {
  return SECOND_TIER_PLAYOFF_ODDS.find(([ceiling]) => overall <= ceiling)?.[1] ?? 0.5;
}

/**
 * Odds a genuinely big club (reputation 1-5) goes down anyway, by domestic
 * reputation. Vanishingly small at the very top — Liverpool-tier clubs don't
 * get relegated — but never flatly zero. A once-a-generation collapse is part
 * of the sport.
 */
const BIG_CLUB_RELEGATION_ODDS = [0, 0.02, 0.008, 0.003, 0.001, 0.0003];

/** Reputation floor for a relegation to count as the "worst generation" shock. */
export const BIG_CLUB_RELEGATION_REPUTATION = 4;

export function relegationOdds(player: Player, team: Team): number {
  if (team.domestic_reputation === 0) {
    if (effectiveReputation(player.overall, team.domestic_reputation) >= 1) return 0;
    const output = overallOutputMultiplier(player.overall);
    return clamp(0.05 + 0.1 * ((1.1 - output) / (1.1 - 0.6)), 0.05, 0.15);
  }
  return BIG_CLUB_RELEGATION_ODDS[clamp(team.domestic_reputation, 0, 5)];
}

export interface ClubTrophyContext {
  seasons: { teamId: string; trophies: TrophyKey[] }[];
}

export function simulateClubTrophies(
  rng: Rng,
  player: Player,
  team: Team,
  modifiers: Modifiers,
  context: ClubTrophyContext,
  currentTier: number = 1,
): { rng: Rng; trophies: ClubTrophyKey[] } {
  // A relegated club is still the same club — but the competition it's actually
  // playing in this season is the OTHER tier's league, not its "home" one. The
  // static dataset only ever lists a team once (at its default tier), so this
  // swaps in the right league object whenever teamTierOverrides says otherwise.
  const homeLeague = getLeagueOfTeam(team.id);
  const league = homeLeague
    ? (getLeagueByTier(homeLeague.country_fifa_code, currentTier) ?? homeLeague)
    : null;
  const country = league ? getCountryByFifa(league.country_fifa_code) : null;
  const confederation = league?.confederation || country?.confederation || "";

  const gapBoost = starBoost(player.overall - teamBaseOverall(team));
  const domesticRep = effectiveReputation(player.overall, team.domestic_reputation);
  const continentalRep = effectiveReputation(player.overall, team.continental_reputation);

  const isSecondTier =
    league?.tier === 2 && Boolean(getLeagueByTier(league.country_fifa_code, 1));

  const leagueOdds = isSecondTier
    ? Math.min(0.3, secondTierPromotionOdds(player.overall) * modifiers.leagueTrophyProbabilityMultiplier)
    : CLUB_TROPHY_PROBABILITY.league[clamp(domesticRep, 0, 5)] *
      modifiers.leagueTrophyProbabilityMultiplier;

  // Colombia's cup is effectively the league playoff, so it mirrors league odds.
  const cupOdds = !hasDomesticCup(league?.domestic_cup_id)
    ? null
    : league?.country_fifa_code.trim().toUpperCase() === "COL"
      ? leagueOdds
      : CLUB_TROPHY_PROBABILITY.cup[clamp(domesticRep, 0, 5)] *
        modifiers.domesticCupTrophyProbabilityMultiplier;

  // [trophy, probability, boostedByStarPlayer]
  const candidates: [ClubTrophyKey, number, boolean][] = [["league", leagueOdds, !isSecondTier]];
  if (cupOdds !== null) candidates.push(["cup", cupOdds, true]);

  // Continental football is earned through the *top* flight. A club playing in
  // the second division simply isn't entered in those competitions, no matter
  // how good one of its players is — so they're not even candidates this
  // season. (The domestic cup stays available: second-tier sides do enter it,
  // and a cup run is exactly how a small club gatecrashes the big time.)
  if (!isSecondTier) {
    candidates.push(
      [
        "continental_primary",
        CONTINENTAL_TROPHY_PROBABILITY.continental_primary[clamp(continentalRep, 0, 5)] *
          modifiers.continentalPrimaryTrophyProbabilityMultiplier,
        true,
      ],
      [
        "continental_secondary",
        CONTINENTAL_TROPHY_PROBABILITY.continental_secondary[clamp(continentalRep, 0, 5)] *
          modifiers.continentalSecondaryTrophyProbabilityMultiplier,
        true,
      ],
    );
    if (isTournamentYear(player.age, CLUB_WORLD_CUP_START_AGE)) {
      candidates.push([
        "club_world_cup",
        (CLUB_WORLD_CUP_PROBABILITY[confederation.trim().toUpperCase()]?.[clamp(continentalRep, 0, 5)] ?? 0) *
          modifiers.clubWorldCupTrophyProbabilityMultiplier,
        true,
      ]);
    }
  }

  const last = context.seasons[context.seasons.length - 1] ?? null;
  const sameClub = last?.teamId === team.id;
  const wonLeagueLastYear = sameClub ? last!.trophies.includes("league") : false;
  const wonPrimaryLastYear = sameClub ? last!.trophies.includes("continental_primary") : false;
  const wonSecondaryLastYear = sameClub ? last!.trophies.includes("continental_secondary") : false;
  const confHasSecondary = Boolean(
    getConfederationTrophies(confederation)?.continental_trophies.continental_secondary,
  );

  const won: ClubTrophyKey[] = [];
  let cur = rng;
  let wonPrimaryThisYear = false;

  for (const [trophy, probability, boosted] of candidates) {
    if (trophy === "continental_secondary" && !confHasSecondary) continue;
    // Winning the league or the top continental cup promotes you out of the
    // secondary competition, so it can't be won in the same or next season.
    if (
      trophy === "continental_secondary" &&
      (wonPrimaryThisYear || wonLeagueLastYear || wonPrimaryLastYear || wonSecondaryLastYear)
    ) {
      continue;
    }
    const override = modifiers.clubTrophyOverride?.trophy === trophy ? modifiers.clubTrophyOverride : null;
    const roll = override
      ? { rng: cur, success: override.result === "force" }
      : chance(cur, Math.min(1, probability * (boosted ? gapBoost : 1)));
    cur = roll.rng;
    if (roll.success) {
      won.push(trophy);
      if (trophy === "continental_primary") wonPrimaryThisYear = true;
    }
  }

  return { rng: cur, trophies: won };
}

// ---------------------------------------------------------------------------
// National team
// ---------------------------------------------------------------------------

/**
 * One player moves a national side far less than they move a club: there's no
 * daily training ground chemistry to lean on, just a squad that assembles for
 * a few weeks. So the same "vastly better than my teammates" gap needs to be
 * roughly twice as large here to earn the same boost a club gets — and even
 * then the boost tops out lower. A generational talent from a weak footballing
 * nation nudges the odds; they don't single-handedly turn Angola into Brazil.
 */
function nationalStarBoost(gap: number): number {
  if (gap >= 20) return 1.6;
  if (gap >= 12) return 1.3;
  if (gap >= 6) return 1.1;
  return 1;
}

/** How far above (or below) their national teammates' typical level this player is. */
function nationalSquadGap(player: Player): number {
  return player.overall - TEAM_BASE_OVERALL[clamp(player.nationality.international_reputation, 0, 5)];
}

export function buildUpcomingTournaments(
  rng: Rng,
  player: Player,
  seasons: number,
): { rng: Rng; tournaments: NationalTournament[] } {
  let cur = rng;
  const list: NationalTournament[] = [];
  for (let i = 0; i < seasons; i += 1) {
    const age = player.age + i;
    if (isTournamentYear(age, CONTINENTAL_TOURNAMENT_START_AGE)) {
      list.push({ trophy: "national_continental", age, selectionQualified: true });
    }
    if (isTournamentYear(age, WORLD_CUP_START_AGE)) {
      const repIdx = clamp(player.nationality.continental_reputation, 0, WORLD_CUP_QUALIFY_PROBABILITY.length - 1);
      const qualified = chance(cur, WORLD_CUP_QUALIFY_PROBABILITY[repIdx]);
      cur = qualified.rng;
      list.push({ trophy: "world_cup", age, selectionQualified: qualified.success });
    }
  }
  return { rng: cur, tournaments: list };
}

export function simulateNationalTeam(
  rng: Rng,
  player: Player,
  tournaments: NationalTournament[],
  modifiers: Modifiers,
): { rng: Rng; trophies: TrophyKey[]; calledUp: boolean } {
  if (modifiers.suspended) return { rng, trophies: [], calledUp: false };

  const continental = tournaments.find(
    (t) => t.age === player.age && t.trophy === "national_continental",
  );
  const world = tournaments.find((t) => t.age === player.age && t.trophy === "world_cup");
  const hasContinental = Boolean(continental?.selectionQualified);
  const hasWorldCup = Boolean(world?.selectionQualified);
  if (!hasContinental && !hasWorldCup) return { rng, trophies: [], calledUp: false };

  const threshold =
    CALL_UP_THRESHOLD[clamp(player.nationality.international_reputation, 0, CALL_UP_THRESHOLD.length - 1)];
  const skipsThisTournament =
    modifiers.nationalTournament &&
    tournaments.some((t) => t.age === player.age && t.trophy === modifiers.nationalTournament);

  if (
    (modifiers.nationalTournamentParticipation === "skip" && skipsThisTournament) ||
    (player.overall < threshold && modifiers.nationalTournamentParticipation !== "force")
  ) {
    return { rng, trophies: [], calledUp: false };
  }

  let cur = rng;
  const won: TrophyKey[] = [];
  const boost = nationalStarBoost(nationalSquadGap(player));

  if (hasContinental) {
    const repIdx = clamp(
      player.nationality.continental_reputation,
      0,
      NATIONAL_CONTINENTAL_PROBABILITY.length - 1,
    );
    const override = modifiers.nationalTrophyOverride?.trophy === "national_continental" ? modifiers.nationalTrophyOverride : null;
    const roll = override
      ? { rng: cur, success: override.result === "force" }
      : chance(cur, Math.min(1, NATIONAL_CONTINENTAL_PROBABILITY[repIdx] * boost));
    cur = roll.rng;
    if (roll.success) won.push("national_continental");
  }

  if (hasWorldCup) {
    const repIdx = clamp(player.nationality.fifa_reputation, 0, WORLD_CUP_WIN_PROBABILITY.length - 1);
    const override = modifiers.nationalTrophyOverride?.trophy === "world_cup" ? modifiers.nationalTrophyOverride : null;
    const roll = override
      ? { rng: cur, success: override.result === "force" }
      : chance(cur, Math.min(1, WORLD_CUP_WIN_PROBABILITY[repIdx] * boost));
    cur = roll.rng;
    if (roll.success) won.push("world_cup");
  }

  return { rng: cur, trophies: won, calledUp: true };
}

// ---------------------------------------------------------------------------
// Individual awards
// ---------------------------------------------------------------------------

function ballonDorOdds(overall: number, trophies: TrophyKey[]): number {
  const wonLeague = trophies.includes("league");
  const wonContinental = trophies.includes("continental_primary");
  if (overall >= 97) return 1;
  if (overall >= 94) {
    if (wonLeague && wonContinental) return 1;
    return wonContinental ? 0.8 : wonLeague ? 0.65 : 0.5;
  }
  if (overall >= 90) {
    if (wonLeague && wonContinental) return 0.6;
    return wonContinental ? 0.4 : wonLeague ? 0.3 : 0.2;
  }
  if (overall >= 85) {
    if (wonLeague && wonContinental) return 0.1;
    if (wonContinental) return 0.05;
    if (wonLeague) return 0.01;
  }
  return 0;
}

function roleAwardMultiplier(role: PlayerRole): number {
  if (role === "support") return 0.5;
  if (role === "defensive") return 0.25;
  return 1;
}

function goldenBootOdds(stats: SeasonStats, inTopConfederation: boolean): number {
  if (!inTopConfederation) return 0;
  if (stats.goals >= 50) return 1;
  if (stats.goals >= 40) return 0.5;
  if (stats.goals >= 30) return 0.25;
  return 0;
}

export function simulateAwards(
  rng: Rng,
  player: Player,
  stats: SeasonStats,
  trophies: TrophyKey[],
  inUefa: boolean,
): { rng: Rng; awards: AwardKey[] } {
  const awards: AwardKey[] = [];
  let cur = rng;

  const topOdds = ballonDorOdds(player.overall, trophies) * roleAwardMultiplier(player.role);
  const topRoll = chance(cur, topOdds);
  cur = topRoll.rng;
  if (topRoll.success) {
    awards.push(player.role === "goalkeeper" ? "golden_glove" : "ballon_dor");
  }

  if (player.role !== "goalkeeper") {
    const bootRoll = chance(cur, goldenBootOdds(stats, inUefa));
    cur = bootRoll.rng;
    if (bootRoll.success) awards.push("golden_boot");
  }

  return { rng: cur, awards };
}

export function addStats(a: SeasonStats, b: SeasonStats): SeasonStats {
  return {
    appearances: a.appearances + b.appearances,
    goals: a.goals + b.goals,
    assists: a.assists + b.assists,
    cleanSheets: a.cleanSheets + b.cleanSheets,
    goalsConceded: a.goalsConceded + b.goalsConceded,
  };
}

export const NO_MODIFIERS: Modifiers = { ...BASE_MODIFIERS };
