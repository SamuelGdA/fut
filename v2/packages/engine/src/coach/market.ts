import type { Division } from "@craque/world";
import { clamp } from "../math";
import type { Rng } from "../rng";
import { ageOf, valueOf, wageFor } from "./players";
import type { CoachCareer, CoachClub, CoachPlayer, Demand, Role } from "./types";
import { FINANCE, PURCHASE, SALE } from "./tuning";
import { invalidateSquads, roleFor, squadOf } from "./world";

/**
 * Mercado (spec 6.1, 6.2 e 15). Contratar acima do próprio nível fica cada vez
 * mais difícil, até ser quase impossível: o jogador mede o clube pela
 * atratividade (força, prestígio, liga, continental e reputação do
 * treinador) e o clube dono quase nunca libera um titular para um clube menor.
 * As duas chances se multiplicam (GDD 42.7).
 */

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ------------------------------------------------------------ atratividade

const LEAGUE_QUALITY = new WeakMap<object, Map<string, number>>();
const CONTINENTAL = new WeakMap<object, Map<string, number>>();

/** Força média da liga do clube, para medir o peso da vitrine (calculada uma vez por estado). */
function leagueQuality(career: CoachCareer, club: CoachClub): number {
  let cache = LEAGUE_QUALITY.get(career.clubs);
  if (!cache) {
    const totals = new Map<string, { sum: number; count: number }>();
    for (const other of Object.values(career.clubs)) {
      const key = `${other.country}:${other.division}`;
      const entry = totals.get(key) ?? { sum: 0, count: 0 };
      entry.sum += other.strength;
      entry.count += 1;
      totals.set(key, entry);
    }
    cache = new Map([...totals].map(([key, entry]) => [key, entry.sum / entry.count]));
    LEAGUE_QUALITY.set(career.clubs, cache);
  }
  return cache.get(`${club.country}:${club.division}`) ?? club.strength;
}

function continentalBonus(career: CoachCareer, club: string): number {
  let cache = CONTINENTAL.get(career.competitions);
  if (!cache) {
    cache = new Map();
    for (const state of Object.values(career.competitions)) {
      const value = state.kind === "cont1" ? 1.5 : state.kind === "cont2" || state.kind === "cont3" ? 0.7 : 0;
      if (value === 0) continue;
      for (const entrant of state.entrants) cache.set(entrant, Math.max(cache.get(entrant) ?? 0, value));
    }
    CONTINENTAL.set(career.competitions, cache);
  }
  return cache.get(club) ?? 0;
}

export interface Attractiveness {
  readonly strength: number;
  readonly prestige: number;
  readonly league: number;
  readonly continental: number;
  readonly reputation: number;
  readonly total: number;
}

/** O quanto um clube atrai jogadores: força + prestígio + liga + continental + reputação do treinador. */
export function attractiveness(career: CoachCareer, clubId: string, withCoach: boolean): Attractiveness {
  const club = career.clubs[clubId];
  if (!club) return { strength: 60, prestige: 0, league: 0, continental: 0, reputation: 0, total: 60 };
  const prestige = 2 * (club.prestige - 3);
  const league = 0.25 * (leagueQuality(career, club) - 70);
  const continental = continentalBonus(career, clubId);
  const reputation = withCoach ? 0.06 * (career.reputation - 40) : 0;
  return { strength: club.strength, prestige, league, continental, reputation, total: club.strength + prestige + league + continental + reputation };
}

export interface InterestBreakdown {
  /** O que o jogador acha que merece (OVR puxado pelo clube atual). */
  readonly expectation: number;
  readonly gap: number;
  readonly levelFactor: number;
  readonly stepDown: number;
  readonly stepFactor: number;
  readonly starFactor: number;
  readonly roleFactor: number;
  readonly playerChance: number;
  readonly clubChance: number;
  readonly total: number;
}

/**
 * Chance de um negócio existir (o jogador querer e o clube liberar).
 *
 *   expectativa = OVR − mín(3; 0,5 × máx(0; OVR − atratividade do clube atual))
 *   jogador = σ((2,5 − lacuna) / 1,6) × σ((folga − descida) / 2,2) × estrela × papel
 *   clube   = base do papel lá × σ((força comprador − força vendedor + 3) / 2,5) (titulares)
 *
 * lacuna = expectativa − atratividade do comprador; descida = força do
 * vendedor − força do comprador; folga = 4 (8 para quem não joga lá; +3
 * para veteranos). A expectativa mede o que o jogador acha que merece: o
 * próprio nível, puxado para baixo quando ele joga num clube bem menos
 * atraente (o craque de um clube pequeno aceita um vizinho do mesmo porte,
 * nunca um clube bem menor). Sem clube, a expectativa é OVR − 3.
 * Estrela (85+): × máx(0,05; 1 − 0,15 × (OVR − 84)), salvo clube de elite.
 */
