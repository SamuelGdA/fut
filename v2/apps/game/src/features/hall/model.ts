import type { AvatarConfig } from "@craque/art";
import type { CareerSave, Difficulty, EndReason, Pace, Position } from "@craque/engine";
import { isRecord, oneOf, text } from "../../lib/validate";
import { sanitizeAvatar } from "../appearance/avatarSchema";

/**
 * O formato do Hall da Fama, das conquistas e do ranking do desafio (GDD 27.7,
 * 28.1 e 28.2), e a leitura sem confiança de tudo que vem do banco (GDD 34.3).
 * Nada aqui precisa do motor: a lista do Hall abre só com o retrato.
 */

export const ARCHIVE_FORMAT = 1;
export const LEADERBOARD_FORMAT = 1;

const POSITIONS: readonly Position[] = ["gk", "cb", "lb", "rb", "cdm", "cm", "cam", "lm", "rm", "lw", "rw", "st"];
const END_REASONS: readonly EndReason[] = ["age", "noRoom", "noOffers", "release", "voluntary"];
const PACES: readonly Pace[] = ["intense", "normal"];
const DIFFICULTIES: readonly Difficulty[] = ["normal", "hard"];
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** O resultado do desafio guardado com a carreira. */
export interface HallChallenge {
  readonly day: string;
  readonly score: number;
  readonly ranked: boolean;
}

/** O retrato-resumo de uma carreira no Hall (GDD 28.1): o que a lista mostra sem refazer nada. */
export interface HallSnapshot {
  readonly surname: string;
  readonly nationality: string;
  readonly position: Position;
  readonly peakOvr: number;
  readonly titles: number;
  readonly awards: number;
  readonly ballons: number;
  readonly goals: number;
  readonly games: number;
  readonly seasons: number;
  /** Até três clubes, dos que ele mais defendeu. */
  readonly clubs: readonly string[];
  readonly endAge: number;
  readonly end: EndReason | null;
  readonly pace: Pace;
  readonly difficulty: Difficulty;
  readonly challenge: HallChallenge | null;
}

export type ArchiveStatus = "finished" | "interrupted";

export interface ArchiveEntry {
  readonly id: string;
  readonly format: typeof ARCHIVE_FORMAT;
  /** Quando entrou no Hall, em milissegundos desde a época. */
  readonly archivedAt: number;
  readonly status: ArchiveStatus;
  /** Linha alternativa de um "E se...?" (GDD 28.3). */
  readonly alternate: boolean;
  readonly save: CareerSave;
  readonly avatar: AvatarConfig | null;
  readonly snapshot: HallSnapshot;
  /** A contagem das conquistas de contagem nesta carreira, para a tela de conquistas não refazer nada. */
  readonly counts: Readonly<Record<string, number>>;
}

/** Uma tentativa do Desafio do dia (GDD 27.7). O id é o da carreira no Hall. */
export interface AttemptEntry {
  readonly id: string;
  readonly format: typeof LEADERBOARD_FORMAT;
  readonly day: string;
  readonly surname: string;
  readonly score: number;
  /** A missão que mais pontuou. */
  readonly topMission: string;
  /** Missões cumpridas (progresso no alvo ou acima). */
  readonly missionsDone: number;
  readonly edict: string;
  readonly edictKept: boolean;
  readonly erased: number;
  readonly peakOvr: number;
  /** Quando terminou, em milissegundos desde a época. */
  readonly at: number;
  /** A primeira tentativa terminada do dia. Só as ranqueadas entram nas estatísticas. */
  readonly ranked: boolean;
}

export interface AchievementRow {
  readonly id: string;
  /** Quando caiu, em milissegundos desde a época. */
  readonly at: number;
  /** O sobrenome da carreira que liberou. */
  readonly by: string;
}

// ------------------------------------------------------------------- leitura

const count = (value: unknown, max: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(0, Math.round(value))) : 0;

const instant = (value: unknown): number => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0);

function sanitizeCounts(input: unknown): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!isRecord(input)) return counts;
  for (const [id, value] of Object.entries(input)) {
    if (id.length <= 40 && typeof value === "number" && Number.isFinite(value) && value >= 0) counts[id] = Math.round(value);
  }
  return counts;
}

function sanitizeChallenge(input: unknown): HallChallenge | null {
  if (!isRecord(input)) return null;
  const day = input["day"];
  if (typeof day !== "string" || !DAY_PATTERN.test(day)) return null;
  return { day, score: count(input["score"], 1000), ranked: input["ranked"] === true };
}

