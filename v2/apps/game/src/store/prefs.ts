import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LOCALES, type Locale } from "../i18n/types";
import { bool, intInRange, isRecord, oneOf } from "../lib/validate";
import { STORAGE_KEYS, safeStorage } from "../services/storage";

export const THEMES = ["dark", "light"] as const;
export const MOTION_MODES = ["system", "reduced"] as const;
export const PACES = ["intense", "normal"] as const;
export const DIFFICULTIES = ["normal", "hard"] as const;

export type Theme = (typeof THEMES)[number];
export type MotionMode = (typeof MOTION_MODES)[number];
export type Pace = (typeof PACES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Volume em cinco passos: 0, 25, 50, 75 e 100% (GDD 33.2). */
export const VOLUME_STEPS = 4;

export interface PrefsData {
  locale: Locale;
  theme: Theme;
  /** Passo de 0 a VOLUME_STEPS. */
  volume: number;
  muted: boolean;
  motion: MotionMode;
  haptics: boolean;
  pace: Pace;
  difficulty: Difficulty;
}

export const DEFAULT_PREFS: Readonly<PrefsData> = {
  locale: "pt",
  theme: "dark",
  volume: 3,
  muted: false,
  motion: "system",
  haptics: true,
  pace: "intense",
  difficulty: "normal",
};

/**
 * Cada campo tem o próprio valor de queda: um valor desconhecido (de uma
 * versão antiga ou editado à mão) volta ao padrão daquele campo e não derruba
 * os outros. Chaves que não são preferências são descartadas.
 */
export function sanitizePrefs(input: unknown): PrefsData {
  const source = isRecord(input) ? input : {};
  return {
    locale: oneOf(source["locale"], LOCALES, DEFAULT_PREFS.locale),
    theme: oneOf(source["theme"], THEMES, DEFAULT_PREFS.theme),
    volume: intInRange(source["volume"], 0, VOLUME_STEPS, DEFAULT_PREFS.volume),
    muted: bool(source["muted"], DEFAULT_PREFS.muted),
    motion: oneOf(source["motion"], MOTION_MODES, DEFAULT_PREFS.motion),
    haptics: bool(source["haptics"], DEFAULT_PREFS.haptics),
    pace: oneOf(source["pace"], PACES, DEFAULT_PREFS.pace),
    difficulty: oneOf(source["difficulty"], DIFFICULTIES, DEFAULT_PREFS.difficulty),
  };
}

export interface PrefsActions {
  setLocale(locale: Locale): void;
  setTheme(theme: Theme): void;
  /** Mexer no volume para fora do zero desmuta sozinho (GDD 33.2). */
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  setMotion(motion: MotionMode): void;
  setHaptics(haptics: boolean): void;
  setPace(pace: Pace): void;
  setDifficulty(difficulty: Difficulty): void;
}

export type PrefsState = PrefsData & PrefsActions;

function pickData(state: PrefsState): PrefsData {
  return {
    locale: state.locale,
    theme: state.theme,
    volume: state.volume,
    muted: state.muted,
    motion: state.motion,
    haptics: state.haptics,
    pace: state.pace,
    difficulty: state.difficulty,
  };
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFS,
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setVolume: (volume) => {
        const step = Math.max(0, Math.min(VOLUME_STEPS, Math.round(volume)));
        set(step > 0 ? { volume: step, muted: false } : { volume: step });
      },
      setMuted: (muted) => set({ muted }),
      setMotion: (motion) => set({ motion }),
      setHaptics: (haptics) => set({ haptics }),
      setPace: (pace) => set({ pace }),
      setDifficulty: (difficulty) => set({ difficulty }),
    }),
    {
      name: STORAGE_KEYS.prefs,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: pickData,
      migrate: (persisted) => sanitizePrefs(persisted),
      merge: (persisted, current) => ({ ...current, ...sanitizePrefs(persisted) }),
    },
  ),
);

/** Leitura fora do React (sons, vibração), sem assinar mudanças. */
export function readPrefs(): PrefsData {
  return pickData(usePrefs.getState());
}
