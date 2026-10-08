import eliteJson from "../data/elite.json";
import type { CountryCode } from "./types";

/**
 * A elite (GDD 13.1): jogadores reais que disputam os prêmios com o jogador e
 * de onde sai o rival (GDD 20). Nomes, ano de nascimento, nacionalidade e
 * posição são fatos; pico, idade do pico e aposentadoria são **projeções
 * fictícias** do jogo (D8).
 */

/** Uma das 12 posições do motor (gk, cb, lb, rb, cdm, cm, cam, lm, rm, lw, rw, st). */
export type ElitePosition = "gk" | "cb" | "lb" | "rb" | "cdm" | "cm" | "cam" | "lm" | "rm" | "lw" | "rw" | "st";

const ELITE_POSITIONS: readonly ElitePosition[] = ["gk", "cb", "lb", "rb", "cdm", "cm", "cam", "lm", "rm", "lw", "rw", "st"];

export interface EliteProfile {
  readonly id: string;
  readonly name: string;
  readonly born: number;
  readonly nationality: CountryCode;
  readonly position: ElitePosition;
  /** OVR projetado no auge. */
  readonly peakOvr: number;
  readonly peakAge: number;
  /** Idade da última temporada jogada. */
  readonly retireAge: number;
  /** Joga num clube da UEFA (conta para a Chuteira de Ouro). */
  readonly europe: boolean;
}

function position(value: string, id: string): ElitePosition {
  const match = ELITE_POSITIONS.find((candidate) => candidate === value);
  if (!match) throw new Error(`@craque/world: posição inválida na elite (${id}): ${value}`);
  return match;
}

export const ELITE: readonly EliteProfile[] = eliteJson.map((row) => ({
  ...row,
  position: position(row.position, row.id),
}));

const eliteById = new Map(ELITE.map((profile) => [profile.id, profile]));

export function getElite(id: string | null | undefined): EliteProfile | null {
  if (!id) return null;
  return eliteById.get(id) ?? null;
}
