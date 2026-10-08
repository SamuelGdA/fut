import { getCountry } from "@craque/world";
import { createPlayer } from "../player/player";
import { POSITIONS } from "../player/positions";
import { CHALLENGE_RETIRE_AGE, DIFFICULTIES, FIRST_AGE, PACES } from "../types";
import { ENGINE_VERSION } from "../version";
import { createWorld } from "../world/season";
import { baseDecision } from "./decisions";
import { planAgenda } from "./events";
import { appendLog } from "./log";
import { CareerError, resolveChoice, type Step } from "./resolve";
import type { Career, CareerSave, CareerSetup, Choice } from "./types";

/**
 * A API da carreira. Tudo que a interface e o terminal precisam:
 *
 * - `createCareer(setup)`: o jogador nasce, o mundo aquece e a primeira
 *   decisão (três clubes) já vem pronta;
 * - `choose(career, choice)`: resolve a escolha, simula o período e devolve a
 *   carreira com a próxima decisão, mais os avisos da revelação;
 * - `saveOf` e `replay`: o save é o setup mais as escolhas (GDD 34.2), e a
 *   carreira inteira sai do replay, igual, sempre (invariante 5).
 */

export const SAVE_VERSION = 1;

/** O ano em que a carreira começa, se o setup não disser. */
export const DEFAULT_START_YEAR = 2026;

function invalid(message: string): never {
  throw new CareerError("replay", `setup inválido: ${message}`);
}

/** Recusa um setup que o motor não saberia jogar. */
export function validateSetup(setup: CareerSetup): void {
  if (setup.seed.trim().length === 0) invalid("semente vazia");
  if (!Number.isInteger(setup.startYear) || setup.startYear < 1990 || setup.startYear > 2100) invalid(`ano ${setup.startYear}`);
  if (!PACES.includes(setup.pace)) invalid(`ritmo ${setup.pace}`);
  if (!DIFFICULTIES.includes(setup.difficulty)) invalid(`dificuldade ${setup.difficulty}`);
  const { identity } = setup;
  if (!POSITIONS.includes(identity.position)) invalid(`posição ${identity.position}`);
  if (!getCountry(identity.nationality)) invalid(`país ${identity.nationality}`);
  if (identity.dreamNumber !== null && (!Number.isInteger(identity.dreamNumber) || identity.dreamNumber < 1 || identity.dreamNumber > 99)) {
    invalid(`número dos sonhos ${identity.dreamNumber}`);
  }
}

export function createCareer(setup: CareerSetup): Career {
  validateSetup(setup);
  const player = createPlayer({ seed: setup.seed, position: setup.identity.position, difficulty: setup.difficulty });
  const career: Career = {
    setup,
    world: createWorld(setup.seed, setup.startYear),
    player,
    nationality: setup.identity.nationality,
    age: FIRST_AGE,
    contract: null,
    bonds: {},
    blocked: [],
    refused: [],
    focus: null,
    focusAge: null,
    loans: 0,
    agenda: planAgenda(setup.seed, setup.pace),
    eventsSeen: [],
    injuryEvents: 0,
    pending: { modifiers: {}, laterCapacity: 0, suspension: 0 },
    marketBonus: 0,
    proving: false,
    firstCapAge: null,
    homageUsed: false,
    history: [],
    log: [],
    decision: null,
    decisionCount: 0,
    end: null,
    choices: [],
    quit: false,
  };
  return baseDecision(career);
}

/** Resolve uma escolha. Escolha velha, opção inexistente ou carreira encerrada lançam `CareerError`. */
export function choose(career: Career, choice: Choice): Step {
  return resolveChoice(career, choice);
}

/**
 * "Encerrar carreira" está à mão agora? Só depois da primeira temporada
 * jogada (uma carreira de zero jogos não é carreira) e, no desafio, só a
 * partir dos 27.
 */
export function canRetireNow(career: Career): boolean {
  if (career.end || career.history.length === 0) return false;
  return !career.setup.challengeId || career.age >= CHALLENGE_RETIRE_AGE;
}

/**
 * Encerra a carreira na hora (GDD 5, "Encerrar carreira"): aposentadoria
 * voluntária fora de qualquer decisão. O save guarda isso em `quit`, para o
 * replay terminar no mesmo ponto. No desafio, só a partir dos 27.
 */
export function retireNow(career: Career): Career {
  if (career.end) throw new CareerError("ended", "a carreira já terminou");
  if (career.history.length === 0) throw new CareerError("stale", "a carreira ainda não jogou a primeira temporada");
  if (!canRetireNow(career)) throw new CareerError("stale", `no desafio, aposentar só a partir dos ${CHALLENGE_RETIRE_AGE}`);
  const ended: Career = { ...career, decision: null, end: { reason: "voluntary", age: career.age }, quit: true };
  return appendLog(ended, [{ kind: "retired", reason: "voluntary", age: career.age, year: career.world.year }]);
}

export function saveOf(career: Career): CareerSave {
  const save: CareerSave = { v: SAVE_VERSION, engine: ENGINE_VERSION, setup: career.setup, choices: career.choices };
  return career.quit ? { ...save, quit: true } : save;
}

/**
 * Refaz a carreira a partir do save. Um save de outra versão do motor daria
 * outra carreira, então é recusado aqui; a interface abre esses em modo
 * leitura com o resumo guardado.
 */
export function replay(save: CareerSave): Career {
  if (save.v !== SAVE_VERSION) throw new CareerError("version", `save versão ${String(save.v)}, esperado ${SAVE_VERSION}`);
  if (save.engine !== ENGINE_VERSION) {
    throw new CareerError("version", `save do motor ${save.engine}, este é o ${ENGINE_VERSION}`);
  }
  let career = createCareer(save.setup);
  save.choices.forEach((choice, index) => {
    try {
      career = resolveChoice(career, choice).career;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new CareerError("replay", `escolha ${index + 1} de ${save.choices.length} não confere: ${detail}`);
    }
  });
  if (save.quit) {
    if (career.end) throw new CareerError("replay", "o save diz que a carreira foi encerrada, mas ela já tinha terminado");
    career = retireNow(career);
  }
  return career;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Lê um save vindo de fora (arquivo, localStorage) sem confiar no formato. */
export function parseSave(value: unknown): CareerSave {
  if (!isRecord(value)) throw new CareerError("replay", "save não é um objeto");
  const { v, engine, setup, choices, quit } = value;
  if (typeof v !== "number") throw new CareerError("replay", "save sem versão");
  if (typeof engine !== "string") throw new CareerError("replay", "save sem versão do motor");
  if (!isRecord(setup) || !isRecord(setup.identity)) throw new CareerError("replay", "save sem setup");
  if (!Array.isArray(choices)) throw new CareerError("replay", "save sem escolhas");
  if (quit !== undefined && quit !== true) throw new CareerError("replay", "campo quit inválido no save");
  for (const choice of choices) {
    if (!isRecord(choice) || typeof choice.decision !== "number" || typeof choice.option !== "string") {
      throw new CareerError("replay", "escolha malformada no save");
    }
  }
  return value as unknown as CareerSave;
}
