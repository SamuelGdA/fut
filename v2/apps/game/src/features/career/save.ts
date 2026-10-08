import type { AvatarConfig } from "@craque/art";
import { type Career, ENGINE_VERSION, ovrAt, parseSave, saveOf } from "@craque/engine";
import { isRecord, oneOf } from "../../lib/validate";
import { sanitizeAvatar } from "../appearance/avatarSchema";
import {
  type AlternateLine,
  readRawSave,
  SAVE_SCREENS,
  sanitizeAlternate,
  type SaveRecord,
  type SaveScreen,
  type SaveSnapshot,
  sanitizeSnapshot,
} from "./saveRecord";

/**
 * A parte do save que precisa do motor (GDD 34.2): validar as escolhas e
 * montar o registro de uma carreira. Só a carreira e o resumo carregam isto.
 */

export type SaveRead =
  | { readonly kind: "none" }
  | { readonly kind: "ok"; readonly record: SaveRecord }
  /**
   * Save de outra versão do motor: só o retrato serve (modo leitura). O
   * registro vem junto quando a forma confere, para entrar no Hall.
   */
  | { readonly kind: "stale"; readonly snapshot: SaveSnapshot; readonly engine: string; readonly record: SaveRecord | null }
  | { readonly kind: "invalid" };

export function snapshotOf(career: Career): SaveSnapshot {
  return {
    surname: career.setup.identity.surname,
    position: career.player.position,
    nationality: career.nationality,
    age: career.age,
    club: career.contract?.club ?? null,
    ovr: Math.round(ovrAt(career.player, Math.min(career.age, 39))),
    seasons: career.history.length,
    end: career.end?.reason ?? null,
  };
}

export function recordOf(career: Career, avatar: AvatarConfig | null, screen: SaveScreen, alternate?: AlternateLine): SaveRecord {
  const record: SaveRecord = { ...saveOf(career), avatar, screen, snapshot: snapshotOf(career) };
  return alternate ? { ...record, alternate } : record;
}

function recordFrom(value: Record<string, unknown>, snapshot: SaveSnapshot): SaveRecord {
  const core = parseSave(value);
  const alternate = sanitizeAlternate(value["alternate"]);
  const record: SaveRecord = {
    ...core,
    avatar: sanitizeAvatar(value["avatar"]),
    screen: oneOf(value["screen"], SAVE_SCREENS, "career"),
    snapshot,
  };
  return alternate ? { ...record, alternate } : record;
}

/** O registro de um save de outra versão, se a forma confere (o replay não roda: é outro motor). */
function staleRecord(value: Record<string, unknown>, snapshot: SaveSnapshot): SaveRecord | null {
  try {
    return recordFrom(value, snapshot);
  } catch {
    return null;
  }
}

/** Lê o save sem confiar em nada: JSON quebrado, campo estranho ou versão diferente nunca derrubam o jogo. */
export function readSave(): SaveRead {
  const value = readRawSave();
  if (value === undefined) return { kind: "none" };
  if (!isRecord(value)) return { kind: "invalid" };
  const snapshot = sanitizeSnapshot(value["snapshot"]);
  if (typeof value["engine"] === "string" && value["engine"] !== ENGINE_VERSION) {
    if (!snapshot) return { kind: "invalid" };
    return { kind: "stale", snapshot, engine: value["engine"], record: staleRecord(value, snapshot) };
  }
  try {
    if (!snapshot) return { kind: "invalid" };
    return { kind: "ok", record: recordFrom(value, snapshot) };
  } catch {
    return { kind: "invalid" };
  }
}