export function purchaseChance(career: CoachCareer, player: CoachPlayer, buyerId: string): InterestBreakdown {
  const buyer = attractiveness(career, buyerId, buyerId === career.coach?.club);
  const seller = player.club ? career.clubs[player.club] : null;
  const buyerClub = career.clubs[buyerId];
  const age = ageOf(player, career.year);
  const current = seller ? attractiveness(career, seller.id, false).total : null;
  const expectation = current === null ? player.ovr - PURCHASE.freeAgentDiscount : player.ovr - Math.min(PURCHASE.ambitionCap, PURCHASE.ambitionPull * Math.max(0, player.ovr - current));
  const gap = expectation - buyer.total;
  const levelFactor = sigmoid((2.5 - gap) / 1.6);
  const playing = player.role === "star" || player.role === "starter";
  const slack = 4 + (playing ? 0 : 4) + (age >= 32 ? 3 : 0);
  const stepDown = seller && buyerClub ? seller.strength - buyerClub.strength : 0;
  const stepFactor = sigmoid((slack - stepDown) / 2.2);
  const starFactor = player.ovr >= 85 && buyer.total < player.ovr - 1 ? Math.max(0.05, 1 - 0.15 * (player.ovr - 84)) : 1;
  const buyerSquad = squadOf(career, buyerId);
  const roleThere = buyerClub ? roleFor(player, [...buyerSquad.filter((other) => other.id !== player.id), player], career.year, buyerClub.strength) : "backup";
  const roleFactor = roleThere === "star" || roleThere === "starter" ? 1.15 : roleThere === "backup" ? 0.5 : 1;
  // Piso minúsculo: nunca impossível, mas a curva continua caindo até lá.
  const playerChance = clamp(levelFactor * stepFactor * starFactor * roleFactor, PURCHASE.playerFloor, 0.97);
  let clubChance = 1;
  if (seller) {
    clubChance = PURCHASE.clubWilling[player.role];
    if (playing && buyerClub) clubChance *= sigmoid((buyerClub.strength - seller.strength + 3) / 2.5) * 1.6;
    if (player.listed) clubChance *= 1.5;
    if (age >= 31) clubChance *= 1.3;
    clubChance = clamp(clubChance, 0.01, 0.97);
  }
  return { expectation, gap, levelFactor, stepDown, stepFactor, starFactor, roleFactor, playerChance, clubChance, total: playerChance * clubChance };
}

export type ChanceTier = "veryHard" | "hard" | "possible" | "likely";

/** O que a tela mostra antes de confirmar: uma faixa, nunca a conta. */
export function chanceTier(total: number): ChanceTier {
  if (total < 0.05) return "veryHard";
  if (total < 0.25) return "hard";
  if (total < 0.55) return "possible";
  return "likely";
}

/** Preço pedido pelo clube e salário pedido pelo jogador (ambos aparecem na resposta). */
export function askingTerms(career: CoachCareer, player: CoachPlayer, buyerId: string, rng: Rng): { price: number; wage: number } {
  const value = valueOf(player, career.year);
  const [low, high] = PURCHASE.askFactor[player.role];
  const seller = player.club ? career.clubs[player.club] : null;
  const buyer = career.clubs[buyerId];
  const stepDown = seller && buyer ? Math.max(0, seller.strength - buyer.strength) : 0;
  const price = seller ? roundPrice(value * rng.real(low, high) * (1 + 0.03 * stepDown)) : 0;
  const [wageLow, wageHigh] = PURCHASE.wageRaise;
  const wage = roundWage(Math.max(player.wage * rng.real(wageLow, wageHigh), wageFor(player.ovr)) * (1 + 0.04 * stepDown));
  return { price, wage };
}

export function roundPrice(value: number): number {
  const step = value >= 10_000_000 ? 500_000 : value >= 1_000_000 ? 50_000 : 10_000;
  return Math.max(0, Math.round(value / step) * step);
}

function roundWage(value: number): number {
  return Math.max(2_000, Math.round(value / 500) * 500);
}

// ------------------------------------------------------------------ venda

