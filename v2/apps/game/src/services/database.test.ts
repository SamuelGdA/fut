import { IDBDatabase, IDBFactory } from "fake-indexeddb";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DB_NAME, type MemoryReason, openGameDatabase } from "./database";

/** O banco do Hall da Fama (GDD 34.1 e 34.3): IndexedDB quando dá, memória quando não dá. */

afterEach(() => {
  vi.restoreAllMocks();
});

function reasons(db: { onMemoryOnly(listener: (reason: MemoryReason) => void): () => void }): MemoryReason[] {
  const seen: MemoryReason[] = [];
  db.onMemoryOnly((reason) => seen.push(reason));
  return seen;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("IndexedDB disponível", () => {
  it("grava, relê numa abertura nova e apaga", async () => {
    const factory = new IDBFactory();
    const first = await openGameDatabase(factory);
    expect(first.persistent).toBe(true);
    await first.put("archive", { id: "a", surname: "SILVA" });
    await first.put("leaderboard", { id: "2026-10-02:a", score: 712 });
    expect(first.get("archive", "a")).toEqual({ id: "a", surname: "SILVA" });

    const second = await openGameDatabase(factory);
    expect(second.all("archive")).toEqual([{ id: "a", surname: "SILVA" }]);
    expect(second.all("leaderboard")).toHaveLength(1);
    expect(second.all("achievements")).toEqual([]);

    await second.remove("archive", "a");
    const third = await openGameDatabase(factory);
    expect(third.all("archive")).toEqual([]);
  });

  it("gravar de novo com o mesmo id troca a linha (arquivar é idempotente)", async () => {
    const db = await openGameDatabase(new IDBFactory());
    await db.put("archive", { id: "x", n: 1 });
    await db.put("archive", { id: "x", n: 2 });
    expect(db.all("archive")).toEqual([{ id: "x", n: 2 }]);
  });

  it("o espelho guarda uma cópia: mexer no objeto depois não muda o banco", async () => {
    const db = await openGameDatabase(new IDBFactory());
    const row = { id: "x", list: [1, 2] };
    await db.put("archive", row);
    row.list.push(3);
    expect(db.get("archive", "x")).toEqual({ id: "x", list: [1, 2] });
  });

  it("linhas sem id (disco mexido à mão) ficam de fora do espelho", async () => {
    const factory = new IDBFactory();
    await openGameDatabase(factory);
    // Escreve direto no IndexedDB, por fora do jogo, uma linha válida e outra sem id de texto.
    const raw = await new Promise<globalThis.IDBDatabase>((resolve) => {
      const request = factory.open(DB_NAME);
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve) => {
      const transaction = raw.transaction("archive", "readwrite");
      transaction.objectStore("archive").put({ id: "ok" });
      transaction.objectStore("archive").put({ id: 7 });
      transaction.oncomplete = () => resolve();
    });
    raw.close();
    const db = await openGameDatabase(factory);
    expect(db.all("archive")).toEqual([{ id: "ok" }]);
  });
});

describe("fallback em memória (aba anônima, disco bloqueado ou cheio)", () => {
  it("sem IndexedDB: funciona em memória e avisa uma vez", async () => {
    const db = await openGameDatabase(null);
    const seen = reasons(db);
    expect(db.persistent).toBe(false);
    await db.put("achievements", { id: "firstCareer", at: 1 });
    expect(db.all("achievements")).toEqual([{ id: "firstCareer", at: 1 }]);
    await tick();
    expect(seen).toEqual(["unavailable"]);
  });

  it("abrir lança exceção (armazenamento bloqueado): memória", async () => {
    const factory = {
      open: () => {
        throw new DOMException("bloqueado", "SecurityError");
      },
    } as unknown as globalThis.IDBFactory;
    const db = await openGameDatabase(factory);
    expect(db.persistent).toBe(false);
    expect(db.memoryReason).toBe("unavailable");
  });

  it("a abertura falha (aba anônima de navegadores antigos): memória", async () => {
    const factory = {
      open: () => {
        const request = {} as { onerror?: (event: { preventDefault(): void }) => void };
        setTimeout(() => request.onerror?.({ preventDefault: () => {} }), 0);
        return request;
      },
    } as unknown as globalThis.IDBFactory;
    const db = await openGameDatabase(factory);
    expect(db.memoryReason).toBe("failed");
  });

  it("a abertura nunca responde: desiste no prazo e segue em memória", async () => {
    const factory = { open: () => ({}) } as unknown as globalThis.IDBFactory;
    const db = await openGameDatabase(factory, 20);
    expect(db.persistent).toBe(false);
    expect(db.memoryReason).toBe("timeout");
    await db.put("archive", { id: "a" });
    expect(db.get("archive", "a")).toEqual({ id: "a" });
  });

  it("cota cheia no meio da sessão: o que já estava continua, o novo fica em memória, e o aviso sai uma vez", async () => {
    const db = await openGameDatabase(new IDBFactory());
    const seen = reasons(db);
    await db.put("archive", { id: "antes" });
    const original = IDBDatabase.prototype.transaction;
    vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(function (this: IDBDatabase, stores, mode) {
      if (mode === "readwrite") throw new DOMException("cheio", "QuotaExceededError");
      return original.call(this, stores, mode);
    });
    await db.put("archive", { id: "depois" });
    await db.put("archive", { id: "mais" });
    expect(db.persistent).toBe(false);
    expect(db.memoryReason).toBe("write");
    expect(db.all("archive").map((row) => (row as { id: string }).id).sort()).toEqual(["antes", "depois", "mais"]);
    expect(seen).toEqual(["write"]);
  });
});
