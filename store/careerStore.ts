import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  chooseOption,
  debugAdjustFanSupport,
  debugAdjustOverall,
  debugForceEvent,
  debugForceRival,
  debugForceTransfer,
  debugSetTalentTier,
  debugSetTrait,
  debugSkipDecision,
  startCareer,
  type CareerState,
  type Identity,
} from "@/lib/sim/career";
import type { CareerEventKey } from "@/lib/sim/careerEvents";
import type { Difficulty, GameMode, PersonalityTrait, PositionCode, TalentTier } from "@/lib/sim/constants";
import type { AvatarConfig } from "@/lib/avatar/config";
import { CHALLENGE_DIFFICULTY, CHALLENGE_MODE, getDailyChallenge } from "@/lib/challenge/daily";

export type Screen = "intro" | "identity" | "appearance" | "career" | "summary" | "challenge";

interface DraftIdentity {
  lastName: string;
  foot: "left" | "right";
  countryIso: string | null;
  position: PositionCode | null;
  /** Null until the player opens the customiser — that's what keeps them grey. */
  avatar: AvatarConfig | null;
}

export type Theme = "dark" | "light";

interface CareerStore {
  screen: Screen;
  mode: GameMode;
  difficulty: Difficulty;
  draft: DraftIdentity;
  career: CareerState | null;
  /** Set while the current career is a daily-challenge run, null otherwise. */
  challengeId: string | null;
  soundEnabled: boolean;
  /** Always starts "dark" for a new visitor — this is an opt-in toggle, not a system-preference mirror. */
  theme: Theme;
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  goToIdentity: () => void;
  goToIntro: () => void;
  goToAppearance: () => void;
  updateDraft: (patch: Partial<DraftIdentity>) => void;
  setAvatar: (avatar: AvatarConfig | null) => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  confirmIdentity: () => void;
  goToChallenge: () => void;
  startChallenge: () => void;
  choose: (optionId: string) => void;
  viewSummary: () => void;
  replay: () => void;
  /** Dev-only: not reachable from normal play, wired only to the debug panel. */
  debugAdjustOverall: (delta: number) => void;
  debugForceTransfer: () => void;
  debugForceEvent: (eventKey: CareerEventKey) => void;
  debugSkipDecision: () => void;
  debugSetTrait: (trait: PersonalityTrait) => void;
  debugSetTalentTier: (tier: TalentTier) => void;
  debugAdjustFanSupport: (delta: number) => void;
  debugForceRival: () => void;
}

const emptyDraft: DraftIdentity = {
  lastName: "",
  foot: "right",
  countryIso: null,
  position: null,
  avatar: null,
};

export const useCareerStore = create<CareerStore>()(
  persist(
    (set, get) => ({
      screen: "intro",
      mode: "normal",
      difficulty: "normal",
      draft: emptyDraft,
      career: null,
      challengeId: null,
      soundEnabled: true,
      theme: "dark",

      setMode: (mode) => set({ mode }),
      setDifficulty: (difficulty) => set({ difficulty }),
      goToIdentity: () => set({ screen: "identity" }),
      goToIntro: () => set({ screen: "intro" }),
      goToChallenge: () => set({ screen: "challenge" }),
      goToAppearance: () => set({ screen: "appearance" }),
      updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      setAvatar: (avatar) => set((s) => ({ draft: { ...s.draft, avatar } })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      confirmIdentity: () => {
        const { draft, mode, difficulty } = get();
        if (!draft.countryIso || !draft.position || !draft.lastName.trim()) return;

        const identity: Identity = {
          lastName: draft.lastName.trim().toUpperCase(),
          foot: draft.foot,
          countryIso: draft.countryIso,
          position: draft.position,
        };

        const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        set({ career: startCareer(seed, mode, identity, difficulty), challengeId: null, screen: "career" });
      },

      /**
       * Starts today's challenge. Nationality, position, seed, pacing and
       * difficulty all come from the challenge itself — only the cosmetic
       * fields carry over from the player's draft, because anything the
       * simulation reads has to be identical for every player or the scores
       * aren't comparable.
       */
      startChallenge: () => {
        const { draft } = get();
        const challenge = getDailyChallenge();
        const identity: Identity = {
          lastName: draft.lastName.trim().toUpperCase() || "CRAQUE",
          foot: draft.foot,
          countryIso: challenge.countryIso,
          position: challenge.position,
        };
        set({
          career: startCareer(challenge.seed, CHALLENGE_MODE, identity, CHALLENGE_DIFFICULTY),
          challengeId: challenge.id,
          screen: "career",
        });
      },

      choose: (optionId) => {
        const { career } = get();
        if (!career) return;
        set({ career: chooseOption(career, optionId) });
      },

      viewSummary: () => set({ screen: "summary" }),

      // Keeps the last identity and avatar, and skips straight past the intro.
      replay: () => set({ screen: "identity", career: null, challengeId: null }),

      debugAdjustOverall: (delta) => {
        const { career } = get();
        if (!career) return;
        set({ career: debugAdjustOverall(career, delta) });
      },
      debugForceTransfer: () => {
        const { career } = get();
        if (!career) return;
        set({ career: debugForceTransfer(career) });
      },
      debugForceEvent: (eventKey) => {
        const { career } = get();
        if (!career) return;
        set({ career: debugForceEvent(career, eventKey) });
      },
      debugSkipDecision: () => {
        const { career } = get();
        if (!career) return;
        set({ career: debugSkipDecision(career) });
      },
      debugSetTrait: (trait) => {
        const { career } = get();
        if (!career) return;
        set({ career: debugSetTrait(career, trait) });
      },
      debugSetTalentTier: (tier) => {
        const { career } = get();
        if (!career) return;
        set({ career: debugSetTalentTier(career, tier) });
      },
      debugAdjustFanSupport: (delta) => {
        const { career } = get();
        if (!career) return;
        set({ career: debugAdjustFanSupport(career, delta) });
      },
      debugForceRival: () => {
        const { career } = get();
        if (!career) return;
        set({ career: debugForceRival(career) });
      },
    }),
    {
      name: "craque-save",
      // Bump whenever the persisted shape changes in a way an older save
      // can't satisfy. Without this, a browser holding a save from before a
      // field was added or removed rehydrates a half-valid draft — and the
      // avatar in particular is a deep object that would render from stale
      // keys rather than fail loudly.
      version: 1,
      migrate: (persisted, version) => {
        // Nothing older is worth salvaging: only preferences and an unfinished
        // draft live here, and a fresh draft costs the player one screen.
        if (version < 1) return undefined;
        return persisted as never;
      },
      partialize: (state) => ({
        draft: state.draft,
        soundEnabled: state.soundEnabled,
        mode: state.mode,
        difficulty: state.difficulty,
        theme: state.theme,
      }),
    },
  ),
);
