import { clamp } from "../math";
import type { Position } from "../player/positions";
import { addPromise, applyEffects } from "./events";
import { registered, registrationRule, viableSquad } from "./lineup";
import { askingTerms, demandOf, pickBuyer, purchaseChance, roundPrice, saleOfferChance, transferPlayer } from "./market";
import { ageOf, moodOf, valueOf, wageFor } from "./players";
import type {
  ActionFlow,
  ActionKind,
  CoachCareer,
  CoachPlayer,
  CoachTrait,
  EventEffect,
  FundsResponse,
  ObjectiveKind,
  PurchaseResponse,
  SaleOffer,
  Sector,
  TalkConcern,
  TalkResult,
  YouthCandidate,
} from "./types";
import { ACTIONS_PER_STAGE, DEVELOP, FINANCE, FUNDS, PURCHASE, SALE, YOUTH } from "./tuning";
import { coachRng, stageKey } from "./util";
import { invalidateSquads, squadOf } from "./world";

/**
 * As sete ações (spec 6). Abrir e escolher alvos é livre; confirmar gasta uma
 * das três ações da etapa e abre as respostas; aceitar ou recusar cada
 * resposta não gasta nada. Dinheiro, folha e elenco mudam só no aceite, uma
 * vez, e cada aceite é validado de novo (um negócio aceito pode impedir o
 * seguinte).
 */

export class ActionError extends Error {
  constructor(readonly code: string) {
    super(`coach: ${code}`);
  }
}

function coachOf(career: CoachCareer) {
  const coach = career.coach;
  if (!coach) throw new ActionError("noClub");
  return coach;
}

function requireStage(career: CoachCareer): void {
  if (career.phase !== "stage") throw new ActionError("phase");
}

export function canStartAction(career: CoachCareer, kind: ActionKind): { ok: boolean; reason: string | null } {
  if (career.phase !== "stage") return { ok: false, reason: "phase" };
  if (career.flow) return { ok: false, reason: "flowOpen" };
  if (career.actionsUsed >= ACTIONS_PER_STAGE) return { ok: false, reason: "noActions" };
  if (kind === "youth" && !career.youth.some((candidate) => !candidate.promoted)) return { ok: false, reason: "noCandidates" };
  if (kind === "funds" && (career.coach?.fundsGranted ?? 0) >= FUNDS.maxGrants) return { ok: false, reason: "fundsLimit" };
  if (kind === "develop" && developable(career).length === 0) return { ok: false, reason: "noneToDevelop" };
  return { ok: true, reason: null };
}

/** Abre o processo (sem gastar ação). */
export function openAction(career: CoachCareer, kind: ActionKind): void {
  const check = canStartAction(career, kind);
  if (!check.ok) throw new ActionError(check.reason ?? "blocked");
  const number = career.actionsUsed + 1;
  const flows: Record<ActionKind, ActionFlow> = {
    sell: { kind: "sell", number, step: "select", offers: [] },
    buy: { kind: "buy", number, step: "select", responses: [] },
    train: { kind: "train", number, step: "select" },
    develop: { kind: "develop", number, step: "select" },
    youth: { kind: "youth", number, step: "select" },
    locker: { kind: "locker", number, step: "select", mode: null, talks: [], meeting: null },
    funds: { kind: "funds", number, step: "responses", response: { outcome: "refused", amount: 0, condition: null, status: "none" } },
  };
  career.flow = flows[kind];
  if (kind === "funds") {
    // Pedir verba não tem alvo: abrir já é a confirmação, e a resposta vem junto.
    consume(career, "funds");
    const flow = career.flow as Extract<ActionFlow, { kind: "funds" }>;
    flow.response = fundsResponse(career, number);
    if (flow.response.outcome === "refused") flow.response.status = "none";
  }
}

/** Fecha sem confirmar: não gasta ação. Só antes da confirmação. */
export function cancelAction(career: CoachCareer): void {
  const flow = career.flow;
  if (!flow) return;
  if (flow.step !== "select") throw new ActionError("alreadyConfirmed");
  career.flow = null;
}

