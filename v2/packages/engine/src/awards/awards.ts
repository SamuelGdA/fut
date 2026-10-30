import { type AwardKey, type CompetitionKind, type CountryCode, getCompetition } from "@craque/world";
import { clamp } from "../math";
import { isGoalkeeper, type Position } from "../player/positions";
import { ballonKeepChance, goldenShoeKeepChance } from "../records/pressure";
import { type Rng, stream } from "../rng";
import { isOffensive, productionRates } from "../season/production";
import type { Six } from "../types";
import type { AwardHistory } from "../world/types";
import type { KeyMatchResult } from "../career/dramaTypes";
import { type Crown, type CrownEntry, decideCrowns } from "./crowns";
import { activeElite, type EliteCandidate } from "./elite";

/**
 * Prêmios individuais (GDD 13). Bola de Ouro, Troféu Yashin e Prêmio
 * Revelação são eleições entre o jogador e a elite; a Chuteira de Ouro é uma
 * marca a bater; a artilharia e o craque de cada competição estão em
 * `crowns.ts` (D42). Nenhum prêmio tem teto de contagem (invariante 4): a
 * raridade vem das notas e, perto dos recordes (oito Bolas de Ouro, quatro
 * seguidas, seis Chuteiras de Ouro), da pressão do recorde (D44).
 */

/** Identificador do jogador nas listas de vencedores. */
export const PLAYER = "player";

export const BALLON = {
  outsideEuropePenalty: 8,
  outsideEuropeChance: 0.6,
  /** D106: no ano histórico fora da Europa, o desconto é este, não o cheio. */
  outsideHistoricPenalty: 1,
  outsideHistoricOvr: 91,
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
  fieldBonus: 8.6,
  /** Fama: abaixo desta idade, o votante desconfia de quem acabou de chegar. */
  fameAge: 22,
  famePenaltyPerYear: 0.8,
  /**
   * Prestígio: o votante lembra de quem já ganhou (Messi e Cristiano levaram 13
   * de 15 entre 2008 e 2023). Soma por Bola de Ouro anterior, com teto; o
   * amortecedor continua freando as sequências.
   */
  prestigePerTitle: 0.8,
  prestigeMax: 5.5,
  /**
   * Alívio para o jogador de elite (D89): a partir de 90 de OVR, a nota dele
   * ganha `eliteBase`, mais `elitePerPoint` por ponto acima de 90, até
   * `eliteMax`. Só o jogador recebe; a elite gerada já tem o bônus do campo.
   */
  eliteFrom: 90,
  eliteBase: 0.5,
  elitePerPoint: 0.1,
  eliteMax: 1,
  /**
   * Goleiro na Bola de Ouro (D90): possível, mas raríssimo. A nota dele perde
   * `keeperPenalty`; numa temporada histórica (OVR, jogos sem sofrer gol e o
   * continental principal ou a Copa do Mundo), perde só `keeperPenalty - keeperRelief`.
   */
  keeperPenalty: 13,
  keeperRelief: 5,
  keeperHistoricOvr: 93,
  keeperHistoricCleanSheets: 24,
  /**
   * D109: o OVR conta menos na Bola de Ouro; o que vale mais é o que o jogador
   * fez (títulos, produção, protagonismo, prêmios). A nota usa
   * `ovrPivot + ovrWeight × (OVR - ovrPivot)`, para a elite e para o jogador.
   */
  ovrWeight: 0.8,
  ovrPivot: 88,
  /**
   * D109: o desconto de posição pesa inteiro para ganhar (D91) e só esta
   * fração para a colocação no top 10: chegar entre os dez também é mais
   * difícil para quem joga atrás, mas bem menos que ganhar.
   */
  placementPositionShare: 0.5,
} as const;

/**
 * Quanto mais atrás joga, mais difícil a Bola de Ouro (D91): o votante olha
 * gol e decisão. Só o jogador recebe o desconto; a elite gerada já tem o
 * ajuste de posição. O goleiro tem a regra própria logo abaixo.
 */
