import type { CompetitionKind } from "@craque/world";
import { clamp } from "../math";
import { GROUP_OF, isGoalkeeper, type Position } from "../player/positions";
import { stream } from "../rng";
import { SCORING } from "../season/production";

/**
 * Os prêmios de cada competição (D42): a artilharia e o craque do torneio.
 * Valem para as ligas, as copas, os continentais e os torneios de seleção;
 * supercopas e a Intercontinental, de um ou dois jogos, não têm nenhum dos
 * dois.
 *
 * **Artilharia.** Cada competição tem a marca dos artilheiros de verdade: a
 * média dos vencedores das últimas temporadas (LaLiga 31, Premier League 27,
 * Brasileirão 19...). Abaixo da média, ninguém é artilheiro. Na média, a
 * chance já existe, e cada gol a mais aumenta: `1 - e^(-(gols - média + 1) /
 * espalhamento)`. Acima do recorde da competição, é certo.
 *
 * **Craque da competição.** Quem jogou pelo menos 60% dos jogos do time nela
 * (no mata-mata, chegando pelo menos à semifinal) concorre com uma nota:
 * a distância do OVR para o nível dos times mais fortes do torneio, o que ele
 * produziu para a posição, até onde o time foi e um pouco de sorte. Passou da
 * barra do torneio, é dele.
 */

export type CrownAward = "topScorer" | "bestPlayer";

export interface Crown {
  readonly award: CrownAward;
  readonly competition: string;
  /** Gols dele na competição (para o craque também, para o jornal). */
  readonly goals: number;
}

/** A marca dos artilheiros de uma competição. */
export interface ScoringMark {
  /** Média dos artilheiros reais das últimas temporadas. */
  readonly mean: number;
  /** Quanto cada gol acima da média aumenta a chance. */
  readonly spread: number;
  /** O recorde da competição: acima dele, a artilharia é certa. */
  readonly record: number;
}

/**
 * Médias dos artilheiros das ligas, das últimas dez temporadas (2015-16 a
 * 2024-25 na Europa, 2015 a 2025 nas Américas), ajustadas ao número de rodadas
 * de cada liga no jogo. Levantamento de 2026-10; ver D42.
 */
const LEAGUE_MARKS: Readonly<Record<string, ScoringMark>> = {
  "premier-league": { mean: 27, spread: 3, record: 36 },
  laliga: { mean: 31, spread: 3.5, record: 50 },
  "serie-a": { mean: 28, spread: 3, record: 36 },
  bundesliga: { mean: 30, spread: 3.5, record: 41 },
  "ligue-1": { mean: 28, spread: 3.5, record: 44 },
  brasileirao: { mean: 19, spread: 2.5, record: 34 },
  "liga-profesional": { mean: 15, spread: 2.5, record: 33 },
  "liga-mx": { mean: 22, spread: 3, record: 38 },
  "usa-mls": { mean: 26, spread: 3, record: 34 },
  "liga-de-primera": { mean: 19, spread: 2.5, record: 34 },
  "liga-dimayor": { mean: 21, spread: 3, record: 36 },
  "ligapro-serie-a": { mean: 19, spread: 2.5, record: 33 },
  "copa-de-primera": { mean: 22, spread: 3, record: 36 },
  liga1: { mean: 22, spread: 3, record: 36 },
  "liga-uruguaya": { mean: 18, spread: 2.5, record: 30 },
  "liga-bolivia": { mean: 22, spread: 3, record: 40 },
  "liga-futve": { mean: 17, spread: 2.5, record: 30 },
  championship: { mean: 27, spread: 3, record: 43 },
  "laliga-2": { mean: 22, spread: 3, record: 33 },
  "serie-b": { mean: 21, spread: 3, record: 33 },
  "2-bundesliga": { mean: 22, spread: 3, record: 33 },
  "ligue-2": { mean: 21, spread: 3, record: 32 },
  "brasileirao-serie-b": { mean: 17, spread: 2.5, record: 30 },
  "primera-nacional": { mean: 16, spread: 2.5, record: 30 },
  "copa-simon-bolivar": { mean: 11, spread: 2, record: 22 },
  "primera-b": { mean: 16, spread: 2.5, record: 28 },
  "torneo-dimayor": { mean: 16, spread: 2.5, record: 28 },
  "ligapro-serie-b": { mean: 14, spread: 2, record: 26 },
  "division-intermedia": { mean: 14, spread: 2, record: 26 },
  liga2: { mean: 14, spread: 2, record: 26 },
  "segunda-division-uruguaya": { mean: 13, spread: 2, record: 24 },
  "liga-futve-2": { mean: 12, spread: 2, record: 22 },
};

