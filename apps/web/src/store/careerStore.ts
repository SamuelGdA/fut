import { create } from "zustand";
import { ALL_POSITIONS, ROLE_POSITIONS } from "@/lib/sim/constants";
import { attributeKeysFor } from "@/lib/sim/attributes";
import { getCountryByIso } from "@/lib/data/dataset";
import { DEBUG_TOOLS_ENABLED } from "@/lib/debugTools";
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
  retireNow,
  startCareer,
  type CareerState,
  type Identity,
} from "@/lib/sim/career";
import type { CareerEventKey } from "@/lib/sim/careerEvents";
import type { Difficulty, GameMode, PersonalityTrait, PositionCode, TalentTier } from "@/lib/sim/constants";
import {
  ACCESSORY_STYLES,
  BEARD_STYLES,
  DEFAULT_AVATAR,
  EYEBROW_STYLES,
  EYE_COLORS,
  EYE_SHAPES,
  HAIR_COLORS,
  HAIR_STYLES,
  MOLE_SPOTS,
  MOUTH_STYLES,
  NOSE_SHAPES,
  SKIN_TONES,
  type AvatarConfig,
} from "@/lib/avatar/config";
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

/** Volume steps the UI offers, from silent to full. */
export const VOLUME_STEPS: number[] = [0, 0.25, 0.5, 0.75, 1];

