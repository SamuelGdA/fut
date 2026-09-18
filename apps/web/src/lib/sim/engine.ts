import { chance, clamp, createRng, nextFloat, nextInt, pickOne, pickWeighted, type Rng } from "./rng";
import type { Attributes } from "./attributes";
import {
  ALL_POSITIONS,
  BASE_MODIFIERS,
  CALL_UP_THRESHOLD,
  CLUB_TROPHY_PROBABILITY,
  CLUB_WORLD_CUP_CHAMPION_ODDS,
  CLUB_WORLD_CUP_QUALIFYING_SEASONS,
  CLUB_WORLD_CUP_PROBABILITY,
  CLUB_WORLD_CUP_START_AGE,
  INTERCONTINENTAL_ODDS,
  INTERCONTINENTAL_SAME_SEASON,
  CONTINENTAL_TOURNAMENT_START_AGE,
  CONTINENTAL_TROPHY_PROBABILITY,
  EMPTY_STATS,
  isDefender,
  KNOCK_AGE_RAMP,
  KNOCK_BASE_PROBABILITY,
  KNOCK_TYPES,
  LEAGUE_CUP_PROBABILITY,
  NATIONAL_CONTINENTAL_PROBABILITY,
  SUPER_CUP_PROBABILITY,
  SUPER_CUP_STAR_BOOST_DAMPING,
  ROLE_POSITIONS,
  FAN_SUPPORT_BANDS,
  FAN_SUPPORT_MAX,
  FAN_SUPPORT_MIN,
  PERSONALITY_TRAITS,
  promotionFormat,
  SECOND_TIER_LEAGUE_ODDS,
  SECOND_TIER_PLAYOFF_ODDS,
  STAR_PLAYER_OVERALL,
  DIFFICULTY_CONFIG,
  type Difficulty,
  TALENT_REVEAL_GATES,
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
import {
  getDomesticSuperCup,
  getLeagueCup,
  type AwardKey,
  type ClubTrophyKey,
  type TrophyKey,
} from "@/lib/data/trophies";

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
    // A keeper is picked on trust as much as on rating, and a manager who has
    // settled on one plays him every week. Demanding that he be at or above
    // the club's whole level before he starts meant keepers at big clubs sat
    // out entire spells, which is why no keeper career came close to the
    // appearance or clean-sheet records those clubs' keepers actually hold.
    if (gap >= -3) return "starter";
    if (gap >= -8) return "substitute";
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

export type FanBand = "unknown" | "hostile" | "cold" | "warm" | "loved" | "adored";

/**
 * What the stand makes of a player.
 *
 * Hostility is a fall from something. A crowd that once had this player at
 * sixty and now has him at ten has turned on him; a crowd that has never had
 * him above ten has simply not been won over yet, and those two are not the
 * same feeling even though the meter reads the same. Passing the high-water
 * mark of the current spell is what separates them.
 *
 * It matters most at the very start. A player out of the academy signs with
 * nothing — nobody has heard of him — and takes a few seasons to build any
 * goodwill at all, so without this every career opened with three years of
 * "Hostile" for the crime of being sixteen.
 *
 * The default assumes a spell that peaked well, which is what every caller
 * looking back at a finished career wants.
 */
export function fanBand(support: number, peakSupport = FAN_SUPPORT_MAX): FanBand {
  if (support < FAN_SUPPORT_BANDS.hostile && peakSupport < FAN_SUPPORT_BANDS.cold) {
    return "unknown";
  }
  if (support < FAN_SUPPORT_BANDS.hostile) return "hostile";
  if (support < FAN_SUPPORT_BANDS.cold) return "cold";
  if (support < FAN_SUPPORT_BANDS.warm) return "warm";
  if (support < FAN_SUPPORT_BANDS.loved) return "loved";
  return "adored";
}

/**
 * How much of a season the terraces expect to see, by age.
 *
 * Nobody boos a seventeen-year-old for playing eleven games — that *is* the
 * season a seventeen-year-old is supposed to have. Judging every player
 * against a full campaign meant a career opened with the crowd souring
 * simply for being young, which is the opposite of how a promoted academy
 * player is actually received. It scales both the bar for minutes and the
 * standing impatience, so a teenager is neither rewarded nor punished much
 * either way; a twenty-two-year-old is judged like everybody else.
 */
function expectedInvolvement(age: number): number {
  if (age <= 17) return 0.3;
  if (age <= 19) return 0.55;
  if (age <= 21) return 0.8;
  return 1;
}
/**
 * How the terraces react to a season. Output and silverware win them over,
 * a season spent injured or on the bench cools them off, and simply staying
 * put earns a little trust every year.
 */
export function fanSupportDelta(
  stats: SeasonStats,
  /** Weighted worth of the season's silverware, not the count — see `trophyImportance`. */
  trophies: number,
  role: PlayerRole,
  trait: PersonalityTrait,
  age: number,
): number {
  const expected = expectedInvolvement(age);

  // A season watched from the treatment room or the bench costs you real
  // goodwill — less of it the younger the player, for the same reason the
  // bar below is lower.
  if (stats.appearances === 0) return -14 * expected;

  const minutes = clamp(stats.appearances / (34 * expected), 0, 1);
  const production =
    role === "goalkeeper"
      ? clamp(stats.cleanSheets / Math.max(1, stats.appearances) / 0.4, 0, 1)
      : clamp((stats.goals + stats.assists) / Math.max(1, stats.appearances) / 0.5, 0, 1);

  // Deliberately starts negative: simply being on the payroll loses a terrace's
  // patience, and you claw it back with minutes, output and silverware. A squad
  // player drifts down, a star climbs fast — which is what makes the crowd
  // reaction events actually reachable in both directions.
  const earned = -6 * expected + minutes * 8 + production * 12 + trophies * 6;
  return earned + TRAIT_EFFECTS[trait].fanSupport;
}

export function applyFanSupport(current: number, delta: number): number {
  return clamp(current + delta, FAN_SUPPORT_MIN, FAN_SUPPORT_MAX);
}

/**
 * How much of a good season's goodwill actually lands, given where the meter
 * already sits.
 *
 * Without this the support curve was a ratchet: a starter clears +20 a season,
 * so every career pinned to 100 by about year three and stayed there — the
 * meter stopped saying anything and no crowd event on the negative side was
 * ever reachable again. Damping the top end keeps adoration something you hold
 * on to rather than something you bank once.
 */
export function fanCeilingDamping(current: number): number {
  return clamp((FAN_SUPPORT_MAX - current) / 55, 0.3, 1);
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
 * The share of a tier's seasons requirement below which nothing else can
 * rescue the spell. Stops a single trophy-laden season from buying a legacy.
 */
const STANDING_MIN_SEASON_RATIO = 0.6;
/** Trophies weigh slightly more than longevity — they are what gets sung about. */
const STANDING_TROPHY_WEIGHT = 0.55;

/**
 * What this club's fans will remember you as. Scales with the club's own
 * size: one trophy already makes you a legend at a small side, but the same
 * trophy is a footnote at a giant, who needs several — and genuinely
 * important ones — before the terraces start calling you a legend. Either
 * way it also requires having actually played: winning things while barely
 * featuring earns loyalty, not devotion.
 *
 * Longevity and silverware trade off against each other rather than both
 * being hard gates. They used to be a strict AND, which produced the reading
 * nobody would defend: four seasons at PSG with eleven trophies and more
 * minutes than a starter came out as "regular", because it was one season
 * short — even though the haul was nearly double what that club asks of a
 * *legend*. Now an overwhelming haul can cover a shorter stay, and a long
 * servant with modest silverware is still remembered, while the floor on
 * seasons keeps one glorious year from being enough on its own.
 */
export function clubStanding(input: ClubStandingInput): ClubStanding {
  const rep = clamp(input.clubReputation, 0, 5);
  const tiers: { standing: Exclude<ClubStanding, "passing">; minSeasons: number; minTrophyScore: number; minPlayedShare: number }[] = [
    { standing: "legend", minSeasons: Math.round(4 + rep * 0.6), minTrophyScore: 1 + rep * 1.1, minPlayedShare: 0.55 },
    // Four seasons is enough to be an idol even at the biggest clubs — the
    // real game is full of them. The old 5-at-rep-5 bar meant a four-year
    // spell full of trophies could never be more than "regular".
    { standing: "idol", minSeasons: Math.round(2 + rep * 0.4), minTrophyScore: 0.4 + rep * 0.55, minPlayedShare: 0.4 },
    { standing: "regular", minSeasons: Math.round(1 + rep * 0.4), minTrophyScore: 0, minPlayedShare: 0 },
  ];
  for (const tier of tiers) {
    if (input.playedShare < tier.minPlayedShare) continue;

    const seasonRatio = tier.minSeasons > 0 ? input.seasons / tier.minSeasons : 1;
    if (seasonRatio < STANDING_MIN_SEASON_RATIO) continue;
    // A tier that asks for no silverware at all is judged on service alone.
    const trophyRatio =
      tier.minTrophyScore > 0 ? input.trophyScore / tier.minTrophyScore : 1;

    const merit =
      (1 - STANDING_TROPHY_WEIGHT) * seasonRatio + STANDING_TROPHY_WEIGHT * trophyRatio;
    if (merit >= 1) return tier.standing;
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
 * Chance that crossing the threshold actually produces a rival.
 *
 * It used to be automatic, which meant every good career had one and the whole
 * thread stopped meaning anything — a rival you were always going to get is
 * just another stat box. Rolled exactly once, the first season the bar is
 * cleared, so a failed roll is permanent and having one is genuinely a
 * feature of *this* career rather than of being good.
 */
export const RIVAL_ASSIGNMENT_CHANCE = 0.6;

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
export type ScoutCertainty = "unknown" | "rumour" | "approximate" | "exact";

export function scoutedTalent(
  seed: string,
  talentTier: TalentTier,
  age: number,
  careerAppearances: number,
): { certainty: ScoutCertainty; tiers: TalentTier[] } {
  const cleared = (gate: { age: number; appearances: number }) =>
    age >= gate.age && careerAppearances >= gate.appearances;

  if (!cleared(TALENT_REVEAL_GATES.rumour)) return { certainty: "unknown", tiers: [] };

  const idx = TALENT_TIER_ORDER.indexOf(talentTier);
  const band = (centre: number): TalentTier[] => {
    const lo = Math.max(0, Math.min(centre, TALENT_TIER_ORDER.length - 2));
    return [TALENT_TIER_ORDER[lo], TALENT_TIER_ORDER[lo + 1]];
  };

  if (cleared(TALENT_REVEAL_GATES.exact)) return { certainty: "exact", tiers: [talentTier] };

  // The middle read narrows it to two tiers, and is still allowed to be
  // wrong about a third of the time. A band that always contains the answer
  // is the answer with one extra step: by the late twenties a club should
  // have a strong idea of what it has, not a guarantee.
  if (cleared(TALENT_REVEAL_GATES.approximate)) {
    const nudge = pickWeighted(createRng(`${seed}:scout-approx`), [
      { item: -1, weight: 17 },
      { item: 0, weight: 66 },
      { item: 1, weight: 17 },
    ]).item;
    return { certainty: "approximate", tiers: band(idx + nudge) };
  }

  // The early read is a *rumour*, and rumours are often wrong. Shifting the
  // band off the true tier is the entire point: it gives a young career
  // something to hope for or fear without ever being bankable, so nobody can
  // restart their way to a guaranteed prodigy. Two tiers of drift are on the
  // table, so a genuine phenomenon can be written off at twenty-two and an
  // ordinary talent can be talked about as the next great thing. Seeded, so
  // the same career always hears the same rumour.
  const drift = pickWeighted(createRng(`${seed}:scout-rumour`), [
    { item: -2, weight: 12 },
    { item: -1, weight: 24 },
    { item: 0, weight: 28 },
    { item: 1, weight: 24 },
    { item: 2, weight: 12 },
  ]).item;
  return { certainty: "rumour", tiers: band(idx + drift) };
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

/**
 * Games a season, by how much the manager trusts you.
 *
 * The starter band used to top out at 50, which quietly made a whole class of
 * real career impossible: a first-choice player at a club going deep in every
 * competition plays a 38-game league season plus a domestic cup run, a
 * full continental campaign and the super cups on top — comfortably 60 and
 * occasionally more. Capping that at 50 meant even a 24-season career could
 * only reach about 1,150 appearances, so the genuine longevity records were
 * unreachable by arithmetic rather than by difficulty.
 */
function appearanceRange(status: SquadStatus, isGoalkeeper: boolean): [number, number] {
  if (isGoalkeeper) {
    if (status === "starter") return [45, 59];
    if (status === "third_keeper") return [0, 4];
    return [2, 14];
  }
  if (status === "starter") return [44, 61];
  if (status === "high_rotation") return [27, 42];
  if (status === "low_rotation") return [16, 26];
  return [5, 15];
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

/**
 * How rare it is to keep pushing a per-game output rate past what a very
 * good season already looks like — a chance to clear, not a wall.
 *
 * Goals and assists are each the product of several independent rolls (role
 * rate, squad strength, overall, the relevant attribute, a season's own
 * jitter), and once in a while all of them land high at the same time. Left
 * alone that compounds without limit: a world-class striker at a giant club
 * could reach 2.03 goals a game, which over a 50-game season is 107 — more
 * than Cristiano Ronaldo's best-ever tally in the same competition, and not
 * as a once-in-a-thousand-careers outlier but as a number a good save
 * cleared routinely.
 *
 * A flat cap was the wrong fix for that: it made a genuinely historic season
 * mathematically impossible, which is no more honest than letting it happen
 * every time. Instead the raw, uncapped rate is still what gets scored — it
 * just has to clear a gate to survive intact. Below the first threshold
 * nothing is rolled at all, so a normal season is untouched. Above it, each
 * successive threshold needs its own roll, checked from the top down: the
 * raw rate only survives whole if it clears every gate its value is above,
 * and failing one settles the season at that gate's own rate rather than
 * zeroing it out. A season on pace for 107 goals still has a real, small,
 * named chance of actually landing there — it is just no longer the modal
 * outcome of "great striker, great club, decent luck."
 */
interface RarityGate {
  /** Rates above this must clear the roll to be kept in full. */
  above: number;
  /** Chance of keeping the raw rate once past this gate. */
  chance: number;
}

function applyRarityGates(rng: Rng, rawRate: number, gates: RarityGate[]): { rng: Rng; rate: number } {
  let cur = rng;
  let rate = rawRate;
  for (const gate of gates) {
    if (rate <= gate.above) continue;
    const roll = chance(cur, gate.chance);
    cur = roll.rng;
    if (!roll.success) rate = gate.above;
  }
  return { rng: cur, rate };
}

/**
 * Calibrated in goals per game so a season's length never changes what counts
 * as exceptional. Under 0.75 (well short of 40 goals across a 50-game season)
 * is an ordinary great season and needs no roll. Past that, one gate for "a
 * really good year", a second for matching Messi's real 73-goal record pace,
 * and a third — cleared roughly one season in a thousand once the rate is
 * already there — for going past it, into territory no real player has ever
 * reached at all.
 */
const GOAL_RARITY_GATES: RarityGate[] = [
  { above: 0.75, chance: 0.22 },
  { above: 1.05, chance: 0.08 },
  { above: 1.46, chance: 0.012 },
];
/**
 * Same shape, calibrated around the real single-season assist mark.
 *
 * Twenty-one in a season is the record, and a full season here runs to about
 * fifty-five games — so the record is a rate of roughly 0.38 a game, and every
 * gate has to sit around it rather than above it. They used to start at 0.42,
 * which is twenty-three assists ungated: nine per cent of *all* careers beat
 * the record, and five hundred seasons in twelve hundred careers went past it.
 * Nothing here is a cap — the top gate still opens about once in a hundred
 * seasons that reach it — but the record should be a career’s headline, not a
 * regular Tuesday.
 */
const ASSIST_RARITY_GATES: RarityGate[] = [
  { above: 0.27, chance: 0.4 },
  { above: 0.33, chance: 0.08 },
  { above: 0.385, chance: 0.008 },
  { above: 0.46, chance: 0.0025 },
];

/**
 * Goals against per game by the standing of the club, before whoever is
 * playing is taken into account. The top end sits where the best defences in
 * Europe actually sit over a full season in all competitions — around 0.6.
 */
function concededBase(team: Team): number {
  return [1.45, 1.35, 1.15, 0.95, 0.8, 0.68][clamp(team.domestic_reputation, 0, 5)];
}
/**
 * How often a keeper conceding at this rate actually finishes a game with a
 * zero next to their name.
 *
 * Goals arrive roughly as a Poisson process, so the share of games with none
 * at all is e^-lambda, not a straight line down from a fixed starting point.
 * The line this replaces ran from 36% at half a goal a game to 25% at 1.4,
 * which is far too flat at the good end: a keeper conceding 0.6 a game kept
 * 35% of his games clean here, when the real ones at that rate keep about
 * 55% — Ederson's 2018-19 was 21 in 38 at 0.61 a game. That gap is what made
 * a good goalkeeper's card read as if he leaked goals.
 *
 * The small quadratic term is overdispersion. Real goals cluster — a team
 * that concedes one tends to concede two — so bad sides fall below the pure
 * Poisson line: Huddersfield's 2018-19 kept 8% of their games clean at two a
 * game, against the 13.5% e^-2 would predict.
 */
function cleanSheetRate(concededPerGame: number): number {
  const lambda = Math.max(0, concededPerGame);
  return clamp(Math.exp(-lambda * (1 + 0.1 * lambda)), 0.03, 0.65);
}

/**
 * What a keeper of this standing does to the goals his team ships.
 *
 * Deliberately a narrower band than it used to be. A great goalkeeper is
 * worth several points a season, not half the goals against: the old top
 * step halved them, which took an elite side down to 0.43 a game — below
 * anything a real defence has managed over a full season in every
 * competition. Most of what keeps goals out is the eleven in front of him.
 */
function concededMultiplier(gap: number): number {
  if (gap >= 10) return 0.72;
  if (gap >= 6) return 0.84;
  if (gap >= 3) return 0.93;
  if (gap >= -2) return 1;
  if (gap >= -5) return 1.1;
  if (gap >= -9) return 1.2;
  return 1.35;
}

/**
 * How many fixtures the club itself generates.
 *
 * A side that goes deep in Europe and turns up at the Club World Cup simply
 * plays more football than a mid-table one, and its first choice plays most of
 * it — which is the honest reason the all-time appearance records belong to
 * players who spent their careers at clubs that were always still in every
 * competition in April.
 */
function appearanceMultiplier(team: Team): number {
  if (team.domestic_reputation === 0) return 0.7;
  if (team.domestic_reputation === 1) return 0.8;
  if (team.continental_reputation === 0) return 0.9;
  if (team.continental_reputation >= 4) return 1.04;
  return 1;
}

export interface SeasonKnock {
  type: string;
  matchesMissed: number;
}

/**
 * The everyday knock: a few weeks out, no decision, no headline.
 *
 * Deliberately invisible in the moment — it shows up only as a season where
 * the appearance count is lower than it should have been, which is exactly how
 * a minor injury reads from the outside. A fitter player misses fewer of them,
 * and an older one picks up more, so Physical and age both keep mattering
 * after a career stops growing.
 */
export function rollSeasonKnock(
  rng: Rng,
  player: Player,
  appearances: number,
): { rng: Rng; knock: SeasonKnock | null } {
  // Nothing to miss if the season was never played.
  if (appearances < 8) return { rng, knock: null };

  const fitness = player.attributes.physical / 99;
  const ageRamp = Math.max(0, player.age - 29) * KNOCK_AGE_RAMP;
  const probability = clamp(KNOCK_BASE_PROBABILITY * (1.3 - 0.7 * fitness) + ageRamp, 0.04, 0.5);

  const roll = chance(rng, probability);
  if (!roll.success) return { rng: roll.rng, knock: null };

  const picked = pickWeighted(roll.rng, KNOCK_TYPES.map((k) => ({ item: k, weight: k.weight })));
  const span = nextInt(picked.rng, picked.item.matches[0], picked.item.matches[1]);
  // Never wipe out a whole season — that is what the severe-injury event is for.
  const matchesMissed = Math.min(span.value, Math.max(1, Math.floor(appearances * 0.4)));
  return { rng: span.rng, knock: { type: picked.item.type, matchesMissed } };
}

export function simulateSeasonStats(
  rng: Rng,
  player: Player,
  team: Team,
  modifiers: Modifiers,
): { rng: Rng; stats: SeasonStats; status: SquadStatus; knock: SeasonKnock | null } {
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
  const physicalBoost = 0.88 + 0.22 * (player.attributes.physical / 99);
  const fullSeasonApps = modifiers.suspended
    ? 0
    : Math.round(appsRoll.value * appearanceMultiplier(team) * physicalBoost);

  // A knock is taken off the top, before any production is derived, so the
  // goals and clean sheets scale down with the games actually played rather
  // than being computed for a season the player did not have.
  const knockRoll = rollSeasonKnock(cur, player, fullSeasonApps);
  cur = knockRoll.rng;
  const knock = knockRoll.knock;
  const appearances = Math.max(0, fullSeasonApps - (knock?.matchesMissed ?? 0));

  if (isGk) {
    const jitter = nextFloat(cur, 0.9, 1.1);
    cur = jitter.rng;
    const goalsConceded = Math.max(
      0,
      Math.round(appearances * concededBase(team) * concededMultiplier(gap) * jitter.value),
    );
    const cleanSheets =
      appearances === 0
        ? 0
        : Math.round(appearances * cleanSheetRate(goalsConceded / appearances));
    return {
      rng: cur,
      status,
      knock,
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
  //
  // Steeper than a straight line, and starting lower. A flat 0.7-to-1.3 band
  // meant a good overall carried a player to a lot of assists whether or not
  // they could actually pass: the difference between a 55 and a 95 passer was
  // a quarter, when it should be a factor of three. Squaring the relationship
  // is what makes the creative records belong to creative players.
  // Passing is the steeper of the two on purpose. Chances created are the one
  // thing a good overall was carrying entirely on its own: the difference
  // between a 55 and a 95 passer used to be a quarter, when it should be a
  // factor of three. Finishing keeps a gentler curve because the position and
  // the role already decide most of who gets the chances in the first place.
  const shootingBoost = 0.55 + 0.85 * Math.pow(player.attributes.shooting / 99, 1.3);
  const passingBoost = 0.25 + 1.25 * Math.pow(player.attributes.passing / 99, 1.8);

  // Ratings only roll for the gates their raw rate is actually above, so a
  // normal season never touches this RNG stream at all.
  const goalGate = applyRarityGates(cur, GOAL_RATES[player.role][bucket] * scale * shootingBoost, GOAL_RARITY_GATES);
  cur = goalGate.rng;
  const assistGate = applyRarityGates(cur, ASSIST_RATES[player.role][bucket] * scale * passingBoost, ASSIST_RARITY_GATES);
  cur = assistGate.rng;

  // A defender's season does not read off goals and assists, so it gets the
  // number defenders are actually judged on. Their own quality counts for
  // less than a keeper's — one of a back four rather than the last man — so
  // the same multiplier is blended halfway back towards the team's own rate.
  let cleanSheets = 0;
  if (isDefender(player.position) && appearances > 0) {
    const shield = 1 + (concededMultiplier(gap) - 1) * 0.5;
    const conceded = concededBase(team) * shield * jitter.value;
    cleanSheets = Math.max(
      0,
      Math.round(appearances * cleanSheetRate(conceded) * modifiers.statsMultiplier),
    );
  }

  return {
    rng: cur,
    status,
    knock,
    stats: {
      ...EMPTY_STATS,
      appearances,
      cleanSheets,
      // Gated per game, not per season, so a long injury-free run is still
      // rewarded with more goals — only the *rate* is gated.
      goals: Math.max(0, Math.round(appearances * goalGate.rate)),
      assists: Math.max(0, Math.round(appearances * assistGate.rate)),
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
export function secondTierPlayoffOdds(overall: number, fifaCode?: string): number {
  const base = SECOND_TIER_PLAYOFF_ODDS.find(([ceiling]) => overall <= ceiling)?.[1] ?? 0.5;
  const format = promotionFormat(fifaCode);

  // The champion is already handled by the league-title roll, so what is left
  // here is the race for the remaining places. More of them means a better
  // chance; a playoff for the last one means less certainty than an automatic
  // spot, because a knockout can be lost by a team that finished well clear.
  const remaining = Math.max(0, format.slots - 1);
  const slotFactor = remaining / 2;
  const playoffPenalty = format.playoff ? 0.82 : 1;
  return clamp(base * slotFactor * playoffPenalty, 0, 0.6);
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

/**
 * What holding the continent already costs a club going for another.
 *
 * Retaining it happens: Milan did it, Real Madrid did it. A *third* in a
 * row has happened once in the history of the competition, which is why the
 * record is three, and one generational career in five was matching it.
 * Back to back therefore keeps most of its odds and the three-peat is what
 * gets priced properly.
 */
function retainContinentalDamper(streak: number): number {
  if (streak <= 0) return 1;
  if (streak === 1) return 0.72;
  return 0.3;
}

/** Half the usual star-player effect — see SUPER_CUP_STAR_BOOST_DAMPING. */
function dampedBoost(gapBoost: number): number {
  return 1 + (gapBoost - 1) * SUPER_CUP_STAR_BOOST_DAMPING;
}

export interface ClubTrophyContext {
  /** Every season played so far, oldest first. Only the last one is read, but
   *  `leagueTier` matters: a second-division title does not put a club into the
   *  top flight's super cup. */
  seasons: { teamId: string; trophies: TrophyKey[]; leagueTier: number }[];
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

  // Second domestic knockout. Deliberately available from the second tier too —
  // that is the whole character of the EFL Cup.
  if (getLeagueCup(league?.country_fifa_code)) {
    candidates.push([
      "league_cup",
      LEAGUE_CUP_PROBABILITY[clamp(domesticRep, 0, 5)] * modifiers.domesticCupTrophyProbabilityMultiplier,
      true,
    ]);
  }

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
      [
        "continental_tertiary",
        CONTINENTAL_TROPHY_PROBABILITY.continental_tertiary[clamp(continentalRep, 0, 5)] *
          modifiers.continentalSecondaryTrophyProbabilityMultiplier,
        true,
      ],
    );
  }

  // ---------------------------------------------------------------------
  // Last season, at this same club. Super cups are the season *after* the
  // titles that earn them, so this is the only thing that puts them on the
  // table at all.
  //
  // Only same-club continuity counts. The sim tracks results for the clubs the
  // player actually played for and nobody else, so signing for a champion in
  // the summer cannot be detected — inventing it would mean inventing a title
  // nobody won. Staying and defending is what unlocks these.
  // ---------------------------------------------------------------------
  const last = context.seasons[context.seasons.length - 1] ?? null;
  const sameClub = last?.teamId === team.id;
  const lastTrophies = sameClub ? last!.trophies : [];
  const lastTierWasTopFlight = sameClub ? last!.leagueTier === 1 : false;
  const wonLeagueLastYear = lastTrophies.includes("league");
  const wonCupLastYear = lastTrophies.includes("cup");
  const wonPrimaryLastYear = lastTrophies.includes("continental_primary");
  // How many seasons running this club has held the continent, counting
  // back from last season. Only used to make a third one hard.
  let continentalStreak = 0;
  for (let i = context.seasons.length - 1; i >= 0; i -= 1) {
    const s = context.seasons[i];
    if (s.teamId !== team.id || !s.trophies.includes("continental_primary")) break;
    continentalStreak += 1;
  }
  const wonSecondaryLastYear = lastTrophies.includes("continental_secondary");
  const wonTertiaryLastYear = lastTrophies.includes("continental_tertiary");

  const continentalTrophies = getConfederationTrophies(confederation)?.continental_trophies;
  const confHasSecondary = Boolean(continentalTrophies?.continental_secondary);
  const confHasTertiary = Boolean(continentalTrophies?.continental_tertiary);

  // Domestic super cup: league champion against cup winner. A second-division
  // title doesn't qualify anyone, hence the tier check.
  const superCupRep = clamp(domesticRep, 0, 5);
  if (getDomesticSuperCup(league?.country_fifa_code) && lastTierWasTopFlight && (wonLeagueLastYear || wonCupLastYear)) {
    const doubleWinner = wonLeagueLastYear && wonCupLastYear;
    candidates.push([
      "domestic_super_cup",
      (doubleWinner
        ? SUPER_CUP_PROBABILITY.domesticDouble[superCupRep]
        : SUPER_CUP_PROBABILITY.domesticSingle[superCupRep]) *
        dampedBoost(gapBoost),
      false,
    ]);
  }

  // Continental super cup: winner of the confederation's primary competition
  // against the winner of its secondary one.
  if (continentalTrophies?.continental_super_cup && !isSecondTier && (wonPrimaryLastYear || wonSecondaryLastYear)) {
    const contRep = clamp(continentalRep, 0, 5);
    candidates.push([
      "continental_super_cup",
      (wonPrimaryLastYear
        ? SUPER_CUP_PROBABILITY.continentalPrime[contRep]
        : SUPER_CUP_PROBABILITY.continentalSecond[contRep]) * dampedBoost(gapBoost),
      false,
    ]);
  }

  // ---------------------------------------------------------------------
  // The two world titles, which are two different competitions.
  //
  //  - The intercontinental cup is annual and small: the club that won the
  //    continent last season plays the other continental champions for it.
  //    In Europe it is a night's work on the way to something bigger; on the
  //    other side of the world it is the night the club is remembered for.
  //  - The world championship runs once every four years and takes the
  //    continental champions of the whole cycle, so winning the continent
  //    books a place for four seasons rather than for the next one. A club
  //    of real standing can also be invited on ranking alone.
  //
  // They are independent: a club that won the continent last season can play
  // both in the same year, and win both.
  //
  // Both are gated on top-flight football, like every other continental
  // competition (see the note above the block that adds those).
  // ---------------------------------------------------------------------
  const conf = confederation.trim().toUpperCase();
  if (!isSecondTier) {
    if (isTournamentYear(player.age, CLUB_WORLD_CUP_START_AGE)) {
      const qualifiedThisCycle = context.seasons
        .slice(-CLUB_WORLD_CUP_QUALIFYING_SEASONS)
        .some((s) => s.teamId === team.id && s.trophies.includes("continental_primary"));
      const odds = qualifiedThisCycle
        ? (CLUB_WORLD_CUP_CHAMPION_ODDS[conf] ?? 0.04) * dampedBoost(gapBoost)
        : CLUB_WORLD_CUP_PROBABILITY[conf]?.[clamp(continentalRep, 0, 5)] ?? 0;
      candidates.push([
        "club_world_cup",
        odds * modifiers.clubWorldCupTrophyProbabilityMultiplier,
        !qualifiedThisCycle,
      ]);
    }
  }

  const won: ClubTrophyKey[] = [];
  let cur = rng;
  let wonPrimaryThisYear = false;
  let wonSecondaryThisYear = false;

  for (const [trophy, probability, boosted] of candidates) {
    if (trophy === "continental_secondary" && !confHasSecondary) continue;
    if (trophy === "continental_tertiary" && !confHasTertiary) continue;
    // Winning the league or the top continental cup promotes you out of the
    // secondary competition, so it can't be won in the same or next season.
    if (
      trophy === "continental_secondary" &&
      (wonPrimaryThisYear || wonLeagueLastYear || wonPrimaryLastYear || wonSecondaryLastYear)
    ) {
      continue;
    }
    // Same ladder one rung down: anything that earns Champions or Europa League
    // football takes a club out of the Conference League entirely.
    if (
      trophy === "continental_tertiary" &&
      (wonPrimaryThisYear ||
        wonSecondaryThisYear ||
        wonLeagueLastYear ||
        wonPrimaryLastYear ||
        wonSecondaryLastYear ||
        wonTertiaryLastYear)
    ) {
      continue;
    }
    const override = modifiers.clubTrophyOverride?.trophy === trophy ? modifiers.clubTrophyOverride : null;
    const odds =
      probability *
      (boosted ? gapBoost : 1) *
      (trophy === "continental_primary" ? retainContinentalDamper(continentalStreak) : 1);
    const roll = override
      ? { rng: cur, success: override.result === "force" }
      : chance(cur, Math.min(1, odds));
    cur = roll.rng;
    if (roll.success) {
      won.push(trophy);
      if (trophy === "continental_primary") wonPrimaryThisYear = true;
      if (trophy === "continental_secondary") wonSecondaryThisYear = true;
    }
  }

  // The intercontinental is resolved last because for half the world it
  // hangs on a continental title rolled moments ago in this same loop.
  const qualifiedForIntercontinental = INTERCONTINENTAL_SAME_SEASON.has(conf)
    ? wonPrimaryThisYear
    : wonPrimaryLastYear;
  if (!isSecondTier && qualifiedForIntercontinental) {
    const override =
      modifiers.clubTrophyOverride?.trophy === "intercontinental_cup"
        ? modifiers.clubTrophyOverride
        : null;
    const roll = override
      ? { rng: cur, success: override.result === "force" }
      : chance(
          cur,
          Math.min(
            1,
            (INTERCONTINENTAL_ODDS[conf] ?? 0.02) *
              modifiers.clubWorldCupTrophyProbabilityMultiplier *
              dampedBoost(gapBoost),
          ),
        );
    cur = roll.rng;
    if (roll.success) won.push("intercontinental_cup");
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

/**
 * No band is a certainty any more.
 *
 * The top of the curve used to return 1: a player who reached 97 was voted
 * the best in the world every remaining season of his career, and 94 with
 * a league and a continental title was the same. Compounded over a decade
 * that produced careers with eight and ten Ballons d'Or, which is more than
 * anyone has ever won, in a career a third the length of the ones that won
 * them. The best season anyone ever has is still the favourite; it is no
 * longer a formality.
 */
function ballonDorOdds(overall: number, trophies: TrophyKey[]): number {
  const wonLeague = trophies.includes("league");
  const wonContinental = trophies.includes("continental_primary");
  if (overall >= 97) return 0.9;
  if (overall >= 94) {
    if (wonLeague && wonContinental) return 0.88;
    return wonContinental ? 0.76 : wonLeague ? 0.66 : 0.56;
  }
  if (overall >= 90) {
    if (wonLeague && wonContinental) return 0.46;
    return wonContinental ? 0.3 : wonLeague ? 0.22 : 0.14;
  }
  if (overall >= 85) {
    if (wonLeague && wonContinental) return 0.04;
    if (wonContinental) return 0.02;
    if (wonLeague) return 0.006;
  }
  return 0;
}

/**
 * What being the reigning holder costs.
 *
 * Voters do not hand the same player the same trophy every season, and an
 * undamped roll is what turned a very good decade into ten Ballons d'Or.
 * But the first version of this bottomed out at 0.18 and stayed there,
 * which made four in a row arithmetically impossible: across nine hundred
 * careers the longest streak seen was three, against a real record of four.
 *
 * It still costs to be the holder. It no longer costs so much that the
 * record cannot be reached, and the floor is a floor rather than zero, so
 * there is no cap on how many a career can take.
 */
function repeatWinnerDamper(streak: number): number {
  if (streak <= 0) return 1;
  if (streak === 1) return 0.72;
  if (streak === 2) return 0.62;
  return 0.54;
}

function roleAwardMultiplier(role: PlayerRole): number {
  if (role === "support") return 0.5;
  if (role === "defensive") return 0.25;
  return 1;
}

/**
 * The European Golden Shoe is contested across five leagues at once, so
 * even a fifty-goal season is not a certainty. It used to be, and the same
 * compounding that broke the Ballon d'Or broke this: a striker who reached
 * that level once reached it every year, and ten of them turned up in a
 * career where the record is six.
 */
function goldenBootOdds(stats: SeasonStats, inTopConfederation: boolean): number {
  if (!inTopConfederation) return 0;
  if (stats.goals >= 50) return 0.96;
  if (stats.goals >= 42) return 0.78;
  if (stats.goals >= 34) return 0.48;
  if (stats.goals >= 28) return 0.22;
  return 0;
}

/**
 * Appearances below which no individual honour is credible.
 *
 * The odds used to read only the rating and the trophy haul, so a player who
 * spent most of the year injured could still be voted the best in the world
 * off the back of a team that won things without them. Nobody has ever won
 * one of these in nine games.
 */
const AWARD_MIN_APPEARANCES = 20;

/** Consecutive seasons the player has just won this award, most recent last. */
export interface AwardStreaks {
  top: number;
  boot: number;
}

export function simulateAwards(
  rng: Rng,
  player: Player,
  stats: SeasonStats,
  trophies: TrophyKey[],
  inUefa: boolean,
  streaks: AwardStreaks = { top: 0, boot: 0 },
): { rng: Rng; awards: AwardKey[] } {
  const awards: AwardKey[] = [];
  let cur = rng;

  if (stats.appearances < AWARD_MIN_APPEARANCES) return { rng: cur, awards };

  const topOdds =
    ballonDorOdds(player.overall, trophies) *
    roleAwardMultiplier(player.role) *
    repeatWinnerDamper(streaks.top);
  const topRoll = chance(cur, topOdds);
  cur = topRoll.rng;
  if (topRoll.success) {
    awards.push(player.role === "goalkeeper" ? "golden_glove" : "ballon_dor");
  }

  if (player.role !== "goalkeeper") {
    const bootRoll = chance(cur, goldenBootOdds(stats, inUefa) * repeatWinnerDamper(streaks.boot));
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
