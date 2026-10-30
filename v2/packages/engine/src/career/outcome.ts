import { type Rng, type RngSystem, stream } from "../rng";
import type { Career } from "./types";

/**
 * O sorteio de dar certo ou errado de uma decisão. Na linha alternativa do
 * hipotético (D110), da decisão de troca em diante, ele leva também o sal da
 * linha: a mesma escolha tem a chance sorteada de novo, em vez de repetir o
 * resultado da linha original.
 */
export function outcomeStream(career: Career, decisionId: number, system: RngSystem, ...parts: ReadonlyArray<string | number>): Rng {
  const salts = (career.setup.rerolls ?? []).filter((reroll) => decisionId >= reroll.from).map((reroll) => reroll.salt);
  return salts.length ? stream(career.setup.seed, system, ...parts, "reroll", ...salts) : stream(career.setup.seed, system, ...parts);
}
