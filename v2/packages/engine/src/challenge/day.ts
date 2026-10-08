/**
 * O dia do Desafio (GDD 27.1): o identificador é a data em UTC, `AAAA-MM-DD`.
 * Todo mundo no planeta vê o mesmo dia ao mesmo tempo, e ele vira exatamente
 * na meia-noite UTC, não na meia-noite de quem joga.
 *
 * O motor nunca lê o relógio (D4): quem chama passa o instante, em
 * milissegundos desde a época. A conta de calendário é feita com inteiros
 * (o algoritmo civil de dias ↔ data), sem `Date`.
 */

export const DAY_MS = 86_400_000;
const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Dias desde 1970-01-01 para uma data do calendário gregoriano proléptico. */
function daysFromCivil(year: number, month: number, day: number): number {
  const y = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(y / 400);
  const yearOfEra = y - era * 400;
  const dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

/** A data do calendário para os dias desde 1970-01-01. */
function civilFromDays(days: number): [year: number, month: number, day: number] {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const dayOfEra = z - era * 146097;
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const shifted = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * shifted + 2) / 5) + 1;
  const month = shifted + (shifted < 10 ? 3 : -9);
  return [yearOfEra + era * 400 + (month <= 2 ? 1 : 0), month, day];
}

const pad = (value: number, size: number) => String(value).padStart(size, "0");

function idOfDays(days: number): string {
  const [year, month, day] = civilFromDays(days);
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

/** O identificador do dia em UTC para um instante (milissegundos desde a época). */
export function challengeDayId(instant: number): string {
  return idOfDays(Math.floor(instant / DAY_MS));
}

/** O texto é um dia válido do calendário (não aceita 2026-02-30). */
export function isChallengeDayId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = PATTERN.exec(value);
  if (!match) return false;
  const days = daysFromCivil(Number(match[1]), Number(match[2]), Number(match[3]));
  return idOfDays(days) === value;
}

/** Dias inteiros desde 1970-01-01: decide qual missão fica escondida (GDD 27.2). */
export function daysSinceEpoch(id: string): number {
  if (!isChallengeDayId(id)) throw new Error(`desafio: dia inválido ${id}`);
  return daysFromCivil(Number(id.slice(0, 4)), Number(id.slice(5, 7)), Number(id.slice(8, 10)));
}

/** Meia-noite UTC do dia, em milissegundos desde a época. */
export function challengeDayStart(id: string): number {
  return daysSinceEpoch(id) * DAY_MS;
}

/** O próximo instante de virada (a próxima meia-noite UTC) depois de `instant`. */
export function nextChallengeAt(instant: number): number {
  return (Math.floor(instant / DAY_MS) + 1) * DAY_MS;
}

/** O dia `days` dias depois (ou antes, se negativo). */
export function shiftChallengeDay(id: string, days: number): string {
  return idOfDays(daysSinceEpoch(id) + days);
}

/** O ano do dia: o ano em que a carreira do desafio começa (GDD 3.3). */
export function challengeYear(id: string): number {
  if (!isChallengeDayId(id)) throw new Error(`desafio: dia inválido ${id}`);
  return Number(id.slice(0, 4));
}
