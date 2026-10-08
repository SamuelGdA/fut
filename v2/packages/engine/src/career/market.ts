import { CLUBS, type CountryCode, getClub, getCountry, leagueAt, PLAYABLE_COUNTRIES } from "@craque/world";
import { clamp } from "../math";
import type { Position } from "../player/positions";
import { bandIndex, type TalentBand } from "../player/talent";
import type { Rng } from "../rng";
import { type SquadRole, squadRole } from "../season/role";
import type { Difficulty } from "../types";
import { CLUB_CONFEDERATION, CLUB_COUNT, clubIndex, CONFEDERATION_CLUBS, COUNTRY_CLUBS } from "../world/model";
import { continentalEntrants } from "../world/season";
import type { WorldState } from "../world/types";
import { chooseMission, MISSION_TERMS } from "./mission";
import type { ClubBond, ClubOffer } from "./types";

/**
 * O mercado (GDD 15). O nível de mercado decide que clubes se interessam; a
 * geografia, de onde vêm; e a "troca de verdade" garante que uma oferta seja
 * um passo acima e outra um lugar onde ele será protagonista. É isso que faz
 * a escolha doer.
 */

export const MARKET = {
  /** Faixa de força dos interessados em volta do nível. */
  below: 7,
  above: 3,
  youthAge: 23,
  youthPerYear: 0.8,
  youthMax: 5,
  hardPenalty: 3,
  reputationMax: 3,
  /**
   * Clube nenhum contrata um veterano pelo nível de um jovem. Acima desta
   * idade, cada ano tira 1,5 do nível: é o que faz a maioria das carreiras
   * acabar entre 33 e 38 (GDD 40.1). Calibrado pelo harness.
   */
  veteranFrom: 32,
  veteranPerYear: 1.5,
  /** Passo acima: força pelo menos isto maior que a do clube atual. */
  stepUp: 2,
} as const;

export const LOAN = { minAge: 18, maxAge: 23, maxPerCareer: 2, below: 6, above: 1, sameCountry: 0.75 } as const;

/**
 * Quando a faixa do nível tem menos clubes do que ofertas, ela se alarga
 * (D15): o jovem alcança clubes mais fortes, que apostam no que ele vai ser;
 * o adulto, clubes mais fracos. Cada par é `[abaixo, acima]`.
 */
export const WIDEN = {
  youngUntil: 21,
  young: [
    [7, 3],
    [8, 7],
    [10, 12],
  ],
  adult: [
    [7, 3],
    [10, 3],
    [14, 4],
  ],
} as const;

/**
 * A base (D15 e D42): aos 16 anos o OVR fica entre 40 e 55 e o clube mais
 * fraco do mundo tem força 53, então a primeira decisão não usa a faixa do
 * nível. Num país com liga jogável, cada uma das três bases é um clube
 * sorteado do país: da primeira divisão com `topFlight` de chance, da segunda
 * no resto (no Brasil, 30% Série A e 70% Série B). País com uma divisão só
 * sorteia nela. Quem nasceu fora dos países jogáveis recebe clubes da
 * confederação (ou do mundo) perto de `OVR + alvo`.
 */
export const ACADEMY = { target: 6, shortlist: 8, topFlight: 0.3 } as const;

/** De onde vêm as ofertas, pelo OVR: mesmo país, mesma confederação, mundo. */
function regionWeights(ovr: number): readonly [number, number, number] {
  if (ovr < 75) return [50, 30, 20];
  if (ovr < 84) return [30, 30, 40];
  return [15, 25, 60];
}

export interface MarketLevelInput {
  readonly ovr: number;
  readonly age: number;
  readonly talent: TalentBand;
  readonly recentAwards: number;
  readonly recentTitles: number;
  readonly difficulty: Difficulty;
  readonly bonus: number;
}

