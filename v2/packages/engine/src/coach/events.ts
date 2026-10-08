import { areRivals } from "@craque/world";
import { clamp } from "../math";
import type { Rng } from "../rng";
import { currentLambdas, type DetailedInput, type LiveMatch } from "./match";
import { ageOf, moodOf, valueOf } from "./players";
import { transferPlayer } from "./market";
import type {
  CoachCareer,
  CoachEvent,
  CoachPlayer,
  CoachPromise,
  EventEffect,
  EventKind,
  EventOption,
  Fixture,
  MatchContext,
  Sector,
} from "./types";
import { absDay, coachRng, stageKey, unit } from "./util";
import { squadOf } from "./world";

/**
 * Eventos (spec 13): um por etapa, sem gastar ação. Cada evento é dado:
 * quando aparece, quem envolve e o que cada opção faz, com chance quando há
 * risco. Os textos ficam em `@craque/content` pelo id do evento e da opção.
 *
 * O evento pode ser de partida: aí ele fica armado e dispara durante a
 * simulação, no jogo mais importante do período (ou no último, se nenhum
 * chegar lá), pausando no minuto da decisão.
 */

export interface EventContext {
  readonly career: CoachCareer;
  readonly squad: CoachPlayer[];
  readonly year: number;
  readonly club: string;
  readonly position: number | null;
  readonly expected: number;
  readonly tableSize: number;
  readonly played: number;
}

interface Built {
  readonly subject: string | null;
  readonly params: Record<string, string | number>;
  readonly options: EventOption[];
}

interface EventDefinition {
  readonly id: string;
  readonly kind: EventKind;
  readonly weight: (context: EventContext) => number;
  readonly build: (context: EventContext, rng: Rng) => Built | null;
}

const option = (id: string, chance: number | null, success: EventEffect[], failure: EventEffect[] = []): EventOption => ({
  id,
  chance: chance === null ? null : clamp(chance, 0.05, 0.95),
  success,
  failure,
});

function revenue(context: EventContext): number {
  return context.career.clubs[context.club]?.revenue ?? 1_000_000;
}

function roundMoney(value: number): number {
  const step = value >= 10_000_000 ? 500_000 : value >= 1_000_000 ? 100_000 : 10_000;
  return Math.round(value / step) * step;
}

function pickPlayer(context: EventContext, rng: Rng, filter: (player: CoachPlayer) => boolean): CoachPlayer | null {
  const list = context.squad.filter((player) => !player.injury && filter(player));
  return list.length ? rng.pick(list) : null;
}

function buyerFor(context: EventContext, player: CoachPlayer, rng: Rng, rival: boolean): string | null {
  const clubs = Object.values(context.career.clubs).filter((club) => {
    if (club.id === context.club) return false;
    if (rival) return areRivals(club.id, context.club);
    return club.strength >= player.ovr - 6 && club.cash > -club.revenue * 0.1;
  });
  return clubs.length ? rng.pick(clubs.map((club) => club.id).sort()).toString() : null;
}

