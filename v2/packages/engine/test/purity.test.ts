import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ENGINE_VERSION } from "../src";

/**
 * O motor é puro (D4): nada de relógio, `Math.random`, navegador, Node ou
 * React no código-fonte. Este teste lê os arquivos e reprova qualquer uso.
 */

const SOURCE = fileURLToPath(new URL("../src/", import.meta.url));

function sourceFiles(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return path.endsWith(".ts") ? [path] : [];
  });
}

/** Tira comentários para que a explicação "nada usa Math.random" não conte. */
function code(path: string): string {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const FORBIDDEN: ReadonlyArray<readonly [string, RegExp]> = [
  ["Math.random", /Math\.random/],
  ["Date", /\bDate\b/],
  ["performance", /\bperformance\./],
  ["window", /\bwindow\./],
  ["document", /\bdocument\./],
  ["localStorage", /\blocalStorage\b/],
  ["process", /\bprocess\./],
  ["console", /\bconsole\./],
  ["react", /from\s+["']react/],
  ["zustand", /from\s+["']zustand/],
  ["node:", /from\s+["']node:/],
  ["@craque/game", /from\s+["']@craque\/game/],
];

describe("pureza do motor (D4)", () => {
  const files = sourceFiles(SOURCE);

  it("encontra o código-fonte", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const [name, pattern] of FORBIDDEN) {
    it(`nenhum arquivo usa ${name}`, () => {
      const offenders = files.filter((path) => pattern.test(code(path)));
      expect(offenders).toEqual([]);
    });
  }

  it("declara a versão dos resultados", () => {
    expect(ENGINE_VERSION).toMatch(/^2\.0\.0-m\d+/);
  });
});
