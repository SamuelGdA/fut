import type { CompetitionKind } from "@craque/world";
import { GROUP_OF, isDefender, isGoalkeeper, type Position } from "../player/positions";
import { TRAIT_EFFECTS, type Trait } from "../player/traits";
import { type Counter, keepsNext, reachesTail } from "../records/pressure";
import type { Rng } from "../rng";
import type { Six } from "../types";

/**
 * Produção da temporada (GDD 11.4 e 11.5): gols e assistências por Poisson,
 * jogos sem sofrer gol por binomial. Não há teto nem portão: a raridade vem da
 * distribuição. O custo cresce com o número de jogos (algumas centenas de
 * sorteios numa temporada cheia), então simular nunca trava a interface.
 *
 * Os números saem por competição (D42): cada torneio em que ele jogou tem os
 * próprios jogos, gols, assistências e jogos sem sofrer gol, e o total é a
 * soma. A taxa por jogo é a mesma em todos, então a soma tem a mesma
 * distribuição de um sorteio só pelo total.
 */

/**
 * Gols e assistências por jogo de cada posição, antes do nível e do contexto.
 * Os gols de ataque subiram de 7% a 13% no D42, quando o treino deixou de somar a
 * finalização toda temporada: a mesma carreira de centroavante continua
 * fazendo os mesmos gols.
 */
export const SCORING: Readonly<Record<Position, { readonly goals: number; readonly assists: number }>> = {
  st: { goals: 0.385, assists: 0.12 },
  lw: { goals: 0.24, assists: 0.17 },
  rw: { goals: 0.24, assists: 0.17 },
  cam: { goals: 0.22, assists: 0.22 },
  lm: { goals: 0.15, assists: 0.17 },
  rm: { goals: 0.15, assists: 0.17 },
  cm: { goals: 0.07, assists: 0.11 },
  cdm: { goals: 0.035, assists: 0.06 },
  lb: { goals: 0.035, assists: 0.09 },
  rb: { goals: 0.035, assists: 0.09 },
  cb: { goals: 0.04, assists: 0.025 },
  gk: { goals: 0, assists: 0.004 },
};

const LEVEL_GOALS = 0.044;
const LEVEL_ASSISTS = 0.045;
const TEAM = 0.03;

/**
 * Vantagem de nível com joelho: até 10 pontos acima da oposição, cada ponto
 * vale inteiro; daí para cima, vale `ADVANTAGE_TAIL`. Sem o joelho, um
 * Fenômeno de 96 num clube grande fazia 60 gols por temporada, todo ano.
 */
const ADVANTAGE_KNEE = 10;
const ADVANTAGE_TAIL = 0.3;

export function softAdvantage(delta: number): number {
  return delta <= ADVANTAGE_KNEE ? delta : ADVANTAGE_KNEE + (delta - ADVANTAGE_KNEE) * ADVANTAGE_TAIL;
}
const SKILL = 0.035;
const CONCEDED_BASE = 1.2;
const CONCEDED_SLOPE = 0.055;
const CLEAN_SHEET_SLOPE = 1.05;

/** Atributo de finalização e de passe na carta (goleiro: manejo e reposição). */
const FINISHING_SLOT = 1;
const PASSING_SLOT = 2;

export interface ProductionInput {
  readonly position: Position;
  readonly ovr: number;
  readonly attributes: Six;
  readonly trait: Trait;
  /** Força efetiva do time na temporada (com o próprio jogador). */
  readonly teamStrength: number;
  /** Força do clube sem o jogador, para o impacto defensivo. */
  readonly clubStrength: number;
  readonly opposition: number;
  readonly games: number;
  /**
   * Os jogos dele em cada competição, somando no máximo `games`. O que sobra
   * (amistosos e eliminatórias da seleção) entra só no total.
   */
  readonly split?: readonly GamesShare[];
  /**
   * Multiplica gols e assistências. Jogo de seleção é mais travado: os maiores
   * artilheiros de seleção ficam perto de 0,55 gol por jogo.
   */
  readonly scoringScale?: number;
}

