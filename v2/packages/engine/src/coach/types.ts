import type { CountryCode, Division } from "@craque/world";
import type { SquadOrigin } from "@craque/world/squads";
import type { Position } from "../player/positions";

/**
 * Tipos do Técnico (GDD 56). O estado é dado simples (números, textos,
 * listas, objetos): nada de classes, para a interface ler direto e os testes
 * compararem por valor. O motor nunca guarda texto de tela: devolve ids.
 */

// ---------------------------------------------------------------- básicos

/** Rápido: uma etapa por temporada. Lento: duas metades (spec 5). */
export const COACH_MODES = ["fast", "slow"] as const;
export type CoachMode = (typeof COACH_MODES)[number];

export const SECTORS = ["def", "mid", "att"] as const;
export type Sector = (typeof SECTORS)[number];
export type SectorOrGk = Sector | "gk";

export const PHILOSOPHIES = ["attacking", "defensive", "possession", "counter"] as const;
export type Philosophy = (typeof PHILOSOPHIES)[number];

export const FORMATIONS = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2", "4-1-4-1"] as const;
export type FormationId = (typeof FORMATIONS)[number];

/** Características duradouras (spec 7): as das fontes mais as que se ganham jogando. */
export const COACH_TRAITS = ["fast", "setPiece", "clutch", "aerial", "tireless", "versatile", "leader", "derby", "mentor"] as const;
export type CoachTrait = (typeof COACH_TRAITS)[number];

/** Papel esperado no elenco (spec 7). */
export const ROLES = ["star", "starter", "rotation", "backup", "prospect"] as const;
export type Role = (typeof ROLES)[number];

export type Mood = "happy" | "neutral" | "unhappy";
export type FormLabel = "awful" | "poor" | "normal" | "good" | "great";
export type Demand = "low" | "medium" | "high";
export type PlayerOrigin = SquadOrigin | "y";

export const ACTION_KINDS = ["sell", "buy", "train", "develop", "youth", "locker", "funds"] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

/** Dia absoluto: temporada × 365 + dia da temporada. Toda data do motor é assim. */
export type AbsDay = number;

// ----------------------------------------------------------------- jogador

export interface Injury {
  readonly kind: "light" | "medium" | "serious";
  /** Dia absoluto em que volta a estar disponível. */
  readonly until: AbsDay;
  readonly since: AbsDay;
}

/** Números de uma temporada, só para o clube do treinador e quem passou por ele. */
export interface SeasonStats {
  apps: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  ratingSum: number;
  rated: number;
  /** Jogos do clube em que o jogador estava disponível (para promessas e satisfação). */
  available: number;
  benchUnused: number;
  derbyGoals: number;
  bigGames: number;
  bigGoals: number;
  setPieceGoals: number;
}

export interface CoachPlayer {
  readonly id: string;
  /** Vazio para gerados: a interface dá o nome pelo id e pela nacionalidade. */
  readonly name: string;
  readonly nationality: CountryCode;
  readonly position: Position;
  readonly alternates: readonly Position[];
  readonly birthYear: number;
  readonly origin: PlayerOrigin;
  /** Nível oculto contínuo; o OVR mostrado é o arredondamento. */
  level: number;
  ovr: number;
  /** Teto interno, nunca mostrado (spec 6.5). */
  readonly potential: number;
  /** Anos a mais ou a menos antes do declínio, fixo por jogador. */
  readonly longevity: number;
  /** Fase de −2 a +2 (temporária). */
  form: number;
  recentRatings: number[];
  traits: CoachTrait[];
  club: string;
  joinedYear: number;
  /** Salário mensal em euros. */
  wage: number;
  /** Satisfação oculta (0–100); só pesa no clube do treinador. */
  satisfaction: number;
  role: Role;
  acceptsBench: boolean;
  injury: Injury | null;
  /** Clube que o revelou pela base (ação Base ou jovens da IA). */
  youthClub: string | null;
  /** Etapa em que recebeu Desenvolver; vale na próxima atualização. */
  developedAt: string | null;
  /** Jogador posto à venda numa conversa: mais procura, menos queda de satisfação. */
  listed: boolean;
  /** Etapa em que já foi oferecido (venda) para não repetir. */
  offeredAt: string | null;
  consecutiveStarts: number;
  season: SeasonStats;
}

// ------------------------------------------------------------------- clube

export interface CoachClub {
  readonly id: string;
  readonly country: CountryCode;
  division: Division;
  /** Âncora de força (deriva como no Craque) para jovens e mercado da IA. */
  anchor: number;
  readonly baseAnchor: number;
  /** Força derivada do elenco (média ponderada do melhor time), atualizada por rodada. */
  strength: number;
  /** Receita anual de referência. */
  revenue: number;
  cash: number;
  readonly prestige: number;
}

