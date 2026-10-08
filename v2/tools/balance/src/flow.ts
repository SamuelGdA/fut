import {
  type Career,
  type CareerPolicy,
  type Choice,
  choose,
  createCareer,
  type DecisionKind,
  type EndReason,
  type Pace,
  policyChoice,
  POSITIONS,
  replay,
  saveOf,
} from "@craque/engine";
import { mean, median } from "./stats";
import type { TargetResult } from "./targets";

/**
 * O fluxo da carreira com o mercado de verdade (M4): quando as carreiras
 * acabam, quantos eventos e decisões cada uma tem, se as janelas têm ofertas
 * e se o save refaz tudo. Diferente do relatório `carreira.md`, que usa a
 * política fixa da caixa de areia para medir prêmios, aqui o clube sai das
 * ofertas do motor.
 *
 * Duas políticas:
 * - `balanced` (do motor): joga e aposenta perto dos 35, como um jogador comum;
 * - `stubborn` (só do harness): a equilibrada, mas nunca aceita aposentar
 *   enquanto houver clube. É ela que mede o mercado: quem termina a carreira
 *   é o mercado, não a vontade do jogador.
 */

export type FlowPolicy = CareerPolicy | "stubborn";

const NATIONS = ["BRA", "ARG", "ENG", "ESP", "FRA", "GER", "ITA", "POR", "NED", "USA", "MEX", "JPN", "NGA", "SEN", "COL", "URU", "CHI", "KOR", "AUS", "AFG"];

export interface FlowRun {
  readonly seed: string;
  readonly pace: Pace;
  readonly policy: FlowPolicy;
  readonly career: Career;
  readonly decisions: Readonly<Partial<Record<DecisionKind, number>>>;
  readonly windows: number;
  /** Janelas com menos de duas ofertas de clube. */
  readonly shortWindows: number;
  readonly baseOffers: number;
}

function stubbornChoice(career: Career): Choice | null {
  const choice = policyChoice(career, "balanced");
  const decision = career.decision;
  if (!choice || !decision) return choice;
  if (decision.options.find((option) => option.id === choice.option)?.kind !== "retire") return choice;
  const other = decision.options.find((option) => option.kind === "stay") ?? decision.options.find((option) => option.kind === "club");
  return other ? { decision: decision.id, option: other.id } : choice;
}

export function runFlow(seed: string, pace: Pace, policy: FlowPolicy, index: number): FlowRun {
  let career = createCareer({
    seed,
    startYear: 2026,
    pace,
    difficulty: index % 4 === 3 ? "hard" : "normal",
    identity: {
      surname: "HARNESS",
      foot: "right",
      nationality: NATIONS[index % NATIONS.length] ?? "BRA",
      position: POSITIONS[index % POSITIONS.length] ?? "st",
      dreamNumber: null,
    },
  });
  const baseOffers = career.decision?.options.filter((option) => option.kind === "club").length ?? 0;
  const decisions: Partial<Record<DecisionKind, number>> = {};
  let windows = 0;
  let shortWindows = 0;
  while (career.decision) {
    const decision = career.decision;
    decisions[decision.kind] = (decisions[decision.kind] ?? 0) + 1;
    if (decision.kind === "window") {
      windows += 1;
      if (decision.options.filter((option) => option.kind === "club").length < 2) shortWindows += 1;
    }
    const choice = policy === "stubborn" ? stubbornChoice(career) : policyChoice(career, policy);
    if (!choice) break;
    career = choose(career, choice).career;
  }
  return { seed, pace, policy, career, decisions, windows, shortWindows, baseOffers };
}

export function runFlows(seed: string, pace: Pace, policy: FlowPolicy, count: number): FlowRun[] {
  return Array.from({ length: count }, (_, index) => runFlow(`${seed}:${policy}:${pace}:${index}`, pace, policy, index));
}

export interface FlowBatches {
  readonly stubbornIntense: readonly FlowRun[];
  readonly stubbornNormal: readonly FlowRun[];
  readonly balancedIntense: readonly FlowRun[];
  readonly balancedNormal: readonly FlowRun[];
}

export function runFlowBatches(seed: string, careers: number): FlowBatches {
  return {
    stubbornIntense: runFlows(seed, "intense", "stubborn", careers),
    stubbornNormal: runFlows(seed, "normal", "stubborn", careers),
    balancedIntense: runFlows(seed, "intense", "balanced", careers),
    balancedNormal: runFlows(seed, "normal", "balanced", careers),
  };
}

export interface BatchFlowMetrics {
  readonly careers: number;
  readonly endAges: readonly number[];
  readonly endMedian: number;
  readonly endAt40: number;
  readonly end33to38: number;
  readonly endBefore30: number;
  readonly reasons: Readonly<Partial<Record<EndReason, number>>>;
  readonly events: number;
  readonly decisions: number;
  readonly decisionKinds: Readonly<Partial<Record<DecisionKind, number>>>;
  readonly loans: number;
  readonly clubs: number;
  readonly traitorShare: number;
}

export interface FlowMetrics {
  readonly stubbornIntense: BatchFlowMetrics;
  readonly stubbornNormal: BatchFlowMetrics;
  readonly balancedIntense: BatchFlowMetrics;
  readonly balancedNormal: BatchFlowMetrics;
  readonly shortWindowShare: number;
  readonly baseThreeShare: number;
  readonly replayShare: number;
  readonly replayChecked: number;
}

function share(runs: readonly FlowRun[], test: (run: FlowRun) => boolean): number {
  return runs.length === 0 ? Number.NaN : runs.filter(test).length / runs.length;
}

