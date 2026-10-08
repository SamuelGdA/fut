import { FOCUS_SLOT, settleTraining } from "../evolution/training";
import { CAPACITY_RANGE } from "../evolution/tuning";
import type { Effect } from "../events/model";
import { clamp } from "../math";
import { TRAINING_CAP } from "../player/attributes";
import type { Player } from "../player/player";
import { positionWeights } from "../player/positions";
import type { SeasonModifiers } from "../season/playerSeason";
import type { Slot } from "../types";
import { clubIndex } from "../world/model";
import { PRESSURE_MAX } from "./mission";
import { moveTo, newBond } from "./move";
import type { Career, CareerNotice, EventTarget } from "./types";

/**
 * O intérprete dos efeitos (GDD 18.2). O catálogo diz *o que* acontece; aqui
 * é *como*. Cada efeito tem um momento:
 *
 * - **agora**: muda a carreira antes do período (capacidade, potencial,
 *   torcida, camisa, posição, passaporte, bloqueio, mercado, transferência);
 * - **período**: vira modificador das temporadas simuladas (papel, jogos,
 *   lesão, produção, crescimento, força nos torneios, final, seleção, prêmios);
 * - **depois**: espera o fim do período (capacidade adiada).
 */

/** Limites da força de um clube mexida por evento (crise financeira). */
const CLUB_STRENGTH_RANGE = { min: 35, max: 95 } as const;

/** Soma um efeito aos modificadores do período. Efeitos de outros momentos passam direto. */
export function mergeModifiers(base: SeasonModifiers, effect: Effect): SeasonModifiers {
  switch (effect.kind) {
    case "capacity":
      return effect.when === "period" ? { ...base, capacityShift: (base.capacityShift ?? 0) + effect.amount } : base;
    case "role":
      if (effect.change === "fixStarter") return { ...base, minimumRole: "starter" };
      return { ...base, roleShift: effect.change === "up" ? 1 : -1 };
    case "games":
      return { ...base, gamesScale: (base.gamesScale ?? 1) * effect.scale };
    case "injury":
      return { ...base, injuryScale: (base.injuryScale ?? 1) * effect.scale };
    case "production":
      return { ...base, productionScale: (base.productionScale ?? 1) * effect.scale };
    case "growth":
      return { ...base, growthScale: (base.growthScale ?? 1) * effect.scale };
    case "boost":
      return { ...base, boosts: { ...base.boosts, [effect.target]: (base.boosts?.[effect.target] ?? 0) + effect.amount } };
    case "final":
      return { ...base, final: effect.result };
    case "national":
      return { ...base, national: effect.mode };
    case "award":
      return { ...base, awardBonus: (base.awardBonus ?? 0) + effect.amount };
    default:
      return base;
  }
}

/** Os atributos que um bônus permanente atinge: o do último foco, ou o que mais pesa na posição. */
function bonusSlots(player: Player, focus: Career["focus"]): readonly Slot[] {
  if (focus) return [FOCUS_SLOT[focus]];
  const weights = positionWeights(player.position);
  let best: Slot = 0;
  for (const slot of [1, 2, 3, 4, 5] as const) if (weights[slot] > weights[best]) best = slot;
  return [best];
}

/** Bônus permanente de treino, dentro do limite de +8 e do potencial. */
export function addTraining(player: Player, focus: Career["focus"], amount: number): Player {
  const training = [...player.training] as [number, number, number, number, number, number];
  for (const slot of bonusSlots(player, focus)) training[slot] = clamp(training[slot] + amount, 0, TRAINING_CAP);
  return settleTraining(player, training);
}

function withCapacity(player: Player, amount: number): Player {
  return { ...player, capacity: clamp(player.capacity + amount, CAPACITY_RANGE.min, CAPACITY_RANGE.max) };
}

export interface Applied {
  readonly career: Career;
  /** Houve transferência e ela fez dele Traidor. */
  readonly traitor: boolean;
}

/**
 * Aplica os efeitos de um resultado de evento, na ordem da lista. A ordem é
 * parte do evento: o que vem antes da transferência vale no clube que ele
 * deixa (a torcida que se magoa com o ultimato, o clube que fecha as portas);
 * o que vem depois vale no clube novo (a festa na volta do ídolo).
 */
export function applyEffects(
  career: Career,
  effects: readonly Effect[],
  target: EventTarget | null,
  notices: CareerNotice[],
): Applied {
  let next = career;
  let modifiers = career.pending.modifiers;
  let laterCapacity = career.pending.laterCapacity;
  let suspension = career.pending.suspension;
  let traitor = false;

  for (const effect of effects) {
    modifiers = mergeModifiers(modifiers, effect);
    const club = next.contract?.club ?? null;
    switch (effect.kind) {
      case "capacity":
        if (effect.when === "now") next = { ...next, player: withCapacity(next.player, effect.amount) };
        if (effect.when === "later") laterCapacity += effect.amount;
        break;
      case "potential":
        next = { ...next, player: { ...next.player, potential: Math.max(effect.floor, next.player.potential + effect.amount) } };
        break;
      case "attributes":
        next = { ...next, player: addTraining(next.player, next.focus, effect.amount) };
        break;
      case "fans":
        if (club) {
          const bond = next.bonds[club] ?? newBond();
          const fans = clamp(bond.fans + effect.amount, 0, 100);
          next = { ...next, bonds: { ...next.bonds, [club]: { ...bond, fans, peakFans: Math.max(bond.peakFans, fans) } } };
        }
        break;
      case "pressure":
        if (next.contract) {
          const pressure = clamp(next.contract.pressure + effect.amount, 0.5, PRESSURE_MAX);
          next = { ...next, contract: { ...next.contract, pressure } };
        }
        break;
      case "suspension":
        suspension += effect.seasons;
        break;
      case "transfer":
        if (target?.club) {
          const move = moveTo(next, target.club, notices, { loan: false });
          next = move.career;
          traitor = move.traitor;
        }
        break;
      case "position":
        if (target?.position) next = { ...next, player: { ...next.player, position: target.position } };
        break;
      case "nationality":
        if (target?.country) next = { ...next, nationality: target.country };
        break;
      case "shirt":
        if (target?.number !== undefined && next.contract) next = { ...next, contract: { ...next.contract, shirt: target.number } };
        break;
      case "block":
        if (club && !next.blocked.includes(club)) next = { ...next, blocked: [...next.blocked, club] };
        break;
      case "market":
        next = { ...next, marketBonus: next.marketBonus + effect.amount };
        break;
      case "clubStrength":
        if (club) {
          const strength = [...next.world.strength];
          const index = clubIndex(club);
          strength[index] = clamp((strength[index] ?? 0) + effect.amount, CLUB_STRENGTH_RANGE.min, CLUB_STRENGTH_RANGE.max);
          next = { ...next, world: { ...next.world, strength } };
        }
        break;
      default:
        // Efeitos de período já entraram nos modificadores; "story" é só biografia.
        break;
    }
  }

  return { career: { ...next, pending: { modifiers, laterCapacity, suspension } }, traitor };
}

/** Capacidade adiada, aplicada no fim do período. */
export function applyLaterCapacity(player: Player, amount: number): Player {
  return amount === 0 ? player : withCapacity(player, amount);
}
