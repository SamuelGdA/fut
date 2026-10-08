import {
  type CareerSandboxRun,
  createPlayer,
  createRng,
  type Difficulty,
  type Position,
  REAL_MARKS,
  type Region,
  runCareerSandbox,
  type TalentBand,
} from "@craque/engine";
import { type CountryCode, getClub } from "@craque/world";
import { mean, median, quantile, share } from "./stats";
import type { TargetResult } from "./targets";

/**
 * Carreiras inteiras dentro do mundo simulado (GDD 40.1, parte da carreira).
 * As metas de prêmio descrevem um jogador que persegue o objetivo: a política
 * de referência joga num clube do nível dele e vai para a Europa quando pode.
 */

/** Seleções de onde saem os jogadores do lote, com peso. */
const NATIONALITIES: ReadonlyArray<readonly [CountryCode, number]> = [
  ["BRA", 18],
  ["ARG", 12],
  ["FRA", 10],
  ["ESP", 10],
  ["ENG", 10],
  ["GER", 8],
  ["ITA", 7],
  ["POR", 6],
  ["NED", 5],
  ["URU", 3],
  ["COL", 3],
  ["MEX", 2],
  ["USA", 2],
  ["BEL", 2],
  ["CRO", 2],
];

export interface CareerSpec {
  readonly seed: string;
  readonly careers: number;
  readonly band: TalentBand;
  readonly positions: readonly Position[];
  readonly region: Region;
  readonly difficulty?: Difficulty;
  /** Nacionalidade fixa; sem ela, sorteia pela lista do lote. */
  readonly nationality?: CountryCode;
}

/**
 * A idade em que a carreira para no relatório. O mercado (M4) decide isso no
 * jogo; até lá, o harness aposenta quem passou dos 33 com OVR 72 ou menos, e
 * todo mundo aos 38.
 */
export const HARNESS_RETIREMENT = { from: 33, ovr: 72, latest: 38 } as const;

export interface CareerSummary {
  readonly run: CareerSandboxRun;
  readonly band: TalentBand;
  readonly position: Position;
  readonly retiredAt: number;
  readonly seasons: number;
  readonly goals: number;
  readonly ballons: number;
  readonly ballonStreak: number;
  readonly shoes: number;
  readonly primaryTitles: number;
  readonly titles: number;
  readonly peak: number;
  readonly europeSeasons: number;
}

