import type { CountryCode } from "@craque/world";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";
import { type CoachCareer, type CoachCommand, type CoachMode, coachCommand, createCoachCareer, type WorldData } from "../../src/coach";

/** Ajudantes dos testes do Técnico: criar carreira, mandar comando válido, jogar etapas. */

export const WORLD: WorldData = { players: SQUAD_PLAYERS, free: FREE_PLAYERS };

const created = new Map<string, CoachCareer>();

/** Carreira nova (na fase de propostas). Comandos nunca alteram o estado, então a cópia guardada é segura. */
export function fresh(seed = "teste", mode: CoachMode = "fast", nationality: CountryCode = "BRA"): CoachCareer {
  const key = `${seed}|${mode}|${nationality}`;
  let career = created.get(key);
  if (!career) {
    career = createCoachCareer({ seed, startYear: 2026, mode, identity: { name: "Teste", nationality } }, WORLD);
    created.set(key, career);
  }
  return career;
}

/** Aplica um comando que precisa dar certo. */
export function must(career: CoachCareer, command: CoachCommand): CoachCareer {
  const result = coachCommand(career, command);
  if (result.error) throw new Error(`${command.type}: ${result.error}`);
  return result.career;
}

/** Aplica um comando que precisa ser recusado com o código esperado, sem mudar nada. */
export function refused(career: CoachCareer, command: CoachCommand): string {
  const result = coachCommand(career, command);
  if (!result.error) throw new Error(`${command.type} deveria ser recusado`);
  if (result.career !== career) throw new Error("comando recusado devolveu outro estado");
  return result.error;
}

/** Carreira já num clube, na primeira etapa. */
export function started(seed = "teste", mode: CoachMode = "fast", nationality: CountryCode = "BRA", offer = 0): CoachCareer {
  const career = fresh(seed, mode, nationality);
  const chosen = career.offers[offer];
  if (!chosen) throw new Error("sem proposta");
  return must(career, { type: "acceptOffer", offer: chosen.id });
}

/** Da etapa até os resultados: evento (primeira opção), simulação e eventos de partida. */
export function playStage(career: CoachCareer, matchOption = 0): CoachCareer {
  let current = must(career, { type: "advance" });
  if (current.event && !current.event.chosen) current = must(current, { type: "chooseEvent", option: current.event.options[0]?.id ?? "" });
  current = must(current, { type: "simulate" });
  let guard = 0;
  while (current.phase === "matchEvent" && guard < 5) {
    guard += 1;
    const option = current.event?.options[matchOption] ?? current.event?.options[0];
    current = must(current, { type: "chooseMatchEvent", option: option?.id ?? "" });
  }
  if (current.phase !== "results") throw new Error(`fase inesperada depois de simular: ${current.phase}`);
  return current;
}

/** Joga até a avaliação da temporada. */
export function playSeason(career: CoachCareer): CoachCareer {
  let current = career;
  let guard = 0;
  while (current.phase !== "review" && guard < 4) {
    guard += 1;
    current = playStage(current);
    current = must(current, { type: "continue" });
  }
  return current;
}
