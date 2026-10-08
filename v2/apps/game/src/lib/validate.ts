/**
 * Validadores mínimos para dados vindos do armazenamento (GDD 34.3). Cada um
 * recebe um valor desconhecido e devolve o valor tipado ou o padrão do campo:
 * nada que venha do disco derruba o jogo.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function intInRange(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

export function text(value: unknown, maxLength: number, fallback: string): string {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}
