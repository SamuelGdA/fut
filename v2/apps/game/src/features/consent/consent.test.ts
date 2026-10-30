import { describe, expect, it } from "vitest";
import { bannerVisible, CONSENT_KEY, CONSENT_VERSION, readConsent, trackingAllowed } from "./store";

/** O consentimento de cookies (D113). */

describe("consentimento", () => {
  const stored = (value: unknown) => (key: string) => (key === CONSENT_KEY ? JSON.stringify(value) : null);

  it("lê só a escolha da versão atual do aviso", () => {
    expect(readConsent(stored({ v: CONSENT_VERSION, choice: "all", at: 1 }))).toBe("all");
    expect(readConsent(stored({ v: CONSENT_VERSION, choice: "essential", at: 1 }))).toBe("essential");
    expect(readConsent(stored({ v: CONSENT_VERSION - 1, choice: "all", at: 1 }))).toBeNull();
    expect(readConsent(stored({ v: CONSENT_VERSION, choice: "tudo" }))).toBeNull();
    expect(readConsent(() => "{quebrado")).toBeNull();
    expect(readConsent(() => null)).toBeNull();
  });

  it("o aviso só aparece com rastreador no build e escolha em aberto (ou reaberta)", () => {
    expect(bannerVisible(null, false, true)).toBe(true);
    expect(bannerVisible("essential", false, true)).toBe(false);
    expect(bannerVisible("essential", true, true)).toBe(true);
    expect(bannerVisible(null, false, false)).toBe(false);
  });

  it("Analytics e anúncios só com Aceitar todos", () => {
    expect(trackingAllowed("all")).toBe(true);
    expect(trackingAllowed("essential")).toBe(false);
    expect(trackingAllowed(null)).toBe(false);
  });
});
