import type { AwardKey } from "@craque/world";
import { clamp } from "../math";
import { isGoalkeeper, type Position } from "../player/positions";
import { ballonKeepChance, goldenShoeKeepChance } from "../records/pressure";
import { type Rng, stream } from "../rng";
import { isOffensive, productionRates } from "../season/production";
import type { Six } from "../types";
import type { AwardHistory } from "../world/types";
import { type Crown, type CrownEntry, decideCrowns } from "./crowns";
import { activeElite, type EliteCandidate } from "./elite";

/**
 * Prêmios individuais (GDD 13). Bola de Ouro, Luva de Ouro e Prêmio
 * Revelação são eleições entre o jogador e a elite; a Chuteira de Ouro é uma
 * marca a bater; a artilharia e o craque de cada competição estão em
 * `crowns.ts` (D42). Nenhum prêmio tem teto de contagem (invariante 4): a
 * raridade vem das notas e, perto dos recordes (oito Bolas de Ouro, quatro
 * seguidas, seis Chuteiras de Ouro), da pressão do recorde (D44).
 */

/** Identificador do jogador nas listas de vencedores. */
export const PLAYER = "player";

export const BALLON = {
  successWeight: 2.2,
  noise: 1.6,
  minGames: 25,
  damperPerTitle: 2,
  damperMax: 5,
  showUpTo: 30,
  /**
   * Força do campo: soma à nota de cada candidato da elite. A elite resume
   * centenas de jogadores reais num punhado de nomes; o bônus representa o
   * resto do mundo que também disputa o prêmio. Calibrado pelo harness.
   */
  fieldBonus: 3.3,
  /** Fama: abaixo desta idade, o votante desconfia de quem acabou de chegar. */
  fameAge: 22,
  famePenaltyPerYear: 0.8,
  /**
   * Prestígio: o votante lembra de quem já ganhou (Messi e Cristiano levaram 13
   * de 15 entre 2008 e 2023). Soma por Bola de Ouro anterior, com teto; o
   * amortecedor continua freando as sequências.
   */
  prestigePerTitle: 0.8,
  prestigeMax: 4,
} as const;

/** Peso dos títulos do jogador na nota (GDD 13.2). */
export const PLAYER_SUCCESS = { league: 1, cup: 0.3, primary: 2.5, worldCup: 3, nationsCup: 1.5 } as const;

/** Sucesso sorteado para cada nome da elite. */
const ELITE_SUCCESS: ReadonlyArray<readonly [number, number]> = [
  [0, 45],
  [1, 30],
  [2.5, 15],
  [3.5, 10],
];
const ELITE_WORLD_CUP = { chance: 0.08, bonus: 3 } as const;

/** Ajuste de posição: atacantes aparecem mais (GDD 13.2). */
export const POSITION_ADJUSTMENT: Readonly<Record<Position, number>> = {
  st: 0,
  lw: 0,
  rw: 0,
  cam: 0,
  lm: -0.8,
  rm: -0.8,
  cm: -0.8,
  cdm: -2,
  lb: -2,
  rb: -2,
  cb: -2.5,
  gk: -3,
};

/**
 * Chuteira de Ouro: o patamar é o artilheiro que ganharia sem o jogador. Os
 * vencedores reais da última década fizeram de 34 a 41 gols de liga.
 */
export const GOLDEN_SHOE = { mean: 35, deviation: 3.5, floor: 28, damperPerTitle: 1.2 } as const;
export const YOUNG_PLAYER = { maxAge: 21, minGames: 20 } as const;
const GOLDEN_GLOVE = { cleanSheetsPar: 15, cleanSheetsScale: 8 } as const;

/** Temporada típica de quem é da elite, para a parte de produção da nota. */
const ELITE_SEASON = { games: 48, teamCeiling: 88, opposition: 75 } as const;

export interface PlayerAwardInput {
  /** Falso em temporada suspensa: nenhum prêmio (invariante 9). */
  readonly eligible: boolean;
  readonly position: Position;
  readonly ovr: number;
  readonly age: number;
  readonly games: number;
  readonly goals: number;
  readonly assists: number;
  readonly leagueGoals: number;
  readonly cleanSheets: number;
  readonly playsInUefa: boolean;
  readonly success: {
    readonly league: boolean;
    readonly cup: boolean;
    readonly primary: boolean;
    readonly worldCup: boolean;
    readonly nationsCup: boolean;
  };
  /** As competições da temporada, para a artilharia e o craque de cada uma. */
  readonly crownEntries: readonly CrownEntry[];
  /** Soma à nota da Bola de Ouro e da Revelação (efeito de evento). */
  readonly bonus?: number;
}