interface CareerStore {
  screen: Screen;
  mode: GameMode;
  difficulty: Difficulty;
  draft: DraftIdentity;
  career: CareerState | null;
  /** Set while the current career is a daily-challenge run, null otherwise. */
  challengeId: string | null;
  soundEnabled: boolean;
  /** 0–1 master level for the synth kit; separate from the mute toggle so
   *  unmuting restores whatever level the player had chosen. */
  volume: number;
  /** Always starts "dark" for a new visitor — this is an opt-in toggle, not a system-preference mirror. */
  theme: Theme;
  /**
   * Repaints the semantic palette onto a blue/orange axis and turns on the
   * text and glyph redundancy, for players who can't rely on the green/red
   * pair the game normally uses.
   */
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  goToIdentity: () => void;
  goToIntro: () => void;
  goToAppearance: () => void;
  updateDraft: (patch: Partial<DraftIdentity>) => void;
  setAvatar: (avatar: AvatarConfig | null) => void;
  toggleSound: () => void;
  setVolume: (volume: number) => void;
  toggleTheme: () => void;
  /** Abandons whatever is on screen and returns to the front page. */
  goHome: () => void;
  confirmIdentity: () => void;
  goToChallenge: () => void;
  startChallenge: () => void;
  choose: (optionId: string) => void;
  viewSummary: () => void;
  giveUpCareer: () => void;
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

/**
 * The avatar is the deepest thing that survives a reload, and every style
 * field is a lookup key into a path table. One unknown key — from an older
 * build, a removed style, or an edited local storage entry — threw inside the
 * SVG and took the first screen down with no way back except clearing data.
 *
 * Anything that does not match the current option lists falls back to the
 * default for that field, so a stale avatar degrades to a plausible face
 * instead of a crash.
 */
function sanitizeAvatar(avatar: unknown): AvatarConfig | null {
  if (!avatar || typeof avatar !== "object") return null;
  const raw = avatar as Record<string, unknown>;
  const pick = <T extends string>(key: string, options: readonly T[], fallback: T): T =>
    options.includes(raw[key] as T) ? (raw[key] as T) : fallback;
  const num = (key: string, fallback: number, max: number): number => {
    const v = raw[key];
    return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max ? v : fallback;
  };
  return {
    ...DEFAULT_AVATAR,
    skin: num("skin", DEFAULT_AVATAR.skin, SKIN_TONES.length - 1),
    hair: pick("hair", HAIR_STYLES, DEFAULT_AVATAR.hair),
    hairColor: num("hairColor", DEFAULT_AVATAR.hairColor, HAIR_COLORS.length - 1),
    eyebrows: pick("eyebrows", EYEBROW_STYLES, DEFAULT_AVATAR.eyebrows),
    eyeShape: pick("eyeShape", EYE_SHAPES, DEFAULT_AVATAR.eyeShape),
    eyes: num("eyes", DEFAULT_AVATAR.eyes, EYE_COLORS.length - 1),
    nose: pick("nose", NOSE_SHAPES, DEFAULT_AVATAR.nose),
    mouth: pick("mouth", MOUTH_STYLES, DEFAULT_AVATAR.mouth),
    beard: pick("beard", BEARD_STYLES, DEFAULT_AVATAR.beard),
    beardColor: num("beardColor", DEFAULT_AVATAR.beardColor, HAIR_COLORS.length - 1),
    mole: pick("mole", MOLE_SPOTS, DEFAULT_AVATAR.mole),
    accessory: pick("accessory", ACCESSORY_STYLES, DEFAULT_AVATAR.accessory),
    accessoryColor: num("accessoryColor", DEFAULT_AVATAR.accessoryColor, 20),
    freckles: typeof raw.freckles === "boolean" ? raw.freckles : DEFAULT_AVATAR.freckles,
  };
}

/**
 * A structural check on a persisted `CareerState`.
 *
 * localStorage is user-writable and outlives upgrades, so a save can arrive
 * hand-edited, truncated, or written by an older build that had fewer fields.
 * Anything that gets past here is trusted as-is and handed straight to the
 * simulation and the screens, so the guard has to cover every field those
 * dereference without a fallback — a save that is accepted and *then* throws
 * is the worst outcome available, because it is reloaded on every visit and
 * the player has to find the recovery button to escape it.
 *
 * Optional fields added later (`betrayedClubs`, `clubFanMemory`) are read
 * defensively at their use sites and deliberately not required here, so an
 * older save still resumes.
 */
/** The five roles the simulation knows how to score a season for. */
const VALID_ROLES: string[] = Object.keys(ROLE_POSITIONS);

function isPlausibleCareer(value: unknown): value is CareerState {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;

  if (typeof c.seed !== "string" || !c.seed) return false;
  if (c.phase !== "career" && c.phase !== "summary") return false;
  if (!c.identity || typeof c.identity !== "object") return false;

  // Both index straight into config tables the moment a period is simulated.
  if (c.mode !== "long" && c.mode !== "normal") return false;
  if (c.difficulty !== "hard" && c.difficulty !== "normal") return false;

  const rng = c.rng as Record<string, unknown> | undefined;
  if (!rng || typeof rng.seed !== "string" || !Number.isFinite(rng.state)) return false;

  const player = c.player as Record<string, unknown> | undefined;
  if (!player || typeof player !== "object") return false;
  if (!Number.isFinite(player.age) || !Number.isFinite(player.overall)) return false;
  if (!ALL_POSITIONS.includes(player.position as PositionCode)) return false;
  if (typeof player.role !== "string" || !VALID_ROLES.includes(player.role)) return false;
  const attributes = player.attributes as Record<string, unknown> | undefined;
  if (!attributes || typeof attributes !== "object") return false;
  // Every attribute the position's card prints has to be a real number, or
  // the OVR maths silently produces NaN and the whole card renders blank.
  for (const key of attributeKeysFor(player.position as PositionCode)) {
    if (!Number.isFinite(attributes[key])) return false;
  }
  const nationality = player.nationality as Record<string, unknown> | undefined;
  if (!nationality || !getCountryByIso(String(nationality.iso_alpha2 ?? ""))) return false;

  // Season history: the table, the timeline, the biography and the newspaper
  // all walk this, and every one of them reads `stats` without checking.
  if (!Array.isArray(c.seasons)) return false;
  for (const season of c.seasons) {
    if (!season || typeof season !== "object") return false;
    const st = (season as Record<string, unknown>).stats;
    if (!st || typeof st !== "object") return false;
    if (!Number.isFinite((st as Record<string, unknown>).appearances)) return false;
    if (!Array.isArray((season as Record<string, unknown>).trophies)) return false;
    if (!Array.isArray((season as Record<string, unknown>).awards)) return false;
  }

  // Collections the simulation spreads into or iterates without a fallback.
  if (!Array.isArray(c.headlines)) return false;
  if (!c.nationalTeamStats || typeof c.nationalTeamStats !== "object") return false;
  if (!c.teamTierOverrides || typeof c.teamTierOverrides !== "object") return false;
  if (!c.teamReputationOverrides || typeof c.teamReputationOverrides !== "object") return false;
  if (!c.careerEventPlan || typeof c.careerEventPlan !== "object") return false;

  // A career mid-play must have a decision on screen, or every screen that
  // renders one (DecisionPanel chief among them) has nothing to show.
  if (c.phase === "career") {
    const event = c.currentEvent as Record<string, unknown> | undefined;
    if (!event || typeof event !== "object") return false;
    if (!Array.isArray(event.options) || event.options.length === 0) return false;
  }

  return true;
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
      volume: 0.75,
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
      // Dragging the slider off zero is itself an unmute — otherwise the
      // player raises the volume and still hears nothing.
      setVolume: (volume) => {
        const clamped = Math.min(1, Math.max(0, volume));
        set({ volume: clamped, soundEnabled: clamped > 0 });
      },
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      goHome: () => set({ screen: "intro", career: null, challengeId: null }),

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
          // Deciding when to stop is part of the challenge, so a challenge
          // career can be ended on the player's terms.
          career: startCareer(challenge.seed, CHALLENGE_MODE, identity, CHALLENGE_DIFFICULTY, {
            allowEarlyRetirement: true,
          }),
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

      /**
       * Ends the career here and goes straight to the summary. Unlike
       * `goHome` this keeps everything that was played — the player is
       * retiring, not throwing the save away — so it skips the
       * career-ended interstitial and shows the story they just chose to
       * stop writing.
       */
      giveUpCareer: () => {
        const { career } = get();
        if (!career || career.phase !== "career") return;
        set({ career: retireNow(career), screen: "summary" });
      },

      // Keeps the last identity and avatar, and skips straight past the intro.
      replay: () => set({ screen: "identity", career: null, challengeId: null }),

      debugAdjustOverall: (delta) => {
        if (!DEBUG_TOOLS_ENABLED) return;
        const { career } = get();
        if (!career) return;
        set({ career: debugAdjustOverall(career, delta) });
      },
      debugForceTransfer: () => {
        if (!DEBUG_TOOLS_ENABLED) return;
        const { career } = get();
        if (!career) return;
        set({ career: debugForceTransfer(career) });
      },
      debugForceEvent: (eventKey) => {
        if (!DEBUG_TOOLS_ENABLED) return;
        const { career } = get();
        if (!career) return;
        set({ career: debugForceEvent(career, eventKey) });
      },
      debugSkipDecision: () => {
        if (!DEBUG_TOOLS_ENABLED) return;
        const { career } = get();
        if (!career) return;
        set({ career: debugSkipDecision(career) });
      },
      debugSetTrait: (trait) => {
        if (!DEBUG_TOOLS_ENABLED) return;
        const { career } = get();
        if (!career) return;
        set({ career: debugSetTrait(career, trait) });
      },
      debugSetTalentTier: (tier) => {
        if (!DEBUG_TOOLS_ENABLED) return;
        const { career } = get();
        if (!career) return;
        set({ career: debugSetTalentTier(career, tier) });
      },
      debugAdjustFanSupport: (delta) => {
        if (!DEBUG_TOOLS_ENABLED) return;
        const { career } = get();
        if (!career) return;
        set({ career: debugAdjustFanSupport(career, delta) });
      },
      debugForceRival: () => {
        if (!DEBUG_TOOLS_ENABLED) return;
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
      //
      // v2 started persisting the in-progress career itself (see partialize
      // below) — an older save simply lacks the key, which `merge` already
      // treats as "no career in progress", so there is nothing to transform.
      version: 2,
      migrate: (persisted, version) => {
        // Nothing older is worth salvaging: only preferences and an unfinished
        // draft live here, and a fresh draft costs the player one screen.
        if (version < 1) return undefined;
        return persisted as never;
      },
      /**
       * A persisted draft can name a position or a country that this build no
       * longer has — after a dataset change, or because someone edited local
       * storage. Rendering from it threw on the very first screen and the only
       * way out was the error boundary's "clear data" button, so anything that
       * does not resolve against the current dataset is dropped back to null
       * and the player simply picks again.
       */
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<CareerStore>) };
        const draft = merged.draft;
        const safeDraft =
          !draft || typeof draft !== "object"
            ? emptyDraft
            : {
                ...emptyDraft,
                ...draft,
                lastName: typeof draft.lastName === "string" ? draft.lastName.slice(0, 16) : "",
                foot: draft.foot === "left" || draft.foot === "right" ? draft.foot : "right",
                countryIso:
                  draft.countryIso && getCountryByIso(draft.countryIso) ? draft.countryIso : null,
                position:
                  draft.position && ALL_POSITIONS.includes(draft.position) ? draft.position : null,
                avatar: sanitizeAvatar(draft.avatar),
              };

