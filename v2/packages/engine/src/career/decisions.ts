import { focusDueAt, focusesFor } from "../evolution/training";
import { stream } from "../rng";
import type { SquadRole } from "../season/role";
import { CHALLENGE_RETIRE_AGE, RETIREMENT_AGE } from "../types";
import { clubIndex } from "../world/model";
import { CLUBS } from "@craque/world";
import { attributesAt } from "../player/player";
import { FOCUS_SLOT } from "../evolution/training";
import { startDrama } from "./drama";
import { careerMarketLevel, eventContext, marketContext } from "./context";
import { promotedNumber } from "./shirt";
import { eventDecision, pickEvent } from "./events";
import { academyOffers, buildOffer, interestedClubs, LOAN, loanOffers, marketOffers } from "./market";
import type { Career, CareerNotice, ClubOffer, Decision, DecisionKind, DecisionOption } from "./types";

/**
 * A próxima decisão (GDD 14.2). A primeira regra que se aplicar vence:
 * idade 40, sem mercado, suspenso, volta de empréstimo, dispensa, evento,
 * foco de treino, empréstimo e, por fim, a janela de transferências.
 */

/** Dispensa (GDD 15.6): a partir de que idade e depois de quantas temporadas sem espaço. */
export const RELEASE = {
  normal: { age: 25, seasons: 2 },
  hard: { age: 23, seasons: 1 },
} as const;

export { FOCUS_RULE } from "../evolution/training";

/** Chance de empréstimo pelo papel (GDD 14.2, regra 8). */
const LOAN_CHANCE: Readonly<Partial<Record<SquadRole, number>>> = {
  reserve: 0.6,
  surplus: 0.6,
  third: 0.6,
  rotation: 0.25,
};

/** "Aposentar agora" aparece a partir desta idade (27 no Desafio do dia). */
function retireFrom(career: Career, base: number): number {
  return career.setup.challengeId ? CHALLENGE_RETIRE_AGE : base;
}

function clubOptions(offers: readonly ClubOffer[]): DecisionOption[] {
  return offers.map((offer) => ({ id: `${offer.back ? "back" : "club"}:${offer.club}`, kind: "club", offer }));
}

/**
 * Ficar no clube. Quem ganhou a posição vestindo um número alto pode ganhar um
 * número clássico: a opção já mostra o número novo (GDD 19.1).
 */
function stayOption(career: Career): DecisionOption {
  const contract = career.contract;
  const last = career.history[career.history.length - 1];
  const shirt = contract
    ? promotedNumber(stream(career.setup.seed, "events", "shirt-promotion", career.age), {
        current: contract.shirt,
        dream: career.setup.identity.dreamNumber,
        lastRole: last && last.club === contract.club ? last.role : null,
        position: career.player.position,
      })
    : null;
  return { id: "stay", kind: "stay", shirt };
}

function decision(
  career: Career,
  kind: DecisionKind,
  options: readonly DecisionOption[],
  extras: Partial<Pick<Decision, "event" | "reason">> = {},
): Decision {
  return {
    id: career.decisionCount + 1,
    kind,
    age: career.age,
    year: career.world.year,
    options,
    event: extras.event ?? null,
    reason: extras.reason ?? null,
  };
}

function withDecision(career: Career, next: Decision): Career {
  return { ...career, decision: next, decisionCount: next.id };
}

function ended(career: Career, reason: NonNullable<Career["end"]>["reason"]): Career {
  return { ...career, decision: null, end: { reason, age: career.age } };
}

function rng(career: Career, label: string) {
  return stream(career.setup.seed, "market", career.decisionCount + 1, label);
}

/** Ninguém aceitaria: nenhum interessado e o clube atual também não o quer mais. */
function noMarket(career: Career): boolean {
  if (career.age < 27) return false;
  const context = marketContext(career, { maxStrength: undefined });
  if (interestedClubs(context).length > 0) return false;
  if (!career.contract) return true;
  const strength = career.world.strength[clubIndex(career.contract.club)] ?? 0;
  const loyalty=Math.max(0,((career.bonds[career.contract.club]?.fans ?? 50)-70)/30)*3;
  // Sem interessados, a última renovação exige um pouco mais de utilidade.
  const renewalRoom = career.age >= 38 ? 2 : 3;
  return strength > careerMarketLevel(career) + renewalRoom + loyalty;
}

