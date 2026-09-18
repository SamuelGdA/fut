import { chance, createRng, nextInt, pickOne, pickWeighted, type Rng } from "./rng";
import { areRivals } from "@/lib/data/rivalries";
import { briefDemand, rollClubBrief, type ClubBrief } from "./clubBrief";
import {
  EMPTY_STATS,
  FAN_SUPPORT_BANDS,
  FAN_SUPPORT_DEBUT,
  FAN_SUPPORT_START,
  INJURY_PROBABILITY,
  MODE_CONFIG,
  RETIREMENT_AGE,
  START_AGE,
  START_MARKET_VALUE,
  START_OVERALL,
  TALENT_TIERS,
  type ClubStanding,
  DIFFICULTY_CONFIG,
  type Difficulty,
  type GameMode,
  type Modifiers,
  type PersonalityTrait,
  type PositionCode,
  type SquadStatus,
  type TalentTier,
} from "./constants";
import {
  addStats,
  applyFanSupport,
  BIG_CLUB_RELEGATION_REPUTATION,
  buildUpcomingTournaments,
  clubStanding,
  fanCeilingDamping,
  fanSupportDelta,
  isBenchStatus,
  marketValue,
  NO_MODIFIERS,
  pickDevelopmentProfile,
  relegationOdds,
  RIVAL_ASSIGNMENT_CHANCE,
  RIVAL_ASSIGNMENT_THRESHOLD,
  roleForPosition,
  rollPersonality,
  rollPotential,
  rollRival,
  secondTierPlayoffOdds,
  traitEffects,
  type RivalPlayer,
  simulateAwards,
  simulateClubTrophies,
  simulateNationalTeam,
  simulateSeasonStats,
  type SeasonKnock,
  squadStatusAtTeam,
  squadStatusFromGap,
  teamBaseOverall,
  type NationalTournament,
  type Player,
  type SeasonStats,
} from "./engine";
import {
  CAREER_EVENT_KEYS,
  CAREER_EVENT_OPTIONS,
  CAREER_EVENT_VARIANTS,
  CAREER_EVENT_WEIGHTS,
  CLUB_CHOICE_EVENTS,
  pickInjury,
  pickSevereInjury,
  resolveCareerEvent,
  type CareerEventKey,
  type OutcomeKind,
} from "./careerEvents";
import {
  createAcademyOffers,
  createLoanOffers,
  createNonRenewalOffers,
  createTransferOffers,
  isLoanEligible,
  jitterReputation as jitterOfferReputation,
  loanWeight,
  LOAN_MAX_AGE,
  playerOfferReputation,
} from "./offers";
import {
  ALL_TEAMS,
  COUNTRIES,
  getCountryByFifa,
  getCountryByIso,
  getLeagueByTier,
  getLeagueOfTeam,
  getTeam,
  type Country,
  type Team,
} from "@/lib/data/dataset";
import {
  applyGrowth,
  enforceTrainingFloor,
  computeOverall,
  createStartingAttributes,
  shiftOverall,
  type AttributeKey,
  type Attributes,
} from "./attributes";
import { findTrainingFocus, trainingFocusesFor } from "./training";
import {
  singleTrophyImportance,
  trophyImportance,
  type Confederation,
  type AwardKey,
  type ClubTrophyKey,
  type NationalTrophyKey,
  type TrophyKey,
} from "@/lib/data/trophies";
import { CALL_UP_THRESHOLD } from "./constants";
import { clamp } from "./rng";
import {
  rollInitialShirtNumber,
  legendNumbersFor,
  rollLegendTributeOffer,
  rollShirtUpgradeOffer,
  prestigeNumbersFor,
} from "./shirtNumbers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DecisionType =
  | "academy_offer"
  | "transfer"
  | "loan_offer"
  | "post_loan_retained"
  | "post_loan_not_retained"
  | "post_loan_aged_out"
  | "contract_non_renewal"
  | "career_event"
  | "training_focus"
  | "no_offers_retirement";

export type OptionType =
  | "join_club"
  | "join_loan"
  | "permanent_transfer"
  | "stay"
  | "retire"
  | "career_choice"
  | "training";

export interface DecisionOption {
  id: string;
  type: OptionType;
  teamId?: string;
  eventKey?: CareerEventKey;
  optionKey?: string;
  /** shirt_upgrade / shirt_legend_tribute: the number this option puts on the back. */
  shirtNumber?: number;
  /**
   * For a move: what that club is signing the player to do. Attached at offer
   * time so the pitch is part of the decision rather than a surprise on
   * arrival, and carried through to the accepted state unchanged.
   */
  brief?: ClubBrief;
}

export interface DecisionEvent {
  id: string;
  type: DecisionType;
  age: number;
  options: DecisionOption[];
  eventKey?: CareerEventKey;
  variantKey?: string;
  injuryType?: string;
  scheduledSlotAge?: number;
  rivalTeamId?: string;
  alternativeNationalityFifaCode?: string;
  /** injury_at_peak: a club trophy this period's outcome will force win/lose. */
  targetClubTrophy?: ClubTrophyKey;
  /** decisive_penalty: a club or national trophy this period's outcome will force win/lose. */
  targetTrophy?: TrophyKey;
  /** club_national_team_conflict: the specific call-up being skipped or honoured. */
  nationalTournament?: NationalTournament;
}

export interface SeasonSnapshot {
  id: string;
  index: number;
  periodIndex: number;
  age: number;
  teamId: string;
  /** Division actually played this season (1 = top flight) — a relegated club stays the same team, but not the same league. */
  leagueTier: number;
  onLoan: boolean;
  suspended: boolean;
  overall: number;
  attributes: Attributes;
  marketValue: number;
  stats: SeasonStats;
  trophies: TrophyKey[];
  awards: AwardKey[];
  relegated: boolean;
  promoted: boolean;
  /** The number worn this season, so the summary's best card is period-accurate. */
  shirtNumber: number | null;
  /** A minor injury that cost a few games, or null for a clean season. */
  knock: SeasonKnock | null;
  /**
   * The club's standing this season, 0-5, after whatever it has won under
   * the player. Recorded per season so the end-of-season page can show the
   * badge actually growing or fading instead of the number moving invisibly.
   * Absent on careers saved before this was tracked.
   */
  clubStars?: number;
}

export interface CareerEventPlan {
  targetCount: number;
  slotAges: number[];
  completedEventKeys: CareerEventKey[];
  completedSlotAges: number[];
  completedEventAges: number[];
  injuryCount: number;
}

export interface Identity {
  lastName: string;
  foot: "left" | "right";
  countryIso: string;
  position: PositionCode;
}

/**
 * A generated back-page line reacting to something that just happened. Purely
 * cosmetic — it exists so a career reads as a story and not only as a table.
 * `key` resolves under `headlines.` in the locale bundle.
 */
export interface Headline {
  id: string;
  age: number;
  key: string;
  vars: Record<string, string>;
  tone: "good" | "bad" | "neutral";
}

/** A club offer the player passed on, and what it was worth at the time. */
export interface DeclinedOffer {
  teamId: string;
  age: number;
  /** The club's standing when the offer came, so a later fade does not rewrite history. */
  reputation: number;
}

export interface CareerState {
  seed: string;
  mode: GameMode;
  /** How unforgiving the football is — a separate axis from `mode`'s pacing. */
  difficulty: Difficulty;
  phase: "career" | "summary";
  step: number;
  rng: Rng;
  identity: Identity;
  player: Player;
  currentTeamId: string | null;
  contractTeamId: string | null;
  activeLoan: { loanTeamId: string } | null;
  completedLoan: { loanTeamId: string } | null;
  seasons: SeasonSnapshot[];
  periodIndex: number;
  careerEventPlan: CareerEventPlan;
  upcomingNationalTournaments: NationalTournament[];
  currentEvent: DecisionEvent | null;
  /**
   * The decision just resolved (full event + chosen option), for the
   * outcome-reveal screen — carries everything DecisionPanel needed to
   * render it (rival team, target trophy, etc.) since `currentEvent` has
   * already moved on to the next decision by the time this is read.
   */
  lastOutcome: { event: DecisionEvent; optionId: string; kind: OutcomeKind } | null;
  /** Seasons still to be forcibly suspended, carried across periods (mysterious_substance). */
  suspensionSeasonsRemaining: number;
  /** Extra attribute growth weighting from a chosen training focus, consumed next season. */
  pendingTrainingShares?: Partial<Record<AttributeKey, number>>;
  /** Period index of the last training-focus decision, used to space them out. */
  lastTrainingFocusPeriod: number;
  /** Team id -> league tier after promotion/relegation. */
  teamTierOverrides: Record<string, number>;
  /** Team id -> accumulated reputation delta from trophies won while the player was there. */
  teamReputationOverrides: Record<string, { domestic: number; continental: number; international: number }>;
  nationalTeamStats: SeasonStats & { caps: number };
  /** How the current club's terraces feel about the player, 0-100. Resets on transfer. */
  fanSupport: number;
  /**
   * What each club's terraces were left at, and how good the player was when
   * they walked out. A stand does not forget: coming back to a club you were
   * adored at should resume near where it stopped rather than reset to a
   * generic welcome. Optional so saves written before this existed still load.
   */
  clubFanMemory?: Record<string, { support: number; overall: number; peak?: number }>;
  /**
   * Clubs whose supporters will never have the player back: left directly for
   * a real rival, or walked out after a fallout with the stand. They are
   * struck from every future offer pool for the rest of the career. Optional
   * so saves written before this existed still load.
   */
  betrayedClubs?: string[];
  /**
   * The highest this club's crowd has ever had the player. Reset on every
   * move, and picked up again from where it left off on a return. Read only
   * to tell a stand that has turned on a player from one that has yet to
   * notice him — see `fanBand`. Optional so saves written before it existed
   * still load.
   */
  clubFanPeak?: number;
  /** What the current club signed the player to do — sets starting goodwill
   *  and how impatient the crowd is. Null before the first club. */
  clubBrief: ClubBrief | null;
  /** The generational rival this career is measured against — assigned once OVR reaches RIVAL_ASSIGNMENT_THRESHOLD, null until then. */
  rival: RivalPlayer | null;
  /**
   * Clubs the player turned down. Kept so the biography can look back at the
   * road not taken — the offer you said no to at 24 is part of the story of
   * the career you actually had.
   */
  declinedOffers: DeclinedOffer[];
  /**
   * Whether the player may retire whenever they like rather than only when
   * the game is finished with them. Set for daily challenges, where deciding
   * when to stop is the point; a normal career runs its course.
   */
  allowEarlyRetirement: boolean;
  /** Whether the one-and-only rival roll has already been spent, so a career
   *  that missed out never silently re-rolls into one later. */
  rivalRollDone: boolean;
  /** Generated back-page lines, newest last. */
  headlines: Headline[];
  /** Age of the first senior call-up, or null if it never came. */
  firstCallUpAge: number | null;
  /**
   * The number on the player's back right now. Never chosen at creation — the
   * first club hands one over on signing, and it only ever changes when the
   * player earns a better one. It travels with them on every transfer.
   */
  shirtNumber: number | null;
  /** The board only ever lets a legend name their own number once. */
  legendShirtTributeUsed: boolean;
  /**
   * Where the player is from, as opposed to who they play for.
   *
   * A grandparent's passport can move `player.nationality` mid-career, and
   * everything international rightly follows it — but the childhood does not.
   * Without this the biography had a boy from Ireland taking his first steps
   * at a Brazilian academy because he switched at 24. Set once, never
   * changed. Optional so saves written before it existed still load; readers
   * fall back to the current nationality, which is correct for every career
   * that never switched.
   */
  birthNationality?: Country;
  retirementReason: "voluntary" | "no_offers" | "age" | "poor_form" | null;
}

// ---------------------------------------------------------------------------
// Career event scheduling
// ---------------------------------------------------------------------------

function eventSlotAges(mode: GameMode): number[] {
  const step = MODE_CONFIG[mode].periodLengthSeasons;
  const first = START_AGE + Math.ceil(6 / step) * step;
  const ages: number[] = [];
  for (let age = first; age <= 37; age += step) ages.push(age);
  return ages;
}

/** All ways to choose `count` slots keeping at least one slot of spacing. */
function spacedCombinations(slots: number[], count: number): number[][] {
  const out: number[][] = [];
  const walk = (start: number, acc: number[]) => {
    if (acc.length === count) {
      out.push(acc);
      return;
    }
    for (let i = start; i < slots.length; i += 1) walk(i + 2, [...acc, slots[i]]);
  };
  walk(0, []);
  return out;
}

function createCareerEventPlan(rng: Rng, mode: GameMode): { rng: Rng; plan: CareerEventPlan } {
  const config = MODE_CONFIG[mode];
  const countRoll = nextInt(rng, config.personalEventCount[0], config.personalEventCount[1]);
  const combinations = spacedCombinations(eventSlotAges(mode), countRoll.value);
  const chosen = combinations.length > 0
    ? pickOne(countRoll.rng, combinations)
    : { rng: countRoll.rng, item: [] as number[] };
  return {
    rng: chosen.rng,
    plan: {
      targetCount: chosen.item.length,
      slotAges: chosen.item,
      completedEventKeys: [],
      completedSlotAges: [],
      completedEventAges: [],
      injuryCount: 0,
    },
  };
}

