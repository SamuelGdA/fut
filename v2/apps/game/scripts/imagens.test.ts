import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
// @ts-expect-error: script de linha de comando em JavaScript, sem declaração de tipos.
import * as imagens from "./imagens.mjs";

/** O importador de imagens geradas (D115): nomes, destinos, SVG e dados. */

interface Target { kind?: string; id?: string; error?: string; vector?: boolean; league?: string; dataFile?: string }
const lib = imagens as {
  slug(text: string): string;
  defaultSourceDir(env: Record<string, string | undefined>, home: string): string;
  loadCatalog(path: string): unknown;
  resolveTarget(catalog: unknown, parts: string[]): Target;
  checkSvg(text: string, bytes?: number): string[];
  outputExtension(target: Target): string;
  setObjectField(text: string, id: string, field: string, value: string): string;
  setFileEntry(text: string, section: string, key: string, value: string): string;
};

const WORLD = fileURLToPath(new URL("../../../packages/world/data/", import.meta.url));
const catalog = lib.loadCatalog(WORLD);

describe("importador de imagens", () => {
  it("usa Downloads/geradas do usuário quando nada é dito", () => {
    expect(lib.defaultSourceDir({}, "C:\\Users\\Usuario")).toBe(join("C:\\Users\\Usuario", "Downloads", "geradas"));
    expect(lib.defaultSourceDir({ FUTEIROS_GERADAS: "  /tmp/arte " }, "/home/x")).toBe("/tmp/arte");
  });

  it("faz o mesmo apelido dos ids do mundo", () => {
    expect(lib.slug("1. FC Köln")).toBe("1-fc-koln");
    expect(lib.slug("Brasileirão Série B")).toBe("brasileirao-serie-b");
    expect(lib.slug("Newell's Old Boys")).toBe("newell-s-old-boys");
  });

  it("acha clube, liga, troféu e prêmio pelo nome da lista", () => {
    expect(lib.resolveTarget(catalog, ["clubes", "Brasileirão", "Vasco da Gama.png"])).toMatchObject({ kind: "clube", id: "vasco-da-gama", vector: false });
    expect(lib.resolveTarget(catalog, ["clubes", "Flamengo.svg"])).toMatchObject({ kind: "clube", id: "flamengo", vector: true });
    expect(lib.resolveTarget(catalog, ["ligas", "Brasileirão Série B.png"])).toMatchObject({ kind: "liga", id: "brasileirao-serie-b" });
    expect(lib.resolveTarget(catalog, ["trofeus", "uefa-champions-league.png"])).toMatchObject({ kind: "trofeu", id: "uefa-champions-league" });
    expect(lib.resolveTarget(catalog, ["trofeus", "Premier League.png"])).toMatchObject({ kind: "trofeu", id: "league-premier-league", league: "premier-league" });
    expect(lib.resolveTarget(catalog, ["premios", "ballon-dor.png"])).toMatchObject({ kind: "premio", id: "ballon-dor" });
    expect(lib.resolveTarget(catalog, ["Premier League.svg"])).toMatchObject({ kind: "liga", id: "premier-league" });
  });

  it("recusa o que não bate e pede a liga quando o nome se repete", () => {
    expect(lib.resolveTarget(catalog, ["clubes", "Clube Que Não Existe.png"]).error).toBe("clube não encontrado");
    expect(lib.resolveTarget(catalog, ["clubes", "Liga Fantasma", "Flamengo.png"]).error).toContain("Liga Fantasma");
    expect(lib.resolveTarget(catalog, ["clubes", "Flamengo.gif"]).error).toBe("extensão não aceita");
    const ambiguous = lib.resolveTarget(catalog, ["clubes", "Liverpool.png"]);
    expect(ambiguous.error).toContain("clubes/<Liga>/");
    expect(lib.resolveTarget(catalog, ["clubes", "Premier League", "Liverpool.png"])).toMatchObject({ kind: "clube", id: "liverpool" });
  });

  it("só aceita SVG limpo e leve", () => {
    const clean = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 0h10v10z"/></svg>';
    expect(lib.checkSvg(clean)).toEqual([]);
    expect(lib.checkSvg(clean.replace("<path", "<script>alert(1)</script><path"))).toContain("tem <script>");
    expect(lib.checkSvg(clean.replace("<path", '<image href="data:image/png;base64,AAAA"/><path'))).toContain("tem <image> embutida");
    expect(lib.checkSvg(clean.replace("<path", '<path onclick="x()"'))).toContain("tem atributo de evento (on...)");
    expect(lib.checkSvg(clean.replace("<path", '<use href="https://evil.example/a.svg#x"/><path'))).toContain("aponta para fora do arquivo");
    expect(lib.checkSvg(clean.replace(' viewBox="0 0 512 512"', ""))).toContain("sem viewBox");
    expect(lib.checkSvg(clean, 200 * 1024)[0]).toContain("pesado demais");
  });

  it("escolhe o formato de saída de cada tipo", () => {
    expect(lib.outputExtension({ kind: "clube", vector: false })).toBe("png");
    expect(lib.outputExtension({ kind: "liga", vector: true })).toBe("svg");
    expect(lib.outputExtension({ kind: "trofeu", vector: false })).toBe("webp");
    expect(lib.outputExtension({ kind: "premio", vector: false })).toBe("webp");
  });

  it("troca só a extensão nos dados, sem reformatar o arquivo", () => {
    const clubs = '[\r\n  {\r\n    "id": "a",\r\n    "prestige": 1.0,\r\n    "crest": "svg"\r\n  },\r\n  {\r\n    "id": "b",\r\n    "prestige": 2.0,\r\n    "crest": null\r\n  }\r\n]\r\n';
    expect(lib.setObjectField(clubs, "b", "crest", "png")).toBe(clubs.replace('"crest": null', '"crest": "png"'));
    expect(lib.setObjectField(clubs, "a", "crest", "png")).toBe(clubs.replace('"crest": "svg"', '"crest": "png"'));
    expect(() => lib.setObjectField(clubs, "c", "crest", "png")).toThrow();
    const files = '{\n  "trophies": {\n    "kopa": "png"\n  },\n  "awards": {\n    "kopa": "webp"\n  }\n}\n';
    expect(lib.setFileEntry(files, "awards", "kopa", "png")).toBe('{\n  "trophies": {\n    "kopa": "png"\n  },\n  "awards": {\n    "kopa": "png"\n  }\n}\n');
  });
});