/** Nível de mercado (GDD 15.1, mais o desconto de veterano). */
export function marketLevel(input: MarketLevelInput): number {
  const youth =
    clamp((MARKET.youthAge - input.age) * MARKET.youthPerYear, 0, MARKET.youthMax) * ((bandIndex(input.talent) + 1) / 3);
  const reputation = Math.min(MARKET.reputationMax, 0.5 * input.recentAwards + 0.3 * input.recentTitles);
  const difficulty = input.difficulty === "hard" ? MARKET.hardPenalty : 0;
  const veteran = Math.max(0, input.age - MARKET.veteranFrom) * MARKET.veteranPerYear;
  return input.ovr + youth + reputation - difficulty - veteran + input.bonus;
}

export interface MarketContext {
  readonly world: WorldState;
  readonly position: Position;
  readonly ovr: number;
  readonly age: number;
  readonly level: number;
  readonly nationality: CountryCode;
  /** Clube atual, ou `null` sem contrato. */
  readonly current: string | null;
  readonly excluded: readonly string[];
  /** Teto temporário das ofertas após rompimento com empresário. */
  readonly maxStrength?: number;
  readonly bonds: Readonly<Record<string, ClubBond>>;
  /** Primeiro clube da carreira, para a "volta para casa". */
  readonly firstClub: string | null;
  readonly proving: boolean;
  /** O número que cada clube daria a ele, pelo papel com que chega (GDD 19). */
  readonly shirt: (club: string, role: SquadRole) => number;
}

/** Clubes interessados: força na faixa do nível, fora o atual e os bloqueados. */
export function interestedClubs(context: MarketContext, below: number = MARKET.below, above: number = MARKET.above): number[] {
  const excluded = new Set(context.excluded);
  if (context.current) excluded.add(context.current);
  const low = context.level - below;
  const high = context.level + above;
  const result: number[] = [];
  for (let index = 0; index < CLUB_COUNT; index += 1) {
    const strength = context.world.strength[index] ?? 0;
    const id = CLUBS[index]?.id ?? "";
    if (strength >= low && strength <= high && strength <= (context.maxStrength ?? Infinity) && !excluded.has(id)) result.push(index);
  }
  return result;
}

/** Os interessados, com a faixa alargada se não houver clubes para `count` ofertas. */
export function widenedClubs(context: MarketContext, count: number): number[] {
  const steps = context.age <= WIDEN.youngUntil ? WIDEN.young : WIDEN.adult;
  let pool: number[] = [];
  for (const [below, above] of steps) {
    pool = interestedClubs(context, below, above);
    if (pool.length >= count) return pool;
  }
  return pool;
}

/** O país de referência da geografia: onde ele joga, ou a nacionalidade. */
function homeCountry(context: MarketContext): CountryCode {
  if (context.current) return getClub(context.current)?.country ?? context.nationality;
  return context.nationality;
}

/** Separa os interessados em mesmo país, mesma confederação e resto do mundo. */
function byRegion(context: MarketContext, pool: readonly number[]): [number[], number[], number[]] {
  const country = homeCountry(context);
  const confederation = getCountry(country)?.confederation ?? getCountry(context.nationality)?.confederation;
  const same: number[] = [];
  const near: number[] = [];
  const far: number[] = [];
  for (const index of pool) {
    const club = CLUBS[index];
    if (!club) continue;
    if (club.country === country) same.push(index);
    else if (CLUB_CONFEDERATION[index] === confederation) near.push(index);
    else far.push(index);
  }
  return [same, near, far];
}

/** Sorteia um clube por região, caindo para a próxima quando a sorteada está vazia. */
function pickByRegion(rng: Rng, context: MarketContext, pool: readonly number[]): number | null {
  if (pool.length === 0) return null;
  const regions = byRegion(context, pool);
  const weights = regionWeights(context.ovr);
  const playable = (PLAYABLE_COUNTRIES as readonly string[]).includes(homeCountry(context));
  // Quem é de país sem liga não tem "mesmo país": a fatia vai para a confederação.
  const adjusted: [number, number, number] = playable ? [...weights] : [0, weights[0] + weights[1], weights[2]];
  const region = rng.weighted([
    [0, regions[0].length > 0 ? adjusted[0] : 0],
    [1, regions[1].length > 0 ? adjusted[1] : 0],
    [2, regions[2].length > 0 ? adjusted[2] : 0],
  ] as const);
  const list = regions[region] ?? [];
  return list.length > 0 ? rng.pick(list) : null;
}

