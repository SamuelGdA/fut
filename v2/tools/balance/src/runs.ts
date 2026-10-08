import {
  type ClubPolicy,
  type Difficulty,
  type DevelopmentRun,
  type FocusPolicy,
  type Pace,
  POSITIONS,
  runDevelopment,
} from "@craque/engine";

export interface BatchSpec {
  readonly seed: string;
  readonly careers: number;
  readonly difficulty: Difficulty;
  readonly pace: Pace;
  readonly clubPolicy: ClubPolicy;
  readonly focusPolicy: FocusPolicy;
}

/**
 * Um lote de carreiras. As posições se revezam em ordem, então todas aparecem
 * na mesma quantidade; a semente de cada carreira é a do lote mais o índice.
 */
export function runBatch(spec: BatchSpec): DevelopmentRun[] {
  const runs: DevelopmentRun[] = [];
  for (let index = 0; index < spec.careers; index += 1) {
    runs.push(
      runDevelopment({
        seed: `${spec.seed}:${index}`,
        position: POSITIONS[index % POSITIONS.length] ?? "st",
        difficulty: spec.difficulty,
        pace: spec.pace,
        clubPolicy: spec.clubPolicy,
        focusPolicy: spec.focusPolicy,
      }),
    );
  }
  return runs;
}
