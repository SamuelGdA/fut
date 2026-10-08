import { stream } from "../rng";
import { chooseFocus } from "../sandbox/development";
import type { SquadRole } from "../season/role";
import { choose } from "./career";
import { currentOvr } from "./context";
import type { Step } from "./resolve";
import type { Career, Choice, ClubOffer, Decision, DecisionOption } from "./types";

/**
 * Jogadores automáticos, para o harness, os testes e o modo `--auto` do
 * terminal. Não fazem parte do jogo: são jeitos simples e diferentes de
 * escolher, para medir a carreira por vários caminhos.
 *
 * - `balanced`: quer jogar e crescer, troca quando o passo vale a pena;
 * - `ambitious`: sempre o clube mais forte que ainda lhe dá minutos;
 * - `loyal`: fica enquanto joga, foge do risco;
 * - `random`: qualquer opção.
 */

export const CAREER_POLICIES = ["balanced", "ambitious", "loyal", "random"] as const;
export type CareerPolicy = (typeof CAREER_POLICIES)[number];

const ROLE_VALUE: Readonly<Record<SquadRole, number>> = {
  star: 3,
  starter: 2.6,
  rotation: 1.4,
  reserve: 0.4,
  surplus: 0,
  third: 0,
};

/** Quanto pesa a força do clube contra o papel, por política. */
const WEIGHTS: Readonly<Record<Exclude<CareerPolicy, "random">, { strength: number; role: number; stay: number }>> = {
  balanced: { strength: 0.12, role: 1.2, stay: 0.4 },
  ambitious: { strength: 0.22, role: 0.7, stay: 0 },
  loyal: { strength: 0.08, role: 1.2, stay: 1.6 },
};

/** Idade em que cada política aceita aposentar quando a opção aparece. */
const RETIRE_AGE: Readonly<Record<Exclude<CareerPolicy, "random">, number>> = { balanced: 35, ambitious: 36, loyal: 37 };

function offerScore(offer: ClubOffer, policy: Exclude<CareerPolicy, "random">): number {
  const weights = WEIGHTS[policy];
  return weights.strength * offer.strength + weights.role * ROLE_VALUE[offer.role];
}

/** O "ficar" medido como uma oferta: a força atual e o papel da última temporada. */
function stayScore(career: Career, policy: Exclude<CareerPolicy, "random">): number {
  const contract = career.contract;
  if (!contract) return Number.NEGATIVE_INFINITY;
  const last = career.history[career.history.length - 1];
  const role = last && last.club === contract.club ? last.role : "rotation";
  const strength = last?.clubStrength ?? contract.strengthAtArrival;
  const weights = WEIGHTS[policy];
  return weights.strength * strength + weights.role * ROLE_VALUE[role] + weights.stay;
}

function wantsToRetire(career: Career, policy: Exclude<CareerPolicy, "random">): boolean {
  const last = career.history[career.history.length - 1];
  const benched = last ? ROLE_VALUE[last.role] < 1 : false;
  return career.age >= RETIRE_AGE[policy] || (career.age >= 33 && benched && currentOvr(career) < 72);
}

function eventScore(option: Extract<DecisionOption, { kind: "event" }>, policy: Exclude<CareerPolicy, "random">): number {
  const risky = option.chance ?? 1;
  const moves = option.preview.success.some((effect) => effect.kind === "transfer") ? 1 : 0;
  if (policy === "loyal") return (option.optionKind === "safe" ? 2 : 0) - moves - (option.chance === null ? 0 : 1 - risky);
  if (policy === "ambitious") return (option.optionKind === "risky" ? 2 * risky : 1) + moves * 0.5;
  return option.optionKind === "risky" ? 2 * risky : option.optionKind === "safe" ? 1.1 : 0.9 - moves * 0.3;
}

function bestBy<T>(items: readonly T[], score: (item: T) => number): T | undefined {
  let best: T | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const item of items) {
    const value = score(item);
    if (value > bestScore) {
      best = item;
      bestScore = value;
    }
  }
  return best;
}

function pickOption(career: Career, decision: Decision, policy: CareerPolicy): DecisionOption {
  const options = decision.options;
  const rng = stream(career.setup.seed, "policy", policy, decision.id);
  const fallback = options[0];
  if (!fallback) throw new Error("política: decisão sem opções");
  if (policy === "random") return rng.pick(options);

  const retire = options.find((option) => option.kind === "retire");
  if (retire && (options.length === 1 || wantsToRetire(career, policy))) return retire;

  if (decision.kind === "focus") {
    const focus = chooseFocus("best", career.player, () => rng.next());
    return options.find((option) => option.kind === "focus" && option.focus === focus) ?? fallback;
  }
  if (decision.kind === "event") {
    const events = options.filter((option): option is Extract<DecisionOption, { kind: "event" }> => option.kind === "event");
    return bestBy(events, (option) => eventScore(option, policy) + rng.next() * 0.2) ?? fallback;
  }
  if (decision.kind === "loan") {
    const last = career.history[career.history.length - 1];
    const benched = last ? ROLE_VALUE[last.role] < 1 : false;
    const stay = options.find((option) => option.kind === "stay");
    if (!benched || policy === "loyal") return stay ?? fallback;
  }

  const candidates = options.filter((option) => option.kind === "club" || option.kind === "stay");
  return (
    bestBy(candidates, (option) =>
      (option.kind === "club" ? offerScore(option.offer, policy) : stayScore(career, policy)) + rng.next() * 0.3,
    ) ?? fallback
  );
}

/** A escolha da política para a decisão atual, ou `null` se a carreira acabou. */
export function policyChoice(career: Career, policy: CareerPolicy): Choice | null {
  const decision = career.decision;
  if (career.end || !decision) return null;
  return { decision: decision.id, option: pickOption(career, decision, policy).id };
}

/** Mais decisões do que isto numa carreira é defeito: 24 temporadas, eventos e focos cabem com folga. */
export const MAX_DECISIONS = 80;

/** Joga a carreira inteira pela política. `onStep` vê cada passo, para o terminal e os testes. */
export function autoplay(start: Career, policy: CareerPolicy, onStep?: (step: Step, choice: Choice) => void): Career {
  let career = start;
  for (let count = 0; count < MAX_DECISIONS; count += 1) {
    const choice = policyChoice(career, policy);
    if (!choice) return career;
    const step = choose(career, choice);
    onStep?.(step, choice);
    career = step.career;
  }
  throw new Error(`política ${policy}: a carreira passou de ${MAX_DECISIONS} decisões`);
}
