import { type CountryCode, getClub, getCountry, leagueAt, titleImportance } from "@craque/world";
import { decideAwards, type AwardsOutcome } from "../awards/awards";
import type { CrownEntry, Placing } from "../awards/crowns";
import { evolveSeason, type SeasonEvolutionInput, type SeasonEvolutionReport } from "../evolution/evolve";
import type { TrainingFocus } from "../evolution/training";
import { clamp } from "../math";
import { attributesAt, ovrAt, type Player } from "../player/player";
import { isGoalkeeper } from "../player/positions";
import { EMPTY_TALLY, PRESSURE, type RecordTally, thinUnits } from "../records/pressure";
import { stream } from "../rng";
import type { Difficulty, Six } from "../types";
import { clubIndex } from "../world/model";
import { confederationOfClub, currentDivision, currentStrength, simulateWorldSeason } from "../world/season";
import { CALENDAR, CLUB_IMPACT, NATIONAL_IMPACT } from "../world/tuning";
import type { CompetitionBoosts, LeagueResult, SeasonResults, WorldState } from "../world/types";
import { drawInjury, type Injury } from "./injury";
import {
  drawNationalGames,
  inTournamentSquad,
  NATIONAL_OPPOSITION,
  NATIONAL_SCORING,
  nationalParticipation,
  nationalStatus,
  type NationalStatus,
} from "./national";
import { drawProduction, type GamesShare, isLeagueKind, NO_PRODUCTION, type Production, splitGames, thinProduction } from "./production";
import { atLeastRole, rollBreakthrough, shiftRole, type SquadRole, squadRole } from "./role";
import { clubCompetitions, type CompetitionEntry, nationCompetitions, totalGames } from "./schedule";

/**
 * Uma temporada do jogador dentro do mundo (GDD 11.1):
 *
 * 1. papel no elenco pela força do clube no começo da temporada;
 * 2. o mundo inteiro, com o jogador somando força ao clube e à seleção;
 * 3. jogos, lesão (descontada antes da produção) e produção;
 * 4. seleção: jogos, torneio do ano e produção;
 * 5. títulos e prêmios;
 * 6. evolução do jogador.
 *
 * Pura: o mesmo mundo, o mesmo jogador e a mesma semente dão a mesma temporada.
 */

export interface PlayerSeasonInput {
  readonly seed: string;
  /** O mundo no começo da temporada (`world.year` é o ano dela). */
  readonly world: WorldState;
  readonly player: Player;
  readonly age: number;
  readonly nationality: CountryCode;
  readonly club: string;
  readonly difficulty: Difficulty;
  /** Torcida do clube atual, de 0 a 100. */
  readonly fans: number;
  readonly focus: TrainingFocus | null;
  readonly guarantee?: SeasonEvolutionInput["guarantee"];
  /** Temporada suspensa (GDD 11.7): sem jogos, sem títulos, sem prêmios. */
  readonly suspended?: boolean;
  /** Efeitos de evento que valem durante a temporada (GDD 18.2). */
  readonly modifiers?: SeasonModifiers;
  /**
   * O que a carreira já tem (jogos, gols, títulos), para a pressão do recorde
   * (D44). Sem ele, só as caudas da temporada valem.
   */
  readonly tally?: RecordTally;
}

/**
 * O que um evento muda numa temporada simulada. Tudo opcional; sem nada, a
 * temporada é a normal.
 */