/** Copas, continentais e seleções, por competição. */
const CUP_MARKS: Readonly<Record<string, ScoringMark>> = {
  "leaguecup:ENG": { mean: 5, spread: 1.5, record: 9 },
  "cont1:UEFA": { mean: 12, spread: 2, record: 17 },
  "cont2:UEFA": { mean: 8, spread: 2, record: 17 },
  "cont3:UEFA": { mean: 7, spread: 2, record: 11 },
  "cont1:CONMEBOL": { mean: 9, spread: 2, record: 17 },
  "cont2:CONMEBOL": { mean: 7, spread: 2, record: 13 },
  "cont1:CONCACAF": { mean: 6, spread: 1.5, record: 10 },
  clubworldcup: { mean: 4, spread: 1, record: 7 },
  worldcup: { mean: 6, spread: 1.5, record: 13 },
  "nations:UEFA": { mean: 5, spread: 1.5, record: 9 },
  "nations:CONMEBOL": { mean: 4, spread: 1.5, record: 9 },
  "nations:CONCACAF": { mean: 5, spread: 1.5, record: 9 },
  "nations:CAF": { mean: 5, spread: 1.5, record: 9 },
  "nations:AFC": { mean: 6, spread: 1.5, record: 9 },
  "nations:OFC": { mean: 6, spread: 2, record: 12 },
};

/** Copa nacional sem marca própria: as copas reais ficam entre 4 e 7 gols. */
const NATIONAL_CUP: ScoringMark = { mean: 5, spread: 1.5, record: 10 };

/** Os tipos de competição que têm artilharia e craque. */
export const CROWNED_KINDS: readonly CompetitionKind[] = [
  "league",
  "second",
  "cup",
  "leagueCup",
  "continental1",
  "continental2",
  "continental3",
  "clubWorldCup",
  "worldCup",
  "nationsCup",
];

export function hasCrowns(kind: CompetitionKind): boolean {
  return CROWNED_KINDS.includes(kind);
}

/** A marca da artilharia de uma competição, ou `null` se ela não tem artilharia. */
export function scoringMark(competition: string, kind: CompetitionKind, leagueGames: number): ScoringMark | null {
  if (!hasCrowns(kind)) return null;
  if (kind === "league" || kind === "second") {
    const known = LEAGUE_MARKS[competition.replace(/^league:/, "")];
    if (known) return known;
    // Liga sem levantamento: 0,75 gol por rodada na primeira divisão, 0,6 na segunda.
    const mean = Math.round(leagueGames * (kind === "league" ? 0.75 : 0.6));
    return { mean, spread: 3, record: Math.round(mean * 1.5) };
  }
  return CUP_MARKS[competition] ?? (kind === "cup" ? NATIONAL_CUP : null);
}

/** Chance de ser o artilheiro com estes gols: zero abaixo da média, certa acima do recorde. */
export function scoringCrownChance(goals: number, mark: ScoringMark): number {
  if (goals < mark.mean || goals <= 0) return 0;
  if (goals > mark.record) return 1;
  return 1 - Math.exp(-(goals - mark.mean + 1) / mark.spread);
}

// ---------------------------------------------------------- craque

/**
 * A barra de cada tipo de torneio, contra a nota (OVR menos o nível dos mais
 * fortes do campo, mais produção e campanha). Calibrada pelo harness: o craque
 * de uma liga grande é raro até para um OVR 88; para um 92 campeão, é provável.
 */
export const BEST_PLAYER_BAR: Readonly<Partial<Record<CompetitionKind, number>>> = {
  league: 10,
  second: 9,
  cup: 10,
  leagueCup: 10,
  continental1: 10,
  continental2: 9.5,
  continental3: 9.5,
  clubWorldCup: 10,
  worldCup: 10,
  nationsCup: 10.5,
};