function pendingSlotAge(plan: CareerEventPlan, age: number): number | null {
  if (plan.completedEventKeys.length >= plan.targetCount) return null;
  return plan.slotAges.find((slot) => slot <= age && !plan.completedSlotAges.includes(slot)) ?? null;
}

function markEventCompleted(
  plan: CareerEventPlan,
  eventKey: CareerEventKey,
  slotAge: number,
  age: number,
): CareerEventPlan {
  if (eventKey !== "injury" && plan.completedEventKeys.includes(eventKey)) return plan;
  if (eventKey === "injury" && plan.injuryCount >= 2) return plan;
  return {
    ...plan,
    completedEventKeys: [...plan.completedEventKeys, eventKey],
    completedSlotAges: [...plan.completedSlotAges, slotAge],
    completedEventAges: [...plan.completedEventAges, age],
    injuryCount: eventKey === "injury" ? plan.injuryCount + 1 : plan.injuryCount,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function eventId(state: CareerState, label: string): string {
  return `${state.seed}-${state.step + 1}-${label}`;
}

/** The division a team is *currently* playing in this career, honouring promotion/relegation. */
export function teamTier(state: CareerState, teamId: string): number {
  const override = state.teamTierOverrides[teamId];
  if (override !== undefined) return override;
  return getLeagueOfTeam(teamId)?.tier ?? 1;
}

/**
 * Resolves the team as seen by the sim, honouring promotion/relegation and
 * any reputation the club has earned by winning trophies during this career.
 */
function effectiveTeam(state: CareerState, teamId: string): Team | null {
  const team = getTeam(teamId);
  if (!team) return null;
  const bump = state.teamReputationOverrides[teamId];
  if (!bump) return team;
  return {
    ...team,
    domestic_reputation: clampReputation(team.domestic_reputation + bump.domestic),
    continental_reputation: clampReputation(team.continental_reputation + bump.continental),
    international_reputation: clampReputation(team.international_reputation + bump.international),
  };
}

function clampReputation(value: number): number {
  return Math.max(0, Math.min(5, Math.round(value)));
}

/** How much winning each trophy nudges the club's reputation — bigger prizes, bigger jump. */
const TROPHY_REPUTATION_WEIGHT: Record<ClubTrophyKey, { domestic?: number; continental?: number; international?: number }> = {
  // A super cup is a trophy the club already earned by winning something else,
  // so it barely moves standing on its own.
  domestic_super_cup: { domestic: 0.06 },
  league_cup: { domestic: 0.12 },
  cup: { domestic: 0.18 },
  league: { domestic: 0.4 },
  continental_tertiary: { continental: 0.28, domestic: 0.1 },
  continental_super_cup: { continental: 0.3, domestic: 0.1 },
  continental_secondary: { continental: 0.4, domestic: 0.12 },
  continental_primary: { continental: 0.7, domestic: 0.2 },
  intercontinental_cup: { international: 0.28, continental: 0.1 },
  club_world_cup: { international: 0.6, continental: 0.2 },
};

/**
 * Reputation earned by winning fades if the club stops winning — a golden era
 * lasts a few seasons, not forever. Only ever erodes the earned bonus back
 * toward zero; a club can never drop below its own baseline this way.
 */
const REPUTATION_DECAY_PER_SEASON = 0.07;

function decayReputation(
  overrides: CareerState["teamReputationOverrides"],
  skipTeamId: string | null,
): CareerState["teamReputationOverrides"] {
  const next: CareerState["teamReputationOverrides"] = {};
  for (const [teamId, bump] of Object.entries(overrides)) {
    if (teamId === skipTeamId) {
      next[teamId] = bump;
      continue;
    }
    const faded = {
      domestic: Math.max(0, bump.domestic - REPUTATION_DECAY_PER_SEASON),
      continental: Math.max(0, bump.continental - REPUTATION_DECAY_PER_SEASON),
      international: Math.max(0, bump.international - REPUTATION_DECAY_PER_SEASON),
    };
    // Drop the entry entirely once it's back to baseline, so it stops being tracked.
    if (faded.domestic > 0 || faded.continental > 0 || faded.international > 0) {
      next[teamId] = faded;
    }
  }
  return next;
}

function inUefa(teamId: string): boolean {
  return getLeagueOfTeam(teamId)?.confederation === "UEFA";
}

// ---------------------------------------------------------------------------
// Headlines
// ---------------------------------------------------------------------------

/**
 * Keeps the feed from growing without bound, set high enough that a real
 * career never loses anything: the median career writes 12 headlines and the
 * 90th percentile 38, so only a decorated 20-season run gets anywhere near
 * this — and that is exactly the career whose early years are worth keeping.
 */
const MAX_HEADLINES = 200;

function addHeadline(
  headlines: Headline[],
  entry: Omit<Headline, "id">,
  idSuffix: string,
): Headline[] {
  const next = [...headlines, { ...entry, id: `${idSuffix}-${headlines.length}` }];
  return next.length > MAX_HEADLINES ? next.slice(next.length - MAX_HEADLINES) : next;
}

/**
 * Winning always nudges the card up a point, capped so it never carries a
 * player past the level their ability earned. Small on purpose: it's there to
 * make lifting a trophy feel like it mattered, not to become a strategy.
 */
const TROPHY_OVERALL_BONUS_CAP = 90;

/**
 * How high silverware can carry this particular player.
 *
 * A flat 90 for everyone left the top of the scale unreachable. Training taper
 * alone always falls short of the ceiling, so across 80 careers that genuinely
 * rolled a 99 potential the best peak was 96 and not one reached 99 — the
 * rarest roll in the game promised a number nobody could ever see.
 *
 * Letting trophies close that last gap, but never past the player's own
 * ceiling, fixes it without touching anyone else: the median career has a
 * potential of 82, far below the flat cap, so nothing about it changes. And
 * the greats get the last few points by winning things, which is the right
 * reason to get them.
 */
function trophyOverallCap(potential: number): number {
  return Math.min(99, Math.max(TROPHY_OVERALL_BONUS_CAP, potential));
}

/**
 * The card a fully-formed debutant lands on. The bottom of the range is a
 * teenager who is plainly a first-team player already; the top is the once-a-
 * decade arrival. Capped by the player's own potential at the point of use.
 */
const EARLY_BREAKOUT_FLOOR = 73;
const EARLY_BREAKOUT_PEAK = 87;

/**
 * Odds of the Lamine-Yamal debut, once the club has shown it means it.
 *
 * Only the two rarest talent tiers can roll it at all, and a generational
 * talent is meaningfully likelier to be the one it happens to — that is what
 * the tier is for.
 */
const EARLY_BREAKOUT_CHANCE: Partial<Record<TalentTier, number>> = {
  phenomenon: 0.15,
  generational: 0.25,
};

function trophyOverallBonus(overall: number, importance: number, potential: number): number {
  const cap = trophyOverallCap(potential);
  if (importance <= 0 || overall >= cap) return 0;
  // At most one point per winning *season*, not per trophy — a treble should
  // not be worth three, and no season should cross the cap in one jump. What
  // the season was worth decides how much of that point it earns: a league is
  // the full mark, a super cup on its own is a third of it.
  return Math.min(1, importance, cap - overall);
}

/** Would picking a transfer right now actually produce a club offer? */
function wouldTransferProduceOffer(state: CareerState, team: Team): boolean {
  return createTransferOffers(state.rng, state.player, team, 2, blockedClubs(state)).teams.length > 0;
}

/** Same-country clubs at least as prestigious as the current one (rival_offer pool). */
function rivalPool(state: CareerState, team: Team): Team[] {
  const league = getLeagueOfTeam(team.id);
  if (!league) return [];
  const blocked = new Set(blockedClubs(state));
  return league.teams.filter(
    (t) =>
      t.id !== team.id &&
      !blocked.has(t.id) &&
      t.domestic_reputation >= team.domestic_reputation &&
      t.international_reputation >= team.international_reputation,
  );
}

/** Clubs in the player's home country, for return_home. */
function returnHomePool(state: CareerState, team: Team): Team[] {
  const league = getLeagueOfTeam(team.id);
  if (!league || league.country_fifa_code === state.player.nationality.fifa_code) return [];
  const blocked = new Set(blockedClubs(state));
  return ALL_TEAMS.filter(
    (t) =>
      t.id !== team.id &&
      !blocked.has(t.id) &&
      getLeagueOfTeam(t.id)?.country_fifa_code === state.player.nationality.fifa_code,
  );
}

/** Whether the player is a foreigner where they currently play. */
function playingAbroad(state: CareerState, team: Team): boolean {
  const league = getLeagueOfTeam(team.id);
  return Boolean(league) && league!.country_fifa_code !== state.player.nationality.fifa_code;
}

/** Whether this club has a real rival on the calendar, for derby_spotlight. */
function hasDerby(team: Team): boolean {
  return ALL_TEAMS.some((t) => t.id !== team.id && areRivals(team.id, t.id));
}

/** Clubs outside the current country, for tax_trouble. */
function foreignExitPool(state: CareerState, team: Team): Team[] {
  const league = getLeagueOfTeam(team.id);
  if (!league) return [];
  const blocked = new Set(blockedClubs(state));
  return ALL_TEAMS.filter(
    (t) =>
      t.id !== team.id &&
      !blocked.has(t.id) &&
      getLeagueOfTeam(t.id)?.country_fifa_code !== league.country_fifa_code,
  );
}

/** Countries sharing the player's confederation, for foreign_grandfather. */
function sameConfederationCountries(state: CareerState) {
  const own = state.player.nationality;
  return COUNTRIES.filter((c) => c.fifa_code !== own.fifa_code && c.confederation === own.confederation);
}

/** A veteran (32+) can be lured back to the very first club of their career. */
function firstClubForTriumphantReturn(state: CareerState): SeasonSnapshot | null {
  if (state.player.age < 32 || state.seasons.length === 0) return null;
  const contractId = state.contractTeamId ?? state.currentTeamId;
  const firstClub = [...state.seasons].sort((a, b) => a.index - b.index)[0];
  if (!firstClub || firstClub.teamId === contractId) return null;
  // No homecoming to a club you walked out on for its rival — that stand is
  // exactly the one that would never have you back.
  if (blockedClubs(state).includes(firstClub.teamId)) return null;
  return firstClub;
}

// ---------------------------------------------------------------------------
// Trophy peeking (injury_at_peak / decisive_penalty eligibility + framing)
// ---------------------------------------------------------------------------

/** Peeks ahead (without touching the real RNG stream) for the first club trophy this period would bring. */
function peekClubTrophyTarget(state: CareerState, team: Team): ClubTrophyKey | null {
  const periodLength = MODE_CONFIG[state.mode].periodLengthSeasons;
  let rng = createRng(`${state.seed}:injury-at-peak:${state.rng.state}:${team.id}:${state.player.age}`);
  let provisionalSeasons = state.seasons.map((s) => ({ teamId: s.teamId, trophies: s.trophies, leagueTier: s.leagueTier }));
  const currentTier = teamTier(state, team.id);

  for (let i = 0; i < periodLength; i += 1) {
    const result = simulateClubTrophies(rng, state.player, team, NO_MODIFIERS, { seasons: provisionalSeasons }, currentTier);
    rng = result.rng;
    if (result.trophies[0]) return result.trophies[0];
    provisionalSeasons = [...provisionalSeasons, { teamId: team.id, trophies: result.trophies, leagueTier: currentTier }];
  }
  return null;
}

/** Peeks ahead for the first "big moment" trophy (continental/world stage) this period would bring. */
function peekBigMomentTrophyTarget(state: CareerState, team: Team): TrophyKey | null {
  const periodLength = MODE_CONFIG[state.mode].periodLengthSeasons;
  let rng = createRng(`${state.seed}:decisive-penalty:${state.rng.state}:${team.id}:${state.player.age}`);
  let provisionalSeasons = state.seasons.map((s) => ({ teamId: s.teamId, trophies: s.trophies, leagueTier: s.leagueTier }));
  const bigClub: ClubTrophyKey[] = ["continental_primary", "continental_secondary", "club_world_cup"];
  const bigNational: NationalTrophyKey[] = ["national_continental", "world_cup"];
  const currentTier = teamTier(state, team.id);

  for (let i = 0; i < periodLength; i += 1) {
    const clubResult = simulateClubTrophies(rng, state.player, team, NO_MODIFIERS, { seasons: provisionalSeasons }, currentTier);
    rng = clubResult.rng;
    const clubHit = clubResult.trophies.find((t) => bigClub.includes(t as ClubTrophyKey));
    if (clubHit) return clubHit;

    const provisionalPlayer = { ...state.player, age: state.player.age + i };
    const nationalResult = simulateNationalTeam(rng, provisionalPlayer, state.upcomingNationalTournaments, NO_MODIFIERS);
    rng = nationalResult.rng;
    const nationalHit = nationalResult.trophies.find((t) => bigNational.includes(t as NationalTrophyKey));
    if (nationalHit) return nationalHit;

    provisionalSeasons = [...provisionalSeasons, { teamId: team.id, trophies: clubResult.trophies, leagueTier: currentTier }];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Streaks (recomputed fresh each decision, matching the original exactly)
// ---------------------------------------------------------------------------

/** How many *recent consecutive periods* the player spent low-rotation, or benched, at their club. */
function computeStreaks(state: CareerState, contractTeam: Team): { lowRoleStreak: number; substituteStreak: number } {
  const byPeriod = new Map<number, SeasonSnapshot[]>();
  for (const s of state.seasons) {
    byPeriod.set(s.periodIndex, [...(byPeriod.get(s.periodIndex) ?? []), s]);
  }
  const relevantPeriods = [...byPeriod.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, seasons]) => seasons)
    .filter((seasons) => seasons.some((s) => s.teamId === contractTeam.id))
    .filter((seasons) => seasons.every((s) => !s.suspended))
    .map((seasons) => seasons[seasons.length - 1]);

  let lowRoleStreak = 0;
  let substituteStreak = 0;
  const isGoalkeeper = state.player.role === "goalkeeper";
  for (const season of relevantPeriods) {
    const status = squadStatusFromGap(season.overall - teamBaseOverall(contractTeam), isGoalkeeper);
    if (status === "low_rotation" && substituteStreak === 0) {
      lowRoleStreak += 1;
      continue;
    }
    if (isBenchStatus(status) && lowRoleStreak === 0) {
      substituteStreak += 1;
      continue;
    }
    break;
  }
  return { lowRoleStreak, substituteStreak };
}

// ---------------------------------------------------------------------------
// Season simulation
// ---------------------------------------------------------------------------

function simulateOneSeason(
  state: CareerState,
  team: Team,
  modifiers: Modifiers,
  onLoan: boolean,
): CareerState {
  let rng = state.rng;
  let player = state.player;
  const tuning = DIFFICULTY_CONFIG[state.difficulty];

  // A genuine once-a-generation talent occasionally arrives fully formed —
  // Lamine Yamal, not the general run of prospects.
  //
  // Rolled here, before a ball is kicked, so the whole season belongs to the
  // player they turned out to be: the games, the goals, the crowd and the
  // paper all follow from the new card. It used to be applied at the end of
  // the season, gated on having already played ten games, which printed a
  // sixteen-year-old on 87 next to a line reading ten appearances and no
  // goals — the one thing a breakout season should never look like.
  //
  // What replaces the appearance floor is the club's own intent: a debutant
  // the manager has already decided is a first-team player, rather than one
  // filling out the bench.
  const breakoutOdds = EARLY_BREAKOUT_CHANCE[player.talentTier] ?? 0;
  if (
    player.age === START_AGE &&
    breakoutOdds > 0 &&
    !isBenchStatus(squadStatusAtTeam(player, team))
  ) {
    const roll = chance(rng, breakoutOdds);
    rng = roll.rng;
    if (roll.success) {
      const targetRoll = nextInt(rng, EARLY_BREAKOUT_FLOOR, EARLY_BREAKOUT_PEAK);
      rng = targetRoll.rng;
      // Never past what this player was ever going to be — the leap is the
      // ceiling arriving early, not a different ceiling.
      const target = Math.min(targetRoll.value, player.potential);
      const delta = target - player.overall;
      if (delta > 0) {
        const shifted = shiftOverall(player.attributes, player.position, delta, player.potential);
        player = {
          ...player,
          attributes: shifted,
          overall: Math.round(computeOverall(shifted, player.position)),
        };
      }
    }
  }

  // The tier this season is actually played at — needed before simulating
  // trophies so a relegated club is judged (and named) against the division
  // it's really in, not its static top-flight entry in the dataset.
  const league = getLeagueOfTeam(team.id);
  const currentTier = teamTier(state, team.id);
  const hasTopFlight = league ? Boolean(getLeagueByTier(league.country_fifa_code, 1)) : false;
  const hasSecondFlight = league ? Boolean(getLeagueByTier(league.country_fifa_code, 2)) : false;

  const statsResult = simulateSeasonStats(rng, player, team, modifiers);
  rng = statsResult.rng;

  const trophyResult = simulateClubTrophies(
    rng,
    player,
    team,
    modifiers,
    { seasons: state.seasons.map((s) => ({ teamId: s.teamId, trophies: s.trophies, leagueTier: s.leagueTier })) },
    currentTier,
  );
  rng = trophyResult.rng;

  const nationalResult = simulateNationalTeam(rng, player, state.upcomingNationalTournaments, modifiers);
  rng = nationalResult.rng;

  const trophies: TrophyKey[] = modifiers.suspended
    ? []
    : [...trophyResult.trophies, ...nationalResult.trophies];

  const awardResult = simulateAwards(
    rng,
    player,
    statsResult.stats,
    trophies,
    inUefa(team.id),
    awardStreaks(state.seasons),
  );
  rng = awardResult.rng;

  // Promotion out of the second tier, or relegation out of the first.

  let promoted = false;
  let relegated = false;
  const tierOverrides = { ...state.teamTierOverrides };

  // Winning the second division goes up automatically. So does winning the
  // national cup from the second tier: it's a rare, genuinely giant-killing
  // season, and a squad capable of it is plainly too strong for the division.
  const earnedAutomaticPromotion =
    trophyResult.trophies.includes("league") || trophyResult.trophies.includes("cup");

  if (currentTier === 2 && hasTopFlight && !modifiers.suspended && earnedAutomaticPromotion) {
    promoted = true;
    tierOverrides[team.id] = 1;
  } else if (currentTier === 2 && hasTopFlight && !modifiers.suspended) {
    // Winning the second division isn't the only way up — a strong-enough
    // season earns an automatic spot or a playoff run, same as it does in a
    // real second tier. Scaled by overall like the title odds, just far more
    // generous, since several clubs go up every season and only one wins it.
    const playoffRoll = chance(rng, secondTierPlayoffOdds(player.overall, league?.country_fifa_code));
    rng = playoffRoll.rng;
    if (playoffRoll.success) {
      promoted = true;
      tierOverrides[team.id] = 1;
    }
  }

  if (!promoted && currentTier === 1 && hasSecondFlight) {
    const roll = chance(rng, relegationOdds(player, team));
    rng = roll.rng;
    if (roll.success) {
      relegated = true;
      tierOverrides[team.id] = 2;
    }
  }

  // A genuinely big club going down is a once-a-generation shock, not just a
  // bad season — it costs the whole squad's reputation, the player included.
  const bigClubShock = relegated && team.domestic_reputation >= BIG_CLUB_RELEGATION_REPUTATION;

  // A trophy lifts the club's own reputation going forward — bigger prizes, bigger jump.
  // Everyone who didn't win this season bleeds a little of what they'd earned before.
  const wonSomething = !modifiers.suspended && trophyResult.trophies.length > 0;
  const reputationOverrides = decayReputation(
    state.teamReputationOverrides,
    wonSomething ? team.id : null,
  );
  if (!modifiers.suspended) {
    for (const trophy of trophyResult.trophies) {
      const weight = TROPHY_REPUTATION_WEIGHT[trophy];
      if (!weight) continue;
      const prev = reputationOverrides[team.id] ?? { domestic: 0, continental: 0, international: 0 };
      reputationOverrides[team.id] = {
        domestic: prev.domestic + (weight.domestic ?? 0),
        continental: prev.continental + (weight.continental ?? 0),
        international: prev.international + (weight.international ?? 0),
      };
    }
  }

  const valueResult = marketValue(rng, player.overall, player.age);
  rng = valueResult.rng;

  const snapshot: SeasonSnapshot = {
    id: `${state.seed}-season-${state.seasons.length + 1}`,
    index: state.seasons.length + 1,
    periodIndex: state.periodIndex,
    age: player.age,
    teamId: team.id,
    leagueTier: currentTier,
    onLoan,
    suspended: modifiers.suspended,
    // Filled in below, once the season has actually been played: a row that
    // says "38 games, 18 goals, 84 overall" has to mean the card he
    // finished the season with, not the one he started it with.
    overall: player.overall,
    attributes: player.attributes,
    marketValue: valueResult.value,
    stats: statsResult.stats,
    trophies,
    awards: awardResult.awards,
    relegated,
    promoted,
    shirtNumber: state.shirtNumber,
    // A suspended season was never played, so it cannot also have been
    // interrupted by a knock.
    knock: modifiers.suspended ? null : statsResult.knock,
    // Read after this season's trophies have been folded in, so a title shows
    // up as a rise on the page that reports the title.
    clubStars: clampReputation(
      (getTeam(team.id)?.domestic_reputation ?? 0) + (reputationOverrides[team.id]?.domestic ?? 0),
    ),
  };

  // Progress the player into next season. Overall-affecting modifiers
  // (immediate/permanent/deferred) were already baked in by the caller
  // before this loop started, so growth here only sees roleOverride/roleShift.
  const nextAge = player.age + 1;

  // Every attribute grows from what the player actually did this season —
  // OVR is read back off the result, not decided ahead of time.
  const growth = applyGrowth(
    rng,
    player.attributes,
    {
      age: player.age,
      position: player.position,
      stats: statsResult.stats,
      teamReputation: team.domestic_reputation,
      clubLevel: team.international_reputation,
      potential: player.potential,
      overall: player.overall,
      developmentProfile: player.developmentProfile,
      // Difficulty rides on the trait multipliers rather than adding another
      // knob to GrowthContext — same effect, one less thing to thread.
      traitGrowth: traitEffects(player.trait).growth * tuning.growth,
      traitDecline: traitEffects(player.trait).decline * tuning.decline,
      // A player the stands believe in plays with their chest out. Small, but it
      // makes staying somewhere long enough to be loved worth something concrete.
      confidence: state.fanSupport,
    },
    state.pendingTrainingShares,
  );
  rng = growth.rng;
  const nextAttributes = growth.attributes;
  const grownOverall = Math.round(computeOverall(nextAttributes, player.position));

  // Lifting a trophy is worth a point on the card, up to a ceiling — enough to
  // feel earned, small enough that chasing it never beats simply playing well.
  const seasonWorth = trophyImportance(trophies, clubConfederation(team.id));
  const trophyBonus = trophyOverallBonus(grownOverall, seasonWorth, player.potential);
  let boostedAttributes =
    trophyBonus > 0
      ? shiftOverall(nextAttributes, player.position, trophyBonus, player.potential)
      : nextAttributes;
  // The shock of a big-club relegation costs the group ten points, on the card too.
  if (bigClubShock) {
    boostedAttributes = shiftOverall(boostedAttributes, player.position, -10);
  }


  const nextOverall = Math.round(computeOverall(boostedAttributes, player.position));

  // The season the snapshot describes is now over, so it records where the
  // player ended up. Without this the career table showed last season's
  // rise against this season's games, and the back page could announce a
  // breakout to a number the table would not print for another year.
  snapshot.overall = nextOverall;
  snapshot.attributes = boostedAttributes;

  const nextValue = marketValue(rng, nextOverall, nextAge);
  rng = nextValue.rng;

  // Caps accrue every season the player is good enough for the squad, not only
  // in the years a tournament happens to fall.
  //
  // They used to be tied to `calledUp`, which is a *tournament* flag: a
  // national-team regular therefore banked caps once every couple of years and
  // finished a whole career on about twenty. Real internationals play
  // qualifiers and friendlies in between, and that is where most of a cap
  // tally actually comes from — Cristiano Ronaldo's 226 is unreachable if only
  // tournaments count. Tournaments still decide trophies; this decides caps.
  const squadThreshold =
    CALL_UP_THRESHOLD[
      Math.max(0, Math.min(CALL_UP_THRESHOLD.length - 1, player.nationality.international_reputation))
    ];
  const inSquad = nationalResult.calledUp || nextOverall >= squadThreshold;
  // A regular's season is worth roughly a qualifying campaign plus friendlies,
  // scaled by how much club football they actually got through.
  // Per season, not per period: this function already runs once for every
  // season in the period, so scaling by the period length counted every cap
  // twice and pushed a long career past 470 — double the real record.
  const capsThisSeason = inSquad
    ? Math.max(
        1,
        Math.round(
          CAPS_PER_SEASON *
            capsAgeFactor(player.age) *
            Math.min(1.15, statsResult.stats.appearances / STARTER_SEASON_APPEARANCES),
        ),
      )
    : 0;
  const nationalStats = inSquad
    ? {
        ...addStats(state.nationalTeamStats, scaleNationalContribution(statsResult.stats, capsThisSeason)),
        caps: state.nationalTeamStats.caps + capsThisSeason,
      }
    : state.nationalTeamStats;

  // The terraces react to the season just played, not to the one coming.
  const supportDelta = fanSupportDelta(
    statsResult.stats,
    seasonWorth,
    player.role,
    player.trait,
    player.age,
  );
  // What the club signed the player to do sets the bar the season is measured
  // against. A stand promised a replacement for its departed number 9 needs a
  // real season just to stay level; one that signed a teenager for the future
  // is delighted by anything. Without this the meter was a one-way ratchet —
  // careers sat "adored" from about year three and the brief meant nothing.
  const demand = state.clubBrief ? briefDemand(state.clubBrief.key) : 0;
  const expectedSupportDelta = supportDelta - demand;

  // A harder crowd turns faster but is no easier to win over — only the
  // downswings are amplified, so goodwill has to be earned and then defended.
  // The brief's patience rides on top of the difficulty setting for the same
  // reason and in the same direction.
  const patience = state.clubBrief?.patience ?? 1;
  const tunedSupportDelta =
    expectedSupportDelta < 0
      ? expectedSupportDelta * tuning.fanPenalty * patience
      : // Adoration has to be defended rather than banked: the closer to the
        // top of the meter, the less each good season adds.
        expectedSupportDelta * fanCeilingDamping(state.fanSupport);
  const nextFanSupport = applyFanSupport(state.fanSupport, tunedSupportDelta);
  const nextFanPeak = Math.max(state.clubFanPeak ?? state.fanSupport, nextFanSupport);

  const firstCallUp = state.firstCallUpAge ?? (inSquad ? player.age : null);

  // Back-page reaction to whatever just happened this season.
  let headlines = state.headlines;
  const teamName = team.name;
  for (const trophy of trophies) {
    headlines = addHeadline(
      headlines,
      { age: player.age, key: `trophy.${trophy}`, vars: { team: teamName }, tone: "good" },
      `${snapshot.id}-h-${trophy}`,
    );
  }
  for (const award of awardResult.awards) {
    headlines = addHeadline(
      headlines,
      { age: player.age, key: `award.${award}`, vars: { team: teamName }, tone: "good" },
      `${snapshot.id}-h-${award}`,
    );
  }
  if (state.firstCallUpAge === null && inSquad) {
    headlines = addHeadline(
      headlines,
      {
        age: player.age,
        key: "firstCallUp",
        vars: { country: player.nationality.name_pt },
        tone: "good",
      },
      `${snapshot.id}-h-callup`,
    );
  }
  if (relegated) {
    headlines = addHeadline(
      headlines,
      {
        age: player.age,
        key: bigClubShock ? "relegatedBigClub" : "relegated",
        vars: { team: teamName },
        tone: "bad",
      },
      `${snapshot.id}-h-releg`,
    );
  }
  if (promoted) {
    headlines = addHeadline(
      headlines,
      { age: player.age, key: "promoted", vars: { team: teamName }, tone: "good" },
      `${snapshot.id}-h-promo`,
    );
  }
  // A genuinely big season on the card is news in itself — but only if there
  // was a season. Ratings keep climbing in the reserves, and "you exploded"
  // printed over seven appearances contradicts the table right next to it.
  if (nextOverall - player.overall >= 6 && statsResult.stats.appearances >= 15) {
    headlines = addHeadline(
      headlines,
      {
        age: player.age,
        key: "breakoutSeason",
        vars: { team: teamName, ovr: String(nextOverall) },
        tone: "good",
      },
      `${snapshot.id}-h-jump`,
    );
  }

  // A rival only shows up once you're actually good enough to plausibly have
  // one, and even then only sometimes. The roll happens exactly once — the
  // first season the bar is cleared — and `rivalRollDone` makes that permanent,
  // so a career that misses out never quietly re-rolls its way into one later.
  let rival = state.rival;
  let rivalRollDone = state.rivalRollDone;
  if (!rival && !rivalRollDone && nextOverall >= RIVAL_ASSIGNMENT_THRESHOLD) {
    rivalRollDone = true;
    const roll = chance(rng, RIVAL_ASSIGNMENT_CHANCE);
    rng = roll.rng;
    if (roll.success) rival = rollRival(state.seed, player.nationality.fifa_code, player.position);
  }

  return {
    ...state,
    rng,
    seasons: [...state.seasons, snapshot],
    player: {
      ...player,
      age: nextAge,
      overall: nextOverall,
      attributes: boostedAttributes,
      marketValue: nextValue.value,
      currentTeamId: team.id,
    },
    teamTierOverrides: tierOverrides,
    teamReputationOverrides: reputationOverrides,
    nationalTeamStats: nationalStats,
    fanSupport: nextFanSupport,
    clubFanPeak: nextFanPeak,
    rival,
    rivalRollDone,
    firstCallUpAge: firstCallUp,
    headlines,
    // A chosen training focus only colours the season right after the decision.
    pendingTrainingShares: undefined,
  };
}

/** National-team output is a fraction of the club season, not a second full season. */
/**
 * What a season's international football adds, derived from the player's own
 * club form and the number of caps they actually won.
 *
 * It used to be a flat 12% of the club season regardless of how much
 * international football was played, which — combined with caps only
 * accruing in tournament years — left a whole career short of fifty goals
 * for their country. Scaling by caps means a player who is a fixture for
 * fifteen years builds a real international record, and one who is picked
 * occasionally does not.
 */
function scaleNationalContribution(stats: SeasonStats, caps: number): SeasonStats {
  // Per-cap output, taken from the club rate: a striker scoring every other
  // club game scores at a similar clip for their country.
  const perClubGame = (n: number) => (stats.appearances > 0 ? n / stats.appearances : 0);
  // Internationals are tighter games than most club fixtures, so output per
  // appearance sits a little below a player's club rate.
  const INTERNATIONAL_DAMPING = 0.78;
  const scale = caps * INTERNATIONAL_DAMPING;
  return {
    appearances: 0,
    goals: Math.round(perClubGame(stats.goals) * scale),
    assists: Math.round(perClubGame(stats.assists) * scale),
    cleanSheets: Math.round(perClubGame(stats.cleanSheets) * scale),
    goalsConceded: Math.round(perClubGame(stats.goalsConceded) * scale),
  };
}

// ---------------------------------------------------------------------------
// Decision generation
// ---------------------------------------------------------------------------

function predictedStatus(state: CareerState): SquadStatus {
  const teamId = state.currentTeamId ?? state.contractTeamId;
  const team = teamId ? effectiveTeam(state, teamId) : null;
  if (!team) return "starter";
  return squadStatusAtTeam(state.player, team);
}

/**
 * What a club would be signing the player to do, worked out at offer time so
 * the pitch is visible on the card. Deterministic in the career seed, the step
 * and the club, so reading an offer and then accepting it gives the same brief.
 */
function offerBrief(state: CareerState, teamId: string): ClubBrief | undefined {
  const team = effectiveTeam(state, teamId);
  if (!team) return undefined;
  const last = state.seasons[state.seasons.length - 1];
  return rollClubBrief(`${state.seed}:${state.step}`, {
    player: state.player,
    team,
    returning: state.seasons.some((s) => s.teamId === teamId),
    rebuilding: teamTier(state, teamId) > 1,
    lastSeasonWasPoor: last ? last.stats.appearances < 15 || last.relegated : false,
  });
}

/**
 * The most a homecoming can add on top of the goodwill already banked at a
 * club. Deliberately small: coming back a better player buys you a warmer
 * first day, nothing more — the spell is still judged on how it actually goes.
 */
const RETURN_WELCOME_MAX = 8;
/** Overall points of improvement needed to earn one point of that welcome. */
const RETURN_WELCOME_PER_OVERALL = 0.6;

/**
 * The goodwill the player walks into a club with.
 *
 * For a club they have never played for this is purely what the club signed
 * them to do. For a club they are returning to it resumes from where that
 * terrace was left instead: a stand that adored you does not greet you as a
 * stranger, and one you left cold has not forgotten that either. Coming back
 * a better player than you left adds a small bonus on top.
 */
function arrivalFanSupport(
  state: CareerState,
  teamId: string,
  currentOverall: number,
  brief: ClubBrief | null,
): { support: number; peak: number } {
  const memory = state.clubFanMemory?.[teamId];
  if (!memory) {
    const support = brief?.startingSupport ?? FAN_SUPPORT_START;
    return { support, peak: support };
  }
  const improvement = Math.max(0, currentOverall - memory.overall);
  const welcome = Math.min(RETURN_WELCOME_MAX, improvement * RETURN_WELCOME_PER_OVERALL);
  const support = applyFanSupport(memory.support, welcome);
  // A crowd that once adored this player has not forgotten it, so coming
  // back to a cold reception still reads as a stand that turned rather than
  // one that has never heard of him.
  return { support, peak: Math.max(memory.peak ?? support, support) };
}

function addBetrayed(current: string[] | undefined, teamId: string): string[] {
  const list = current ?? [];
  return list.includes(teamId) ? list : [...list, teamId];
}

/**
 * Whether this move is the unforgivable one: walking out of the club that
 * owned you and straight into its arch-rival's shirt.
 *
 * A loan never counts, in either direction — the parent club chose to send
 * the player, and coming back afterwards is not a defection either.
 */
function betrayalOnThisMove(state: CareerState, playingTeamId: string, onLoan: boolean): boolean {
  if (onLoan) return false;
  const left = state.contractTeamId;
  if (!left || left === playingTeamId) return false;
  return areRivals(left, playingTeamId);
}

/**
 * Clubs that must never appear in an offer again.
 *
 * Leaving straight for the arch-rival, or being run out of town by the stand,
 * is not the sort of thing a support forgets two seasons later — so the club
 * is struck off every pool the rest of the career draws from.
 */
function blockedClubs(state: CareerState): string[] {
  return state.betrayedClubs ?? [];
}

/** The most offers worth remembering; a long career sees far more than it needs. */
const MAX_DECLINED_OFFERS = 40;

/**
 * The clubs on this decision that the player said no to.
 *
 * Only real alternatives count: staying at the current club rejects nobody,
 * and neither does an option with no club behind it. The reputation is frozen
 * at the moment of the offer, so a club that fades later still reads as the
 * giant it was when it came calling.
 */
function collectDeclinedOffers(
  state: CareerState,
  event: DecisionEvent,
  chosen: DecisionOption,
): DeclinedOffer[] {
  // Picking one academy at sixteen is not turning anybody down — every kid
  // has to choose one, and "he said no to Santos at 16" is not a story.
  // A save written before offers were tracked has no list at all.
  const kept = state.declinedOffers ?? [];
  if (event.type === "academy_offer") return kept;

  const fresh: DeclinedOffer[] = [];
  for (const other of event.options) {
    if (other.id === chosen.id) continue;
    if (!other.teamId) continue;
    if (other.type !== "join_club" && other.type !== "permanent_transfer") continue;
    const team = effectiveTeam(state, other.teamId);
    if (!team) continue;
    fresh.push({
      teamId: other.teamId,
      age: state.player.age,
      reputation: Math.max(team.domestic_reputation, team.international_reputation),
    });
  }
  if (fresh.length === 0) return kept;
  const next = [...kept, ...fresh];
  return next.length > MAX_DECLINED_OFFERS ? next.slice(next.length - MAX_DECLINED_OFFERS) : next;
}

/** Stamps the club's pitch onto a move option. */
function withBrief(state: CareerState, option: DecisionOption): DecisionOption {
  if (!option.teamId) return option;
  return { ...option, brief: offerBrief(state, option.teamId) };
}

function createTransferEvent(state: CareerState, label: DecisionType = "transfer"): { rng: Rng; event: DecisionEvent } | null {
  const teamId = state.contractTeamId ?? state.currentTeamId;
  const team = teamId ? effectiveTeam(state, teamId) : null;
  if (!team) return null;
  const offers = createTransferOffers(state.rng, state.player, team, 2, blockedClubs(state));
  if (offers.teams.length === 0) return null;
  return {
    rng: offers.rng,
    event: {
      id: eventId(state, label),
      type: label,
      age: state.player.age,
      options: [
        ...offers.teams.map((t, i) =>
          withBrief(state, { id: `transfer-${i}-${t.id}`, type: "join_club" as const, teamId: t.id }),
        ),
        { id: `stay-${team.id}`, type: "stay" as const, teamId: team.id },
      ],
    },
  };
}

/** Ports the original's `ri()` — gates each personal event by role, age, and whether its pool is non-empty. */
/**
 * The reputation band the transfer market is willing to offer this player.
 *
 * On hard the market is a rung colder than the player's level suggests, so
 * every step up the ladder has to be earned twice: once by being good enough,
 * and again by being good enough that even a stingy market notices.
 */
function offerReputationFor(state: CareerState): number {
  const base = playerOfferReputation(state.player.overall);
  return Math.max(0, base - DIFFICULTY_CONFIG[state.difficulty].offerReputationPenalty);
}

/**
 * Caps a national-team regular banks per season, at his peak.
 *
 * A full year is a qualifying campaign (eight to ten matches), a couple of
 * friendly windows and, every other summer, a tournament.
 */
const CAPS_PER_SEASON = 11;

/**
 * A cap tally is not flat across a career, and treating it as flat is what
 * put the record within reach of any decent international.
 *
 * A player crossing the squad threshold at nineteen does not immediately
 * start every qualifier, and a thirty-eight year old is not still doing so.
 * With the ramp, the absolute maximum a twenty-four season career can bank
 * lands just under the real record, so beating it takes an international
 * career that starts as a teenager, never drops out of the side and lasts
 * into a player's forties.
 */
function capsAgeFactor(age: number): number {
  if (age <= 18) return 0.35;
  if (age <= 20) return 0.65;
  if (age <= 22) return 0.85;
  if (age <= 33) return 1;
  if (age <= 36) return 0.8;
  if (age <= 38) return 0.55;
  return 0.35;
}

/**
 * How many seasons running the player has just taken each individual award.
 * Read backwards from the most recent season, so a gap ends the streak.
 */
function awardStreaks(seasons: SeasonSnapshot[]): { top: number; boot: number } {
  let top = 0;
  let boot = 0;
  let topOpen = true;
  let bootOpen = true;
  for (let i = seasons.length - 1; i >= 0 && (topOpen || bootOpen); i -= 1) {
    const awards = seasons[i].awards;
    if (topOpen) {
      if (awards.includes("ballon_dor") || awards.includes("golden_glove")) top += 1;
      else topOpen = false;
    }
    if (bootOpen) {
      if (awards.includes("golden_boot")) boot += 1;
      else bootOpen = false;
    }
  }
  return { top, boot };
}

/** A full starter season's worth of appearances — the yardstick for "actually played". */
const STARTER_SEASON_APPEARANCES = 40;

/** Where a club plays, for the one trophy whose worth depends on it. */
function clubConfederation(teamId: string): Confederation | undefined {
  return getLeagueOfTeam(teamId)?.confederation as Confederation | undefined;
}

/**
 * What this club's terraces would currently call the player, judged the same
 * way the summary timeline judges it: importance-weighted trophies, seasons
 * served, and how much of that time was actually spent on the pitch.
 */
function standingAtCurrentClub(state: CareerState, team: Team | null): ClubStanding {
  if (!team) return "passing";
  const here = state.seasons.filter((s) => s.teamId === team.id);
  if (here.length === 0) return "passing";

  let trophyScore = 0;
  let appearances = 0;
  for (const season of here) {
    appearances += season.stats.appearances;
    for (const key of season.trophies) {
      trophyScore += singleTrophyImportance(key, clubConfederation(team.id));
    }
  }

  return clubStanding({
    seasons: here.length,
    trophyScore,
    clubReputation: (team.domestic_reputation + team.international_reputation) / 2,
    playedShare: appearances / here.length / STARTER_SEASON_APPEARANCES,
  });
}

function eligibleCareerEvents(state: CareerState, status: SquadStatus, team: Team | null): CareerEventKey[] {
  const player = state.player;
  const activeRotation = status === "starter" || status === "high_rotation";

  return CAREER_EVENT_KEYS.filter((key) => {
    if (key === "season_load" || key === "position_competition") return activeRotation;
    if (key === "captain_armband") {
      return player.age > 24 && status === "starter" && Boolean(team);
    }
    if (key === "locker_room_clash") {
      return player.age > 20 && activeRotation && Boolean(team);
    }
    if (key === "club_priority") {
      return status === "starter" && (team?.domestic_reputation ?? 0) > 2 && (team?.international_reputation ?? 0) > 2;
    }
    if (key === "rival_offer") {
      return (
        status === "starter" &&
        Boolean(team) &&
        rivalPool(state, team!).length > 0 &&
        (team?.domestic_reputation ?? 0) > 2 &&
        (team?.international_reputation ?? 0) > 2
      );
    }
    if (key === "club_crisis") {
      return Boolean(team) && ((team!.domestic_reputation > 1 || team!.international_reputation > 1)) && wouldTransferProduceOffer(state, team!);
    }
    if (key === "iconic_number") {
      // Nothing to offer if the position's first-team shirts are all already
      // theirs, or if they have not been given a number at all yet.
      if (state.shirtNumber === null) return false;
      const available = legendNumbersFor(player.position).filter((n) => n !== state.shirtNumber);
      return (
        player.age > 22 &&
        activeRotation &&
        Boolean(team) &&
        (team?.domestic_reputation ?? 0) > 1 &&
        available.length > 0
      );
    }
    if (key === "shirt_upgrade") {
      // A club only re-numbers someone it rates: a starter, a player the
      // terraces have taken to, or one in the middle of a genuinely good run.
      // Pointless to offer if every marquee shirt for the position is already
      // theirs, or if they haven't even been given a first number yet.
      if (state.shirtNumber === null || !team) return false;
      const upgrades = prestigeNumbersFor(player.position).filter((n) => n !== state.shirtNumber);
      if (upgrades.length === 0) return false;
      const earnedIt =
        status === "starter" ||
        state.fanSupport >= 65 ||
        standingAtCurrentClub(state, team) !== "passing";
      return player.age > 19 && activeRotation && earnedIt;
    }
    if (key === "severe_injury") {
      // Only while there is still a career left to damage: a ceiling drop means
      // nothing to someone about to retire, and the early years are punishing
      // enough already. Once per career.
      return (
        player.age >= 21 &&
        player.age <= 30 &&
        activeRotation &&
        Boolean(team) &&
        !state.careerEventPlan.completedEventKeys.includes("severe_injury")
      );
    }
    if (key === "shirt_legend_tribute") {
      // The board hands over the pick of the squad list exactly once, and only
      // to someone this club already considers one of its own greats.
      if (state.legendShirtTributeUsed || state.shirtNumber === null || !team) return false;
      return (
        standingAtCurrentClub(state, team) === "legend" &&
        state.fanSupport >= 80 &&
        status === "starter"
      );
    }
    if (key === "dressing_room_fallout") {
      // Being thrown out of a club is a one-off in a career, and it needs a
      // club to be thrown out of plus enough standing for the row to matter.
      return (
        Boolean(team) &&
        player.age >= 20 &&
        activeRotation &&
        !state.careerEventPlan.completedEventKeys.includes("dressing_room_fallout")
      );
    }
    if (key === "return_home") {
      return player.age > 24 && Boolean(team) && returnHomePool(state, team!).length > 0;
    }
    if (key === "tax_trouble") {
      // A work-permit problem is something that happens to a foreigner. The
      // gate used to check only that other countries exist, so a Brazilian at
      // a Brazilian club could be told a change in local law threatened their
      // right to stay in their own country.
      return Boolean(team) && playingAbroad(state, team!) && foreignExitPool(state, team!).length > 0;
    }
    if (key === "finish_high_school") {
      // The id is a leftover: the copy is a coaching-licence course, which is
      // something a player starts thinking about once the end is in sight, not
      // as a teenager. Ungated it could be offered at any age at all.
      return player.age >= 26;
    }
    if (key === "foreign_grandfather") {
      // Once you've actually worn a senior shirt, switching allegiance is off the table.
      return state.firstCallUpAge === null && sameConfederationCountries(state).length > 0;
    }
    if (key === "triumphant_return") {
      return firstClubForTriumphantReturn(state) !== null;
    }
    if (key === "club_national_team_conflict") {
      const threshold = CALL_UP_THRESHOLD[clamp(player.nationality.international_reputation, 0, CALL_UP_THRESHOLD.length - 1)];
      return player.overall >= threshold && state.upcomingNationalTournaments.some((t) => t.selectionQualified);
    }
    if (key === "injury_at_peak") {
      return status === "starter" && Boolean(team) && peekClubTrophyTarget(state, team!) !== null;
    }
    if (key === "decisive_penalty") {
      return Boolean(team) && peekBigMomentTrophyTarget(state, team!) !== null;
    }
    if (key === "new_manager") {
      return Boolean(team) && player.age > 17;
    }
    if (key === "derby_spotlight") {
      // There has to be a derby. The dataset already knows which clubs
      // genuinely hate each other, so ask it instead of assuming every
      // fixture on the calendar is one.
      return activeRotation && Boolean(team) && player.role !== "goalkeeper" && hasDerby(team!);
    }
    if (key === "testimonial_match") {
      return player.age >= 33 && activeRotation && Boolean(team);
    }
    if (key === "agent_ultimatum") {
      return player.age > 23 && Boolean(team) && wouldTransferProduceOffer(state, team!);
    }
    if (key === "wonderkid_signing") {
      return player.age > 20 && activeRotation && Boolean(team);
    }
    if (key === "boot_deal") return true;
    if (key === "podcast_interview") return player.age > 19;
    if (key === "agent_change") return player.age > 20;
    if (key === "packed_home_stadium") return activeRotation && Boolean(team);
    if (key === "controversial_red_card") {
      return activeRotation && player.role !== "goalkeeper";
    }
    // The crowd only has something to say once they've made their mind up about you.
    if (key === "crowd_turns") return Boolean(team) && state.fanSupport < FAN_SUPPORT_BANDS.cold;
    // No rival, no rivalry — these only fire once one's been assigned.
    if (key === "rival_press") return state.rival !== null;
    if (key === "rival_milestone") return state.rival !== null;
    if (key === "rival_duel") return state.rival !== null && activeRotation && Boolean(team);
    // position_change: goalkeepers don't switch outfield positions.
    return player.position !== "GK";
  });
}

function createCareerEventDecision(state: CareerState): { rng: Rng; event: DecisionEvent } | null {
  const plan = state.careerEventPlan;
  const age = state.player.age;
  const slot = pendingSlotAge(plan, age);
  if (slot === null || age > 37) return null;

  // The season(s) this decision would cover must never be the ones that end
  // the career — a risky "do X or Y" gamble has no business being the very
  // last thing that happens before retirement.
  const periodLength = MODE_CONFIG[state.mode].periodLengthSeasons;
  if (age + periodLength >= RETIREMENT_AGE) return null;

  // Space personal events out so they never land back-to-back.
  const lastAge = plan.completedEventAges.at(-1);
  const spacing = MODE_CONFIG[state.mode].periodLengthSeasons * 2;
  if (lastAge !== undefined && age - lastAge < spacing) return null;

  const teamId = state.contractTeamId ?? state.currentTeamId;
  const team = teamId ? effectiveTeam(state, teamId) : null;
  const status = predictedStatus(state);

  const available = eligibleCareerEvents(state, status, team).filter(
    (k) => k !== "injury" && !plan.completedEventKeys.includes(k),
  );
  const injuryAllowed = plan.injuryCount < 2;
  if (available.length === 0 && !injuryAllowed) return null;

  // Injuries are rolled independently from a dedicated stream.
  if (injuryAllowed) {
    const injuryRoll = chance(
      createRng(`${state.seed}:injury:${state.step}`),
      INJURY_PROBABILITY * DIFFICULTY_CONFIG[state.difficulty].injury,
    );
    if (injuryRoll.success) {
      const injury = pickInjury(injuryRoll.rng);
      return {
        rng: state.rng,
        event: {
          id: eventId(state, "career-event-injury"),
          type: "career_event",
          age,
          eventKey: "injury",
          injuryType: injury.type,
          scheduledSlotAge: slot,
          options: CAREER_EVENT_OPTIONS.injury.map((o) => ({
            id: `injury-${o}`,
            type: "career_choice" as const,
            eventKey: "injury" as CareerEventKey,
            optionKey: o,
          })),
        },
      };
    }
  }

  if (available.length === 0) return null;

  const picked = pickWeighted(
    state.rng,
    available.map((k) => ({
      item: k,
      weight:
        (CAREER_EVENT_WEIGHTS[k] ?? 100) *
        (k === "severe_injury" ? DIFFICULTY_CONFIG[state.difficulty].severeInjury : 1),
    })),
  );
  const key = picked.item;

  const variants = CAREER_EVENT_VARIANTS[key];
  const variantKey = variants
    ? pickWeighted(createRng(`${state.seed}:variant:${state.step}:${key}`), variants.map((v) => ({ item: v.key, weight: v.weight }))).item
    : undefined;

  const event: DecisionEvent = {
    id: eventId(state, `career-event-${key}`),
    type: "career_event",
    age,
    eventKey: key,
    scheduledSlotAge: slot,
    ...(variantKey ? { variantKey } : {}),
    options: CAREER_EVENT_OPTIONS[key].map((o) => ({
      id: `${key}-${o}`,
      type: "career_choice" as const,
      eventKey: key,
      optionKey: o,
    })),
  };

  return decorateCareerEvent(state, picked.rng, event, team);
}

/**
 * Narrative "stay put" options whose copy ends mid-sentence expecting the
 * current club's name after it ("Ficar para lutar no {team}") — the option
 * object needs `teamId` set to the current club for that name to actually
 * render, unlike engine-appended club-offer options which already carry one.
 */
const STAY_AT_CURRENT_CLUB_OPTION: Partial<Record<CareerEventKey, string>> = {
  club_crisis: "stay_and_fight",
  tax_trouble: "stay_and_fight",
  return_home: "stay_abroad",
};

/** Some events need extra context (a rival club, a second nationality, club choices, a trophy target). */
function decorateCareerEvent(
  state: CareerState,
  rng: Rng,
  initialEvent: DecisionEvent,
  team: Team | null,
): { rng: Rng; event: DecisionEvent } {
  const key = initialEvent.eventKey!;
  let cur = rng;

  const stayOptionKey = STAY_AT_CURRENT_CLUB_OPTION[key];
  const event: DecisionEvent =
    stayOptionKey && team
      ? {
          ...initialEvent,
          options: initialEvent.options.map((o) =>
            o.optionKey === stayOptionKey ? { ...o, teamId: team.id } : o,
          ),
        }
      : initialEvent;

  // The shirts on the table are drawn now rather than declared up front, so
  // each one becomes its own option carrying the number it would put on the
  // player's back. The fixed "keep_current" option stays last.
  // Which injury it is decides how much of the ceiling goes, so it has to be
  // drawn before the option is resolved rather than inside the resolver.
  if (key === "severe_injury") {
    const picked = pickSevereInjury(cur);
    return { rng: picked.rng, event: { ...event, injuryType: picked.type } };
  }

  // The club's own shirt, handed to the player who has earned it. It used to
  // be a decision about nothing: the board offered "the number that carries
  // the weight of this club's history", the player took it, and the number on
  // their back did not change. Drawn from the first-team shirts the position
  // actually wears, so a striker is handed a 9 or a 10 rather than the 4.
  if (key === "iconic_number") {
    const offer = rollLegendTributeOffer(cur, state.player.position, state.shirtNumber ?? 0);
    cur = offer.rng;
    const number = offer.numbers[0];
    if (number === undefined) return { rng: cur, event };
    return {
      rng: cur,
      event: {
        ...event,
        options: event.options.map((option) =>
          option.optionKey === "claim_it" ? { ...option, shirtNumber: number } : option,
        ),
      },
    };
  }

  if (key === "shirt_upgrade" || key === "shirt_legend_tribute") {
    const current = state.shirtNumber ?? 0;
    const offer =
      key === "shirt_upgrade"
        ? rollShirtUpgradeOffer(cur, state.player.position, current)
        : rollLegendTributeOffer(cur, state.player.position, current);
    cur = offer.rng;

    if (offer.numbers.length === 0) return { rng: cur, event };

    return {
      rng: cur,
      event: {
        ...event,
        options: [
          ...offer.numbers.map((n) => ({
            id: `${key}-take-${n}`,
            type: "career_choice" as const,
            eventKey: key,
            optionKey: "take_number",
            shirtNumber: n,
          })),
          ...event.options,
        ],
      },
    };
  }

  if (key === "rival_offer" && team) {
    const rivals = rivalPool(state, team);
    if (rivals.length > 0) {
      const picked = pickOne(cur, rivals);
      cur = picked.rng;
      return { rng: cur, event: { ...event, rivalTeamId: picked.item.id } };
    }
  }

  if (key === "foreign_grandfather") {
    const alternatives = sameConfederationCountries(state);
    if (alternatives.length > 0) {
      const picked = pickOne(cur, alternatives);
      cur = picked.rng;
      return { rng: cur, event: { ...event, alternativeNationalityFifaCode: picked.item.fifa_code } };
    }
    return { rng: cur, event };
  }

  if (key === "triumphant_return") {
    const firstClub = firstClubForTriumphantReturn(state);
    const currentId = state.contractTeamId ?? state.currentTeamId;
    if (firstClub && currentId) {
      return {
        rng: cur,
        event: {
          ...event,
          options: [
            withBrief(state, { id: `triumphant-return-${firstClub.teamId}`, type: "join_club", teamId: firstClub.teamId }),
            { id: `triumphant-return-stay-${currentId}`, type: "stay", teamId: currentId },
          ],
        },
      };
    }
    return { rng: cur, event };
  }

  if (key === "injury_at_peak" && team) {
    const target = peekClubTrophyTarget(state, team);
    if (target) return { rng: cur, event: { ...event, targetClubTrophy: target } };
    return { rng: cur, event };
  }

  if (key === "decisive_penalty" && team) {
    const target = peekBigMomentTrophyTarget(state, team);
    if (target) return { rng: cur, event: { ...event, targetTrophy: target } };
    return { rng: cur, event };
  }

  if (key === "club_national_team_conflict") {
    const tournament = state.upcomingNationalTournaments.find((t) => t.selectionQualified);
    if (tournament) return { rng: cur, event: { ...event, nationalTournament: tournament } };
    return { rng: cur, event };
  }

  if (!team) return { rng: cur, event };

  // "Go home" and "leave the country" pick a destination with the right filter.
  if (key === "return_home" || key === "tax_trouble") {
    const pool = key === "return_home" ? returnHomePool(state, team) : foreignExitPool(state, team);
    if (pool.length === 0) return { rng: cur, event };

    const target = jitterOfferReputation(cur, offerReputationFor(state));
    cur = target.rng;
    const exact = pool.filter((t) => t.international_reputation === target.reputation);
    const shortlist = exact.length > 0 ? exact : closestByReputation(pool, target.reputation);
    const picked = pickOne(cur, shortlist);
    cur = picked.rng;
    return {
      rng: cur,
      event: {
        ...event,
        options: [
          ...event.options,
          withBrief(state, { id: `${key}-move-${picked.item.id}`, type: "join_club", teamId: picked.item.id }),
        ],
      },
    };
  }

  if (key === "dressing_room_fallout") {
    // The contract is already torn up, so this offers somewhere to go rather
    // than whether to go. The option carries `optionKey: "move"` so the
    // event's own modifiers still resolve — a plain club option carries no
    // option key and would silently skip the fallout's cost entirely.
    const offers = createTransferOffers(cur, state.player, team, 2, blockedClubs(state));
    cur = offers.rng;
    if (offers.teams.length > 0) {
      return {
        rng: cur,
        event: {
          ...event,
          options: offers.teams.map((destination, i) =>
            withBrief(state, {
              id: `${key}-exit-${i}-${destination.id}`,
              type: "join_club" as const,
              teamId: destination.id,
              eventKey: key,
              optionKey: "move",
            }),
          ),
        },
      };
    }
  }
  if (CLUB_CHOICE_EVENTS.has(key)) {
    const offers = createTransferOffers(cur, state.player, team, 1, blockedClubs(state));
    cur = offers.rng;
    if (offers.teams.length > 0) {
      const destination = offers.teams[0];
      return {
        rng: cur,
        event: {
          ...event,
          options: [
            ...event.options,
            withBrief(state, { id: `${key}-join-${destination.id}`, type: "join_club", teamId: destination.id }),
          ],
        },
      };
    }
  }

  return { rng: cur, event };
}

function closestByReputation(pool: Team[], reputation: number): Team[] {
  const best = Math.min(...pool.map((t) => Math.abs(t.international_reputation - reputation)));
  return pool.filter((t) => Math.abs(t.international_reputation - reputation) === best);
}

function createPostLoanEvent(state: CareerState): { rng: Rng; event: DecisionEvent } | null {
  const completed = state.completedLoan;
  if (!completed) return null;
  const loanTeam = getTeam(completed.loanTeamId);
  if (!loanTeam) return null;

  const status = predictedStatus(state);
  if (status === "starter" || status === "high_rotation") {
    const transfer = createTransferEvent(state, "post_loan_retained");
    return transfer;
  }

  // Past loan age the answer can no longer be "go out on loan again". This
  // branch used to offer two fresh loans regardless of age, and because a
  // player who is never good enough to be retained keeps landing back here, a
  // career could spend twenty straight seasons on loan and still be a loanee
  // at 39. Once too old, the club has to decide: sell, or keep them.
  if (state.player.age > LOAN_MAX_AGE) {
    // Its own label, not `post_loan_not_retained`: that copy promises another
    // loan or a permanent deal at the current club, and this branch offers
    // neither — it deals ordinary transfer offers plus staying to fight.
    return createTransferEvent(state, "post_loan_aged_out");
  }

  const contractTeam = state.contractTeamId ? effectiveTeam(state, state.contractTeamId) : null;
  if (!contractTeam) return null;

  const loans = createLoanOffers(
    state.rng,
    state.player,
    contractTeam,
    offerReputationFor(state),
    2,
    [loanTeam.id, ...blockedClubs(state)],
  );
  if (!loans) return null;

  return {
    rng: loans.rng,
    event: {
      id: eventId(state, "post_loan_not_retained"),
      type: "post_loan_not_retained",
      age: state.player.age,
      options: [
        ...loans.teams.map((t, i) =>
          withBrief(state, { id: `loan-${i}-${t.id}`, type: "join_loan" as const, teamId: t.id }),
        ),
        withBrief(state, { id: `permanent-${loanTeam.id}`, type: "permanent_transfer" as const, teamId: loanTeam.id }),
      ],
    },
  };
}

function createNonRenewalEvent(state: CareerState): { rng: Rng; event: DecisionEvent } | null {
  const contractTeam = state.contractTeamId ? effectiveTeam(state, state.contractTeamId) : null;
  if (!contractTeam) return null;
  const result = createNonRenewalOffers(
    state.rng,
    state.player,
    contractTeam,
    offerReputationFor(state),
    blockedClubs(state),
  );
  if (!result) return null;

  const options: DecisionOption[] = result.teams.map((t, i) =>
    withBrief(state, { id: `nonrenewal-${i}-${t.id}`, type: "join_club" as const, teamId: t.id }),
  );
  if (result.canRetire) options.push({ id: `retire-${state.step}`, type: "retire" });

  return {
    rng: result.rng,
    event: {
      id: eventId(state, "contract_non_renewal"),
      type: "contract_non_renewal",
      age: state.player.age,
      options,
    },
  };
}

/**
 * Occasional preseason choice that biases where the next season's growth lands.
 * Only offered while the player is still developing, and never back-to-back.
 */
function createTrainingFocusEvent(state: CareerState): { rng: Rng; event: DecisionEvent | null } {
  if (!state.currentTeamId) return { rng: state.rng, event: null };
  if (state.player.age < 17 || state.player.age > 31) return { rng: state.rng, event: null };
  if (state.periodIndex - state.lastTrainingFocusPeriod < 3) return { rng: state.rng, event: null };

  const roll = chance(state.rng, 0.45);
  if (!roll.success) return { rng: roll.rng, event: null };

  // Every focus, always. Hiding the ones with no headroom left was meant to
  // stop a choice resolving to a card that does not move, but it made the
  // menu itself unpredictable — five options one preseason, one the next,
  // with no explanation on screen. The guarantee handles that case instead:
  // training now moves what it promises to move, ceiling or no ceiling.
  const focuses = trainingFocusesFor(state.player.position);

  return {
    rng: roll.rng,
    event: {
      id: eventId(state, "training_focus"),
      type: "training_focus",
      age: state.player.age,
      options: focuses.map((focus) => ({
        id: `training-${focus.key}`,
        type: "training" as const,
        optionKey: focus.key,
        teamId: state.currentTeamId ?? undefined,
      })),
    },
  };
}

function createLoanEvent(state: CareerState): { rng: Rng; event: DecisionEvent } | null {
  const contractTeam = state.contractTeamId ? effectiveTeam(state, state.contractTeamId) : null;
  if (!contractTeam) return null;
  const loans = createLoanOffers(
    state.rng,
    state.player,
    contractTeam,
    offerReputationFor(state),
    3,
    blockedClubs(state),
  );
  if (!loans) return null;
  return {
    rng: loans.rng,
    event: {
      id: eventId(state, "loan_offer"),
      type: "loan_offer",
      age: state.player.age,
      options: loans.teams.map((t, i) =>
        withBrief(state, { id: `loan-${i}-${t.id}`, type: "join_loan" as const, teamId: t.id }),
      ),
    },
  };
}

/** The normal decision-branching used while not suspended: post-loan, contract expiry, events, loan-or-transfer. */
function normalNextDecision(state: CareerState): CareerState {
  if (state.completedLoan) {
    const postLoan = createPostLoanEvent(state);
    // The loan is over either way — clear it even when no post-loan decision
    // could be built, or `completedLoan` sticks around forever and silently
    // blocks the player from ever being loaned again.
    state = { ...state, completedLoan: null };
    if (postLoan) {
      return { ...state, rng: postLoan.rng, currentEvent: postLoan.event };
    }
  }

  const config = MODE_CONFIG[state.mode];
  const patience = DIFFICULTY_CONFIG[state.difficulty].patience;
  const contractTeam = state.contractTeamId ? effectiveTeam(state, state.contractTeamId) : null;
  const streaks = contractTeam ? computeStreaks(state, contractTeam) : { lowRoleStreak: 0, substituteStreak: 0 };
  // On hard, clubs move players on a period sooner and start doing it at 24
  // rather than 26 — there is no season of grace to play your way back in.
  if (
    state.player.age >= (patience > 0 ? 26 : 24) &&
    (streaks.lowRoleStreak >= Math.max(1, config.lowRotationPeriodsBeforeNonRenewal - (1 - patience)) ||
      streaks.substituteStreak >= Math.max(1, config.substitutePeriodsBeforeNonRenewal - (1 - patience)))
  ) {
    const nonRenewal = createNonRenewalEvent(state);
    if (nonRenewal) {
      return { ...state, rng: nonRenewal.rng, currentEvent: nonRenewal.event };
    }
  }

  const careerEvent = createCareerEventDecision(state);
  if (careerEvent) {
    return { ...state, rng: careerEvent.rng, currentEvent: careerEvent.event };
  }

  const training = createTrainingFocusEvent(state);
  if (training.event) {
    return { ...state, rng: training.rng, currentEvent: training.event };
  }
  state = { ...state, rng: training.rng };

  const status = predictedStatus(state);
  const canLoan = isLoanEligible(state.player, status, Boolean(state.activeLoan || state.completedLoan));
  const weight = canLoan ? loanWeight(status) : 0;

  if (weight > 0) {
    const roll = pickWeighted(state.rng, [
      { item: "loan" as const, weight },
      { item: "transfer" as const, weight: Math.max(0, 100 - weight) },
    ]);
    if (roll.item === "loan") {
      const loan = createLoanEvent({ ...state, rng: roll.rng });
      if (loan) return { ...state, rng: loan.rng, currentEvent: loan.event };
    }
    const transfer = createTransferEvent({ ...state, rng: roll.rng });
    if (transfer) return { ...state, rng: transfer.rng, currentEvent: transfer.event };
  }

  const transfer = createTransferEvent(state);
  if (transfer) return { ...state, rng: transfer.rng, currentEvent: transfer.event };

  return { ...state, phase: "summary", currentEvent: null, retirementReason: "no_offers" };
}

/**
 * Decides which decision the player faces next: retirement checks first,
 * then (while serving out a doping ban) nothing but plain transfer windows,
 * otherwise the normal branching.
 */
/**
 * Transfer-window decisions, where "walk away now" is a coherent third answer.
 *
 * Deliberately not every decision: a training focus or a mid-season career
 * event is not a moment anybody retires at, and both are rendered by panels
 * that key off their own option shapes.
 */
const BANKABLE_DECISIONS: DecisionType[] = [
  "transfer",
  "loan_offer",
  "post_loan_retained",
  "post_loan_not_retained",
  "post_loan_aged_out",
  "contract_non_renewal",
];

/** The earliest age a challenge career can be ended by choice. */
const EARLY_RETIREMENT_MIN_AGE = 27;

/**
 * Adds "retire now" to a transfer window when the career is one the player is
 * allowed to end on their own terms.
 *
 * This is what makes the daily challenge's twilight decay a decision rather
 * than a tax: pushing on for another season can win more, and can also cost
 * more than it wins, and the player is the one who has to call it.
 */
function withBankOption(state: CareerState): CareerState {
  const event = state.currentEvent;
  if (!event || !state.allowEarlyRetirement) return state;
  if (state.player.age < EARLY_RETIREMENT_MIN_AGE) return state;
  if (!BANKABLE_DECISIONS.includes(event.type)) return state;
  if (event.options.some((o) => o.type === "retire")) return state;

  return {
    ...state,
    currentEvent: {
      ...event,
      options: [...event.options, { id: `bank-${state.step}`, type: "retire" }],
    },
  };
}

function nextDecision(state: CareerState): CareerState {
  return withBankOption(nextDecisionInner(state));
}

function nextDecisionInner(state: CareerState): CareerState {
  if (state.player.age >= RETIREMENT_AGE) {
    return { ...state, phase: "summary", currentEvent: null, retirementReason: "age" };
  }

  if (state.player.age >= 26 && state.player.overall < 50) {
    return {
      ...state,
      currentEvent: {
        id: eventId(state, "no_offers_retirement"),
        type: "no_offers_retirement",
        age: state.player.age,
        options: [{ id: `retire-no-offers-${state.step}`, type: "retire" }],
      },
    };
  }

  if (state.suspensionSeasonsRemaining > 0) {
    const transfer = createTransferEvent(state);
    if (transfer) return { ...state, rng: transfer.rng, currentEvent: transfer.event };
  }

  return normalNextDecision(state);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function startCareer(
  seed: string,
  mode: GameMode,
  identity: Identity,
  difficulty: Difficulty = "normal",
  options: { allowEarlyRetirement?: boolean } = {},
): CareerState {
  const country = getCountryByIso(identity.countryIso);
  if (!country) throw new Error(`Unknown country: ${identity.countryIso}`);

  const startingAttributes = createStartingAttributes(identity.position, START_OVERALL);
  const talent = rollPotential(seed, difficulty);

  const player: Player = {
    age: START_AGE,
    overall: Math.round(computeOverall(startingAttributes, identity.position)),
    attributes: startingAttributes,
    marketValue: START_MARKET_VALUE,
    position: identity.position,
    role: roleForPosition(identity.position),
    nationality: country,
    developmentProfile: pickDevelopmentProfile(seed, identity.position),
    potential: talent.potential,
    talentTier: talent.talentTier,
    trait: rollPersonality(seed),
    currentTeamId: null,
  };

  let rng = createRng(seed);
  const planResult = createCareerEventPlan(rng, mode);
  rng = planResult.rng;

  const tournaments = buildUpcomingTournaments(rng, player, RETIREMENT_AGE - START_AGE);
  rng = tournaments.rng;

  const base: CareerState = {
    seed,
    mode,
    difficulty,
    phase: "career",
    step: 0,
    rng,
    identity,
    player,
    currentTeamId: null,
    contractTeamId: null,
    activeLoan: null,
    completedLoan: null,
    seasons: [],
    periodIndex: 0,
    careerEventPlan: planResult.plan,
    upcomingNationalTournaments: tournaments.tournaments,
    currentEvent: null,
    lastOutcome: null,
    suspensionSeasonsRemaining: 0,
    lastTrainingFocusPeriod: -99,
    teamTierOverrides: {},
    teamReputationOverrides: {},
    nationalTeamStats: { ...EMPTY_STATS, caps: 0 },
    fanSupport: FAN_SUPPORT_START,
    clubBrief: null,
    // Not everyone earns a rival — only assigned once OVR crosses the threshold.
    rival: null,
    declinedOffers: [],
    allowEarlyRetirement: options.allowEarlyRetirement ?? false,
    rivalRollDone: false,
    headlines: [],
    firstCallUpAge: null,
    shirtNumber: null,
    legendShirtTributeUsed: false,
    birthNationality: country,
    retirementReason: null,
  };

  const academy = createAcademyOffers(base.rng, player);
  return {
    ...base,
    rng: academy.rng,
    currentEvent: {
      id: `${seed}-0-academy_offer`,
      type: "academy_offer",
      age: player.age,
      options: academy.teams.map((t, i) => ({
        id: `academy-${i}-${t.id}`,
        type: "join_club" as const,
        teamId: t.id,
      })),
    },
  };
}

/**
 * Hangs up the boots on the spot.
 *
 * Some careers stop being worth playing out — a ceiling that a bad injury
 * took away, a spell nobody will end, a save the player simply wants to draw
 * a line under. Retiring is not the same as abandoning: the seasons already
 * played still count, and the summary and the newspaper still get written.
 * That is the whole point of offering it.
 */
export function retireNow(state: CareerState): CareerState {
  if (state.phase !== "career") return state;
  return { ...state, phase: "summary", currentEvent: null, retirementReason: "voluntary" };
}

export function chooseOption(state: CareerState, optionId: string): CareerState {
  if (state.phase !== "career" || !state.currentEvent) return state;
  const option = state.currentEvent.options.find((o) => o.id === optionId);
  if (!option) return state;
  const event = state.currentEvent;

  if (option.type === "retire") {
    const reason = event.type === "no_offers_retirement" ? "poor_form" : event.type === "contract_non_renewal" ? "no_offers" : "voluntary";
    return { ...state, phase: "summary", currentEvent: null, retirementReason: reason };
  }

  const isCareerChoice = option.type === "career_choice";
  const periodLength = MODE_CONFIG[state.mode].periodLengthSeasons;

  // Everything on the table that the player did not take. Staying put is not a
  // rejection of anywhere, so `stay` is skipped; so is the club actually
  // chosen. Capped because a long career sees a lot of offers and only the
  // biggest one ever gets quoted back.
  const declined = collectDeclinedOffers(state, event, option);

  // Resolve career-event modifiers up front so they colour the whole period.
  let rng = state.rng;
  let modifiers: Modifiers = { ...NO_MODIFIERS };
  let outcome: OutcomeKind = "neutral";

  if (event.type === "career_event" && event.eventKey && (isCareerChoice || option.optionKey === "move")) {
    const resolved = resolveCareerEvent(
      rng,
      event.eventKey,
      option.optionKey ?? "",
      event.injuryType,
      event.variantKey,
      state.player.trait,
    );
    rng = resolved.rng;
    modifiers = resolved.modifiers;
    outcome = resolved.outcomeKind;
    if (event.eventKey === "triumphant_return" && option.type === "join_club") {
      modifiers = { ...modifiers, roleOverride: "starter" };
    }
  }

  // A resolved injury_at_peak / decisive_penalty forces the specific trophy at stake.
  if (event.eventKey === "club_national_team_conflict" && event.nationalTournament) {
    modifiers = { ...modifiers, nationalTournament: event.nationalTournament.trophy };
  }
  if (event.eventKey === "injury_at_peak" && event.targetClubTrophy && outcome) {
    modifiers = {
      ...modifiers,
      clubTrophyOverride: { trophy: event.targetClubTrophy, result: outcome === "positive" ? "force" : "skip" },
    };
  }
  if (event.eventKey === "decisive_penalty" && event.targetTrophy && outcome) {
    const isNational = event.targetTrophy === "national_continental" || event.targetTrophy === "world_cup";
    modifiers = {
      ...modifiers,
      ...(isNational
        ? { nationalTrophyOverride: { trophy: event.targetTrophy, result: outcome === "positive" ? "force" : "skip" } }
        : { clubTrophyOverride: { trophy: event.targetTrophy as ClubTrophyKey, result: outcome === "positive" ? "force" : "skip" } }),
    };
  }

  // Work out where the player actually plays this period.
  const rivalAccepted =
    event.eventKey === "rival_offer" && option.optionKey === "accept" && event.rivalTeamId;

  let playingTeamId: string;
  let nextContractTeamId = state.contractTeamId;
  let onLoan = false;

  if (rivalAccepted) {
    playingTeamId = event.rivalTeamId!;
    nextContractTeamId = event.rivalTeamId!;
  } else if (option.type === "join_loan") {
    playingTeamId = option.teamId!;
    onLoan = true;
  } else if (option.type === "stay") {
    playingTeamId = option.teamId!;
    nextContractTeamId = option.teamId!;
  } else if (option.type === "permanent_transfer" || option.type === "join_club") {
    playingTeamId = option.teamId!;
    nextContractTeamId = option.teamId!;
  } else {
    playingTeamId = state.currentTeamId ?? state.contractTeamId ?? "";
  }

  const team = playingTeamId ? effectiveTeam(state, playingTeamId) : null;
  if (!team) return state;

  // The very first professional contract comes with a squad number attached —
  // the player never picks it. After that it travels with them for the rest of
  // the career, and only the shirt events below can change it.
  let shirtNumber = state.shirtNumber;
  let legendShirtTributeUsed = state.legendShirtTributeUsed;
  if (shirtNumber === null) {
    const assigned = rollInitialShirtNumber(rng, state.player.position);
    rng = assigned.rng;
    shirtNumber = assigned.value;
  }
  if (
    event.eventKey === "shirt_upgrade" ||
    event.eventKey === "shirt_legend_tribute" ||
    event.eventKey === "iconic_number"
  ) {
    if (typeof option.shirtNumber === "number") shirtNumber = option.shirtNumber;
    if (event.eventKey === "shirt_legend_tribute") legendShirtTributeUsed = true;
  }

  // Switching national team rebuilds the tournament calendar.
  let player = state.player;
  let tournaments = state.upcomingNationalTournaments;
  if (event.eventKey === "foreign_grandfather" && option.optionKey === "switch_national_team" && event.alternativeNationalityFifaCode) {
    const newCountry = getCountryByFifa(event.alternativeNationalityFifaCode);
    if (newCountry) {
      player = { ...player, nationality: newCountry };
      const rebuilt = buildUpcomingTournaments(rng, player, RETIREMENT_AGE - player.age);
      rng = rebuilt.rng;
      tournaments = rebuilt.tournaments;
    }
  }

  // Overall-affecting deltas apply once for the whole period, not per season,
  // and are spread evenly across the card so no single stat absorbs them.
  const eventDelta = modifiers.immediateOverallDelta + modifiers.permanentOverallDelta;
  if (eventDelta !== 0) {
    const shifted = shiftOverall(player.attributes, player.position, eventDelta, player.potential);
    player = {
      ...player,
      attributes: shifted,
      overall: Math.round(computeOverall(shifted, player.position)),
    };
  }

  // A career-threatening injury lowers the ceiling itself, not just today's
  // overall. Growth always pulls back toward `potential`, so this is the only
  // thing in the game the player never recovers from. Floored just above the
  // starting overall so a save is damaged, never made unplayable.
  if (modifiers.potentialDelta !== 0) {
    player = {
      ...player,
      potential: Math.max(START_OVERALL + 5, player.potential + modifiers.potentialDelta),
    };
  }

  let suspensionCounter = modifiers.suspended ? Math.max(2, periodLength) : state.suspensionSeasonsRemaining;

  // Arriving somewhere new means starting from scratch with those fans. A loan
  // counts too — you have to win over the stand you're actually standing in.
  const changedClub = state.currentTeamId !== null && state.currentTeamId !== playingTeamId;
  let headlines = state.headlines;
  if (changedClub) {
    const previous = state.currentTeamId ? getTeam(state.currentTeamId) : null;
    headlines = addHeadline(
      headlines,
      {
        age: state.player.age,
        key: onLoan ? "joinedOnLoan" : "joinedClub",
        vars: { team: team.name, from: previous?.name ?? "" },
        tone: "neutral",
      },
      `${state.seed}-${state.step}-h-move`,
    );
  }

  // A ceiling that just dropped is the single most consequential thing that
  // can happen to a save, so it gets its own line rather than passing quietly.
  if (modifiers.potentialDelta !== 0 && event.injuryType) {
    headlines = addHeadline(
      headlines,
      {
        age: state.player.age,
        key: "severeInjury",
        vars: { injury: event.injuryType },
        tone: "bad",
      },
      `${state.seed}-${state.step}-h-severe`,
    );
  }

  // Getting a number is a moment in its own right — the first one because it
  // makes the contract real, the later ones because they had to be earned.
  if (shirtNumber !== null && shirtNumber !== state.shirtNumber) {
    headlines = addHeadline(
      headlines,
      {
        age: state.player.age,
        key: state.shirtNumber === null ? "shirtAssigned" : "shirtUpgraded",
        vars: { team: team.name, number: String(shirtNumber) },
        tone: state.shirtNumber === null ? "neutral" : "good",
      },
      `${state.seed}-${state.step}-h-shirt`,
    );
  }

  // What this club signed the player to do. Read off the option the player
  // actually took, so the pitch shown on the card is exactly the one they now
  // have to live up to — and kept on the career, because the crowd keeps
  // measuring against it season after season, not only on arrival.
  const brief = changedClub
    ? (option.brief ?? (playingTeamId ? offerBrief(state, playingTeamId) : null) ?? null)
    : state.clubBrief;

  // What the meter reads the moment this decision resolves, and how high
  // this stand has ever had the player — the second is what separates a crowd
  // that turned on him from one that has yet to notice him.
  const arrival =
    state.currentTeamId === null
      ? { support: FAN_SUPPORT_DEBUT, peak: FAN_SUPPORT_DEBUT }
      : changedClub
        ? arrivalFanSupport(state, playingTeamId, player.overall, brief)
        : (() => {
            const support = applyFanSupport(state.fanSupport, modifiers.fanSupportDelta);
            return { support, peak: Math.max(state.clubFanPeak ?? state.fanSupport, support) };
          })();
  let working: CareerState = {
    ...state,
    rng,
    player,
    upcomingNationalTournaments: tournaments,
    currentTeamId: playingTeamId,
    contractTeamId: nextContractTeamId ?? playingTeamId,
    activeLoan: onLoan ? { loanTeamId: playingTeamId } : null,
    periodIndex: state.periodIndex + 1,
    step: state.step + 1,
    // Goodwill accepted today is measured against you for the rest of the
    // spell: a marquee shirt or a testimonial makes the crowd harder to
    // please, which is what stops those options from being free.
    clubBrief:
      brief && modifiers.briefPatienceDelta
        ? { ...brief, patience: Math.min(2, brief.patience + modifiers.briefPatienceDelta) }
        : brief,
    declinedOffers: declined,
    // A move wipes the slate — but not to the same number every time. What the
    // club wants decides how much goodwill is in the bank on day one. The
    // very first-ever signing is a harder reset than any of those: there is
    // no goodwill to bank because nobody has heard of this player yet. And a
    // club that already knows the player does not start from a stranger's
    // number at all (see `arrivalFanSupport`).
    fanSupport: arrival.support,
    clubFanPeak: arrival.peak,
    clubFanMemory: changedClub
      ? { ...(state.clubFanMemory ?? {}), ...(state.currentTeamId
          ? {
              [state.currentTeamId]: {
                support: state.fanSupport,
                overall: state.player.overall,
                // Kept so a stand that once loved this player still counts as
                // having turned on him if he comes back to a cold reception.
                peak: state.clubFanPeak ?? state.fanSupport,
              },
            }
          : {}) }
      : state.clubFanMemory,
    // Signing directly for a club's real rival is the one move its supporters
    // never forgive, and the club never offers again (see `blockedClubs`).
    //
    // Judged on the club that actually owned the player, and only on a
    // permanent move. Being *sent* out on loan to a rival is the parent club's
    // decision, not a defection — and going back to that parent afterwards is
    // not one either, which is what an earlier version got wrong: it read the
    // loan destination against the club the player was still under contract
    // at, branded the parent a betrayal, and then kept offering it anyway.
    betrayedClubs:
      modifiers.betrayCurrentClub && state.contractTeamId
        ? addBetrayed(state.betrayedClubs, state.contractTeamId)
        : betrayalOnThisMove(state, playingTeamId, onLoan)
          ? addBetrayed(state.betrayedClubs, state.contractTeamId!)
          : state.betrayedClubs,
    headlines,
    shirtNumber,
    legendShirtTributeUsed,
    // Reported for every career-event option, cautious ones included. The
    // guard is on the option carrying a key, because the "leave the club"
    // option some events append is answered by the transfer itself.
    lastOutcome:
      event.eventKey && option.optionKey
        ? { event, optionId: option.id, kind: outcome }
        : null,
  };

  // A chosen training focus biases the growth of the season about to be played.
  if (option.type === "training" && option.optionKey) {
    const focus = findTrainingFocus(state.player.position, option.optionKey);
    working = {
      ...working,
      pendingTrainingShares: focus?.shares,
      lastTrainingFocusPeriod: working.periodIndex,
    };
  }

  if (event.type === "career_event" && event.eventKey && event.scheduledSlotAge !== undefined) {
    working = {
      ...working,
      careerEventPlan: markEventCompleted(
        working.careerEventPlan,
        event.eventKey,
        event.scheduledSlotAge,
        event.age,
      ),
    };
  }

  // A failed giant-tattoo bench-warms only the first season of the period.
  const tattooInfectionOnly =
    event.eventKey === "giant_tattoo" && option.optionKey === "accept" && outcome === "negative";

  // Where the focused attributes stood before the period the focus applies
  // to — the baseline the guarantee below is measured against.
  const trainingShares = working.pendingTrainingShares;
  const beforeTraining = trainingShares ? { ...working.player.attributes } : null;
  for (let i = 0; i < periodLength; i += 1) {
    if (working.player.age >= RETIREMENT_AGE) break;
    const seasonModifiers: Modifiers = {
      ...(tattooInfectionOnly && i > 0 ? { ...modifiers, roleOverride: undefined } : modifiers),
      suspended: suspensionCounter > 0,
    };
    working = simulateOneSeason(working, team, seasonModifiers, onLoan);
    if (seasonModifiers.suspended) suspensionCounter -= 1;
  }

  if (trainingShares && beforeTraining) {
    const trained = enforceTrainingFloor(
      working.player.attributes,
      beforeTraining,
      trainingShares,
      working.player.position,
      working.player.potential,
    );
    working = {
      ...working,
      player: {
        ...working.player,
        attributes: trained,
        overall: Math.round(computeOverall(trained, working.player.position)),
      },
    };
  }

  if (modifiers.deferredOverallDelta !== 0) {
    const restored = shiftOverall(
      working.player.attributes,
      working.player.position,
      modifiers.deferredOverallDelta,
      working.player.potential,
    );
    working = {
      ...working,
      player: {
        ...working.player,
        attributes: restored,
        overall: Math.round(computeOverall(restored, working.player.position)),
      },
    };
  }

  working = { ...working, suspensionSeasonsRemaining: suspensionCounter };

  if (onLoan) {
    working = { ...working, activeLoan: null, completedLoan: { loanTeamId: playingTeamId }, currentTeamId: working.contractTeamId };
  }

  return nextDecision(working);
}

// ---------------------------------------------------------------------------
// Derived views
// ---------------------------------------------------------------------------

export interface CareerTotals extends SeasonStats {
  trophies: number;
  awards: number;
}

export function careerTotals(state: CareerState): CareerTotals {
  return state.seasons.reduce<CareerTotals>(
    (acc, s) => ({
      ...addStats(acc, s.stats),
      trophies: acc.trophies + s.trophies.length,
      awards: acc.awards + s.awards.length,
    }),
    { ...EMPTY_STATS, trophies: 0, awards: 0 },
  );
}

/** Rows shown in the career table: one per period, with locked future rows. */
export interface PeriodRow {
  age: number;
  seasons: SeasonSnapshot[];
  status: "done" | "pending" | "locked";
}

export function periodRows(state: CareerState): PeriodRow[] {
  const step = MODE_CONFIG[state.mode].periodLengthSeasons;
  const rows: PeriodRow[] = [];
  for (let age = START_AGE; age < RETIREMENT_AGE; age += step) {
    const seasons = state.seasons.filter((s) => s.age >= age && s.age < age + step);
    let status: PeriodRow["status"] = "locked";
    if (seasons.length > 0) status = "done";
    else if (state.player.age >= age && state.player.age < age + step && state.phase === "career") status = "pending";
    rows.push({ age, seasons, status });
  }
  return rows;
}

export function allTrophies(
  state: CareerState,
): { key: TrophyKey; age: number; teamId: string; leagueTier: number }[] {
  return state.seasons.flatMap((s) =>
    s.trophies.map((key) => ({ key, age: s.age, teamId: s.teamId, leagueTier: s.leagueTier })),
  );
}

export function allAwards(state: CareerState): { key: AwardKey; age: number }[] {
  return state.seasons.flatMap((s) => s.awards.map((key) => ({ key, age: s.age })));
}

export function peakOverall(state: CareerState): number {
  return state.seasons.reduce((max, s) => Math.max(max, s.overall), state.player.overall);
}

export function peakMarketValue(state: CareerState): number {
  return state.seasons.reduce((max, s) => Math.max(max, s.marketValue), state.player.marketValue);
}

// ---------------------------------------------------------------------------
// Debug-only mutators — never reachable from normal play, wired only to the
// developer debug panel for manual testing. None of these touch `rng` or the
// career-event budget, so using them doesn't corrupt a real playthrough, but
// it does let you jump straight to situations that are rare or slow to reach.
// ---------------------------------------------------------------------------

/** Nudges the player's current OVR by an arbitrary amount, positive or negative. */
export function debugAdjustOverall(state: CareerState, delta: number): CareerState {
  if (state.phase !== "career" || delta === 0) return state;
  const shifted = shiftOverall(state.player.attributes, state.player.position, delta);
  return {
    ...state,
    player: {
      ...state.player,
      attributes: shifted,
      overall: Math.round(computeOverall(shifted, state.player.position)),
    },
  };
}

/** Immediately swaps in a transfer-offer decision, regardless of what's currently showing. */
export function debugForceTransfer(state: CareerState): CareerState {
  if (state.phase !== "career") return state;
  const transfer = createTransferEvent(state);
  if (!transfer) return state;
  return { ...state, rng: transfer.rng, currentEvent: transfer.event };
}

/**
 * Immediately swaps in the given career event, bypassing every eligibility
 * check, cooldown and the personal-event budget — purely so a specific
 * event's copy/effects can be inspected on demand while testing.
 */
export function debugForceEvent(state: CareerState, eventKey: CareerEventKey): CareerState {
  if (state.phase !== "career") return state;
  const teamId = state.contractTeamId ?? state.currentTeamId;
  const team = teamId ? effectiveTeam(state, teamId) : null;

  // Rolled the same way the real scheduler rolls it, so a forced event
  // behaves exactly like one that came up on its own — without this the
  // variant was always undefined and every variant-specific branch was dead.
  const variants = CAREER_EVENT_VARIANTS[eventKey];
  const variantKey = variants
    ? pickWeighted(
        createRng(`${state.seed}:debug-variant:${state.step}:${eventKey}`),
        variants.map((v) => ({ item: v.key, weight: v.weight })),
      ).item
    : undefined;

  const event: DecisionEvent = {
    id: eventId(state, `debug-force-${eventKey}`),
    type: "career_event",
    age: state.player.age,
    eventKey,
    ...(variantKey ? { variantKey } : {}),
    options: CAREER_EVENT_OPTIONS[eventKey].map((o) => ({
      id: `${eventKey}-${o}`,
      type: "career_choice" as const,
      eventKey,
      optionKey: o,
    })),
  };

  const decorated = decorateCareerEvent(state, state.rng, event, team);
  return { ...state, rng: decorated.rng, currentEvent: decorated.event };
}

/** Resolves whatever decision is currently showing by picking its first option. */
export function debugSkipDecision(state: CareerState): CareerState {
  if (state.phase !== "career" || !state.currentEvent) return state;
  const option = state.currentEvent.options[0];
  if (!option) return state;
  return chooseOption(state, option.id);
}

/** Swaps the personality trait outright — changes event odds and growth/decline from the next season on. */
export function debugSetTrait(state: CareerState, trait: PersonalityTrait): CareerState {
  if (state.phase !== "career") return state;
  return { ...state, player: { ...state.player, trait } };
}

/**
 * Swaps the talent tier, re-centring `potential` inside that tier's own range
 * so the two stay consistent (the badge reads the tier, growth tapering reads
 * the number) — a debug-only shortcut for what's normally a one-time roll at
 * the very start of the career.
 */
export function debugSetTalentTier(state: CareerState, tier: TalentTier): CareerState {
  if (state.phase !== "career") return state;
  const range = TALENT_TIERS.find((t) => t.tier === tier)?.range ?? [70, 78];
  const potential = Math.round((range[0] + range[1]) / 2);
  return { ...state, player: { ...state.player, talentTier: tier, potential } };
}

/** Nudges how the current club's terraces feel, positive or negative. */
export function debugAdjustFanSupport(state: CareerState, delta: number): CareerState {
  if (state.phase !== "career") return state;
  return { ...state, fanSupport: applyFanSupport(state.fanSupport, delta) };
}

/** Assigns a rival right now, bypassing the usual OVR threshold — a no-op if one is already set. */
export function debugForceRival(state: CareerState): CareerState {
  if (state.phase !== "career" || state.rival) return state;
  return { ...state, rival: rollRival(state.seed, state.player.nationality.fifa_code, state.player.position) };
}
