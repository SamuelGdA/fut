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
        entries: archive.valid,
        achievements: achievements.valid,
        attempts: attempts.valid,
      });
    })();
    return loading;
  },

  async archive(entry) {
    await get().load();
    set((state) => ({ entries: [...state.entries.filter((item) => item.id !== entry.id), entry] }));
    await database?.put("archive", entry);
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