export const BEST_PLAYER = {
  /** Fração dos jogos do time na competição que ele precisa ter jogado. */
  minShare: 0.6,
  /** Peso da produção em relação à referência da posição. */
  outputWeight: 5,
  noise: 2.2,
  success: { champion: 4, final: 2.5, semi: 1.5, leagueTop: 2, leagueUpper: 1 },
} as const;

/** Até onde o time foi na competição. */
export type Placing = "champion" | "final" | "semi" | "leagueTop" | "leagueUpper" | "other";

/** Uma competição da temporada, do jeito que os prêmios dela precisam. */
export interface CrownEntry {
  readonly competition: string;
  readonly kind: CompetitionKind;
  /** Jogos do time na competição. */
  readonly teamGames: number;
  /** Rodadas da liga (só para a marca de liga sem levantamento). */
  readonly leagueGames: number;
  /** Jogos, gols, assistências e jogos sem sofrer gol dele nela. */
  readonly games: number;
  readonly goals: number;
  readonly assists: number;
  readonly cleanSheets: number;
  /** O nível dos mais fortes do campo (três na liga, quatro no mata-mata). */
  readonly field: number;
  readonly placing: Placing;
}

/** Produção da posição numa competição, em relação a um bom jogador dela (1 = bom). */
export function positionOutput(position: Position, entry: Pick<CrownEntry, "games" | "goals" | "assists" | "cleanSheets">): number {
  if (entry.games <= 0) return 0;
  const cleanRate = entry.cleanSheets / entry.games;
  if (isGoalkeeper(position)) return cleanRate / 0.4;
  const scoring = SCORING[position];
  const attack = (entry.goals + 0.6 * entry.assists) / entry.games / (1.3 * (scoring.goals + 0.6 * scoring.assists));
  const group = GROUP_OF[position];
  if (group === "centreBack" || group === "fullback") return 0.6 * (cleanRate / 0.35) + 0.4 * attack;
  if (group === "midfield") return 0.5 * attack + 0.5 * (cleanRate / 0.35);
  return attack;
}

function placingBonus(placing: Placing): number {
  return placing === "other" ? 0 : BEST_PLAYER.success[placing];
}

/** Pode concorrer a craque: jogou o bastante e, no mata-mata, chegou pelo menos à semifinal. */
export function bestPlayerEligible(entry: CrownEntry): boolean {
  if (entry.teamGames <= 0 || entry.games < BEST_PLAYER.minShare * entry.teamGames) return false;
  if (entry.kind === "league" || entry.kind === "second") return true;
  return entry.placing === "champion" || entry.placing === "final" || entry.placing === "semi";
}

/** A nota de craque, sem a sorte. */
export function bestPlayerScore(position: Position, ovr: number, entry: CrownEntry): number {
  const output = clamp(positionOutput(position, entry), 0, 2.5);
  return ovr - entry.field + BEST_PLAYER.outputWeight * (output - 1) + placingBonus(entry.placing);
}

export interface CrownInput {
  readonly seed: string;
  readonly year: number;
  readonly eligible: boolean;
  readonly position: Position;
  readonly ovr: number;
  readonly entries: readonly CrownEntry[];
}

/**
 * Os prêmios de competição do ano. Cada competição tem o próprio sorteio
 * (`awards/ano/crown/competição`): jogar uma copa a mais nunca muda a
 * artilharia da liga.
 */
export function decideCrowns(input: CrownInput): Crown[] {
  if (!input.eligible) return [];
  const crowns: Crown[] = [];
  for (const entry of input.entries) {
    if (!hasCrowns(entry.kind) || entry.games <= 0) continue;
    const rng = stream(input.seed, "awards", input.year, "crown", entry.competition);
    const scorerRoll = rng.next();
    const bestRoll = rng.normal(0, BEST_PLAYER.noise);
    const mark = scoringMark(entry.competition, entry.kind, entry.leagueGames);
    if (mark && scorerRoll < scoringCrownChance(entry.goals, mark)) {
      crowns.push({ award: "topScorer", competition: entry.competition, goals: entry.goals });
    }
    const bar = BEST_PLAYER_BAR[entry.kind];
    if (bar !== undefined && bestPlayerEligible(entry) && bestPlayerScore(input.position, input.ovr, entry) + bestRoll > bar) {
      crowns.push({ award: "bestPlayer", competition: entry.competition, goals: entry.goals });
    }
  }
  return crowns;
}