const CATALOG: readonly EventDefinition[] = [
  {
    id: "unhappyStar",
    kind: "request",
    weight: (context) => (context.squad.some((player) => (player.role === "star" || player.role === "starter") && moodOf(player.satisfaction) === "unhappy") ? 6 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => (item.role === "star" || item.role === "starter") && moodOf(item.satisfaction) === "unhappy");
      if (!player) return null;
      const raise = roundMoney(player.wage * 0.3);
      return {
        subject: player.id,
        params: { raise },
        options: [
          option("promise", null, [{ type: "satisfaction", target: "subject", amount: 14 }, { type: "promise", kind: "starts", target: 0.7 }]),
          option("raise", null, [{ type: "satisfaction", target: "subject", amount: 10 }, { type: "cash", amount: -raise * 12 }]),
          option("firm", 0.5, [{ type: "satisfaction", target: "subject", amount: 3 }, { type: "satisfaction", target: "squad", amount: 2 }], [{ type: "satisfaction", target: "subject", amount: -10 }, { type: "listed" }]),
        ],
      };
    },
  },
  {
    id: "wantsOut",
    kind: "request",
    weight: (context) => (context.squad.some((player) => moodOf(player.satisfaction) === "unhappy" && player.ovr >= 60) ? 5 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => moodOf(item.satisfaction) === "unhappy" && item.ovr >= 60);
      if (!player) return null;
      const buyer = buyerFor(context, player, rng, false);
      if (!buyer) return null;
      const price = roundMoney(valueOf(player, context.year) * rng.real(0.95, 1.2));
      return {
        subject: player.id,
        params: { buyer, price },
        options: [
          option("sell", null, [{ type: "sell", price, buyer }, { type: "satisfaction", target: "squad", amount: 1 }]),
          option("refuse", 0.4, [{ type: "satisfaction", target: "subject", amount: 2 }], [{ type: "satisfaction", target: "subject", amount: -14 }, { type: "satisfaction", target: "squad", amount: -2 }]),
          option("promise", null, [{ type: "satisfaction", target: "subject", amount: 8 }, { type: "promise", kind: "minutes", target: 6 }]),
        ],
      };
    },
  },
  {
    id: "youthShines",
    kind: "opportunity",
    weight: (context) => (context.squad.some((player) => ageOf(player, context.year) <= 20 && player.potential - player.level >= 5) ? 5 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => ageOf(item, context.year) <= 20 && item.potential - item.level >= 5);
      if (!player) return null;
      return {
        subject: player.id,
        params: {},
        options: [
          option("chance", null, [{ type: "satisfaction", target: "subject", amount: 10 }, { type: "promise", kind: "minutes", target: 5 }, { type: "fans", amount: 2 }]),
          option("praise", 0.55, [{ type: "fans", amount: 3 }, { type: "form", target: "subject", amount: 1 }], [{ type: "form", target: "subject", amount: -1 }]),
          option("patience", null, [{ type: "satisfaction", target: "subject", amount: -3 }, { type: "satisfaction", target: "starters", amount: 2 }]),
        ],
      };
    },
  },
  {
    id: "injuryCrisis",
    kind: "crisis",
    weight: (context) => (context.squad.filter((player) => player.injury).length >= 3 ? 6 : 0),
    build: (context) => {
      const cost = roundMoney(revenue(context) * 0.02);
      return {
        subject: null,
        params: { cost, injured: context.squad.filter((player) => player.injury).length },
        options: [
          option("medical", null, [{ type: "cash", amount: -cost }, { type: "injury", days: -10 }]),
          option("rotate", null, [{ type: "satisfaction", target: "bench", amount: 4 }, { type: "training", sector: "mid", amount: 1 }]),
        ],
      };
    },
  },
  {
    id: "derbyWeek",
    kind: "club",
    weight: (context) => (context.career.fixtures.some((fixture) => !fixture.result && (fixture.home === context.club || fixture.away === context.club) && areRivals(fixture.home, fixture.away)) ? 4 : 0),
    build: (context) => {
      const derby = context.career.fixtures.find((fixture) => !fixture.result && (fixture.home === context.club || fixture.away === context.club) && areRivals(fixture.home, fixture.away));
      if (!derby) return null;
      const rival = derby.home === context.club ? derby.away : derby.home;
      return {
        subject: null,
        params: { rival },
        options: [
          option("fire", 0.6, [{ type: "training", sector: "att", amount: 1 }, { type: "fans", amount: 3 }], [{ type: "form", target: "starters", amount: -1 }]),
          option("calm", null, [{ type: "training", sector: "def", amount: 1 }, { type: "satisfaction", target: "squad", amount: 1 }]),
        ],
      };
    },
  },
  {
    id: "boardBonus",
    kind: "opportunity",
    weight: (context) => (context.career.coach && context.career.coach.board >= 55 ? 3 : 1),
    build: (context) => {
      const amount = roundMoney(revenue(context) * 0.06);
      return {
        subject: null,
        params: { amount },
        options: [
          option("accept", null, [{ type: "budget", amount }, { type: "board", amount: -2 }]),
          option("decline", null, [{ type: "board", amount: 3 }]),
        ],
      };
    },
  },
  {
    id: "sponsor",
    kind: "opportunity",
    weight: () => 3,
    build: (context) => {
      const amount = roundMoney(revenue(context) * 0.05);
      return {
        subject: null,
        params: { amount },
        options: [
          option("accept", null, [{ type: "cash", amount }, { type: "fans", amount: -4 }]),
          option("refuse", null, [{ type: "fans", amount: 3 }]),
        ],
      };
    },
  },
  {
    id: "fanProtest",
    kind: "crisis",
    weight: (context) => (context.career.coach && context.career.coach.fans < 38 ? 7 : 0),
    build: () => ({
      subject: null,
      params: {},
      options: [
        option("meet", 0.55, [{ type: "fans", amount: 9 }], [{ type: "fans", amount: -4 }]),
        option("focus", null, [{ type: "board", amount: 2 }, { type: "fans", amount: -3 }, { type: "training", sector: "mid", amount: 1 }]),
      ],
    }),
  },
  {
    id: "pressLeak",
    kind: "crisis",
    weight: (context) => (context.squad.filter((player) => moodOf(player.satisfaction) === "unhappy").length >= 2 ? 4 : 0),
    build: () => ({
      subject: null,
      params: {},
      options: [
        option("hunt", 0.5, [{ type: "satisfaction", target: "squad", amount: 3 }, { type: "board", amount: 2 }], [{ type: "satisfaction", target: "squad", amount: -5 }]),
        option("unite", null, [{ type: "satisfaction", target: "squad", amount: 2 }, { type: "board", amount: -2 }]),
      ],
    }),
  },
  {
    id: "veteranMentor",
    kind: "club",
    weight: (context) => (context.squad.some((player) => ageOf(player, context.year) >= 31 && !player.traits.includes("mentor")) && context.squad.some((player) => ageOf(player, context.year) <= 21) ? 3 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => ageOf(item, context.year) >= 31 && !item.traits.includes("mentor") && item.traits.length < 2);
      if (!player) return null;
      return {
        subject: player.id,
        params: {},
        options: [
          option("accept", null, [{ type: "trait", trait: "mentor" }, { type: "satisfaction", target: "subject", amount: 6 }, { type: "satisfaction", target: "youth", amount: 3 }]),
          option("focus", null, [{ type: "form", target: "subject", amount: 1 }]),
        ],
      };
    },
  },
  {
    id: "rivalInterest",
    kind: "opportunity",
    weight: (context) => (context.squad.some((player) => player.role === "rotation" || player.role === "backup") ? 3 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => (item.role === "rotation" || item.role === "backup") && item.ovr >= 55);
      if (!player) return null;
      const buyer = buyerFor(context, player, rng, true) ?? buyerFor(context, player, rng, false);
      if (!buyer) return null;
      const rival = areRivals(buyer, context.club);
      const price = roundMoney(valueOf(player, context.year) * rng.real(1.15, 1.45));
      return {
        subject: player.id,
        params: { buyer, price, rival: rival ? 1 : 0 },
        options: [
          option("sell", null, [{ type: "sell", price, buyer }, { type: "fans", amount: rival ? -5 : -1 }]),
          option("keep", null, [{ type: "satisfaction", target: "subject", amount: 5 }]),
        ],
      };
    },
  },
  {
    id: "raiseRequest",
    kind: "request",
    weight: (context) => (context.squad.some((player) => player.form >= 1 && player.season.goals + player.season.assists >= 3) ? 4 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => item.form >= 1);
      if (!player) return null;
      const raise = roundMoney(player.wage * 0.35);
      return {
        subject: player.id,
        params: { raise },
        options: [
          option("raise", null, [{ type: "satisfaction", target: "subject", amount: 12 }, { type: "cash", amount: -raise * 12 }]),
          option("refuse", 0.6, [{ type: "satisfaction", target: "subject", amount: -2 }], [{ type: "satisfaction", target: "subject", amount: -12 }, { type: "form", target: "subject", amount: -1 }]),
        ],
      };
    },
  },
  {
    id: "trainingInjury",
    kind: "crisis",
    weight: (context) => (context.squad.some((player) => player.role === "starter" || player.role === "star") ? 2 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => item.role === "starter" || item.role === "star");
      if (!player) return null;
      return {
        subject: player.id,
        params: {},
        options: [
          option("rush", 0.5, [{ type: "injury", days: 6 }], [{ type: "injury", days: 32 }]),
          option("rest", null, [{ type: "injury", days: 18 }, { type: "satisfaction", target: "subject", amount: 3 }]),
        ],
      };
    },
  },
  {
    id: "austerity",
    kind: "crisis",
    weight: (context) => ((context.career.clubs[context.club]?.cash ?? 0) < 0 ? 7 : 0),
    build: (context) => {
      const top = [...context.squad].sort((a, b) => b.wage - a.wage)[0];
      if (!top) return null;
      return {
        subject: top.id,
        params: {},
        options: [
          option("list", null, [{ type: "listed" }, { type: "board", amount: 4 }, { type: "satisfaction", target: "subject", amount: -4 }]),
          option("cut", null, [{ type: "budget", amount: -roundMoney(revenue(context) * 0.03) }, { type: "board", amount: 2 }]),
        ],
      };
    },
  },
  {
    id: "dressingRoomFight",
    kind: "crisis",
    weight: (context) => (context.squad.some((player) => ageOf(player, context.year) >= 30) && context.squad.some((player) => ageOf(player, context.year) <= 22) ? 2 : 0),
    build: (context, rng) => {
      const veteran = pickPlayer(context, rng, (item) => ageOf(item, context.year) >= 30);
      if (!veteran) return null;
      return {
        subject: veteran.id,
        params: {},
        options: [
          option("veteran", null, [{ type: "satisfaction", target: "subject", amount: 6 }, { type: "satisfaction", target: "youth", amount: -6 }]),
          option("youth", null, [{ type: "satisfaction", target: "youth", amount: 5 }, { type: "satisfaction", target: "subject", amount: -8 }]),
          option("fine", 0.6, [{ type: "board", amount: 2 }, { type: "satisfaction", target: "squad", amount: 1 }], [{ type: "satisfaction", target: "squad", amount: -3 }]),
        ],
      };
    },
  },
  {
    id: "pressure",
    kind: "club",
    weight: (context) => (context.position !== null && context.played >= 5 && context.position > context.expected + 3 ? 6 : 0),
    build: () => ({
      subject: null,
      params: {},
      options: [
        option("back", null, [{ type: "satisfaction", target: "squad", amount: 3 }, { type: "fans", amount: -2 }]),
        option("demand", 0.5, [{ type: "form", target: "squad", amount: 1 }], [{ type: "satisfaction", target: "squad", amount: -3 }]),
      ],
    }),
  },
  {
    id: "goodRun",
    kind: "opportunity",
    weight: (context) => (context.position !== null && context.played >= 5 && context.position < context.expected - 1 ? 5 : 0),
    build: (context) => {
      const amount = roundMoney(revenue(context) * 0.04);
      return {
        subject: null,
        params: { amount },
        options: [
          option("celebrate", null, [{ type: "fans", amount: 4 }, { type: "satisfaction", target: "squad", amount: 2 }]),
          option("invest", null, [{ type: "budget", amount }, { type: "board", amount: 2 }]),
        ],
      };
    },
  },
  {
    id: "preseasonTour",
    kind: "club",
    weight: (context) => (context.career.half === 0 && context.played === 0 ? 3 : 0),
    build: (context) => {
      const amount = roundMoney(revenue(context) * 0.03);
      return {
        subject: null,
        params: { amount },
        options: [
          option("tour", 0.7, [{ type: "cash", amount }], [{ type: "cash", amount }, { type: "form", target: "starters", amount: -1 }]),
          option("camp", null, [{ type: "training", sector: "mid", amount: 1 }]),
        ],
      };
    },
  },
];

