import { getEvent, INJURY_TAG } from "../events/catalog";
import { stream } from "../rng";
import { nextDecision } from "./decisions";
import { applyEffects } from "./effects";
import { appendLog, stepLog } from "./log";
import { moveTo } from "./move";
import { simulatePeriod } from "./period";
import type { Career, CareerNotice, Choice, Decision, DecisionOption, EndReason, SeasonRecord } from "./types";

/**
 * A resolução de uma escolha (GDD 14.3):
 *
 * 1. aposentar encerra a carreira;
 * 2. clubes recusados ficam registrados;
 * 3. o evento é sorteado e aplicado uma vez para o período;
 * 4. ele passa a jogar onde a escolha definiu (camisa, missão, torcida, traição);
 * 5. o foco de treino passa a valer;
 * 6. cada temporada do período é simulada;
 * 7. garantia do foco, efeitos adiados e fim dos modificadores;
 * 8. a próxima decisão é gerada.
 *
 * No fim, o que aconteceu entra no diário da carreira (GDD 21.1).
 */

export type CareerErrorCode = "ended" | "stale" | "unknownOption" | "version" | "replay";

export class CareerError extends Error {
  readonly code: CareerErrorCode;

  constructor(code: CareerErrorCode, message: string) {
    super(message);
    this.name = "CareerError";
    this.code = code;
  }
}

/** Quantos clubes recusados a carreira lembra (para a biografia e o "e se"). */
const REFUSED_MAX = 40;

/** Decisões com clubes: o bônus de mercado do empresário vale só para elas. */
const MARKET_DECISIONS: readonly Decision["kind"][] = ["base", "window", "release", "return"];

export interface Step {
  readonly career: Career;
  /** O que aconteceu, para a revelação. Não é persistido (invariante 23). */
  readonly notices: readonly CareerNotice[];
}

/** A opção escolhida, ou erro se a escolha não serve para a decisão atual (invariante 24). */
function findOption(career: Career, choice: Choice): { decision: Decision; option: DecisionOption } {
  const decision = career.decision;
  if (career.end || !decision) throw new CareerError("ended", "a carreira já terminou");
  if (choice.decision !== decision.id) {
    throw new CareerError("stale", `escolha para a decisão ${choice.decision}, mas a atual é a ${decision.id}`);
  }
  const option = decision.options.find((candidate) => candidate.id === choice.option);
  if (!option) throw new CareerError("unknownOption", `opção desconhecida: ${choice.option}`);
  return { decision, option };
}

function retireReason(decision: Decision): EndReason {
  if (decision.kind === "release") return "release";
  if (decision.kind === "forced") return "noRoom";
  return "voluntary";
}

export function resolveChoice(career: Career, choice: Choice): Step {
  const { decision, option } = findOption(career, choice);
  const notices: CareerNotice[] = [];
  let next: Career = { ...career, choices: [...career.choices, choice], decision: null };

  // 1. Aposentar.
  if (option.kind === "retire") {
    const reason = retireReason(decision);
    notices.push({ kind: "retired", reason });
    const ended: Career = { ...next, end: { reason, age: next.age } };
    return { career: appendLog(ended, stepLog(career, ended, decision, option, notices)), notices };
  }

  // 2. Clubes recusados.
  const refused = decision.options.flatMap((candidate) =>
    candidate.kind === "club" && candidate.id !== option.id
      ? [{ club: candidate.offer.club, strength: candidate.offer.strength }]
      : [],
  );
  if (refused.length > 0) next = { ...next, refused: [...next.refused, ...refused].slice(-REFUSED_MAX) };
  if (MARKET_DECISIONS.includes(decision.kind)) next = { ...next, marketBonus: 0 };

  let event: SeasonRecord["event"] = null;
  let traitorMove = false;

  // 3. Evento.
  if (option.kind === "event" && decision.event) {
    const definition = getEvent(decision.event);
    const source = definition?.options.find((candidate) => candidate.id === option.option);
    if (definition && source) {
      const success =
        option.chance === null ? null : stream(next.setup.seed, "events", "outcome", decision.id).next() < option.chance;
      const effects = success === false ? (source.failure ?? []) : source.success;
      // O resultado vem antes dos efeitos: a notícia do evento, depois o anúncio da transferência.
      notices.push({ kind: "eventOutcome", event: definition.id, option: option.id, success, effects });
      const applied = applyEffects(next, effects, option.target, notices);
      traitorMove = applied.traitor;
      next = {
        ...applied.career,
        eventsSeen: [...applied.career.eventsSeen, definition.id],
        injuryEvents: applied.career.injuryEvents + (definition.tags.includes(INJURY_TAG) ? 1 : 0),
        homageUsed: applied.career.homageUsed || definition.expand === "homageNumbers",
      };
      event = { id: definition.id, option: option.id, success };
    }
  }

  // 4. Clube. A camisa vem na oferta; a compra pelo clube do empréstimo mantém o número.
  if (option.kind === "club") {
    const move = moveTo(next, option.offer, notices, { loan: decision.kind === "loan" });
    next = move.career;
    traitorMove = move.traitor;
  }

  // Ficar: o número novo, se o clube deu outro, já estava na opção (GDD 19.1).
  if (option.kind === "stay" && option.shirt !== null && next.contract) {
    next = { ...next, contract: { ...next.contract, shirt: option.shirt } };
    notices.push({ kind: "shirt", number: option.shirt });
  }

  // 5. Foco de treino.
  if (option.kind === "focus") {
    next = { ...next, focus: option.focus, focusAge: next.age };
    notices.push({ kind: "focus", focus: option.focus });
  }

  // 6 e 7. O período.
  next = simulatePeriod(next, notices, event, traitorMove);

  // 8. A próxima decisão.
  const resolved = nextDecision(next);
  return { career: appendLog(resolved, stepLog(career, resolved, decision, option, notices)), notices };
}
