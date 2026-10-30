import { careerAchievementCounts, getAchievement, newAchievements } from "@craque/content";
import { type Career, careerTotals, type ChallengeStatus, ENGINE_VERSION } from "@craque/engine";
import { careerKey } from "./careerKey";
import type { CraqueCareerPayload } from "./schemas";

/**
 * O que uma carreira terminada manda para o perfil (D112): os mesmos totais
 * do resumo (clube e seleção somados, D97), as conquistas que ela cumpriu
 * (todas, não só as novas, para contar a quantidade de cada troféu), a
 * melhor contagem das conquistas de contagem e, no Desafio, a nota do dia.
 * Nada de replay, nome ou aparência. O do Técnico fica em `tecnicoPayload.ts`,
 * para o pacote do Técnico não carregar o motor do Craque (D62).
 */

export function craqueKey(career: Career): string {
  return careerKey("craque", ENGINE_VERSION, career.setup);
}

export function craquePayload(career: Career, challenge: ChallengeStatus | null, finishedBefore: number, rankedDays: number): CraqueCareerPayload {
  const totals = careerTotals(career.history);
  const counts = careerAchievementCounts(career, challenge);
  const progress: Record<string, number> = {};
  for (const [id, value] of Object.entries(counts)) {
    const target = getAchievement(id)?.target;
    if (target !== undefined && value > 0) progress[id] = Math.min(Math.round(value), target);
  }
  return {
    temporadas: totals.seasons,
    partidas: totals.games,
    gols: totals.goals,
    assistencias: totals.assists,
    jogos_sem_sofrer: totals.cleanSheets,
    titulos: totals.titles,
    premios: totals.awards,
    bolas_de_ouro: career.history.filter((record) => (record.awards.won as readonly string[]).includes("ballonDor")).length,
    melhor_ovr: totals.peakOvr,
    conquistas: newAchievements({ career, challenge, finishedBefore, rankedDays }, new Set()),
    progresso: progress,
    ...(challenge ? { desafio: { dia: challenge.hand.id, pontos: challenge.total } } : {}),
  };
}