/** Contexto do evento: tabela da liga, posição esperada e jogos já feitos. */
export function eventContext(career: CoachCareer): EventContext | null {
  const coach = career.coach;
  if (!coach) return null;
  const squad = squadOf(career, coach.club);
  const club = career.clubs[coach.club];
  const league = Object.values(career.competitions).find((state) => state.kind === "league" && state.entrants.includes(coach.club));
  let position: number | null = null;
  let played = 0;
  if (league?.table) {
    const sorted = [...league.table].sort((a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst));
    position = sorted.findIndex((row) => row.club === coach.club) + 1;
    played = sorted.find((row) => row.club === coach.club)?.played ?? 0;
  }
  void club;
  return { career, squad, year: career.year, club: coach.club, position, expected: coach.objective.expected, tableSize: coach.objective.tableSize, played };
}

/**
 * O evento da etapa. Primeiro decide se é de partida (fica armado) ou fora de
 * campo; os fora de campo são escolhidos pelo peso entre os que se aplicam,
 * dando prioridade ao que aconteceu no elenco.
 */
export function pickStageEvent(career: CoachCareer): { match: boolean; event: CoachEvent | null } {
  const context = eventContext(career);
  if (!context) return { match: false, event: null };
  const key = stageKey(career.year, career.half);
  const rng = coachRng(career.setup.seed, "event", key);
  const eligible = CATALOG.map((definition) => [definition, definition.weight(context)] as const).filter(([, weight]) => weight > 0);
  const matchShare = eligible.length === 0 ? 1 : 0.38;
  if (rng.chance(matchShare)) return { match: true, event: null };
  const shuffled = rng.shuffle(eligible);
  while (shuffled.length > 0) {
    const definition = rng.weighted(shuffled.map((entry) => [entry[0], entry[1]] as const));
    const built = definition.build(context, coachRng(career.setup.seed, "event", key, definition.id));
    if (built) {
      return {
        match: false,
        event: { id: definition.id, kind: definition.kind, subject: built.subject, params: built.params, options: built.options, match: null, chosen: null, outcome: null },
      };
    }
    shuffled.splice(shuffled.findIndex((entry) => entry[0] === definition), 1);
  }
  return { match: true, event: null };
}

