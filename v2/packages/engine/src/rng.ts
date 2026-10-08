/**
 * Aleatoriedade semeada do motor (GDD 8.1).
 *
 * A semente é um texto. Cada sistema recebe um fluxo próprio, derivado da
 * semente e de um rótulo ("growth", "birth.talent"), e muitas vezes do ano.
 * Acrescentar um sorteio num sistema não muda nenhum outro: é isso que
 * mantém as comparações de balanceamento legíveis (D6).
 *
 * O gerador guarda estado interno, porque sortear é consumir. Mas ele nunca
 * sai do motor: cada função cria o fluxo que precisa a partir da semente, usa
 * e descarta. Visto de fora, o motor continua puro: mesma entrada, mesma saída.
 */

/** Espalha um texto em quatro inteiros de 32 bits (mistura do tipo cyrb128). */
function hashSeed(text: string): [number, number, number, number] {
  let h1 = 0x6a09e667;
  let h2 = 0xbb67ae85;
  let h3 = 0x3c6ef372;
  let h4 = 0xa54ff53a;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    h1 = h2 ^ Math.imul(h1 ^ code, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ code, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ code, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ code, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/** Gerador sfc32: rápido, período longo e boa distribuição em 32 bits. */
function sfc32(seedA: number, seedB: number, seedC: number, seedD: number): () => number {
  let a = seedA;
  let b = seedB;
  let c = seedC;
  let d = seedD;
  return () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Os primeiros números de um sfc32 recém-semeado ainda carregam a semente. */
const WARM_UP = 12;

/** Maior λ sorteado de uma vez pelo método da multiplicação. */
const POISSON_CHUNK = 30;

export interface Rng {
  /** Real em [0, 1). */
  next(): number;
  /** Real em [min, max). */
  real(min: number, max: number): number;
  /** Inteiro em [min, max], os dois inclusos. */
  int(min: number, max: number): number;
  /** Verdadeiro com probabilidade `p`, limitada a [0, 1]. */
  chance(p: number): boolean;
  /** Um item da lista, com a mesma chance para todos. */
  pick<T>(list: readonly T[]): T;
  /** Um valor por peso. Peso negativo conta zero; soma zero é erro. */
  weighted<T>(entries: ReadonlyArray<readonly [T, number]>): T;
  /** Cópia embaralhada (Fisher-Yates). A lista original não muda. */
  shuffle<T>(list: readonly T[]): T[];
  /** Normal N(média; desvio). Consome sempre dois sorteios. */
  normal(mean?: number, deviation?: number): number;
  /** Log-normal: e elevado a N(mu; sigma). */
  logNormal(mu: number, sigma: number): number;
  /** Poisson(λ), exato para qualquer λ. */
  poisson(lambda: number): number;
  /** Binomial(n, p): n tentativas com chance p. */
  binomial(trials: number, p: number): number;
}

export function createRng(seed: string): Rng {
  const [a, b, c, d] = hashSeed(seed);
  const next = sfc32(a, b, c, d);
  for (let index = 0; index < WARM_UP; index += 1) next();

  const real = (min: number, max: number) => min + (max - min) * next();

  const int = (min: number, max: number) => {
    if (max < min) throw new Error(`rng.int: faixa vazia [${min}, ${max}]`);
    return min + Math.floor(next() * (max - min + 1));
  };

  const chance = (p: number) => next() < Math.min(1, Math.max(0, p));

  const pick = <T>(list: readonly T[]): T => {
    if (list.length === 0) throw new Error("rng.pick: lista vazia");
    return list[Math.floor(next() * list.length)] as T;
  };

  const weighted = <T>(entries: ReadonlyArray<readonly [T, number]>): T => {
    let total = 0;
    for (const [, weight] of entries) total += Math.max(0, weight);
    if (total <= 0) throw new Error("rng.weighted: soma de pesos zero");
    let roll = next() * total;
    for (const [value, weight] of entries) {
      const share = Math.max(0, weight);
      if (roll < share) return value;
      roll -= share;
    }
    // Só chega aqui por arredondamento: devolve o último com peso positivo.
    for (let index = entries.length - 1; index >= 0; index -= 1) {
      const entry = entries[index];
      if (entry && entry[1] > 0) return entry[0];
    }
    throw new Error("rng.weighted: inalcançável");
  };

  const shuffle = <T>(list: readonly T[]): T[] => {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(next() * (index + 1));
      const held = copy[index] as T;
      copy[index] = copy[swap] as T;
      copy[swap] = held;
    }
    return copy;
  };

  const normal = (mean = 0, deviation = 1) => {
    // Box-Muller. 1 - next() fica em (0, 1], então o logaritmo nunca explode.
    const u1 = 1 - next();
    const u2 = next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + deviation * z;
  };

  const logNormal = (mu: number, sigma: number) => Math.exp(normal(mu, sigma));

  /** Método da multiplicação (Knuth), bom para λ pequeno. */
  const poissonSmall = (lambda: number) => {
    const limit = Math.exp(-lambda);
    let count = 0;
    let product = next();
    while (product > limit) {
      count += 1;
      product *= next();
    }
    return count;
  };

  const poisson = (lambda: number) => {
    if (!(lambda > 0)) return 0;
    // A soma de Poissons independentes é Poisson: λ grande vira pedaços.
    let remaining = lambda;
    let count = 0;
    while (remaining > POISSON_CHUNK) {
      count += poissonSmall(POISSON_CHUNK);
      remaining -= POISSON_CHUNK;
    }
    return count + poissonSmall(remaining);
  };

  const binomial = (trials: number, p: number) => {
    const chanceEach = Math.min(1, Math.max(0, p));
    let count = 0;
    for (let index = 0; index < trials; index += 1) if (next() < chanceEach) count += 1;
    return count;
  };

  return { next, real, int, chance, pick, weighted, shuffle, normal, logNormal, poisson, binomial };
}

/**
 * Os sistemas que sorteiam (GDD 8.1). `birth` cria o jogador; os demais rodam
 * por temporada e recebem o ano junto do rótulo.
 */
export const RNG_SYSTEMS = [
  "birth",
  "world",
  "titles",
  "season",
  "growth",
  "injury",
  "awards",
  "market",
  "events",
  "national",
  "narrative",
  "bio",
  "scout",
  // A mão do Desafio do dia (GDD 27): nacionalidade, posição, missões e édito.
  // Sorteia antes da carreira existir e nunca dentro dela.
  "challenge",
  // Escolhas de jogadores automáticos (harness, caixa de areia). Nunca é lido
  // pela simulação, para que trocar de política não mude o mundo.
  "policy",
] as const;

export type RngSystem = (typeof RNG_SYSTEMS)[number];

/**
 * Fluxo de um sistema. `parts` afina o fluxo: o ano da temporada, um campo do
 * jogador ("talent"), o nível do olheiro. Mesmos argumentos, mesmo fluxo.
 */
export function stream(seed: string, system: RngSystem, ...parts: ReadonlyArray<string | number>): Rng {
  return createRng([seed, system, ...parts].join("|"));
}
