import type { Six } from "../types";
import type { SeasonRecord } from "./types";

export const VETERAN_PATHS = ["maestro", "captain", "poacher", "guardian", "athlete", "mentor"] as const;
export type VeteranPath = (typeof VETERAN_PATHS)[number];
export type PromiseLevel = "humble" | "protagonist" | "legend";
export interface SeasonPromise {
  readonly year: number;
  readonly throughYear?: number;
  readonly level: PromiseLevel;
  readonly metric: "games" | "contributions" | "cleanSheets" | "glory";
  readonly target: number;
}
export interface PromiseReport extends SeasonPromise {
  readonly actual: number;
  readonly fulfilled: boolean;
  readonly fans: number;
  readonly legacy: number;
  readonly capacity: number;
}
export type MatchScene = "penalty" | "shootout" | "breakaway" | "freeKick" | "lastAttack" | "counter" | "keeper" | "interception" | "distribution" | "penaltySave" | "aerialDuel" | "buildUp" | "lastBlock" | "overlap" | "cross" | "cover" | "pressEscape" | "switchPlay" | "throughBall" | "dribble" | "header"
  | "nearPost" | "lowCross" | "backPass" | "cornerClaim" | "longShot" | "sweeper"
  | "recoveryRun" | "secondBall" | "backPost" | "offsideTrap" | "defensiveHeader"
  | "underlap" | "earlyCross" | "cutback" | "halfTurn" | "thirdMan" | "oneTwo" | "diagonal" | "edgePass"
  | "volley" | "rebound" | "farPost" | "firstTouch" | "edgeShot" | "chipShot" | "cutInside" | "nearPostRun" | "corner" | "decisivePenalty" | "bicycle" | "goalLine" | "keeperCorner"
  | "suddenDeath" | "keeperShootout";
export interface KeyMatch {
  readonly competition: string;
  readonly team: string;
  readonly opponent: string;
  readonly national: boolean;
  readonly stage: "league" | "quarter" | "semi" | "final";
  readonly minute: number;
  readonly score: readonly [number, number];
  readonly scene: MatchScene;
  /** Cobrança da série alternada em que a disputa chegou (D91): 7 a 10 para defensor, 11 para o goleiro. */
  readonly kick?: number;
}
export interface KeyMatchResult {
  readonly match: KeyMatch;
  readonly action: string;
  readonly success: boolean;
  readonly won: boolean;
  readonly score: readonly [number, number];
  readonly penalties: readonly [number, number] | null;
  readonly goals: number;
  readonly assists: number;
  readonly fans: number;
  readonly legacy: number;
  /** Reconhecimento na evolução do ano: só o lance jogado que deu certo e venceu (D89). */
  readonly recognition: number;
}
/** Contexto reconstruído por replay; nunca vai para o save. */
export interface DramaPeriod {
  readonly remaining: number;
  readonly startAge: number;
  readonly startAttributes: Six;
  readonly event: SeasonRecord["event"];
  readonly traitor: boolean;
  readonly prepared: boolean;
  readonly queue: readonly KeyMatch[];
  /** Jogos do ano fora da fila, para trocar fases canceladas por eliminação (D89). */
  readonly reserve?: readonly KeyMatch[];
  readonly results: readonly KeyMatchResult[];
  readonly decisions: number;
}
