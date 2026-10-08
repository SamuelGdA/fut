import type { AvatarConfig } from "@craque/art";
import { careerAchievementCounts } from "@craque/content";
import { type Career, careerTotals, type ChallengeStatus, saveOf } from "@craque/engine";
import type { SaveRecord } from "../career/saveRecord";
import {
  ARCHIVE_FORMAT,
  type ArchiveEntry,
  type ArchiveStatus,
  type AttemptEntry,
  archiveId,
  type HallChallenge,
  type HallSnapshot,
  LEADERBOARD_FORMAT,
} from "./model";

/**
 * Monta as linhas do Hall e do ranking a partir de uma carreira refeita.
 * Precisa do motor: roda na carreira e no resumo, nunca no Início.
 */

/** Os clubes que ele mais defendeu, por temporadas (empate: o primeiro). */
function mainClubs(career: Career): string[] {
  const seasons = new Map<string, number>();
  for (const record of career.history) seasons.set(record.club, (seasons.get(record.club) ?? 0) + 1);
  return [...seasons].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([club]) => club);
}

export function hallSnapshotOf(career: Career, challenge: HallChallenge | null): HallSnapshot {
  const totals = careerTotals(career.history);
  const last = career.history[career.history.length - 1];
  return {
    surname: career.setup.identity.surname,
    nationality: career.nationality,
    position: career.player.position,
    peakOvr: totals.peakOvr,
    titles: totals.titles,
    awards: totals.awards,
    ballons: career.history.filter((record) => (record.awards.won as readonly string[]).includes("ballonDor")).length,
    goals: totals.goals + totals.nationalGoals,
    games: totals.games + totals.nationalGames,
    seasons: totals.seasons,
    clubs: mainClubs(career),
    endAge: career.end?.age ?? last?.age ?? career.age,
    end: career.end?.reason ?? null,
    pace: career.setup.pace,
    difficulty: career.setup.difficulty,
    challenge,
  };
}

export interface ArchiveOptions {
  readonly status: ArchiveStatus;
  readonly alternate: boolean;
  readonly challenge: HallChallenge | null;
  readonly now: number;
}

export function archiveEntryOf(career: Career, avatar: AvatarConfig | null, options: ArchiveOptions): ArchiveEntry {
  const save = saveOf(career);
  return {
    id: archiveId(save),
    format: ARCHIVE_FORMAT,
    archivedAt: options.now,
    status: options.status,
    alternate: options.alternate,
    save,
    avatar,
    snapshot: hallSnapshotOf(career, options.challenge),
    counts: careerAchievementCounts(career, null),
  };
}

/**
 * Um save de outra versão do motor, trocado por uma carreira nova: não dá para
 * refazer, então entra no Hall com o que o retrato do save sabe (GDD 34.2).
 */
export function staleArchiveEntryOf(record: SaveRecord, now: number): ArchiveEntry {
  const snapshot = record.snapshot;
  return {
    id: archiveId(record),
    format: ARCHIVE_FORMAT,
    archivedAt: now,
    status: "interrupted",
    alternate: record.alternate !== undefined,
    save: { v: record.v, engine: record.engine, setup: record.setup, choices: record.choices, ...(record.quit ? { quit: true as const } : {}) },
    avatar: record.avatar,
    snapshot: {
      surname: snapshot.surname,
      nationality: snapshot.nationality,
      position: snapshot.position,
      peakOvr: snapshot.ovr,
      titles: 0,
      awards: 0,
      ballons: 0,
      goals: 0,
      games: 0,
      seasons: snapshot.seasons,
      clubs: snapshot.club ? [snapshot.club] : [],
      endAge: snapshot.age,
      end: snapshot.end,
      pace: record.setup.pace,
      difficulty: record.setup.difficulty,
      challenge: null,
    },
    counts: {},
  };
}

export function attemptOf(career: Career, status: ChallengeStatus, ranked: boolean, now: number): AttemptEntry {
  const top = [...status.missions].sort((a, b) => b.points - a.points)[0];
  return {
    id: archiveId(saveOf(career)),
    format: LEADERBOARD_FORMAT,
    day: status.hand.id,
    surname: career.setup.identity.surname,
    score: status.total,
    topMission: top?.id ?? "",
    missionsDone: status.missions.filter((item) => item.ratio >= 1).length,
    edict: status.edict.id,
    edictKept: status.edict.state === "intact" || status.edict.state === "met",
    erased: status.erased,
    peakOvr: status.peakOvr,
    at: now,
    ranked,
  };
}
