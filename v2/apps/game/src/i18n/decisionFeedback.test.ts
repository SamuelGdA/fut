import { describe, expect, it } from "vitest";
import { DECISION_FEEDBACK } from "./decisionFeedback";

describe("feedback das decisões", () => {
  it("distingue os desfechos por ação nos três idiomas", () => {
    for (const copy of Object.values(DECISION_FEEDBACK)) {
      expect(Object.keys(copy).sort()).toEqual(Object.keys(DECISION_FEEDBACK.pt).sort());
      expect(new Set(Object.values(copy)).size).toBe(Object.keys(copy).length);
      for (const label of Object.values(copy)) { expect(label.trim().length).toBeGreaterThan(0); expect(label).not.toMatch(/[—–]/u); }
    }
  });
});
