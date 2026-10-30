import { coachAchievementsMet } from "@craque/content/coach";
import type { CoachCareer } from "@craque/engine/coach";
import { careerKey } from "./careerKey";
import type { TecnicoCareerPayload } from "./schemas";

/**
 * O que uma carreira de técnico terminada manda para o perfil (D112):
 * temporadas completas, títulos e as conquistas cumpridas. Fica separado do
 * Craque para cada jogo carregar só o próprio motor (D62).
 */

export function tecnicoKey(career: CoachCareer, version: string): string {
  return careerKey("tecnico", version, career.setup);
}

export function tecnicoPayload(career: CoachCareer): TecnicoCareerPayload {
  return {
    temporadas: career.history.filter((entry) => !entry.partial).length,
    titulos: career.history.reduce((sum, entry) => sum + entry.titles.length, 0),
    conquistas: coachAchievementsMet(career),
  };
}