export function transferOpportunityDue(career: Career): boolean {
  return Boolean(career.contract) && career.world.year - (career.lastOfferYear ?? career.setup.startYear) >= 3;
}
export function windowDecision(career: Career, reason: Decision["reason"] = null, guaranteed = false): Career {
  const context = marketContext(career);
  let offers = marketOffers(context, 2, rng(career, "window"));
  if (guaranteed && offers.length === 0) {
    const candidates = CLUBS.flatMap((club, index) => club.id !== context.current && !context.excluded.includes(club.id) && (context.world.strength[index] ?? 0) <= (context.maxStrength ?? Infinity) ? [index] : []).sort((a, b) => Math.abs((context.world.strength[a] ?? 0) - context.level) - Math.abs((context.world.strength[b] ?? 0) - context.level));
    if (candidates[0] !== undefined) offers = [buildOffer(context, candidates[0], rng(career, "opportunity"))];
  }
  const options: DecisionOption[] = [];
  if (career.contract) options.push(stayOption(career));
  options.push(...clubOptions(offers));
  if (career.age >= retireFrom(career, 33)) options.push({ id: "retire", kind: "retire" });
  if (options.length === 0) return ended(career, "noOffers");
  return withDecision(offers.length ? { ...career, lastOfferYear: career.world.year } : career, decision(career, "window", options, { reason }));
}

/** Chance de o clube do empréstimo querer comprar o passe, se o dono o quer de volta ou não. */
export const BUYOUT_CHANCE = { retained: 0.4, released: 0.7 } as const;

/**
 * Volta de empréstimo (GDD 15.5 e D42). Cada opção é um clube, com escudo e
 * nome: a volta para o dono (se ele o quer de volta), a compra pelo clube do
 * empréstimo (para continuar onde está) e as ofertas do mercado.
 */
export function returnDecision(career: Career): Career {
  const contract = career.contract;
  const loan = contract?.loan;
  if (!contract || !loan) return windowDecision(career);
  const ovr = marketContext(career).ovr;
  const ownerStrength = career.world.strength[clubIndex(loan.owner)] ?? 0;
  const retained = ovr >= ownerStrength - 4 && career.age <= 23;
  const random = rng(career, "return");
  const buyout = random.chance(retained ? BUYOUT_CHANCE.retained : BUYOUT_CHANCE.released);
  const context = marketContext(career, { current: loan.owner, excluded: [...career.blocked, contract.club, loan.owner] });
  const options: DecisionOption[] = [];
  if (retained && ownerStrength <= (context.maxStrength ?? Infinity)) {
    const back = buildOffer({ ...context, excluded: career.blocked }, clubIndex(loan.owner), random, { back: true });
    options.push(...clubOptions([back]));
  }
  if (buyout && (career.world.strength[clubIndex(contract.club)] ?? 0) <= (context.maxStrength ?? Infinity)) {
    const keep = buildOffer({ ...context, excluded: career.blocked }, clubIndex(contract.club), random, { buyout: true });
    options.push(...clubOptions([keep]));
  }
  const market = marketOffers({ ...context, proving: !retained }, retained ? 2 : buyout ? 2 : 3, random);
  options.push(...clubOptions(market));
  if (career.age >= retireFrom(career, 33)) options.push({ id: "retire", kind: "retire" });
  if (options.length === 0) return ended(career, "noOffers");
  return withDecision(
    { ...career, proving: !retained },
    decision(career, "return", options, { reason: "loanEnded" }),
  );
}

/** Dispensa (GDD 15.6): três clubes, nunca o que dispensou, e aposentar a partir dos 32. */
export function releaseDecision(career: Career): Career {
  const context = marketContext(career, { proving: true });
  const offers = marketOffers(context, 3, rng(career, "release"));
  const options: DecisionOption[] = clubOptions(offers);
  if (career.age >= retireFrom(career, 32)) options.push({ id: "retire", kind: "retire" });
  if (options.length === 0) return ended(career, "noOffers");
  return withDecision({ ...career, proving: true }, decision(career, "release", options, { reason: "released" }));
}

