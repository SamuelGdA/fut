import { ovrAt, type Player } from "../player/player";
import type { Rng } from "../rng";

export const LATE_BREAKTHROUGH = { chance: 0.0015, minAge: 24, maxAge: 30, minGames: 12, minOvr: 55, maxOvr: 74, target: [78,86] as const } as const;
/** Descoberta tardia, uma vez na carreira. Não altera o sorteio da evolução normal. */
export function lateBreakthrough(player: Player, age: number, games: number, rng: Rng): Player {
  const rule=LATE_BREAKTHROUGH,ovr=ovrAt(player,age);
  if(player.breakthroughAge!==undefined || age<rule.minAge || age>rule.maxAge || games<rule.minGames || ovr<rule.minOvr || ovr>rule.maxOvr || !rng.chance(rule.chance))return player;
  const target=rng.int(rule.target[0],rule.target[1]);
  let next:Player={...player,potential:Math.max(player.potential,target+3),breakthroughAge:age};
  for(let step=0;step<800 && ovrAt(next,age)<target;step++)next={...next,capacity:next.capacity+0.05};
  return next;
}
