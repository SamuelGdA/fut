import { describe, expect, it } from "vitest";
import { walkMessages } from "../translate";
import { LOCALES } from "../types";
import { CONTA_DICTIONARIES, legalSections } from "./useContaT";

/** Dicionário das telas de conta e das páginas legais: mesma forma nos três idiomas, sem travessão. */

function entries(locale: (typeof LOCALES)[number]) {
  return new Map([...walkMessages(CONTA_DICTIONARIES[locale])].map(({ key, value }) => [key, value]));
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

describe("dicionário de conta e páginas legais", () => {
  const source = entries("pt");

  it.each(LOCALES)("%s tem exatamente as chaves do português, com os mesmos marcadores", (locale) => {
    const own = entries(locale);
    expect([...own.keys()].sort()).toEqual([...source.keys()].sort());
    const mismatched = [...own].filter(([key, value]) => placeholders(value).join() !== placeholders(source.get(key) ?? "").join());
    expect(mismatched.map(([key]) => key)).toEqual([]);
  });

  it.each(LOCALES)("%s não tem travessão, texto vazio nem espaço sobrando", (locale) => {
    const offenders = [...entries(locale)].filter(([, value]) => /[–—]/.test(value) || value.length === 0 || value.trim() !== value);
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it.each(LOCALES)("%s traduz de verdade (espanhol e inglês não repetem o português nas páginas legais)", (locale) => {
    if (locale === "pt") return;
    const own = entries(locale);
    const copied = [...own].filter(([key, value]) => key.endsWith(".body") && value === source.get(key));
    expect(copied.map(([key]) => key)).toEqual([]);
  });

  it("as páginas legais citam o que o site realmente usa", () => {
    const privacy = legalSections("pt", "privacy").map((section) => section.body.join(" ")).join(" ");
    for (const term of ["Google Analytics", "AdSense", "e-mail", "Supabase", "Apagar a conta", "localStorage"]) expect(privacy).toContain(term);
    const terms = legalSections("pt", "terms").map((section) => section.body.join(" ")).join(" ");
    expect(terms).toContain("não possui caráter comercial");
  });
});
