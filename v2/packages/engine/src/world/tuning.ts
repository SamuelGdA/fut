import type { Confederation, CountryCode } from "@craque/world";

/**
 * Os números da simulação do mundo (GDD 8), num lugar só. Os marcados como
 * "(inicial)" no GDD são calibrados pelo harness (`pnpm balance`).
 */

/** Força efetiva do clube do jogador (GDD 8.2). */
export const CLUB_IMPACT = { kappa: 0.22, below: -3, above: 15 } as const;

/** Força efetiva da seleção do jogador (GDD 8.12). */
export const NATIONAL_IMPACT = { kappa: 0.12, below: -3, above: 15 } as const;

/** Tabela da liga (GDD 8.3). */
export const LEAGUE = {
  noise: 3.1,
  pointsBase: 1.36,
  pointsPerNote: 0.078,
  pointsMin: 0.35,
  pointsMax: 2.63,
} as const;

/** Desvio da nota em cada tipo de torneio (GDD 8.5, 8.8, 8.11, 8.12). */
export const NOISE = {
  cup: 4.2,
  leagueCup: 5.2,
  continental: 4.2,
  clubWorldCup: 3.4,
  intercontinental: 3.4,
  nations: 3,
} as const;

/** Jogo único: P(A vence) = 1 / (1 + e^(-(A - B) / escala)) (GDD 8.6). */
export const SINGLE_MATCH_SCALE = 4.5;

/** Adversários genéricos da Intercontinental quando os dados não têm clubes daquele continente (GDD 8.10). */
export const GENERIC_CHAMPIONS: ReadonlyArray<{ readonly id: string; readonly confederation: Confederation; readonly strength: number }> = [
  { id: "generic:AFC", confederation: "AFC", strength: 72 },
  { id: "generic:CAF", confederation: "CAF", strength: 74 },
  { id: "generic:OFC", confederation: "OFC", strength: 60 },
];

/** Vagas do Mundial de Clubes por confederação (GDD 8.11). */
export const CLUB_WORLD_CUP_QUOTA: Readonly<Partial<Record<Confederation, number>>> = {
  UEFA: 12,
  CONMEBOL: 6,
  CONCACAF: 4,
};

/** Vagas da Copa do Mundo (GDD 8.12): 46 diretas e 2 repescagens. */
export const WORLD_CUP_QUOTA: Readonly<Record<Confederation, number>> = {
  UEFA: 16,
  CAF: 9,
  AFC: 8,
  CONMEBOL: 6,
  CONCACAF: 6,
  OFC: 1,
};
export const WORLD_CUP_PLAYOFFS = 2;

/** Sedes da Copa do Mundo (GDD 4). Depois de 2034, sem sede fixa. */
export const WORLD_CUP_HOSTS: Readonly<Record<number, readonly CountryCode[]>> = {
  2026: ["USA", "MEX", "CAN"],
  2030: ["ESP", "POR", "MAR"],
  2034: ["KSA"],
};

/** Na Eurocopa só entram as 24 melhores notas da eliminatória (GDD 8.12). */
export const NATIONS_CUP_SIZE: Readonly<Partial<Record<Confederation, number>>> = { UEFA: 24 };

/** Calendário (GDD 4): anos de cada torneio, pelo resto da divisão por 4. */
export const CALENDAR = { worldCup: 2, nationsCup: 0, clubWorldCup: 1 } as const;

/**
 * Força dos clubes ao longo do tempo (GDD 8.13). O equilíbrio de um campeão
 * perene fica em `sucesso / reversão` acima da força base: com os números
 * iniciais do GDD (+2,5 por ano contra 25% de volta) ele subia 10 pontos e
 * nunca mais perdia. Aqui o sucesso pesa menos e a volta à média mais.
 */
export const CLUB_DRIFT = {
  reversion: 0.3,
  noise: 0.6,
  leagueTitle: 0.4,
  primary: 0.6,
  secondary: 0.25,
  cup: 0.15,
  promotion: 0.5,
  relegation: -0.8,
  bottomSurvivor: -0.2,
  bottomPlaces: 3,
  min: 35,
  max: 95,
} as const;

/**
 * Classificação continental (GDD 8.7): quantos clubes da tabela vão para cada
 * torneio e para onde vai o campeão da copa.
 */
export interface QualificationRule {
  readonly primary: number;
  readonly secondary: number;
  readonly tertiary: number;
  readonly cup: "primary" | "secondary" | null;
}

const EUROPE_BIG: QualificationRule = { primary: 4, secondary: 1, tertiary: 1, cup: "secondary" };
const SOUTH_SMALL: QualificationRule = { primary: 3, secondary: 3, tertiary: 0, cup: "primary" };

export const QUALIFICATION: Readonly<Record<CountryCode, QualificationRule>> = {
  ENG: EUROPE_BIG,
  ESP: EUROPE_BIG,
  ITA: EUROPE_BIG,
  GER: EUROPE_BIG,
  FRA: { primary: 3, secondary: 1, tertiary: 1, cup: "secondary" },
  BRA: { primary: 6, secondary: 6, tertiary: 0, cup: "primary" },
  ARG: { primary: 5, secondary: 6, tertiary: 0, cup: "primary" },
  BOL: SOUTH_SMALL,
  CHI: SOUTH_SMALL,
  COL: SOUTH_SMALL,
  ECU: SOUTH_SMALL,
  PAR: SOUTH_SMALL,
  PER: SOUTH_SMALL,
  URU: SOUTH_SMALL,
  VEN: SOUTH_SMALL,
  MEX: { primary: 5, secondary: 0, tertiary: 0, cup: null },
  USA: { primary: 5, secondary: 0, tertiary: 0, cup: "primary" },
};

/** Quantas temporadas de campeões continentais a memória guarda (para o Mundial de Clubes). */
export const PRIMARY_HISTORY = 4;

/** Temporadas simuladas antes da carreira para encher a memória (sem acesso nem mudança de força). */
export const WARM_UP_SEASONS = 4;