export interface Ballot {
  readonly winner: string | null;
  /** Os candidatos em ordem, até o 30º. */
  readonly ranking: readonly string[];
  /** As notas, na mesma ordem do ranking. */
  readonly scores: readonly number[];
  readonly playerRank: number | null;
  /** A nota do jogador, mesmo quando ele não concorre (abaixo do mínimo de jogos). */
  readonly playerScore: number;
}

export interface Mark {
  /** `player`, um id da elite ou `club:<id>` (artilheiro de outro clube). */
  readonly winner: string | null;
  readonly goals: number;
}

export interface AwardsOutcome {
  readonly ballonDor: Ballot;
  readonly goldenGlove: Ballot;
  readonly youngPlayer: Ballot;
  readonly goldenShoe: Mark;
  /** Artilharias e craques de competição que o jogador ganhou. */
  readonly crowns: readonly Crown[];
  /** Prêmios que o jogador ganhou na temporada. */
  readonly won: readonly AwardKey[];
  readonly history: AwardHistory;
}

/** Bolas de Ouro que um candidato já ganhou. */
export function winsOf(history: readonly string[] | undefined, candidate: string): number {
  return history ? history.filter((winner) => winner === candidate).length : 0;
}

/** Títulos seguidos de um candidato até o ano anterior. */
export function streakOf(history: readonly string[] | undefined, candidate: string): number {
  if (!history) return 0;
  let streak = 0;
  for (let index = history.length - 1; index >= 0 && history[index] === candidate; index -= 1) streak += 1;
  return streak;
}

function productionTerm(position: Position, goals: number, assists: number, cleanSheets: number): number {
  return isOffensive(position)
    ? clamp((goals + 0.5 * assists - 30) / 12, -1, 3)
    : clamp((cleanSheets - 18) / 10, -1, 1.5);
}

export function playerSuccess(success: PlayerAwardInput["success"]): number {
  return (
    (success.league ? PLAYER_SUCCESS.league : 0) +
    (success.cup ? PLAYER_SUCCESS.cup : 0) +
    (success.primary ? PLAYER_SUCCESS.primary : 0) +
    (success.worldCup ? PLAYER_SUCCESS.worldCup : 0) +
    (success.nationsCup ? PLAYER_SUCCESS.nationsCup : 0)
  );
}

interface EliteSeason {
  readonly candidate: EliteCandidate;
  readonly success: number;
  readonly goals: number;
  readonly assists: number;
  readonly cleanSheets: number;
}

/** O ano de cada nome da elite: sucesso sorteado e produção esperada. */
function eliteSeasons(seed: string, year: number, worldCupYear: boolean): EliteSeason[] {
  const rng = stream(seed, "awards", year, "elite");
  return activeElite(year, seed).map((candidate) => {
    let success = rng.weighted(ELITE_SUCCESS);
    if (rng.chance(ELITE_WORLD_CUP.chance) && worldCupYear) success += ELITE_WORLD_CUP.bonus;
    const phase = rng.logNormal(0, 0.12);
    const ovr = candidate.ovr;
    const attributes: Six = [ovr, ovr, ovr, ovr, ovr, ovr];
    const rates = productionRates(
      {
        position: candidate.profile.position,
        ovr,
        attributes,
        trait: "professional",
        teamStrength: Math.min(ovr, ELITE_SEASON.teamCeiling),
        clubStrength: Math.min(ovr, ELITE_SEASON.teamCeiling),
        opposition: ELITE_SEASON.opposition,
        games: ELITE_SEASON.games,
      },
      phase,
    );
    return {
      candidate,
      success,
      goals: Math.round(rates.goalsPerGame * ELITE_SEASON.games),
      assists: Math.round(rates.assistsPerGame * ELITE_SEASON.games),
      cleanSheets: Math.round(rates.cleanSheetChance * ELITE_SEASON.games),
    };
  });
}

interface Entry {
  readonly id: string;
  readonly score: number;
}

function ballot(entries: Entry[], playerEligible: boolean, playerScore: number): Ballot {
  const ranking = [...entries].sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
  const playerIndex = ranking.findIndex((entry) => entry.id === PLAYER);
  const playerRank = playerEligible && playerIndex >= 0 && playerIndex < BALLON.showUpTo ? playerIndex + 1 : null;
  const shown = ranking.slice(0, BALLON.showUpTo);
  return {
    winner: ranking[0]?.id ?? null,
    ranking: shown.map((entry) => entry.id),
    scores: shown.map((entry) => entry.score),
    playerRank,
    playerScore,
  };
}

/** Desconto de fama para quem ainda é muito jovem (o mesmo para a elite e para o jogador). */
export function famePenalty(age: number): number {
  return Math.max(0, BALLON.fameAge - age) * BALLON.famePenaltyPerYear;
}

