import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";
import {
  ACTIONS_PER_STAGE,
  type CoachCareer,
  type CoachCommand,
  type CoachMode,
  coachCommand,
  createCoachCareer,
  developable,
  type WorldData,
} from "@craque/engine/coach";
import { stream } from "@craque/engine";

/**
 * Carreiras automáticas do Técnico para o harness (GDD 56.12): uma política
 * simples joga as 24 temporadas usando as sete ações, eventos e decisões.
 * Nunca é lida pelo motor: troca de política não muda o mundo.
 */

export const WORLD: WorldData = { players: SQUAD_PLAYERS, free: FREE_PLAYERS };

export type Policy = "balanced" | "passive" | "spender";

export interface RunOptions {
  readonly seed: string;
  readonly mode: CoachMode;
  readonly nationality: string;
  readonly policy: Policy;
  readonly seasons?: number;
}

export interface RunLog {
  readonly career: CoachCareer;
  readonly errors: string[];
  readonly commands: number;
  readonly ms: number;
}

function step(state: { career: CoachCareer; errors: string[]; commands: number }, command: CoachCommand): boolean {
  const result = coachCommand(state.career, command);
  state.commands += 1;
  if (result.error) {
    state.errors.push(`${command.type}:${result.error}`);
    return false;
  }
  state.career = result.career;
  return true;
}

function stageActions(state: { career: CoachCareer; errors: string[]; commands: number }, policy: Policy, rng: ReturnType<typeof stream>): void {
  const plan: Array<() => void> = [];
  const career = state.career;
  if (policy === "passive") return;
  plan.push(() => {
    if (!step(state, { type: "openAction", kind: "train" })) return;
    step(state, { type: "confirmAction", payload: { kind: "train", sector: rng.pick(["def", "mid", "att"] as const) } });
  });
  plan.push(() => {
    const young = developable(state.career)
      .filter((player) => state.career.year - player.birthYear <= 23)
      .sort((a, b) => b.ovr - a.ovr)
      .slice(0, 3)
      .map((player) => player.id);
    if (young.length === 0) return;
    if (!step(state, { type: "openAction", kind: "develop" })) return;
    step(state, { type: "confirmAction", payload: { kind: "develop", players: young } });
  });
  if (policy === "spender" || rng.chance(0.5)) {
    plan.push(() => {
      const coach = state.career.coach;
      if (!coach) return;
      const club = state.career.clubs[coach.club];
      if (!club) return;
      const targets = Object.values(state.career.players)
        .filter((player) => player.club && player.club !== coach.club && player.ovr >= club.strength && player.ovr <= club.strength + 4)
        .filter((player) => state.career.year - player.birthYear <= 29)
        .sort((a, b) => a.ovr - b.ovr || a.id.localeCompare(b.id))
        .slice(0, 40);
      const chosen = rng.shuffle(targets).slice(0, 3).map((player) => player.id);
      if (chosen.length === 0) return;
      if (!step(state, { type: "openAction", kind: "buy" })) return;
      if (!step(state, { type: "confirmAction", payload: { kind: "buy", players: chosen } })) return;
      const flow = state.career.flow;
      if (flow?.kind === "buy") {
        for (const response of flow.responses) {
          if (response.status === "pending") step(state, { type: "respond", item: response.id, decision: "accept" });
        }
      }
      step(state, { type: "closeAction" });
    });
  } else {
    plan.push(() => {
      if (!step(state, { type: "openAction", kind: "youth" })) return;
      const candidate = state.career.youth.find((item) => !item.promoted);
      if (!candidate) {
        step(state, { type: "cancelAction" });
        return;
      }
      step(state, { type: "confirmAction", payload: { kind: "youth", candidate: candidate.id } });
    });
  }
  for (const action of plan.slice(0, ACTIONS_PER_STAGE)) action();
  void career;
}

/** Joga uma carreira inteira com a política. */
export function runCareer(options: RunOptions): RunLog {
  const started = performance.now();
  const career = createCoachCareer(
    { seed: options.seed, startYear: 2026, mode: options.mode, identity: { name: "Auto", nationality: options.nationality } },
    WORLD,
  );
  const state = { career, errors: [] as string[], commands: 0 };
  const rng = stream(options.seed, "policy", "tecnico");
  const first = state.career.offers[0];
  if (!first) return { career: state.career, errors: ["noOffers"], commands: 0, ms: 0 };
  step(state, { type: "acceptOffer", offer: first.id });
  const limit = options.seasons ?? 24;
  let guard = 0;
  while (state.career.phase !== "ended" && guard < 400) {
    guard += 1;
    const phase = state.career.phase;
    if (phase === "stage") {
      stageActions(state, options.policy, rng);
      step(state, { type: "advance" });
    } else if (phase === "event") {
      const event = state.career.event;
      if (event && !event.chosen) step(state, { type: "chooseEvent", option: rng.pick(event.options).id });
      else step(state, { type: "simulate" });
    } else if (phase === "matchEvent") {
      const event = state.career.event;
      step(state, { type: "chooseMatchEvent", option: event?.options[1]?.id ?? event?.options[0]?.id ?? "" });
    } else if (phase === "results") {
      step(state, { type: "continue" });
    } else if (phase === "review") {
      if (state.career.seasonIndex + 1 >= limit) {
        step(state, { type: "decide", choice: state.career.seasonIndex >= 23 ? "finish" : "retire" });
        break;
      }
      const stay = state.career.offers.find((offer) => offer.stay);
      const choice = stay ? "stay" : state.career.offers[0] ? { offer: state.career.offers[0].id } : "retire";
      step(state, { type: "decide", choice });
    } else {
      break;
    }
  }
  return { career: state.career, errors: state.errors, commands: state.commands, ms: performance.now() - started };
}
