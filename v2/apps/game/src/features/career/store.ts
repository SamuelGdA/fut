import type { AvatarConfig } from "@craque/art";
import {
  attributesAt,
  canRetireNow,
  type Career,
  CareerError,
  type CareerSave,
  type CareerSetup,
  choose,
  createCareer,
  createPlayer,
  FIRST_AGE,
  ovrAt,
  replay,
  retireNow,
  saveOf,
} from "@craque/engine";
import { create } from "zustand";
import { archiveId } from "../hall/model";
import { archiveSavedCareer, challengeOf, recordFinished, recordInterrupted, recordStep } from "../hall/session";
import { useUnlocks } from "../hall/unlocks";
import { buildPlay, type PlaySession, seasonPlay } from "./play";
import { readSave, recordOf } from "./save";
import { type AlternateLine, clearSave, type SaveScreen, type SaveSnapshot, writeSave } from "./saveRecord";

/**
 * A carreira em andamento, ligada ao motor, ao save e ao Hall da Fama. A
 * carreira inteira vive em memória; no disco fica só o replay (GDD 34.2).
 * Cada escolha grava o save na hora, então fechar a aba no meio nunca perde
 * uma decisão. A carreira terminada vai para o Hall; a deixada para trás por
 * uma nova entra como interrompida (GDD 28.1). A linha alternativa de um
 * "E se...?" não entra (D43).
 */

export type CareerStatus =
  /** Ainda não leu o save. */
  | "idle"
  /** Sem carreira: nenhum save, ou o jogador descartou. */
  | "empty"
  | "ready"
  /** Save de outra versão do motor: só o retrato (modo leitura). */
  | "stale"
  /** O save não passou no replay: foi descartado e o jogo avisou. */
  | "invalid";

interface CareerState {
  status: CareerStatus;
  career: Career | null;
  avatar: AvatarConfig | null;
  /** Em que tela a carreira estava, para recarregar no mesmo lugar. */
  screen: SaveScreen;
  stale: { snapshot: SaveSnapshot; engine: string } | null;
  /** Linha alternativa de um "E se...?" (GDD 28.3), ou `null`. */
  alternate: AlternateLine | null;
  /** O lance da última jogada, mostrado na própria tela (D43). Só em memória. */
  play: PlaySession | null;
  /** Uma temporada do histórico revista no lugar do lance, ou `null`. */
  review: PlaySession | null;

  /** Lê o save e refaz a carreira. Chamar quantas vezes for: só a primeira lê. */
  hydrate(): void;
  start(setup: CareerSetup, avatar: AvatarConfig | null): void;
  /**
   * "E se...?" (GDD 28.3): uma carreira nova com o mesmo setup e as escolhas
   * de `source` até a decisão de índice `index`, continuando ao vivo dali.
   * Devolve falso se o save não refaz nesta versão do motor.
   */
  branch(source: CareerSave, avatar: AvatarConfig | null, index: number): boolean;
  /** Resolve a opção da decisão atual. Devolve falso se a escolha não serve mais (clique duplo, aba velha). */
  choose(optionId: string): boolean;
  /** Encerrar carreira (GDD 5): aposenta na hora. */
  retire(): void;
  /** A carreira terminou e o jogador abriu o resumo: recarregar volta para ele. */
  markSummary(): void;
  /** Mostra de novo, no lugar do lance, uma temporada já jogada. */
  reviewSeason(index: number): void;
  /** Volta do histórico para o lance da última jogada. */
  closeReview(): void;
  discard(): void;
}

function persist(career: Career, avatar: AvatarConfig | null, screen: SaveScreen, alternate: AlternateLine | null): void {
  writeSave(recordOf(career, avatar, screen, alternate ?? undefined));
}

/** Uma temporada do histórico, sem comemoração: a da tela recarregada ou a revista. */
function pastSeason(career: Career, index: number): PlaySession | null {
  if (!career.history[index]) return null;
  const born = createPlayer({ seed: career.setup.seed, position: career.setup.identity.position, difficulty: career.setup.difficulty });
  return seasonPlay(career, index, attributesAt(born, FIRST_AGE), Math.round(ovrAt(born, FIRST_AGE)));
}