// ------------------------------------------------------- evento de partida

const MATCH_OPTIONS: Readonly<Record<MatchContext["situation"], ReadonlyArray<{ readonly id: string; readonly forMult: number; readonly againstMult: number }>>> = {
  losing: [
    { id: "allIn", forMult: 1.5, againstMult: 1.4 },
    { id: "adjust", forMult: 1.18, againstMult: 1.05 },
    { id: "accept", forMult: 0.85, againstMult: 0.75 },
  ],
  drawing: [
    { id: "push", forMult: 1.32, againstMult: 1.25 },
    { id: "balance", forMult: 1.08, againstMult: 0.95 },
    { id: "hold", forMult: 0.78, againstMult: 0.68 },
  ],
  winning: [
    { id: "close", forMult: 0.75, againstMult: 0.62 },
    { id: "keepGoing", forMult: 1.22, againstMult: 1.12 },
    { id: "manage", forMult: 0.95, againstMult: 0.9 },
  ],
  injury: [
    { id: "adjust", forMult: 1, againstMult: 1 },
    { id: "hold", forMult: 0.78, againstMult: 0.68 },
  ],
};

/**
 * O que cada escolha tenta (spec 12): virar ou empatar, não piorar, vencer
 * ou não perder. "Dar certo" é cumprir esse objetivo; a tela mostra também
 * as chances de vitória, empate e derrota do resultado final.
 */
