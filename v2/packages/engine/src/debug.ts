/** Ferramentas puras de teste. O app só importa este módulo em desenvolvimento. */
import type { Career } from "./career/types";
import { ovrAt, type Player } from "./player/player";
import { POTENTIAL_RANGE, type TalentBand } from "./player/talent";
import type { Trait } from "./player/traits";
import type { Position } from "./player/positions";
import { clamp } from "./math";
import { cloneCareer } from "./coach/career";
import type { CoachCareer } from "./coach/types";
import { debugEvent } from "./coach/events";
import { refreshStrength, squadOf } from "./coach/world";

export function debugPlayer(career: Career, patch: { talent: TalentBand; age: number; ovr: number; position: Position; trait: Trait; loanOwner: string | null }): Career {
  const age = clamp(Math.round(patch.age), 16, 39);
  const range = POTENTIAL_RANGE[patch.talent];
  let player: Player = { ...career.player, talent: patch.talent, position: patch.position, potential: (range[0] + range[1]) / 2, trait: patch.trait, capacity: 40 };
  for (let step = 0; step < 1400 && ovrAt(player, age) < clamp(patch.ovr, 40, 99); step++) player = { ...player, capacity: player.capacity + 0.05 };
  const contract = career.contract ? { ...career.contract, loan: patch.loanOwner && patch.loanOwner !== career.contract.club ? { owner: patch.loanOwner, ownerShirt: 10, untilAge: age + 2 } : null } : null;
  return { ...career, player, age, contract, decision: career.decision ? { ...career.decision, age } : null };
}

export function debugCoach(career: CoachCareer, patch: { board: number; fans: number; reputation: number; budget: number; squadDelta: number; player?: string; playerOvr?: number; heal: boolean; event: string | null }): CoachCareer {
  const next = cloneCareer(career);
  next.reputation = clamp(patch.reputation, 0, 100);
  if (!next.coach) return next;
  next.coach.board = clamp(patch.board, 0, 100);
  next.coach.fans = clamp(patch.fans, 0, 100);
  next.coach.budget = Math.max(0, patch.budget);
  for (const player of Object.values(next.players)) {
    if (player.club !== next.coach.club) continue;
    player.level = clamp(player.level + patch.squadDelta, 40, 99);
    player.ovr = Math.round(player.level);
    next.players[player.id] = { ...player, potential: Math.max(player.potential, player.level), injury: patch.heal ? null : player.injury };
  }
  const selected = patch.player ? next.players[patch.player] : null;
  if(selected && selected.club===next.coach.club && patch.playerOvr!==undefined) {
    selected.level=clamp(Math.round(patch.playerOvr),30,99);selected.ovr=Math.round(selected.level);
    next.players[selected.id]={...selected,potential:Math.max(selected.potential,selected.level)};
  }
  const club=next.clubs[next.coach.club];
  if(club)refreshStrength(club,squadOf(next,club.id));
  if (patch.event && (next.phase === "stage" || next.phase === "event") && !next.flow) {
    const event = debugEvent(next, patch.event);
    if (event) { next.event = event; next.phase = "event"; next.matchEventArmed = false; }
  }
  return next;
}