export const BALLON_POSITION: Readonly<Record<Position, number>> = {
  st: 0, lw: 0, rw: 0, cam: 0,
  lm: 0, rm: 0, cm: 1.2,
  cdm: 2, lb: 2.6, rb: 2.6, cb: 3.4,
  gk: 0,
};

/** O desconto de posição na Bola de Ouro; o do goleiro é menor numa temporada histórica (D90). */
export function ballonPositionPenalty(player: Pick<PlayerAwardInput, "position" | "ovr" | "cleanSheets" | "success">): number {
  if (!isGoalkeeper(player.position)) return BALLON_POSITION[player.position];
  const historic = player.ovr >= BALLON.keeperHistoricOvr && player.cleanSheets >= BALLON.keeperHistoricCleanSheets && (player.success.primary || player.success.worldCup);
  return BALLON.keeperPenalty - (historic ? BALLON.keeperRelief : 0);
}

/** O alívio da Bola de Ouro pelo OVR do jogador (D89). */
export function ballonEliteBonus(ovr: number): number {
  return ovr < BALLON.eliteFrom ? 0 : Math.min(BALLON.eliteMax, BALLON.eliteBase + BALLON.elitePerPoint * (ovr - BALLON.eliteFrom));
}

/** Peso dos títulos do jogador na nota (GDD 13.2): Troféu Yashin, Revelação e Rei da América. */
export const PLAYER_SUCCESS = { league: 1, cup: 0.3, primary: 2.5, worldCup: 3, nationsCup: 1.5 } as const;

/**
 * D106: quanto cada título pesa na Bola de Ouro, como no voto de verdade. A
 * Copa do Mundo vale mais que tudo, a Champions logo atrás, a Eurocopa ou a
 * Copa América depois, a liga e então as copas menores. Uma supercopa quase
 * não aparece. Tipos fora da tabela (segunda divisão) não contam.
 */
export const BALLON_TITLE: Readonly<Partial<Record<CompetitionKind, number>>> = {
  worldCup: 4.2,
  continental1: 2.5,
  nationsCup: 1.6,
  /** D108: a Liga das Nações pesa pouco no voto, abaixo da liga. */
  nationsLeague: 0.6,
  league: 1,
  continental2: 0.7,
  clubWorldCup: 0.6,
  cup: 0.35,
  continental3: 0.35,
  intercontinental: 0.3,
  continentalSuper: 0.2,
  leagueCup: 0.15,
  superCup: 0.1,
};

/**
 * D106: o maior título conta inteiro e cada um a mais conta menos (70%, 50%,
 * 35%...). Ganhar a Copa e a Champions é melhor que só uma delas, mas três
 * copas menores não somam uma Champions.
 */
export const BALLON_TITLE_STEPS = [1, 0.7, 0.5, 0.35, 0.25, 0.2] as const;
/** D106: em ano de Copa, quem não a ganhou vê os títulos de clube pesarem menos. */
export const WORLD_CUP_SHADOW = 0.85;
/** D106: o nome da elite campeão do mundo leva parte da Copa: nem todo campeão é o craque dela. */
export const ELITE_CHAMPION_SHARE = 0.6;
/** D106: desconto do Rei da América para a escada e o protagonismo não inflarem o prêmio. */
export const AMERICA_RECALIBRATION = 1.1;
/** D106: o título em que ele decidiu o jogo-chave (lance de protagonista que deu certo) pesa mais. */
export const STARRED_TITLE = 1.25;

/**
 * D106: protagonismo nos jogos-chave. Assumir a jogada (ou a cobrança) soma à
 * nota; dar certo soma mais; o peso cresce com a fase e com a seleção. O teto
 * impede que escolher sempre a primeira opção vire fazenda de Bola de Ouro, e
 * o lance ousado tem menos chance de dar certo, o que custa jogos e títulos.
 * D107: o jogo coletivo que dá certo soma um pouco (bem menos que o lance de
 * protagonista), e qualquer lance que dá errado tira um pouquinho, mais na
 * fase final e na competição grande. São complementos: o voto segue decidido
 * por nível, produção e títulos.
 */
