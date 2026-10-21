import { expect, it } from "vitest";
import { choose, createCareer, getEvent } from "../src";
import { debugDecision } from "../src/debug";

it("D82: respeitar o rival custa dois pontos de torcida, sem sorteio", () => {
  const option = getEvent("derby")!.options.find(option => option.id === "fairPlay")!;
  expect(option.kind).toBe("safe");
  expect(option.success).toEqual([{ kind: "fans", amount: -2 }]);
  expect(getEvent("derby")!.options[0]).toMatchObject({ id: "provoke", chance: .55, success: [{ kind: "fans", amount: 12 }], failure: [{ kind: "fans", amount: -10 }] });
  const before = debugDecision(createCareer({ seed: "d82-derby", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "TESTE", nationality: "BRA", position: "st", foot: "right", dreamNumber: 9 } }), "event:derby");
  const result = choose(before, { decision: before.decision!.id, option: "fairPlay" });
  expect(result.notices).toContainEqual({ kind: "eventOutcome", event: "derby", option: "fairPlay", success: null, effects: [{ kind: "fans", amount: -2 }] });
  expect(choose(before, { decision: before.decision!.id, option: "fairPlay" })).toEqual(result);
});
