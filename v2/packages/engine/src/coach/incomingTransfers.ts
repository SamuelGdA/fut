import type { CoachCareer, SaleOffer } from "./types";
import { coachRng, stageKey } from "./util";
import { pickBuyer, roundPlayerPrice } from "./market";
import { valueOf } from "./players";
import { squadOf } from "./world";
import { viableSquad } from "./lineup";

/** Consultas espontâneas na abertura do mercado, apenas quando a venda é viável. */
export function incomingTransfers(career: CoachCareer): SaleOffer[] {
  const coach = career.coach;
  if (!coach) return [];
  const key = stageKey(career.year, career.half), rng = coachRng(career.setup.seed, "incomingTransfers", key, coach.club);
  if (!rng.chance(0.48)) return [];
  const squad = squadOf(career, coach.club);
  const pool = squad.filter((player) => !player.injury && career.year - player.birthYear < 35 && player.offeredAt !== key);
  const offers: SaleOffer[] = [];
  for (let i = 0, count = rng.int(1, 3); i < count && pool.length; i += 1) {
    const index = rng.int(0, pool.length - 1), player = pool.splice(index, 1)[0]!;
    // O lote inteiro pode ser aceito: não oferece dois jogadores que juntos
    // deixariam o clube sem dezoito atletas ou dois goleiros.
    const outgoing = new Set([...offers.map((offer) => offer.player), player.id]);
    if (!viableSquad(squad.filter((other) => !outgoing.has(other.id)))) continue;
    if (career.promises.some((promise) => promise.status === "active" && promise.kind === "keep" && promise.player === player.id)) continue;
    const price = roundPlayerPrice(valueOf(player, career.year) * rng.real(0.95, 1.3), career.year - player.birthYear);
    const buyer = pickBuyer(career, player, price, rng);
    if (buyer) offers.push({ id: `incoming:${key}:${player.id}`, player: player.id, buyer, price, status: "pending" });
  }
  return offers;
}