/** Procura (spec 6.1): quantos clubes do mundo teriam motivo e dinheiro para comprá-lo. */
export function demandOf(career: CoachCareer, player: CoachPlayer): Demand {
  const value = valueOf(player, career.year);
  const age = ageOf(player, career.year);
  let buyers = 0;
  for (const club of Object.values(career.clubs)) {
    if (club.id === player.club) continue;
    if (club.strength < player.ovr - 6 || club.strength > player.ovr + 3) continue;
    if (club.cash + club.revenue * FINANCE.budgetShare < value * 0.8) continue;
    buyers += 1;
  }
  let score = buyers;
  if (age >= 32) score *= 0.4;
  else if (age <= 24) score *= 1.3;
  if (player.listed) score *= 1.4;
  if (player.injury) score *= 0.5;
  if (score >= 14) return "high";
  if (score >= 5) return "medium";
  return "low";
}

/** Clube concreto que faria a proposta (spec 15: o vendido continua a trajetória). */
export function pickBuyer(career: CoachCareer, player: CoachPlayer, price: number, rng: Rng): string | null {
  const candidates = Object.values(career.clubs)
    .filter((club) => club.id !== player.club && club.id !== career.coach?.club)
    .filter((club) => club.strength >= player.ovr - 6 && club.strength <= player.ovr + 4)
    .filter((club) => club.cash + club.revenue * FINANCE.budgetShare >= price)
    .map((club) => [club.id, 1 + Math.max(0, 6 - Math.abs(club.strength - player.ovr))] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));
  if (candidates.length === 0) return null;
  return rng.weighted(candidates);
}

export function saleOfferChance(demand: Demand): number {
  return SALE.offerChance[demand];
}

// -------------------------------------------------------------- transferir

/**
 * Move um jogador entre clubes uma única vez: dinheiro, folha, elenco e dono
 * mudam juntos. Usado por vendas e compras aceitas, eventos e mercado da IA.
 */
export function transferPlayer(career: CoachCareer, playerId: string, toClub: string, fee: number, kind: "sale" | "purchase" | "ai" | "free", wage?: number): void {
  const player = career.players[playerId];
  if (!player) return;
  const from = player.club;
  if (from === toClub) return;
  const fromClub = from ? career.clubs[from] : null;
  const destination = toClub ? career.clubs[toClub] : null;
  if (fromClub) fromClub.cash += fee;
  if (destination) destination.cash -= fee;
  const coach = career.coach;
  if (coach && from === coach.club && kind === "sale") {
    coach.budget += fee * FINANCE.saleToBudget;
    career.ledger.transfersIn += fee;
    career.ledger.moments.push({ kind: "sale", player: playerId, fee, buyer: toClub });
  }
  if (coach && toClub === coach.club && kind === "purchase") {
    coach.budget = Math.max(0, coach.budget - fee);
    career.ledger.transfersOut += fee;
    career.ledger.moments.push({ kind: "signing", player: playerId, fee });
  }
  player.club = toClub;
  invalidateSquads(career);
  player.joinedYear = career.year;
  player.listed = false;
  player.injury = player.injury ?? null;
  player.consecutiveStarts = 0;
  if (wage !== undefined) player.wage = wage;
  else if (kind === "ai" || kind === "free") player.wage = Math.max(player.wage, wageFor(player.ovr));
  if (destination) {
    const squad = squadOf(career, toClub);
    player.role = roleFor(player, squad, career.year, destination.strength);
    player.satisfaction = 64;
  }
  if (coach && toClub === coach.club && !career.legacy[playerId]) {
    career.legacy[playerId] = {
      player: playerId,
      name: player.name,
      nationality: player.nationality,
      position: player.position,
      apps: 0,
      goals: 0,
      seasons: 0,
      bestOvr: player.ovr,
      revealed: false,
      signed: kind === "purchase",
      firstOvr: player.ovr,
    };
  }
}

/** Divisão de um clube (atalho para os textos de mercado). */
export function divisionOf(career: CoachCareer, club: string): Division {
  return career.clubs[club]?.division ?? 1;
}

/** Papel que o jogador teria num clube (para o "papel esperado" das respostas). */
export function roleAt(career: CoachCareer, player: CoachPlayer, club: string): Role {
  const destination = career.clubs[club];
  if (!destination) return "backup";
  const squad = squadOf(career, club).filter((other) => other.id !== player.id);
  return roleFor(player, [...squad, player], career.year, destination.strength);
}
