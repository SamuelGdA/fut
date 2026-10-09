import { describe, expect, it } from "vitest";
import { errorPageHtml } from "./errorPages";

/** As páginas estáticas de erro (GDD 37): geradas dos dicionários e do desenho do jogo. */

describe("páginas estáticas de erro", () => {
  const codes = ["403", "404", "500", "503"] as const;

  it("cada página tem título, texto e volta para o jogo, em português sem JavaScript", () => {
    const titles = { "403": "Impedimento", "404": "Bola fora", "500": "Bateu na trave", "503": "Jogo adiado" } as const;
    for (const code of codes) {
      const html = errorPageHtml(code, "/");
      expect(html.startsWith("<!doctype html>")).toBe(true);
      expect(html).toContain(`<h1 data-t="title">${titles[code]}</h1>`);
      expect(html).toContain(`<title>${titles[code]}: Futeiros</title>`);
      expect(html).toContain('href="/"');
      expect(html).toContain("<svg");
    }
  });

  it("500 e 503 dizem que a carreira continua salva e oferecem tentar de novo", () => {
    for (const code of ["500", "503"] as const) {
      const html = errorPageHtml(code, "/");
      expect(html).toContain("Sua carreira continua salva");
      expect(html).toContain('onclick="location.reload()"');
    }
    // A 404 não tem o que tentar de novo: só a volta para o jogo.
    expect(errorPageHtml("404", "/")).not.toContain('onclick="location.reload()"');
  });

  it("os três idiomas vão juntos, e a página escolhe pelas preferências", () => {
    const html = errorPageHtml("404", "/");
    expect(html).toContain("Balón afuera");
    expect(html).toContain("Out of play");
    expect(html).toContain("craque.v2.prefs");
  });

  it("nada de fora: sem fonte, imagem ou script externos, e a base respeitada", () => {
    for (const code of codes) {
      const html = errorPageHtml(code, "/craque/");
      // Nenhum recurso carregado de fora (o `xmlns` do SVG é nome, não endereço).
      expect(html).not.toMatch(/(?:src|href)="https?:|url\(|@import|<link rel="stylesheet"/);
      expect(html).toContain('href="/craque/"');
      expect(html).toContain('href="/craque/favicon.svg"');
    }
  });
});