export interface ProductionRates {
  readonly goalsPerGame: number;
  readonly assistsPerGame: number;
  readonly concededPerGame: number;
  readonly cleanSheetChance: number;
}

/** Taxas esperadas por jogo, antes da fase da temporada. */
export function productionRates(input: ProductionInput, phase = 1): ProductionRates {
  const scoring = SCORING[input.position];
  const scale = input.scoringScale ?? 1;
  const team = Math.exp(TEAM * softAdvantage(input.teamStrength - input.opposition));
  const level = softAdvantage(input.ovr - input.opposition);
  const finishing = input.attributes[FINISHING_SLOT] ?? input.ovr;
  const passing = input.attributes[PASSING_SLOT] ?? input.ovr;
  const goalsPerGame =
    scoring.goals * Math.exp(LEVEL_GOALS * level) * team * Math.exp(SKILL * (finishing - input.ovr)) * phase * scale;
  const assistsPerGame =
    scoring.assists * Math.exp(LEVEL_ASSISTS * level) * team * Math.exp(SKILL * (passing - input.ovr)) * phase * scale;

  const gap = input.ovr - input.clubStrength;
  const defence = isGoalkeeper(input.position) ? 0.5 * gap : isDefender(input.position) ? 0.2 * gap : 0;
  const concededPerGame = CONCEDED_BASE * Math.exp(-CONCEDED_SLOPE * (input.teamStrength + defence - input.opposition));
  return {
    goalsPerGame,
    assistsPerGame,
    concededPerGame,
    cleanSheetChance: Math.exp(-CLEAN_SHEET_SLOPE * concededPerGame),
  };
}

/** Os jogos dele numa competição. */
export interface GamesShare {
  readonly competition: string;
  readonly kind: CompetitionKind;
  readonly games: number;
}

/** O que ele fez numa competição da temporada. */
export interface CompetitionLine extends GamesShare {
  readonly goals: number;
  readonly assists: number;
  readonly cleanSheets: number;
}

export interface Production {
  readonly goals: number;
  /** Gols nas ligas (primeira ou segunda divisão), para a Chuteira de Ouro. */
  readonly leagueGoals: number;
  readonly assists: number;
  readonly cleanSheets: number;
  /** Gols sofridos (só faz sentido para goleiro). */
  readonly conceded: number;
  /** A fase da temporada: acima de 1, tudo entrou; abaixo, nada entrou. */
  readonly phase: number;
  /** Os números de cada competição, na ordem em que vieram. */
  readonly lines: readonly CompetitionLine[];
}

export const NO_PRODUCTION: Production = { goals: 0, leagueGoals: 0, assists: 0, cleanSheets: 0, conceded: 0, phase: 1, lines: [] };

export function isLeagueKind(kind: CompetitionKind): boolean {
  return kind === "league" || kind === "second";
}

/**
 * Reparte os jogos dele entre as competições do time, na proporção dos jogos
 * do time em cada uma (maiores restos), sem passar dos jogos do time em
 * nenhuma. Sem sorteio: a mesma temporada reparte sempre igual.
 */
export function splitGames(games: number, entries: readonly GamesShare[]): GamesShare[] {
  const total = entries.reduce((sum, entry) => sum + entry.games, 0);
  if (games <= 0 || total <= 0) return entries.map((entry) => ({ ...entry, games: 0 }));
  const share = Math.min(games, total);
  const exact = entries.map((entry) => (share * entry.games) / total);
  const floors = exact.map((value, index) => Math.min(Math.floor(value), entries[index]?.games ?? 0));
  let left = share - floors.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const { index } of order) {
    if (left <= 0) break;
    if ((floors[index] ?? 0) < (entries[index]?.games ?? 0)) {
      floors[index] = (floors[index] ?? 0) + 1;
      left -= 1;
    }
  }
  return entries.map((entry, index) => ({ ...entry, games: floors[index] ?? 0 }));
}

/**
 * Sorteia a produção, competição por competição. O que sobra dos jogos fora
 * das competições (amistosos da seleção) é sorteado à parte e só entra no
 * total.
 */
