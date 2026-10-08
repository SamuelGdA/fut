import {
  attributesAt,
  type Career,
  type CareerNotice,
  type ChallengeStatus,
  type Decision,
  type DecisionOption,
  type Effect,
  ovrAt,
  type Six,
  type Step,
  type TrainingFocus,
} from "@craque/engine";

/**
 * O lance (GDD 22 e D43): o que a última escolha produziu, montado dos avisos
 * da jogada e mostrado na própria tela da carreira, sem janela para fechar. O
 * resultado do evento, uma linha por temporada jogada (números, títulos,
 * acesso ou queda, atributos) e, no desafio, o que mudou nas missões. Nada
 * disto vai para o save: recarregar a página mostra a última temporada do
 * histórico, sem o evento (invariante 23).
 */

export type EventOption = Extract<DecisionOption, { kind: "event" }>;

export interface EventPage {
  readonly kind: "event";
  readonly eventId: string;
  readonly decision: Decision;
  readonly option: EventOption;
  readonly success: boolean | null;
  readonly effects: readonly Effect[];
  /** A carreira de antes da escolha: o evento aconteceu no clube de antes. */
  readonly before: Career;
}

export interface TransferMoment {
  readonly from: string | null;
  readonly to: string;
  readonly loan: boolean;
  readonly traitor: boolean;
}

/** Avisos que entram na linha de uma temporada. */
export type SeasonMoment =
  | { readonly kind: "firstCap"; readonly age: number }
  | { readonly kind: "shirt"; readonly number: number }
  | { readonly kind: "focus"; readonly focus: TrainingFocus };

export interface SeasonPage {
  readonly kind: "season";
  /** Posição da temporada no histórico da carreira de depois. */
  readonly index: number;
  /** Atributos e OVR que o jogador via antes desta temporada. */
  readonly previousAttributes: Six;
  readonly previousOvr: number;
  readonly transfer: TransferMoment | null;
  readonly moments: readonly SeasonMoment[];
}

/**
 * O Desafio do dia no lance (GDD 27.6): só entra quando algo marcante
 * aconteceu na jogada. A missão surpresa aparecendo sai com o texto inteiro.
 */
export interface ChallengePage {
  readonly kind: "challenge";
  readonly before: ChallengeStatus;
  readonly after: ChallengeStatus;
  /** A missão surpresa, se apareceu nesta jogada. */
  readonly opened: number | null;
  /** Missões (já à vista) que chegaram ao alvo nesta jogada. */
  readonly completed: readonly number[];
  /** O édito quebrou nesta jogada. */
  readonly broke: boolean;
  /** Temporadas apagadas a mais nesta jogada. */
  readonly erased: number;
  /** O OVR do fim da última temporada jogada (o da apagada, quando houve). */
  readonly lastOvr: number;
}

export type PlayPage = EventPage | SeasonPage | ChallengePage;

/**
 * O resultado da escolha, para a mensagem animada (D45): o que a decisão fez
 * na hora, antes da temporada. Evento: deu certo, deu errado ou feito (e o
 * clube novo, se o evento levou a outro). Janela: assinou, emprestado, de volta
 * ou comprado pelo clube do empréstimo, com a camisa. Ficar: o clube e a
 * camisa nova, se veio. Treino: o foco.
 */
export type PlayOutcome =
  | { readonly kind: "event"; readonly page: EventPage; readonly club: string | null }
  | {
      readonly kind: "move";
      readonly club: string;
      readonly how: "signed" | "loan" | "back" | "buyout";
      readonly league: string | null;
      readonly shirt: number;
    }
  | { readonly kind: "stay"; readonly club: string; readonly shirt: number | null }
  | { readonly kind: "focus"; readonly focus: TrainingFocus };

/** A página do desafio, ou `null` se nada marcante aconteceu. */
export function challengePage(before: ChallengeStatus, after: ChallengeStatus, lastOvr: number): ChallengePage | null {
  const hidden = after.hand.hidden;
  const opened = before.missions[hidden]?.hidden && !after.missions[hidden]?.hidden ? hidden : null;
  const completed = after.missions.flatMap((item, index) =>
    !item.hidden && index !== opened && item.ratio >= 1 && (before.missions[index]?.ratio ?? 0) < 1 ? [index] : [],
  );
  const broke = before.edict.state !== "broken" && after.edict.state === "broken";
  const erased = Math.max(0, after.erased - before.erased);
  if (opened === null && completed.length === 0 && !broke && erased === 0) return null;
  return { kind: "challenge", before, after, opened, completed, broke, erased, lastOvr };
}

