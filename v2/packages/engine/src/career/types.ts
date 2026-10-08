import type { CountryCode, Division } from "@craque/world";
import type { TrainingFocus } from "../evolution/training";
import type { Effect } from "../events/model";
import type { Player } from "../player/player";
import type { Position } from "../player/positions";
import type { PlayerSeasonStats, SeasonModifiers } from "../season/playerSeason";
import type { SquadRole } from "../season/role";
import type { Difficulty, Pace } from "../types";
import type { WorldState } from "../world/types";

/**
 * A carreira inteira como dado (GDD 14). Tudo é serializável: o save guarda
 * só o setup e as escolhas (GDD 34.2), e a carreira é refeita por replay.
 */

export interface Identity {
  readonly surname: string;
  readonly foot: "right" | "left";
  readonly nationality: CountryCode;
  readonly position: Position;
  /** Número dos sonhos, de 1 a 99, ou nenhum. */
  readonly dreamNumber: number | null;
}

export interface CareerSetup {
  readonly seed: string;
  readonly startYear: number;
  readonly pace: Pace;
  readonly difficulty: Difficulty;
  readonly identity: Identity;
  /** Desafio do dia (M7): muda só a idade em que aposentar aparece. */
  readonly challengeId?: string;
}

// ------------------------------------------------------------------- missão

export const MISSIONS = [
  "academyBet",
  "reinforcement",
  "projectPiece",
  "marqueeSigning",
  "heir",
  "rescue",
  "rebuild",
  "homecoming",
  "experience",
  "proveYourself",
] as const;
export type MissionKey = (typeof MISSIONS)[number];

export interface Contract {
  readonly club: string;
  readonly mission: MissionKey;
  /** Multiplica as quedas de torcida (GDD 16). */
  readonly pressure: number;
  /** Descontada do ganho de torcida toda temporada. */
  readonly demand: number;
  readonly shirt: number;
  /** Ano da primeira temporada no clube nesta passagem. */
  readonly since: number;
  /** Força do clube na chegada, para a crise financeira. */
  readonly strengthAtArrival: number;
  /** Temporadas seguidas sem espaço (reserva ou menos), para a dispensa. */
  readonly benchSeasons: number;
  /** Empréstimo: o clube dono e a idade em que o empréstimo acaba. */
  readonly loan: { readonly owner: string; readonly ownerShirt: number; readonly untilAge: number } | null;
}

/** O que cada clube lembra do jogador (GDD 17). */
export interface ClubBond {
  readonly fans: number;
  readonly peakFans: number;
  readonly seasons: number;
  readonly legacyPoints: number;
  /** OVR quando saiu da última vez, para a volta. */
  readonly ovrWhenLeft: number | null;
  readonly traitor: boolean;
}

export type LegacyLevel = "none" | "respected" | "idol" | "legend";

// --------------------------------------------------------------- decisões

export type DecisionKind = "base" | "window" | "loan" | "return" | "release" | "forced" | "event" | "focus";

export interface ClubOffer {
  readonly club: string;
  /** Força atual do clube. */
  readonly strength: number;
  readonly division: Division;
  readonly league: string | null;
  /** Papel esperado pela regra do GDD 11.2. */
  readonly role: SquadRole;
  /** Nível do clube em estrelas, de 1 a 5. */
  readonly stars: number;
  /** Torneios continentais da próxima temporada. */
  readonly competitions: readonly string[];
  readonly mission: MissionKey;
  readonly pressure: number;
  readonly fansStart: number;
  readonly loan: boolean;
  /** Compra pelo clube do empréstimo: ele fica onde estava emprestado. */
  readonly buyout: boolean;
  /** Fim de empréstimo: a volta para o clube dono do passe. */
  readonly back: boolean;
  /** O número que o clube dá a ele (GDD 19): a camisa só muda na transferência. */
  readonly shirt: number;
}

export interface EventOptionPreview {
  /** Efeitos se der certo (ou da escolha, se não houver sorte). */
  readonly success: readonly Effect[];
  readonly failure: readonly Effect[];
}

export type DecisionOption =
  | { readonly id: string; readonly kind: "club"; readonly offer: ClubOffer }
  /** Ficar no clube. `shirt` é o número novo, se o clube der outro (GDD 19.1); `null` mantém o atual. */
  | { readonly id: string; readonly kind: "stay"; readonly shirt: number | null }
  | { readonly id: string; readonly kind: "retire" }
  | { readonly id: string; readonly kind: "focus"; readonly focus: TrainingFocus }
  | {
      readonly id: string;
      readonly kind: "event";
      readonly option: string;
      readonly optionKind: "risky" | "safe" | "change" | "choice";
      /** Chance de sucesso já com o traço, ou `null` sem sorte. */
      readonly chance: number | null;
      readonly preview: EventOptionPreview;
      /** Clube de destino, número, posição ou país envolvidos na opção. */
      readonly target: EventTarget | null;
    };

export interface EventTarget {
  readonly club?: ClubOffer;
  readonly number?: number;
  readonly position?: Position;
  readonly country?: CountryCode;
}

export interface Decision {
  /** Sequencial na carreira: uma escolha para outra decisão é recusada. */
  readonly id: number;
  readonly kind: DecisionKind;
  readonly age: number;
  readonly year: number;
  readonly options: readonly DecisionOption[];
  /** Evento por trás da decisão. */
  readonly event: string | null;
  /** Por que esta decisão apareceu, quando importa para o texto. */
  readonly reason: "noRoom" | "released" | "loanEnded" | "suspended" | null;
}

export interface Choice {
  readonly decision: number;
  readonly option: string;
}

// ------------------------------------------------------------------- notícias

