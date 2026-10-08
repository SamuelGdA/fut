import { CLUBS, COUNTRIES, type CountryCode, getClub, getCountry, PLAYABLE_COUNTRIES, RIVALRIES } from "@craque/world";
import type { EventContext } from "../events/model";
import { ovrAt } from "../player/player";
import type { Position } from "../player/positions";
import type { SquadRole } from "../season/role";
import { baseMarketValue } from "../player/value";
import { stream } from "../rng";
import { inTournamentSquad, nationalStatus } from "../season/national";
import { clubIndex, COUNTRY_CLUBS } from "../world/model";
import { continentalEntrants } from "../world/season";
import { CALENDAR } from "../world/tuning";
import { canWearTen, legacyLevel } from "./fans";
import { type MarketContext, marketLevel } from "./market";
import { firstContractNumber, freePrestigeNumbers, homageNumbers, newClubNumber } from "./shirt";
import type { Career, LegacyLevel } from "./types";

/**
 * O momento da carreira lido pelas condições dos eventos e pelo mercado. Tudo
 * que tem sorte (camisa 10 livre, posição vizinha) sai de um fluxo próprio da
 * idade, para a mesma carreira mostrar sempre o mesmo.
 */

/** Posições vizinhas que fazem sentido numa mudança de função (GDD 18.3, evento 5). */
export const NEIGHBOUR_POSITIONS: Readonly<Record<Position, readonly Position[]>> = {
  gk: [],
  cb: ["cdm", "lb", "rb"],
  lb: ["lm", "cb"],
  rb: ["rm", "cb"],
  cdm: ["cm", "cb"],
  cm: ["cam", "cdm"],
  cam: ["cm", "st"],
  lm: ["lw", "lb"],
  rm: ["rw", "rb"],
  lw: ["lm", "st", "rw"],
  rw: ["rm", "st", "lw"],
  st: ["cam", "lw", "rw"],
};

export function currentOvr(career: Career): number {
  return ovrAt(career.player, career.age);
}

/** Temporadas seguidas no clube atual, contando do fim. */
export function seasonsAtClub(career: Career): number {
  const club = career.contract?.club;
  if (!club) return 0;
  let count = 0;
  for (let index = career.history.length - 1; index >= 0 && career.history[index]?.club === club; index -= 1) count += 1;
  return count;
}

/** Temporadas seguidas jogando fora do país de nascimento. */
function abroadSeasons(career: Career): number {
  const home = career.setup.identity.nationality;
  let count = 0;
  for (let index = career.history.length - 1; index >= 0; index -= 1) {
    const country = getClub(career.history[index]?.club)?.country;
    if (!country || country === home) break;
    count += 1;
  }
  return count;
}

export function bondLegacy(career: Career, club: string): LegacyLevel {
  const bond = career.bonds[club];
  const prestige = getClub(club)?.prestige ?? 1;
  return bond ? legacyLevel(bond.legacyPoints, bond.seasons, prestige) : "none";
}

/** Prêmios e títulos das últimas três temporadas, para a reputação no mercado. */
function recentHonours(career: Career): { awards: number; titles: number } {
  const recent = career.history.slice(-3);
  return {
    awards: recent.reduce((total, season) => total + season.awards.won.length, 0),
    titles: recent.reduce((total, season) => total + season.titles.length, 0),
  };
}

export function careerMarketLevel(career: Career): number {
  const honours = recentHonours(career);
  return marketLevel({
    ovr: currentOvr(career),
    age: career.age,
    talent: career.player.talent,
    recentAwards: honours.awards,
    recentTitles: honours.titles,
    difficulty: career.setup.difficulty,
    bonus: career.marketBonus,
  });
}

/**
 * O número que um clube daria a ele (GDD 19), já na oferta: o clube atual e o
 * clube da compra mantêm o número dele, a volta de empréstimo devolve o número
 * de antes, o primeiro contrato e os clubes novos sorteiam pelo papel e pelo
 * número dos sonhos. O sorteio é do clube e da idade: a mesma oferta mostra
 * sempre o mesmo número.
 */
export function offerShirt(career: Career, club: string, role: SquadRole): number {
  const contract = career.contract;
  if (contract && contract.club === club) return contract.shirt;
  if (contract?.loan && contract.loan.owner === club) return contract.loan.ownerShirt;
  const rng = stream(career.setup.seed, "events", "shirt", career.age, club);
  const dream = career.setup.identity.dreamNumber;
  const position = career.player.position;
  const firstContract = contract === null && career.history.length === 0;
  return firstContract ? firstContractNumber(rng, dream, role, position) : newClubNumber(rng, dream, role, position);
}

export function marketContext(career: Career, overrides: Partial<MarketContext> = {}): MarketContext {
  return {
    world: career.world,
    position: career.player.position,
    ovr: currentOvr(career),
    age: career.age,
    level: careerMarketLevel(career),
    nationality: career.nationality,
    current: career.contract?.club ?? null,
    excluded: career.blocked,
    bonds: career.bonds,
    firstClub: career.history[0]?.club ?? null,
    proving: career.proving,
    shirt: (club, role) => offerShirt(career, club, role),
    ...overrides,
  };
}