export interface PlaySession {
  /** Muda a cada jogada, para as animações recomeçarem do zero. */
  readonly id: number;
  readonly pages: readonly PlayPage[];
  /** Acabou de acontecer (anima e comemora), ou é uma temporada revista do histórico. */
  readonly fresh: boolean;
  /** O resultado da escolha, para a mensagem; nulo numa temporada revista. */
  readonly outcome?: PlayOutcome | null;
}

/** O resultado da escolha, lido da opção e dos avisos da jogada. */
export function playOutcome(before: Career, option: DecisionOption, pages: readonly PlayPage[], transfer: TransferMoment | null): PlayOutcome | null {
  switch (option.kind) {
    case "event": {
      const page = pages.find((item): item is EventPage => item.kind === "event");
      return page ? { kind: "event", page, club: transfer ? transfer.to : null } : null;
    }
    case "club": {
      const { offer } = option;
      const how = offer.back ? "back" : offer.buyout ? "buyout" : offer.loan ? "loan" : "signed";
      return { kind: "move", club: offer.club, how, league: offer.league, shirt: offer.shirt };
    }
    case "stay":
      return before.contract ? { kind: "stay", club: before.contract.club, shirt: option.shirt } : null;
    case "focus":
      return { kind: "focus", focus: option.focus };
    case "retire":
      return null;
  }
}

let nextSessionId = 1;

export function sessionId(): number {
  nextSessionId += 1;
  return nextSessionId;
}

function momentOf(notice: CareerNotice): SeasonMoment | null {
  switch (notice.kind) {
    case "firstCap":
    case "shirt":
    case "focus":
      return notice;
    default:
      return null;
  }
}

/**
 * O lance de uma jogada: o resultado do evento (se houve) e uma página por
 * temporada jogada. Transferência, camisa nova e foco entram na primeira
 * temporada do período; a primeira convocação, na temporada em que aconteceu.
 */
export function buildPlay(
  before: Career,
  decision: Decision,
  option: DecisionOption,
  step: Step,
  challenge?: { readonly before: ChallengeStatus; readonly after: ChallengeStatus },
): PlaySession {
  const after = step.career;
  const pages: PlayPage[] = [];
  let transfer: TransferMoment | null = null;
  let pending: SeasonMoment[] = [];
  let seasonIndex = before.history.length;
  // A primeira transferência da jogada (a do evento ou a da janela), para a mensagem.
  let moved: TransferMoment | null = null;

  for (const notice of step.notices) {
    if (notice.kind === "eventOutcome" && option.kind === "event" && decision.event) {
      pages.push({
        kind: "event",
        eventId: decision.event,
        decision,
        option,
        success: notice.success,
        effects: notice.effects,
        before,
      });
      continue;
    }
    if (notice.kind === "transfer") {
      transfer = { from: notice.from, to: notice.to, loan: notice.loan, traitor: notice.traitor };
      moved ??= transfer;
      continue;
    }
    if (notice.kind === "season") {
      const previous = after.history[seasonIndex - 1];
      const first = seasonIndex === before.history.length;
      pages.push({
        kind: "season",
        index: seasonIndex,
        previousAttributes: first || !previous ? attributesAt(before.player, before.age) : previous.attributes,
        previousOvr: first || !previous ? Math.round(ovrAt(before.player, before.age)) : previous.ovrEnd,
        transfer: first ? transfer : null,
        moments: first ? pending : [],
      });
      pending = [];
      seasonIndex += 1;
      continue;
    }
    const moment = momentOf(notice);
    if (!moment) continue;
    const last = pages[pages.length - 1];
    // Antes da primeira temporada (camisa, foco), o aviso espera a linha dela;
    // depois, entra na temporada em que aconteceu (convocação).
    if (last?.kind === "season") pages[pages.length - 1] = { ...last, moments: [...last.moments, moment] };
    else pending.push(moment);
  }
  // O desafio fecha o lance, depois das temporadas.
  const lastOvr = after.history[after.history.length - 1]?.ovrEnd ?? 0;
  const page = challenge && pages.length > 0 ? challengePage(challenge.before, challenge.after, lastOvr) : null;
  if (page) pages.push(page);
  return { id: sessionId(), pages, fresh: true, outcome: playOutcome(before, option, pages, moved) };
}

/**
 * Uma temporada já jogada, vista de novo (o histórico, ou a tela recarregada):
 * sem evento nem avisos, só os números daquele ano, sem comemoração.
 */
export function seasonPlay(career: Career, index: number, startAttributes: Six, startOvr: number): PlaySession {
  const previous = career.history[index - 1];
  return {
    id: sessionId(),
    fresh: false,
    pages: [
      {
        kind: "season",
        index,
        previousAttributes: previous ? previous.attributes : startAttributes,
        previousOvr: previous ? previous.ovrEnd : startOvr,
        transfer: null,
        moments: [],
      },
    ],
  };
}
