import { describe, expect, it } from "vitest";
import { AD_SLOTS, ANCHOR_SCREENS, CAREER_CONTENT, IAB, RAIL_SCREENS, RAIL_TOP, railFormat, sizeLabel } from "./slots";

/** O registro dos espaços de anúncio e a conta dos trilhos (D134). */

describe("registro de espaços", () => {
  it("só usa tamanhos IAB padrão", () => {
    const standard = new Set(Object.values(IAB).map(sizeLabel));
    for (const slot of Object.values(AD_SLOTS)) {
      if (slot.desktop) expect(standard).toContain(sizeLabel(slot.desktop));
      if (slot.mobile) expect(standard).toContain(sizeLabel(slot.mobile));
    }
  });

  it("nada de anúncio no conteúdo do laço, da criação ou do login", () => {
    const sacred = ["home", "identity", "archived", "appearance", "login", "tecnico", "tecnicoIdentity", "tecnicoAppearance", "notFound", "lab"];
    for (const slot of Object.values(AD_SLOTS)) {
      for (const screen of slot.screens) {
        expect(sacred).not.toContain(screen);
        // Na carreira, só o recompensado do sorteio, que é escolha da pessoa.
        if (screen === "career") expect(slot.kind).toBe("reward");
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
  });
});

describe("trilhos", () => {
  const page = RAIL_SCREENS.achievements!.content;

  it("sobem para 300×600 quando a margem comporta, descem para 160×600 e somem", () => {
    expect(railFormat(1920, 1080, page, RAIL_TOP.page)).toEqual(IAB.halfPage);
    expect(railFormat(1600, 900, page, RAIL_TOP.page)).toEqual(IAB.skyscraper);
    expect(railFormat(1536, 864, page, RAIL_TOP.page)).toBeNull();
    expect(railFormat(1366, 768, page, RAIL_TOP.page)).toBeNull();
  });

  it("nunca espremem o conteúdo: sobra a folga dos dois lados", () => {
    for (let width = 1024; width <= 2560; width += 8) {
      const format = railFormat(width, 1200, page, RAIL_TOP.page);
      if (format) expect((width - page) / 2).toBeGreaterThanOrEqual(format.width + 48);
    }
  });

  it("precisam de altura para o anúncio inteiro", () => {
    expect(railFormat(1920, 680, page, RAIL_TOP.page)).toBeNull();
    expect(railFormat(1920, 706, page, RAIL_TOP.page)).toEqual(IAB.halfPage);
  });

  it("páginas de coluna estreita (resumo, Termos) ganham trilho já no laptop", () => {
    const summary = RAIL_SCREENS.summary!;
    const top = RAIL_TOP.page + (summary.below ?? 0);
    expect(railFormat(1280, 800, summary.content, top)).toBeNull();
    expect(railFormat(1366, 768, summary.content, top)).toEqual(IAB.skyscraper);
    expect(railFormat(1600, 900, summary.content, top)).toEqual(IAB.halfPage);
    expect(railFormat(1366, 768, RAIL_SCREENS.terms!.content, RAIL_TOP.page)).toEqual(IAB.skyscraper);
    expect(railFormat(1440, 900, RAIL_SCREENS.terms!.content, RAIL_TOP.page)).toEqual(IAB.halfPage);
  });

  it("na carreira, só a partir de 1696 px (fora das três colunas)", () => {
    expect(railFormat(1680, 1050, CAREER_CONTENT, RAIL_TOP.career)).toBeNull();
    expect(railFormat(1920, 1080, CAREER_CONTENT, RAIL_TOP.career)).toEqual(IAB.skyscraper);
    expect(railFormat(2560, 1440, CAREER_CONTENT, RAIL_TOP.career)).toEqual(IAB.halfPage);
  });
});
