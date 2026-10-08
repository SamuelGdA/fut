import type { Position } from "../player/positions";
import type { Trait } from "../player/traits";
import type { SquadRole } from "../season/role";

/**
 * O modelo declarativo dos eventos de carreira (GDD 18.2).
 *
 * Um evento é **dado**: condições para aparecer, opções e os efeitos de cada
 * resultado. Nenhuma função mora aqui. O motor interpreta as condições
 * (`conditions.ts`) e aplica os efeitos (`career/effects.ts`), na ordem em
 * que aparecem; os textos ficam no pacote de conteúdo (`@craque/content`),
 * pelo id do evento e da opção. Assim um evento novo é uma entrada no
 * catálogo e um bloco de texto, sem mexer em lógica nenhuma.
 */

// ------------------------------------------------------------------ condições

/** Uma condição para o evento aparecer. Todas as condições da lista valem juntas. */
export type Condition =
  /** Idade da temporada que vai começar. */
  | { readonly kind: "age"; readonly min?: number; readonly max?: number }
  /** Jogos na última temporada. */
  | { readonly kind: "lastGames"; readonly min: number }
  /** Papel no elenco na última temporada. */
  | { readonly kind: "role"; readonly in: readonly SquadRole[] }
  /** Temporadas seguidas no clube atual. */
  | { readonly kind: "seasonsAtClub"; readonly min: number }
  /** O clube vai disputar torneio continental na próxima temporada. */
  | { readonly kind: "continental" }
  /** O clube vai disputar uma copa ou continental, onde pode haver final. */
  | { readonly kind: "knockout" }
  /** O rival histórico do clube, com força igual ou maior, quer o jogador. */
  | { readonly kind: "rivalClubInterested" }
  /** O rival histórico do clube joga a mesma liga. */
  | { readonly kind: "derby" }
  /** A força do clube caiu desde a chegada. */
  | { readonly kind: "clubDecline"; readonly min: number }
  /** A camisa 10 está livre e o jogador é meia ou atacante titular. */
  | { readonly kind: "tenFree" }
  /** Temporadas seguidas jogando fora do país de nascimento. */
  | { readonly kind: "abroad"; readonly min: number }
  /** Valor de mercado, em euros. */
  | { readonly kind: "value"; readonly min: number }
  /** A seleção é fraca para ele, ou ele ainda não estreou. */
  | { readonly kind: "nationWeakOrUncapped" }
  /** Já foi Ídolo ou Lenda num clube onde não está. */
  | { readonly kind: "legacyElsewhere" }
  /** Ano de torneio de seleção e ele está no elenco. */
  | { readonly kind: "tournamentSquad" }
  /** Torcida do clube atual. */
  | { readonly kind: "fans"; readonly min?: number; readonly max?: number }
  /** OVR atual. */
  | { readonly kind: "ovr"; readonly min: number }
  /** Traço do jogador. */
  | { readonly kind: "trait"; readonly in: readonly Trait[] }
  /** Existe uma posição vizinha que faz sentido. */
  | { readonly kind: "neighbourPosition" }
  /** Há número de prestígio da posição livre no clube. */
  | { readonly kind: "prestigeNumberFree" }
  /** Legado Ídolo ou Lenda no clube atual, homenagem ainda não usada. */
  | { readonly kind: "homage" }
  /** Pelo menos uma das condições. */
  | { readonly kind: "any"; readonly of: readonly Condition[] };

// -------------------------------------------------------------------- efeitos

/** Quando um efeito de capacidade vale. */
export type Timing = "now" | "period" | "later";

/** Para onde um evento leva o jogador. Cada um é resolvido quando o evento aparece. */
export type TransferTarget =
  /** Uma oferta de mercado comum. */
  | "offer"
  /** Um clube maior que o atual (ultimato do empresário). */
  | "bigger"
  /** O rival histórico do clube atual. */
  | "rivalClub"
  /** Um clube do país de nascimento. */
  | "home"
  /** O clube onde ele já foi Ídolo ou Lenda. */
  | "legacy";

