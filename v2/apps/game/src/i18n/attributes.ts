import { KEEPER_ATTRIBUTES, OUTFIELD_ATTRIBUTES, type Position } from "@craque/engine";
import type { Translator } from "./useT";

/**
 * Sigla ou nome de um atributo da carta, pela posição e pelo índice (0 a 5).
 * Goleiro tem os seus seis; os outros, os seis de linha (GDD 9.2).
 */
export function attributeText(t: Translator["t"], position: Position, slot: number, part: "abbr" | "name"): string {
  if (position === "gk") {
    const key = KEEPER_ATTRIBUTES[slot];
    return key ? t(`attributes.keeper.${key}.${part}`) : "";
  }
  const key = OUTFIELD_ATTRIBUTES[slot];
  return key ? t(`attributes.outfield.${key}.${part}`) : "";
}

/** Os seis índices, para mapear a carta. */
export const ATTRIBUTE_SLOTS = [0, 1, 2, 3, 4, 5] as const;