/** O cartão da oferta (GDD 15.3). */
export function buildOffer(
  context: MarketContext,
  index: number,
  rng: Rng,
  flags: { readonly loan?: boolean; readonly buyout?: boolean; readonly back?: boolean } = {},
): ClubOffer {
  const club = CLUBS[index];
  if (!club) throw new Error(`motor: clube fora da lista ${index}`);
  const strength = context.world.strength[index] ?? club.strength;
  const division = context.world.division[index] ?? club.division;
  const league = leagueAt(club.country, division);
  const entrants = continentalEntrants(context.world.memory);
  const competitions = Object.entries(entrants)
    .filter(([, ids]) => ids.includes(club.id))
    .map(([competition]) => competition);

  const memory = context.world.memory;
  const table = Object.entries(memory.tables).find(([, ids]) => ids.includes(club.id));
  const tablePosition = table ? table[1].indexOf(club.id) : -1;
  const bottomThird = table !== undefined && tablePosition >= Math.ceil((table[1].length * 2) / 3);
  const lastLeague = table ? table[0] : null;
  const lastDivision = lastLeague ? (leagueAt(club.country, 1)?.id === lastLeague ? 1 : 2) : division;
  const currentStrength = context.current ? (context.world.strength[clubIndex(context.current)] ?? null) : null;

  const mission = chooseMission({
    age: context.age,
    ovr: context.ovr,
    clubStrength: strength,
    clubPrestige: club.prestige,
    currentStrength,
    homecoming: context.bonds[club.id] !== undefined || context.firstClub === club.id,
    proving: context.proving,
    bottomThird,
    justMoved: lastDivision !== division,
    roll: rng.next(),
  });
  const terms = MISSION_TERMS[mission];
  const role = squadRole(context.position, context.ovr, strength).role;

  return {
    club: club.id,
    strength,
    division,
    league: league?.id ?? null,
    role,
    stars: clubStars(club.prestige, club.strength, strength + Math.max(0, 0.22 * squadRole(context.position, context.ovr, strength).participation * Math.min(15, context.ovr - strength))),
    competitions,
    mission,
    pressure: terms.pressure,
    fansStart: terms.fans,
    loan: flags.loan ?? false,
    buyout: flags.buyout ?? false,
    back: flags.back ?? false,
    shirt: context.shirt(club.id, role),
  };
}

/**
 * Ofertas de uma janela. Quando dá, a primeira é um passo acima do clube
 * atual e a segunda um lugar onde ele vai jogar como titular ou craque; as
 * outras seguem a geografia.
 */
export function marketOffers(context: MarketContext, count: number, rng: Rng): ClubOffer[] {
  const pool = widenedClubs(context, count);
  const chosen: number[] = [];
  const take = (candidates: readonly number[]) => {
    const fresh = candidates.filter((index) => !chosen.includes(index));
    const index = pickByRegion(rng, context, fresh);
    if (index !== null) chosen.push(index);
  };

  const currentStrength = context.current ? (context.world.strength[clubIndex(context.current)] ?? 0) : null;
  if (currentStrength !== null && count >= 2) {
    take(pool.filter((index) => (context.world.strength[index] ?? 0) >= currentStrength + MARKET.stepUp));
    take(
      pool.filter((index) => {
        const role = squadRole(context.position, context.ovr, context.world.strength[index] ?? 0).role;
        return role === "star" || role === "starter";
      }),
    );
  }
  let guard = 0;
  while (chosen.length < count && guard < count * 4) {
    take(pool);
    guard += 1;
  }
  return chosen.slice(0, count).map((index) => buildOffer(context, index, rng));
}