/**
 * O que aconteceu numa jogada, para a revelação e os avisos (GDD 22). Não é
 * persistido: é consumido uma vez e some, por isso recarregar a página não
 * repete nada (invariante 23).
 */
export type CareerNotice =
  | { readonly kind: "eventOutcome"; readonly event: string; readonly option: string; readonly success: boolean | null; readonly effects: readonly Effect[] }
  | { readonly kind: "transfer"; readonly from: string | null; readonly to: string; readonly loan: boolean; readonly traitor: boolean }
  | { readonly kind: "season"; readonly year: number }
  | { readonly kind: "firstCap"; readonly age: number }
  | { readonly kind: "focus"; readonly focus: TrainingFocus }
  /** Ficou no clube e trocou de número: o clube deu um clássico a quem ganhou a posição (GDD 19.1). */
  | { readonly kind: "shirt"; readonly number: number }
  | { readonly kind: "retired"; readonly reason: EndReason };

// -------------------------------------------------------------------- diário

/**
 * O diário da carreira (GDD 21.1): o que aconteceu fora da tabela de cada
 * temporada, guardado no estado com idade e ano. Diferente dos avisos, faz
 * parte da carreira: o replay o refaz igual, e a biografia, a linha do tempo e
 * o jornal leem daqui. Os números de cada temporada ficam no histórico.
 */
interface LogMoment {
  readonly age: number;
  readonly year: number;
}

export type CareerLogEntry = LogMoment &
  (
    | { readonly kind: "transfer"; readonly from: string | null; readonly to: string; readonly loan: boolean; readonly traitor: boolean }
    /** A maior oferta recusada numa decisão, e o que ele escolheu no lugar. */
    | {
        readonly kind: "refused";
        readonly club: string;
        readonly strength: number;
        readonly chosen: string | null;
        readonly chosenStrength: number | null;
      }
    | { readonly kind: "event"; readonly event: string; readonly option: string; readonly success: boolean | null }
    | { readonly kind: "shirt"; readonly number: number }
    | { readonly kind: "focus"; readonly focus: TrainingFocus }
    /** O clube o dispensou (GDD 15.6). */
    | { readonly kind: "released"; readonly club: string }
    | { readonly kind: "firstCap" }
    | { readonly kind: "retired"; readonly reason: EndReason }
  );

export type CareerLogKind = CareerLogEntry["kind"];

// ------------------------------------------------------------------ registro

/** Uma temporada jogada, com o estado do fim dela (invariante 8). */
export interface SeasonRecord extends PlayerSeasonStats {
  readonly shirt: number;
  readonly mission: MissionKey;
  readonly pressure: number;
  readonly fans: number;
  readonly loan: boolean;
  readonly legacy: LegacyLevel;
  readonly traitor: boolean;
  readonly nationality: CountryCode;
  readonly position: Position;
  /** Evento resolvido no começo do período, se houve. */
  readonly event: { readonly id: string; readonly option: string; readonly success: boolean | null } | null;
  readonly marketValue: number;
}

export type EndReason = "age" | "noRoom" | "noOffers" | "release" | "voluntary";

/** Efeitos guardados para o período que vai começar e para depois dele. */
export interface PendingEffects {
  readonly modifiers: SeasonModifiers;
  /** Capacidade aplicada quando o período acabar. */
  readonly laterCapacity: number;
  /** Temporadas suspensas ainda por cumprir (0,5 vira jogos pela metade). */
  readonly suspension: number;
}

export interface Career {
  readonly setup: CareerSetup;
  readonly world: WorldState;
  readonly player: Player;
  readonly nationality: CountryCode;
  /** Idade da próxima temporada a ser jogada. */
  readonly age: number;
  readonly contract: Contract | null;
  readonly bonds: Readonly<Record<string, ClubBond>>;
  /** Clubes que nunca mais oferecem nada (GDD 15.7). */
  readonly blocked: readonly string[];
  /** Clubes recusados, com a força do momento (no máximo 40). */
  readonly refused: ReadonlyArray<{ readonly club: string; readonly strength: number }>;
  readonly focus: TrainingFocus | null;
  readonly focusAge: number | null;
  readonly loans: number;
  /** Idades com evento agendado (GDD 18.1). */
  readonly agenda: readonly number[];
  readonly eventsSeen: readonly string[];
  readonly injuryEvents: number;
  readonly pending: PendingEffects;
  /** Nível de mercado extra na próxima janela (troca de empresário). */
  readonly marketBonus: number;
  /** Restrição consumida ao gerar a próxima decisão, mesmo se ela não tiver transferências. */
  readonly agentRestriction?: boolean;
  /** Veio de dispensa ou de empréstimo não retido: a próxima missão é "mostrar serviço". */
  readonly proving: boolean;
  readonly firstCapAge: number | null;
  readonly homageUsed: boolean;
  readonly history: readonly SeasonRecord[];
  /** O diário (GDD 21.1), no máximo `LOG_MAX` entradas. */
  readonly log: readonly CareerLogEntry[];
  readonly decision: Decision | null;
  readonly decisionCount: number;
  readonly end: { readonly reason: EndReason; readonly age: number } | null;
  readonly choices: readonly Choice[];
  /** Encerrada pelo botão "Encerrar carreira", fora de uma decisão (GDD 5). */
  readonly quit: boolean;
}

/** O save (GDD 34.2): setup e escolhas. A carreira sai do replay. */
export interface CareerSave {
  readonly v: 1;
  readonly engine: string;
  readonly setup: CareerSetup;
  readonly choices: readonly Choice[];
  /** A carreira foi encerrada pelo botão, depois da última escolha. */
  readonly quit?: true;
}