function consume(career: CoachCareer, kind: ActionKind): void {
  if (career.actionsUsed >= ACTIONS_PER_STAGE) throw new ActionError("noActions");
  career.actionsUsed += 1;
  career.actions.push({ number: career.actionsUsed, kind });
}

export type ConfirmPayload =
  | { readonly kind: "sell"; readonly players: readonly string[] }
  | { readonly kind: "buy"; readonly players: readonly string[] }
  | { readonly kind: "train"; readonly sector: Sector }
  | { readonly kind: "develop"; readonly players: readonly string[] }
  | { readonly kind: "youth"; readonly candidate: string }
  | { readonly kind: "locker"; readonly mode: "talk"; readonly players: readonly string[] }
  | { readonly kind: "locker"; readonly mode: "meeting"; readonly choice: "support" | "demand" };

/** Confirma o processo aberto: gasta a ação e produz as respostas. */
export function confirmAction(career: CoachCareer, payload: ConfirmPayload): void {
  requireStage(career);
  const flow = career.flow;
  if (!flow || flow.kind !== payload.kind || flow.step !== "select") throw new ActionError("noFlow");
  const coach = coachOf(career);
  const key = stageKey(career.year, career.half);
  const squad = squadOf(career, coach.club);
  switch (payload.kind) {
    case "sell": {
      const ids = unique(payload.players);
      if (ids.length === 0 || ids.length > SALE.maxTargets) throw new ActionError("targets");
      for (const id of ids) {
        const player = career.players[id];
        if (!player || player.club !== coach.club) throw new ActionError("notInSquad");
        if (player.offeredAt === key) throw new ActionError("alreadyOffered");
      }
      consume(career, "sell");
      const offers: SaleOffer[] = ids.map((id) => {
        const player = career.players[id] as CoachPlayer;
        player.offeredAt = key;
        const rng = coachRng(career.setup.seed, "sale", key, flow.number, id);
        const demand = demandOf(career, player);
        if (!rng.chance(saleOfferChance(demand))) return { id: `${id}:sale`, player: id, buyer: null, price: 0, status: "none" };
        const [low, high] = SALE.priceRange;
        const price = roundPrice(valueOf(player, career.year) * rng.real(low, high) * SALE.demandFactor[demand]);
        const buyer = pickBuyer(career, player, price, rng);
        if (!buyer) return { id: `${id}:sale`, player: id, buyer: null, price: 0, status: "none" };
        return { id: `${id}:sale`, player: id, buyer, price, status: "pending" };
      });
      (flow as Extract<ActionFlow, { kind: "sell" }>).offers = offers;
      flow.step = "responses";
      return;
    }
    case "buy": {
      const ids = unique(payload.players);
      if (ids.length === 0 || ids.length > PURCHASE.maxTargets) throw new ActionError("targets");
      for (const id of ids) {
        const player = career.players[id];
        if (!player || player.club === coach.club) throw new ActionError("invalidTarget");
      }
      consume(career, "buy");
      const responses: PurchaseResponse[] = ids.map((id) => {
        const player = career.players[id] as CoachPlayer;
        const rng = coachRng(career.setup.seed, "purchase", key, flow.number, id);
        const chance = purchaseChance(career, player, coach.club);
        const clubSays = rng.next() < chance.clubChance;
        const playerSays = rng.next() < chance.playerChance;
        const terms = askingTerms(career, player, coach.club, rng);
        const outcome: PurchaseResponse["outcome"] = !clubSays ? "clubRefused" : !playerSays ? "playerRefused" : "available";
        return {
          id: `${id}:buy`,
          player: id,
          from: player.club,
          outcome,
          price: terms.price,
          wage: terms.wage,
          status: outcome === "available" ? "pending" : "unavailable",
        };
      });
      (flow as Extract<ActionFlow, { kind: "buy" }>).responses = responses;
      flow.step = "responses";
      return;
    }
    case "train": {
      consume(career, "train");
      coach.training[payload.sector] = Math.min(3, (coach.training[payload.sector] ?? 0) + 1);
      career.flow = null;
      return;
    }
    case "develop": {
      const ids = unique(payload.players);
      if (ids.length === 0 || ids.length > DEVELOP.maxPlayers) throw new ActionError("targets");
      const allowed = new Set(developable(career).map((player) => player.id));
      for (const id of ids) if (!allowed.has(id)) throw new ActionError("notDevelopable");
      consume(career, "develop");
      for (const id of ids) (career.players[id] as CoachPlayer).developedAt = key;
      career.flow = null;
      return;
    }
    case "youth": {
      const candidate = career.youth.find((item) => item.id === payload.candidate && !item.promoted);
      if (!candidate) throw new ActionError("candidate");
      consume(career, "youth");
      promoteYouth(career, candidate);
      career.flow = null;
      return;
    }
    case "locker": {
      const locker = flow as Extract<ActionFlow, { kind: "locker" }>;
      if (payload.mode === "talk") {
        const ids = unique(payload.players);
        if (ids.length === 0 || ids.length > 3) throw new ActionError("targets");
        for (const id of ids) if (career.players[id]?.club !== coach.club) throw new ActionError("notInSquad");
        consume(career, "locker");
        locker.mode = "talk";
        locker.talks = ids.map((id) => talkWith(career, career.players[id] as CoachPlayer, locker.number));
        locker.step = "responses";
        return;
      }
      consume(career, "locker");
      locker.mode = "meeting";
      locker.meeting = { choice: payload.choice, outcome: meeting(career, payload.choice, locker.number, squad) };
      locker.step = "responses";
      return;
    }
  }
}