export const SPOTLIGHT = {
  attempt: 0.25,
  success: 0.35,
  /** D107: a segunda opção (jogo coletivo) que deu certo. */
  teamSuccess: 0.1,
  /** D107: lance que deu errado, vezes a fase e o peso da competição. */
  miss: 0.12,
  /** D107: quanto o peso do título da competição (`BALLON_TITLE`) aumenta o erro, até +50%. */
  missStake: 0.12,
  missStakeMax: 0.5,
  stage: { league: 0.7, quarter: 0.9, semi: 1.1, final: 1.4 },
  national: 1.15,
  max: 2.2,
  /** D107: o quanto os erros de um ano podem tirar, no máximo. */
  min: -0.9,
  /** O goleiro já tem regra própria na Bola de Ouro (D90): leva metade. */
  keeper: 0.5,
  actions: ["bold", "take"],
} as const;

function protagonist(action: string): boolean {
  return (SPOTLIGHT.actions as readonly string[]).includes(action);
}

/** D107: o erro pesa mais na competição que vale mais na Bola de Ouro. */
function missStake(competition: string): number {
  const kind = getCompetition(competition)?.kind;
  return 1 + Math.min(SPOTLIGHT.missStakeMax, SPOTLIGHT.missStake * (kind ? BALLON_TITLE[kind] ?? 0 : 0));
}

/** Pontos de protagonismo de uma temporada de jogos-chave (D106, D107). */
export function ballonSpotlight(results: readonly KeyMatchResult[]): number {
  const total = results.reduce((sum, result) => {
    // Abrir mão do pênalti decisivo não é lance jogado: não soma nem tira.
    if (result.action === "leave") return sum;
    const weight = SPOTLIGHT.stage[result.match.stage] * (result.match.national ? SPOTLIGHT.national : 1);
    if (!result.success) return sum - weight * SPOTLIGHT.miss * missStake(result.match.competition);
    if (protagonist(result.action)) return sum + weight * (SPOTLIGHT.attempt + SPOTLIGHT.success);
    return sum + (result.action === "team" ? weight * SPOTLIGHT.teamSuccess : 0);
  }, 0);
  return clamp(total, SPOTLIGHT.min, SPOTLIGHT.max);
}

/** D108: quanto a Chuteira de Ouro e as coroas de competição somam à nota. */
export function awardBoost(crowns: readonly Crown[], goldenShoe: boolean): number {
  const crownValue = crowns.reduce((sum, crown) => {
    const kind = getCompetition(crown.competition)?.kind;
    return sum + AWARD_BOOST.crown * (kind ? BALLON_TITLE[kind] ?? 0 : 0);
  }, 0);
  return (goldenShoe ? AWARD_BOOST.goldenShoe : 0) + Math.min(AWARD_BOOST.crownMax, crownValue);
}

/** Competições em que o lance de protagonista do jogo-chave deu certo (D106). */
export function starredCompetitions(results: readonly KeyMatchResult[]): string[] {
  return [...new Set(results.filter((result) => result.success && protagonist(result.action)).map((result) => result.match.competition))];
}

