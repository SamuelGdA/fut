/**
 * O motor do Técnico (GDD 56), exportado em `@craque/engine/coach`. Fica fora
 * do índice do motor para o Craque não carregar nada dele.
 */

export * from "./types";
export * from "./tuning";
export { coachCommand, createCoachCareer, cloneCareer, canRetire, type CoachCommand, type CoachStep } from "./career";
export {
  canStartAction,
  concernOf,
  developable,
  fundsChances,
  purchasePreview,
  registeredIds,
  salePreview,
  TALK_EFFECTS,
  wageBill,
  type ConfirmPayload,
  type Preview,
} from "./actions";
export { attractiveness, chanceTier, demandOf, purchaseChance, roleAt, type Attractiveness, type ChanceTier, type InterestBreakdown } from "./market";
export {
  ageOf,
  formLabelOf,
  moodOf,
  output,
  potentialHint,
  sectorOf,
  valueOf,
  wageFor,
  type PotentialHint,
} from "./players";
export { aiFormation, aiPhilosophy, bestEleven, displayStrength, expectedGoals, FORMATION_SLOTS, predictabilityHint, sectorRatings, type SectorRatings, type SideSetup } from "./tactics";
export { leagueRounds, sortTable, COMPETITION_DAYS } from "./competitions";
export { quickMatch, shootout, startLive, playUntil, type QuickSide, type DetailedInput, type LiveMatch } from "./match";
export { benchSize, registered, registrationRule, viableSquad, isAvailable } from "./lineup";
export { financeLabel, initialOfferDivision, leaguePosition, leagueState, objectiveFor, seasonBudget, wageBillOf, titlesOf, cupScore } from "./review";
export { developBonus } from "./evolution";
export { EVENT_IDS, MATCH_EVENT_OPTIONS, eventWeights } from "./events";
export { periodEnd } from "./season";
export { COACH_COUNTRIES, squadOf, createWorldState, type WorldData } from "./world";
export { absDay, stageKey } from "./util";
export { growthStep, type GrowthInput } from "./evolution";
export {
  PHILOSOPHIES,
  affordability,
  aiPhilosophyMix,
  clubDuel,
  clubRatings,
  clubWorldCupOdds,
  confederationOf,
  developCandidates,
  developRange,
  developTrial,
  flatRatings,
  initialDivisionShare,
  matchOdds,
  paceTrial,
  philosophyGrid,
  purchaseCurve,
  type Affordability,
  type ClubDuel,
  type ClubWorldCupOdds,
  type DevelopTrial,
  type MatchOdds,
  type PaceTrial,
  type PhilosophyRow,
  type PurchasePoint,
} from "./probes";
