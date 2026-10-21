import type { KeyMatchResult } from "../career/dramaTypes";
import type { KnockoutResult, LeagueResult } from "./types";

/** O mundo condensado representa uma vitória como passagem de uma fase.
 * A escolha só pode mexer no torneio e nos participantes exibidos no card. */
export function keyKnockout(result: KnockoutResult | null, matches: readonly KeyMatchResult[] = []): KnockoutResult | null {
  if (!result) return null;
  let order = [...result.order];
  for (const outcome of matches) {
    const { match, won } = outcome;
    if (match.competition !== result.competition || match.stage === "league" || !order.includes(match.team) || !order.includes(match.opponent)) continue;
    const upper = match.stage === "final" ? 0 : match.stage === "semi" ? 1 : 3;
    const lower = match.stage === "final" ? 1 : match.stage === "semi" ? 3 : 7;
    const opponentRank = order.indexOf(match.opponent);
    const placements: Array<readonly [string, number]> = [
      [match.team, won ? upper : lower],
      [match.opponent, won ? lower : Math.min(opponentRank, upper)],
    ];
    // Quem perdeu o confronto não pode reaparecer como campeão na projeção.
    order = order.filter((id) => id !== match.team && id !== match.opponent);
    for (const [team, rank] of placements.sort((a, b) => a[1] - b[1])) {
      order.splice(Math.min(rank, order.length), 0, team);
    }
  }
  return { ...result, order };
}

export function keyLeague(result: LeagueResult, matches: readonly KeyMatchResult[] = []): LeagueResult {
  const outcome = matches.find((item) => item.match.competition === result.competition && item.match.stage === "league");
  if (!outcome) return result;
  const points = (own: number, other: number) => own > other ? 3 : own === other ? 1 : 0;
  const before = outcome.match.score;
  const after = outcome.score;
  // Reação de derrota para empate soma um ponto, sem inventar uma vitória.
  const rows = result.rows.map((row) => ({ ...row, points: Math.max(0, row.points + (row.club === outcome.match.team ? points(after[0], after[1]) - points(before[0], before[1]) : row.club === outcome.match.opponent ? points(after[1], after[0]) - points(before[1], before[0]) : 0)) }));
  rows.sort((a, b) => b.points - a.points || a.position - b.position);
  return { ...result, rows: rows.map((row, index) => ({ ...row, position: index + 1 })) };
}