/** Os títulos da temporada na moeda da Bola de Ouro (D106), em escada. */
export function ballonTitleValue(titles: readonly { readonly kind: CompetitionKind; readonly competition: string }[], worldCupYear: boolean, starred: readonly string[] = []): number {
  const wonWorldCup = titles.some((title) => title.kind === "worldCup");
  const values = titles
    .map((title) => (BALLON_TITLE[title.kind] ?? 0) * (starred.includes(title.competition) ? STARRED_TITLE : 1) * (worldCupYear && !wonWorldCup && title.kind !== "nationsCup" ? WORLD_CUP_SHADOW : 1))
    .filter((value) => value > 0)
    .sort((a, b) => b - a);
  return values.reduce((sum, value, index) => sum + value * (BALLON_TITLE_STEPS[Math.min(index, BALLON_TITLE_STEPS.length - 1)] ?? 0), 0);
}

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
/**
 * D108: Troféu Kopa (era o Prêmio Revelação), da France Football: o melhor
 * jogador do mundo até 21 anos. A nota usa a mesma conta da Bola de Ouro
 * (escada de títulos, protagonismo, prêmios do ano, posição), sem fama nem
 * prestígio. `fieldBonus` soma a cada jovem da elite: representa o resto da
 * geração, para um jogador de 80 não ganhar só porque a elite daquele ano é
 * nova demais. Fora da Europa o voto quase não chega (nenhum vencedor real
 * jogava fora dela); a temporada histórica reduz o desconto.
 */
export const YOUNG_PLAYER = {
  maxAge: 21,
  minGames: 20,
  fieldBonus: 0,
  /** D109: fora da Europa pesa menos que na Bola de Ouro (8): o jovem que brilha na América do Sul aparece. */
  outsideEurope: 4,
  outsideHistoric: 1.5,
  /**
   * D109: o melhor jovem é quem fez mais na temporada: o OVR pesa só esta
   * fração em torno de `ovrPivot`, para a elite e para o jogador. Um garoto
   * de 80 a 83 com ano grande disputa de verdade.
   */
  ovrWeight: 0.7,
  ovrPivot: 84,
  /** D109: a produção acima da referência (gols e assistências, ou jogos sem sofrer gol) pesa o dobro: o ano grande conta mais. */
  productionWeight: 2,
  outsideHistoricOvr: 86,
  spotlightShare: 0.6,
} as const;
/**
 * D108: os prêmios do ano também pesam na Bola de Ouro e no Kopa, um pouco.
 * A Chuteira de Ouro soma `goldenShoe`; cada artilharia ou craque de
 * competição soma `crown` vezes o peso do título na escada (`BALLON_TITLE`):
 * craque da Champions vale mais que artilheiro da copa nacional. Os prêmios
 * de competição somam no máximo `crownMax`.
 */
export const AWARD_BOOST = { goldenShoe: 0.5, crown: 0.15, crownMax: 0.9 } as const;
/**
 * Troféu Yashin (antiga Luva de Ouro). `fieldBonus` soma à nota de cada goleiro
 * da elite, como a força do campo da Bola de Ouro, mas menor (D90).
 */
export const GOLDEN_GLOVE = { cleanSheetsPar: 15, cleanSheetsScale: 8, fieldBonus: 8 } as const;

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
  readonly playsInAmericas?: boolean;
  readonly eliteDivision?: boolean;
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
  /** D106: os títulos do ano, para a escada da Bola de Ouro. Sem a lista, vale a soma de `success`. */
  readonly titles?: readonly { readonly kind: CompetitionKind; readonly competition: string }[];
  /** D106: os jogos-chave do ano, para o protagonismo. */
  readonly keyMatches?: readonly KeyMatchResult[];
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
  readonly kingOfAmerica?: Ballot;
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

/**
 * D109: na Bola de Ouro, a temporada histórica de gols passa do teto de 3 da
 * produção, até 1,5 a mais (70 gols e 20 assistências chegam lá); o goleiro,
 * até 0,75. É o que o jogador fez pesando mais que o OVR.
 */
