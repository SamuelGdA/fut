import type { ChallengeResult } from "./daily";

/**
 * The local leaderboard.
 *
 * Everything lives in this browser for now — there is no server, so there is
 * nothing to cheat *against* and no point pretending otherwise. It is shaped
 * the way a real leaderboard would be (one ranked attempt per challenge,
 * replays explicitly marked as friendlies) so that turning it into a real one
 * later is a transport change rather than a redesign.
 */

const STORAGE_KEY = "craque-challenge-scores";
const STORAGE_VERSION = 1;

export interface ChallengeEntry {
  challengeId: string;
  missionId: string;
  playerName: string;
  score: number;
  /** How many of the three briefs were actually delivered on. */
  missionsCounted: number;
  /** The day's banned move survived the whole career. */
  edictHeld: boolean;
  /** Peak overall reached, shown alongside the score for context. */
  peakOverall: number;
  /** ISO timestamp of when the run finished. */
  finishedAt: string;
  /**
   * Ranked runs are a player's *first* completed attempt at a challenge.
   * Anything after that still gets recorded, but sits outside the standings —
   * otherwise the board just rewards whoever replayed the most.
   */
  ranked: boolean;
}

interface StoredBoard {
  version: number;
  entries: ChallengeEntry[];
}

function read(): StoredBoard {
  if (typeof window === "undefined") return { version: STORAGE_VERSION, entries: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: STORAGE_VERSION, entries: [] };
    const parsed = JSON.parse(raw) as StoredBoard;
    // A board from an older shape is discarded rather than half-trusted; these
    // are scores, not saves, and a wrong number is worse than a missing one.
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.entries)) {
      return { version: STORAGE_VERSION, entries: [] };
    }
    return parsed;
  } catch {
    return { version: STORAGE_VERSION, entries: [] };
  }
}

function write(board: StoredBoard): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch {
    // Storage can be full or blocked; losing a score is not worth breaking the
    // end-of-career screen over.
  }
}

/** True when this challenge has no ranked attempt yet. */
export function hasRankedAttempt(challengeId: string): boolean {
  return read().entries.some((e) => e.challengeId === challengeId && e.ranked);
}

export function recordAttempt(input: {
  challengeId: string;
  missionId: string;
  playerName: string;
  peakOverall: number;
  result: ChallengeResult;
}): ChallengeEntry {
  const board = read();
  const entry: ChallengeEntry = {
    challengeId: input.challengeId,
    missionId: input.missionId,
    playerName: input.playerName || "-",
    score: input.result.score,
    missionsCounted: input.result.missions.filter((m) => m.counted && m.progress >= m.target).length,
    edictHeld: input.result.edictHeld,
    peakOverall: input.peakOverall,
    finishedAt: new Date().toISOString(),
    ranked: !board.entries.some((e) => e.challengeId === input.challengeId && e.ranked),
  };
  board.entries.push(entry);
  write(board);
  return entry;
}

/** Every attempt at one challenge, best first. */
export function attemptsFor(challengeId: string): ChallengeEntry[] {
  return read()
    .entries.filter((e) => e.challengeId === challengeId)
    .sort((a, b) => b.score - a.score);
}

/**
 * The standings for one day's challenge, best score first.
 *
 * Scoped to a single challenge on purpose: a daily board that carries
 * yesterday's scores is not a daily board, and an all-time list of one row
 * per day is a history rather than a ranking. Every attempt at the day
 * counts here, ranked or not, so the board fills up as the day is played
 * and is empty again the next morning.
 *
 * Passing no challenge falls back to every ranked run, which is what the
 * all-time view would want if one is ever added.
 */
export function standings(limit = 30, challengeId?: string): ChallengeEntry[] {
  return read()
    .entries.filter((e) => (challengeId === undefined ? e.ranked : e.challengeId === challengeId))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export interface ChallengeStats {
  played: number;
  bestScore: number;
  averageScore: number;
  cleanRuns: number;
}

export function challengeStats(): ChallengeStats {
  const ranked = read().entries.filter((e) => e.ranked);
  if (ranked.length === 0) return { played: 0, bestScore: 0, averageScore: 0, cleanRuns: 0 };
  return {
    played: ranked.length,
    bestScore: Math.max(...ranked.map((e) => e.score)),
    averageScore: Math.round(ranked.reduce((s, e) => s + e.score, 0) / ranked.length),
    cleanRuns: ranked.filter((e) => e.edictHeld).length,
  };
}

export function clearLeaderboard(): void {
  write({ version: STORAGE_VERSION, entries: [] });
}