type MatchGoal = "win" | "notLose" | "noWorse";

const MATCH_GOAL: Readonly<Record<string, MatchGoal>> = {
  allIn: "notLose",
  adjust: "notLose",
  accept: "noWorse",
  push: "win",
  balance: "notLose",
  hold: "notLose",
  close: "win",
  keepGoing: "win",
  manage: "win",
};

function goalMet(goal: MatchGoal, diffBefore: number, diffAfter: number): boolean {
  if (goal === "win") return diffAfter > 0;
  if (goal === "notLose") return diffAfter >= 0;
  return diffAfter >= diffBefore;
}

/** Chances pelo próprio modelo nos minutos que faltam (grade de placares do resto do jogo). */
function optionOdds(goal: MatchGoal, lambdaFor: number, lambdaAgainst: number, diff: number): { chance: number; win: number; draw: number; loss: number } {
  const pmf = (lambda: number, k: number) => {
    let value = Math.exp(-lambda);
    for (let index = 1; index <= k; index += 1) value *= lambda / index;
    return value;
  };
  let good = 0;
  let win = 0;
  let draw = 0;
  let loss = 0;
  for (let a = 0; a <= 8; a += 1) {
    for (let b = 0; b <= 8; b += 1) {
      const p = pmf(lambdaFor, a) * pmf(lambdaAgainst, b);
      const final = diff + a - b;
      if (final > 0) win += p;
      else if (final === 0) draw += p;
      else loss += p;
      if (goalMet(goal, diff, final)) good += p;
    }
  }
  const total = win + draw + loss;
  return { chance: clamp(good / total, 0.03, 0.97), win: win / total, draw: draw / total, loss: loss / total };
}

