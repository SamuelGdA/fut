import type { Rng } from "../rng";

/**
 * Seleção nacional (GDD 12): a convocação sai da distância entre o OVR e a
 * força da seleção, e decide quantos jogos o jogador faz por ela.
 */

export const NATIONAL_STATUSES = ["starter", "squad", "occasional", "out"] as const;
export type NationalStatus = (typeof NATIONAL_STATUSES)[number];

interface StatusStep {
  readonly status: NationalStatus;
  readonly from: number;
  /** Jogos por temporada fora de torneio, os dois inclusos. */
  readonly games: readonly [number, number];
  /** Fração dos jogos da seleção, para a força efetiva dela (GDD 8.12). */
  readonly participation: number;
}

const LADDER: readonly StatusStep[] = [
  { status: "starter", from: 2, games: [9, 11], participation: 0.85 },
  { status: "squad", from: -1, games: [5, 7], participation: 0.5 },
  { status: "occasional", from: -3, games: [1, 3], participation: 0.15 },
  { status: "out", from: Number.NEGATIVE_INFINITY, games: [0, 0], participation: 0 },
];

function stepOf(status: NationalStatus): StatusStep {
  const step = LADDER.find((candidate) => candidate.status === status);
  if (!step) throw new Error(`motor: situação de seleção desconhecida ${status}`);
  return step;
}

export function nationalStatus(ovr: number, nationStrength: number): NationalStatus {
  const gap = ovr - nationStrength;
  return (LADDER.find((step) => gap >= step.from) ?? LADDER[LADDER.length - 1])?.status ?? "out";
}

export function nationalParticipation(status: NationalStatus): number {
  return stepOf(status).participation;
}

/** Quem está no elenco do torneio do ano: titular ou elenco (GDD 12.1). */
export function inTournamentSquad(status: NationalStatus): boolean {
  return status === "starter" || status === "squad";
}

/** Multiplicador de idade nos jogos pela seleção. */
export function nationalAgeFactor(age: number): number {
  if (age <= 18) return 0.4;
  if (age <= 20) return 0.7;
  if (age <= 33) return 1;
  if (age <= 35) return 0.8;
  return 0.5;
}

/**
 * Jogos pela seleção na temporada: amistosos e eliminatórias pela situação e
 * pela idade, mais a fase alcançada no torneio do ano. Sempre um sorteio.
 */
export function drawNationalGames(rng: Rng, status: NationalStatus, age: number, tournamentGames: number): number {
  const [min, max] = stepOf(status).games;
  const regular = Math.round((min + rng.next() * (max - min)) * nationalAgeFactor(age));
  const tournament = inTournamentSquad(status) ? tournamentGames : 0;
  return regular + tournament;
}

/** Oposição média das seleções (GDD 12.2). */
export const NATIONAL_OPPOSITION = 76;

/** Fator de gols e assistências em jogo de seleção, mais travado que o de clube. */
export const NATIONAL_SCORING = 0.6;
