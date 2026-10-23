import type { KeyMatch } from "@craque/engine";
import { CLUBS, COMPETITIONS, COUNTRIES, type Competition, getCountry, getLeague } from "@craque/world";

/** Uma partida de exemplo para mostrar a transmissão de uma competição no laboratório. */
export type BroadcastSample = Pick<KeyMatch, "competition" | "team" | "opponent" | "national">;

/** A seleção de exemplo de cada torneio, até a pessoa escolher outra. */
const NATION_SAMPLES: Readonly<Record<string, string>> = { worldcup: "BRA", "nations:UEFA": "ITA", "nations:CONMEBOL": "ARG", "nations:CONCACAF": "MEX", "nations:CAF": "SEN", "nations:AFC": "JPN", "nations:OFC": "NZL" };

const BY_PRESTIGE = [...CLUBS].sort((a, b) => b.prestige - a.prestige || b.strength - a.strength || a.id.localeCompare(b.id));

function topClubs(accept: (club: (typeof CLUBS)[number]) => boolean): readonly [string, string] {
  const [first, second] = BY_PRESTIGE.filter(accept);
  return [first?.id ?? "flamengo", second?.id ?? "palmeiras"];
}

const confederationOf = (country: string) => getCountry(country)?.confederation;

/**
 * Os dois clubes de maior prestígio de onde a competição é disputada; nas
 * competições de seleções, a seleção escolhida (ou a de exemplo) contra a
 * mais forte que pode enfrentá-la.
 */
export function sampleMatch(competition: Competition, nation: string | null): BroadcastSample {
  const id = competition.id;
  if (competition.kind === "worldCup" || competition.kind === "nationsCup") {
    const team = nation ?? NATION_SAMPLES[id] ?? "BRA";
    const pool = COUNTRIES.filter((country) => country.code !== team && (competition.kind === "worldCup" || country.confederation === competition.confederation)).sort((a, b) => b.strength - a.strength || a.code.localeCompare(b.code));
    return { competition: id, team, opponent: pool[0]?.code ?? "ARG", national: true };
  }
  if (competition.kind === "clubWorldCup" || competition.kind === "intercontinental") {
    const [europe] = topClubs((club) => confederationOf(club.country) === "UEFA");
    const [america] = topClubs((club) => confederationOf(club.country) === "CONMEBOL");
    return { competition: id, team: america, opponent: europe, national: false };
  }
  if (competition.country) {
    const division = getLeague(competition.league)?.division ?? 1;
    const [team, opponent] = topClubs((club) => club.country === competition.country && club.division === division);
    return { competition: id, team, opponent, national: false };
  }
  const [team, opponent] = topClubs((club) => confederationOf(club.country) === competition.confederation);
  return { competition: id, team, opponent, national: false };
}

const GROUP: Readonly<Record<Competition["kind"], number>> = { continental1: 0, continental2: 0, continental3: 0, continentalSuper: 0, intercontinental: 0, clubWorldCup: 0, worldCup: 1, nationsCup: 1, league: 2, second: 2, cup: 3, leagueCup: 3, superCup: 3 };

/** Clubes continentais e mundiais, seleções, ligas e copas: a ordem em que a pessoa procura. */
export const BROADCAST_COMPETITIONS: readonly Competition[] = COMPETITIONS.map((competition, index) => ({ competition, index }))
  .sort((a, b) => GROUP[a.competition.kind] - GROUP[b.competition.kind] || a.index - b.index)
  .map(({ competition }) => competition);