export interface SeasonModifiers {
  /** Papel um degrau acima ou abaixo. */
  readonly roleShift?: -1 | 1;
  /** Papel mínimo garantido (piso, não teto). Vale depois do degrau. */
  readonly minimumRole?: SquadRole;
  /** Multiplica os jogos planejados (gestão de carga, meia suspensão). */
  readonly gamesScale?: number;
  /** Multiplica a chance de lesão leve. */
  readonly injuryScale?: number;
  /** Multiplica gols e assistências pelo clube. */
  readonly productionScale?: number;
  /** Multiplica o crescimento esperado. */
  readonly growthScale?: number;
  /** Capacidade emprestada ou tirada só nesta temporada (saudade de casa, vaias). */
  readonly capacityShift?: number;
  /** Força extra do clube por tipo de torneio. */
  readonly boosts?: CompetitionBoosts;
  /** Final decidida, se o clube chegar a uma. */
  readonly final?: "win" | "lose";
  /** Seleção: pular o torneio do ano ou ser chamado de qualquer jeito. */
  readonly national?: "skip" | "force";
  /** Soma à nota da Bola de Ouro e da Revelação. */
  readonly awardBonus?: number;
}

export interface NationalSeason {
  readonly status: NationalStatus;
  readonly games: number;
  readonly goals: number;
  readonly assists: number;
  readonly cleanSheets: number;
  readonly competitions: readonly CompetitionEntry[];
  /** Os números dele em cada torneio de seleção do ano. */
  readonly lines: Production["lines"];
}

export interface PlayerSeasonStats {
  readonly year: number;
  readonly age: number;
  readonly club: string;
  /** Força do clube no começo da temporada. */
  readonly clubStrength: number;
  readonly division: 1 | 2;
  /** Liga em que o clube jogou (a divisão daquela temporada). */
  readonly league: string | null;
  readonly role: SquadRole;
  readonly participation: number;
  readonly suspended: boolean;
  readonly clubGames: number;
  readonly games: number;
  readonly leagueGames: number;
  readonly injury: Injury | null;
  readonly production: Production;
  readonly competitions: readonly CompetitionEntry[];
  /** Competições ganhas pelo jogador (clube e seleção). */
  readonly titles: readonly string[];
  readonly titleImportance: number;
  readonly national: NationalSeason;
  readonly awards: AwardsOutcome;
  readonly ovrStart: number;
  readonly ovrEnd: number;
  readonly attributes: Six;
}

export interface PlayerSeasonResult {
  readonly world: WorldState;
  readonly results: SeasonResults;
  readonly player: Player;
  readonly stats: PlayerSeasonStats;
  readonly evolution: SeasonEvolutionReport;
}