function productionBeyond(position: Position, goals: number, assists: number, cleanSheets: number): number {
  return isOffensive(position)
    ? clamp((goals + 0.5 * assists - 30) / 12 - 3, 0, 1.5)
    : clamp((cleanSheets - 18) / 10 - 1.5, 0, 0.75);
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
function eliteSeasons(seed: string, year: number, worldCupYear: boolean, worldCupChampion: CountryCode | null = null): EliteSeason[] {
  const rng = stream(seed, "awards", year, "elite");
  return activeElite(year, seed).map((candidate) => {
    let success = rng.weighted(ELITE_SUCCESS);
    const luckyCup = rng.chance(ELITE_WORLD_CUP.chance);
    // D106: com a campeã conhecida, a Copa vai para a elite daquela seleção;
    // os outros carregam a sombra do ano de Copa nos títulos de clube.
    if (worldCupYear && worldCupChampion !== null) {
      success = candidate.profile.nationality === worldCupChampion
        ? ELITE_CHAMPION_SHARE * (BALLON_TITLE.worldCup ?? 0) + (BALLON_TITLE_STEPS[1] ?? 0) * success
        : success * WORLD_CUP_SHADOW;
    } else if (luckyCup && worldCupYear) success += ELITE_WORLD_CUP.bonus;
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
  const level = ballon ? BALLON.ovrPivot + BALLON.ovrWeight * (ovr - BALLON.ovrPivot) : ovr;
  return (
    level +
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

/** D109: o quanto o OVR deixa de contar no Troféu Kopa (o desempenho pesa mais). */
function kopaOvrDiscount(ovr: number): number {
  return (1 - YOUNG_PLAYER.ovrWeight) * (ovr - YOUNG_PLAYER.ovrPivot);
}

/** D109: a colocação de uma nota contra os outros candidatos (nunca o primeiro, que já tem dono). */
function placementRank(entries: readonly Entry[], score: number): number | null {
  const ahead = entries.filter((entry) => entry.id !== PLAYER && entry.score > score).length;
  const rank = Math.max(2, ahead + 1);
  return rank <= BALLON.showUpTo ? rank : null;
}

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
  worldCupChampion: CountryCode | null = null,
): AwardsOutcome {
  const elite = eliteSeasons(seed, year, worldCupYear, worldCupChampion);
  const success = playerSuccess(player.success);
  // D106: na Bola de Ouro, os títulos entram em escada e o protagonismo dos jogos-chave soma à nota.
  const keyMatches = player.keyMatches ?? [];
  const ballonSuccess = player.titles ? ballonTitleValue(player.titles, worldCupYear, starredCompetitions(keyMatches)) : success;
  const spotlight = ballonSpotlight(keyMatches) * (isGoalkeeper(player.position) ? SPOTLIGHT.keeper : 1);
  const production = productionTerm(player.position, player.goals, player.assists, player.cleanSheets);

  // Chuteira de Ouro: só clubes da UEFA, contra um patamar sorteado.
  const shoeRng = stream(seed, "awards", year, "shoe");
  const shoeMark = Math.max(GOLDEN_SHOE.floor, Math.round(shoeRng.normal(GOLDEN_SHOE.mean, GOLDEN_SHOE.deviation)));
  const shoePick = shoeRng.next();
  const shoeTarget = shoeMark + GOLDEN_SHOE.damperPerTitle * streakOf(history.goldenShoe, PLAYER);
  const beatsMark = player.eligible && player.playsInUefa && player.leagueGoals > shoeTarget;
  // Pressão do recorde (D44): depois da terceira, cada Chuteira de Ouro a mais precisa de mais sorte.
  // D108: a Chuteira sai antes da Bola de Ouro (soma à nota dela), com a sorte do recorde em fluxo próprio.
  const keepsShoe = beatsMark && stream(seed, "awards", year, "shoeRecord").chance(goldenShoeKeepChance(winsOf(history.goldenShoe, PLAYER)));
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

  // D108: a Chuteira de Ouro e as coroas de competição somam um pouco à Bola de Ouro e ao Kopa.
  const boost = awardBoost(crowns, goldenShoe.winner === PLAYER);

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
      ) + BALLON.fieldBonus + productionBeyond(season.candidate.profile.position, season.goals, season.assists, season.cleanSheets),
  }));
  // Visibilidade internacional exige um ano histórico: domínio continental
  // ou Copa do Mundo, produção de elite e um voto excepcional em fluxo próprio.
  // D106: nesse ano o desconto de quem joga fora da Europa cai (era impossível na prática).
  const outsideHistoric = player.ovr >= BALLON.outsideHistoricOvr && player.games >= 38 && (player.success.primary || player.success.worldCup)
    && (isOffensive(player.position) ? player.goals + 0.5 * player.assists >= 50 : player.cleanSheets >= 28);
  const playerBallon = ballonScore(
    player.position,
    player.ovr,
    player.age,
    ballonSuccess,
    production,
    recordOf(history.ballonDor, PLAYER),
    ballonRng,
    true,
  ) + productionBeyond(player.position, player.goals, player.assists, player.cleanSheets) + spotlight + boost - (player.playsInUefa ? 0 : outsideHistoric ? BALLON.outsideHistoricPenalty : BALLON.outsideEuropePenalty) + ballonEliteBonus(player.ovr) - ballonPositionPenalty(player);
  if (ballonEligible) ballonEntries.push({ id: PLAYER, score: playerBallon + (player.bonus ?? 0) });
  // Pressão do recorde (D44): a Bola de Ouro ganha na votação fica com ele se a
  // sorte vier; a chance cai a cada uma depois da quarta e a cada uma seguida.
  const recordRng = stream(seed, "awards", year, "record");
  const voted = ballot(ballonEntries, ballonEligible, playerBallon);
  const outsideKeeps = player.playsInUefa || (outsideHistoric && stream(seed,"awards",year,"outsideEurope").chance(BALLON.outsideEuropeChance));
  const keepsBallon =
    voted.winner !== PLAYER ||
    (outsideKeeps && recordRng.chance(ballonKeepChance(winsOf(history.ballonDor, PLAYER), streakOf(history.ballonDor, PLAYER))));
  const decided = keepsBallon ? voted : runnerUpWins(voted);
  // D109: fora do primeiro lugar, a colocação usa só parte do desconto de posição.
  const placeScore = playerBallon + (player.bonus ?? 0) + (1 - BALLON.placementPositionShare) * ballonPositionPenalty(player);
  const ballonDor = ballonEligible && decided.winner !== PLAYER && decided.playerRank !== 2
    ? { ...decided, playerRank: placementRank(ballonEntries, placeScore) }
    : decided;

  // Troféu Yashin (antiga Luva de Ouro): eleição entre goleiros.
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
      score: gloveScore(season.candidate.ovr, season.success, season.cleanSheets) + GOLDEN_GLOVE.fieldBonus,
    }));
  const gloveEligible = player.eligible && isGoalkeeper(player.position) && player.games >= BALLON.minGames;
  const playerGlove = gloveScore(player.ovr, success, player.cleanSheets);
  if (gloveEligible) gloveEntries.push({ id: PLAYER, score: playerGlove });
  const elected = ballot(gloveEntries, gloveEligible, playerGlove);
  // Goleiro que ganha a Bola de Ouro leva o Troféu Yashin junto (D90).
  const goldenGlove = ballonDor.winner === PLAYER && gloveEligible && elected.winner !== PLAYER
    ? ballot(gloveEntries.map((entry) => entry.id === PLAYER ? { ...entry, score: Math.max(...gloveEntries.map((item) => item.score)) + 0.01 } : entry), true, playerGlove)
    : elected;

  // Troféu Kopa (D108, era o Prêmio Revelação): o melhor do mundo até 21 anos, sem amortecedor.
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
      ) + YOUNG_PLAYER.fieldBonus - kopaOvrDiscount(season.candidate.ovr)
        + (YOUNG_PLAYER.productionWeight - 1) * Math.max(0, productionTerm(season.candidate.profile.position, season.goals, season.assists, season.cleanSheets)),
    }));
  const youngEligible = player.eligible && player.age <= YOUNG_PLAYER.maxAge && player.games >= YOUNG_PLAYER.minGames;
  const youngHistoric = player.ovr >= YOUNG_PLAYER.outsideHistoricOvr && (player.success.primary || player.success.worldCup);
  const playerYoung = ballonScore(player.position, player.ovr, player.age, ballonSuccess, production, NO_RECORD, youngRng, false) - kopaOvrDiscount(player.ovr)
    + (YOUNG_PLAYER.productionWeight - 1) * Math.max(0, production)
    + YOUNG_PLAYER.spotlightShare * spotlight + boost - ballonPositionPenalty(player)
    - (player.playsInUefa ? 0 : youngHistoric ? YOUNG_PLAYER.outsideHistoric : YOUNG_PLAYER.outsideEurope);
  if (youngEligible) youngEntries.push({ id: PLAYER, score: playerYoung + (player.bonus ?? 0) });
  const youngPlayer = ballot(youngEntries, youngEligible, playerYoung);

  // El País elege quem atua nas Américas, independentemente da nacionalidade.
  // OVR ajuda a votar, mas não substitui presença e desempenho excepcionais.
  const americaRng = stream(seed, "awards", year, "america");
  const americaEntries = elite.filter((season) => season.candidate.profile.americas).map((season) => ({
    id: season.candidate.profile.id,
    score: season.candidate.ovr + BALLON.successWeight * season.success
      + 2 * productionTerm(season.candidate.profile.position, season.goals, season.assists, season.cleanSheets)
      + POSITION_ADJUSTMENT[season.candidate.profile.position] + 4 + americaRng.normal(0, BALLON.noise),
  }));
  const americaEligible = player.eligible && player.playsInAmericas === true && player.eliteDivision === true
    && player.games >= 25 && player.ovr >= 78 && production >= 0;
  // D106: o Rei da América usa a mesma escada de títulos e o mesmo protagonismo da Bola de Ouro (sem a sombra do ano de Copa).
  const americaSuccess = player.titles ? ballonTitleValue(player.titles, false, starredCompetitions(keyMatches)) : (player.success.league ? 1 : 0) + (player.success.cup ? 0.3 : 0) + (player.success.primary ? 2.5 : 0);
  const americaScore = player.ovr + BALLON.successWeight * americaSuccess + spotlight
    + 2 * production + POSITION_ADJUSTMENT[player.position] - AMERICA_RECALIBRATION + americaRng.normal(0, BALLON.noise);
  if (americaEligible) americaEntries.push({ id: PLAYER, score: americaScore });
  const kingOfAmerica = ballot(americaEntries, americaEligible, americaScore);

  const won: AwardKey[] = [];
  if (ballonDor.winner === PLAYER) won.push("ballonDor");
  if (goldenGlove.winner === PLAYER) won.push("goldenGlove");
  if (goldenShoe.winner === PLAYER) won.push("goldenShoe");
  if (youngPlayer.winner === PLAYER) won.push("youngPlayer");
  if (kingOfAmerica.winner === PLAYER) won.push("kingOfAmerica");
  if (crowns.some((crown) => crown.award === "topScorer")) won.push("topScorer");
  if (crowns.some((crown) => crown.award === "bestPlayer")) won.push("bestPlayer");

  const append = (list: readonly string[] | undefined, winner: string | null) => (winner ? [...(list ?? []), winner] : (list ?? []));
  return {
    ballonDor,
    goldenGlove,
    youngPlayer,
    kingOfAmerica,
    goldenShoe,
    crowns,
    won,
    history: {
      ...history,
      ballonDor: append(history.ballonDor, ballonDor.winner),
      goldenGlove: append(history.goldenGlove, goldenGlove.winner),
      goldenShoe: append(history.goldenShoe, goldenShoe.winner),
      youngPlayer: append(history.youngPlayer, youngPlayer.winner),
      kingOfAmerica: append(history.kingOfAmerica, kingOfAmerica.winner),
    },
  };
}

/** A rivalidade usa os mesmos números que a votação anual. */
export function eliteSeasonFor(seed: string, year: number, id: string) {
  return eliteSeasons(seed, year, year % 4 === 2).find((season) => season.candidate.profile.id === id) ?? null;
}
