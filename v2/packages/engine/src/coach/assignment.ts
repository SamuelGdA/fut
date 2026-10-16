import type { Position } from "../player/positions";
import { positionPenalty } from "./players";
import type { CoachPlayer, FormationId } from "./types";
import { FORMATION_SLOTS } from "./formations";

/** Atribuição de custo mínimo: maximiza o OVR dos onze, respeitando todas as posições. */
export function optimalLineup(players: readonly CoachPlayer[], formation: FormationId, rate: (player: CoachPlayer, slot: Position)=>number = (player,slot)=>player.ovr+positionPenalty(player,slot), improvisation = false): string[] {
  const pool = [...players].sort((a, b) => a.id.localeCompare(b.id));
  const slots = FORMATION_SLOTS[formation];
  const n = slots.length, m = pool.length + n;
  // Um ponto de OVR vale mais que todos os desempates dos onze juntos.
  // Entre elencos de mesmo OVR: característica, juventude, satisfação e fase.
  const tieScore = (player: CoachPlayer) => Number(player.traits.length > 0) * 10_000_000
    + Math.max(0, Math.min(100, player.birthYear - 1980)) * 5_000
    + player.satisfaction * 2 + player.form;
  const u = Array<number>(n + 1).fill(0), v = Array<number>(m + 1).fill(0);
  const p = Array<number>(m + 1).fill(0), way = Array<number>(m + 1).fill(0);
  const hasKeeper=pool.some(player=>player.position==="gk");
  const costs=slots.map(slot=>Array.from({length:m},(_,index)=>{
    const player=pool[index];if(!player)return 0;
    const eligible=slot==="gk" && hasKeeper ? player.position==="gk" : slot!=="gk" && player.position==="gk" ? false : improvisation || player.position===slot || player.alternates.includes(slot);
    return eligible ? -100_000_000_000_000-Math.round(rate(player,slot)*100)*200_000_000-tieScore(player) : 1_000_000_000_000_000;
  }));
  const cost=(row:number,column:number)=>costs[row-1]![column-1]!;
  for (let i = 1; i <= n; i += 1) {
    p[0] = i;
    let j0 = 0;
    const min = Array<number>(m + 1).fill(Infinity), used = Array<boolean>(m + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0]!;
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= m; j += 1) {
        if (used[j]) continue;
        const current = cost(i0, j) - u[i0]! - v[j]!;
        if (current < min[j]!) { min[j] = current; way[j] = j0; }
        if (min[j]! < delta) { delta = min[j]!; j1 = j; }
      }
      for (let j = 0; j <= m; j += 1) {
        if (used[j]) { u[p[j]!]! += delta; v[j]! -= delta; }
        else min[j]! -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]!; p[j0] = p[j1]!; j0 = j1; } while (j0 !== 0);
  }
  const lineup = slots.map(() => "");
  for (let j = 1; j <= m; j += 1) if (p[j] && pool[j - 1] && cost(p[j]!, j) < 0) lineup[p[j]! - 1] = pool[j - 1]!.id;
  return lineup;
}
