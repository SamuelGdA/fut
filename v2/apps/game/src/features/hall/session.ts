import type { AvatarConfig } from "@craque/art";
import { achievementText, newAchievements } from "@craque/content";
import { type Career, CareerError, challengeStatus, type ChallengeStatus, isChallengeDayId, replay, saveOf } from "@craque/engine";
import { readPrefs } from "../../store/prefs";
import { readSave } from "../career/save";
import { handOf } from "../challenge/start";
import { archiveEntryOf, attemptOf, staleArchiveEntryOf } from "./build";
import { type AchievementRow, archiveId, type HallChallenge, hasRankedAttempt, rankedDays } from "./model";
import { useHall } from "./store";
import { useUnlocks } from "./unlocks";

/**
 * A ponte entre a carreira e o Hall da Fama: arquivar, registrar a tentativa
 * do desafio e liberar conquistas. Tudo idempotente: a mesma carreira terminada
 * duas vezes (recarregar a página no resumo) não duplica nada e não muda se a
 * tentativa foi ranqueada.
 *
 * A linha alternativa de um "E se...?" é só para se divertir (D43): não entra
 * no Hall e não libera conquista.
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
  const ids = newAchievements({ career, challenge: null, finishedBefore: 0, rankedDays: 0 }, unlockedSet());
  await grant(ids, career, now);
}

/**
 * A carreira terminou: registra a tentativa do desafio (a primeira terminada
 * do dia é a ranqueada), arquiva no Hall e libera as conquistas.
 */
export async function recordFinished(career: Career, avatar: AvatarConfig | null, alternate: boolean, now = Date.now()): Promise<void> {
  if (!career.end || alternate) return;
  const hall = useHall.getState();
  await hall.load();
  const id = archiveId(saveOf(career));
  const status = challengeOf(career);

  let challenge: HallChallenge | null = null;
  if (status) {
    const previous = useHall.getState().attempts.find((attempt) => attempt.id === id);
    const ranked = previous ? previous.ranked : !hasRankedAttempt(useHall.getState().attempts, status.hand.id);
    if (!previous) await hall.recordAttempt(attemptOf(career, status, ranked, now));
    challenge = { day: status.hand.id, score: status.total, ranked };
  }

  const existing = useHall.getState().entries.find((entry) => entry.id === id);
  if (!existing || existing.status !== "finished") {
    await hall.archive(archiveEntryOf(career, avatar, { status: "finished", alternate: false, challenge, now: existing?.archivedAt ?? now }));
  }

  const state = useHall.getState();
  const finishedBefore = state.entries.filter((entry) => entry.status === "finished" && entry.id !== id).length;
  const ids = newAchievements({ career, challenge: status, finishedBefore, rankedDays: rankedDays(state.attempts) }, unlockedSet());
  await grant(ids, career, now);
}

/** Uma carreira em andamento deixada para trás (outra começou): entra no Hall como interrompida. */
export async function recordInterrupted(career: Career, avatar: AvatarConfig | null, alternate: boolean, now = Date.now()): Promise<void> {
  if (career.end || career.history.length === 0 || alternate) return;
  const status = challengeOf(career);
  await useHall
    .getState()
    .archive(
      archiveEntryOf(career, avatar, {
        status: "interrupted",
        alternate: false,
        challenge: status ? { day: status.hand.id, score: status.total, ranked: false } : null,
        now,
      }),
    );
}

/**
 * O save em disco vai ser trocado (carreira nova, descartar no Início): se
 * houver uma carreira em andamento com ao menos uma temporada, ela vai para o
 * Hall antes. Save de outra versão do motor entra pelo retrato.
 */
export async function archiveSavedCareer(now = Date.now()): Promise<void> {
  const read = readSave();
  if (read.kind === "stale") {
    // Sem o motor da época, não dá para refazer: entra com o que o retrato do save sabe.
    if (read.record && read.snapshot.seasons > 0) await useHall.getState().archive(staleArchiveEntryOf(read.record, now));
    return;
  }
  if (read.kind !== "ok") return;
  let career: Career;
  try {
    career = replay(read.record);
  } catch (error) {
    if (error instanceof CareerError) return;
    throw error;
  }
  if (career.end) {
    await recordFinished(career, read.record.avatar, read.record.alternate !== undefined, now);
    return;
  }
  await recordInterrupted(career, read.record.avatar, read.record.alternate !== undefined, now);
}