export function buildMatchEvent(career: CoachCareer, fixture: Fixture, live: LiveMatch, coachIndex: 0 | 1, minute: number, input: DetailedInput): CoachEvent {
  const coachClub = coachIndex === 0 ? fixture.home : fixture.away;
  const opponent = coachIndex === 0 ? fixture.away : fixture.home;
  const own = coachIndex === 0 ? live.score[0] : live.score[1];
  const other = coachIndex === 0 ? live.score[1] : live.score[0];
  let aggregate: readonly [number, number] | null = null;
  if (input.aggregateBefore) {
    const [aggHome, aggAway] = input.aggregateBefore;
    const [ownBefore, otherBefore] = coachIndex === 0 ? [aggHome, aggAway] : [aggAway, aggHome];
    aggregate = [own + ownBefore, other + otherBefore];
  }
  const diff = aggregate ? aggregate[0] - aggregate[1] : own - other;
  const situation: MatchContext["situation"] = diff < 0 ? "losing" : diff > 0 ? "winning" : "drawing";
  const remaining = Math.max(5, 90 - minute);
  // Gols esperados de cada lado no resto do jogo, com o elenco em campo agora.
  const lambdas = currentLambdas(live, input, (id) => career.players[id] as CoachPlayer);
  const baseFor = (lambdas[coachIndex] ?? 1) * (remaining / 90);
  const baseAgainst = (lambdas[coachIndex === 0 ? 1 : 0] ?? 1) * (remaining / 90);
  const options: EventOption[] = MATCH_OPTIONS[situation].map((entry) => {
    const odds = optionOdds(MATCH_GOAL[entry.id] ?? "win", baseFor * entry.forMult, baseAgainst * entry.againstMult, diff);
    return {
      id: entry.id,
      chance: odds.chance,
      odds: { win: odds.win, draw: odds.draw, loss: odds.loss },
      success: [{ type: "match", forMult: entry.forMult, againstMult: entry.againstMult }, { type: "fans", amount: fixture.round === "F" || fixture.round === "FF" ? 3 : 1 }],
      failure: [{ type: "match", forMult: entry.forMult, againstMult: entry.againstMult }],
    };
  });
  const context: MatchContext = {
    fixture: fixture.id,
    competition: fixture.competition,
    round: fixture.round,
    roundKind: fixture.roundKind,
    opponent,
    home: !fixture.neutral && fixture.home === coachClub,
    minute,
    score: [own, other],
    aggregate,
    derby: areRivals(coachClub, opponent),
    final: fixture.round === "F" || fixture.round === "FF",
    situation,
  };
  return {
    id: `match:${situation}`,
    kind: "match",
    subject: null,
    params: { opponent, minute },
    options,
    match: context,
    chosen: null,
    outcome: null,
  };
}

/** Resultado do evento de partida pelo placar final (a chance mostrada vem do modelo). */
export function matchEventSuccess(event: CoachEvent, option: string, ownGoals: number, otherGoals: number, aggregateBefore: readonly [number, number] | null): boolean {
  const before = aggregateBefore ?? [0, 0];
  const diff = ownGoals + before[0] - (otherGoals + before[1]);
  const at = event.match ? (event.match.aggregate ? event.match.aggregate[0] - event.match.aggregate[1] : event.match.score[0] - event.match.score[1]) : 0;
  return goalMet(MATCH_GOAL[option] ?? "win", at, diff);
}

// ------------------------------------------------------------ efeitos

