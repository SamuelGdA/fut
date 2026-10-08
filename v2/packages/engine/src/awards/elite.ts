import { type CountryCode, ELITE, type EliteProfile } from "@craque/world";
import { clamp } from "../math";
import { GROUP_OF, type Position, type PositionGroup } from "../player/positions";
import { stream } from "../rng";

/**
 * Quem disputa os prêmios com o jogador (GDD 13.1).
 *
 * - **A elite real**: jogadores de verdade, com projeções de carreira
 *   fictícias (D8).
 * - **A geração futura**: candidatos gerados pela semente da carreira, um
 *   grupo por ano de nascimento de 2009 a 2028. A elite real só vai até quem
 *   nasceu em 2009 e envelhece com a carreira; sem a geração futura, depois de
 *   2037 a Bola de Ouro viraria um prêmio sem adversário. O motor não dá nome
 *   a eles: a interface decide como apresentá-los.
 */

const RISE_PER_YEAR = 1.9;
const FALL_SCALE = 1.3;
const FALL_POWER = 1.35;
/** Ninguém da elite aparece antes desta idade. */
const DEBUT_AGE = 17;

/** Um candidato aos prêmios: da elite real ou da geração futura. */
export interface Contender extends EliteProfile {
  /** Verdadeiro na geração futura: não é uma pessoa real. */
  readonly generated: boolean;
}

export function eliteAge(profile: EliteProfile, year: number): number {
  return year - profile.born;
}

export function isEliteActive(profile: EliteProfile, year: number): boolean {
  const age = eliteAge(profile, year);
  return age >= DEBUT_AGE && age <= profile.retireAge;
}

/** OVR projetado num ano (GDD 13.1); `null` fora da carreira. */
export function eliteOvr(profile: EliteProfile, year: number): number | null {
  if (!isEliteActive(profile, year)) return null;
  const age = eliteAge(profile, year);
  if (age < profile.peakAge) return profile.peakOvr - RISE_PER_YEAR * (profile.peakAge - age);
  return profile.peakOvr - FALL_SCALE * Math.max(0, age - profile.peakAge - 1) ** FALL_POWER;
}

// -------------------------------------------------------- geração futura

export const FUTURE_GENERATION = {
  firstBorn: 2009,
  lastBorn: 2028,
  /** Cada geração tem um de cada, como a elite real tem em média. */
  roster: ["st", "st", "lw", "rw", "cam", "cm", "cdm", "cb", "lb", "gk"] as readonly Position[],
  peakMean: 86.5,
  peakDeviation: 2.6,
  peakRange: [82, 94] as const,
  keeperPeakMean: 85,
  keeperPeakRange: [81, 90] as const,
  peakAge: [26, 28] as const,
  keeperPeakAge: [29, 31] as const,
  retireAge: [34, 37] as const,
  keeperRetireAge: [37, 39] as const,
  europeShare: 0.85,
} as const;

const FUTURE_NATIONS: ReadonlyArray<readonly [CountryCode, number]> = [
  ["BRA", 14],
  ["FRA", 12],
  ["ESP", 11],
  ["ENG", 11],
  ["ARG", 10],
  ["GER", 8],
  ["POR", 7],
  ["ITA", 6],
  ["NED", 5],
  ["BEL", 3],
  ["URU", 3],
  ["COL", 3],
  ["MAR", 2],
  ["CRO", 2],
  ["NOR", 2],
  ["USA", 2],
  ["NGA", 2],
  ["JPN", 2],
  ["SEN", 2],
  ["MEX", 2],
];

const futureCache = new Map<string, readonly Contender[]>();

/**
 * A geração futura de uma carreira. Sempre a mesma para a mesma semente; o
 * cache só evita refazer a mesma conta e não muda nenhum resultado.
 */
export function futureGeneration(seed: string): readonly Contender[] {
  const cached = futureCache.get(seed);
  if (cached) return cached;
  const rng = stream(seed, "awards", "future");
  const settings = FUTURE_GENERATION;
  const contenders: Contender[] = [];
  for (let born = settings.firstBorn; born <= settings.lastBorn; born += 1) {
    settings.roster.forEach((position, slot) => {
      const keeper = position === "gk";
      const peakOvr = keeper
        ? clamp(rng.normal(settings.keeperPeakMean, settings.peakDeviation), settings.keeperPeakRange[0], settings.keeperPeakRange[1])
        : clamp(rng.normal(settings.peakMean, settings.peakDeviation), settings.peakRange[0], settings.peakRange[1]);
      const [ageLow, ageHigh] = keeper ? settings.keeperPeakAge : settings.peakAge;
      const [retireLow, retireHigh] = keeper ? settings.keeperRetireAge : settings.retireAge;
      contenders.push({
        id: `future:${born}:${slot}`,
        name: "",
        born,
        nationality: rng.weighted(FUTURE_NATIONS),
        position,
        peakOvr: Math.round(peakOvr * 10) / 10,
        peakAge: rng.int(ageLow, ageHigh),
        retireAge: rng.int(retireLow, retireHigh),
        europe: rng.chance(settings.europeShare),
        generated: true,
      });
    });
  }
  if (futureCache.size > 64) futureCache.clear();
  futureCache.set(seed, contenders);
  return contenders;
}

const REAL_ELITE: readonly Contender[] = ELITE.map((profile) => ({ ...profile, generated: false }));

export interface EliteCandidate {
  readonly profile: Contender;
  readonly age: number;
  readonly ovr: number;
}

/** Quem está em atividade num ano, com o OVR projetado: a elite real e a geração futura. */
export function activeElite(year: number, seed?: string): EliteCandidate[] {
  const pool = seed ? [...REAL_ELITE, ...futureGeneration(seed)] : REAL_ELITE;
  return pool.flatMap((profile) => {
    const ovr = eliteOvr(profile, year);
    return ovr === null ? [] : [{ profile, age: eliteAge(profile, year), ovr }];
  });
}

export function eliteGroup(profile: EliteProfile): PositionGroup {
  return GROUP_OF[profile.position];
}
