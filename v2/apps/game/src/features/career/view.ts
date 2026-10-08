import {
  attributesAt,
  baseMarketValue,
  type Career,
  fanBand,
  type FanBand,
  LAST_AGE,
  ovrAt,
  type SeasonRecord,
  type Six,
} from "@craque/engine";

/**
 * Leituras da carreira para as telas. O motor guarda capacidade e treino; a
 * tela mostra OVR, atributos, valor e torcida, sempre derivados.
 */

/** Idade usada para ler o jogador: depois dos 39 a carreira acabou, e a carta é a do fim. */
function readAge(career: Career): number {
  return Math.min(career.age, LAST_AGE);
}

export function currentOvr(career: Career): number {
  return Math.round(ovrAt(career.player, readAge(career)));
}

export function currentAttributes(career: Career): Six {
  return attributesAt(career.player, readAge(career));
}

export function lastRecord(career: Career): SeasonRecord | null {
  return career.history[career.history.length - 1] ?? null;
}

export function currentValue(career: Career): number {
  return baseMarketValue(currentOvr(career), readAge(career));
}

export interface FansReading {
  readonly value: number;
  readonly band: FanBand;
}

export function currentFans(career: Career): FansReading | null {
  const club = career.contract?.club;
  const bond = club ? career.bonds[club] : undefined;
  if (!bond) return null;
  const value = Math.round(bond.fans);
  return { value, band: fanBand(value, bond.peakFans) };
}

/** Diferença de atributo arredondada, como a carta mostra. */
export function attributeDeltas(before: Six, after: Six): number[] {
  return after.map((value, slot) => Math.round(value) - Math.round(before[slot] ?? value));
}
