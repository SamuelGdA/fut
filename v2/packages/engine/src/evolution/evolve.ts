import { clamp } from "../math";
import { attributesAt, ovrAt, type Player } from "../player/player";
import type { Rng } from "../rng";
import type { Six } from "../types";
import { drawSeasonForm, type SeasonForm } from "./form";
import {
  ageDecline,
  capSeasonGain,
  expectedGrowth,
  type GrowthContext,
  type GrowthFactors,
  growthFactors,
} from "./growth";
import { guaranteeFocus, isFocusValid, settleTraining, trainFocus, type TrainingFocus } from "./training";
import { CAPACITY_RANGE } from "./tuning";

/**
 * A evolução de uma temporada (GDD 10), rodada depois dos jogos com o que de
 * fato aconteceu: quantos jogos, em que clube, com que torcida e que títulos.
 */

export interface SeasonEvolutionInput extends GrowthContext {
  /** Soma das importâncias dos títulos da temporada (GDD 7.5). */
  readonly titleImportance: number;
  /** Foco de treino escolhido para esta temporada (a primeira do período), se houver. */
  readonly focus: TrainingFocus | null;
  /** Multiplica o crescimento esperado (evento: diploma, apadrinhar a joia da base). */
  readonly growthScale?: number;
  /** Devolve capacidade emprestada por evento antes do resultado final. */
  readonly restoreCapacity?: number;
  /** Garantia do atributo treinado, somente no fim do período. */
  readonly guarantee?: { readonly focus: TrainingFocus; readonly start: Six };
}

export interface SeasonEvolutionReport {
  readonly form: SeasonForm;
  readonly factors: GrowthFactors;
  /** Ganho esperado antes da forma. */
  readonly expected: number;
  /** Bônus de título, em OVR, após a evolução natural. */
  readonly morale: number;
  /** L ganho de fato, já pelo teto suave. */
  readonly gain: number;
  /** L perdido pela idade. */
  readonly loss: number;
  readonly capacityBefore: number;
  readonly capacityAfter: number;
  readonly attributesBefore: Six;
  readonly attributesAfter: Six;
}

export interface SeasonEvolution {
  readonly player: Player;
  readonly report: SeasonEvolutionReport;
}

/**
 * Um passo de evolução. Consome sempre os mesmos dois sorteios (a forma), para
 * que mudar o contexto nunca desalinhe o fluxo das temporadas seguintes.
 *
 * Ordem: forma, crescimento (pelo teto suave), declínio, treino, bônus de título.
 */
export function evolveSeason(player: Player, input: SeasonEvolutionInput, rng: Rng): SeasonEvolution {
  const form = drawSeasonForm(rng, input.age, input.games);
  const factors = growthFactors(player, input);
  const expected = expectedGrowth(factors) * (input.growthScale ?? 1);
  const morale = input.titleImportance > 0 ? 1 : 0;

  const gain = capSeasonGain(expected * form.multiplier);
  const loss = ageDecline(player, input.age, input.difficulty);
  const grown: Player = {
    ...player,
    capacity: clamp(player.capacity + gain - loss, CAPACITY_RANGE.min, CAPACITY_RANGE.max),
  };

  const focus = input.focus !== null && isFocusValid(player.position, input.focus) ? input.focus : null;
  let next = focus ? settleTraining(grown, trainFocus(grown.training, focus)) : grown;
  if (input.restoreCapacity) next = { ...next, capacity: next.capacity - input.restoreCapacity };
  if (input.guarantee) next = guaranteeFocus(next, input.guarantee.focus, input.guarantee.start, input.age);
  if (morale > 0) {
    const target = Math.min(99, ovrAt(next, input.age) + 1);
    // OVR sempre deriva dos atributos: achar o primeiro degrau, mesmo perto do 99.
    for (let step = 0; step < 200 && ovrAt(next, input.age) < target && next.capacity < CAPACITY_RANGE.max; step += 1) {
      next = { ...next, capacity: Math.min(CAPACITY_RANGE.max, next.capacity + 0.05) };
    }
  }

  return {
    player: next,
    report: {
      form,
      factors,
      expected,
      morale,
      gain,
      loss,
      capacityBefore: player.capacity,
      capacityAfter: next.capacity,
      attributesBefore: attributesAt(player, input.age),
      attributesAfter: attributesAt(next, input.age),
    },
  };
}
