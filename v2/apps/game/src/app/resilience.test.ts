import { describe, expect, it } from "vitest";
import { ERROR_ART_KINDS, errorArt } from "./errorArt";
import { errorKind, errorMessage } from "./errorKinds";
import { fromHistoryEntry, isScreen, toHistoryEntry } from "./navigation";
import { isGamePath, startScreen } from "./startup";

/** Resiliência (GDD 34.4 e 37): que erro é qual, que endereço é do jogo, e os desenhos. */

describe("tipos de erro", () => {
  it("pedaço do jogo que não baixou, em cada navegador, é `chunk`", () => {
    const messages = [
      "Failed to fetch dynamically imported module: http://localhost/assets/HallScreen-abc.js",
      "Importing a module script failed.",
      "error loading dynamically imported module: http://x/y.js",
      "Unable to preload CSS for /assets/x.css",
    ];
    for (const message of messages) expect(errorKind(new TypeError(message)), message).toBe("chunk");
    const chunk = new Error("x");
    chunk.name = "ChunkLoadError";
    expect(errorKind(chunk)).toBe("chunk");
  });

  it("o resto é erro de desenho, e a mensagem sai de qualquer coisa lançada", () => {
    expect(errorKind(new RangeError("Maximum call stack size exceeded"))).toBe("render");
    expect(errorKind("texto solto")).toBe("render");
    expect(errorMessage(new Error("quebrou"))).toBe("quebrou");
    expect(errorMessage(42)).toBe("42");
  });
});

describe("endereço do jogo e página não encontrada", () => {
  it("a raiz e o index.html são do jogo; qualquer outro caminho não", () => {
    expect(isGamePath("/", "/")).toBe(true);
    expect(isGamePath("/index.html", "/")).toBe(true);
    expect(isGamePath("/vestiario", "/")).toBe(false);
    expect(isGamePath("/assets/x.js", "/")).toBe(false);
    // Num build servido numa subpasta.
    expect(isGamePath("/craque/", "/craque/")).toBe(true);
    expect(isGamePath("/craque", "/craque/")).toBe(true);
    expect(isGamePath("/craque/outra", "/craque/")).toBe(false);
  });

  it("caminho desconhecido abre a página não encontrada, antes de qualquer save", () => {
    expect(startScreen("", "/vestiario/12")).toBe("notFound");
    expect(startScreen("#c=abc", "/nao")).toBe("notFound");
    expect(startScreen("", "/")).toBe("hub");
  });

  it("a página não encontrada é uma tela registrada como as outras", () => {
    expect(isScreen("notFound")).toBe(true);
    expect(fromHistoryEntry(toHistoryEntry("notFound"))).toBe("notFound");
  });
});

describe("desenhos das telas de erro", () => {
  it("quatro lances, cada um um SVG próprio, só com as cores do tema e sem nada externo", () => {
    const drawings = ERROR_ART_KINDS.map((kind) => errorArt(kind));
    expect(new Set(drawings).size).toBe(ERROR_ART_KINDS.length);
    for (const svg of drawings) {
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg).toContain('aria-hidden="true"');
      // Nada carregado de fora (o `xmlns` é nome, não endereço).
      expect(svg).not.toMatch(/href=|url\(|src=/);
      // Nenhuma cor fixa: tudo vem das variáveis do tema, para valer nos dois.
      expect(svg).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    }
  });
});
