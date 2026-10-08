import type { AvatarConfig } from "@craque/art";
import type { CareerSave, EndReason, Position } from "@craque/engine";
import { ENGINE_VERSION } from "@craque/engine/version";
import { isRecord, oneOf, text } from "../../lib/validate";
import { STORAGE_KEYS, safeStorage } from "../../services/storage";

/**
 * A parte leve do save (GDD 34): o formato, o retrato e a leitura sem refazer
 * a carreira. O Início e a abertura do jogo usam só isto, então o motor não
 * entra no pacote da primeira tela.
 */

export const SAVE_SCREENS = ["career", "summary"] as const;
export type SaveScreen = (typeof SAVE_SCREENS)[number];

const POSITION_CODES = ["gk", "cb", "lb", "rb", "cdm", "cm", "cam", "lm", "rm", "lw", "rw", "st"] as const;
const END_REASONS: readonly EndReason[] = ["age", "noRoom", "noOffers", "release", "voluntary"];

/** O que a tela mostra de uma carreira sem precisar do motor. */
export interface SaveSnapshot {
  readonly surname: string;
  readonly position: Position;
  readonly nationality: string;
  readonly age: number;
  readonly club: string | null;
  readonly ovr: number;
  readonly seasons: number;
  readonly end: EndReason | null;
}

/**
 * Linha alternativa de um "E se...?" (GDD 28.3): de que carreira do Hall ela
 * saiu, em que decisão, e o que a original escolheu ali.
 */
export interface AlternateLine {
  readonly from: string;
  readonly decision: number;
  readonly original: string;
}

export interface SaveRecord extends CareerSave {
  readonly avatar: AvatarConfig | null;
  readonly screen: SaveScreen;
  readonly snapshot: SaveSnapshot;
  readonly alternate?: AlternateLine;
}

export function sanitizeAlternate(input: unknown): AlternateLine | undefined {
  if (!isRecord(input)) return undefined;
  const { from, decision, original } = input;
  if (typeof from !== "string" || from.length === 0 || typeof original !== "string" || typeof decision !== "number" || !Number.isInteger(decision)) {
    return undefined;
  }
  return { from, decision, original };
}

export function sanitizeSnapshot(input: unknown): SaveSnapshot | null {
  if (!isRecord(input)) return null;
  const surname = text(input["surname"], 16, "");
  if (surname.length === 0) return null;
  const number = (value: unknown, min: number, max: number) =>
    typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : min;
  const end = input["end"];
  return {
    surname,
    position: oneOf(input["position"], POSITION_CODES, "st"),
    nationality: text(input["nationality"], 3, ""),
    age: number(input["age"], 16, 40),
    club: typeof input["club"] === "string" ? input["club"].slice(0, 80) : null,
    ovr: number(input["ovr"], 1, 99),
    seasons: number(input["seasons"], 0, 30),
    end: typeof end === "string" && (END_REASONS as readonly string[]).includes(end) ? (end as EndReason) : null,
  };
}

export type SavePeek =
  | { readonly kind: "none" }
  | {
      readonly kind: "present";
      readonly screen: SaveScreen;
      readonly snapshot: SaveSnapshot;
      readonly engine: string;
      /** Feito por esta versão do motor: dá para refazer a carreira. */
      readonly current: boolean;
      /** Carreira de Desafio do dia: o identificador do dia. */
      readonly challengeId: string | null;
      readonly alternate: boolean;
    }
  | { readonly kind: "invalid" };

export function readRawSave(): unknown {
  const raw = safeStorage.getItem(STORAGE_KEYS.save);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** Olha o save sem refazer a carreira: existe, de que versão, em que tela, com que retrato. */
export function peekSave(): SavePeek {
  const value = readRawSave();
  if (value === undefined) return { kind: "none" };
  if (!isRecord(value)) return { kind: "invalid" };
  const snapshot = sanitizeSnapshot(value["snapshot"]);
  const engine = typeof value["engine"] === "string" ? value["engine"] : "";
  if (!snapshot || engine.length === 0) return { kind: "invalid" };
  const setup = value["setup"];
  const challengeId = isRecord(setup) && typeof setup["challengeId"] === "string" ? setup["challengeId"] : null;
  return {
    kind: "present",
    screen: oneOf(value["screen"], SAVE_SCREENS, "career"),
    snapshot,
    engine,
    current: engine === ENGINE_VERSION,
    challengeId,
    alternate: sanitizeAlternate(value["alternate"]) !== undefined,
  };
}

/** A tela em que o jogo deve abrir, ou `null` para o Início. Save de outra versão abre no Início. */
export function savedScreen(): SaveScreen | null {
  const peek = peekSave();
  return peek.kind === "present" && peek.current ? peek.screen : null;
}

export function writeSave(record: SaveRecord): void {
  safeStorage.setItem(STORAGE_KEYS.save, JSON.stringify(record));
}

export function clearSave(): void {
  safeStorage.removeItem(STORAGE_KEYS.save);
}
