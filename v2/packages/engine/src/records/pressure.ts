import { type CountryCode, getCompetition } from "@craque/world";
import type { Rng } from "../rng";

/**
 * Pressão do recorde (D44). Recorde é para ser possível e raríssimo: um
 * jogador extraordinário, com muita sorte, chega lá; passar dele custa cada
 * vez mais. Cada número que encosta num recorde real tem uma cauda: até o
 * começo dela nada muda; dali em diante, cada unidade a mais (um gol, um jogo,
 * um título, uma Bola de Ouro) só entra se passar num sorteio, e a chance cai
 * a cada passo:
 *
 *   chance do passo n = e^(-n / escala)
 *
 * Com escala 6, o 1º gol depois do começo da cauda entra com 85%, o 10º com
 * 19%, o 15º com 8%, o 20º com 3,6%. Nada tem teto (invariante 4): a chance
 * nunca chega a zero, só fica pequena demais para acontecer sempre.
 *
 * Números da temporada (gols, assistências, jogos sem sofrer gol) contam do
 * zero a cada temporada; números da carreira (gols, jogos, convocações,
 * títulos, prêmios) contam o que a carreira já tem. Os títulos de clube são
 * do clube: quando a sorte não vem, o título fica com o vice ("perdeu na
 * última rodada", "perdeu a final"), e o mundo segue coerente.
 */

/** Começo da cauda e escala: quanto maior a escala, mais devagar a chance cai. */
export interface Tail {
  readonly start: number;
  readonly scale: number;
  /**
   * D103: a marca real, quando a pressão para de crescer nela. Passar da marca
   * custa o mesmo que alcançá-la, para superar ser raro mas possível.
   */
  readonly mark?: number;
}

/** Os recordes reais que a pressão protege (GDD 26, conferidos em setembro de 2026). */
export const REAL_MARKS = {
  seasonGoals: 73,
  careerGoals: 979,
  nationalGoals: 146,
  caps: 234,
  careerGames: 1390,
  ballonDor: 8,
  ballonStreak: 4,
  goldenShoes: 6,
  titles: 46,
  worldCups: 3,
  /** Champions League e Libertadores (Gento e companhia, Francisco Sá). */
  continental: 6,
  continentalStreak: 5,
  leagues: { ENG: 13, ESP: 12, ITA: 10, GER: 13 } as Readonly<Partial<Record<CountryCode, number>>>,
  leagueStreak: 11,
} as const;

/**
 * As três marcas que entraram na D93 com detentor real (o conteúdo traz o
 * texto): assistências numa temporada (Messi), jogos sem sofrer gol numa
 * temporada de liga (ter Stegen e Liaño) e títulos da liga francesa (Marquinhos).
 */
export const REFERENCE_MARKS = {
  /** Assistências numa temporada, todas as competições. */
  seasonAssists: 32,
  /** Jogos sem sofrer gol numa temporada de liga, goleiro. */
  seasonCleanSheets: 26,
  /** Títulos da liga francesa. */
  league: 11,
} as const;

/**
 * As caudas, calibradas por `pnpm balance:recordes` (1.500 carreiras de
 * Fenômeno perseguindo recorde): cada recorde alcançado por poucas, e o
 * melhor do lote perto da marca, nunca dezenas acima.
 */
