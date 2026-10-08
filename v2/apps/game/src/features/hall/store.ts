import { create } from "zustand";
import { translate } from "../../i18n/translate";
import { type GameDatabase, gameDatabase } from "../../services/database";
import { safeStorage } from "../../services/storage";
import { readPrefs } from "../../store/prefs";
import { notify } from "../../ui/toast/notify";
import {
  type AchievementRow,
  type ArchiveEntry,
  type AttemptEntry,
  sanitizeAchievementRow,
  sanitizeArchiveEntry,
  sanitizeAttempt,
} from "./model";

/**
 * O Hall da Fama, as conquistas e o ranking em memória, espelhando o banco.
 * Abre uma vez; cada mudança vai para o estado na hora e para o disco logo
 * depois. Banco só em memória (aba anônima, disco cheio) não muda nada aqui:
 * só o aviso discreto aparece uma vez.
 */

export type HallStatus = "idle" | "loading" | "ready";

interface HallState {
  status: HallStatus;
  /** Falso quando o banco vive só em memória nesta sessão. */
  persistent: boolean;
  entries: ArchiveEntry[];
  achievements: AchievementRow[];
  attempts: AttemptEntry[];
  progress: Record<string, number>;
  finished: number;
  finishedIds: string[];
  recordProgress(counts: Record<string, number>, finishedId?: string): void;

  /** Abre o banco e lê tudo. Chamar quantas vezes for: só a primeira lê. */
  load(): Promise<void>;
  archive(entry: ArchiveEntry): Promise<void>;
  remove(id: string): Promise<void>;
  unlock(rows: readonly AchievementRow[]): Promise<void>;
  recordAttempt(attempt: AttemptEntry): Promise<void>;
}

let database: GameDatabase | null = null;
let loading: Promise<void> | null = null;

function announceMemoryOnly(): void {
  // Com o localStorage também fora, o aviso geral já disse que nada será salvo.
  if (!safeStorage.persistent) return;
  const locale = readPrefs().locale;
  notify({
    id: "database-unavailable",
    tone: "bad",
    title: translate(locale, "storage.hallUnavailableTitle"),
    description: translate(locale, "storage.hallUnavailableBody"),
    timeout: 9000,
  });
}

function readRows<T>(db: GameDatabase, store: "archive" | "achievements" | "leaderboard", sanitize: (input: unknown) => T | null) {
  const valid: T[] = [];
  const invalid: string[] = [];
  for (const row of db.all(store)) {
    const value = sanitize(row);
    if (value) valid.push(value);
    else if (typeof row === "object" && row !== null && typeof (row as { id?: unknown }).id === "string") invalid.push((row as { id: string }).id);
  }
  return { valid, invalid };
}

export const useHall = create<HallState>()((set, get) => ({
  status: "idle",
  persistent: true,
  entries: [],
  achievements: [],
  attempts: [],
  progress: {},
  finished: 0,
  finishedIds: [],
  recordProgress(counts, finishedId) {
    const state = get();
    const progress = { ...state.progress };
    for (const [id, value] of Object.entries(counts)) progress[id] = Math.max(progress[id] ?? 0, value);
    const finishedIds = finishedId && !state.finishedIds.includes(finishedId) ? [...state.finishedIds, finishedId] : state.finishedIds;
    const finished = finishedIds.length;
    set({ progress, finished, finishedIds });
    safeStorage.setItem("craque.v2.progress", JSON.stringify({ progress, finishedIds }));
  },

  load() {
    loading ??= (async () => {
      set({ status: "loading" });
      const db = await gameDatabase();
      database = db;
      db.onMemoryOnly(() => {
        set({ persistent: false });
        announceMemoryOnly();
      });
      const archive = readRows(db, "archive", sanitizeArchiveEntry);
      // Hall desativado: apaga também os arquivos de versões anteriores.
      for (const row of db.all("archive")) {
        if (typeof row === "object" && row !== null && "id" in row && typeof row.id === "string") await db.remove("archive", row.id);
      }
      try {
        const saved: unknown = JSON.parse(safeStorage.getItem("craque.v2.progress") ?? "null");
        if (typeof saved === "object" && saved !== null && "progress" in saved) {
          const source = saved as { progress: unknown; finishedIds?: unknown };
          const progress: Record<string, number> = {};
          if (typeof source.progress === "object" && source.progress !== null) {
            for (const [id, value] of Object.entries(source.progress)) {
              if (typeof value === "number" && Number.isFinite(value) && value >= 0) progress[id] = value;
            }
          }
          const finishedIds = Array.isArray(source.finishedIds) ? [...new Set(source.finishedIds.filter((id): id is string => typeof id === "string"))] : [];
          set({ progress, finished: finishedIds.length, finishedIds });
        }
      } catch { /* Contadores corrompidos voltam a zero; conquistas ficam no banco. */ }
      const achievements = readRows(db, "achievements", sanitizeAchievementRow);
      const attempts = readRows(db, "leaderboard", sanitizeAttempt);
      // Linha que não passa no schema sai do disco; no ranking, isto descarta
      // inteiro um ranking de formato antigo (GDD 27.7).
      for (const id of archive.invalid) void db.remove("archive", id);
      for (const id of achievements.invalid) void db.remove("achievements", id);
      for (const id of attempts.invalid) void db.remove("leaderboard", id);
      set({
        status: "ready",
        persistent: db.persistent,
        entries: [],
        achievements: achievements.valid,
        attempts: attempts.valid,
      });
    })();
    return loading;
  },

  async archive() {
    // Mantido apenas para compatibilidade de chamadas: não guarda carreiras.
    await get().load();
  },

  async remove(id) {
    await get().load();
    set((state) => ({ entries: state.entries.filter((item) => item.id !== id) }));
    await database?.remove("archive", id);
  },

  async unlock(rows) {
    await get().load();
    const known = new Set(get().achievements.map((row) => row.id));
    const fresh = rows.filter((row) => !known.has(row.id));
    if (fresh.length === 0) return;
    set((state) => ({ achievements: [...state.achievements, ...fresh] }));
    await Promise.all(fresh.map((row) => database?.put("achievements", row)));
  },

  async recordAttempt(attempt) {
    await get().load();
    set((state) => ({ attempts: [...state.attempts.filter((item) => item.id !== attempt.id), attempt] }));
    await database?.put("leaderboard", attempt);
  },
}));
