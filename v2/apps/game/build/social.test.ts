import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ROUTE_PATHS } from "./routes";
import { SOCIAL_COPY, socialHtml, socialOrigin } from "./social";

const template = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("prévia de compartilhamento", () => {
  for (const language of ["pt", "en", "es"] as const) {
    it(`entrega texto, imagem e idioma ${language} sem JavaScript`, () => {
      const html = socialHtml(template, language, "https://jogo.example", "craque");
      const copy = SOCIAL_COPY[language];
      expect(html).toContain(`property="og:title" content="${copy.title}"`);
      expect(html).toContain(`name="description" content="${copy.description}"`);
      expect(html).toContain(`property="og:locale" content="${copy.locale}"`);
      expect(html).toContain(`content="https://jogo.example/social/futeiros-${language}.png"`);
      expect(html).toContain(`property="og:url" content="https://jogo.example/craque${language === "pt" ? "" : `?lang=${language}`}"`);
      expect(html.match(/property="og:title"/g)).toHaveLength(1);
      expect(html.match(/property="og:locale:alternate"/g)).toHaveLength(2);
      expect(html).toContain('name="twitter:card" content="summary_large_image"');
      expect(html).toContain('<script src="/boot/tema.js"></script>');
      const png = readFileSync(new URL(`../public/social/futeiros-${language}.png`, import.meta.url));
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
      expect(png.length).toBeLessThan(300_000);
    });
  }

  it("aceita domínio com ou sem protocolo, sem espalhar caminho nem credenciais", () => {
    expect(socialOrigin("jogo.example/")).toBe("https://jogo.example");
    expect(socialOrigin("https://jogo.example/craque")).toBe("https://jogo.example");
    expect(() => socialOrigin("https://usuario:senha@jogo.example")).toThrow();
    expect(() => socialOrigin("ftp://jogo.example")).toThrow();
    expect(socialOrigin(undefined)).toBe("");
    expect(socialHtml(template, "pt", "")).not.toContain('property="og:url"');
  });

  it("escapa o domínio ao escrever atributos", () => {
    expect(socialHtml(template, "pt", 'https://example.test/"<')).toContain("&quot;&lt;/social/");
  });

  it("a Vercel resolve cada idioma na raiz e nas rotas existentes, sem mudar a URL pública", () => {
    const config = JSON.parse(readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8")) as { rewrites: { source: string; destination: string; has: unknown[] }[] };
    for (const language of ["en", "es"]) {
      for (const path of ["", ...ROUTE_PATHS]) {
        expect(config.rewrites).toContainEqual({ source: `/${path}`, has: [{ type: "query", key: "lang", value: language }], destination: `/social/${language}/${path ? `${path}/` : ""}index.html` });
      }
    }
  });
});