/** As bases do próprio país: cada vaga sorteia a divisão e, nela, um clube qualquer. */
function homeAcademies(context: MarketContext, count: number, rng: Rng): number[] {
  const excluded = new Set(context.excluded);
  const clubs = (COUNTRY_CLUBS.get(context.nationality) ?? []).filter((index) => !excluded.has(CLUBS[index]?.id ?? ""));
  const top = clubs.filter((index) => (context.world.division[index] ?? 1) === 1);
  const second = clubs.filter((index) => (context.world.division[index] ?? 1) === 2);
  const chosen: number[] = [];
  for (let slot = 0; slot < count; slot += 1) {
    const topFlight = rng.chance(ACADEMY.topFlight);
    const fresh = (list: readonly number[]) => list.filter((index) => !chosen.includes(index));
    const preferred = fresh(topFlight ? top : second);
    const list = preferred.length > 0 ? preferred : fresh(topFlight ? second : top);
    if (list.length === 0) break;
    chosen.push(rng.pick(list));
  }
  return chosen;
}

/** A primeira decisão: três bases (D15 e D42). */
export function academyOffers(context: MarketContext, count: number, rng: Rng): ClubOffer[] {
  const country = context.nationality;
  if ((PLAYABLE_COUNTRIES as readonly string[]).includes(country)) {
    return homeAcademies(context, count, rng).map((index) => buildOffer(context, index, rng));
  }
  const excluded = new Set(context.excluded);
  const confederation = getCountry(country)?.confederation;
  const regions: readonly (readonly number[])[] = [
    confederation ? (CONFEDERATION_CLUBS.get(confederation) ?? []) : [],
    CLUBS.map((_, index) => index),
  ];
  const target = context.ovr + ACADEMY.target;
  const distance = (index: number) => Math.abs((context.world.strength[index] ?? 0) - target);
  const chosen: number[] = [];
  for (const region of regions) {
    if (chosen.length >= count) break;
    const nearest = region
      .filter((index) => !excluded.has(CLUBS[index]?.id ?? "") && !chosen.includes(index))
      .sort((a, b) => distance(a) - distance(b) || a - b)
      .slice(0, ACADEMY.shortlist);
    for (const index of rng.shuffle(nearest)) {
      if (chosen.length >= count) break;
      chosen.push(index);
    }
  }
  return chosen.map((index) => buildOffer(context, index, rng));
}

/** Empréstimo (GDD 15.4): minutos garantidos, 75% no mesmo país. */
export function loanOffers(context: MarketContext, count: number, rng: Rng): ClubOffer[] {
  const pool = interestedClubs({ ...context, level: context.ovr }, LOAN.below, LOAN.above);
  const country = homeCountry(context);
  const chosen: number[] = [];
  for (let slot = 0; slot < count; slot += 1) {
    const sameCountry = rng.chance(LOAN.sameCountry);
    const fresh = pool.filter((index) => !chosen.includes(index));
    const local = fresh.filter((index) => CLUBS[index]?.country === country);
    const list = sameCountry && local.length > 0 ? local : fresh;
    if (list.length === 0) break;
    chosen.push(rng.pick(list));
  }
  return chosen.map((index) => buildOffer(context, index, rng, { loan: true }));
}

/** Uma oferta de um clube específico (rival histórico, clube de casa, clube do legado). */
export function offerFrom(context: MarketContext, club: string, rng: Rng): ClubOffer {
  return buildOffer(context, clubIndex(club), rng);
}

/** Estrelas acompanham a força, até um degrau da base; a fronteira 4/5 exige mais. */
export function clubStars(prestige: number, base: number, strength: number): number {
  const stars = clamp(Math.round(prestige), 1, 5);
  const delta = strength - base;
  const up = stars === 4 ? 4.5 : 3;
  const down = stars === 5 ? 4.5 : 3;
  return clamp(stars + (delta >= up ? 1 : delta <= -down ? -1 : 0), 1, 5);
}