export function drawProduction(rng: Rng, input: ProductionInput): Production {
  const spread = TRAIT_EFFECTS[input.trait].productionSpread;
  const phase = rng.logNormal(0, spread);
  if (input.games <= 0) return { ...NO_PRODUCTION, phase };
  const rates = productionRates(input, phase);
  const draw = (games: number) => ({
    goals: rng.poisson(rates.goalsPerGame * games),
    assists: rng.poisson(rates.assistsPerGame * games),
    cleanSheets: rng.binomial(games, rates.cleanSheetChance),
  });

  const lines: CompetitionLine[] = [];
  let assigned = 0;
  for (const share of input.split ?? []) {
    const games = Math.max(0, Math.min(share.games, input.games - assigned));
    if (games <= 0) continue;
    assigned += games;
    lines.push({ ...share, games, ...draw(games) });
  }
  const rest = draw(input.games - assigned);
  const sum = (key: "goals" | "assists" | "cleanSheets") => lines.reduce((total, line) => total + line[key], rest[key]);
  const conceded = isGoalkeeper(input.position) ? rng.poisson(rates.concededPerGame * input.games) : 0;
  return {
    goals: sum("goals"),
    leagueGoals: lines.filter((line) => isLeagueKind(line.kind)).reduce((total, line) => total + line.goals, 0),
    assists: sum("assists"),
    cleanSheets: sum("cleanSheets"),
    conceded,
    phase,
    lines,
  };
}

/** As caudas de cada número da produção (D44). Sem caudas, o número fica como saiu. */
export interface ProductionCounters {
  readonly goals?: readonly Counter[];
  readonly assists?: readonly Counter[];
  readonly cleanSheets?: readonly Counter[];
}

type Countable = "goals" | "assists" | "cleanSheets";

/**
 * Pressão do recorde na produção (D44): perto de um recorde, cada gol,
 * assistência ou jogo sem sofrer gol a mais precisa de mais sorte. As unidades
 * passam pelo sorteio numa ordem embaralhada entre as competições, para a
 * perda não cair sempre na mesma. O jogo sem sofrer gol que não entrou vira
 * um gol sofrido.
 */
export function thinProduction(rng: Rng, production: Production, counters: ProductionCounters): Production {
  const lines = production.lines.map((line) => ({ ...line }));
  const totals = { goals: production.goals, assists: production.assists, cleanSheets: production.cleanSheets };
  const thin = (key: Countable) => {
    const list = counters[key] ?? [];
    const total = production[key];
    if (list.length === 0 || !reachesTail(total, list)) return;
    // Dono de cada unidade: o índice da linha, ou -1 para o que ficou fora das competições.
    const owners: number[] = [];
    lines.forEach((line, index) => {
      for (let unit = 0; unit < line[key]; unit += 1) owners.push(index);
    });
    while (owners.length < total) owners.push(-1);
    const keptBy = new Map<number, number>();
    let kept = 0;
    for (const owner of rng.shuffle(owners)) {
      if (!keepsNext(rng, list, kept)) continue;
      kept += 1;
      keptBy.set(owner, (keptBy.get(owner) ?? 0) + 1);
    }
    lines.forEach((line, index) => {
      line[key] = keptBy.get(index) ?? 0;
    });
    totals[key] = kept;
  };
  thin("goals");
  thin("assists");
  thin("cleanSheets");
  if (totals.goals === production.goals && totals.assists === production.assists && totals.cleanSheets === production.cleanSheets) {
    return production;
  }
  return {
    ...production,
    ...totals,
    leagueGoals: lines.filter((line) => isLeagueKind(line.kind)).reduce((total, line) => total + line.goals, 0),
    conceded: production.conceded + (production.cleanSheets - totals.cleanSheets),
    lines,
  };
}

/** Ofensivo para os prêmios (GDD 13.2): atacantes e meias ofensivos. */
export function isOffensive(position: Position): boolean {
  const group = GROUP_OF[position];
  return group === "attacker" || group === "attackingMid";
}
