import { stream, type Rng } from "../rng";
import { CALENDAR_DAYS } from "./tuning";

/** Pequenas funções do Técnico usadas em todo lado. */

/** FNV-1a de 32 bits: número estável a partir de um texto (sem consumir sorteio). */
export function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193) >>> 0;
  }
  return value >>> 0;
}

/** Número em [0, 1) fixo para um texto. */
export function unit(text: string): number {
  return hash(text) / 4294967296;
}

/** Fluxo do Técnico: todo sorteio passa por aqui, com rótulo e partes. */
export function coachRng(seed: string, label: string, ...parts: ReadonlyArray<string | number>): Rng {
  return stream(seed, "coach", label, ...parts);
}

export function sum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

export function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Dia absoluto (temporada × 365 + dia) a partir do índice da temporada. */
export function absDay(seasonIndex: number, day: number): number {
  return seasonIndex * (CALENDAR_DAYS.season + CALENDAR_DAYS.offseason) + day;
}

export function seasonLength(): number {
  return CALENDAR_DAYS.season + CALENDAR_DAYS.offseason;
}

/** Ordena por chave numérica decrescente com desempate pelo id (determinístico). */
export function byDesc<T>(key: (item: T) => number, id: (item: T) => string): (a: T, b: T) => number {
  return (a, b) => key(b) - key(a) || id(a).localeCompare(id(b));
}

/** Próxima potência de 2 maior ou igual a n. */
export function nextPow2(n: number): number {
  let value = 1;
  while (value < n) value *= 2;
  return value;
}

export function stageKey(year: number, half: number): string {
  return `${year}:${half}`;
}
