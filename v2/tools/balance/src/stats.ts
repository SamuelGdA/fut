/** Estatística descritiva mínima para o relatório. */

export function mean(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  let total = 0;
  for (const value of values) total += value;
  return total / values.length;
}

/**
 * Maior e menor valor. Um laço, e não `Math.max(...lista)`: com 100 mil
 * temporadas, espalhar a lista em argumentos estoura a pilha.
 */
export function maxOf(values: readonly number[]): number {
  let best = Number.NEGATIVE_INFINITY;
  for (const value of values) if (value > best) best = value;
  return best;
}

export function minOf(values: readonly number[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (const value of values) if (value < best) best = value;
  return best;
}

/** Quantil por interpolação linear entre vizinhos (q de 0 a 1). */
export function quantile(values: readonly number[], q: number): number {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const below = Math.floor(position);
  const above = Math.ceil(position);
  const low = sorted[below] ?? Number.NaN;
  const high = sorted[above] ?? Number.NaN;
  return low + (high - low) * (position - below);
}

export function median(values: readonly number[]): number {
  return quantile(values, 0.5);
}

/** Fração dos valores que satisfazem a condição. */
export function share<T>(values: readonly T[], predicate: (value: T) => boolean): number {
  if (values.length === 0) return Number.NaN;
  let count = 0;
  for (const value of values) if (predicate(value)) count += 1;
  return count / values.length;
}

/** Desvio padrão de uma proporção com n amostras. */
export function proportionError(p: number, n: number): number {
  return n > 0 ? Math.sqrt((p * (1 - p)) / n) : Number.POSITIVE_INFINITY;
}

export function groupBy<T, K extends string>(values: readonly T[], key: (value: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const value of values) {
    const group = key(value);
    const list = groups.get(group);
    if (list) list.push(value);
    else groups.set(group, [value]);
  }
  return groups;
}
