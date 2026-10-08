import { type CountryCode, PLAYABLE_COUNTRIES } from "@craque/world";
import type { CareerSetup, Identity } from "../career/types";
import { POSITIONS, type Position } from "../player/positions";
import { drawTalent, type TalentBand } from "../player/talent";
import { type Rng, stream } from "../rng";
import { challengeYear, daysSinceEpoch, isChallengeDayId } from "./day";
import { EDICTS, type Edict } from "./edicts";
import { contradicts, type Mission, missionFitsPosition, MISSIONS, missionTarget } from "./missions";

/**
 * A mão do dia (GDD 27.2): nacionalidade, posição, três missões e um édito,
 * iguais para todo mundo naquele dia. A busca é determinística: o catálogo é
 * embaralhado pela semente do dia e percorrido em ordem, e a primeira mão
 * válida vence. Válida quer dizer:
 *
 * 1. três missões de três eixos diferentes;
 * 2. nenhum par contraditório;
 * 3. a posição do dia consegue perseguir as três, e cada uma tem alvo para a
 *    faixa de talento do jogador do dia;
 * 4. o édito não torna nenhuma impossível.
 *
 * O talento vem da semente do dia (o mesmo jogador para todo mundo), e os
 * alvos são os daquela faixa: um dia de operário e um dia de fenômeno pedem
 * coisas diferentes, e os dois são justos.
 *
 * Nação, posição e édito andam em rodízio: cada um aparece uma vez por ciclo
 * (cada nação com liga jogável antes de alguma repetir, cada posição a cada 12
 * dias, cada édito a cada 10), e nunca o mesmo de um dia para o outro, nem na
 * virada do ciclo. Continua tudo saindo só do identificador do dia.
 */

/** A idade em que a missão escondida aparece (GDD 27.2). */
export const HIDDEN_REVEAL_AGE = 24;

export interface ChallengeHand {
  readonly id: string;
  readonly seed: string;
  readonly startYear: number;
  readonly nationality: CountryCode;
  readonly position: Position;
  /** A faixa de talento do jogador do dia (não aparece na tela; decide os alvos). */
  readonly talent: TalentBand;
  /** Ids das três missões, na ordem da busca. */
  readonly missions: readonly [string, string, string];
  /** O alvo de cada missão, na mesma ordem. */
  readonly targets: readonly [number, number, number];
  readonly edict: string;
  /** Qual das três fica escondida até os 24 anos. */
  readonly hidden: 0 | 1 | 2;
}

function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng.next() * (index + 1));
    const swap = copy[index] as T;
    copy[index] = copy[other] as T;
    copy[other] = swap;
  }
  return copy;
}

function validTriple(missions: readonly Mission[], edict: Edict, position: Position, nationality: CountryCode, talent: TalentBand): boolean {
  const axes = new Set(missions.map((item) => item.axis));
  if (axes.size !== missions.length) return false;
  for (const item of missions) {
    const target = missionTarget(item.id, talent);
    if (target <= 0 || !missionFitsPosition(item, position)) return false;
    if (edict.blocks?.(item, target, nationality)) return false;
  }
  for (let a = 0; a < missions.length; a += 1) {
    for (let b = a + 1; b < missions.length; b += 1) {
      if (contradicts(missions[a]?.id ?? "", missions[b]?.id ?? "")) return false;
    }
  }
  return true;
}

/** A ordem do ciclo `cycle` de um rodízio, crua (sem a troca da virada). */
function cycleOrder<T>(items: readonly T[], label: string, cycle: number): T[] {
  return shuffled(items, stream("desafio-rodizio", "challenge", label, cycle));
}

/**
 * O item do rodízio no dia `day` (dias desde a época): cada item uma vez por
 * ciclo de `items.length` dias, na ordem embaralhada do ciclo. Se o primeiro
 * do ciclo repetiria o último do anterior, os dois primeiros trocam de lugar;
 * a troca só mexe nas duas primeiras posições, então o último de um ciclo é
 * sempre o da ordem crua, e a regra não precisa olhar mais para trás.
 */
export function rotationPick<T>(items: readonly T[], label: string, day: number): T {
  const size = items.length;
  if (size === 0) throw new Error(`desafio: rodízio vazio (${label})`);
  const cycle = Math.floor(day / size);
  const index = day - cycle * size;
  const order = cycleOrder(items, label, cycle);
  if (size > 2 && order[0] === cycleOrder(items, label, cycle - 1)[size - 1]) {
    const first = order[0] as T;
    order[0] = order[1] as T;
    order[1] = first;
  }
  return order[index] as T;
}

/** A semente do dia: a mesma para todo mundo, diferente a cada dia. */
export function challengeSeed(id: string): string {
  return `desafio:${id}`;
}

export function dailyHand(id: string): ChallengeHand {
  if (!isChallengeDayId(id)) throw new Error(`desafio: dia inválido ${id}`);
  const seed = challengeSeed(id);
  const day = daysSinceEpoch(id);
  const nationality = rotationPick(PLAYABLE_COUNTRIES, "nação", day);
  const position = rotationPick(POSITIONS, "posição", day);
  // O mesmo sorteio que cria o jogador (GDD 9.6), no Difícil do desafio.
  const talent = drawTalent(stream(seed, "birth", "talent"), "hard");
  const missions = shuffled(MISSIONS, stream(seed, "challenge", "missões"));
  // O édito do rodízio primeiro; os outros só se ele não fechar mão nenhuma.
  const preferred = rotationPick(EDICTS, "édito", day);
  const edicts = [preferred, ...shuffled(EDICTS, stream(seed, "challenge", "éditos")).filter((edict) => edict !== preferred)];

  for (const edict of edicts) {
    for (let a = 0; a < missions.length; a += 1) {
      for (let b = a + 1; b < missions.length; b += 1) {
        for (let c = b + 1; c < missions.length; c += 1) {
          const triple = [missions[a], missions[b], missions[c]] as Mission[];
          if (!validTriple(triple, edict, position, nationality, talent)) continue;
          return {
            id,
            seed,
            startYear: challengeYear(id),
            nationality,
            position,
            talent,
            missions: [triple[0]?.id ?? "", triple[1]?.id ?? "", triple[2]?.id ?? ""],
            targets: [missionTarget(triple[0]?.id ?? "", talent), missionTarget(triple[1]?.id ?? "", talent), missionTarget(triple[2]?.id ?? "", talent)],
            edict: edict.id,
            hidden: (((day % 3) + 3) % 3) as 0 | 1 | 2,
          };
        }
      }
    }
  }
  // Com 36 missões em nove eixos, sempre há mão; chegar aqui é erro de catálogo.
  throw new Error(`desafio: nenhuma mão válida para ${id}`);
}

/**
 * O setup do Desafio (GDD 27.1): dificuldade Difícil, ritmo Normal, semente,
 * ano, nacionalidade e posição do dia. Livres: sobrenome, pé e número dos
 * sonhos (e a aparência, que nem entra no setup).
 */
export function challengeSetup(hand: ChallengeHand, free: Pick<Identity, "surname" | "foot" | "dreamNumber">): CareerSetup {
  return {
    seed: hand.seed,
    startYear: hand.startYear,
    pace: "normal",
    difficulty: "hard",
    challengeId: hand.id,
    identity: { ...free, nationality: hand.nationality, position: hand.position },
  };
}
