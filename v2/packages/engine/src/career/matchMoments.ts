import type { Position } from "../player/positions";
import type { KeyMatch, MatchScene } from "./dramaTypes";
import type { Rng } from "../rng";

export type MatchActionKind = "shot" | "pass" | "save" | "tackle" | "hold";
/** A posição decide o contexto; a ação decide o atributo e a contribuição. */
function nativeScenes(position: Position, knockout: boolean): readonly MatchScene[] {
  if (position === "gk") return ["keeper", "distribution", "nearPost", "lowCross", "backPass", "cornerClaim", "longShot", "sweeper", ...(knockout ? ["penaltySave", "shootout"] as const : [])];
  if (position === "cb") return ["interception", "aerialDuel", "buildUp", "lastBlock", "recoveryRun", "secondBall", "backPost", "offsideTrap", "defensiveHeader", "diagonal", "goalLine"];
  if (position === "lb" || position === "rb") return ["overlap", "cross", "cover", "interception", "underlap", "earlyCross", "cutback", "recoveryRun", "backPost", "oneTwo"];
  if (position === "cdm") return ["pressEscape", "interception", "switchPlay", "lastBlock", "secondBall", "halfTurn", "thirdMan", "diagonal", "edgePass", "recoveryRun"];
  if (position === "cm") return ["throughBall", "pressEscape", "switchPlay", "lastAttack", "halfTurn", "thirdMan", "oneTwo", "diagonal", "edgePass", "edgeShot", "corner", ...(knockout ? ["decisivePenalty"] as const : [])];
  if (position === "cam") return ["throughBall", "freeKick", "lastAttack", "breakaway", "halfTurn", "thirdMan", "oneTwo", "edgePass", "edgeShot", "firstTouch", "corner", ...(knockout ? ["decisivePenalty"] as const : [])];
  if (["lw", "rw", "lm", "rm"].includes(position)) return ["dribble", "cross", "counter", "penalty", "underlap", "earlyCross", "cutback", "oneTwo", "farPost", "cutInside", "firstTouch", "corner", ...(knockout ? ["decisivePenalty"] as const : [])];
  return ["penalty", "breakaway", "header", "lastAttack", "counter", "volley", "bicycle", "rebound", "farPost", "firstTouch", "edgeShot", "chipShot", "nearPostRun", ...(knockout ? ["shootout", "decisivePenalty"] as const : [])];
}

const CREATION: readonly MatchScene[] = ["throughBall", "pressEscape", "switchPlay", "halfTurn", "thirdMan", "oneTwo", "diagonal", "edgePass", "buildUp", "cross", "underlap", "earlyCross", "cutback"];
const FINISHING: readonly MatchScene[] = ["penalty", "breakaway", "freeKick", "lastAttack", "counter", "dribble", "header", "volley", "bicycle", "rebound", "farPost", "firstTouch", "edgeShot", "chipShot", "cutInside", "nearPostRun"];
function visitingScenes(position: Position, knockout: boolean): readonly MatchScene[] {
  if (position === "gk") return ["keeperCorner"];
  if (["st", "lw", "rw"].includes(position)) return CREATION;
  const finishing = [...FINISHING, ...(knockout ? ["shootout", "decisivePenalty"] as const : [])];
  if (["lb", "rb", "cb"].includes(position)) return [...CREATION, ...finishing];
  return finishing;
}
/** Catálogo completo para conteúdo e laboratório; a frequência é decidida separadamente. */
export function matchScenes(position: Position, knockout: boolean): readonly MatchScene[] {
  return [...new Set([...nativeScenes(position, knockout), ...(position === "gk" && !knockout ? [] : visitingScenes(position, knockout))])];
}
/** Escolhe a família antes de evitar repetição, para não tornar um lance raro comum. */
export function pickMatchScene(position: Position, knockout: boolean, used: ReadonlySet<MatchScene>, rng: Rng): MatchScene {
  const native = nativeScenes(position, knockout);
  const visitors = visitingScenes(position, knockout).filter(scene => !native.includes(scene));
  const rate = position === "gk" ? knockout ? 0.008 : 0 : position === "cb" ? 0.015 : ["lb", "rb"].includes(position) ? 0.03 : ["st", "lw", "rw"].includes(position) ? 0.08 : 0.06;
  const family = visitors.length && rng.chance(rate) ? visitors : native;
  // A bicicleta não vira obrigatória quando só restam cenas ainda não vistas.
  const bicycle = family.includes("bicycle") && rng.chance(0.2);
  const pool = family.filter(scene => scene !== "bicycle" || bicycle);
  const fresh = pool.filter(scene => !used.has(scene));
  return rng.pick(fresh.length ? fresh : pool);
}
export function matchActionKind(position: Position, match: KeyMatch, action: string): MatchActionKind {
  if (action === "safe") return "hold";
  if (action === "leave") return "hold";
  if (match.scene === "keeperCorner") return action === "bold" ? "shot" : action === "team" ? "pass" : "hold";
  if (position === "gk") return ["distribution", "backPass"].includes(match.scene) ? "pass" : action === "team" ? "hold" : "save";
  if (["interception", "aerialDuel", "lastBlock", "cover", "recoveryRun", "secondBall", "backPost", "offsideTrap", "defensiveHeader", "goalLine"].includes(match.scene)) return "tackle";
  if (action === "team" || ["buildUp", "cross", "pressEscape", "switchPlay", "throughBall", "overlap", "underlap", "earlyCross", "cutback", "halfTurn", "thirdMan", "oneTwo", "diagonal", "edgePass"].includes(match.scene)) return "pass";
  return "shot";
}

