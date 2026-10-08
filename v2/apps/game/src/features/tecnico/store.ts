import type { AvatarConfig } from "@craque/art";
import { coachAchievementsMet, coachAchievementText } from "@craque/content/coach";
import { type CoachCareer, type CoachCommand, type CoachMode, coachCommand, createCoachCareer, type WorldData } from "@craque/engine/coach";
import type { CountryCode } from "@craque/world";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";
import { create } from "zustand";
import { usePrefs } from "../../store/prefs";
import { useHall } from "../hall/store";
import { useUnlocks } from "../hall/unlocks";
import { useTecnicoPresence } from "./presence";

/**
 * A carreira do Técnico (GDD 56), só em memória (D51): nenhum save, nenhum
 * banco, nada no armazenamento. Recarregar ou fechar a aba encerra a
 * carreira; a tela avisa antes de começar e antes de sair. Este módulo é o
 * único que carrega o motor do Técnico e os elencos, e só entra quando o
 * jogador começa.
 *
 * Cada comando passa pelo motor (`coachCommand`), que devolve um estado novo
 * ou recusa sem mudar nada. Os comandos que simulam (simular, decisão no meio
 * do jogo, avaliação) levam perto de um segundo: a tela pinta o aviso de
 * "simulando" antes de começar.
 */

const WORLD: WorldData = { players: SQUAD_PLAYERS, free: FREE_PLAYERS };

/** Comandos que simulam dias de jogo ou viram a temporada. */
const HEAVY: ReadonlySet<CoachCommand["type"]> = new Set(["simulate", "chooseMatchEvent", "decide", "acceptOffer"]);

/** Chave de sessão só para os testes ponta a ponta fixarem a semente. */
const E2E_SEED_KEY = "futeiros.e2e.seed";

function newSeed(): string {
  try {
    const fixed = window.sessionStorage.getItem(E2E_SEED_KEY);
    if (fixed) return fixed;
  } catch {
    // Sem sessionStorage (modo privado estrito): segue com a semente sorteada.
  }
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export interface StartInput {
  readonly name: string;
  readonly nationality: CountryCode;
  readonly mode: CoachMode;
  readonly avatar: AvatarConfig | null;
}

interface TecnicoState {
  career: CoachCareer | null;
  avatar: AvatarConfig | null;
  /** Simulando: a tela mostra o aviso e bloqueia novos comandos. */
  busy: boolean;
  /** Último comando recusado (código do motor), para a tela avisar. */
  lastError: string | null;
  start(input: StartInput): void;
  /** Aplica um comando na hora. Devolve o código do erro, ou `null`. */
  run(command: CoachCommand): string | null;
  /** Comando pesado: pinta o aviso, espera o quadro e roda. */
  runHeavy(command: CoachCommand): Promise<string | null>;
  /** Encerra a carreira em memória (abandonar ou começar outra). */
  abandon(): void;
}

function publish(career: CoachCareer | null): void {
  useTecnicoPresence.getState().set({
    active: career !== null,
    club: career?.coach?.club ?? null,
    year: career?.year ?? null,
    ended: career?.phase === "ended",
  });
}

/** Conquistas do Técnico que caíram com este estado (D54). */
function unlockAchievements(career: CoachCareer): void {
  const ids = coachAchievementsMet(career);
  if (ids.length === 0) return;
  const known = new Set(useHall.getState().achievements.map((row) => row.id));
  const fresh = ids.filter((id) => !known.has(id));
  if (fresh.length === 0) return;
  const locale = usePrefs.getState().locale;
  const by = career.setup.identity.name.slice(0, 16);
  void useHall.getState().unlock(fresh.map((id) => ({ id, at: Date.now(), by })));
  useUnlocks.getState().push(fresh.map((id) => ({ id, ...coachAchievementText(locale, id) })));
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export const useTecnico = create<TecnicoState>()((set, get) => ({
  career: null,
  avatar: null,
  busy: false,
  lastError: null,

  start(input) {
    const career = createCoachCareer(
      { seed: newSeed(), startYear: 2026, mode: input.mode, identity: { name: input.name.trim(), nationality: input.nationality } },
      WORLD,
    );
    set({ career, avatar: input.avatar, lastError: null, busy: false });
    publish(career);
  },

  run(command) {
    const career = get().career;
    if (!career || get().busy) return "busy";
    const result = coachCommand(career, command);
    if (result.error) {
      set({ lastError: result.error });
      return result.error;
    }
    const historyBefore = career.history.length;
    set({ career: result.career, lastError: null });
    publish(result.career);
    if (result.career.history.length !== historyBefore || result.career.phase === "ended") unlockAchievements(result.career);
    return null;
  },

  async runHeavy(command) {
    if (!HEAVY.has(command.type)) return get().run(command);
    if (get().busy) return "busy";
    set({ busy: true });
    await nextFrame();
    set({ busy: false });
    return get().run(command);
  },

  abandon() {
    set({ career: null, avatar: null, busy: false, lastError: null });
    publish(null);
  },
}));
