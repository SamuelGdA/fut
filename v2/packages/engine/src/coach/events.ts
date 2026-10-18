import { areRivals } from "@craque/world";
import { changeCash } from "./finance";
import { stageInjury } from "./injuries";
import { clamp } from "../math";
import type { Rng } from "../rng";
import { currentLambdas, type DetailedInput, type LiveMatch } from "./match";
import { ageOf, moodOf, valueOf } from "./players";
import { transferPlayer, roundPlayerPrice } from "./market";
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
import { DECISION_TRADEOFFS, FINANCE, PROMISES, STAGE_EVENTS } from "./tuning";
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
    id: "captainVoice", kind: "club",
    weight: (context) => context.squad.some((p) => ageOf(p, context.year) >= 28) ? 3 : 0,
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => ageOf(item, context.year) >= 28);
      if (!player) return null;
      return { subject: player.id, params: {}, options: [
          option("listen", null, [{ type: "satisfaction", target: "subject", amount: 6 }, { type: "satisfaction", target: "youth", amount: -3 }]),
          option("shared", 0.65, [{ type: "satisfaction", target: "squad", amount: 3 }], [{ type: "satisfaction", target: "subject", amount: -5 }]),
      ] };
    },
  },
  {
    id: "benchPlan", kind: "request",
    weight: (context) => context.squad.some((p) => p.role === "backup") ? 4 : 0,
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => item.role === "backup");
      if (!player) return null;
      return { subject: player.id, params: {}, options: [
          option("rotate", null, [{ type: "promise", kind: "minutes", target: 4 }, { type: "satisfaction", target: "subject", amount: 6 }]),
          option("compete", 0.6, [{ type: "form", target: "subject", amount: 0.5 }], [{ type: "satisfaction", target: "subject", amount: -5 }]),
      ] };
    },
  },
  {
    id: "academyBridge", kind: "opportunity",
    weight: (context) => context.squad.some((p) => ageOf(p, context.year) <= 21) ? 4 : 0,
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => ageOf(item, context.year) <= 21);
      if (!player) return null;
      return { subject: player.id, params: {}, options: [
          option("integrate", null, [{ type: "satisfaction", target: "youth", amount: 5 }, { type: "satisfaction", target: "starters", amount: -3 }]),
          option("individual", null, [{ type: "training", sector: "mid", amount: 1 }, { type: "budget", amount: -roundMoney(revenue(context) * 0.01) }]),
      ] };
    },
  },
  {
    id: "trainingTempo", kind: "club",
    weight: () => 3,
    build: () => {
      return { subject: null, params: {}, options: [
          option("intense", 0.6, [{ type: "form", target: "starters", amount: 0.5 }], [{ type: "form", target: "starters", amount: -0.5 }]),
          option("light", null, [{ type: "satisfaction", target: "squad", amount: 3 }, { type: "form", target: "starters", amount: -0.25 }]),
      ] };
    },
  },
  {
    id: "setPieceLab", kind: "opportunity",
    weight: () => 3,
    build: () => {
      return { subject: null, params: {}, options: [
          option("attack", null, [{ type: "training", sector: "att", amount: 1 }, { type: "satisfaction", target: "bench", amount: -2 }]),
          option("defend", null, [{ type: "training", sector: "def", amount: 1 }, { type: "form", target: "starters", amount: -0.25 }]),
      ] };
    },
  },
  {
    id: "openTraining", kind: "club",
    weight: () => 3,
    build: () => {
      return { subject: null, params: {}, options: [
          option("open", 0.65, [{ type: "fans", amount: 5 }, { type: "satisfaction", target: "squad", amount: 2 }], [{ type: "fans", amount: -3 }, { type: "form", target: "starters", amount: -0.5 }]),
          option("closed", null, [{ type: "training", sector: "mid", amount: 1 }, { type: "fans", amount: -2 }]),
      ] };
    },
  },
  {
    id: "pressStrategy", kind: "club",
    weight: () => 3,
    build: () => {
      return { subject: null, params: {}, options: [
          option("shield", null, [{ type: "satisfaction", target: "squad", amount: 4 }, { type: "board", amount: -2 }]),
          option("challenge", 0.55, [{ type: "fans", amount: 4 }, { type: "form", target: "starters", amount: 0.5 }], [{ type: "satisfaction", target: "starters", amount: -4 }]),
      ] };
    },
  },
  {
    id: "videoRoom", kind: "club",
    weight: () => 3,
    build: () => {
      return { subject: null, params: {}, options: [
          option("collective", null, [{ type: "training", sector: "def", amount: 1 }, { type: "satisfaction", target: "squad", amount: -2 }]),
          option("private", 0.7, [{ type: "form", target: "starters", amount: 0.5 }], [{ type: "form", target: "starters", amount: -0.25 }]),
      ] };
    },
  },
  {
    id: "veteranSchedule", kind: "request",
    weight: (context) => context.squad.some((p) => ageOf(p, context.year) >= 32) ? 4 : 0,
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => ageOf(item, context.year) >= 32);
      if (!player) return null;
      return { subject: player.id, params: {}, options: [
          option("adapt", null, [{ type: "form", target: "subject", amount: 0.5 }, { type: "satisfaction", target: "squad", amount: -2 }]),
          option("equal", 0.6, [{ type: "satisfaction", target: "squad", amount: 3 }], [{ type: "form", target: "subject", amount: -0.5 }, { type: "satisfaction", target: "subject", amount: -3 }]),
      ] };
    },
  },
  {
    id: "starResponsibility", kind: "request",
    weight: (context) => context.squad.some((p) => p.role === "star") ? 3 : 0,
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => item.role === "star");
      if (!player) return null;
      return { subject: player.id, params: {}, options: [
          option("lead", 0.65, [{ type: "form", target: "subject", amount: 0.5 }, { type: "satisfaction", target: "squad", amount: 2 }], [{ type: "form", target: "subject", amount: -0.5 }]),
          option("protect", null, [{ type: "satisfaction", target: "subject", amount: 5 }, { type: "fans", amount: -2 }]),
      ] };
    },
  },
  {
    id: "squadWorkshop", kind: "opportunity",
    weight: () => 3,
    build: (context) => {
      return { subject: null, params: {}, options: [
          option("bond", null, [{ type: "satisfaction", target: "squad", amount: 4 }, { type: "budget", amount: -roundMoney(revenue(context) * 0.01) }]),
          option("work", null, [{ type: "training", sector: "mid", amount: 1 }, { type: "satisfaction", target: "squad", amount: -2 }]),
      ] };
    },
  },
  {
    id: "rotationPolicy", kind: "club",
    weight: () => 3,
    build: () => {
      return { subject: null, params: {}, options: [
          option("merit", null, [{ type: "satisfaction", target: "starters", amount: 4 }, { type: "satisfaction", target: "bench", amount: -4 }]),
          option("depth", null, [{ type: "satisfaction", target: "bench", amount: 5 }, { type: "satisfaction", target: "starters", amount: -3 }]),
      ] };
    },
  },
  {
    id: "youngPressure", kind: "request",
    weight: (context) => context.squad.some((p) => ageOf(p, context.year) <= 20) ? 3 : 0,
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => ageOf(item, context.year) <= 20);
      if (!player) return null;
      return { subject: player.id, params: {}, options: [
          option("protect", null, [{ type: "satisfaction", target: "subject", amount: 5 }, { type: "fans", amount: -2 }]),
          option("spotlight", 0.55, [{ type: "form", target: "subject", amount: 1 }, { type: "fans", amount: 3 }], [{ type: "form", target: "subject", amount: -1 }, { type: "satisfaction", target: "subject", amount: -3 }]),
      ] };
    },
  },
  {
    id: "unhappyStar",
    kind: "request",
    weight: (context) => (context.squad.some((player) => (player.role === "star" || player.role === "starter") && moodOf(player.satisfaction) === "unhappy") ? 6 : 0),
    build: (context, rng) => {
      const player = pickPlayer(context, rng, (item) => (item.role === "star" || item.role === "starter") && moodOf(item.satisfaction) === "unhappy");
      if (!player) return null;
      const raise = Math.max(100, Math.round(player.wage * 0.3 / 100) * 100);
      return {
        subject: player.id,
        params: { raise },
        options: [
          option("promise", null, [{ type: "satisfaction", target: "subject", amount: 14 }, { type: "promise", kind: "starts", target: 0.7 }]),
          option("raise", null, [{ type: "satisfaction", target: "subject", amount: 10 }, { type: "wage", amount: raise }]),
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
      const price = roundPlayerPrice(valueOf(player, context.year) * rng.real(0.95, 1.2), ageOf(player, context.year));
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
          option("medical", null, [{ type: "budget", amount: -cost }, { type: "injury", days: -10 }]),
          option("rotate", null, [{ type: "satisfaction", target: "bench", amount: 4 }, { type: "training", sector: "mid", amount: 1 }, { type: "satisfaction", target: "starters", amount: DECISION_TRADEOFFS.rotationStarters }]),
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
          option("calm", null, [{ type: "training", sector: "def", amount: 1 }, { type: "satisfaction", target: "squad", amount: 1 }, { type: "form", target: "starters", amount: DECISION_TRADEOFFS.calmForm }]),
        ],
      };
    },
  },
  {
    id: "boardBonus",
    kind: "opportunity",
    weight: (context) => context.career.half === 1 ? 0 : (context.career.coach && context.career.coach.board >= 55 ? 3 : 1),
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
          option("accept", null, [{ type: "trait", trait: "mentor" }, { type: "satisfaction", target: "subject", amount: 6 }, { type: "satisfaction", target: "youth", amount: 3 }, { type: "form", target: "subject", amount: DECISION_TRADEOFFS.mentorForm }]),
          option("focus", null, [{ type: "form", target: "subject", amount: 1 }, { type: "satisfaction", target: "youth", amount: DECISION_TRADEOFFS.focusYouth }]),
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
      const price = roundPlayerPrice(valueOf(player, context.year) * rng.real(1.15, 1.45), ageOf(player, context.year));
      return {
        subject: player.id,
        params: { buyer, price, rival: rival ? 1 : 0 },
        options: [
          option("sell", null, [{ type: "sell", price, buyer }, { type: "fans", amount: rival ? -5 : -1 }]),
          option("keep", null, [{ type: "satisfaction", target: "subject", amount: 5 }, { type: "promise", kind: "keep", target: 1 }]),
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
      const raise = Math.max(100, Math.round(player.wage * 0.35 / 100) * 100);
      return {
        subject: player.id,
        params: { raise },
        options: [
          option("raise", null, [{ type: "satisfaction", target: "subject", amount: 12 }, { type: "wage", amount: raise }]),
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
          option("rush", 0.5, [{ type: "form", target: "subject", amount: 0.5 }], [{ type: "injury", days: 365 }]),
          option("rest", null, [{ type: "injury", days: 150 }, { type: "satisfaction", target: "subject", amount: 3 }]),
        ],
      };
    },
  },
  {
    id: "austerity",
    kind: "crisis",
    weight: (context) => (context.squad.reduce((sum, player) => sum + player.wage, 0) >= revenue(context) * FINANCE.wageCap / 12 * 0.9 ? 7 : 0),
    build: (context) => {
      const top = [...context.squad].sort((a, b) => b.wage - a.wage)[0];
      if (!top) return null;
      return {
        subject: top.id,
        params: {},
        options: [
          option("list", null, [{ type: "listed" }, { type: "board", amount: 4 }, { type: "satisfaction", target: "subject", amount: -4 }]),
          option("cut", null, [{ type: "wage", target: "squad", amount: -0.05, relative: true }, { type: "board", amount: 2 }, { type: "satisfaction", target: "squad", amount: -4 }]),
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
          option("youth", null, [
            { type: "satisfaction", target: "youth", amount: 5 },
            { type: "satisfaction", target: "subject", amount: -8 },
            { type: "promise", kind: "youth", target: PROMISES.youthGames },
          ]),
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
          option("celebrate", null, [{ type: "fans", amount: 4 }, { type: "satisfaction", target: "squad", amount: 2 }, { type: "budget", amount: -roundMoney(revenue(context) * DECISION_TRADEOFFS.celebrationCost) }]),
          option("invest", null, [{ type: "budget", amount }, { type: "board", amount: 2 }, { type: "fans", amount: DECISION_TRADEOFFS.investmentFans }]),
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
          option("tour", 0.7, [{ type: "budget", amount }], [{ type: "budget", amount }, { type: "form", target: "starters", amount: -1 }]),
          option("camp", null, [{ type: "training", sector: "mid", amount: 1 }, { type: "budget", amount: -roundMoney(revenue(context) * DECISION_TRADEOFFS.campCost) }]),
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
  const recent = new Set(career.eventsSeen.slice(-3));
  const all = CATALOG.map((definition) => [definition, definition.weight(context)] as const).filter(([, weight]) => weight > 0);
  const fresh = all.filter(([definition]) => !recent.has(definition.id));
  const eligible = fresh.length ? fresh : all;
  const matchShare = eligible.length === 0 ? 1 : STAGE_EVENTS.matchShare;
  if (rng.chance(matchShare)) return { match: true, event: null };
  const shuffled = rng.shuffle(eligible);
  while (shuffled.length > 0) {
    const definition = rng.weighted(shuffled.map((entry) => [entry[0], entry[1]] as const));
    const built = definition.build(context, coachRng(career.setup.seed, "event", key, definition.id));
    if (built) {
      const options = built.options.filter((choice) => career.setup.mode === "slow" && career.half === 0
        || ![...choice.success, ...choice.failure].some((effect) => effect.type === "promise"));
      if (options.length < 2) { shuffled.splice(shuffled.findIndex((entry) => entry[0] === definition), 1); continue; }
      return {
        match: false,
        event: { id: definition.id, kind: definition.kind, subject: built.subject, params: built.params, options, match: null, chosen: null, outcome: null },
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
  ],
  drawing: [
    { id: "push", forMult: 1.32, againstMult: 1.25 },
    { id: "balance", forMult: 1.08, againstMult: DECISION_TRADEOFFS.balancedAgainst },
    { id: "hold", forMult: 0.78, againstMult: 0.68 },
  ],
  winning: [
    { id: "close", forMult: 0.75, againstMult: 0.62 },
    { id: "keepGoing", forMult: 1.22, againstMult: 1.12 },
    { id: "manage", forMult: 0.95, againstMult: 0.9 },
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

/** Os mesmos integrantes usados pela resolução e pela consulta da interface. */
export function eventTargets(career: CoachCareer, target: "subject" | "squad" | "starters" | "bench" | "youth", subjectId: string | null): CoachPlayer[] {
  const coach = career.coach;
  if (!coach) return [];
  if (target === "subject") return subjectId && career.players[subjectId] ? [career.players[subjectId]!] : [];
  const squad = squadOf(career, coach.club);
  if (target === "starters") return squad.filter((player) => coach.tactics.lineup.includes(player.id));
  if (target === "bench") return squad.filter((player) => !coach.tactics.lineup.includes(player.id));
  if (target === "youth") return squad.filter((player) => ageOf(player, career.year) <= 21);
  return squad;
}

/** Aplica os efeitos de uma escolha (evento ou conversa). Devolve o texto das mudanças de barra. */
export function applyEffects(career: CoachCareer, effects: readonly EventEffect[], subjectId: string | null, origin: "talk" | "event"): void {
  const coach = career.coach;
  if (!coach) return;
  const squad = squadOf(career, coach.club);
  const club = career.clubs[coach.club];
  const subject = subjectId ? career.players[subjectId] : null;
  const targets = (target: "subject" | "squad" | "starters" | "bench" | "youth") => eventTargets(career, target, subjectId);
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
      case "wage":
        for (const player of targets(effect.target ?? "subject")) player.wage = Math.max(0, Math.round((effect.relative ? player.wage * (1 + effect.amount) : player.wage + effect.amount) / 100) * 100);
        break;
      case "cash":
        coach.budget += effect.amount;
        if (club) changeCash(club, effect.amount);
        break;
      case "budget":
        coach.budget += effect.amount;
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
        // A promessa aos jovens é com o grupo, não com o jogador do evento.
        addPromise(career, effect.kind, effect.kind === "youth" ? null : subjectId, effect.target, origin);
        break;
      case "injury":
        if (effect.days < 0) {
          for (const player of squad) {
            if (player.injury) {
              if (player.injury.turns === 2) player.injury = stageInjury(career, career.day, 150, "light");
              else if (player.injury.turns === 1) player.injury = null;
              else player.injury = { ...player.injury, until: Math.max(career.day + 1, player.injury.until + effect.days) };
            }
          }
        } else if (subject) {
          subject.injury = stageInjury(career, career.day, effect.days, effect.days >= 300 ? "medium" : "light");
          career.ledger.injuries.push({ player: subject.id, days: effect.days, kind: effect.days >= 300 ? "medium" : "light" });
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
  void kind;
  return absDay(career.seasonIndex, 150);
}

export function addPromise(career: CoachCareer, kind: CoachPromise["kind"], player: string | null, target: number, origin: "talk" | "event"): void {
  if (career.setup.mode !== "slow" || career.half !== 0) return;
  void kind; void target;
  const promisedPlayer = player ?? eventTargets(career,"youth",null).filter((item)=>!item.injury).sort((a,b)=>b.ovr-a.ovr || a.id.localeCompare(b.id))[0]?.id ?? null;
  if (!promisedPlayer) return;
  const id = `${stageKey(career.year,career.half)}:starts:${promisedPlayer}:${career.promises.length}`;
  const subject = career.players[promisedPlayer];
  // A cobrança conta a partir daqui: guarda os números de agora.
  const baseline = subject
    ? { starts: subject.season.starts, available: subject.season.available, apps: subject.season.apps }
    : { starts: 0, available: 0, apps: 0 };
  if (subject && !career.promises.some((item) => item.status === "active" && item.player === promisedPlayer)) {
    career.promises.push({id,kind:"starts",player:promisedPlayer,until:promiseDeadline(career,"starts"),madeAt:career.day,target:1,origin,baseline,status:"active"});
  }
}

/** Resolve a escolha de um evento fora de campo. */
/** Reserva o custo máximo possível; escolhas de evento também respeitam a verba. */
export function eventCost(option: EventOption): number {
  const cost = (effects: readonly EventEffect[]) => Math.max(0, -effects.reduce((sum, effect) => sum + ((effect.type === "budget" || effect.type === "cash") ? effect.amount : 0), 0));
  return Math.max(cost(option.success), cost(option.failure));
}
export function canAffordEvent(career: CoachCareer, option: EventOption): boolean {
  return eventCost(option) <= Math.max(0, career.coach?.budget ?? 0);
}

export function resolveEventChoice(career: CoachCareer, optionId: string): void {
  const event = career.event;
  if (!event || event.chosen) return;
  const chosen = event.options.find((item) => item.id === optionId);
  if (!chosen) return;
  const roll = coachRng(career.setup.seed, "eventOutcome", stageKey(career.year, career.half), event.id, optionId).next();
  const success = chosen.chance === null || roll < chosen.chance;
  career.eventsSeen = [...career.eventsSeen, event.id];
  event.chosen = optionId;
  event.outcome = success ? "success" : "failure";
  applyEffects(career, success ? chosen.success : chosen.failure, event.subject, "event");
}

export const EVENT_IDS = CATALOG.map((definition) => definition.id);
/** Cena de teste com os mesmos alvos e efeitos do catálogo; não força pré-condições falsas. */
export function debugEvent(career: CoachCareer, id: string): CoachEvent | null {
  const context = eventContext(career);
  const definition = CATALOG.find((entry) => entry.id === id);
  if (!context || !definition || definition.weight(context) <= 0) return null;
  const built = definition.build(context, coachRng(career.setup.seed, "debugEvent", id));
  return built ? { ...built, id, kind: definition.kind, match: null, chosen: null, outcome: null } : null;
}
export const MATCH_EVENT_OPTIONS = MATCH_OPTIONS;

/** Para testes e laboratório: o peso de cada evento no contexto atual. */
export function eventWeights(career: CoachCareer): Array<{ id: string; kind: EventKind; weight: number }> {
  const context = eventContext(career);
  if (!context) return [];
  return CATALOG.map((definition) => ({ id: definition.id, kind: definition.kind, weight: definition.weight(context) }));
}

void unit;
