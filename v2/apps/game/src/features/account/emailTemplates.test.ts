import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderEmail } from "../../screens/lab/sections/emailRender";

/** Os modelos de e-mail da conta saem no idioma do jogador (D122). */

const DIR = new URL("../../../../../supabase/templates/", import.meta.url);
const CONFIG = readFileSync(new URL("../../../../../supabase/config.toml", import.meta.url), "utf8");
const FILES = readdirSync(DIR).filter((name) => name.endsWith(".html"));
const PICK = /\{\{ if eq \(printf "%v" \.Data\.locale\) "es" \}\}[\s\S]*\{\{ else if eq \(printf "%v" \.Data\.locale\) "en" \}\}[\s\S]*\{\{ else \}\}[\s\S]*\{\{ end \}\}/;

describe("modelos de e-mail em três idiomas", () => {
  it("são oito, cada um com um bloco em espanhol, inglês e português", () => {
    expect(FILES).toHaveLength(8);
    for (const name of FILES) {
      const source = readFileSync(new URL(name, DIR), "utf8");
      expect(source, name).toMatch(PICK);
      expect(renderEmail(source, "es"), name).toContain('<html lang="es">');
      expect(renderEmail(source, "en"), name).toContain('<html lang="en">');
      expect(renderEmail(source, "pt"), name).toContain('<html lang="pt-BR">');
      // Nenhum bloco sobra no texto escolhido, e nada de travessão.
      for (const locale of ["pt", "es", "en"] as const) {
        const html = renderEmail(source, locale);
        expect(html, `${name} ${locale}`).not.toMatch(/\{\{\s*(if|else|end)/);
        expect(html.match(/<html/g), `${name} ${locale}`).toHaveLength(1);
        expect(html, `${name} ${locale}`).not.toMatch(/[—–]/);
      }
    }
  });

  it("os assuntos do config.toml também escolhem o idioma", () => {
    const subjects = CONFIG.split("\n").filter((line) => line.startsWith("subject = "));
    expect(subjects).toHaveLength(8);
    for (const line of subjects) expect(line.replace(/\\"/g, '"')).toMatch(PICK);
  });
});
