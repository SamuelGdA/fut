import {
  type ClubPolicy,
  createPlayer,
  type DevelopmentRun,
  type Difficulty,
  type FocusPolicy,
  type Pace,
  type Position,
  runDevelopment,
  type TalentBand,
} from "@craque/engine";

/** O que o laboratório pede ao motor. */
export interface EngineSetup {
  readonly position: Position;
  readonly band: TalentBand | "any";
  readonly difficulty: Difficulty;
  readonly pace: Pace;
  readonly club: ClubPolicy;
  readonly focus: FocusPolicy;
  /** Troca a cada "Outro jogador". */
  readonly draw: number;
}

export interface PopulationBand {
  readonly count: number;
  readonly p10: readonly number[];
  readonly p50: readonly number[];
  readonly p90: readonly number[];
}

/** Tentativas máximas ao procurar uma semente de uma faixa rara (Fenômeno no Difícil: 1%). */
const SEARCH_LIMIT = 4000;
const POPULATION_SIZE = 120;
const POPULATION_SEARCH_LIMIT = 30000;

/**
 * Uma semente cujo jogador nasce na faixa pedida. A busca é determinística:
 * a mesma montagem acha sempre a mesma semente.
 */
export function findSeed(setup: EngineSetup): string {
  const base = `lab:${setup.position}:${setup.difficulty}:${setup.draw}`;
  if (setup.band === "any") return base;
  for (let attempt = 0; attempt < SEARCH_LIMIT; attempt += 1) {
    const seed = `${base}:${attempt}`;
    if (createPlayer({ seed, position: setup.position, difficulty: setup.difficulty }).talent === setup.band) {
      return seed;
    }
  }
  return base;
}

export function developPlayer(setup: EngineSetup, seed: string): DevelopmentRun {
  return runDevelopment({
    seed,
    position: setup.position,
    difficulty: setup.difficulty,
    pace: setup.pace,
    clubPolicy: setup.club,
    focusPolicy: setup.focus,
  });
}

function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (sorted.length - 1) * q;
  const low = sorted[Math.floor(position)] ?? Number.NaN;
  const high = sorted[Math.ceil(position)] ?? Number.NaN;
  return low + (high - low) * (position - Math.floor(position));
}

/**
 * A faixa de jogadores parecidos: mesma posição, mesmo talento, mesma
 * dificuldade e mesmas escolhas. 80% deles ficam entre p10 e p90.
 */
export function populationBand(setup: EngineSetup, band: TalentBand): PopulationBand {
  const runs: DevelopmentRun[] = [];
  for (let attempt = 0; attempt < POPULATION_SEARCH_LIMIT && runs.length < POPULATION_SIZE; attempt += 1) {
    const seed = `pop:${setup.position}:${setup.difficulty}:${attempt}`;
    if (createPlayer({ seed, position: setup.position, difficulty: setup.difficulty }).talent !== band) continue;
    runs.push(developPlayer(setup, seed));
  }
  const ages = runs[0]?.seasons.length ?? 0;
  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];
  for (let index = 0; index < ages; index += 1) {
    const values = runs.map((run) => run.seasons[index]?.ovr ?? Number.NaN).sort((a, b) => a - b);
    p10.push(quantile(values, 0.1));
    p50.push(quantile(values, 0.5));
    p90.push(quantile(values, 0.9));
  }
  return { count: runs.length, p10, p50, p90 };
}