function shouldRelease(career: Career): boolean {
  const contract = career.contract;
  if (!contract || contract.loan) return false;
  const rule = RELEASE[career.setup.difficulty];
  if(career.age < rule.age || contract.benchSeasons < rule.seasons)return false;
  const fans=career.bonds[contract.club]?.fans ?? 50;
  const grace=fans>=95 ? 2 : fans>=80 ? 1 : 0;
  if(grace && contract.benchSeasons < rule.seasons+grace && stream(career.setup.seed,"market","loyaltyRetention",career.age).chance(0.6+(fans-80)*0.015))return false;
  return true;
}

function focusDue(career: Career): boolean {
  return focusDueAt(career.setup.seed, career.age, career.focusAge);
}

function loanDue(career: Career): boolean {
  if (!career.contract || career.contract.loan) return false;
  if (career.age < LOAN.minAge || career.age > LOAN.maxAge || career.loans >= LOAN.maxPerCareer) return false;
  const last = career.history[career.history.length - 1];
  const chance = last && last.club === career.contract.club ? (LOAN_CHANCE[last.role] ?? 0) : 0;
  return stream(career.setup.seed, "market", "loan", career.age).chance(chance);
}

/** A primeira decisão: três bases para começar (GDD 14.4 e D15). */
export function baseDecision(career: Career): Career {
  const offers = academyOffers(marketContext(career), 3, rng(career, "base"));
  if (offers.length === 0) return ended(career, "noOffers");
  return withDecision(career, decision(career, "base", clubOptions(offers)));
}

function buildNextDecision(career: Career): Career {
  if (career.end) return career;
  if (career.age >= RETIREMENT_AGE) return ended(career, "age");
  if (noMarket(career)) {
    return withDecision(career, decision(career, "forced", [{ id: "retire", kind: "retire" }], { reason: "noRoom" }));
  }
  if (career.pending.suspension > 0) return windowDecision(career, "suspended");
  const loan = career.contract?.loan;
  if (loan && career.age >= loan.untilAge) return returnDecision(career);
  if (shouldRelease(career)) return releaseDecision(career);
  if (transferOpportunityDue(career)) return windowDecision(career, null, true);

  // A oferta obrigatória tem prioridade, mas não apaga a vaga de um evento.
  // Vagas vencidas aguardam uma decisão livre e um acontecimento elegível.
  if (career.agenda.filter((age) => age <= career.age).length > career.eventsSeen.length && career.contract) {
    const context = eventContext(career);
    const event = pickEvent(career, context);
    const built = event ? eventDecision(career, event, context, career.decisionCount + 1) : null;
    if (built) return withDecision(career, built);
  }

  if (career.contract && focusDue(career)) {
    const values = attributesAt(career.player, career.age);
    const options: DecisionOption[] = focusesFor(career.player.position).filter((focus) => values[FOCUS_SLOT[focus]] <= 97).map((focus) => ({ id: `focus:${focus}`, kind: "focus", focus }));
    if (options.length) return withDecision(career, decision(career, "focus", options));
  }

  if (loanDue(career)) {
    const offers = loanOffers(marketContext(career), 3, rng(career, "loan"));
    if (offers.length > 0) {
      const options: DecisionOption[] = [...clubOptions(offers), stayOption(career)];
      return withDecision(career, decision(career, "loan", options));
    }
  }

  return windowDecision(career);
}

/** O rompimento vale apenas nesta decisão; foco ou evento também consomem a restrição. */
export function nextDecision(career: Career, notices: CareerNotice[] = []): Career {
  const next = buildNextDecision(career);
  const cleared = career.agentRestriction ? { ...next, agentRestriction: false } : next;
  if (cleared.decision?.kind === "window" && cleared.decision.options.length === 1 && cleared.decision.options[0]?.kind === "stay") {
    const shirt = cleared.decision.options[0].shirt;
    return startDrama({ ...cleared, decision: null, decisionCount: career.decisionCount, contract: cleared.contract && shirt !== null ? { ...cleared.contract, shirt } : cleared.contract }, notices, null, false, undefined, 0);
  }
  const external = cleared.decision?.options.some((option) => option.kind === "club" && option.offer.club !== cleared.contract?.club || option.kind === "event" && option.target?.club && option.target.club.club !== cleared.contract?.club);
  return external ? { ...cleared, lastOfferYear: cleared.world.year } : cleared;
}
