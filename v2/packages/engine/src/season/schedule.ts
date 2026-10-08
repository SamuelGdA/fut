import { type CompetitionKind, type CountryCode, getCompetition } from "@craque/world";
import { stageAt } from "../world/model";
import type { KnockoutResult, SeasonResults, Stage } from "../world/types";

/**
 * Quantos jogos cada fase vale (GDD 11.3) e por onde o clube passou na
 * temporada. A lista de competições de um clube sai inteira dos resultados do
 * mundo: o clube jogou o que o mundo simulou para ele.
 */

type StageTable = Readonly<Record<Stage, number>>;

/** Copa nacional: 1 a 6 jogos. */
const CUP_GAMES: StageTable = { champion: 6, final: 6, semi: 5, quarter: 4, roundOf16: 3, roundOf32: 2, groups: 1, early: 1 };
/** Copa da liga inglesa: 1 a 5. */
const LEAGUE_CUP_GAMES: StageTable = { champion: 5, final: 5, semi: 4, quarter: 3, roundOf16: 2, roundOf32: 1, groups: 1, early: 1 };
/** Continental: 6 nos grupos e 2 por fase de mata-mata; a final é jogo único. */
const CONTINENTAL_GAMES: StageTable = { champion: 13, final: 13, semi: 12, quarter: 10, roundOf16: 8, roundOf32: 6, groups: 6, early: 2 };
/** Mundial de Clubes: 3 a 7. */
const CLUB_WORLD_CUP_GAMES: StageTable = { champion: 7, final: 7, semi: 6, quarter: 5, roundOf16: 4, roundOf32: 3, groups: 3, early: 3 };
/** Copa do Mundo: 3 nos grupos, mais um por fase. */
const WORLD_CUP_GAMES: StageTable = { champion: 8, final: 8, semi: 7, quarter: 6, roundOf16: 5, roundOf32: 4, groups: 3, early: 3 };
/** Continental de seleções: 3 nos grupos, mais um por fase. */
const NATIONS_CUP_GAMES: StageTable = { champion: 7, final: 7, semi: 6, quarter: 5, roundOf16: 4, roundOf32: 3, groups: 3, early: 3 };

function gamesTable(kind: CompetitionKind): StageTable {
  switch (kind) {
    case "cup":
      return CUP_GAMES;
    case "leagueCup":
      return LEAGUE_CUP_GAMES;
    case "continental1":
    case "continental2":
    case "continental3":
      return CONTINENTAL_GAMES;
    case "clubWorldCup":
      return CLUB_WORLD_CUP_GAMES;
    case "worldCup":
      return WORLD_CUP_GAMES;
    case "nationsCup":
      return NATIONS_CUP_GAMES;
    default:
      return CUP_GAMES;
  }
}

export function gamesForStage(kind: CompetitionKind, stage: Stage): number {
  return gamesTable(kind)[stage];
}

/** Uma competição disputada na temporada. */
export interface CompetitionEntry {
  readonly competition: string;
  readonly kind: CompetitionKind;
  /** Fase alcançada; na liga, `null` e a posição vem em `position`. */
  readonly stage: Stage | null;
  readonly position: number | null;
  /** Jogos do clube (ou da seleção) nela. */
  readonly games: number;
  readonly champion: boolean;
}

function kindOf(competition: string): CompetitionKind {
  const found = getCompetition(competition);
  if (!found) throw new Error(`motor: competição desconhecida ${competition}`);
  return found.kind;
}

function knockoutEntry(result: KnockoutResult, id: string): CompetitionEntry | null {
  const position = result.order.indexOf(id);
  if (position < 0) return null;
  const kind = kindOf(result.competition);
  const stage = stageAt(position, result.format);
  return { competition: result.competition, kind, stage, position: null, games: gamesForStage(kind, stage), champion: position === 0 };
}

/** Tudo que um clube disputou na temporada, com fase, jogos e títulos. */
export function clubCompetitions(results: SeasonResults, club: string): CompetitionEntry[] {
  const entries: CompetitionEntry[] = [];

  for (const match of Object.values(results.superCups)) {
    if (match.home !== club && match.away !== club) continue;
    const won = match.winner === club;
    entries.push({
      competition: match.competition,
      kind: kindOf(match.competition),
      stage: won ? "champion" : "final",
      position: null,
      games: 1,
      champion: won,
    });
  }

  for (const league of Object.values(results.leagues)) {
    const row = league.rows.find((candidate) => candidate.club === club);
    if (!row) continue;
    entries.push({
      competition: league.competition,
      kind: league.division === 1 ? "league" : "second",
      stage: null,
      position: row.position,
      games: league.games,
      champion: row.position === 1,
    });
  }

  for (const result of [...Object.values(results.cups), ...Object.values(results.continental)]) {
    const entry = knockoutEntry(result, club);
    if (entry) entries.push(entry);
  }

  const intercontinental = results.intercontinental;
  if (intercontinental) {
    const { final, bracket } = intercontinental;
    const inFinal = final.home === club || final.away === club;
    const inBracket = bracket.includes(club);
    if (inFinal || inBracket) {
      const won = final.winner === club;
      entries.push({
        competition: "intercontinental",
        kind: "intercontinental",
        stage: won ? "champion" : inFinal ? "final" : "semi",
        position: null,
        games: (inBracket ? 1 : 0) + (inFinal ? 1 : 0),
        champion: won,
      });
    }
  }

  if (results.clubWorldCup) {
    const entry = knockoutEntry(results.clubWorldCup, club);
    if (entry) entries.push(entry);
  }
  return entries;
}

/** Os torneios de seleção do ano em que o país entrou. */
export function nationCompetitions(results: SeasonResults, country: CountryCode): CompetitionEntry[] {
  return Object.values(results.nations).flatMap((result) => {
    const entry = knockoutEntry(result, country);
    return entry ? [entry] : [];
  });
}

/** Soma de jogos de uma lista de competições. */
export function totalGames(entries: readonly CompetitionEntry[]): number {
  return entries.reduce((total, entry) => total + entry.games, 0);
}
