import type { Confederation, CountryCode } from "@craque/world";

/**
 * Os números da simulação do mundo (GDD 8), num lugar só. Os marcados como
 * "(inicial)" no GDD são calibrados pelo harness (`pnpm balance`).
 */

/** Força efetiva do clube do jogador (GDD 8.2). */
export const CLUB_IMPACT = { kappa: 0.3, below: -3, above: 15, eliteKappa: 0.06, eliteAbove: 35, investment: 0.01 } as const;

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

/** Representantes explícitos das ligas ausentes; a mesma força em jogos e sondas. */
export function genericClubStrength(id: string): number | null {
  if (id.startsWith("generic:UEFA:")) return 79;
  if (id.startsWith("generic:CONMEBOL:")) return 75;
  if (id.startsWith("generic:CONCACAF:")) return 72;
  return GENERIC_CHAMPIONS.find(entry => entry.id === id || id.startsWith(`${entry.id}:`))?.strength ?? null;
}

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
 * D109: cada torneio continental de seleções no ano dele, como no calendário
 * real. Eurocopa, Copa América e Copa das Nações da OFC a cada quatro anos
 * (2028); Copa Ouro a cada dois, nos anos ímpares (2027); Copa da Ásia a cada
 * quatro, a partir de 2027; Copa Africana em 2027 e 2028 e depois a cada quatro
 * (2032), como a CAF decidiu em 2025.
 */
export function nationsCupYear(confederation: Confederation, year: number): boolean {
  switch (confederation) {
    case "CONCACAF":
      return year % 2 === 1;
    case "AFC":
      return year % 4 === 3;
    case "CAF":
      return year === 2027 || (year >= 2028 && year % 4 === 0) || (year < 2027 && year % 2 === 1);
    default:
      return year % 4 === CALENDAR.nationsCup;
  }
}

/**
 * D108: Liga das Nações da UEFA. A fase final é nos anos ímpares (2025, 2027),
 * entre a Copa e a Euro. Só a Liga A (as 16 seleções mais fortes no ano)
 * disputa o título. Os jogos dela (fase de liga, quartas e fase final)
 * ocupam datas de amistoso e de eliminatória: descontam dos jogos comuns de
 * seleção, para as convocações não incharem.
 */
export const NATIONS_LEAGUE = { parity: 1, size: 16 } as const;

/**
 * Força dos clubes ao longo do tempo (GDD 8.13). O equilíbrio de um campeão
 * perene fica em `sucesso / reversão` acima da força base: com os números
 * iniciais do GDD (+2,5 por ano contra 25% de volta) ele subia 10 pontos e
 * nunca mais perdia. Aqui o sucesso pesa menos e a volta à média mais.
 */
export const CLUB_DRIFT = {
  reversion: 0.3,
  noise: 0.6,
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
  readonly cupSlots?: number;
  readonly cupRunnerSecondary?: boolean;
  readonly cupRunnerFallback?: boolean;
  readonly cupEliteOnly?: boolean;
  readonly leagueCup?: "primary" | "tertiary";
  readonly leagueCupRunnerFallback?: boolean;
  readonly cupPlayoff?: boolean;
}

const EUROPE_BIG: QualificationRule = { primary: 4, secondary: 1, tertiary: 1, cup: "secondary" };
const SOUTH_SMALL: QualificationRule = { primary: 3, secondary: 4, tertiary: 0, cup: "primary" };
const SOUTH_TABLE: QualificationRule = { primary: 4, secondary: 4, tertiary: 0, cup: null };

export const QUALIFICATION: Readonly<Record<CountryCode, QualificationRule>> = {
  ENG: { ...EUROPE_BIG, tertiary: 0, leagueCup: "tertiary" },
  ESP: EUROPE_BIG,
  ITA: EUROPE_BIG,
  GER: EUROPE_BIG,
  FRA: EUROPE_BIG,
  BRA: { primary: 5, secondary: 6, tertiary: 0, cup: "primary", cupSlots: 2 },
  ARG: { primary: 5, secondary: 6, tertiary: 0, cup: "primary" },
  BOL: { ...SOUTH_SMALL, secondary: 3, cupRunnerSecondary: true },
  CHI: { ...SOUTH_SMALL, primary: 2, secondary: 3, leagueCup: "primary", leagueCupRunnerFallback: true, cupEliteOnly: true, cupRunnerFallback: true, cupPlayoff: true },
  COL: { primary: 4, secondary: 3, tertiary: 0, cup: "secondary", cupEliteOnly: true },
  ECU: { ...SOUTH_SMALL, cupRunnerFallback: true, cupEliteOnly: true },
  PAR: SOUTH_SMALL,
  PER: SOUTH_TABLE,
  URU: SOUTH_TABLE,
  VEN: SOUTH_TABLE,
  // D108: campeão e vice na Champions, o terceiro e o campeão da Taça na Europa League, o quarto na Conference.
  POR: { primary: 2, secondary: 1, tertiary: 1, cup: "secondary" },
  MEX: { primary: 6, secondary: 0, tertiary: 0, cup: null },
  USA: { primary: 5, secondary: 0, tertiary: 0, cup: "primary" },
};

/** Quantas temporadas de campeões continentais a memória guarda (para o Mundial de Clubes). */
export const PRIMARY_HISTORY = 4;

/** Temporadas simuladas antes da carreira para encher a memória (sem acesso nem mudança de força). */
export const WARM_UP_SEASONS = 4;

/** A diferença para o nível do clube define o impacto; cada OVR adicional continua ajudando. */
export function playerClubImpact(strength: number, ovr: number, participation: number): number {
  const gap = Math.max(CLUB_IMPACT.below, Math.min(CLUB_IMPACT.eliteAbove, ovr - strength));
  const base = CLUB_IMPACT.kappa * Math.min(CLUB_IMPACT.above, gap) + CLUB_IMPACT.eliteKappa * Math.max(0, gap - CLUB_IMPACT.above);
  // Um destaque carrega mais um elenco frágil, sem dar força extra a quem já está abaixo dele.
  const support = Math.max(0, Math.min(1, (76 - strength) / 16));
  return participation * (base + support * Math.max(0, Math.min(2, (gap - 8) * 0.12)));
}
