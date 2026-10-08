import { EVENT_CATALOG, INJURY_TAG, MAX_INJURY_EVENTS } from "../events/catalog";
import { allHold } from "../events/conditions";
import type { Effect, EventContext, EventDefinition, EventOption } from "../events/model";
import { clamp } from "../math";
import { TRAIT_EFFECTS } from "../player/traits";
import { type Rng, stream } from "../rng";
import { type Pace, SEASONS_PER_PERIOD } from "../types";
import { clubIndex } from "../world/model";
import { grandfatherCountry, residenceCountry, homeClub, legacyClub, marketContext } from "./context";
import { buildOffer, interestedClubs, marketOffers, offerFrom } from "./market";
import type { Career, ClubOffer, Decision, DecisionOption, EventTarget } from "./types";

/**
 * Agenda e montagem dos eventos (GDD 18.1). A agenda sorteia quantos eventos a
 * carreira terá e em que idades; na idade marcada, entra um evento elegível
 * sorteado pelo peso. Se nenhum couber, a vaga passa.
 */

export const AGENDA = {
  intense: { min: 7, max: 8, spacing: 2 },
  normal: { min: 4, max: 5, spacing: 3 },
  firstAge: 17,
  lastAge: 37,
} as const;

/** Idades em que a carreira tem decisão, para o evento cair numa delas. */
function decisionAges(pace: Pace): number[] {
  const step = SEASONS_PER_PERIOD[pace];
  const ages: number[] = [];
  for (let age = 16; age <= 39; age += step) ages.push(age);
  return ages;
}

export function planAgenda(seed: string, pace: Pace): number[] {
  const rng = stream(seed, "events", "agenda");
  const rules = AGENDA[pace];
  const count = rng.int(rules.min, rules.max);
  const candidates = rng.shuffle(decisionAges(pace).filter((age) => age >= AGENDA.firstAge && age <= AGENDA.lastAge));
  const chosen: number[] = [];
  for (const age of candidates) {
    if (chosen.length >= count) break;
    if (chosen.every((other) => Math.abs(other - age) >= rules.spacing)) chosen.push(age);
  }
  return chosen.sort((a, b) => a - b);
}

/** Os eventos que podem aparecer agora: elegíveis, inéditos e dentro do limite de lesões. */
export function eligibleEvents(career: Career, context: EventContext): EventDefinition[] {
  return EVENT_CATALOG.filter((event) => {
    if (career.eventsSeen.includes(event.id)) return false;
    if (event.tags.includes(INJURY_TAG) && career.injuryEvents >= MAX_INJURY_EVENTS) return false;
    return allHold(event.when, context);
  });
}

export function pickEvent(career: Career, context: EventContext): EventDefinition | null {
  const eligible = eligibleEvents(career, context);
  if (eligible.length === 0) return null;
  return stream(career.setup.seed, "events", "pick", career.age).weighted(eligible.map((event) => [event, event.weight] as const));
}

/** Chance de uma opção arriscada, com o traço (GDD 18.2), limitada de 5% a 95%. */
export function optionChance(career: Career, option: EventOption): number | null {
  if (option.kind !== "risky") return null;
  if (option.fixedChance) return clamp(option.chance ?? 0.5, 0.05, 0.95);
  return clamp((option.chance ?? 0.5) * TRAIT_EFFECTS[career.player.trait].risk, 0.05, 0.95);
}

function allEffects(option: EventOption): readonly Effect[] {
  return [...option.success, ...(option.failure ?? [])];
}

/** Um clube maior que o atual, para o ultimato do empresário. */
function biggerClub(career: Career, rng: Rng): ClubOffer | null {
  const context = marketContext(career);
  const current = career.contract ? (career.world.strength[clubIndex(career.contract.club)] ?? 0) : 0;
  const pool = interestedClubs(context, 7, 6).filter((index) => (career.world.strength[index] ?? 0) >= current + 2);
  if (pool.length === 0) return null;
  return buildOffer(context, rng.pick(pool), rng);
}

/**
 * Resolve o alvo de uma opção: o clube de destino, a posição nova, o país do
 * passaporte ou o número da camisa. Devolve `undefined` quando a opção precisa
 * de um alvo que não existe agora (aí ela sai da decisão).
 */
function resolveTarget(
  career: Career,
  context: EventContext,
  option: EventOption,
  number: number | null,
  rng: Rng,
): EventTarget | null | undefined {
  let target: EventTarget | null = null;
  for (const effect of allEffects(option)) {
    if (effect.kind === "transfer") {
      const market = marketContext(career);
      let club: ClubOffer | null = null;
      if (effect.to === "offer") club = marketOffers(market, 1, rng)[0] ?? null;
      if (effect.to === "bigger") club = biggerClub(career, rng);
      if (effect.to === "rivalClub" && context.rivalClub) club = offerFrom(market, context.rivalClub, rng);
      if (effect.to === "home") {
        const home = homeClub(career);
        club = home ? offerFrom(market, home, rng) : null;
      }
      if (effect.to === "legacy") {
        const legacy = legacyClub(career);
        club = legacy ? offerFrom(market, legacy, rng) : null;
      }
      if (!club || club.strength > (market.maxStrength ?? Infinity)) return undefined;
      target = { ...(target ?? {}), club };
    }
    if (effect.kind === "position") {
      if (!context.neighbourPosition) return undefined;
      target = { ...(target ?? {}), position: context.neighbourPosition };
    }
    if (effect.kind === "nationality") {
      const country = effect.residence ? residenceCountry(career) : grandfatherCountry(career);
      if (!country) return undefined;
      target = { ...(target ?? {}), country };
    }
    if (effect.kind === "shirt") {
      const value = effect.number === "ten" ? 10 : number;
      if (value === null) return undefined;
      target = { ...(target ?? {}), number: value };
    }
  }
  return target;
}

/** As opções do evento, com as geradas pelo contexto (números de camisa) na frente. */
function expandOptions(event: EventDefinition, context: EventContext): Array<{ option: EventOption; id: string; number: number | null }> {
  const numbers =
    event.expand === "prestigeNumbers" ? context.prestigeNumbers : event.expand === "homageNumbers" ? context.homageNumbers : [];
  const result: Array<{ option: EventOption; id: string; number: number | null }> = [];
  for (const option of event.options) {
    if (event.expand && option.id === "number") {
      for (const number of numbers) result.push({ option, id: `number:${number}`, number });
    } else {
      result.push({ option, id: option.id, number: null });
    }
  }
  return result;
}

export function eventDecision(career: Career, event: EventDefinition, context: EventContext, id: number): Decision | null {
  const rng = stream(career.setup.seed, "events", "options", event.id, career.age);
  const options: DecisionOption[] = [];
  for (const entry of expandOptions(event, context)) {
    const target = resolveTarget(career, context, entry.option, entry.number, rng);
    if (target === undefined) continue;
    options.push({
      id: entry.id,
      kind: "event",
      option: entry.option.id,
      optionKind: entry.option.kind,
      chance: optionChance(career, entry.option),
      preview: { success: entry.option.success, failure: entry.option.failure ?? [] },
      target,
    });
  }
  // Um evento com uma escolha só não é escolha: a vaga passa.
  if (options.length < 2) return null;
  return {
    id,
    kind: "event",
    age: career.age,
    year: career.world.year,
    options,
    event: event.id,
    reason: null,
  };
}