/** Pesos das seis notas, na ordem da carta. Movimento e execução contam juntos. */
export function matchSkillWeights(position: Position, match: KeyMatch, action: string): readonly number[] {
  const kind = matchActionKind(position, match, action);
  if (match.scene === "keeperCorner") return action === "bold" ? [0.5, 0, 0, 0, 0.2, 0.3] : action === "team" ? [0.3, 0.2, 0, 0, 0, 0.5] : [0, 0, 0.4, 0, 0.3, 0.3];
  if (position === "gk") {
    if (kind === "hold") return ["distribution", "backPass"].includes(match.scene) ? [0, 0, 0.6, 0, 0, 0.4] : [0.15, 0.15, 0, 0.2, 0, 0.5];
    if (kind === "pass") return [0, 0, 0.8, 0, 0, 0.2];
    if (["penaltySave", "shootout", "longShot"].includes(match.scene)) return [0.15, 0.15, 0, 0.6, 0.1, 0];
    if (match.scene === "sweeper") return [0, 0.15, 0, 0.2, 0.45, 0.2];
    return [0.35, 0.35, 0, 0.15, 0, 0.15];
  }
  if (kind === "hold") {
    if (["buildUp", "cross", "pressEscape", "switchPlay", "throughBall", "dribble", "oneTwo", "diagonal", "edgePass", "corner", "earlyCross", "halfTurn", "lastAttack", "freeKick", "thirdMan"].includes(match.scene)) return [0, 0, 1, 0, 0, 0];
    if (["firstTouch", "chipShot", "cutback", "volley", "counter"].includes(match.scene)) return [0, 0, 0, 0.6, 0, 0.4];
    return [0, 0, 0.3, 0, 0.35, 0.35];
  }
  if (kind === "tackle") return match.scene === "recoveryRun" ? [0.45, 0, 0, 0, 0.45, 0.1] : [0, 0, 0, 0, 0.7, 0.3];
  if (kind === "pass") return ["oneTwo", "halfTurn", "pressEscape", "thirdMan"].includes(match.scene) ? [0, 0, 0.65, 0.35, 0, 0] : ["overlap", "underlap", "cutback"].includes(match.scene) ? [0.25, 0, 0.75, 0, 0, 0] : [0, 0, 1, 0, 0, 0];
  if (match.scene === "corner") return [0, 0.25, 0.75, 0, 0, 0];
  if (["counter", "breakaway", "nearPostRun"].includes(match.scene)) return [0.4, 0.6, 0, 0, 0, 0];
  if (["dribble", "cutInside", "firstTouch"].includes(match.scene)) return [0, 0.55, 0, 0.45, 0, 0];
  if (["header", "volley", "farPost", "bicycle"].includes(match.scene)) return [0, 0.7, 0, 0, 0, 0.3];
  return [0, 1, 0, 0, 0, 0];
}
