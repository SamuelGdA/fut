import { type AvatarConfig, randomAvatar } from "@craque/art";
import { generatedParts } from "@craque/content";
import { type CareerSetup, DEFAULT_START_YEAR, type Difficulty, drawTalent, type Pace, POSITIONS, PRESTIGE_NUMBERS, stream, type TalentBand } from "@craque/engine";
import { PLAYABLE_COUNTRIES } from "@craque/world";
import { upperName } from "../../i18n/format";
import type { Locale } from "../../i18n/types";
import { type DraftData, type Foot, SURNAME_MAX } from "./draft";

/**
 * Como uma carreira nasce no navegador (GDD 3.3): a semente junta o instante
 * da criação com um componente aleatório, e o ano é o corrente.
 */

function randomInt(max: number): number {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return (buffer[0] ?? 0) % max;
  }
  return Math.floor(Math.random() * max);
}

function pick<T>(list: readonly T[]): T {
  const value = list[randomInt(list.length)];
  if (value === undefined) throw new Error("CRAQUE: lista vazia no sorteio");
  return value;
}

export function newSeed(): string {
  const random = Array.from({ length: 2 }, () => randomInt(36 ** 4).toString(36).padStart(4, "0")).join("");
  return `${Date.now().toString(36)}-${random}`;
}

/**
 * D108, D109: a primeira carreira de quem chega ao jogo nasce Craque ou
 * Estrela. O talento sai só da semente e da dificuldade (o mesmo fluxo de
 * `createPlayer`), então basta sortear a semente de novo; o save continua
 * sendo a semente e as escolhas.
 */
export const FIRST_CAREER_TRIES = 64;
export const FIRST_CAREER_TALENTS: readonly TalentBand[] = ["class", "star"];

export function firstCareerSeed(difficulty: Difficulty, next: () => string = newSeed): string {
  let seed = next();
  for (let attempt = 1; attempt < FIRST_CAREER_TRIES && !FIRST_CAREER_TALENTS.includes(drawTalent(stream(seed, "birth", "talent"), difficulty)); attempt++) seed = next();
  return seed;
}

/** O ano corrente, preso ao mundo do jogo (que começa em 2026) e ao limite do motor. */
export function currentStartYear(now: Date = new Date()): number {
  const year = now.getFullYear();
  return Math.min(2100, Math.max(DEFAULT_START_YEAR, year));
}

export interface NewCareerInput {
  readonly draft: DraftData;
  readonly pace: Pace;
  readonly difficulty: Difficulty;
  readonly locale: Locale;
  /** D108: a primeira carreira do jogador no aparelho. */
  readonly first?: boolean;
}

/** O setup da carreira a partir do rascunho confirmado. Rascunho incompleto é erro de quem chamou. */
export function setupFromDraft({ draft, pace, difficulty, locale, first = false }: NewCareerInput): CareerSetup {
  if (!draft.nationality || !draft.position) throw new Error("CRAQUE: rascunho incompleto");
  return {
    seed: first ? firstCareerSeed(difficulty) : newSeed(),
    startYear: currentStartYear(),
    pace,
    difficulty,
    identity: {
      surname: upperName(draft.surname, locale).slice(0, SURNAME_MAX),
      foot: draft.foot,
      nationality: draft.nationality,
      position: draft.position,
      dreamNumber: draft.dreamNumber,
    },
  };
}

/**
 * Jogo rápido (GDD 6.1): identidade e aparência sorteadas. O sobrenome sai da
 * cultura do país sorteado, como os nomes da geração futura.
 */
export function quickDraft(locale: Locale): DraftData {
  const nationality = pick(PLAYABLE_COUNTRIES);
  const position = pick(POSITIONS);
  const surname = upperName(generatedParts(`rapido|${newSeed()}`, nationality).last, locale).slice(0, SURNAME_MAX);
  const foot: Foot = randomInt(4) === 0 ? "left" : "right";
  const dreamNumber = randomInt(2) === 0 ? null : pick(PRESTIGE_NUMBERS[position]);
  const avatar: AvatarConfig = randomAvatar();
  return { surname, dreamNumber, foot, nationality, position, avatar };
}
