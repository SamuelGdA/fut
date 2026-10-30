import { ovrAt, type Player } from "../player/player";
import type { Rng } from "../rng";

export const LATE_BREAKTHROUGH = { chance: 0.0015, minAge: 24, maxAge: 30, minGames: 12, minOvr: 55, maxOvr: 74, target: [78,86] as const } as const;
/**
 * D107: explosão jovem. Às vezes um garoto de 50 ou 60 vira, do nada, um
 * jogador de 70 e tantos, e o treinador dá a vaga a ele na mesma temporada.
 * Acontece no começo do ano (antes do papel no elenco), uma vez na carreira,
 * com mais chance quanto mais novo.
 */
export const YOUNG_BREAKOUT = { chanceYoung: 0.018, chanceOlder: 0.01, youngUpTo: 19, minAge: 17, maxAge: 22, minOvr: 50, maxOvr: 67, target: [70, 76] as const, minJump: 8 } as const;
export function youngBreakout(player: Player, age: number, rng: Rng): Player {
  const rule = YOUNG_BREAKOUT, ovr = ovrAt(player, age);
  if (player.breakoutAge !== undefined || age < rule.minAge || age > rule.maxAge || ovr < rule.minOvr || ovr > rule.maxOvr) return player;
  if (!rng.chance(age <= rule.youngUpTo ? rule.chanceYoung : rule.chanceOlder)) return player;
  const target = Math.max(ovr + rule.minJump, rng.int(rule.target[0], rule.target[1]));
  let next: Player = { ...player, potential: Math.max(player.potential, target + 4), breakoutAge: age };
  for (let step = 0; step < 800 && ovrAt(next, age) < target; step++) next = { ...next, capacity: next.capacity + 0.05 };
  return next;
}

/** Descoberta tardia, uma vez na carreira. Não altera o sorteio da evolução normal. */
export function lateBreakthrough(player: Player, age: number, games: number, rng: Rng): Player {
  const rule=LATE_BREAKTHROUGH,ovr=ovrAt(player,age);
  if(player.breakthroughAge!==undefined || age<rule.minAge || age>rule.maxAge || games<rule.minGames || ovr<rule.minOvr || ovr>rule.maxOvr || !rng.chance(rule.chance))return player;
  const target=rng.int(rule.target[0],rule.target[1]);
  let next:Player={...player,potential:Math.max(player.potential,target+3),breakthroughAge:age};
  for(let step=0;step<800 && ovrAt(next,age)<target;step++)next={...next,capacity:next.capacity+0.05};
  return next;
}
