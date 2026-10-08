import type { AvatarConfig } from "@craque/art";
import { POSITIONS, type Position } from "@craque/engine";
import { type CountryCode, getCountry } from "@craque/world";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isRecord, oneOf, text } from "../../lib/validate";
import { STORAGE_KEYS, safeStorage } from "../../services/storage";
import { sanitizeAvatar } from "../appearance/avatarSchema";

/**
 * O rascunho da identidade (GDD 34.1, `craque.v2.draft`): o que o jogador já
 * escolheu antes de confirmar. Sobrevive a recarregar a página e volta
 * intacto no "Jogar de novo".
 */

export const SURNAME_MAX = 16;
export const FEET = ["right", "left"] as const;
export type Foot = (typeof FEET)[number];

export interface DraftData {
  surname: string;
  dreamNumber: number | null;
  foot: Foot;
  nationality: CountryCode | null;
  position: Position | null;
  avatar: AvatarConfig | null;
}

export const EMPTY_DRAFT: Readonly<DraftData> = {
  surname: "",
  dreamNumber: null,
  foot: "right",
  nationality: null,
  position: null,
  avatar: null,
};

export function sanitizeDraft(input: unknown): DraftData {
  const source = isRecord(input) ? input : {};
  const nationality = source["nationality"];
  const dream = source["dreamNumber"];
  return {
    surname: text(source["surname"], SURNAME_MAX, EMPTY_DRAFT.surname),
    dreamNumber: typeof dream === "number" && Number.isInteger(dream) && dream >= 1 && dream <= 99 ? dream : null,
    foot: oneOf(source["foot"], FEET, EMPTY_DRAFT.foot),
    nationality: typeof nationality === "string" && getCountry(nationality) ? nationality : null,
    position: (POSITIONS as readonly unknown[]).includes(source["position"]) ? (source["position"] as Position) : null,
    avatar: sanitizeAvatar(source["avatar"]),
  };
}

/** O sobrenome confirmado: sem espaço nas pontas, em maiúsculas pela regra do idioma. */
export function isSurnameValid(surname: string): boolean {
  return surname.trim().length > 0 && surname.trim().length <= SURNAME_MAX;
}

export function isDraftComplete(draft: DraftData): boolean {
  return isSurnameValid(draft.surname) && draft.nationality !== null && draft.position !== null;
}

interface DraftActions {
  update(patch: Partial<DraftData>): void;
  reset(): void;
}

export const useDraft = create<DraftData & DraftActions>()(
  persist(
    (set) => ({
      ...EMPTY_DRAFT,
      update: (patch) => set(patch),
      reset: () => set({ ...EMPTY_DRAFT }),
    }),
    {
      name: STORAGE_KEYS.draft,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state): DraftData => ({
        surname: state.surname,
        dreamNumber: state.dreamNumber,
        foot: state.foot,
        nationality: state.nationality,
        position: state.position,
        avatar: state.avatar,
      }),
      migrate: (persisted) => sanitizeDraft(persisted),
      merge: (persisted, current) => ({ ...current, ...sanitizeDraft(persisted) }),
    },
  ),
);

export function readDraft(): DraftData {
  const state = useDraft.getState();
  return {
    surname: state.surname,
    dreamNumber: state.dreamNumber,
    foot: state.foot,
    nationality: state.nationality,
    position: state.position,
    avatar: state.avatar,
  };
}
