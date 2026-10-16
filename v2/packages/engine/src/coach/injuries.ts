import type { CoachCareer, Injury } from "./types";
import { absDay } from "./util";

/** Recuperação só na troca de turno: ninguém volta no meio do bloco já simulado. */
export function stageInjury(career: CoachCareer, since: number, days: number, kind: Injury["kind"]): Injury {
  const turns = days >= 300 ? 2 : 1;
  // O rápido contém os dois turnos do ano; ambas as durações saem no próximo planejamento.
  const inPlay = since > absDay(career.seasonIndex, career.half === 0 ? 0 : 150);
  const blocked = turns + (inPlay ? 1 : 0);
  const until = career.setup.mode === "fast" ? absDay(career.seasonIndex + 1, 0)
    : career.half === 0 ? (blocked === 1 ? absDay(career.seasonIndex, 150) : absDay(career.seasonIndex + 1, blocked === 2 ? 0 : 150))
    : absDay(career.seasonIndex + 1, blocked === 1 ? 0 : blocked === 2 ? 150 : 365);
  return { kind, since, until, turns };
}
