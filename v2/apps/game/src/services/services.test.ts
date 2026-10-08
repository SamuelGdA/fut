import { describe, expect, it } from "vitest";
import { volumeGain } from "./audio";
import { createSafeStorage, type KeyValueStore } from "./storage";

function memoryBackend(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe("createSafeStorage (GDD 34.3)", () => {
  it("usa o armazenamento do navegador quando ele funciona", () => {
    const backend = memoryBackend();
    const storage = createSafeStorage(() => backend);
    storage.setItem("a", "1");
    expect(storage.persistent).toBe(true);
    expect(backend.data.get("a")).toBe("1");
    expect(storage.getItem("a")).toBe("1");
  });

  it("cai para memória quando o navegador bloqueia desde o início", () => {
    const blocked: KeyValueStore = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("SecurityError");
      },
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    const storage = createSafeStorage(() => blocked);
    expect(storage.persistent).toBe(false);
    storage.setItem("a", "1");
    expect(storage.getItem("a")).toBe("1");
    storage.removeItem("a");
    expect(storage.getItem("a")).toBeNull();
  });

  it("troca para memória na primeira falha e mantém o que já foi escrito", () => {
    const backend = memoryBackend();
    let full = false;
    const flaky: KeyValueStore = {
      getItem: backend.getItem,
      removeItem: backend.removeItem,
      setItem: (key, value) => {
        if (full) throw new Error("QuotaExceededError");
        backend.setItem(key, value);
      },
    };
    const storage = createSafeStorage(() => flaky);
    storage.setItem("a", "1");
    full = true;
    storage.setItem("b", "2");
    expect(storage.persistent).toBe(false);
    expect(storage.getItem("a")).toBe("1");
    expect(storage.getItem("b")).toBe("2");
  });

  it("sem navegador (Node) funciona em memória", () => {
    const storage = createSafeStorage(() => null);
    expect(storage.persistent).toBe(false);
    storage.setItem("x", "y");
    expect(storage.getItem("x")).toBe("y");
  });
});

describe("volumeGain (GDD 33.2)", () => {
  it("cinco passos de 0 a 100%", () => {
    expect([0, 1, 2, 3, 4].map((step) => volumeGain(step, false))).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("mudo é sempre zero, em qualquer passo", () => {
    expect(volumeGain(4, true)).toBe(0);
  });

  it("valores fora da faixa são presos, e lixo vira silêncio", () => {
    expect(volumeGain(9, false)).toBe(1);
    expect(volumeGain(-2, false)).toBe(0);
    expect(volumeGain(Number.NaN, false)).toBe(0);
  });
});
