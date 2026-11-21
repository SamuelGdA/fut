import { describe, expect, it } from "vitest";
import { AD_SLOTS, ANCHOR_SCREENS, IAB, IAB_INTERSTITIAL, INTERSTITIAL_FIRST_MS, INTERSTITIAL_GAP_MS, interstitialAllowed, RAIL_SCREENS, RAIL_TOP, railLayout, sizeLabel } from "./slots";

/** O registro dos espaços de anúncio, a conta dos trilhos e o limite do intersticial (D134, D135). */

describe("registro de espaços", () => {
  it("só usa tamanhos IAB padrão", () => {
    const standard = new Set(Object.values(IAB).map(sizeLabel));
    for (const slot of Object.values(AD_SLOTS)) {
      if (slot.desktop) expect(standard).toContain(sizeLabel(slot.desktop));
      if (slot.mobile) expect(standard).toContain(sizeLabel(slot.mobile));
    }
    expect(standard).toContain(sizeLabel(IAB_INTERSTITIAL.desktop));
    expect(standard).toContain(sizeLabel(IAB_INTERSTITIAL.mobile));
  });

  it("nada de anúncio no conteúdo do laço, da criação ou do login", () => {
    const sacred = ["home", "identity", "archived", "appearance", "login", "tecnico", "tecnicoIdentity", "tecnicoAppearance", "notFound", "lab"];
    for (const [id, slot] of Object.entries(AD_SLOTS)) {
      for (const screen of slot.screens) {
        expect(sacred).not.toContain(screen);
        // Na carreira, só o recompensado do sorteio (escolha da pessoa) e as
        // abas de exploração do celular, que ficam fora do laço.
        if (screen === "career") expect(slot.kind === "reward" || (slot.desktop === null && id.startsWith("carreira-"))).toBe(true);
      }
    }
    expect(ANCHOR_SCREENS).not.toContain("career");
    expect(ANCHOR_SCREENS).not.toContain("identity");
    expect(ANCHOR_SCREENS).not.toContain("home");
    expect(ANCHOR_SCREENS).not.toContain("archived");
    // O perfil vira a tela de login para quem não tem conta.
    expect(ANCHOR_SCREENS).not.toContain("profile");
    expect(RAIL_SCREENS.login).toBeUndefined();
    expect(RAIL_SCREENS.profile).toBeUndefined();
  });

  it("os formatos do celular cabem em 360 px com as margens da página", () => {
    for (const slot of Object.values(AD_SLOTS)) if (slot.mobile) expect(slot.mobile.width).toBeLessThanOrEqual(360 - 2 * 16);
    expect(IAB_INTERSTITIAL.mobile.height).toBeLessThanOrEqual(640 - 64 - 24 - 18);
  });
});

describe("trilhos", () => {
  const achievements = RAIL_SCREENS.achievements!;

  it("sobem para 300×600 quando a margem comporta e descem para 160×600", () => {
    expect(railLayout(1920, 1080, achievements)).toEqual({ format: IAB.halfPage, content: 1152 });
    expect(railLayout(1600, 900, achievements)).toEqual({ format: IAB.skyscraper, content: 1152 });
  });

  it("nunca espremem além do mínimo da tela: sobra a folga dos dois lados", () => {
    for (let width = 1024; width <= 2560; width += 8) {
      for (const place of Object.values(RAIL_SCREENS)) {
        const layout = railLayout(width, 1200, place!);
        if (!layout) continue;
        expect((width - layout.content) / 2).toBeGreaterThanOrEqual(layout.format.width + 48);
        expect(layout.content).toBeGreaterThanOrEqual(place!.min ?? place!.content);
      }
    }
  });

  it("cabem na janela real de um notebook 1920 × 1080 com escala de 125% (1536 × 730)", () => {
    expect(railLayout(1536, 730, RAIL_SCREENS.career!)).toEqual({ format: IAB.skyscraper, content: 1120 });
    expect(railLayout(1536, 730, RAIL_SCREENS.hub!)).toEqual({ format: IAB.skyscraper, content: 1120 });
    expect(railLayout(1536, 730, achievements)).toEqual({ format: IAB.skyscraper, content: 1120 });
    expect(railLayout(1536, 730, RAIL_SCREENS.summary!)).toEqual({ format: IAB.skyscraper, content: 896 });
    // A criação de jogador e o Desafio não encolhem.
    expect(railLayout(1536, 730, RAIL_SCREENS.identity!)).toBeNull();
    expect(railLayout(1536, 730, RAIL_SCREENS.challenge!)).toBeNull();
  });

  it("precisam de altura para o anúncio inteiro", () => {
    expect(railLayout(1920, 690, achievements)).toBeNull();
    expect(railLayout(1920, RAIL_TOP + 616, achievements)).toEqual({ format: IAB.halfPage, content: 1152 });
  });

  it("na carreira: 160×600 a partir de 1520 px (as colunas encolhem até 1104), 300×600 a partir de 1976 px", () => {
    expect(railLayout(1440, 900, RAIL_SCREENS.career!)).toBeNull();
    expect(railLayout(1520, 900, RAIL_SCREENS.career!)).toEqual({ format: IAB.skyscraper, content: 1104 });
    expect(railLayout(1696, 900, RAIL_SCREENS.career!)).toEqual({ format: IAB.skyscraper, content: 1280 });
    expect(railLayout(1976, 1080, RAIL_SCREENS.career!)).toEqual({ format: IAB.halfPage, content: 1280 });
  });
});

describe("intersticial", () => {
  it("nunca nos primeiros 2 minutos, nunca dois em menos de 3", () => {
    expect(interstitialAllowed(INTERSTITIAL_FIRST_MS - 1, null)).toBe(false);
    expect(interstitialAllowed(INTERSTITIAL_FIRST_MS, null)).toBe(true);
    expect(interstitialAllowed(INTERSTITIAL_FIRST_MS + 60_000, INTERSTITIAL_FIRST_MS)).toBe(false);
    expect(interstitialAllowed(INTERSTITIAL_FIRST_MS + INTERSTITIAL_GAP_MS, INTERSTITIAL_FIRST_MS)).toBe(true);
  });
});
