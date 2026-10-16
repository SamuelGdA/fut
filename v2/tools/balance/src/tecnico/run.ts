import type { CountryCode } from "@craque/world";
import { FREE_PLAYERS, SQUAD_PLAYERS } from "@craque/world/squads";
import {
  ACTIONS_PER_STAGE,
  type CoachCareer,
  type CoachCommand,
  type CoachMode,
  coachCommand,
  canAffordEvent,
  createCoachCareer,
  developable,
  purchaseChance,
  purchasePreview,
  valueOf,
  wageBillOf,
  wageFor,
  FINANCE,
  squadOf,
  sectorOf, displayStrength,
  type WorldData,
} from "@craque/engine/coach";
import { type Rng, stream } from "@craque/engine";

/**
 * Carreiras automáticas do Técnico para o harness (GDD 42.12): uma política
 * simples joga as 24 temporadas usando as ações, eventos e decisões. A
 * política nunca é lida pelo motor: trocar de política não muda o mundo.
 */

export const WORLD: WorldData = { players: SQUAD_PLAYERS, free: FREE_PLAYERS };

/**
 * equilibrada: treina, desenvolve jovens e contrata ou sobe da base;
 * passiva: não usa nenhuma ação (o controle);
 * gastadora: contrata em toda etapa.
 */
export type Policy = "balanced" | "passive" | "spender" | "trainBuy";

export interface RunOptions {
  readonly seed: string;
  readonly mode: CoachMode;
  readonly nationality: CountryCode;
  readonly policy: Policy;
  readonly seasons?: number;
  readonly startClub?:string;
  readonly initialOvr?:number;
}

/** Contadores da política por temporada (o motor não sabe deles). */
export interface PolicyCounters {
  purchases: number;
  purchaseTries: number;
  /** Respostas "disponível" (o jogador quer e o clube libera). */
  available: number;
  sales: number;
}

export interface RunHooks {
  /** Chamado no começo de cada temporada, antes da primeira etapa. */
  readonly seasonStart?: (career: CoachCareer) => void;
  /** Chamado na avaliação de fim de temporada, antes da decisão. */
  readonly seasonEnd?: (career: CoachCareer, counters: PolicyCounters) => void;
}

export interface RunLog {
  readonly career: CoachCareer;
  /** Comandos que o motor recusou (a política só manda comandos válidos: precisa ficar vazio). */
  readonly errors: string[];
  readonly commands: number;
  readonly ms: number;
}

interface State {
  career: CoachCareer;
  errors: string[];
  commands: number;
  counters: PolicyCounters;
}

function step(state: State, command: CoachCommand): boolean {
  const result = coachCommand(state.career, command);
  state.commands += 1;
  if (result.error) {
    state.errors.push(`${command.type}:${result.error}`);
    return false;
  }
  state.career = result.career;
  return true;
}

/**
 * Contratar como um jogador faria: alvos do nível do clube ou pouco acima,
 * com faixa de chance "possível" ou melhor e preço estimado dentro da verba.
 */
function buy(state: State, rng: Rng, upgradesOnly=false): void {
  const coach = state.career.coach;
  if (!coach) return;
  const club = state.career.clubs[coach.club];
  if (!club) return;
  const year = state.career.year;
  const targets = Object.values(state.career.players)
    .filter((player) => player.club && player.club !== coach.club && player.ovr >= club.strength - 1 && player.ovr <= club.strength + 3)
    .filter(player=>!upgradesOnly || player.ovr>club.strength)
    .filter((player) => year - player.birthYear <= 29 && valueOf(player, year) * 1.35 <= coach.budget)
    .filter((player) => purchaseChance(state.career, player, coach.club).total >= 0.25)
    .sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id))
    .slice(0, 12);
  let budget = coach.budget, wages = Math.max(0, club.revenue * FINANCE.wageCap / 12 - wageBillOf(state.career, coach.club));
  const chosen: string[] = [];
  // Usa a mesma projeção visível no processo: planeja o lote inteiro, não três compras independentes.
  for (const player of rng.shuffle(targets)) {
    const price = valueOf(player,year) * 1.6, wage = Math.max(player.wage * 1.5, wageFor(player.ovr) * 1.2);
    if (price > budget || wage > wages) continue;
    chosen.push(player.id); budget -= price; wages -= wage;
    if (chosen.length === 3) break;
  }
  if (chosen.length === 0) return;
  if (!step(state, { type: "openAction", kind: "buy" })) return;
  if (!step(state, { type: "confirmAction", payload: { kind: "buy", players: chosen } })) return;
  state.counters.purchaseTries += chosen.length;
  const flow = state.career.flow;
  if (flow?.kind === "buy") {
    state.counters.available += flow.responses.filter((response) => response.status === "pending").length;
    for (const response of [...flow.responses].sort((a, b) => a.price - b.price)) {
      if (response.status !== "pending") continue;
      const current = state.career.flow?.kind === "buy" ? state.career.flow.responses.find((item) => item.id === response.id) : null;
      if (!current || !purchasePreview(state.career, current).ok) continue;
      if (step(state, { type: "respond", item: response.id, decision: "accept" })) state.counters.purchases += 1;
    }
  }
  step(state, { type: "closeAction" });
}