function longestStreak(flags: readonly boolean[]): number {
  let best = 0;
  let current = 0;
  for (const flag of flags) {
    current = flag ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

export function summarize(run: CareerSandboxRun): CareerSummary {
  const retiredIndex = run.seasons.findIndex(
    (season) =>
      season.age >= HARNESS_RETIREMENT.latest || (season.age >= HARNESS_RETIREMENT.from && season.ovrEnd <= HARNESS_RETIREMENT.ovr),
  );
  const played = run.seasons.slice(0, retiredIndex < 0 ? run.seasons.length : retiredIndex + 1);
  const ballonFlags = played.map((season) => season.awards.won.includes("ballonDor"));
  return {
    run,
    band: run.born.talent,
    position: run.input.position,
    retiredAt: played[played.length - 1]?.age ?? 39,
    seasons: played.length,
    goals: played.reduce((total, season) => total + season.production.goals + season.national.goals, 0),
    ballons: ballonFlags.filter(Boolean).length,
    ballonStreak: longestStreak(ballonFlags),
    shoes: played.filter((season) => season.awards.won.includes("goldenShoe")).length,
    primaryTitles: played.reduce((total, season) => total + season.titles.filter((title) => title.startsWith("cont1:")).length, 0),
    titles: played.reduce((total, season) => total + season.titles.length, 0),
    peak: played.reduce((best, season) => Math.max(best, season.ovrEnd), 0),
    europeSeasons: played.filter((season) => isEuropeanClub(season.club)).length,
  };
}

const EUROPE = new Set(["ENG", "ESP", "ITA", "GER", "FRA"]);

function isEuropeanClub(club: string): boolean {
  return EUROPE.has(getClub(club)?.country ?? "");
}

/**
 * Um lote de carreiras de uma faixa de talento. As sementes são procuradas em
 * ordem até achar jogadores da faixa: o lote é determinístico.
 */
export function runCareers(spec: CareerSpec): CareerSummary[] {
  const summaries: CareerSummary[] = [];
  const nationRng = createRng(`${spec.seed}:nacionalidades`);
  let attempt = 0;
  while (summaries.length < spec.careers) {
    const position = spec.positions[summaries.length % spec.positions.length] ?? "st";
    const seed = `${spec.seed}:${attempt}`;
    attempt += 1;
    const difficulty = spec.difficulty ?? "normal";
    if (createPlayer({ seed, position, difficulty }).talent !== spec.band) continue;
    const nationality = spec.nationality ?? nationRng.weighted(NATIONALITIES);
    const run = runCareerSandbox({
      seed,
      position,
      nationality,
      difficulty,
      pace: "intense",
      clubPolicy: "balanced",
      region: spec.region,
      focusPolicy: "best",
    });
    summaries.push(summarize(run));
  }
  return summaries;
}

export const ATTACKING: readonly Position[] = ["st", "lw", "rw", "cam", "lm", "rm"];

export interface CareerMetrics {
  readonly phenoms: number;
  readonly ballonMedian: number;
  readonly ballonMean: number;
  readonly ballonRecord: number;
  readonly ballonFourInRow: number;
  readonly ballonAny: number;
  readonly shoeRecord: number;
  readonly shoeSamples: number;
  readonly goalsRecord: number;
  readonly phenomGoalsMedian: number;
  readonly phenomStrikerGoals: number;
  readonly phenomStrikerQuartiles: readonly [number, number];
  readonly classStrikers: number;
  readonly classStrikerGoals: number;
  readonly classStrikerGoalsQuartiles: readonly [number, number];
  readonly primaryEurope: number;
  readonly primaryHome: number;
  readonly retirementMedian: number;
  readonly peakMedian: number;
}

/** Recordes reais usados nas metas (GDD 26). */
/** As marcas reais (GDD 26), do motor: a pressão do recorde (D44) usa as mesmas. */
export const RECORDS = { ballonDor: REAL_MARKS.ballonDor, goldenShoe: REAL_MARKS.goldenShoes, careerGoals: REAL_MARKS.careerGoals } as const;

export interface CareerBatches {
  /** Fenômenos de ataque que vão para a Europa: as metas de Bola de Ouro. */
  readonly phenoms: readonly CareerSummary[];
  /** Centroavantes Fenômenos na Europa: a meta da Chuteira de Ouro. */
  readonly phenomStrikers: readonly CareerSummary[];
  /** Centroavantes Craque: a meta de gols na carreira. */
  readonly classStrikers: readonly CareerSummary[];
  /** Estrelas que ficam numa liga menor (Chile): a primária rara fora da Europa. */
  readonly smallLeague: readonly CareerSummary[];
}

export function computeCareerMetrics(batches: CareerBatches): CareerMetrics {
  const { phenoms, phenomStrikers, classStrikers, smallLeague } = batches;
  const ballons = phenoms.map((summary) => summary.ballons);
  const europeStrikers = phenomStrikers.filter((summary) => summary.europeSeasons >= 5);
  return {
    phenoms: phenoms.length,
    ballonMedian: median(ballons),
    ballonMean: mean(ballons),
    ballonRecord: share(phenoms, (summary) => summary.ballons > RECORDS.ballonDor),
    ballonFourInRow: share(phenoms, (summary) => summary.ballonStreak >= 4),
    ballonAny: share(phenoms, (summary) => summary.ballons > 0),
    shoeRecord: share(europeStrikers, (summary) => summary.shoes > RECORDS.goldenShoe),
    shoeSamples: europeStrikers.length,
    goalsRecord: share(phenoms, (summary) => summary.goals > RECORDS.careerGoals),
    phenomGoalsMedian: median(phenoms.map((summary) => summary.goals)),
    phenomStrikerGoals: median(phenomStrikers.map((summary) => summary.goals)),
    phenomStrikerQuartiles: [
      quantile(phenomStrikers.map((summary) => summary.goals), 0.25),
      quantile(phenomStrikers.map((summary) => summary.goals), 0.75),
    ],
    classStrikers: classStrikers.length,
    classStrikerGoals: median(classStrikers.map((summary) => summary.goals)),
    classStrikerGoalsQuartiles: [
      quantile(classStrikers.map((summary) => summary.goals), 0.25),
      quantile(classStrikers.map((summary) => summary.goals), 0.75),
    ],
    primaryEurope: share(phenoms, (summary) => summary.primaryTitles > 0),
    primaryHome: share(smallLeague, (summary) => summary.primaryTitles > 0),
    retirementMedian: median([...phenoms, ...classStrikers].map((summary) => summary.retiredAt)),
    peakMedian: median(phenoms.map((summary) => summary.peak)),
  };
}

const pct = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;
const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");

export function careerTargets(metrics: CareerMetrics): TargetResult[] {
  return [
    {
      id: "striker-goals",
      label: "Gols na carreira de centroavante Craque (mediana, clube e seleção)",
      target: "entre 250 e 380",
      measured: `${fixed(metrics.classStrikerGoals, 0)} (quartis ${fixed(metrics.classStrikerGoalsQuartiles[0], 0)} a ${fixed(
        metrics.classStrikerGoalsQuartiles[1],
        0,
      )})`,
      pass: metrics.classStrikerGoals >= 250 && metrics.classStrikerGoals <= 380,
    },
    {
      id: "phenom-striker-goals",
      label: "Gols na carreira de centroavante Fenômeno (mediana, clube e seleção)",
      target: "entre 500 e 750 (Lewandowski e Suárez; Messi e Cristiano são a cauda)",
      measured: `${fixed(metrics.phenomStrikerGoals, 0)} (quartis ${fixed(metrics.phenomStrikerQuartiles[0], 0)} a ${fixed(
        metrics.phenomStrikerQuartiles[1],
        0,
      )})`,
      pass: metrics.phenomStrikerGoals >= 500 && metrics.phenomStrikerGoals <= 750,
    },
    // A mediana, com metade do lote no zero, pulava entre 0 e 1 de uma amostra
    // para outra (D44): a meta diz o mesmo pela média e pela fatia que ganha.
    {
      id: "ballon-median",
      label: "Bolas de Ouro numa carreira de Fenômeno de ataque",
      target: "média entre 1 e 2, e de 40% a 60% ganham ao menos uma",
      measured: `média ${fixed(metrics.ballonMean, 2)}; ${pct(metrics.ballonAny)} ganham ao menos uma (mediana ${fixed(metrics.ballonMedian, 1)})`,
      pass: metrics.ballonMean >= 1 && metrics.ballonMean <= 2 && metrics.ballonAny >= 0.4 && metrics.ballonAny <= 0.6,
    },
    // Recorde é raríssimo (D44): estes três dizem só que ele não ficou comum;
    // que ele continua possível, quem mede é o `pnpm balance:recordes`.
    {
      id: "ballon-record",
      label: `Recorde de Bolas de Ouro (${RECORDS.ballonDor}) batido`,
      target: "raro: no máximo 2% dos Fenômenos de ataque",
      measured: pct(metrics.ballonRecord, 1),
      pass: metrics.ballonRecord <= 0.02,
    },
    {
      id: "ballon-streak",
      label: "Quatro Bolas de Ouro seguidas",
      target: "raro: no máximo 2% dos Fenômenos de ataque",
      measured: pct(metrics.ballonFourInRow, 1),
      pass: metrics.ballonFourInRow <= 0.02,
    },
    {
      id: "shoe-record",
      label: `Recorde de Chuteiras de Ouro (${RECORDS.goldenShoe}) batido`,
      target: "raro: no máximo 3% dos centroavantes Fenômenos que jogam na Europa",
      measured: `${pct(metrics.shoeRecord, 1)} (${metrics.shoeSamples} carreiras)`,
      pass: metrics.shoeRecord <= 0.03,
    },
    {
      id: "goals-record",
      label: `Recorde de gols na carreira (${RECORDS.careerGoals}) batido`,
      target: "no máximo 10% dos Fenômenos de ataque",
      measured: `${pct(metrics.goalsRecord, 1)} (mediana ${fixed(metrics.phenomGoalsMedian, 0)} gols)`,
      pass: metrics.goalsRecord <= 0.1,
    },
    {
      id: "primary-europe",
      label: "Campeão da primária continental pelo menos uma vez",
      target: "comum na Europa (50% ou mais); raro para quem fica numa liga menor, como a chilena (25% ou menos)",
      measured: `Europa ${pct(metrics.primaryEurope)}, Chile ${pct(metrics.primaryHome)}`,
      pass: metrics.primaryEurope >= 0.5 && metrics.primaryHome <= 0.25,
    },
  ];
}
