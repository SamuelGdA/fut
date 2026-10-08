import type { AwardKey, Confederation, CountryCode, Division } from "@craque/world";
import type { RecordTally } from "../records/pressure";

/**
 * O estado do mundo entre temporadas e o que uma temporada produz. Tudo é
 * dado simples (números, textos, listas): o estado inteiro vira JSON sem
 * perder nada, e é isso que o snapshot do save guarda (GDD 34.2).
 */

/** Campeão e vice de um torneio. */
export interface Podium {
  readonly winner: string;
  readonly runnerUp: string;
}

/** O que sobra de uma temporada e decide a seguinte (classificação, supercopas). */
export interface SeasonMemory {
  readonly year: number;
  /** Ids dos clubes na ordem final, por liga. */
  readonly tables: Readonly<Record<string, readonly string[]>>;
  /** Copas nacionais e da liga, por competição (`cup:BRA`, `leaguecup:ENG`). */
  readonly cups: Readonly<Record<string, Podium>>;
  /** Torneios continentais, por competição (`cont1:UEFA`). */
  readonly continental: Readonly<Record<string, Podium>>;
  /** Campeões da primária, do mais recente ao mais antigo, para o Mundial de Clubes. */
  readonly primaryChampions: Readonly<Partial<Record<Confederation, readonly string[]>>>;
}

/** Vencedores de cada prêmio, do mais antigo ao mais recente ("player" é o jogador). */
export type AwardHistory = Readonly<Partial<Record<AwardKey, readonly string[]>>>;

export interface WorldState {
  /** A próxima temporada a ser jogada. */
  readonly year: number;
  /** Força atual de cada clube, na ordem de `CLUBS`. */
  readonly strength: readonly number[];
  /** Divisão atual de cada clube, na ordem de `CLUBS`. */
  readonly division: readonly Division[];
  readonly memory: SeasonMemory;
  readonly awards: AwardHistory;
}

/** Até onde um clube ou seleção chegou num torneio eliminatório. */
export const STAGES = ["champion", "final", "semi", "quarter", "roundOf16", "roundOf32", "groups", "early"] as const;
export type Stage = (typeof STAGES)[number];

export interface TableRow {
  readonly club: string;
  readonly position: number;
  readonly points: number;
}

export interface LeagueResult {
  readonly league: string;
  /** `league:<id>`. */
  readonly competition: string;
  readonly country: CountryCode;
  readonly division: Division;
  readonly games: number;
  readonly rows: readonly TableRow[];
}

/**
 * Como a ordem final vira fase alcançada.
 * - `knockout`: mata-mata do começo ao fim (copas nacionais).
 * - `groups`: grupos e mata-mata a partir das oitavas; quem passa de
 *   `groupSlots` caiu antes, nas preliminares.
 * - `groups32`: grupos e mata-mata a partir da fase de 32 (Copa do Mundo).
 */
export interface KnockoutFormat {
  readonly kind: "knockout" | "groups" | "groups32";
  readonly groupSlots: number;
}

/** Um torneio decidido pela ordem das notas: `order[0]` é o campeão. */
export interface KnockoutResult {
  readonly competition: string;
  readonly order: readonly string[];
  readonly format: KnockoutFormat;
}

export interface MatchResult {
  readonly competition: string;
  readonly home: string;
  readonly away: string;
  readonly winner: string;
}

export interface IntercontinentalResult {
  readonly competition: "intercontinental";
  /** Os campeões fora da Europa, na ordem do chaveamento: o primeiro vai à final. */
  readonly bracket: readonly string[];
  readonly final: MatchResult;
}

export interface SeasonResults {
  readonly year: number;
  readonly leagues: Readonly<Record<string, LeagueResult>>;
  readonly cups: Readonly<Record<string, KnockoutResult>>;
  readonly superCups: Readonly<Record<string, MatchResult>>;
  readonly continental: Readonly<Record<string, KnockoutResult>>;
  readonly intercontinental: IntercontinentalResult | null;
  readonly clubWorldCup: KnockoutResult | null;
  /** Copa do Mundo e continentais de seleções do ano, por competição. */
  readonly nations: Readonly<Record<string, KnockoutResult>>;
  readonly promoted: Readonly<Record<CountryCode, readonly string[]>>;
  readonly relegated: Readonly<Record<CountryCode, readonly string[]>>;
}

/**
 * O jogador dentro do mundo: soma força ao clube e à seleção em que joga
 * (GDD 8.2 e 8.12). Sem ele, o mundo roda sozinho.
 */
export interface PlayerImpact {
  readonly club: string;
  readonly ovr: number;
  /** Fração dos jogos do clube que ele disputa. */
  readonly participation: number;
  readonly nationality?: CountryCode;
  /** Fração dos jogos da seleção que ele disputa. */
  readonly nationalParticipation?: number;
  /**
   * Força extra do clube dele por tipo de torneio, vinda de um evento
   * ("prioridade da temporada": liga ou continente).
   */
  readonly boosts?: CompetitionBoosts;
  /**
   * Final decidida por um evento (pênalti decisivo, jogar no sacrifício): só
   * vale se o clube chegar à final da copa ou continental mais importante.
   */
  readonly final?: "win" | "lose";
  /**
   * O que a carreira já ganhou, para a pressão do recorde (D44): perto de um
   * recorde, o título que o clube (ou a seleção) dele ganharia pode ficar com
   * o vice.
   */
  readonly records?: RecordTally;
}

export interface CompetitionBoosts {
  readonly league?: number;
  readonly cup?: number;
  readonly continental?: number;
}

/** Os grupos de torneio que recebem força extra de evento. */
export type BoostGroup = keyof CompetitionBoosts;