export const PRESSURE = {
  seasonGoals: { start: 72, scale: 7 },
  seasonAssists: { start: 28, scale: 6 },
  seasonCleanSheets: { start: 30, scale: 8 },
  careerGoals: { start: 870, scale: 70 },
  nationalGoals: { start: 138, scale: 7 },
  /** D108: começa em 220, escala 13 (era 224 e 16): a Liga das Nações dá alguns jogos a mais a quem vai longe nela. */
  caps: { start: 220, scale: 13 },
  /** D105: o goleiro joga mais anos pela seleção; a cauda dele começa antes, para o recorde não sair de graça. */
  capsKeeper: { start: 216, scale: 16 },
  /** D109: começa em 1.320, escala 65 (era 1.330 e 80): com a carreira até os 40, há uma temporada a mais. */
  careerGames: { start: 1320, scale: 65 },
  /** D107: o erro no jogo-chave pesa contra quem domina muitos anos; a cauda das oito Bolas ficou mais branda. D108: escala 2,9 (era 3,2), com a Chuteira e as coroas somando à nota. */
  ballonDor: { start: 6, scale: 2.9, mark: 8 },
  /** D106: o protagonismo ajuda quem já ganha a ganhar de novo; a quarta seguida pede mais sorte (escala 0,9, era 1,5). */
  ballonStreak: { start: 3, scale: 0.9, mark: 4 },
  goldenShoes: { start: 5, scale: 1.6, mark: 6 },
  /** D108: escala 5,5 (era 6): a Liga das Nações e a Taça da Liga portuguesa somam títulos. */
  titles: { start: 38, scale: 5.5 },
  /** D106: escala 2,2 (era 3,5) para a terceira Copa voltar à faixa épica depois da recalibragem dos prêmios. */
  worldCups: { start: 2, scale: 2.2 },
  continental: { start: 5, scale: 4 },
  continentalStreak: { start: 5, scale: 2.5 },
  /** A Libertadores tem cauda própria, mais firme (D94): a Champions concentra menos títulos num clube só. */
  libertadores: { start: 4, scale: 2.5 },
  /**
   * Ligas, por país: o começo da cauda depende de quanto a liga do mundo
   * simulado concentra títulos (a Inglaterra reparte mais que a Espanha e a
   * Alemanha). Os países sem recorde na lista usam a referência.
   */
  leagues: {
    ENG: { start: 14, scale: 3 },
    ESP: { start: 13, scale: 3 },
    /** D107: escala 3,2 (era 4); a medição da D107 pôs a Serie A uma carreira acima do teto épico. */
    ITA: { start: 8, scale: 3.2 },
    GER: { start: 14, scale: 3 },
    FRA: { start: 11, scale: 3 },
  } as Readonly<Partial<Record<CountryCode, Tail>>>,
  league: { start: 10, scale: 3 },
  leagueStreak: { start: 9, scale: 6 },
} as const;

/** Chance de manter o passo `step` da cauda (1 = o primeiro depois do começo). */
export function keepChance(step: number, scale: number): number {
  return step <= 0 ? 1 : Math.exp(-step / scale);
}

/** Expoente de uma contagem que vai ganhar mais uma unidade: 0 antes da cauda. */
function exponent(count: number, tail: Tail): number {
  const step = Math.min(count + 1, tail.mark ?? Number.POSITIVE_INFINITY) - tail.start;
  return step > 0 ? step / tail.scale : 0;
}

/** Uma contagem que a unidade nova tem de vencer: a cauda e o que já havia antes. */
export interface Counter {
  readonly tail: Tail;
  readonly before: number;
}

/**
 * A próxima unidade entra? Ela tem de vencer todas as caudas que valem para
 * ela, cada uma no próprio passo (o que já havia mais `kept`, o que já entrou
 * agora). Abaixo das caudas, entra sem sorteio.
 */
export function keepsNext(rng: Rng, counters: readonly Counter[], kept: number): boolean {
  let total = 0;
  for (const { tail, before } of counters) total += exponent(before + kept, tail);
  return total === 0 || rng.chance(Math.exp(-total));
}

/** Alguma unidade de `amount` chega a alguma cauda? Se não, nada precisa ser sorteado. */
export function reachesTail(amount: number, counters: readonly Counter[]): boolean {
  return counters.some(({ tail, before }) => before + amount >= tail.start);
}

/** Quantas de `amount` unidades entram, uma a uma. */
export function thinUnits(rng: Rng, amount: number, counters: readonly Counter[]): number {
  if (!reachesTail(amount, counters)) return amount;
  let kept = 0;
  for (let unit = 0; unit < amount; unit += 1) if (keepsNext(rng, counters, kept)) kept += 1;
  return kept;
}

// ------------------------------------------------------------ a carreira

/** O que conta de uma temporada para a pressão (a temporada do motor serve). */
export interface TallySeason {
  readonly games: number;
  readonly production: { readonly goals: number };
  readonly national: { readonly games: number; readonly goals: number };
  readonly titles: readonly string[];
}

