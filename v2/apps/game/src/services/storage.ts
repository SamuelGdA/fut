/**
 * Armazenamento que nunca derruba o jogo.
 *
 * O localStorage pode lançar exceção em modo privado, com cookies bloqueados
 * ou com a cota cheia. Qualquer falha troca, de vez, para um mapa em memória:
 * o jogo segue funcionando e a interface avisa uma vez que nada será salvo
 * (GDD 34.3).
 */

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SafeStorage extends KeyValueStore {
  /** Falso depois da primeira falha: dali em diante tudo vive em memória. */
  readonly persistent: boolean;
}

const PROBE_KEY = "craque.v2.probe";

export function createSafeStorage(getBackend: () => KeyValueStore | null): SafeStorage {
  const memory = new Map<string, string>();
  let backend: KeyValueStore | null = null;

  try {
    backend = getBackend();
    if (backend) {
      backend.setItem(PROBE_KEY, "1");
      backend.removeItem(PROBE_KEY);
    }
  } catch {
    backend = null;
  }

  const fail = () => {
    backend = null;
  };

  return {
    get persistent() {
      return backend !== null;
    },

    getItem(key) {
      if (backend) {
        try {
          return backend.getItem(key);
        } catch {
          fail();
        }
      }
      return memory.get(key) ?? null;
    },

    setItem(key, value) {
      memory.set(key, value);
      if (!backend) return;
      try {
        backend.setItem(key, value);
      } catch {
        fail();
      }
    },

    removeItem(key) {
      memory.delete(key);
      if (!backend) return;
      try {
        backend.removeItem(key);
      } catch {
        fail();
      }
    },
  };
}

function browserLocalStorage(): KeyValueStore | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

/** A instância usada pelo app inteiro. */
export const safeStorage: SafeStorage = createSafeStorage(browserLocalStorage);

/** Chaves do v2 (GDD 34.1). Nada fora desta lista é escrito pelo jogo. */
export const STORAGE_KEYS = {
  prefs: "craque.v2.prefs",
  draft: "craque.v2.draft",
  save: "craque.v2.save",
  /** Rascunho da identidade do treinador (D51): preferência, nunca a carreira. */
  tecnicoDraft: "craque.v2.tecnico.draft",
} as const;
