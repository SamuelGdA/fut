/**
 * O banco do Hall da Fama, das conquistas e do ranking (GDD 34.1): IndexedDB
 * `craque-v2`, com as lojas `archive`, `achievements` e `leaderboard`.
 *
 * Nada aqui derruba o jogo. Na abertura, tudo é lido para um espelho em
 * memória; a leitura vem sempre do espelho (síncrona) e a escrita vai para o
 * espelho e, depois, para o disco. Se o IndexedDB não existe, não abre (aba
 * anônima, disco bloqueado), demora demais ou falha numa escrita (cota cheia),
 * o banco passa a viver só em memória até o fim da sessão: o jogo segue igual
 * e o aviso discreto aparece uma vez (GDD 34.3).
 */

export const DB_NAME = "craque-v2";
export const DB_VERSION = 1;
export const DB_STORES = ["archive", "achievements", "leaderboard"] as const;
export type DbStore = (typeof DB_STORES)[number];

/** Toda linha tem um `id` de texto, que é a chave. */
export interface DbRow {
  readonly id: string;
}

/** Por que o banco está só em memória. */
export type MemoryReason = "unavailable" | "blocked" | "timeout" | "failed" | "write" | "versionchange";

export interface GameDatabase {
  /** Falso quando o banco está só em memória: nada sobrevive ao fechar a aba. */
  readonly persistent: boolean;
  readonly memoryReason: MemoryReason | null;
  /** As linhas da loja, como estão no espelho. Quem lê valida (GDD 34.3). */
  all(store: DbStore): unknown[];
  get(store: DbStore, id: string): unknown;
  /** Grava (ou troca) a linha. Nunca rejeita: falha no disco vira modo memória. */
  put<T extends DbRow>(store: DbStore, row: T): Promise<void>;
  remove(store: DbStore, id: string): Promise<void>;
  /** Avisa uma vez quando o banco passa a viver só em memória. */
  onMemoryOnly(listener: (reason: MemoryReason) => void): () => void;
}

/** Quanto esperar a abertura antes de desistir (alguns navegadores travam em aba anônima). */
export const OPEN_TIMEOUT_MS = 4000;

type Mirror = Map<DbStore, Map<string, unknown>>;

function emptyMirror(): Mirror {
  return new Map(DB_STORES.map((store) => [store, new Map<string, unknown>()]));
}

function idOf(row: unknown): string | null {
  if (typeof row !== "object" || row === null) return null;
  const id = (row as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB: pedido falhou"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB: transação falhou"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB: transação abortada"));
  });
}

type OpenOutcome = { readonly kind: "open"; readonly db: IDBDatabase } | { readonly kind: "memory"; readonly reason: MemoryReason };

function openRaw(factory: IDBFactory, timeoutMs: number): Promise<OpenOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (outcome: OpenOutcome) => {
      if (settled) {
        // Abriu depois do prazo: fecha para não segurar o banco à toa.
        if (outcome.kind === "open") outcome.db.close();
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(outcome);
    };
    const timer = setTimeout(() => finish({ kind: "memory", reason: "timeout" }), timeoutMs);
    let request: IDBOpenDBRequest;
    try {
      request = factory.open(DB_NAME, DB_VERSION);
    } catch {
      finish({ kind: "memory", reason: "unavailable" });
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of DB_STORES) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: "id" });
      }
    };
    request.onsuccess = () => finish({ kind: "open", db: request.result });
    request.onerror = (event) => {
      event.preventDefault();
      finish({ kind: "memory", reason: "failed" });
    };
    request.onblocked = () => finish({ kind: "memory", reason: "blocked" });
  });
}

async function readAll(db: IDBDatabase): Promise<Mirror> {
  const mirror = emptyMirror();
  const transaction = db.transaction([...DB_STORES], "readonly");
  const done = transactionDone(transaction);
  const reads = DB_STORES.map(async (store) => {
    const rows = await requestResult(transaction.objectStore(store).getAll());
    const target = mirror.get(store);
    for (const row of rows) {
      const id = idOf(row);
      if (id && target) target.set(id, row);
    }
  });
  await Promise.all([...reads, done]);
  return mirror;
}

/**
 * Abre o banco. `factory` é o `indexedDB` do navegador (ou `null`, quando não
 * existe). Sempre resolve: no pior caso, com um banco só em memória.
 */
export async function openGameDatabase(factory: IDBFactory | null | undefined, timeoutMs = OPEN_TIMEOUT_MS): Promise<GameDatabase> {
  let db: IDBDatabase | null = null;
  let mirror = emptyMirror();
  let reason: MemoryReason | null = null;

  if (!factory) {
    reason = "unavailable";
  } else {
    const outcome = await openRaw(factory, timeoutMs);
    if (outcome.kind === "memory") {
      reason = outcome.reason;
    } else {
      try {
        mirror = await readAll(outcome.db);
        db = outcome.db;
      } catch {
        outcome.db.close();
        reason = "failed";
      }
    }
  }

  const listeners = new Set<(reason: MemoryReason) => void>();
  let announced = false;

  const toMemory = (next: MemoryReason) => {
    if (db) {
      try {
        db.close();
      } catch {
        // Já fechado.
      }
      db = null;
    }
    reason ??= next;
    if (announced) return;
    announced = true;
    for (const listener of listeners) listener(reason);
  };

  if (db) {
    // Outra aba pediu uma versão nova: este espelho continua valendo só aqui.
    db.onversionchange = () => toMemory("versionchange");
  }

  const write = async (store: DbStore, apply: (target: IDBObjectStore) => void) => {
    const current = db;
    if (!current) return;
    try {
      const transaction = current.transaction(store, "readwrite");
      const done = transactionDone(transaction);
      apply(transaction.objectStore(store));
      await done;
    } catch {
      toMemory("write");
    }
  };

  return {
    get persistent() {
      return db !== null;
    },
    get memoryReason() {
      return reason;
    },
    all(store) {
      return [...(mirror.get(store)?.values() ?? [])];
    },
    get(store, id) {
      return mirror.get(store)?.get(id);
    },
    put<T extends DbRow>(store: DbStore, row: T) {
      // O espelho guarda uma cópia: quem gravou pode mexer no objeto depois.
      const copy = structuredClone(row);
      mirror.get(store)?.set(row.id, copy);
      return write(store, (target) => {
        target.put(copy);
      });
    },
    remove(store, id) {
      mirror.get(store)?.delete(id);
      return write(store, (target) => {
        target.delete(id);
      });
    },
    onMemoryOnly(listener) {
      listeners.add(listener);
      // Quem chega depois da queda ainda fica sabendo.
      if (!db && reason) queueMicrotask(() => listener(reason ?? "failed"));
      return () => listeners.delete(listener);
    },
  };
}

function browserFactory(): IDBFactory | null {
  try {
    return typeof indexedDB === "undefined" ? null : indexedDB;
  } catch {
    // Alguns navegadores lançam só de tocar no `indexedDB` com o armazenamento bloqueado.
    return null;
  }
}

let shared: Promise<GameDatabase> | null = null;

/** O banco do app, aberto uma vez e compartilhado. */
export function gameDatabase(): Promise<GameDatabase> {
  shared ??= openGameDatabase(browserFactory());
  return shared;
}
