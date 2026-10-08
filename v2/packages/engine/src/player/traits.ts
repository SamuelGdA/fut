import type { Rng } from "../rng";

/**
 * Traços de personalidade (GDD 9.8). Cada jogador tem um, sorteado no
 * nascimento. A tabela guarda todos os efeitos, inclusive os que só os
 * sistemas dos próximos marcos leem (risco, torcida, lesão, legado).
 */

export const TRAITS = ["competitor", "professional", "leader", "artist", "hothead", "fragile"] as const;
export type Trait = (typeof TRAITS)[number];

export interface TraitEffects {
  /** Peso no sorteio. */
  readonly weight: number;
  /** Multiplica o crescimento de L. */
  readonly growth: number;
  /** Multiplica a perda por idade. */
  readonly decline: number;
  /** Multiplica a chance de lesão. */
  readonly injury: number;
  /** Multiplica a chance de sucesso em escolhas de risco. */
  readonly risk: number;
  /** Pontos de torcida por temporada. */
  readonly fansPerSeason: number;
  /** Desvio da oscilação de produção (log-normal). */
  readonly productionSpread: number;
  /** Multiplica o legado nos clubes. */
  readonly legacy: number;
}

const BASE: Omit<TraitEffects, "weight"> = {
  growth: 1,
  decline: 1,
  injury: 1,
  risk: 1,
  fansPerSeason: 0,
  productionSpread: 0.12,
  legacy: 1,
};

export const TRAIT_EFFECTS: Readonly<Record<Trait, TraitEffects>> = {
  competitor: { ...BASE, weight: 20, risk: 1.12, growth: 1.04 },
  professional: { ...BASE, weight: 20, decline: 0.8, injury: 0.85 },
  leader: { ...BASE, weight: 15, fansPerSeason: 2, legacy: 1.1 },
  artist: { ...BASE, weight: 15, fansPerSeason: 4, productionSpread: 0.16 },
  hothead: { ...BASE, weight: 15, fansPerSeason: -1, risk: 1.05 },
  fragile: { ...BASE, weight: 15, injury: 1.5, risk: 0.9 },
};

export function drawTrait(rng: Rng): Trait {
  return rng.weighted(TRAITS.map((trait) => [trait, TRAIT_EFFECTS[trait].weight] as const));
}
