import type { AvatarConfig } from "@craque/art";
import type { CountryCode } from "@craque/world";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isRecord, oneOf, text } from "../../lib/validate";
import { STORAGE_KEYS, safeStorage } from "../../services/storage";
import { sanitizeAvatar } from "../appearance/avatarSchema";

/**
 * Rascunho da identidade do treinador (D51): nome, nacionalidade, ritmo e
 * aparência. Fica guardado como preferência, igual ao rascunho do Craque; a
 * carreira do Técnico nunca é salva.
 */

export const COACH_NAME_MAX = 16;
export const COACH_MODES = ["fast", "slow"] as const;
export type CoachModeChoice = (typeof COACH_MODES)[number];

/**
 * Países com segunda divisão no jogo (a mesma lista do motor, D53). Repetida
 * aqui para a tela leve não carregar o motor do Técnico; um teste confere.
 */
export const COACH_NATIONS: readonly CountryCode[] = ["ARG", "BOL", "BRA", "CHI", "COL", "ECU", "ENG", "ESP", "FRA", "GER", "ITA", "PAR", "PER", "URU", "VEN"];

/** Países cuja segunda divisão tem poucos jogadores reais (completada com gerados). */
export const COMPLETED_SECOND_DIVISIONS: ReadonlySet<CountryCode> = new Set(["ARG", "BOL", "BRA", "CHI", "COL", "ECU", "PAR", "PER", "URU", "VEN"]);

export interface CoachDraft {
  name: string;
  nationality: CountryCode | null;
  mode: CoachModeChoice;
  avatar: AvatarConfig | null;
}

export const EMPTY_COACH_DRAFT: Readonly<CoachDraft> = { name: "", nationality: null, mode: "fast", avatar: null };

export function sanitizeCoachDraft(input: unknown): CoachDraft {
  const source = isRecord(input) ? input : {};
  const nationality = source["nationality"];
  return {
    name: text(source["name"], COACH_NAME_MAX, ""),
    nationality: typeof nationality === "string" && (COACH_NATIONS as readonly string[]).includes(nationality) ? nationality : null,
    mode: oneOf(source["mode"], COACH_MODES, "fast"),
    avatar: sanitizeAvatar(source["avatar"]),
  };
}

export function isCoachNameValid(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= COACH_NAME_MAX;
}

interface DraftActions {
  update(patch: Partial<CoachDraft>): void;
}

export const useCoachDraft = create<CoachDraft & DraftActions>()(
  persist(
    (set) => ({
      ...EMPTY_COACH_DRAFT,
      update: (patch) => set(patch),
    }),
    {
      name: STORAGE_KEYS.tecnicoDraft,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state): CoachDraft => ({ name: state.name, nationality: state.nationality, mode: state.mode, avatar: state.avatar }),
      merge: (persisted, current) => ({ ...current, ...sanitizeCoachDraft(persisted) }),
    },
  ),
);