function mean(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * O nível de quem disputa o prêmio de craque: a força média dos mais fortes
 * do campo (os três primeiros numa liga, os quatro primeiros num mata-mata).
 * O craque de um torneio costuma sair dali.
 */
function topField(strengths: readonly number[], count: number): number {
  const sorted = [...strengths].sort((a, b) => b - a);
  return mean(sorted.slice(0, Math.max(1, count)));
}

/** Até onde o time foi, na linguagem dos prêmios de competição. */
function placingOf(entry: CompetitionEntry, tableSize: number): Placing {
  if (entry.champion) return "champion";
  if (entry.stage === "final") return "final";
  if (entry.stage === "semi") return "semi";
  if (entry.position !== null && tableSize > 0) {
    if (entry.position <= 3) return "leagueTop";
    if (entry.position <= Math.ceil(tableSize / 4)) return "leagueUpper";
  }
  return "other";
}

/** As competições da temporada com os números dele, para a artilharia e o craque de cada uma. */
function crownEntries(
  entries: readonly CompetitionEntry[],
  production: Production,
  results: SeasonResults,
  fieldOf: (entry: CompetitionEntry) => number,
): CrownEntry[] {
  return production.lines.flatMap((line) => {
    const entry = entries.find((candidate) => candidate.competition === line.competition);
    if (!entry) return [];
    const league = Object.values(results.leagues).find((candidate) => candidate.competition === entry.competition);
    return [
      {
        competition: line.competition,
        kind: line.kind,
        teamGames: entry.games,
        leagueGames: league?.games ?? 0,
        games: line.games,
        goals: line.goals,
        assists: line.assists,
        cleanSheets: line.cleanSheets,
        field: fieldOf(entry),
        placing: placingOf(entry, league?.rows.length ?? 0),
      },
    ];
  });
}

/** Oposição média (GDD 11.4): 85% a liga, 15% o continental, se houver. */
function opposition(world: WorldState, results: SeasonResults, league: LeagueResult | null, entries: readonly CompetitionEntry[]): number {
  const strengthOf = (id: string) => world.strength[clubIndex(id)] ?? 0;
  const leagueMean = league ? mean(league.rows.map((row) => strengthOf(row.club))) : 70;
  const continental = entries.find((entry) => entry.kind.startsWith("continental") && entry.kind !== "continentalSuper");
  const field = continental ? results.continental[continental.competition] : undefined;
  if (!field) return leagueMean;
  return 0.85 * leagueMean + 0.15 * mean(field.order.map(strengthOf));
}

export function simulatePlayerSeason(input: PlayerSeasonInput): PlayerSeasonResult {
  const { seed, world, age, club, difficulty } = input;
  const modifiers = input.modifiers ?? {};
  const tally = input.tally ?? EMPTY_TALLY;
  const shift = modifiers.capacityShift ?? 0;
  // Capacidade emprestada vale só durante a temporada e é devolvida no fim.
  const player: Player = shift === 0 ? input.player : { ...input.player, capacity: input.player.capacity + shift };
  const year = world.year;
  const suspended = input.suspended ?? false;
  const ovrStart = ovrAt(player, age);
  const attributesStart = attributesAt(player, age);

  // 1. Papel no elenco.
  const clubStrength = currentStrength(world, club);
  const division = currentDivision(world, club);
  const natural = rollBreakthrough(
    stream(seed, "season", year, "role"),
    player.position,
    squadRole(player.position, ovrStart, clubStrength),
  );
  const shifted = modifiers.roleShift ? shiftRole(player.position, natural, modifiers.roleShift) : natural;
  const role = modifiers.minimumRole ? atLeastRole(player.position, shifted, modifiers.minimumRole) : shifted;
  const participation = suspended ? 0 : role.participation;

  // Seleção: a convocação vem antes do torneio, porque soma força à seleção.
  const nation = getCountry(input.nationality);
  const called: NationalStatus = suspended || !nation ? "out" : nationalStatus(ovrStart, nation.strength);
  const status: NationalStatus =
    modifiers.national === "force" && !suspended && (called === "out" || called === "occasional") ? "squad" : called;
  const skipTournament = modifiers.national === "skip";
  const nationalShare = skipTournament ? 0 : nationalParticipation(status);

  // 2. O mundo inteiro.
  const season = simulateWorldSeason(world, seed, {
    club,
    ovr: ovrStart,
    participation,
    nationality: input.nationality,
    nationalParticipation: nationalShare,
    boosts: modifiers.boosts,
    final: modifiers.final,
    records: tally,
  });
  const { results } = season;

  // 3. Jogos, lesão e produção.
  const competitions = clubCompetitions(results, club);
  const clubGames = totalGames(competitions);
  const gamesRng = stream(seed, "season", year, "games");
  const planned = suspended
    ? 0
    : clamp(Math.round(clubGames * participation * (modifiers.gamesScale ?? 1) * gamesRng.normal(1, 0.06)), 0, clubGames);
  const physicalSlot = isGoalkeeper(player.position) ? 0 : 5;
  const injury = suspended
    ? null
    : drawInjury(
        stream(seed, "injury", year),
        planned,
        age,
        attributesStart[physicalSlot],
        player.trait,
        difficulty,
        modifiers.injuryScale ?? 1,
      );
  // Pressão do recorde (D44): perto dos 1.390 jogos, cada jogo a mais precisa de mais sorte.
  const recordRng = stream(seed, "season", year, "record");
  const available = Math.max(0, planned - (injury?.lostGames ?? 0));
  const games = thinUnits(recordRng, available, [{ tail: PRESSURE.careerGames, before: tally.games }]);

  // Os jogos dele em cada competição do time, na proporção dos jogos do time.
  const split: GamesShare[] = splitGames(
    games,
    competitions.map((entry) => ({ competition: entry.competition, kind: entry.kind, games: entry.games })),
  );
  const leagueGames = split.filter((share) => isLeagueKind(share.kind)).reduce((total, share) => total + share.games, 0);
  const country = getClub(club)?.country;
  const leagueId = country ? (leagueAt(country, division)?.id ?? null) : null;
  const league = leagueId ? (results.leagues[leagueId] ?? null) : null;

  const teamStrength =
    clubStrength + CLUB_IMPACT.kappa * participation * clamp(ovrStart - clubStrength, CLUB_IMPACT.below, CLUB_IMPACT.above);
  const drawn = suspended
    ? NO_PRODUCTION
    : drawProduction(stream(seed, "season", year, "production"), {
        position: player.position,
        ovr: ovrStart,
        attributes: attributesStart,
        trait: player.trait,
        teamStrength,
        clubStrength,
        opposition: opposition(world, results, league, competitions),
        games,
        split,
        scoringScale: modifiers.productionScale ?? 1,
      });
  // Pressão do recorde (D44): gols da temporada (73) e da carreira (979),
  // assistências e, do goleiro, jogos sem sofrer gol.
  const production = thinProduction(recordRng, drawn, {
    goals: [
      { tail: PRESSURE.seasonGoals, before: 0 },
      { tail: PRESSURE.careerGoals, before: tally.goals },
    ],
    assists: [{ tail: PRESSURE.seasonAssists, before: 0 }],
    cleanSheets: isGoalkeeper(player.position) ? [{ tail: PRESSURE.seasonCleanSheets, before: 0 }] : [],
  });

  // 4. Seleção.
  const nationEntries = nation && !skipTournament ? nationCompetitions(results, nation.code) : [];
  const tournamentGames = totalGames(nationEntries);
  const nationalRng = stream(seed, "national", year);
  const nationalRecordRng = stream(seed, "national", year, "record");
  // Pressão do recorde (D44): convocações (234) e jogos da carreira (1.390).
  const nationalGames = suspended
    ? 0
    : thinUnits(nationalRecordRng, drawNationalGames(nationalRng, status, age, tournamentGames), [
        { tail: PRESSURE.caps, before: tally.caps },
        { tail: PRESSURE.careerGames, before: tally.games + games },
      ]);
  const nationStrength = nation?.strength ?? 70;
  const nationalDrawn =
    suspended || nationalGames === 0
      ? NO_PRODUCTION
      : drawProduction(stream(seed, "national", year, "production"), {
          position: player.position,
          ovr: ovrStart,
          attributes: attributesStart,
          trait: player.trait,
          teamStrength:
            nationStrength +
            NATIONAL_IMPACT.kappa * nationalShare * clamp(ovrStart - nationStrength, NATIONAL_IMPACT.below, NATIONAL_IMPACT.above),
          clubStrength: nationStrength,
          opposition: NATIONAL_OPPOSITION,
          games: nationalGames,
          // O torneio do ano tem os próprios números; amistosos e eliminatórias só somam no total.
          split: inTournamentSquad(status)
            ? nationEntries.map((entry) => ({ competition: entry.competition, kind: entry.kind, games: entry.games }))
            : [],
          scoringScale: NATIONAL_SCORING,
        });
  // Pressão do recorde (D44): gols pela seleção (146) e da carreira (979).
  const nationalProduction = thinProduction(nationalRecordRng, nationalDrawn, {
    goals: [
      { tail: PRESSURE.nationalGoals, before: tally.nationalGoals },
      { tail: PRESSURE.careerGoals, before: tally.goals + production.goals },
    ],
  });
  const national: NationalSeason = {
    status,
    games: nationalGames,
    goals: nationalProduction.goals,
    assists: nationalProduction.assists,
    cleanSheets: nationalProduction.cleanSheets,
    competitions: nationEntries,
    lines: nationalProduction.lines,
  };

  // 5. Títulos e prêmios.
  const confederation = confederationOfClub(club);
  // Título é de quem entrou em campo na competição (D42): o garoto da base com
  // três jogos na liga leva a liga, não a copa em que nem jogou.
  const playedIn = (competition: string) => production.lines.some((line) => line.competition === competition && line.games > 0);
  const clubTitles = suspended ? [] : competitions.filter((entry) => entry.champion && playedIn(entry.competition));
  const nationTitles =
    suspended || !inTournamentSquad(status) || nationalGames === 0 ? [] : nationEntries.filter((entry) => entry.champion);
  const titles = [...clubTitles, ...nationTitles];
  const importance =
    clubTitles.reduce((total, entry) => total + titleImportance(entry.kind, confederation), 0) +
    nationTitles.reduce((total, entry) => total + titleImportance(entry.kind), 0);

  const won = (kind: string) => titles.some((entry) => entry.kind === kind);
  const strengthOf = (id: string) => world.strength[clubIndex(id)] ?? 0;
  const clubField = (entry: CompetitionEntry) => {
    const table = Object.values(results.leagues).find((candidate) => candidate.competition === entry.competition);
    if (table) return topField(table.rows.map((row) => strengthOf(row.club)), 3);
    const knockout = results.cups[entry.competition] ?? results.continental[entry.competition] ?? results.clubWorldCup;
    return knockout && knockout.competition === entry.competition ? topField(knockout.order.map(strengthOf), 4) : clubStrength;
  };
  const nationField = (entry: CompetitionEntry) => {
    const tournament = results.nations[entry.competition];
    return tournament ? topField(tournament.order.map((code) => getCountry(code)?.strength ?? 60), 4) : NATIONAL_OPPOSITION;
  };
  const nationCrowns =
    suspended || !inTournamentSquad(status) || nationalGames === 0 ? [] : crownEntries(nationEntries, nationalProduction, results, nationField);
  const awards = decideAwards(
    seed,
    year,
    world.awards,
    {
      eligible: !suspended,
      position: player.position,
      ovr: ovrStart,
      age,
      games,
      goals: production.goals,
      assists: production.assists,
      leagueGoals: production.leagueGoals,
      cleanSheets: production.cleanSheets,
      crownEntries: [...crownEntries(competitions, production, results, clubField), ...nationCrowns],
      playsInUefa: confederation === "UEFA",
      success: {
        league: won("league"),
        cup: won("cup"),
        primary: won("continental1"),
        worldCup: won("worldCup"),
        nationsCup: won("nationsCup"),
      },
      bonus: modifiers.awardBonus ?? 0,
    },
    year % 4 === CALENDAR.worldCup,
  );

  // 6. Evolução.
  const evolution = evolveSeason(
    player,
    {
      age,
      games,
      clubStrength,
      fans: input.fans,
      difficulty,
      titleImportance: importance,
      focus: input.focus,
      growthScale: modifiers.growthScale ?? 1,
      restoreCapacity: shift,
      guarantee: input.guarantee,
    },
    stream(seed, "growth", year),
  );
  // A capacidade emprestada já foi devolvida antes do bônus final de título.
  const evolved = evolution.player;

  const stats: PlayerSeasonStats = {
    year,
    age,
    club,
    clubStrength,
    division,
    league: leagueId,
    role: role.role,
    participation,
    suspended,
    clubGames,
    games,
    leagueGames,
    injury,
    production,
    competitions,
    titles: titles.map((entry) => entry.competition),
    titleImportance: importance,
    national,
    awards,
    ovrStart,
    ovrEnd: ovrAt(evolved, age),
    attributes: attributesAt(evolved, age),
  };

  return {
    world: { ...season.next, awards: awards.history },
    results,
    player: evolved,
    stats,
    evolution: evolution.report,
  };
}
