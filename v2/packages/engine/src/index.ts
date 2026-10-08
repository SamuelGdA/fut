/**
 * O motor do CRAQUE v2.
 *
 * Regras da casa (D4): funções puras, semeadas e imutáveis. Nada aqui importa
 * React, Zustand ou APIs do navegador; nada lê relógio nem `Math.random`. Toda
 * mudança de estado devolve um objeto novo. A mesma semente com as mesmas
 * escolhas produz a mesma carreira, sempre.
 */

export { ENGINE_VERSION } from "./version";

export * from "./types";
export { clamp, fallingLogistic, piecewise, risingLogistic, roundSignificant, softCeiling } from "./math";
export { createRng, RNG_SYSTEMS, stream, type Rng, type RngSystem } from "./rng";

export {
  DECLINE_GRACE,
  LONGEVITY,
  GROUP_OF,
  isDefender,
  isGoalkeeper,
  normalizedMold,
  PEAK_AGE_BASE,
  POSITION_GROUPS,
  POSITIONS,
  positionBonus,
  positionWeights,
  type Position,
  type PositionGroup,
} from "./player/positions";
export {
  ageClasses,
  ageOffset,
  ageProfile,
  ATTRIBUTE_MAX,
  ATTRIBUTE_MIN,
  attributeKeys,
  KEEPER_ATTRIBUTES,
  namedAttributes,
  OUTFIELD_ATTRIBUTES,
  REFERENCE_AGE,
  TRAINING_CAP,
  type AgeClass,
  type AttributeKey,
  type KeeperAttribute,
  type OutfieldAttribute,
} from "./player/attributes";
export { ovrOf, weightedLevel } from "./player/ovr";
export {
  bandAt,
  bandIndex,
  drawInitialCapacity,
  drawPotential,
  drawTalent,
  POTENTIAL_RANGE,
  PRODIGY_CHANCE,
  PRODIGY_GAP,
  TALENT_BANDS,
  TALENT_ODDS,
  type TalentBand,
} from "./player/talent";
export { drawTrait, TRAIT_EFFECTS, TRAITS, type Trait, type TraitEffects } from "./player/traits";
export {
  attributesAt,
  createPlayer,
  drawLongevity,
  overallLevel,
  ovrAt,
  positionShape,
  trainingLevel,
  type Maturity,
  type NewPlayerInput,
  type Player,
} from "./player/player";
export { SCOUT_GATES, SCOUT_LEVELS, scoutLevel, scoutReading, type ScoutLevel, type ScoutReading } from "./player/scout";
export { ageValueFactor, baseMarketValue, marketValue } from "./player/value";

export {
  breakthroughChance,
  KEEPER_ROLES,
  OUTFIELD_ROLES,
  participationOf,
  rollBreakthrough,
  squadRole,
  type RoleResult,
  type SquadRole,
} from "./season/role";

export { drawSeasonForm, explosionChance, type FormKind, type SeasonForm } from "./evolution/form";
export {
  ageDecline,
  ageRate,
  capSeasonGain,
  coachFactor,
  confidenceFactor,
  expectedGrowth,
  gapDrive,
  growthFactors,
  minutesFactor,
  titleMorale,
  type GrowthContext,
  type GrowthFactors,
} from "./evolution/growth";
export {
  FOCUS_RULE,
  FOCUS_SLOT,
  focusDueAt,
  focusesFor,
  guaranteeFocus,
  isFocusValid,
  KEEPER_FOCUSES,
  OUTFIELD_FOCUSES,
  settleTraining,
  trainFocus,
  type TrainingFocus,
} from "./evolution/training";
export {
  evolveSeason,
  type SeasonEvolution,
  type SeasonEvolutionInput,
  type SeasonEvolutionReport,
} from "./evolution/evolve";
export { CAPACITY_RANGE, DECLINE, DIFFICULTY_EFFECTS, FORM, GROWTH, MORALE, TRAINING } from "./evolution/tuning";

export {
  CLUB_POLICIES,
  FOCUS_POLICIES,
  runDevelopment,
  type ClubPolicy,
  type DevelopmentInput,
  type DevelopmentRun,
  type DevelopmentSeason,
  type FocusPolicy,
} from "./sandbox/development";

export * from "./world/types";
export {
  BASE_DIVISION,
  BASE_STRENGTH,
  CLUB_COUNT,
  clubIndex,
  CONFEDERATION_CLUBS,
  COUNTRY_CLUBS,
  countryLeagues,
  NATIONS_BY_CONFEDERATION,
  stageAt,
} from "./world/model";
export {
  confederationOfClub,
  continentalEntrants,
  createWorld,
  currentDivision,
  currentStrength,
  simulateWorldSeason,
  type WorldSeason,
  type WorldSeasonOptions,
} from "./world/season";
export {
  CALENDAR,
  CLUB_DRIFT,
  CLUB_IMPACT,
  GENERIC_CHAMPIONS,
  LEAGUE,
  NATIONAL_IMPACT,
  NOISE,
  QUALIFICATION,
  WORLD_CUP_HOSTS,
  WORLD_CUP_QUOTA,
} from "./world/tuning";

export {
  clubCompetitions,
  gamesForStage,
  nationCompetitions,
  totalGames,
  type CompetitionEntry,
} from "./season/schedule";
export {
  drawProduction,
  isLeagueKind,
  isOffensive,
  NO_PRODUCTION,
  productionRates,
  SCORING,
  splitGames,
  type CompetitionLine,
  type GamesShare,
  type Production,
  type ProductionInput,
  type ProductionRates,
} from "./season/production";
export { drawInjury, INJURY, INJURY_TYPES, injuryChance, type Injury, type InjuryType } from "./season/injury";
export {
  drawNationalGames,
  inTournamentSquad,
  NATIONAL_OPPOSITION,
  NATIONAL_STATUSES,
  nationalAgeFactor,
  nationalParticipation,
  nationalStatus,
  type NationalStatus,
} from "./season/national";
export {
  simulatePlayerSeason,
  type NationalSeason,
  type PlayerSeasonInput,
  type PlayerSeasonResult,
  type PlayerSeasonStats,
} from "./season/playerSeason";