        // The in-progress career survives a reload now (see partialize below),
        // which means a corrupt or foreign-shaped one has to be caught here
        // instead of blowing up the first render after F5. Anything that
        // doesn't look like a real CareerState is treated as "no career" —
        // the player lands on the intro screen and starts fresh, same as if
        // they had never had one, rather than staring at the error boundary.
        const career = isPlausibleCareer(merged.career) ? merged.career : null;
        // A screen only makes sense alongside the state it displays: "career"
        // and "summary" both need a career object, "appearance" needs a draft
        // that made it that far. If the career failed validation above, or the
        // screen value itself is unknown, fall back to intro rather than
        // rendering a screen with nothing behind it.
        const validScreens: Screen[] = ["intro", "identity", "appearance", "career", "summary", "challenge"];
        const needsCareer: Screen[] = ["career", "summary"];
        const screen =
          typeof merged.screen === "string" &&
          (validScreens as string[]).includes(merged.screen) &&
          !(needsCareer.includes(merged.screen as Screen) && !career)
            ? (merged.screen as Screen)
            : "intro";

        return {
          ...merged,
          // These index straight into config tables (MODE_CONFIG, DIFFICULTY_CONFIG)
          // the moment a career starts, so an unknown value is a crash waiting
          // for the confirm button rather than a cosmetic problem.
          mode: merged.mode === "long" || merged.mode === "normal" ? merged.mode : "normal",
          difficulty:
            merged.difficulty === "hard" || merged.difficulty === "normal" ? merged.difficulty : "normal",
          theme: merged.theme === "light" || merged.theme === "dark" ? merged.theme : "dark",
          soundEnabled: typeof merged.soundEnabled === "boolean" ? merged.soundEnabled : true,
          volume:
            typeof merged.volume === "number" && Number.isFinite(merged.volume)
              ? Math.min(1, Math.max(0, merged.volume))
              : 0.75,
          draft: safeDraft,
          career,
          screen,
          challengeId: career && typeof merged.challengeId === "string" ? merged.challengeId : null,
        };
      },
      partialize: (state) => ({
        draft: state.draft,
        soundEnabled: state.soundEnabled,
        volume: state.volume,
        mode: state.mode,
        difficulty: state.difficulty,
        theme: state.theme,
        // The whole point: a reload (or a browser restart) must resume the
        // career exactly where it was, not throw it away. Only the screens
        // that show a career are worth remembering — "identity"/"appearance"
        // are one form away from a fresh start, so there is nothing there
        // worth surviving a reload for, and re-persisting them would mean a
        // half-filled name field outliving the tab that typed it.
        career: state.screen === "career" || state.screen === "summary" ? state.career : null,
        screen: state.screen === "career" || state.screen === "summary" ? state.screen : "intro",
        challengeId: state.screen === "career" || state.screen === "summary" ? state.challengeId : null,
      }),
    },
  ),
);