function batchMetrics(runs: readonly FlowRun[]): BatchFlowMetrics {
  const endAges = runs.map((run) => run.career.end?.age ?? -1);
  const reasons: Partial<Record<EndReason, number>> = {};
  const kinds: Partial<Record<DecisionKind, number>> = {};
  for (const run of runs) {
    const reason = run.career.end?.reason;
    if (reason) reasons[reason] = (reasons[reason] ?? 0) + 1 / runs.length;
    for (const [kind, count] of Object.entries(run.decisions) as Array<[DecisionKind, number]>) {
      kinds[kind] = (kinds[kind] ?? 0) + count / runs.length;
    }
  }
  return {
    careers: runs.length,
    endAges,
    endMedian: median(endAges),
    endAt40: share(runs, (run) => run.career.end?.age === 40),
    end33to38: share(runs, (run) => (run.career.end?.age ?? 0) >= 33 && (run.career.end?.age ?? 0) <= 38),
    endBefore30: share(runs, (run) => (run.career.end?.age ?? 0) < 30),
    reasons,
    events: mean(runs.map((run) => run.career.eventsSeen.length)),
    decisions: mean(runs.map((run) => run.career.choices.length)),
    decisionKinds: kinds,
    loans: mean(runs.map((run) => run.career.loans)),
    clubs: mean(runs.map((run) => new Set(run.career.history.map((season) => season.club)).size)),
    traitorShare: share(runs, (run) => run.career.history.some((season) => season.traitor)),
  };
}

/** Quantas carreiras de cada lote passam pelo replay completo (o replay custa o mesmo que jogar). */
const REPLAY_SAMPLE = 15;

export function computeFlowMetrics(batches: FlowBatches): FlowMetrics {
  const all = [...batches.stubbornIntense, ...batches.stubbornNormal, ...batches.balancedIntense, ...batches.balancedNormal];
  const sample = Object.values(batches).flatMap((runs: readonly FlowRun[]) => runs.slice(0, REPLAY_SAMPLE));
  const windows = all.reduce((total, run) => total + run.windows, 0);
  const shortWindows = all.reduce((total, run) => total + run.shortWindows, 0);
  return {
    stubbornIntense: batchMetrics(batches.stubbornIntense),
    stubbornNormal: batchMetrics(batches.stubbornNormal),
    balancedIntense: batchMetrics(batches.balancedIntense),
    balancedNormal: batchMetrics(batches.balancedNormal),
    shortWindowShare: windows === 0 ? 0 : shortWindows / windows,
    baseThreeShare: share(all, (run) => run.baseOffers === 3),
    replayShare: share(sample, (run) => JSON.stringify(replay(saveOf(run.career))) === JSON.stringify(run.career)),
    replayChecked: sample.length,
  };
}

const pct = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;
const fixed = (value: number, digits = 1) => (Number.isFinite(value) ? value.toFixed(digits) : "n/d");

/** As metas do fluxo (GDD 40.1 e D15). Faixas fixas: o harness ajusta o mercado, não a meta. */
export function flowTargets(metrics: FlowMetrics): TargetResult[] {
  const { stubbornIntense: si, stubbornNormal: sn, balancedIntense: bi, balancedNormal: bn } = metrics;
  return [
    {
      id: "flow-end-40",
      label: "Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal",
      target: "menos de 50%",
      measured: `${pct(si.endAt40)} / ${pct(sn.endAt40)}`,
      pass: si.endAt40 < 0.5 && sn.endAt40 < 0.5,
    },
    {
      id: "flow-end-33-38",
      label: "Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal",
      target: "50% ou mais",
      measured: `${pct(si.end33to38)} / ${pct(sn.end33to38)}`,
      pass: si.end33to38 >= 0.5 && sn.end33to38 >= 0.5,
    },
    {
      id: "flow-end-early",
      label: "Carreiras que o mercado encerra antes dos 30",
      target: "no máximo 5%",
      measured: `${pct(si.endBefore30, 1)} / ${pct(sn.endBefore30, 1)}`,
      pass: si.endBefore30 <= 0.05 && sn.endBefore30 <= 0.05,
    },
    {
      id: "flow-events-intense",
      label: "Eventos por carreira, ritmo Intensa (agenda de 7 a 8)",
      target: "6 a 8",
      measured: fixed(bi.events),
      pass: bi.events >= 6 && bi.events <= 8,
    },
    {
      id: "flow-events-normal",
      label: "Eventos por carreira, ritmo Normal (agenda de 4 a 5)",
      target: "3,5 a 5",
      measured: fixed(bn.events),
      pass: bn.events >= 3.5 && bn.events <= 5,
    },
    {
      id: "flow-decisions-normal",
      label: "Decisões por carreira no ritmo Normal (3 a 5 minutos de interação)",
      target: "9 a 15",
      measured: fixed(bn.decisions),
      pass: bn.decisions >= 9 && bn.decisions <= 15,
    },
    {
      id: "flow-short-windows",
      label: "Janelas com menos de duas ofertas de clube",
      target: "no máximo 2%",
      measured: pct(metrics.shortWindowShare, 1),
      pass: metrics.shortWindowShare <= 0.02,
    },
    {
      id: "flow-base",
      label: "Primeira decisão com três bases",
      target: "100%",
      measured: pct(metrics.baseThreeShare, 1),
      pass: metrics.baseThreeShare === 1,
    },
    {
      id: "flow-replay",
      label: `Save refaz a carreira inteira (invariante 5, ${metrics.replayChecked} carreiras)`,
      target: "100%",
      measured: pct(metrics.replayShare, 1),
      pass: metrics.replayShare === 1,
    },
  ];
}
