import { create } from "zustand";
import type { CoachCareer } from "@craque/engine/coach";
import type { Dispatch, SetStateAction } from "react";

/** Rascunhos da etapa ficam apenas em memória e não entram no replay do motor. */
const useDraft = create<{ scope: string; values: Record<string, unknown> }>(() => ({ scope: "", values: {} }));
export function useProcessDraft<T>(career: CoachCareer, kind: string, key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const scope = `${career.setup.seed}:${career.year}:${career.half}`;
  const id = kind === "buy" || kind === "sell" ? `${kind}:${key}` : `${kind}:${career.flow?.number ?? career.actionsUsed + 1}:${key}`;
  const stored = useDraft(state => state.scope === scope ? state.values[id] : undefined);
  const value = stored === undefined ? initial : stored as T;
  const set: Dispatch<SetStateAction<T>> = next => {
    const state = useDraft.getState(), values = state.scope === scope ? state.values : {};
    const previous = values[id] === undefined ? initial : values[id] as T;
    const result = typeof next === "function" ? (next as (value: T) => T)(previous) : next;
    useDraft.setState({ scope, values: { ...values, [id]: result } });
  };
  return [value, set];
}

export function resetProcessDraft(career: CoachCareer, kind: string): void {
  const scope = `${career.setup.seed}:${career.year}:${career.half}`, state = useDraft.getState();
  if (state.scope !== scope) return;
  useDraft.setState({ values: Object.fromEntries(Object.entries(state.values).filter(([key]) => !key.startsWith(`${kind}:`))) });
}