// ----------------------------------------------------------- competições

export type CompetitionKind =
  | "league"
  | "cup"
  | "leaguecup"
  | "super"
  | "cont1"
  | "cont2"
  | "cont3"
  | "contsuper"
  | "intercontinental"
  | "clubworldcup";

export type RoundKind = "league" | "group" | "prelim" | "knockout";

export interface Fixture {
  readonly id: string;
  readonly competition: string;
  readonly kind: CompetitionKind;
  /** Rótulo da rodada ou fase: número da rodada ("12"), "group:3", "R16", "QF", "SF", "F", "P1". */
  readonly round: string;
  readonly roundKind: RoundKind;
  readonly day: number;
  readonly home: string;
  readonly away: string;
  /** Jogo de volta: id da ida, para o agregado. */
  readonly firstLeg: string | null;
  /** Último jogo do confronto (decide prorrogação e pênaltis). */
  readonly decisive: boolean;
  readonly neutral: boolean;
  result: MatchResult | null;
}

export interface GoalEvent {
  readonly minute: number;
  readonly side: "home" | "away";
  readonly scorer: string | null;
  readonly assist: string | null;
  readonly setPiece: boolean;
}

export interface MatchResult {
  readonly home: number;
  readonly away: number;
  /** Prorrogação e pênaltis só em jogo decisivo empatado. */
  readonly extraTime: boolean;
  readonly penalties: readonly [number, number] | null;
  readonly winner: string | null;
  /** Só nos jogos do clube do treinador. */
  readonly goals: readonly GoalEvent[];
  readonly injuries: readonly { readonly player: string; readonly minute: number; readonly days: number }[];
  readonly coach: CoachMatchLog | null;
}

/** O que o treinador viu da partida: quem jogou, notas e o evento decisivo. */
export interface CoachMatchLog {
  readonly side: "home" | "away";
  readonly lineup: readonly string[];
  readonly used: readonly { readonly player: string; readonly from: number; readonly to: number; readonly rating: number }[];
  readonly philosophy: Philosophy;
  readonly opponentPhilosophy: Philosophy;
  readonly formation: FormationId;
  readonly eventOption: string | null;
  readonly shortHanded: boolean;
}

