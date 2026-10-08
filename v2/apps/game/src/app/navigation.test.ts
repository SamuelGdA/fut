import { describe, expect, it } from "vitest";
import { fromHistoryEntry, INITIAL_SCREEN, isScreen, SCREENS, toHistoryEntry, useNavigation } from "./navigation";

describe("navegação (GDD 5)", () => {
  it("toda tela registrada vai e volta do histórico", () => {
    for (const screen of SCREENS) {
      expect(fromHistoryEntry(toHistoryEntry(screen))).toBe(screen);
    }
  });

  it("estado de histórico estranho é ignorado", () => {
    expect(fromHistoryEntry(null)).toBeNull();
    expect(fromHistoryEntry({ screen: "lab" })).toBeNull();
    expect(fromHistoryEntry({ craque: 1, screen: "lab" })).toBeNull();
    expect(fromHistoryEntry({ craque: 2, screen: "vestiario" })).toBeNull();
  });

  it("isScreen só aceita telas registradas", () => {
    expect(isScreen(INITIAL_SCREEN)).toBe(true);
    expect(isScreen("vestiario")).toBe(false);
    expect(isScreen(42)).toBe(false);
  });

  it("voltar para um estado inválido cai na tela inicial sem quebrar", () => {
    useNavigation.getState().applyPop({ craque: 2, screen: "vestiario" });
    expect(useNavigation.getState().screen).toBe(INITIAL_SCREEN);
  });

  it("ir para a tela atual não faz nada", () => {
    const before = useNavigation.getState().screen;
    useNavigation.getState().go(before);
    expect(useNavigation.getState().screen).toBe(before);
  });
});
