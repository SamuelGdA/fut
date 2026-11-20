import { describe, expect, it } from "vitest";
import { displayName, messageWithLink, networkUrl, SHARE_NETWORKS } from "./shareTargets";

/** Compartilhar a carreira pelo link curto (D132). */

const LINK = "https://futeiro.com/c/AbCdEfGhJk";

describe("links de cada rede", () => {
  it("a mensagem e o link curto vão no formato de cada rede", () => {
    expect(networkUrl("whatsapp", "Olá & tchau", LINK)).toBe(`https://wa.me/?text=${encodeURIComponent(`Olá & tchau\n${LINK}`)}`);
    expect(networkUrl("x", "Olá", LINK)).toBe(`https://x.com/intent/post?text=Ol%C3%A1&url=${encodeURIComponent(LINK)}`);
    expect(networkUrl("facebook", "Olá", LINK)).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(LINK)}`);
    expect(networkUrl("telegram", "Olá", LINK)).toBe(`https://t.me/share/url?url=${encodeURIComponent(LINK)}&text=Ol%C3%A1`);
    expect(networkUrl("reddit", "Olá", LINK)).toBe(`https://www.reddit.com/submit?url=${encodeURIComponent(LINK)}&title=Ol%C3%A1`);
  });

  it("Discord e Instagram não têm link de compartilhar", () => {
    expect(networkUrl("discord", "Olá", LINK)).toBeNull();
    expect(networkUrl("instagram", "Olá", LINK)).toBeNull();
    expect(SHARE_NETWORKS).toHaveLength(7);
  });

  it("mensagem com o link numa linha própria", () => {
    expect(messageWithLink("  Minha carreira  ", LINK)).toBe(`Minha carreira\n${LINK}`);
  });

  it("o nome como gente escreve", () => {
    expect(displayName("DA SILVA", "pt")).toBe("Da Silva");
    expect(displayName("O'NEILL-SMITH", "en")).toBe("O'Neill-Smith");
    expect(displayName("ÁVILA", "es")).toBe("Ávila");
  });
});