function unique(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

// ------------------------------------------------------------ respostas

export interface Preview {
  readonly ok: boolean;
  readonly blockers: readonly string[];
  readonly budgetAfter: number;
  readonly cashAfter: number;
  readonly wageBillAfter: number;
  readonly wageCap: number;
}

export function wageBill(career: CoachCareer): number {
  const coach = career.coach;
  if (!coach) return 0;
  return squadOf(career, coach.club).reduce((total, player) => total + player.wage, 0);
}

/** Impacto financeiro de aceitar uma contratação (mostrado antes de aceitar). */
export function purchasePreview(career: CoachCareer, response: PurchaseResponse): Preview {
  const coach = coachOf(career);
  const club = career.clubs[coach.club];
  const player = career.players[response.player];
  const blockers: string[] = [];
  const budgetAfter = coach.budget - response.price;
  const cashAfter = (club?.cash ?? 0) - response.price;
  const wageCap = ((club?.revenue ?? 0) * FINANCE.wageCap) / 12;
  const wageBillAfter = wageBill(career) + response.wage;
  if (response.status !== "pending") blockers.push("notPending");
  if (!player || player.club !== response.from) blockers.push("gone");
  if (budgetAfter < 0) blockers.push("budget");
  if (cashAfter < -FINANCE.debtLimit * (club?.revenue ?? 0)) blockers.push("cash");
  if (wageBillAfter > wageCap) blockers.push("wages");
  if (player && club) {
    const squad = squadOf(career, coach.club);
    const rule = registrationRule(club.country);
    const seniors = squad.filter((other) => ageOf(other, career.year) > rule.youthAge).length;
    if (ageOf(player, career.year) > rule.youthAge && seniors + 1 > rule.senior + 5) blockers.push("registration");
  }
  return { ok: blockers.length === 0, blockers, budgetAfter, cashAfter, wageBillAfter, wageCap };
}

/** Impacto de aceitar uma venda. */
export function salePreview(career: CoachCareer, offer: SaleOffer): Preview {
  const coach = coachOf(career);
  const club = career.clubs[coach.club];
  const squad = squadOf(career, coach.club).filter((player) => player.id !== offer.player);
  const blockers: string[] = [];
  if (offer.status !== "pending") blockers.push("notPending");
  if (career.players[offer.player]?.club !== coach.club) blockers.push("gone");
  if (!viableSquad(squad)) blockers.push("squad");
  if (career.promises.some((promise) => promise.status === "active" && promise.kind === "keep" && promise.player === offer.player)) blockers.push("promise");
  const wageCap = ((club?.revenue ?? 0) * FINANCE.wageCap) / 12;
  return {
    ok: blockers.length === 0,
    blockers,
    budgetAfter: coach.budget + offer.price * FINANCE.saleToBudget,
    cashAfter: (club?.cash ?? 0) + offer.price,
    wageBillAfter: wageBill(career) - (career.players[offer.player]?.wage ?? 0),
    wageCap,
  };
}

export function respondAction(career: CoachCareer, itemId: string, decision: string): void {
  requireStage(career);
  const flow = career.flow;
  if (!flow || flow.step !== "responses") throw new ActionError("noResponses");
  const coach = coachOf(career);
  switch (flow.kind) {
    case "sell": {
      const offer = flow.offers.find((item) => item.id === itemId);
      if (!offer || offer.status !== "pending") throw new ActionError("notPending");
      if (decision !== "accept") {
        offer.status = "declined";
        return;
      }
      const preview = salePreview(career, offer);
      if (!preview.ok) throw new ActionError(`blocked:${preview.blockers.join(",")}`);
      const player = career.players[offer.player] as CoachPlayer;
      saleReactions(career, player);
      transferPlayer(career, offer.player, offer.buyer ?? "", offer.price, "sale");
      offer.status = "accepted";
      removeFromTactics(career, offer.player);
      return;
    }
    case "buy": {
      const response = flow.responses.find((item) => item.id === itemId);
      if (!response || response.status !== "pending") throw new ActionError("notPending");
      if (decision !== "accept") {
        response.status = "declined";
        return;
      }
      const preview = purchasePreview(career, response);
      if (!preview.ok) throw new ActionError(`blocked:${preview.blockers.join(",")}`);
      transferPlayer(career, response.player, coach.club, response.price, "purchase", response.wage);
      response.status = "accepted";
      return;
    }
    case "locker": {
      const talk = flow.talks.find((item) => item.id === itemId);
      if (!talk || talk.chosen) throw new ActionError("notPending");
      if (!talk.options.includes(decision)) throw new ActionError("option");
      resolveTalk(career, talk, decision, flow.number);
      return;
    }
    case "funds": {
      const response = flow.response;
      if (response.status !== "pending") throw new ActionError("notPending");
      if (decision !== "accept") {
        response.status = "declined";
        return;
      }
      response.status = "accepted";
      coach.budget += response.amount;
      coach.fundsGranted += 1;
      if (response.condition) {
        coach.objective = { ...coach.objective, kind: response.condition, target: Math.max(1, coach.objective.target - 2) };
        coach.raisedObjective = true;
      }
      return;
    }
    default:
      throw new ActionError("noResponses");
  }
}

/** Conclui o processo: o que ficou pendente é recusado. */
export function closeAction(career: CoachCareer): void {
  const flow = career.flow;
  if (!flow) return;
  if (flow.step === "select") throw new ActionError("notConfirmed");
  if (flow.kind === "sell") for (const offer of flow.offers) if (offer.status === "pending") offer.status = "declined";
  if (flow.kind === "buy") for (const response of flow.responses) if (response.status === "pending") response.status = "declined";
  if (flow.kind === "funds" && flow.response.status === "pending") flow.response.status = "declined";
  if (flow.kind === "locker") for (const talk of flow.talks) if (!talk.chosen) resolveTalk(career, talk, talk.options[0] ?? "", flow.number);
  career.flow = null;
}

function removeFromTactics(career: CoachCareer, playerId: string): void {
  const coach = career.coach;
  if (!coach) return;
  coach.tactics = {
    ...coach.tactics,
    lineup: coach.tactics.lineup.map((id) => (id === playerId ? "" : id)),
    bench: coach.tactics.bench.filter((id) => id !== playerId),
  };
}

/**
 * Reação a uma venda (spec 6.1): vender um ídolo irrita a torcida e o
 * elenco, mas a diretoria gosta das contas; vender um reserva descontente
 * alivia o vestiário.
 */
export function saleReactions(career: CoachCareer, player: CoachPlayer): void {
  const coach = career.coach;
  if (!coach) return;
  const legacy = career.legacy[player.id];
  const idol = (legacy?.apps ?? 0) >= 60 || (player.youthClub === coach.club && (legacy?.apps ?? 0) >= 30);
  const push = (bar: "board" | "fans" | "squad", delta: number, reason: string) => {
    if (bar === "board") coach.board = clamp(coach.board + delta, 0, 100);
    if (bar === "fans") coach.fans = clamp(coach.fans + delta, 0, 100);
    career.ledger.relations.push({ bar, delta, reason });
  };
  if (idol) {
    push("fans", -9, "idolSold");
    push("board", 2, "idolSoldMoney");
    for (const other of squadOf(career, coach.club)) other.satisfaction = clamp(other.satisfaction - 2, 0, 100);
  } else if (player.role === "star") {
    push("fans", -4, "starSold");
  } else if (moodOf(player.satisfaction) === "unhappy" && (player.role === "backup" || player.role === "rotation")) {
    for (const other of squadOf(career, coach.club)) other.satisfaction = clamp(other.satisfaction + 1, 0, 100);
    career.ledger.relations.push({ bar: "squad", delta: 1, reason: "unhappySold" });
  }
  const club = career.clubs[coach.club];
  if (club && club.cash < 0) push("board", 2, "debtRelief");
}

// ------------------------------------------------------------ desenvolver

export function developable(career: CoachCareer): CoachPlayer[] {
  const coach = career.coach;
  if (!coach) return [];
  const key = stageKey(career.year, career.half);
  return squadOf(career, coach.club).filter((player) => player.developedAt !== key);
}

// ----------------------------------------------------------------- base

const YOUTH_POSITIONS: ReadonlyArray<readonly [Position, number]> = [
  ["gk", 1],
  ["cb", 2],
  ["lb", 1],
  ["rb", 1],
  ["cdm", 1],
  ["cm", 2],
  ["cam", 1.2],
  ["lm", 0.6],
  ["rm", 0.6],
  ["lw", 1],
  ["rw", 1],
  ["st", 1.6],
];

const YOUTH_TRAITS: readonly CoachTrait[] = ["fast", "setPiece", "versatile", "aerial", "tireless"];

/**
 * Candidatos da base da etapa (spec 6.5): gerados uma vez no começo da
 * etapa e guardados. Reabrir a tela mostra os mesmos; repetir a ação escolhe
 * outro entre os que sobraram.
 */
export function generateYouth(career: CoachCareer): YouthCandidate[] {
  const coach = career.coach;
  if (!coach) return [];
  const club = career.clubs[coach.club];
  if (!club) return [];
  const key = stageKey(career.year, career.half);
  const anchor = club.anchor;
  const starterValue = valueOf({ ovr: Math.round(anchor), birthYear: career.year - 26 }, career.year);
  const candidates: YouthCandidate[] = [];
  for (let index = 0; index < YOUTH.candidates; index += 1) {
    const rng = coachRng(career.setup.seed, "youth", key, coach.club, index);
    const tier = rng.weighted(YOUTH.tiers.map((entry) => [entry, entry.weight] as const));
    const age = rng.int(YOUTH.ageRange[0], YOUTH.ageRange[1]);
    const ovr = Math.round(anchor + rng.real(tier.ovr[0], tier.ovr[1]) + (age - 17) * 1.2);
    const potential = Math.max(ovr + 2, anchor + rng.real(tier.potential[0], tier.potential[1]));
    const tiers = ["weak", "average", "good", "star"] as const;
    const descriptions = ["raw", "steady", "promising", "special"] as const;
    let level = tiers.indexOf(tier.tier);
    if (rng.chance(YOUTH.descriptionNoise)) level = clamp(level + (rng.chance(0.5) ? 1 : -1), 0, 3);
    const position = rng.weighted(YOUTH_POSITIONS);
    const foreign = rng.chance(0.08);
    candidates.push({
      id: `y:${career.year}:${career.half}:${coach.club}:${index}`,
      position,
      birthYear: career.year - age,
      nationality: foreign ? rng.pick(["ARG", "URU", "COL", "POR", "ESP", "FRA", "NGA", "GHA"]) : club.country,
      description: descriptions[level] ?? "steady",
      trait: tier.tier === "good" || tier.tier === "star" ? (rng.chance(0.3) ? rng.pick(YOUTH_TRAITS) : null) : rng.chance(0.06) ? rng.pick(YOUTH_TRAITS) : null,
      fee: roundPrice(starterValue * YOUTH.signingShare * rng.real(0.6, 1.4)),
      wage: Math.max(1_500, Math.round((wageFor(Math.round(anchor)) * YOUTH.wageShare * rng.real(0.6, 1.2)) / 500) * 500),
      hiddenOvr: clamp(ovr, 40, 85),
      hiddenPotential: clamp(potential, ovr + 1, 96),
      promoted: false,
    });
  }
  return candidates;
}

function promoteYouth(career: CoachCareer, candidate: YouthCandidate): void {
  const coach = coachOf(career);
  const club = career.clubs[coach.club];
  if (club) club.cash -= candidate.fee;
  candidate.promoted = true;
  const rng = coachRng(career.setup.seed, "youthPromote", candidate.id);
  career.players[candidate.id] = {
    id: candidate.id,
    name: "",
    nationality: candidate.nationality,
    position: candidate.position,
    alternates: [],
    birthYear: candidate.birthYear,
    origin: "y",
    level: candidate.hiddenOvr + rng.real(-0.4, 0.4),
    ovr: candidate.hiddenOvr,
    potential: candidate.hiddenPotential,
    longevity: rng.normal(0, 1.5),
    form: 0,
    recentRatings: [],
    traits: candidate.trait ? [candidate.trait] : [],
    club: coach.club,
    joinedYear: career.year,
    wage: candidate.wage,
    satisfaction: 70,
    role: "prospect",
    acceptsBench: true,
    injury: null,
    youthClub: coach.club,
    developedAt: null,
    listed: false,
    offeredAt: null,
    consecutiveStarts: 0,
    season: {
      apps: 0,
      starts: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      ratingSum: 0,
      rated: 0,
      available: 0,
      benchUnused: 0,
      derbyGoals: 0,
      bigGames: 0,
      bigGoals: 0,
      setPieceGoals: 0,
    },
  };
  invalidateSquads(career);
  career.legacy[candidate.id] = {
    player: candidate.id,
    name: "",
    nationality: candidate.nationality,
    position: candidate.position,
    apps: 0,
    goals: 0,
    seasons: 0,
    bestOvr: candidate.hiddenOvr,
    revealed: true,
    signed: false,
    firstOvr: candidate.hiddenOvr,
  };
  career.ledger.moments.push({ kind: "debut", player: candidate.id });
}

// ------------------------------------------------------------- vestiário

/** O que o jogador conta na conversa (spec 6.6), pelo que está acontecendo com ele. */
export function concernOf(career: CoachCareer, player: CoachPlayer): TalkConcern {
  const promise = career.promises.find((item) => item.status === "active" && item.player === player.id);
  if (promise) return "promise";
  const mood = moodOf(player.satisfaction);
  const share = player.season.available > 0 ? player.season.starts / player.season.available : 0;
  const playing = player.role === "star" || player.role === "starter";
  if (player.listed || (mood === "unhappy" && player.satisfaction < 32)) return "wantsOut";
  if ((playing && share < 0.5 && player.season.available >= 4) || (player.role === "rotation" && share < 0.25 && player.season.available >= 6)) return "minutes";
  if (player.form <= -1) return "form";
  if (mood !== "happy" && player.role === "backup") return "role";
  const club = career.clubs[player.club];
  if (club && player.nationality !== club.country && ageOf(player, career.year) <= 23 && player.satisfaction < 58) return "homesick";
  return "content";
}

const TALK_OPTIONS: Readonly<Record<TalkConcern, readonly string[]>> = {
  minutes: ["promiseStarts", "patience", "honest"],
  wantsOut: ["list", "convince", "promiseMinutes"],
  promise: ["reassure", "release"],
  form: ["confidence", "rest"],
  role: ["explain", "promiseMinutes"],
  homesick: ["family", "patience"],
  content: ["praise", "challenge"],
};

function talkWith(career: CoachCareer, player: CoachPlayer, number: number): TalkResult {
  const concern = concernOf(career, player);
  const rng = coachRng(career.setup.seed, "talk", stageKey(career.year, career.half), number, player.id);
  // Às vezes, só de conversar o jogador já melhora.
  const immediate = concern === "content" ? 3 : rng.chance(0.5) ? rng.int(2, 5) : 0;
  player.satisfaction = clamp(player.satisfaction + immediate, 0, 100);
  return { id: `${player.id}:talk`, player: player.id, concern, immediate, options: TALK_OPTIONS[concern], chosen: null, outcome: null };
}

interface TalkEffect {
  readonly chance: number | null;
  readonly success: readonly EventEffect[];
  readonly failure: readonly EventEffect[];
  readonly acceptBench?: boolean;
  readonly releasePromise?: boolean;
}

export const TALK_EFFECTS: Readonly<Record<string, TalkEffect>> = {
  promiseStarts: { chance: null, success: [{ type: "satisfaction", target: "subject", amount: 12 }, { type: "promise", kind: "starts", target: 0.6 }], failure: [] },
  patience: { chance: 0.6, success: [{ type: "satisfaction", target: "subject", amount: 5 }], failure: [{ type: "satisfaction", target: "subject", amount: -4 }] },
  honest: { chance: 0.6, success: [{ type: "satisfaction", target: "subject", amount: -2 }], failure: [{ type: "satisfaction", target: "subject", amount: -10 }], acceptBench: true },
  list: { chance: null, success: [{ type: "listed" }, { type: "satisfaction", target: "subject", amount: 6 }], failure: [] },
  convince: { chance: 0.45, success: [{ type: "satisfaction", target: "subject", amount: 12 }], failure: [{ type: "satisfaction", target: "subject", amount: -8 }] },
  promiseMinutes: { chance: null, success: [{ type: "satisfaction", target: "subject", amount: 8 }, { type: "promise", kind: "minutes", target: 6 }], failure: [] },
  reassure: { chance: null, success: [{ type: "satisfaction", target: "subject", amount: 3 }], failure: [] },
  release: { chance: null, success: [{ type: "satisfaction", target: "subject", amount: -6 }], failure: [], releasePromise: true },
  confidence: { chance: 0.65, success: [{ type: "form", target: "subject", amount: 1 }, { type: "satisfaction", target: "subject", amount: 2 }], failure: [{ type: "satisfaction", target: "subject", amount: -2 }] },
  rest: { chance: null, success: [{ type: "satisfaction", target: "subject", amount: 2 }, { type: "form", target: "subject", amount: 0.5 }], failure: [] },
  explain: { chance: 0.6, success: [{ type: "satisfaction", target: "subject", amount: 4 }], failure: [{ type: "satisfaction", target: "subject", amount: -4 }], acceptBench: true },
  family: { chance: null, success: [{ type: "satisfaction", target: "subject", amount: 10 }, { type: "cash", amount: -20_000 }], failure: [] },
  praise: { chance: null, success: [{ type: "satisfaction", target: "subject", amount: 4 }], failure: [] },
  challenge: { chance: 0.6, success: [{ type: "form", target: "subject", amount: 1 }], failure: [{ type: "satisfaction", target: "subject", amount: -3 }] },
};

function resolveTalk(career: CoachCareer, talk: TalkResult, decision: string, number: number): void {
  const effect = TALK_EFFECTS[decision];
  if (!effect) return;
  const rng = coachRng(career.setup.seed, "talkOutcome", stageKey(career.year, career.half), number, talk.player, decision);
  const success = effect.chance === null || rng.next() < effect.chance;
  talk.chosen = decision;
  talk.outcome = success ? "good" : "bad";
  const player = career.players[talk.player];
  if (effect.acceptBench && success && player) player.acceptsBench = true;
  if (effect.releasePromise) {
    for (const promise of career.promises) if (promise.status === "active" && promise.player === talk.player) promise.status = "kept";
  }
  applyEffects(career, success ? effect.success : effect.failure, talk.player, "talk");
}

/**
 * Reunião coletiva (spec 6.6): apoiar ou cobrar, conforme o momento. Efeitos
 * menores, para todos.
 */
function meeting(career: CoachCareer, choice: "support" | "demand", number: number, squad: CoachPlayer[]): "good" | "bad" {
  const coach = coachOf(career);
  const rng = coachRng(career.setup.seed, "meeting", stageKey(career.year, career.half), number);
  const struggling = coach.fans < 50 || coach.board < 50;
  if (choice === "support") {
    for (const player of squad) {
      const extra = moodOf(player.satisfaction) === "unhappy" ? 2 : 0;
      player.satisfaction = clamp(player.satisfaction + (struggling ? 4 : 2) + extra, 0, 100);
    }
    return "good";
  }
  const success = rng.chance(struggling ? 0.55 : 0.35);
  for (const player of squad) {
    if (success) {
      if (coach.tactics.lineup.includes(player.id)) player.form = clamp(player.form + 0.5, -2, 2);
    } else {
      player.satisfaction = clamp(player.satisfaction - 4, 0, 100);
    }
  }
  if (success) coach.board = clamp(coach.board + 2, 0, 100);
  return success ? "good" : "bad";
}

// ----------------------------------------------------------------- verba

/**
 * Pedido de verba (spec 6.7): a resposta pesa a confiança da diretoria e o
 * caixa do clube. Pedidos repetidos rendem menos; condição (objetivo mais
 * alto) aparece antes de aceitar.
 */
export function fundsChances(career: CoachCareer): { large: number; small: number; refused: number } {
  const coach = coachOf(career);
  const club = career.clubs[coach.club];
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const trust = sigmoid((coach.board - 55) / 8);
  const health = sigmoid(((club?.cash ?? 0) / Math.max(1, club?.revenue ?? 1) + 0.05) / 0.08);
  const repeat = FUNDS.repeatFactor ** coach.fundsRequests;
  const large = 0.45 * trust * health * repeat;
  const small = Math.min(1 - large, 0.55 * (0.5 + 0.5 * trust) * (0.4 + 0.6 * health) * repeat);
  return { large, small, refused: Math.max(0, 1 - large - small) };
}

const RAISE: Readonly<Record<ObjectiveKind, ObjectiveKind>> = {
  bottom: "mid",
  survive: "mid",
  mid: "top",
  top: "title",
  title: "title",
  promotion: "promotion",
};

function fundsResponse(career: CoachCareer, number: number): FundsResponse {
  const coach = coachOf(career);
  const club = career.clubs[coach.club];
  const chances = fundsChances(career);
  coach.fundsRequests += 1;
  const rng = coachRng(career.setup.seed, "funds", stageKey(career.year, career.half), number);
  const roll = rng.next();
  const revenue = club?.revenue ?? 0;
  const repeat = FUNDS.repeatFactor ** (coach.fundsRequests - 1);
  if (roll < chances.large) {
    const condition = rng.chance(0.5) && coach.objective.kind !== "title" && coach.objective.kind !== "promotion" ? RAISE[coach.objective.kind] : null;
    return { outcome: "large", amount: roundPrice(revenue * 0.06 * repeat * (FUNDS.large / 0.35)), condition, status: "pending" };
  }
  if (roll < chances.large + chances.small) {
    return { outcome: "small", amount: roundPrice(revenue * 0.025 * repeat * (FUNDS.small / 0.12)), condition: null, status: "pending" };
  }
  return { outcome: "refused", amount: 0, condition: null, status: "none" };
}

/** Registro atual (para a interface mostrar quem está fora da lista). */
export function registeredIds(career: CoachCareer): Set<string> {
  const coach = coachOf(career);
  const club = career.clubs[coach.club];
  return registered(squadOf(career, coach.club), club?.country ?? "BRA", career.year);
}

export { addPromise };