function ballonScore(
  position: Position,
  ovr: number,
  age: number,
  success: number,
  production: number,
  record: { readonly streak: number; readonly wins: number },
  rng: Rng,
  ballon: boolean,
): number {
  const brake = ballon ? Math.min(BALLON.damperMax, BALLON.damperPerTitle * record.streak) : 0;
  const prestige = ballon ? Math.min(BALLON.prestigeMax, BALLON.prestigePerTitle * record.wins) : 0;
  const fame = ballon ? famePenalty(age) : 0;
  return (
    ovr +
    BALLON.successWeight * success +
    production +
    POSITION_ADJUSTMENT[position] +
    prestige -
    brake -
    fame +
    rng.normal(0, BALLON.noise)
  );
}

function recordOf(history: readonly string[] | undefined, candidate: string) {
  return { streak: streakOf(history, candidate), wins: winsOf(history, candidate) };
}

const NO_RECORD = { streak: 0, wins: 0 } as const;

/** A votação com o segundo colocado no topo: o jogador ganhou na nota, mas a sorte não veio (D44). */
function runnerUpWins(result: Ballot): Ballot {
  const [first, second, ...rest] = result.ranking;
  if (!first || !second) return result;
  return { ...result, winner: second, ranking: [second, first, ...rest], playerRank: result.playerRank === null ? null : 2 };
}