export function sanitizeHallSnapshot(input: unknown): HallSnapshot | null {
  if (!isRecord(input)) return null;
  const surname = text(input["surname"], 16, "");
  if (surname.length === 0) return null;
  const clubs = Array.isArray(input["clubs"]) ? input["clubs"].filter((club): club is string => typeof club === "string").slice(0, 3) : [];
  const end = input["end"];
  return {
    surname,
    nationality: text(input["nationality"], 3, ""),
    position: oneOf(input["position"], POSITIONS, "st"),
    peakOvr: count(input["peakOvr"], 99),
    titles: count(input["titles"], 999),
    awards: count(input["awards"], 999),
    ballons: count(input["ballons"], 99),
    goals: count(input["goals"], 9999),
    games: count(input["games"], 9999),
    seasons: count(input["seasons"], 30),
    clubs,
    endAge: count(input["endAge"], 40),
    end: typeof end === "string" && (END_REASONS as readonly string[]).includes(end) ? (end as EndReason) : null,
    pace: oneOf(input["pace"], PACES, "normal"),
    difficulty: oneOf(input["difficulty"], DIFFICULTIES, "normal"),
    challenge: sanitizeChallenge(input["challenge"]),
  };
}

/**
 * O save guardado no Hall, conferido só na forma. A conferência de verdade é
 * o replay, quando o jogador abre a entrada (GDD 34.2).
 */
function sanitizeArchivedSave(input: unknown): CareerSave | null {
  if (!isRecord(input)) return null;
  const { v, engine, setup, choices, quit } = input;
  if (v !== 1 || typeof engine !== "string" || !isRecord(setup) || !Array.isArray(choices)) return null;
  if (quit !== undefined && quit !== true) return null;
  return input as unknown as CareerSave;
}

export function sanitizeArchiveEntry(input: unknown): ArchiveEntry | null {
  if (!isRecord(input) || input["format"] !== ARCHIVE_FORMAT) return null;
  const id = input["id"];
  const save = sanitizeArchivedSave(input["save"]);
  const snapshot = sanitizeHallSnapshot(input["snapshot"]);
  if (typeof id !== "string" || id.length === 0 || !save || !snapshot) return null;
  return {
    id,
    format: ARCHIVE_FORMAT,
    archivedAt: instant(input["archivedAt"]),
    status: oneOf(input["status"], ["finished", "interrupted"] as const, "finished"),
    alternate: input["alternate"] === true,
    save,
    avatar: sanitizeAvatar(input["avatar"]),
    snapshot,
    counts: sanitizeCounts(input["counts"]),
  };
}

export function sanitizeAttempt(input: unknown): AttemptEntry | null {
  if (!isRecord(input) || input["format"] !== LEADERBOARD_FORMAT) return null;
  const id = input["id"];
  const day = input["day"];
  const surname = text(input["surname"], 16, "");
  if (typeof id !== "string" || id.length === 0 || typeof day !== "string" || !DAY_PATTERN.test(day) || surname.length === 0) return null;
  return {
    id,
    format: LEADERBOARD_FORMAT,
    day,
    surname,
    score: count(input["score"], 1000),
    topMission: text(input["topMission"], 40, ""),
    missionsDone: count(input["missionsDone"], 3),
    edict: text(input["edict"], 40, ""),
    edictKept: input["edictKept"] === true,
    erased: count(input["erased"], 30),
    peakOvr: count(input["peakOvr"], 99),
    at: instant(input["at"]),
    ranked: input["ranked"] === true,
  };
}

export function sanitizeAchievementRow(input: unknown): AchievementRow | null {
  if (!isRecord(input)) return null;
  const id = input["id"];
  if (typeof id !== "string" || id.length === 0) return null;
  return { id, at: instant(input["at"]), by: text(input["by"], 16, "") };
}

// ----------------------------------------------------------------------- id

/**
 * O id de uma carreira no Hall: um hash do replay (motor, setup, escolhas e
 * encerramento). A mesma carreira dá sempre o mesmo id, então arquivar de novo
 * troca a entrada em vez de duplicar.
 */