/** Aplica os efeitos de uma escolha (evento ou conversa). Devolve o texto das mudanças de barra. */
export function applyEffects(career: CoachCareer, effects: readonly EventEffect[], subjectId: string | null, origin: "talk" | "event"): void {
  const coach = career.coach;
  if (!coach) return;
  const squad = squadOf(career, coach.club);
  const club = career.clubs[coach.club];
  const subject = subjectId ? career.players[subjectId] : null;
  const targets = (target: "subject" | "squad" | "starters" | "bench" | "youth"): CoachPlayer[] => {
    switch (target) {
      case "subject":
        return subject ? [subject] : [];
      case "squad":
        return squad;
      case "starters":
        return squad.filter((player) => coach.tactics.lineup.includes(player.id));
      case "bench":
        return squad.filter((player) => !coach.tactics.lineup.includes(player.id));
      case "youth":
        return squad.filter((player) => career.year - player.birthYear <= 21);
    }
  };
  for (const effect of effects) {
    switch (effect.type) {
      case "satisfaction":
        for (const player of targets(effect.target)) player.satisfaction = clamp(player.satisfaction + effect.amount, 0, 100);
        break;
      case "form":
        for (const player of targets(effect.target)) player.form = clamp(player.form + effect.amount, -2, 2);
        break;
      case "board":
        coach.board = clamp(coach.board + effect.amount, 0, 100);
        career.ledger.relations.push({ bar: "board", delta: effect.amount, reason: `${origin}` });
        break;
      case "fans":
        coach.fans = clamp(coach.fans + effect.amount, 0, 100);
        career.ledger.relations.push({ bar: "fans", delta: effect.amount, reason: `${origin}` });
        break;
      case "cash":
        if (club) club.cash += effect.amount;
        break;
      case "budget":
        coach.budget = Math.max(0, coach.budget + effect.amount);
        break;
      case "reputation":
        career.reputation = clamp(career.reputation + effect.amount, 0, 100);
        break;
      case "training": {
        const sector: Sector = effect.sector;
        coach.training[sector] = Math.min(3, (coach.training[sector] ?? 0) + effect.amount);
        break;
      }
      case "promise":
        addPromise(career, effect.kind, subjectId, effect.target, origin);
        break;
      case "injury":
        if (effect.days < 0) {
          for (const player of squad) {
            if (player.injury) player.injury = { ...player.injury, until: Math.max(career.day + 1, player.injury.until + effect.days) };
          }
        } else if (subject) {
          subject.injury = { kind: effect.days > 20 ? "medium" : "light", since: career.day, until: career.day + effect.days };
          career.ledger.injuries.push({ player: subject.id, days: effect.days, kind: effect.days > 20 ? "medium" : "light" });
        }
        break;
      case "sell":
        if (subject) transferPlayer(career, subject.id, effect.buyer, effect.price, "sale");
        break;
      case "listed":
        if (subject) subject.listed = true;
        break;
      case "trait":
        if (subject && !subject.traits.includes(effect.trait) && subject.traits.length < 2) {
          subject.traits = [...subject.traits, effect.trait];
          career.ledger.newTraits.push({ player: subject.id, trait: effect.trait });
        }
        break;
      case "match":
        break;
    }
  }
}

/** Fim do prazo de uma promessa feita agora: fim da etapa (posse e minutos) ou da temporada (manter). */
export function promiseDeadline(career: CoachCareer, kind: CoachPromise["kind"]): number {
  const seasonEnd = absDay(career.seasonIndex, 299);
  if (kind === "keep") return seasonEnd;
  if (career.setup.mode === "slow" && career.half === 0) return absDay(career.seasonIndex, 149);
  return seasonEnd;
}

export function addPromise(career: CoachCareer, kind: CoachPromise["kind"], player: string | null, target: number, origin: "talk" | "event"): void {
  const id = `${stageKey(career.year, career.half)}:${kind}:${player ?? "squad"}:${career.promises.length}`;
  const subject = player ? career.players[player] : null;
  const coachClub = career.coach?.club ?? "";
  const youthApps = Object.values(career.players)
    .filter((item) => item.club === coachClub && career.year - item.birthYear <= 21)
    .reduce((total, item) => total + item.season.apps, 0);
  // A cobrança conta a partir daqui: guarda os números de agora.
  const baseline = subject
    ? { starts: subject.season.starts, available: subject.season.available, apps: subject.season.apps }
    : { starts: 0, available: 0, apps: youthApps };
  if (kind === "youth" || !subject || !career.promises.some((item) => item.status === "active" && item.player === player && item.kind === kind)) {
    career.promises.push({ id, kind, player, until: promiseDeadline(career, kind), madeAt: career.day, target, origin, baseline, status: "active" });
  }
}

/** Resolve a escolha de um evento fora de campo. */
export function resolveEventChoice(career: CoachCareer, optionId: string): void {
  const event = career.event;
  if (!event || event.chosen) return;
  const chosen = event.options.find((item) => item.id === optionId);
  if (!chosen) return;
  const roll = coachRng(career.setup.seed, "eventOutcome", stageKey(career.year, career.half), event.id, optionId).next();
  const success = chosen.chance === null || roll < chosen.chance;
  event.chosen = optionId;
  event.outcome = success ? "success" : "failure";
  applyEffects(career, success ? chosen.success : chosen.failure, event.subject, "event");
}

export const EVENT_IDS = CATALOG.map((definition) => definition.id);
export const MATCH_EVENT_OPTIONS = MATCH_OPTIONS;

/** Para testes e laboratório: o peso de cada evento no contexto atual. */
export function eventWeights(career: CoachCareer): Array<{ id: string; kind: EventKind; weight: number }> {
  const context = eventContext(career);
  if (!context) return [];
  return CATALOG.map((definition) => ({ id: definition.id, kind: definition.kind, weight: definition.weight(context) }));
}

void unit;
