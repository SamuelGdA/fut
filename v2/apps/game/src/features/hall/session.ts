import type { AvatarConfig } from "@craque/art";
import { achievementText, newAchievements, careerAchievementCounts } from "@craque/content";
import { type Career, challengeStatus, type ChallengeStatus, isChallengeDayId, saveOf } from "@craque/engine";
import { readPrefs } from "../../store/prefs";
import { handOf } from "../challenge/start";
import { attemptOf } from "./build";
import { type AchievementRow, archiveId, hasRankedAttempt, rankedDays } from "./model";
import { useHall } from "./store";
import { useUnlocks } from "./unlocks";

/**
 * Persiste conquistas, contagens e ranking, sem arquivar carreiras (D47).
 * Hashes tornam o fim idempotente: recarregar o resumo não conta de novo.
 * Linhas alternativas não liberam conquistas nem avançam os contadores.
 */

/** O resultado do desafio de uma carreira de desafio, ou `null`. */
export function challengeOf(career: Career): ChallengeStatus | null {
  const id = career.setup.challengeId;
  if (!id || !isChallengeDayId(id)) return null;
  try {
    return challengeStatus(handOf(id), career);
  } catch {
    return null;
  }
}

/** Avisa e grava as conquistas novas. `career` é quem liberou. */
async function grant(ids: readonly string[], career: Career, now: number): Promise<void> {
  if (ids.length === 0) return;
  const rows: AchievementRow[] = ids.map((id) => ({ id, at: now, by: career.setup.identity.surname }));
  await useHall.getState().unlock(rows);
  const locale = readPrefs().locale;
  useUnlocks.getState().push(ids.map((id) => ({ id, ...achievementText(locale, id) })));
}

function unlockedSet(): Set<string> {
  return new Set(useHall.getState().achievements.map((row) => row.id));
}

/** Depois de cada escolha no meio da carreira: só as conquistas que podem cair a qualquer hora. */
export async function recordStep(career: Career, now = Date.now()): Promise<void> {
  if (career.end) return;
  await useHall.getState().load();
  useHall.getState().recordProgress(careerAchievementCounts(career, null));
  const ids = newAchievements({ career, challenge: null, finishedBefore: 0, rankedDays: 0 }, unlockedSet());
  await grant(ids, career, now);
}

/**
 * A carreira terminou: registra a tentativa do desafio (a primeira terminada
 * do dia é a ranqueada), atualiza contagens e libera conquistas.
 */
export async function recordFinished(career: Career, _avatar: AvatarConfig | null, alternate: boolean, now = Date.now()): Promise<void> {
  if (!career.end || alternate) return;
  const hall = useHall.getState();
  await hall.load();
  const id = archiveId(saveOf(career));
  const status = challengeOf(career);

  if (status) {
    const previous = useHall.getState().attempts.find((attempt) => attempt.id === id);
    const ranked = previous ? previous.ranked : !hasRankedAttempt(useHall.getState().attempts, status.hand.id);
    if (!previous) await hall.recordAttempt(attemptOf(career, status, ranked, now));
  }

  hall.recordProgress(careerAchievementCounts(career, status), id);
  const state = useHall.getState();
  const finishedBefore = Math.max(0, state.finished - 1);
  const ids = newAchievements({ career, challenge: status, finishedBefore, rankedDays: rankedDays(state.attempts) }, unlockedSet());
  await grant(ids, career, now);
}

/** O Hall está desativado: substituir um save não arquiva a carreira. */
export async function recordInterrupted(_career: Career, _avatar: AvatarConfig | null, _alternate: boolean, _now = Date.now()): Promise<void> {
  await useHall.getState().load();
}

/** Limpa arquivos antigos sem preservar saves de outras versões. */
export async function archiveSavedCareer(_now = Date.now()): Promise<void> {
  await useHall.getState().load();
}