export function archiveId(save: CareerSave): string {
  const source = JSON.stringify([save.engine, save.setup, save.choices.map((choice) => [choice.decision, choice.option]), save.quit === true]);
  // cyrb53: hash de 53 bits, curto e sem colisão prática para o tamanho do Hall.
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// ------------------------------------------------------------- Hall da Fama

export const HALL_SORTS = ["recent", "peak", "titles", "awards"] as const;
export type HallSort = (typeof HALL_SORTS)[number];

export interface HallFilter {
  readonly challenge: boolean;
  readonly hard: boolean;
}

/** A lista do Hall, ordenada e filtrada (GDD 28.1). Empate: a mais recente primeiro. */
export function hallList(entries: readonly ArchiveEntry[], sort: HallSort, filter: HallFilter): ArchiveEntry[] {
  const key = (entry: ArchiveEntry): number => {
    switch (sort) {
      case "recent":
        return entry.archivedAt;
      case "peak":
        return entry.snapshot.peakOvr;
      case "titles":
        return entry.snapshot.titles;
      case "awards":
        return entry.snapshot.awards;
    }
  };
  return entries
    .filter((entry) => (!filter.challenge || entry.snapshot.challenge !== null) && (!filter.hard || entry.snapshot.difficulty === "hard"))
    .sort((a, b) => key(b) - key(a) || b.archivedAt - a.archivedAt);
}

export interface PersonalRecord {
  readonly key: "peak" | "goals" | "titles" | "ballons";
  readonly value: number;
  readonly entry: ArchiveEntry;
}

/** Recordes pessoais no topo do Hall: maior pico, mais gols, mais títulos, mais Bolas de Ouro. */
export function personalRecords(entries: readonly ArchiveEntry[]): PersonalRecord[] {
  const pick = (key: PersonalRecord["key"], value: (entry: ArchiveEntry) => number): PersonalRecord | null => {
    let best: ArchiveEntry | null = null;
    for (const entry of entries) {
      // Empate: fica a primeira a chegar lá.
      if (!best || value(entry) > value(best) || (value(entry) === value(best) && entry.archivedAt < best.archivedAt)) best = entry;
    }
    return best && value(best) > 0 ? { key, value: value(best), entry: best } : null;
  };
  return [
    pick("peak", (entry) => entry.snapshot.peakOvr),
    pick("goals", (entry) => entry.snapshot.goals),
    pick("titles", (entry) => entry.snapshot.titles),
    pick("ballons", (entry) => entry.snapshot.ballons),
  ].filter((item): item is PersonalRecord => item !== null);
}

// ------------------------------------------------------------------ ranking

/** O ranking do dia (GDD 27.7): todas as tentativas do dia, da maior pontuação para a menor. */
export function dayRanking(attempts: readonly AttemptEntry[], day: string): AttemptEntry[] {
  return attempts.filter((attempt) => attempt.day === day).sort((a, b) => b.score - a.score || a.at - b.at);
}

/** A colocação da tentativa no ranking do dia dela, de 1 em diante. */
export function placementOf(attempts: readonly AttemptEntry[], id: string): { place: number; of: number } | null {
  const attempt = attempts.find((item) => item.id === id);
  if (!attempt) return null;
  const ranking = dayRanking(attempts, attempt.day);
  return { place: ranking.findIndex((item) => item.id === id) + 1, of: ranking.length };
}

export interface ChallengeStats {
  readonly played: number;
  readonly best: number;
  readonly average: number;
  /** Ranqueadas com o édito cumprido e nenhuma temporada apagada. */
  readonly clean: number;
}

/** Estatísticas do desafio: só ranqueadas contam (GDD 27.7). */
export function challengeStats(attempts: readonly AttemptEntry[]): ChallengeStats {
  const ranked = attempts.filter((attempt) => attempt.ranked);
  const total = ranked.reduce((sum, attempt) => sum + attempt.score, 0);
  return {
    played: ranked.length,
    best: ranked.reduce((top, attempt) => Math.max(top, attempt.score), 0),
    average: ranked.length > 0 ? Math.round(total / ranked.length) : 0,
    clean: ranked.filter((attempt) => attempt.edictKept && attempt.erased === 0).length,
  };
}

/** Dias distintos com tentativa ranqueada (conquista "Sete dias"). */
export function rankedDays(attempts: readonly AttemptEntry[]): number {
  return new Set(attempts.filter((attempt) => attempt.ranked).map((attempt) => attempt.day)).size;
}

/** Já tem tentativa terminada neste dia? A próxima é amistosa. */
export function hasRankedAttempt(attempts: readonly AttemptEntry[], day: string): boolean {
  return attempts.some((attempt) => attempt.day === day && attempt.ranked);
}
