import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TOKEN_VALUES } from "./tokens";

const css = readFileSync(new URL("../../styles/index.css", import.meta.url), "utf8");

/** Recorta o bloco de variáveis de um seletor no CSS. */
function block(selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css.slice(open, close);
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

describe("contraste de texto (GDD 36: pelo menos 4,5:1)", () => {
  const texts = ["fg", "muted", "faint", "good", "glory", "bad", "info"] as const;
  const surfaces = ["canvas", "panel", "panel-2"] as const;

  it.each(["dark", "light"] as const)("todo tom de texto passa em toda superfície no tema %s", (theme) => {
    const palette = TOKEN_VALUES[theme];
    const failures = texts.flatMap((text) =>
      surfaces
        .filter((surface) => contrast(palette[text], palette[surface]) < 4.5)
        .map((surface) => `${text} sobre ${surface}: ${contrast(palette[text], palette[surface]).toFixed(2)}`),
    );
    expect(failures).toEqual([]);
  });
});

describe("tokens exibidos no laboratório", () => {
  const themes = {
    dark: block('[data-theme="dark"] {'),
    light: block('[data-theme="light"] {'),
  } as const;

  it.each(["dark", "light"] as const)("%s bate com styles/index.css", (theme) => {
    const source = themes[theme];
    expect(source.length).toBeGreaterThan(0);
    const missing = Object.entries(TOKEN_VALUES[theme]).filter(
      ([name, value]) => !source.includes(`--${name}: ${value};`),
    );
    expect(missing).toEqual([]);
  });
});