/** O que a carreira já tem antes da temporada que vai ser jogada. */
export interface RecordTally {
  /** Jogos de clube e de seleção. */
  readonly games: number;
  /** Gols de clube e de seleção (o recorde da carreira conta os dois). */
  readonly goals: number;
  readonly caps: number;
  readonly nationalGoals: number;
  /** Títulos de clube e de seleção. */
  readonly titles: number;
  /** Títulos por competição. */
  readonly titlesBy: Readonly<Record<string, number>>;
  /** Temporadas seguidas, até a última, com título de liga da primeira divisão. */
  readonly leagueStreak: number;
  /** Temporadas seguidas, até a última, com o continental principal. */
  readonly continentalStreak: number;
}

export const EMPTY_TALLY: RecordTally = {
  games: 0,
  goals: 0,
  caps: 0,
  nationalGoals: 0,
  titles: 0,
  titlesBy: {},
  leagueStreak: 0,
  continentalStreak: 0,
};

function kindOf(competition: string) {
  return getCompetition(competition)?.kind;
}

/** Soma o histórico: tudo derivado das temporadas, nada guardado à parte. */
export function recordTally(history: readonly TallySeason[]): RecordTally {
  let games = 0;
  let goals = 0;
  let caps = 0;
  let nationalGoals = 0;
  let titles = 0;
  const titlesBy: Record<string, number> = {};
  let leagueStreak = 0;
  let continentalStreak = 0;
  for (const season of history) {
    games += season.games + season.national.games;
    goals += season.production.goals + season.national.goals;
    caps += season.national.games;
    nationalGoals += season.national.goals;
    titles += season.titles.length;
    for (const id of season.titles) titlesBy[id] = (titlesBy[id] ?? 0) + 1;
    leagueStreak = season.titles.some((id) => kindOf(id) === "league") ? leagueStreak + 1 : 0;
    continentalStreak = season.titles.some((id) => kindOf(id) === "continental1") ? continentalStreak + 1 : 0;
  }
  return { games, goals, caps, nationalGoals, titles, titlesBy, leagueStreak, continentalStreak };
}

/** A cauda da liga de um país (ou a da referência, para quem não tem recorde na lista). */
export function leagueTail(country: CountryCode | undefined): Tail {
  return (country ? PRESSURE.leagues[country] : undefined) ?? PRESSURE.league;
}

/**
 * Chance de o clube (ou a seleção) do jogador ficar com um título que já
 * ganhou na simulação. Todo título passa pela cauda dos títulos da carreira;
 * a liga, o continental principal e a Copa do Mundo passam também pela
 * própria contagem, e liga e continental pela sequência.
 */
export function titleKeepChance(tally: RecordTally, competition: string): number {
  const info = getCompetition(competition);
  let total = exponent(tally.titles, PRESSURE.titles);
  const count = tally.titlesBy[competition] ?? 0;
  if (info?.kind === "league") {
    total += exponent(count, leagueTail(info.country)) + exponent(tally.leagueStreak, PRESSURE.leagueStreak);
  } else if (info?.kind === "continental1") {
    total += exponent(count, competition === "cont1:CONMEBOL" ? PRESSURE.libertadores : PRESSURE.continental) + exponent(tally.continentalStreak, PRESSURE.continentalStreak);
  } else if (info?.kind === "worldCup") {
    total += exponent(count, PRESSURE.worldCups);
  }
  return Math.exp(-total);
}

/** Chance de ficar com a Bola de Ouro que ganhou na votação, pelas que já tem e pela sequência. */
export function ballonKeepChance(wins: number, streak: number): number {
  return Math.exp(-(exponent(wins, PRESSURE.ballonDor) + exponent(streak, PRESSURE.ballonStreak)));
}

/** Chance de ficar com a Chuteira de Ouro que ganhou, pelas que já tem. */
export function goldenShoeKeepChance(wins: number): number {
  return Math.exp(-exponent(wins, PRESSURE.goldenShoes));
}
