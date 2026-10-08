/**
 * Funções numéricas pequenas, usadas em todo o motor. Nenhuma tem efeito
 * colateral nem lê relógio.
 */

/** Prende `value` entre `min` e `max` (GDD 0: `limitar`). */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Curva logística de 0 a 1: vale 0,5 em `midpoint` e cai quando `x` passa dele. */
export function fallingLogistic(x: number, midpoint: number, width: number): number {
  return 1 / (1 + Math.exp((x - midpoint) / width));
}

/** Curva logística de 0 a 1 que sobe com `x`. */
export function risingLogistic(x: number, midpoint: number, width: number): number {
  return 1 / (1 + Math.exp(-(x - midpoint) / width));
}

/**
 * Interpolação linear por trechos entre pontos `[x, y]` em ordem crescente de
 * `x`. Antes do primeiro ponto vale o primeiro `y`; depois do último, o último
 * `y` mais `tailSlope` por unidade de `x`.
 */
export function piecewise(
  knots: ReadonlyArray<readonly [number, number]>,
  x: number,
  tailSlope = 0,
): number {
  const first = knots[0];
  const last = knots[knots.length - 1];
  if (!first || !last) throw new Error("piecewise: precisa de pelo menos um ponto");
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1] + tailSlope * (x - last[0]);
  for (let index = 1; index < knots.length; index += 1) {
    const right = knots[index];
    const left = knots[index - 1];
    if (!right || !left) continue;
    if (x <= right[0]) {
      const ratio = (x - left[0]) / (right[0] - left[0]);
      return left[1] + ratio * (right[1] - left[1]);
    }
  }
  return last[1];
}

/**
 * Teto suave. Até `knee` o valor passa intacto; acima dele, cresce cada vez
 * menos e só se aproxima de `ceiling`, sem nunca alcançá-lo.
 *
 * É assim que o motor impede saltos irreais sem criar um degrau artificial:
 * uma temporada excepcional ainda rende mais que uma boa, só que menos a cada
 * ponto extra.
 */
export function softCeiling(value: number, knee: number, ceiling: number): number {
  if (value <= knee) return value;
  const excess = value - knee;
  const room = ceiling - knee;
  return knee + excess / (1 + excess / room);
}

/** Soma ponderada dividida pela soma dos pesos. */
export function weightedMean(values: readonly number[], weights: readonly number[]): number {
  let total = 0;
  let weightSum = 0;
  for (let index = 0; index < values.length; index += 1) {
    const weight = weights[index] ?? 0;
    total += (values[index] ?? 0) * weight;
    weightSum += weight;
  }
  if (weightSum === 0) throw new Error("weightedMean: soma de pesos zero");
  return total / weightSum;
}

/** Arredonda para `digits` algarismos significativos. */
export function roundSignificant(value: number, digits: number): number {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = 10 ** (magnitude - digits + 1);
  return Math.round(value / factor) * factor;
}