export type Effect =
  /** Capacidade: agora, só durante o período, ou depois dele. */
  | { readonly kind: "capacity"; readonly amount: number; readonly when: Timing }
  /** Potencial, para baixo, nunca abaixo do piso. */
  | { readonly kind: "potential"; readonly amount: number; readonly floor: number }
  /** Bônus permanente nos atributos do foco atual (ou do melhor foco). */
  | { readonly kind: "attributes"; readonly amount: number }
  | { readonly kind: "fans"; readonly amount: number }
  | { readonly kind: "pressure"; readonly amount: number }
  | { readonly kind: "role"; readonly change: "up" | "down" | "fixStarter" }
  | { readonly kind: "games"; readonly scale: number }
  | { readonly kind: "injury"; readonly scale: number }
  | { readonly kind: "production"; readonly scale: number }
  | { readonly kind: "growth"; readonly scale: number }
  /** Força extra do clube num tipo de torneio durante o período. */
  | { readonly kind: "boost"; readonly target: "league" | "cup" | "continental"; readonly amount: number }
  /** Final decidida, se o clube chegar a uma. */
  | { readonly kind: "final"; readonly result: "win" | "lose" }
  | { readonly kind: "national"; readonly mode: "skip" | "force" }
  /** Temporadas suspensas a partir de agora. Meia temporada vira jogos pela metade. */
  | { readonly kind: "suspension"; readonly seasons: number }
  | { readonly kind: "transfer"; readonly to: TransferTarget }
  | { readonly kind: "position" }
  | { readonly kind: "nationality" }
  /** Camisa: a 10, ou o número escolhido na opção. */
  | { readonly kind: "shirt"; readonly number: "ten" | "chosen" }
  /** O clube atual nunca mais oferece nada (torcida expulsou, briga com a diretoria). */
  | { readonly kind: "block" }
  /** Nível de mercado na próxima janela. */
  | { readonly kind: "market"; readonly amount: number }
  /** Força do clube atual, de uma vez. */
  | { readonly kind: "clubStrength"; readonly amount: number }
  /** Nota extra nas eleições de prêmios durante o período. */
  | { readonly kind: "award"; readonly amount: number }
  /** Um fato para a biografia, sem efeito em jogo. */
  | { readonly kind: "story"; readonly tag: string };

// --------------------------------------------------------------------- opções

/**
 * - `risky`: sorteia sucesso ou fracasso, com a chance mostrada na tela.
 * - `safe`: o caminho conservador; pode não ter efeito nenhum.
 * - `change`: muda de clube, de posição ou de país.
 * - `choice`: uma escolha entre caminhos sem sorte envolvida.
 */
export type OptionKind = "risky" | "safe" | "change" | "choice";

export interface EventOption {
  readonly id: string;
  readonly kind: OptionKind;
  /** Chance de sucesso, antes do traço. Só em `risky`. */
  readonly chance?: number;
  readonly success: readonly Effect[];
  readonly failure?: readonly Effect[];
}

/** Opções que dependem do jogador: números de camisa livres, por exemplo. */
export type OptionExpansion = "prestigeNumbers" | "homageNumbers";

export interface EventDefinition {
  readonly id: string;
  /** Peso no sorteio entre os elegíveis. */
  readonly weight: number;
  readonly tags: readonly string[];
  readonly when: readonly Condition[];
  readonly options: readonly EventOption[];
  /** Gera opções a partir do contexto; elas vêm antes das opções fixas. */
  readonly expand?: OptionExpansion;
}

/** Tudo que as condições e os efeitos leem do momento da carreira. */
export interface EventContext {
  readonly age: number;
  readonly ovr: number;
  readonly position: Position;
  readonly trait: Trait;
  readonly lastRole: SquadRole | null;
  readonly lastGames: number;
  readonly seasonsAtClub: number;
  readonly clubDecline: number;
  readonly continental: boolean;
  readonly knockout: boolean;
  readonly rivalClub: string | null;
  readonly rivalClubInterested: boolean;
  readonly derby: boolean;
  readonly tenFree: boolean;
  readonly abroadSeasons: number;
  readonly value: number;
  readonly nationWeakOrUncapped: boolean;
  readonly legacyClub: string | null;
  readonly tournamentSquad: boolean;
  readonly fans: number;
  readonly neighbourPosition: Position | null;
  readonly prestigeNumbers: readonly number[];
  readonly homageNumbers: readonly number[];
}