export interface TableRow {
  club: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface GroupState {
  readonly name: string;
  readonly clubs: readonly string[];
  readonly rows: TableRow[];
}

export interface CompetitionState {
  readonly id: string;
  readonly kind: CompetitionKind;
  readonly country: CountryCode | null;
  readonly entrants: readonly string[];
  /** Liga ou fase de grupos. */
  readonly table: TableRow[] | null;
  readonly groups: GroupState[] | null;
  /** Fases de mata-mata ainda por sortear: dias das partidas e se é ida e volta. */
  readonly knockoutPlan: readonly KnockoutRound[];
  /** Quem segue vivo no mata-mata (antes de cada sorteio). */
  alive: string[];
  /** Fase alcançada por clube ("champion", "F", "SF", "QF", "R16", "R32", "group", "prelim"...). */
  reached: Record<string, string>;
  champion: string | null;
  runnerUp: string | null;
  done: boolean;
}

export interface KnockoutRound {
  readonly label: string;
  readonly roundKind: RoundKind;
  readonly days: readonly number[];
  /** Fixado quando a fase anterior acaba. */
  drawn: boolean;
}

// -------------------------------------------------------------- tática

export interface Tactics {
  formation: FormationId;
  philosophy: Philosophy;
  /** Titulares por vaga da formação (11). */
  lineup: string[];
  bench: string[];
}

export interface Predictability {
  value: number;
  /** O que os rivais leem mais nesta temporada. */
  readFocus: "formation" | "philosophy";
  lastFormation: FormationId;
  lastPhilosophy: Philosophy;
  lastLineup: string[];
}

// -------------------------------------------------------------- objetivos

export type ObjectiveKind = "title" | "top" | "mid" | "survive" | "promotion" | "bottom";

export interface Objective {
  readonly kind: ObjectiveKind;
  /** Posição que cumpre o objetivo. */
  readonly target: number;
  /** Posição esperada pela força e prestígio. */
  readonly expected: number;
  readonly tableSize: number;
}

// ------------------------------------------------------------- promessas

export type PromiseKind = "starts" | "minutes" | "keep" | "youth";

export interface CoachPromise {
  readonly id: string;
  readonly kind: PromiseKind;
  readonly player: string | null;
  /** Fim do prazo: dia absoluto (fim da etapa ou da temporada). */
  readonly until: AbsDay;
  readonly madeAt: AbsDay;
  readonly target: number;
  readonly origin: "talk" | "event";
  /** Números do jogador (ou dos jovens) no momento da promessa: a cobrança conta daí em diante. */
  readonly baseline: { readonly starts: number; readonly available: number; readonly apps: number };
  status: "active" | "kept" | "broken";
}

// --------------------------------------------------------------- ações

export interface ActionRecord {
  readonly number: number;
  readonly kind: ActionKind;
}

export interface SaleOffer {
  readonly id: string;
  readonly player: string;
  readonly buyer: string | null;
  readonly price: number;
  status: "pending" | "accepted" | "declined" | "none";
}

export interface PurchaseResponse {
  readonly id: string;
  readonly player: string;
  readonly from: string;
  readonly outcome: "available" | "clubRefused" | "playerRefused";
  readonly price: number;
  readonly wage: number;
  status: "pending" | "accepted" | "declined" | "blocked" | "unavailable";
}

export type TalkConcern = "minutes" | "wantsOut" | "promise" | "form" | "role" | "content" | "homesick";

export interface TalkResult {
  readonly id: string;
  readonly player: string;
  readonly concern: TalkConcern;
  /** Melhora imediata só por conversar (pode ser 0). */
  readonly immediate: number;
  readonly options: readonly string[];
  chosen: string | null;
  outcome: "good" | "bad" | null;
}

export interface FundsResponse {
  readonly outcome: "large" | "small" | "refused";
  readonly amount: number;
  /** Condição pedida antes de liberar (objetivo mais alto). */
  readonly condition: ObjectiveKind | null;
  status: "pending" | "accepted" | "declined" | "none";
}

export interface YouthCandidate {
  readonly id: string;
  readonly position: Position;
  readonly birthYear: number;
  readonly nationality: CountryCode;
  readonly description: "raw" | "steady" | "promising" | "special";
  readonly trait: CoachTrait | null;
  readonly fee: number;
  readonly wage: number;
  /** Escondidos até a promoção. */
  readonly hiddenOvr: number;
  readonly hiddenPotential: number;
  promoted: boolean;
}

export type ActionFlow =
  | { readonly kind: "sell"; readonly number: number; step: "select" | "responses"; offers: SaleOffer[] }
  | { readonly kind: "buy"; readonly number: number; step: "select" | "responses"; responses: PurchaseResponse[] }
  | { readonly kind: "train"; readonly number: number; step: "select" }
  | { readonly kind: "develop"; readonly number: number; step: "select" }
  | { readonly kind: "youth"; readonly number: number; step: "select" }
  | {
      readonly kind: "locker";
      readonly number: number;
      step: "select" | "responses";
      mode: "talk" | "meeting" | null;
      talks: TalkResult[];
      meeting: { choice: "support" | "demand" | null; outcome: "good" | "bad" | null } | null;
    }
  | { readonly kind: "funds"; readonly number: number; step: "responses"; response: FundsResponse };

// ------------------------------------------------------------- eventos

export type EventKind = "crisis" | "opportunity" | "request" | "club" | "match";

export interface EventOption {
  readonly id: string;
  /** Chance de dar certo; null = sem risco. */
  readonly chance: number | null;
  readonly success: readonly EventEffect[];
  readonly failure: readonly EventEffect[];
}

export type EventEffect =
  | { readonly type: "satisfaction"; readonly target: "subject" | "squad" | "starters" | "bench" | "youth"; readonly amount: number }
  | { readonly type: "form"; readonly target: "subject" | "squad" | "starters"; readonly amount: number }
  | { readonly type: "board"; readonly amount: number }
  | { readonly type: "fans"; readonly amount: number }
  | { readonly type: "cash"; readonly amount: number }
  | { readonly type: "budget"; readonly amount: number }
  | { readonly type: "reputation"; readonly amount: number }
  | { readonly type: "training"; readonly sector: Sector; readonly amount: number }
  | { readonly type: "promise"; readonly kind: PromiseKind; readonly target: number }
  | { readonly type: "injury"; readonly days: number }
  | { readonly type: "sell"; readonly price: number; readonly buyer: string }
  | { readonly type: "listed" }
  | { readonly type: "trait"; readonly trait: CoachTrait }
  | { readonly type: "match"; readonly forMult: number; readonly againstMult: number };

export interface MatchContext {
  readonly fixture: string;
  readonly competition: string;
  readonly round: string;
  readonly roundKind: RoundKind;
  readonly opponent: string;
  readonly home: boolean;
  readonly minute: number;
  readonly score: readonly [number, number];
  readonly aggregate: readonly [number, number] | null;
  readonly derby: boolean;
  readonly final: boolean;
  readonly situation: "losing" | "drawing" | "winning" | "injury";
}

export interface CoachEvent {
  readonly id: string;
  readonly kind: EventKind;
  readonly subject: string | null;
  /** Valores para o texto (nome do clube interessado, preço, rival...). */
  readonly params: Readonly<Record<string, string | number>>;
  readonly options: readonly EventOption[];
  readonly match: MatchContext | null;
  chosen: string | null;
  outcome: "success" | "failure" | null;
}

// ----------------------------------------------------------- relatórios

export interface RelationChange {
  readonly bar: "board" | "fans" | "squad" | "reputation";
  readonly delta: number;
  readonly reason: string;
}

export interface PlayerChange {
  readonly player: string;
  readonly from: number;
  readonly to: number;
  readonly developed: boolean;
}

export interface PeriodReport {
  readonly year: number;
  readonly half: 0 | 1;
  readonly final: boolean;
  readonly partial: boolean;
  readonly club: string;
  readonly league: string;
  readonly position: number | null;
  readonly tableSize: number;
  readonly objective: Objective;
  readonly record: { readonly won: number; readonly drawn: number; readonly lost: number; readonly goalsFor: number; readonly goalsAgainst: number };
  readonly competitions: readonly { readonly competition: string; readonly reached: string; readonly champion: boolean }[];
  readonly highlights: readonly string[];
  readonly revelations: readonly string[];
  readonly disappointments: readonly string[];
  readonly ovrChanges: readonly PlayerChange[];
  readonly injuries: readonly { readonly player: string; readonly days: number; readonly kind: Injury["kind"] }[];
  readonly relations: readonly RelationChange[];
  readonly finance: { readonly revenue: number; readonly wages: number; readonly transfers: number; readonly prizes: number; readonly cash: number; readonly budget: number };
  readonly moments: readonly Moment[];
  readonly predictabilityHint: boolean;
  readonly promises: readonly { readonly id: string; readonly status: CoachPromise["status"] }[];
  readonly newTraits: readonly { readonly player: string; readonly trait: CoachTrait }[];
}

export type Moment =
  | { readonly kind: "derbyWin" | "derbyLoss"; readonly fixture: string; readonly score: readonly [number, number]; readonly opponent: string }
  | { readonly kind: "bigWin" | "bigLoss"; readonly fixture: string; readonly score: readonly [number, number]; readonly opponent: string }
  | { readonly kind: "title"; readonly competition: string }
  | { readonly kind: "eliminated"; readonly competition: string; readonly round: string }
  | { readonly kind: "promotion" | "relegation" }
  | { readonly kind: "hatTrick"; readonly player: string; readonly fixture: string }
  | { readonly kind: "matchEvent"; readonly event: string; readonly outcome: "success" | "failure"; readonly fixture: string }
  | { readonly kind: "debut"; readonly player: string }
  | { readonly kind: "signing"; readonly player: string; readonly fee: number }
  | { readonly kind: "sale"; readonly player: string; readonly fee: number; readonly buyer: string };

// --------------------------------------------------------------- histórico

export interface SeasonHistory {
  readonly year: number;
  readonly club: string;
  readonly league: string;
  readonly division: Division;
  readonly position: number | null;
  readonly tableSize: number;
  readonly objective: Objective;
  readonly objectiveMet: boolean | null;
  readonly titles: readonly string[];
  readonly promoted: boolean;
  readonly relegated: boolean;
  readonly dismissed: boolean;
  readonly partial: boolean;
  readonly rescue: boolean;
  readonly confidence: number;
  readonly reputationAfter: number;
  readonly topScorer: { readonly player: string; readonly goals: number } | null;
  readonly bestPlayer: { readonly player: string; readonly ovr: number } | null;
}

export interface PlayerLegacy {
  readonly player: string;
  readonly name: string;
  readonly nationality: CountryCode;
  readonly position: Position;
  apps: number;
  goals: number;
  seasons: number;
  bestOvr: number;
  /** Revelado pelo treinador (base ou estreia antes dos 21). */
  revealed: boolean;
  signed: boolean;
  firstOvr: number;
}

// ------------------------------------------------------------- propostas

export interface ClubOffer {
  readonly id: string;
  readonly club: string;
  readonly division: Division;
  readonly strength: number;
  readonly objective: Objective;
  readonly budget: number;
  readonly cash: number;
  readonly wageBill: number;
  readonly revenue: number;
  /** Dificuldade estimada: 1 tranquila a 5 muito difícil. */
  readonly difficulty: number;
  readonly finances: "healthy" | "balanced" | "tight";
  readonly fictionalShare: number;
  /** Oferta de continuidade do clube atual. */
  readonly stay: boolean;
}

// ------------------------------------------------------------- carreira

export interface CoachIdentity {
  readonly name: string;
  readonly nationality: CountryCode;
}

export interface CoachSetup {
  readonly seed: string;
  readonly startYear: number;
  readonly mode: CoachMode;
  readonly identity: CoachIdentity;
}

export type CoachPhase =
  | "offers"
  | "stage"
  | "event"
  | "matchEvent"
  | "results"
  | "review"
  | "ended";

export interface CoachClubState {
  readonly club: string;
  tactics: Tactics;
  predictability: Predictability;
  /** Treino por setor na etapa atual (quantas vezes). */
  training: Record<Sector, number>;
  /** Treino que vale no período sendo simulado. */
  activeTraining: Record<Sector, number>;
  board: number;
  fans: number;
  budget: number;
  fundsGranted: number;
  fundsRequests: number;
  objective: Objective;
  /** Objetivo elevado por condição de verba. */
  raisedObjective: boolean;
  credit: number;
  seasonsAtClub: number;
  arrivedYear: number;
}

export interface CoachCareer {
  readonly setup: CoachSetup;
  readonly version: string;
  year: number;
  /** 0 primeira metade (ou temporada inteira no rápido), 1 segunda metade. */
  half: 0 | 1;
  phase: CoachPhase;
  seasonIndex: number;
  /** Dia absoluto até onde a simulação já foi. */
  day: AbsDay;
  players: Record<string, CoachPlayer>;
  clubs: Record<string, CoachClub>;
  competitions: Record<string, CompetitionState>;
  fixtures: Fixture[];
  /** Memória da temporada anterior para classificação (formato do Craque). */
  memory: PreviousSeason;
  coach: CoachClubState | null;
  reputation: number;
  actionsUsed: number;
  actions: ActionRecord[];
  flow: ActionFlow | null;
  youth: YouthCandidate[];
  event: CoachEvent | null;
  /** Evento de partida armado para esta etapa (gatilho avaliado na simulação). */
  matchEventArmed: boolean;
  pendingMatch: PendingMatch | null;
  promises: CoachPromise[];
  offers: ClubOffer[];
  review: SeasonReview | null;
  lastReport: PeriodReport | null;
  history: SeasonHistory[];
  legacy: Record<string, PlayerLegacy>;
  moments: Moment[];
  /** Clubes que dispensaram o treinador: temporada até quando não oferecem. */
  bans: Record<string, number>;
  stageReports: PeriodReport[];
  /** Diário de mudanças para o relatório do período. */
  ledger: PeriodLedger;
  ended: { readonly reason: "retired" | "completed"; readonly partial: boolean } | null;
  dismissedThisSeason: boolean;
  /** Acesso e queda da temporada que acabou, aplicados na virada. */
  movement: { readonly promoted: readonly string[]; readonly relegated: readonly string[] } | null;
}

export interface PreviousSeason {
  readonly year: number;
  readonly tables: Readonly<Record<string, readonly string[]>>;
  readonly cups: Readonly<Record<string, { readonly winner: string; readonly runnerUp: string }>>;
  readonly continental: Readonly<Record<string, { readonly winner: string; readonly runnerUp: string }>>;
  readonly primaryChampions: Readonly<Record<string, readonly string[]>>;
}

export interface PeriodLedger {
  startOvr: Record<string, number>;
  relations: RelationChange[];
  transfersIn: number;
  transfersOut: number;
  revenue: number;
  wages: number;
  prizes: number;
  injuries: { player: string; days: number; kind: Injury["kind"] }[];
  moments: Moment[];
  newTraits: { player: string; trait: CoachTrait }[];
}

export interface SeasonReview {
  readonly score: number;
  readonly confidence: number;
  readonly creditBefore: number;
  readonly creditAfter: number;
  readonly dismissed: boolean;
  /** Termo que mais pesou na avaliação, para a explicação. */
  readonly reason: "objective" | "cups" | "finances" | "promises" | "fans" | "history";
  readonly tolerance: "trusted" | "warned" | "patience" | "none";
  readonly reputationBefore: number;
  readonly reputationAfter: number;
  readonly objectiveMet: boolean;
  readonly position: number | null;
}

export interface PendingMatch {
  readonly fixture: string;
  readonly minute: number;
  readonly state: unknown;
}
