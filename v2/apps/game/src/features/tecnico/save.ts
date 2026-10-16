import type { AvatarConfig } from "@craque/art";
import type { CoachCareer, CoachCommand, CoachSetup } from "@craque/engine/coach";
import { safeStorage } from "../../services/storage";
import { isRecord } from "../../lib/validate";

export const COACH_SAVE_KEY = "futeiros.tecnico.save";
export interface CoachSave {
  version: string;
  setup: CoachSetup;
  commands: CoachCommand[];
  avatar: AvatarConfig | null;
  club: string | null;
  year: number;
}
/** Leitura leve: nenhum motor ou elenco é carregado no hub. Replay validado ao continuar. */
export function readCoachSave(): CoachSave | null {
  const raw = safeStorage.getItem(COACH_SAVE_KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || typeof value["version"] !== "string" || !isRecord(value["setup"]) || !Array.isArray(value["commands"]) || value["commands"].length > 20000) throw new Error("save");
    const setup = value["setup"];
    if (typeof setup["seed"] !== "string" || !setup["seed"] || !Number.isInteger(setup["startYear"]) || (setup["mode"] !== "fast" && setup["mode"] !== "slow") || !isRecord(setup["identity"])) throw new Error("setup");
    const identity = setup["identity"];
    if (typeof identity["name"] !== "string" || !identity["name"].trim() || typeof identity["nationality"] !== "string" || identity["nationality"].length !== 3) throw new Error("identity");
    if (!(value["club"] === null || typeof value["club"] === "string") || !Number.isInteger(value["year"]) || !value["commands"].every(command => isRecord(command) && typeof command["type"] === "string")) throw new Error("metadata");
    return value as unknown as CoachSave;
  } catch { safeStorage.removeItem(COACH_SAVE_KEY); return null; }
}
export function writeCoachSave(career: CoachCareer, avatar: AvatarConfig | null, commands: CoachCommand[]): void {
  if (career.phase === "ended") { clearCoachSave(); return; }
  const record: CoachSave = { version: career.version, setup: career.setup, commands, avatar, club: career.coach?.club ?? null, year: career.year };
  safeStorage.setItem(COACH_SAVE_KEY, JSON.stringify(record));
}
export function clearCoachSave(): void { safeStorage.removeItem(COACH_SAVE_KEY); }
