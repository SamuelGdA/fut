import { stream } from "../rng";
import { seasonPreview } from "./drama";
import type { KeyMatch } from "./dramaTypes";
import type { Career } from "./types";

/**
 * A tabela da liga na rodada do jogo decisivo (D96). O mundo condensado não
 * joga rodada a rodada; ele dá a tabela final do ano. A tabela da rodada é a
 * fração dela até ali: cada clube soma, rodada a rodada, o ritmo de pontos que
 * o levou ao lugar final. Assim a tabela da rodada conversa com a do fim do
 * ano, e a rodada do jogo soma, para cada clube, 3, 1 ou 0 pontos como num
 * jogo de verdade. O jogo do jogador e do adversário usa o placar da partida.
 *
 * Só mostra; não muda carreira nenhuma. Puro: o sorteio da rodada tem fluxo
 * próprio.
 */
export interface LeagueTableRow {
  readonly club: string;
  readonly position: number;
  readonly points: number;
  readonly played: number;
}

export interface LeagueSnapshot {
  readonly competition: string;
  readonly team: string;
  readonly opponent: string;
  /** A rodada do jogo decisivo, de `rounds`. */
  readonly round: number;
  readonly rounds: number;
  /** Antes da rodada: `round - 1` jogos. */
  readonly before: readonly LeagueTableRow[];
  /** O que cada um dos outros clubes soma na rodada (3, 1 ou 0). */
  readonly gains: Readonly<Record<string, number>>;
  /** Ordem final do ano, para desempatar como o mundo desempatou. */
  readonly order: Readonly<Record<string, number>>;
}

/** Pontos de um placar, do lado de quem marcou `own`. */
const resultPoints = (own: number, other: number) => (own > other ? 3 : own === other ? 1 : 0);

/** A rodada cai no fim do ano, quando o jogo decide alguma coisa: de 70% a 95% do campeonato. */
export const LEAGUE_ROUND = { from: 0.7, to: 0.95 } as const;

function sortRows(rows: readonly Omit<LeagueTableRow, "position">[], order: Readonly<Record<string, number>>): LeagueTableRow[] {
  return [...rows]
    .sort((a, b) => b.points - a.points || (order[a.club] ?? 0) - (order[b.club] ?? 0))
    .map((row, index) => ({ ...row, position: index + 1 }));
}

/** A tabela ao entrar na rodada do jogo decisivo. Fica a mesma do lance ao resultado. */
export function leagueSnapshot(career: Career, match: KeyMatch): LeagueSnapshot | null {
  if (match.stage !== "league" || match.national) return null;
  const preview = seasonPreview(career, match.team);
  const league = Object.values(preview.results.leagues).find((item) => item.competition === match.competition);
  if (!league || !league.rows.some((row) => row.club === match.team)) return null;
  const rounds = Math.max(2, league.games);
  const rng = stream(career.setup.seed, "drama", "leagueRound", career.world.year, match.competition);
  const round = Math.min(rounds, Math.max(2, Math.round(rounds * rng.real(LEAGUE_ROUND.from, LEAGUE_ROUND.to))));
  const pace = (points: number, games: number) => Math.round((points * games) / rounds);
  const order = Object.fromEntries(league.rows.map((row) => [row.club, row.position]));
  const gains: Record<string, number> = {};
  for (const row of league.rows) {
    // O que falta para o ritmo do clube vira o resultado mais próximo: vitória, empate ou derrota.
    const due = pace(row.points, round) - pace(row.points, round - 1);
    gains[row.club] = due >= 2 ? 3 : due >= 1 ? 1 : 0;
  }
  const before = sortRows(league.rows.map((row) => ({ club: row.club, points: pace(row.points, round - 1), played: round - 1 })), order);
  return { competition: match.competition, team: match.team, opponent: match.opponent, round, rounds, before, gains, order };
}

/** A tabela depois da rodada inteira, com o placar final do jogo do jogador. */
export function leagueAfter(snapshot: LeagueSnapshot, score: readonly [number, number]): LeagueTableRow[] {
  return sortRows(
    snapshot.before.map((row) => ({
      club: row.club,
      played: row.played + 1,
      points: row.points + (row.club === snapshot.team ? resultPoints(score[0], score[1]) : row.club === snapshot.opponent ? resultPoints(score[1], score[0]) : (snapshot.gains[row.club] ?? 0)),
    })),
    snapshot.order,
  );
}