function stageActions(state: State, policy: Policy, rng: Rng): void {
  if (policy === "passive") return;
  if(policy==="trainBuy") {
    for(const sector of ["att","def"] as const) {
      if(step(state,{type:"openAction",kind:"train"}))step(state,{type:"confirmAction",payload:{kind:"train",sector}});
    }
    buy(state,rng,true);return;
  }
  const plan: Array<() => void> = [];
  plan.push(() => {
    if (!step(state, { type: "openAction", kind: "train" })) return;
    const squad = squadOf(state.career, state.career.coach!.club), starters = new Set(state.career.coach!.tactics.lineup);
    const strength = (sector: "def" | "mid" | "att") => { const players = squad.filter(p => starters.has(p.id) && sectorOf(p.position) === sector); return players.reduce((sum,p)=>sum+p.ovr,0) / Math.max(1,players.length); };
    const sector = (["def", "mid", "att"] as const).toSorted((a,b)=>strength(a)-strength(b))[0]!;
    step(state, { type: "confirmAction", payload: { kind: "train", sector } });
  });
  plan.push(() => {
    const young = developable(state.career)
      .filter((player) => state.career.year - player.birthYear <= 23)
      .sort((a, b) => Number(state.career.coach!.tactics.lineup.includes(b.id)) - Number(state.career.coach!.tactics.lineup.includes(a.id)) || b.ovr - a.ovr)
      .slice(0, 3)
      .map((player) => player.id);
    if (young.length === 0) return;
    if (!step(state, { type: "openAction", kind: "develop" })) return;
    step(state, { type: "confirmAction", payload: { kind: "develop", players: young } });
  });
  if (policy === "spender" || rng.chance(0.5)) {
    plan.push(() => buy(state, rng));
  } else {
    plan.push(() => {
      if (squadOf(state.career,state.career.coach!.club).length >= 30) {
        if (step(state,{type:"openAction",kind:"train"})) step(state,{type:"confirmAction",payload:{kind:"train",sector:"att"}});
        return;
      }
      const candidate = state.career.youth.find((item) => !item.promoted);
      if (!candidate) return;
      if (!step(state, { type: "openAction", kind: "youth" })) return;
      step(state, { type: "confirmAction", payload: { kind: "youth", candidate: candidate.id } });
    });
  }
  for (const action of plan.slice(0, ACTIONS_PER_STAGE)) action();
}

/** Joga uma carreira inteira com a política. */
export function runCareer(options: RunOptions, hooks: RunHooks = {}): RunLog {
  const started = performance.now();
  const career = createCoachCareer(
    { seed: options.seed, startYear: 2026, mode: options.mode, identity: { name: "Auto", nationality: options.nationality } },
    WORLD,
  );
  const state: State = { career, errors: [], commands: 0, counters: { purchases: 0, purchaseTries: 0, available: 0, sales: 0 } };
  const rng = stream(options.seed, "policy", "tecnico");
  if(options.startClub && state.career.clubs[options.startClub])state.career.offers=[{...state.career.offers[0]!,club:options.startClub}];
  const first = state.career.offers[0];
  if (!first) return { career: state.career, errors: ["noOffers"], commands: 0, ms: 0 };
  step(state, { type: "acceptOffer", offer: first.id });
  if(options.initialOvr && state.career.coach) {
    const coach=state.career.coach,chosen=new Set(coach.tactics.lineup);
    for(const player of squadOf(state.career,coach.club))if(chosen.has(player.id)) {
      player.level=options.initialOvr;player.ovr=options.initialOvr;player.wage=wageFor(player.ovr);
      state.career.players[player.id]={...player,potential:Math.max(player.potential,player.ovr)};
    }
    const club=state.career.clubs[coach.club]!;
    club.strength=displayStrength(squadOf(state.career,coach.club));
    club.revenue=FINANCE.revenueShare*squadOf(state.career,coach.club).reduce((sum,p)=>sum+valueOf(p,state.career.year),0);
    club.cash=club.revenue*0.2;coach.budget=club.revenue*FINANCE.budgetShare;
  }
  const limit = options.seasons ?? 24;
  let season = -1;
  let guard = 0;
  while (state.career.phase !== "ended" && guard < 1000) {
    guard += 1;
    const phase = state.career.phase;
    if (phase === "stage") {
      if (state.career.seasonIndex !== season) {
        season = state.career.seasonIndex;
        hooks.seasonStart?.(state.career);
      }
      const coach=state.career.coach;
      // A referência equilibrada reage à mesma pista que o usuário recebe.
      // Os controles passivo e treinar+comprar mantêm o plano fixo.
      if(options.policy==="balanced" && coach && coach.predictability.value>=0.5) {
        const strong=coach.objective.expected<=coach.objective.tableSize/3;
        const philosophy=strong ? coach.tactics.philosophy==="attacking"?"possession":"attacking" : coach.tactics.philosophy==="defensive"?"counter":"defensive";
        step(state,{type:"setTactics",philosophy});
      }
      stageActions(state, options.policy, rng);
      step(state, { type: "autoLineup" });
      step(state, { type: "advance" });
    } else if (phase === "event") {
      const event = state.career.event;
      if (event && !event.chosen) step(state, { type: "chooseEvent", option: rng.pick(event.options.filter(option => canAffordEvent(state.career, option))).id });
      else step(state, { type: "simulate" });
    } else if (phase === "matchEvent") {
      const event = state.career.event;
      step(state, { type: "chooseMatchEvent", option: event?.options[1]?.id ?? event?.options[0]?.id ?? "" });
    } else if (phase === "results") {
      step(state, { type: "continue" });
    } else if (phase === "transferOffers") {
      step(state, { type: "continueTransfers" });
    } else if (phase === "review") {
      hooks.seasonEnd?.(state.career, state.counters);
      state.counters = { purchases: 0, purchaseTries: 0, available: 0, sales: 0 };
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