export const useCareer = create<CareerState>()((set, get) => {
  /** A carreira de agora vai ser trocada: se estava em andamento, entra no Hall como interrompida. */
  const leaveCurrent = () => {
    const { status, career, avatar, alternate } = get();
    if (status === "ready" && career) {
      if (!career.end && alternate === null) void recordInterrupted(career, avatar, false);
      return;
    }
    // A carreira em disco ainda não foi lida (começar pelo Início ou pela Identidade).
    if (status !== "empty") void archiveSavedCareer();
  };

  const install = (career: Career, avatar: AvatarConfig | null, alternate: AlternateLine | null) => {
    persist(career, avatar, "career", alternate);
    useUnlocks.getState().hold(false);
    set({ status: "ready", career, avatar, screen: "career", stale: null, alternate, play: pastSeason(career, career.history.length - 1), review: null });
  };

  return {
    status: "idle",
    career: null,
    avatar: null,
    screen: "career",
    stale: null,
    alternate: null,
    play: null,
    review: null,

    hydrate() {
      if (get().status !== "idle") return;
      const read = readSave();
      if (read.kind === "none") {
        set({ status: "empty" });
        return;
      }
      if (read.kind === "stale") {
        set({ status: "stale", stale: { snapshot: read.snapshot, engine: read.engine } });
        return;
      }
      if (read.kind === "invalid") {
        clearSave();
        set({ status: "invalid" });
        return;
      }
      try {
        const career = replay(read.record);
        const alternate = read.record.alternate ?? null;
        // Recarregar mostra a última temporada do histórico, sem o evento e sem comemoração (invariante 23).
        const play = pastSeason(career, career.history.length - 1);
        set({ status: "ready", career, avatar: read.record.avatar, screen: read.record.screen, alternate, play, review: null });
        // Terminada e talvez ainda fora do Hall (a aba fechou no meio): arquivar é idempotente.
        if (career.end) void recordFinished(career, read.record.avatar, alternate !== null);
      } catch (error) {
        // Escolha que não confere no replay (save editado à mão): o save sai,
        // o rascunho fica (GDD 34.2).
        if (!(error instanceof CareerError)) throw error;
        clearSave();
        set({ status: "invalid", career: null });
      }
    },

    start(setup, avatar) {
      leaveCurrent();
      install(createCareer(setup), avatar, null);
    },

    branch(source, avatar, index) {
      const choice = source.choices[index];
      if (!choice || setupIsChallenge(source)) return false;
      let career: Career;
      try {
        career = replay({ v: source.v, engine: source.engine, setup: source.setup, choices: source.choices.slice(0, index) });
      } catch (error) {
        if (error instanceof CareerError) return false;
        throw error;
      }
      if (!career.decision || career.decision.id !== choice.decision) return false;
      const { career: current } = get();
      // A original já está no Hall (terminou); se é a carreira de agora, não há o que interromper.
      if (!current || archiveId(saveOf(current)) !== archiveId(source)) leaveCurrent();
      install(career, avatar, { from: archiveId(source), decision: choice.decision, original: choice.option });
      return true;
    },

    choose(optionId) {
      const { career, avatar, alternate } = get();
      const decision = career?.decision;
      const option = decision?.options.find((candidate) => candidate.id === optionId);
      if (!career || !decision || !option) return false;
      let step;
      try {
        step = choose(career, { decision: decision.id, option: option.id });
      } catch (error) {
        if (error instanceof CareerError) return false;
        throw error;
      }
      persist(step.career, avatar, "career", alternate);
      const before = challengeOf(career);
      const after = before ? challengeOf(step.career) : null;
      const play = buildPlay(career, decision, option, step, before && after ? { before, after } : undefined);
      set({ career: step.career, play: play.pages.length > 0 ? play : get().play, review: null });
      if (step.career.end) void recordFinished(step.career, avatar, alternate !== null);
      else if (alternate === null) void recordStep(step.career);
      return true;
    },

    retire() {
      const { career, avatar, alternate } = get();
      if (!career || !canRetireNow(career)) return;
      const ended = retireNow(career);
      persist(ended, avatar, "summary", alternate);
      useUnlocks.getState().hold(false);
      set({ career: ended, screen: "summary", review: null });
      void recordFinished(ended, avatar, alternate !== null);
    },

    markSummary() {
      const { career, avatar, alternate } = get();
      if (!career?.end) return;
      persist(career, avatar, "summary", alternate);
      set({ screen: "summary" });
    },

    reviewSeason(index) {
      const { career } = get();
      if (!career) return;
      // A última temporada é o próprio lance: rever ela só fecha a revisão.
      if (index === career.history.length - 1 && get().play) {
        set({ review: null });
        return;
      }
      set({ review: pastSeason(career, index) });
    },

    closeReview() {
      set({ review: null });
    },

    discard() {
      leaveCurrent();
      clearSave();
      useUnlocks.getState().hold(false);
      set({ status: "empty", career: null, avatar: null, stale: null, alternate: null, play: null, review: null, screen: "career" });
    },
  };
});

/** "E se...?" fica desligado para carreiras de desafio (GDD 28.3). */
export function setupIsChallenge(save: CareerSave): boolean {
  return typeof save.setup.challengeId === "string";
}
