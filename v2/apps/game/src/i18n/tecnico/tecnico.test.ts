import { describe, expect, it } from "vitest";
import { walkMessages } from "../translate";
import { LOCALES } from "../types";
import { TECNICO_DICTIONARIES } from "./useTecnicoT";

/** Dicionário da interface do Técnico: mesma forma nos três idiomas, e traduzido de verdade. */

function entries(locale: (typeof LOCALES)[number]) {
  return new Map([...walkMessages(TECNICO_DICTIONARIES[locale])].map(({ key, value }) => [key, value]));
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

describe("dicionário do Técnico", () => {
  const source = entries("pt");

  it.each(LOCALES)("%s tem exatamente as chaves do português", (locale) => {
    expect([...entries(locale).keys()].sort()).toEqual([...source.keys()].sort());
  });

  it.each(LOCALES)("%s usa os mesmos marcadores do português", (locale) => {
    const mismatched = [...entries(locale)].filter(([key, value]) => placeholders(value).join() !== placeholders(source.get(key) ?? "").join()).map(([key]) => key);
    expect(mismatched).toEqual([]);
  });

  it.each(LOCALES)("%s não tem travessão, texto vazio nem espaço sobrando", (locale) => {
    const offenders = [...entries(locale)].filter(([, value]) => /[–—]/.test(value) || value.trim() !== value || value.length === 0).map(([key]) => key);
    expect(offenders).toEqual([]);
  });

  it.each(["es", "en"] as const)("%s não é uma cópia do português (no máximo 8% de textos iguais)", (locale) => {
    const own = entries(locale);
    const same = [...source].filter(([key, value]) => /[a-zà-ú]{4}/i.test(value) && own.get(key) === value);
    expect(same.length / source.size).toBeLessThanOrEqual(0.08);
  });
});