/** Decide todos os prêmios do ano e devolve o histórico atualizado. */
export function decideAwards(
  seed: string,
  year: number,
  history: AwardHistory,
  player: PlayerAwardInput,
  worldCupYear: boolean,
): AwardsOutcome {
  const elite = eliteSeasons(seed, year, worldCupYear);
  const success = playerSuccess(player.success);
  const production = productionTerm(player.position, player.goals, player.assists, player.cleanSheets);

  // Bola de Ouro.
  const ballonRng = stream(seed, "awards", year, "ballon");
  const ballonEligible = player.eligible && player.games >= BALLON.minGames;
  const ballonEntries: Entry[] = elite.map((season) => ({
    id: season.candidate.profile.id,
    score:
      ballonScore(
        season.candidate.profile.position,
        season.candidate.ovr,
        season.candidate.age,
        season.success,
        productionTerm(season.candidate.profile.position, season.goals, season.assists, season.cleanSheets),
        recordOf(history.ballonDor, season.candidate.profile.id),
        ballonRng,
        true,
      ) + BALLON.fieldBonus,
  }));
  const playerBallon = ballonScore(
    player.position,
    player.ovr,
    player.age,
    success,
    production,
    recordOf(history.ballonDor, PLAYER),
    ballonRng,
    true,
  );
  if (ballonEligible) ballonEntries.push({ id: PLAYER, score: playerBallon + (player.bonus ?? 0) });
  // Pressão do recorde (D44): a Bola de Ouro ganha na votação fica com ele se a
  // sorte vier; a chance cai a cada uma depois da quarta e a cada uma seguida.
  const recordRng = stream(seed, "awards", year, "record");
  const voted = ballot(ballonEntries, ballonEligible, playerBallon);
  const keepsBallon =
    voted.winner !== PLAYER ||
    recordRng.chance(ballonKeepChance(winsOf(history.ballonDor, PLAYER), streakOf(history.ballonDor, PLAYER)));
  const ballonDor = keepsBallon ? voted : runnerUpWins(voted);

  // Luva de Ouro: eleição entre goleiros.
  const gloveRng = stream(seed, "awards", year, "glove");
  const gloveScore = (ovr: number, seasonSuccess: number, cleanSheets: number) =>
    ovr +
    BALLON.successWeight * seasonSuccess +
    clamp((cleanSheets - GOLDEN_GLOVE.cleanSheetsPar) / GOLDEN_GLOVE.cleanSheetsScale, -1, 2) +
    gloveRng.normal(0, BALLON.noise);
  const gloveEntries: Entry[] = elite
    .filter((season) => isGoalkeeper(season.candidate.profile.position))
    .map((season) => ({
      id: season.candidate.profile.id,
      score: gloveScore(season.candidate.ovr, season.success, season.cleanSheets),
    }));
  const gloveEligible = player.eligible && isGoalkeeper(player.position) && player.games >= BALLON.minGames;
  const playerGlove = gloveScore(player.ovr, success, player.cleanSheets);
  if (gloveEligible) gloveEntries.push({ id: PLAYER, score: playerGlove });
  const goldenGlove = ballot(gloveEntries, gloveEligible, playerGlove);

  // Prêmio Revelação: até 21 anos, sem amortecedor.
  const youngRng = stream(seed, "awards", year, "young");
  const youngEntries: Entry[] = elite
    .filter((season) => season.candidate.age <= YOUNG_PLAYER.maxAge)
    .map((season) => ({
      id: season.candidate.profile.id,
      score: ballonScore(
        season.candidate.profile.position,
        season.candidate.ovr,
        season.candidate.age,
        season.success,
        productionTerm(season.candidate.profile.position, season.goals, season.assists, season.cleanSheets),
        NO_RECORD,
        youngRng,
        false,
      ),
    }));
  const youngEligible = player.eligible && player.age <= YOUNG_PLAYER.maxAge && player.games >= YOUNG_PLAYER.minGames;
  const playerYoung = ballonScore(player.position, player.ovr, player.age, success, production, NO_RECORD, youngRng, false);
  if (youngEligible) youngEntries.push({ id: PLAYER, score: playerYoung + (player.bonus ?? 0) });
  const youngPlayer = ballot(youngEntries, youngEligible, playerYoung);

  // Chuteira de Ouro: só clubes da UEFA, contra um patamar sorteado.
  const shoeRng = stream(seed, "awards", year, "shoe");
  const shoeMark = Math.max(GOLDEN_SHOE.floor, Math.round(shoeRng.normal(GOLDEN_SHOE.mean, GOLDEN_SHOE.deviation)));
  const shoePick = shoeRng.next();
  const shoeTarget = shoeMark + GOLDEN_SHOE.damperPerTitle * streakOf(history.goldenShoe, PLAYER);
  const beatsMark = player.eligible && player.playsInUefa && player.leagueGoals > shoeTarget;
  // Pressão do recorde (D44): depois da terceira, cada Chuteira de Ouro a mais precisa de mais sorte.
  const keepsShoe = beatsMark && recordRng.chance(goldenShoeKeepChance(winsOf(history.goldenShoe, PLAYER)));
  let goldenShoe: Mark;
  if (keepsShoe) {
    goldenShoe = { winner: PLAYER, goals: player.leagueGoals };
  } else {
    const scorers = elite.filter((season) => season.candidate.profile.europe && isOffensive(season.candidate.profile.position));
    const weights = scorers.map((season) => Math.exp(0.35 * (season.candidate.ovr - 85)));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = shoePick * total;
    let chosen: string | null = null;
    for (let index = 0; index < scorers.length; index += 1) {
      roll -= weights[index] ?? 0;
      if (roll < 0) {
        chosen = scorers[index]?.candidate.profile.id ?? null;
        break;
      }
    }
    // Quem ganha no lugar dele fez mais gols que ele.
    const goals = beatsMark ? Math.max(shoeMark, player.leagueGoals + 1) : shoeMark;
    goldenShoe = { winner: chosen ?? scorers[scorers.length - 1]?.candidate.profile.id ?? null, goals };
  }

  // Artilharia e craque de cada competição. Quem ganha a Chuteira de Ouro é
  // o artilheiro da própria liga, sempre.
  let crowns = decideCrowns({
    seed,
    year,
    eligible: player.eligible,
    position: player.position,
    ovr: player.ovr,
    entries: player.crownEntries,
  });
  if (goldenShoe.winner === PLAYER) {
    const league = player.crownEntries.find((entry) => entry.kind === "league");
    const has = league ? crowns.some((crown) => crown.award === "topScorer" && crown.competition === league.competition) : true;
    if (league && !has) crowns = [{ award: "topScorer", competition: league.competition, goals: league.goals }, ...crowns];
  }

  const won: AwardKey[] = [];
  if (ballonDor.winner === PLAYER) won.push("ballonDor");
  if (goldenGlove.winner === PLAYER) won.push("goldenGlove");
  if (goldenShoe.winner === PLAYER) won.push("goldenShoe");
  if (youngPlayer.winner === PLAYER) won.push("youngPlayer");
  if (crowns.some((crown) => crown.award === "topScorer")) won.push("topScorer");
  if (crowns.some((crown) => crown.award === "bestPlayer")) won.push("bestPlayer");

  const append = (list: readonly string[] | undefined, winner: string | null) => (winner ? [...(list ?? []), winner] : (list ?? []));
  return {
    ballonDor,
    goldenGlove,
    youngPlayer,
    goldenShoe,
    crowns,
    won,
    history: {
      ...history,
      ballonDor: append(history.ballonDor, ballonDor.winner),
      goldenGlove: append(history.goldenGlove, goldenGlove.winner),
      goldenShoe: append(history.goldenShoe, goldenShoe.winner),
      youngPlayer: append(history.youngPlayer, youngPlayer.winner),
    },
  };
}