/** O rival histórico mais forte do clube atual, se houver. */
export function historicalRival(club: string | null, career: Career): string | null {
  if (!club) return null;
  const rivals = RIVALRIES.flatMap(([a, b]) => (a === club ? [b] : b === club ? [a] : [])).filter(
    (id) => getClub(id) !== null && !career.blocked.includes(id),
  );
  return [...rivals].sort((a, b) => (career.world.strength[clubIndex(b)] ?? 0) - (career.world.strength[clubIndex(a)] ?? 0))[0] ?? null;
}

/** Um país de avô para o passaporte: uma seleção mais forte, sorteada pela semente. */
export function grandfatherCountry(career: Career): CountryCode | null {
  const current = getCountry(career.nationality);
  const options = COUNTRIES.filter(
    (country) => country.code !== career.nationality && country.strength >= (current?.strength ?? 0) + 3 && country.strength >= 74,
  );
  if (options.length === 0) return null;
  return stream(career.setup.seed, "events", "passport").pick(options).code;
}

/** Um clube do país de nascimento que aceitaria o jogador. */
export function homeClub(career: Career): string | null {
  const home = career.setup.identity.nationality;
  if (!(PLAYABLE_COUNTRIES as readonly string[]).includes(home)) return null;
  const level = careerMarketLevel(career);
  const clubs = (COUNTRY_CLUBS.get(home) ?? []).filter((index) => {
    const id = CLUBS[index]?.id ?? "";
    const strength = career.world.strength[index] ?? 0;
    return !career.blocked.includes(id) && id !== career.contract?.club && strength >= level - 9 && strength <= level + 3;
  });
  if (clubs.length === 0) return null;
  const strongest = [...clubs].sort((a, b) => (career.world.strength[b] ?? 0) - (career.world.strength[a] ?? 0))[0];
  return strongest === undefined ? null : (CLUBS[strongest]?.id ?? null);
}

/** Onde ele já foi Ídolo ou Lenda e não está agora. */
export function legacyClub(career: Career): string | null {
  const current = career.contract?.club;
  for (const club of Object.keys(career.bonds)) {
    if (club === current || career.blocked.includes(club)) continue;
    const level = bondLegacy(career, club);
    if (level === "idol" || level === "legend") return club;
  }
  return null;
}

export function eventContext(career: Career): EventContext {
  const age = career.age;
  const ovr = currentOvr(career);
  const position = career.player.position;
  const last = career.history[career.history.length - 1] ?? null;
  const club = career.contract?.club ?? null;
  const strength = club ? (career.world.strength[clubIndex(club)] ?? 0) : 0;
  const entrants = continentalEntrants(career.world.memory);
  const continental = club !== null && Object.values(entrants).some((ids) => ids.includes(club));

  const country = club ? getClub(club)?.country : undefined;
  const domestic = country ? (COUNTRY_CLUBS.get(country) ?? []) : [];
  const rankAtHome = club
    ? [...domestic].sort((a, b) => (career.world.strength[b] ?? 0) - (career.world.strength[a] ?? 0)).indexOf(clubIndex(club))
    : -1;

  const rival = historicalRival(club, career);
  const rivalStrength = rival ? (career.world.strength[clubIndex(rival)] ?? 0) : 0;
  const derby =
    rival !== null &&
    getClub(rival)?.country === country &&
    career.world.division[clubIndex(rival)] === (club ? career.world.division[clubIndex(club)] : 0);

  const random = stream(career.setup.seed, "events", "context", age);
  const tenRoll = random.next();
  const neighbours = NEIGHBOUR_POSITIONS[position];
  const neighbour = neighbours.length > 0 ? random.pick(neighbours) : null;
  const shirt = career.contract?.shirt ?? 0;

  const nation = getCountry(career.nationality);
  const tournamentYear = career.world.year % 4 === CALENDAR.worldCup || career.world.year % 4 === CALENDAR.nationsCup;
  const status = nation ? nationalStatus(ovr, nation.strength) : "out";
  const legacyHere = club ? bondLegacy(career, club) : "none";

  return {
    age,
    ovr,
    position,
    trait: career.player.trait,
    lastRole: last && last.club === club ? last.role : null,
    lastGames: last?.games ?? 0,
    seasonsAtClub: seasonsAtClub(career),
    clubDecline: career.contract ? career.contract.strengthAtArrival - strength : 0,
    continental,
    knockout: continental || (rankAtHome >= 0 && rankAtHome < 4),
    rivalClub: rival,
    rivalClubInterested: rival !== null && rivalStrength >= strength && rival !== club,
    derby,
    tenFree:
      canWearTen(position) && shirt !== 10 && (last?.role === "star" || last?.role === "starter") && tenRoll < 0.35,
    abroadSeasons: homeClub(career) === null ? 0 : abroadSeasons(career),
    value: baseMarketValue(ovr, age),
    nationWeakOrUncapped:
      grandfatherCountry(career) !== null &&
      ((career.firstCapAge === null && age >= 21) || (nation !== null && ovr >= nation.strength + 6 && nation.strength <= 74)),
    legacyClub: legacyClub(career),
    tournamentSquad: tournamentYear && inTournamentSquad(status),
    fans: club ? (career.bonds[club]?.fans ?? 50) : 50,
    neighbourPosition: neighbour,
    prestigeNumbers: club ? freePrestigeNumbers(random, position, shirt) : [],
    homageNumbers:
      club && !career.homageUsed && (legacyHere === "idol" || legacyHere === "legend")
        ? homageNumbers(position, career.setup.identity.dreamNumber, shirt)
        : [],
  };
}
