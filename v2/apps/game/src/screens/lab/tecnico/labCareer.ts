import { type CoachCareer, type CoachCommand, coachCommand, createCoachCareer, developable, type WorldData } from "@craque/engine/coach";
import type { CountryCode } from "@craque/world";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";

/**
 * O que as seções do laboratório do Técnico dividem: o mundo com os elencos,
 * uma carreira de referência por semente e a política automática que joga
 * temporadas inteiras (a mesma ideia do harness, em pedaços para a tela não
 * travar).
 */

export const LAB_WORLD: WorldData = { players: SQUAD_PLAYERS, free: FREE_PLAYERS };

const cache = new Map<string, CoachCareer>();

/** Carreira nova (fase de propostas), guardada por semente e nacionalidade. */
export function labCareer(seed: string, nationality: CountryCode = "BRA"): CoachCareer {
  const key = `${seed}|${nationality}`;
  let career = cache.get(key);
  if (!career) {
    career = createCoachCareer({ seed, startYear: 2026, mode: "fast", identity: { name: "Lab", nationality } }, LAB_WORLD);
    cache.set(key, career);
  }
  return career;
}

/** A mesma carreira já no clube da primeira proposta, na primeira etapa. */
export function labStarted(seed: string, nationality: CountryCode = "BRA"): CoachCareer {
  const key = `${seed}|${nationality}|started`;
  let career = cache.get(key);
  if (!career) {
    const fresh = labCareer(seed, nationality);
    const offer = fresh.offers[0];
    career = offer ? coachCommand(fresh, { type: "acceptOffer", offer: offer.id }).career : fresh;
    cache.set(key, career);
  }
  return career;
}

export type LabPolicy = "balanced" | "passive";

function step(career: CoachCareer, command: CoachCommand): CoachCareer {
  const result = coachCommand(career, command);
  return result.error ? career : result.career;
}

/** Joga uma etapa inteira (ações da política, evento, simulação, resultados). */
function playStage(career: CoachCareer, policy: LabPolicy): CoachCareer {
  let current = career;
  if (policy === "balanced") {
    current = step(current, { type: "openAction", kind: "train" });
    current = step(current, { type: "confirmAction", payload: { kind: "train", sector: "mid" } });
    const young = developable(current)
      .filter((player) => current.year - player.birthYear <= 23)
      .slice(0, 3)
      .map((player) => player.id);
    if (young.length > 0) {
      current = step(current, { type: "openAction", kind: "develop" });
      current = step(current, { type: "confirmAction", payload: { kind: "develop", players: young } });
    }
  }
  current = step(current, { type: "advance" });
  if (current.event && !current.event.chosen) current = step(current, { type: "chooseEvent", option: current.event.options[0]?.id ?? "" });
  current = step(current, { type: "simulate" });
  let guard = 0;
  while (current.phase === "matchEvent" && guard < 5) {
    guard += 1;
    current = step(current, { type: "chooseMatchEvent", option: current.event?.options[1]?.id ?? current.event?.options[0]?.id ?? "" });
  }
  return step(current, { type: "continue" });
}

/** Uma temporada inteira até a avaliação; depois decide (fica ou assina a primeira proposta). */
export function playSeason(career: CoachCareer, policy: LabPolicy, last: boolean): CoachCareer {
  let current = career;
  let guard = 0;
  while (current.phase !== "review" && current.phase !== "ended" && guard < 4) {
    guard += 1;
    current = playStage(current, policy);
  }
  if (current.phase !== "review" || last) return current;
  const stay = current.offers.find((offer) => offer.stay);
  const choice = stay ? "stay" : current.offers[0] ? { offer: current.offers[0].id } : "retire";
  return step(current, { type: "decide", choice });
}

/** Deixa a tela respirar entre um pedaço de cálculo e outro. */
export const breathe = () => new Promise<void>((resolve) => window.setTimeout(resolve, 0));