export {
  activeElite,
  eliteAge,
  eliteGroup,
  eliteOvr,
  FUTURE_GENERATION,
  futureGeneration,
  isEliteActive,
  type Contender,
  type EliteCandidate,
} from "./awards/elite";
export {
  BALLON,
  decideAwards,
  GOLDEN_SHOE,
  PLAYER,
  PLAYER_SUCCESS,
  playerSuccess,
  POSITION_ADJUSTMENT,
  streakOf,
  YOUNG_PLAYER,
  type AwardsOutcome,
  type Ballot,
  type Mark,
  type PlayerAwardInput,
} from "./awards/awards";
export {
  BEST_PLAYER,
  BEST_PLAYER_BAR,
  bestPlayerEligible,
  bestPlayerScore,
  CROWNED_KINDS,
  decideCrowns,
  hasCrowns,
  positionOutput,
  scoringCrownChance,
  scoringMark,
  type Crown,
  type CrownAward,
  type CrownEntry,
  type Placing,
  type ScoringMark,
} from "./awards/crowns";
export {
  ballonKeepChance,
  type Counter,
  EMPTY_TALLY,
  goldenShoeKeepChance,
  keepChance,
  leagueTail,
  PRESSURE,
  REAL_MARKS,
  recordTally,
  type RecordTally,
  REFERENCE_MARKS,
  type Tail,
  type TallySeason,
  thinUnits,
  titleKeepChance,
} from "./records/pressure";

export { REGIONS, runCareerSandbox, type CareerSandboxInput, type CareerSandboxRun, type Region } from "./sandbox/career";

export * from "./events/model";
export { EVENT_CATALOG, getEvent, INJURY_TAG, MAX_INJURY_EVENTS } from "./events/catalog";
export { allHold, holds } from "./events/conditions";

export * from "./career/types";
export {
  canRetireNow,
  createCareer,
  choose,
  DEFAULT_START_YEAR,
  parseSave,
  replay,
  retireNow,
  SAVE_VERSION,
  saveOf,
  validateSetup,
} from "./career/career";
export { CareerError, type CareerErrorCode, type Step } from "./career/resolve";
export { appendLog, LOG_MAX, stepLog } from "./career/log";
export { challengeDayId, challengeDayStart, challengeYear, DAY_MS, daysSinceEpoch, isChallengeDayId, nextChallengeAt, shiftChallengeDay } from "./challenge/day";
export { CHALLENGE_AXES, contradicts, getMission, type ChallengeAxis, type Mission, missionFitsPosition, MISSIONS, missionTarget, UNDERDOG_STRENGTH } from "./challenge/missions";
export { MISSION_TARGETS } from "./challenge/targets";
export { BENCH_FROM_AGE, EDICTS, edictState, getEdict, GIANT_STRENGTH, SECOND_DIVISION_FROM_AGE, type Edict, type EdictKind, type EdictState } from "./challenge/edicts";
export { challengeSeed, challengeSetup, dailyHand, HIDDEN_REVEAL_AGE, type ChallengeHand } from "./challenge/hand";
export {
  challengeStatus,
  MISSION_BONUS_MAX,
  MISSION_FULL,
  missionPoints,
  PEAK_BONUS_MAX,
  peakBonus,
  type ChallengeStatus,
  type MissionProgress,
} from "./challenge/score";
export {
  BIG_FIVE,
  bestWorldCupStage,
  clubConfederation,
  clubCountry,
  erasedSeasons,
  finalLegacy,
  nationalTournaments,
  playedTournaments,
  promotions,
  relegations,
  seasonsByClub,
  stintSizes,
  titlesOfKind,
  traitorMoves,
} from "./challenge/measures";
export { autoplay, CAREER_POLICIES, MAX_DECISIONS, policyChoice, type CareerPolicy } from "./career/policy";
export { RELEASE } from "./career/decisions";
export { AGENDA, eligibleEvents, planAgenda } from "./career/events";
export { BENCH_ROLES } from "./career/period";
export {
  careerTotals,
  honours,
  leagueEntry,
  movementOf,
  peakSeason,
  titleKinds,
  type CareerTotals,
  type Honour,
  type Movement,
} from "./career/history";
export {
  bondLegacy,
  careerMarketLevel,
  currentOvr,
  eventContext,
  homeClub,
  marketContext,
  NEIGHBOUR_POSITIONS,
  offerShirt,
  seasonsAtClub,
} from "./career/context";
export { academyOffers, ACADEMY, LOAN, MARKET, marketLevel, type MarketContext, type MarketLevelInput } from "./career/market";
export { BUYOUT_CHANCE } from "./career/decisions";
export { chooseMission, MISSION_TERMS, PRESSURE_MAX, pressureTone, type MissionTerms } from "./career/mission";
export {
  arrivalFans,
  canWearTen,
  FAN_BANDS,
  fanBand,
  fanDelta,
  FIRST_CLUB_FANS,
  legacyLevel,
  legacySeasonPoints,
  seasonPerformance,
  type FanBand,
} from "./career/fans";
export {
  classicNumber,
  clubNumber,
  dreamFits,
  firstContractNumber,
  isFirstTeam,
  newClubNumber,
  ODD_DREAM_CHANCE,
  PRESTIGE_NUMBERS,
  promotedNumber,
  SHIRT_PROMOTION_CHANCE,
  SHIRT_RANGES,
} from "./career/shirt";
