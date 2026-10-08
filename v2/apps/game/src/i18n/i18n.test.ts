import { describe, expect, it } from "vitest";
import {
  DICTIONARIES,
  interpolate,
  type MessageKey,
  translate,
  translatePlural,
  walkMessages,
} from "./translate";
import { LOCALES } from "./types";

function entries(locale: (typeof LOCALES)[number]) {
  return new Map([...walkMessages(DICTIONARIES[locale])].map(({ key, value }) => [key, value]));
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

describe("dicionários (GDD 35)", () => {
  const source = entries("pt");

  it.each(LOCALES)("%s tem exatamente as mesmas chaves do português", (locale) => {
    const keys = [...entries(locale).keys()].sort();
    expect(keys).toEqual([...source.keys()].sort());
  });

  it.each(LOCALES)("%s usa os mesmos marcadores que o português em cada chave", (locale) => {
    const mismatched: string[] = [];
    for (const [key, value] of entries(locale)) {
      const expected = placeholders(source.get(key) ?? "");
      if (placeholders(value).join() !== expected.join()) mismatched.push(key);
    }
    expect(mismatched).toEqual([]);
  });

  it.each(LOCALES)("%s não tem travessão em nenhum texto", (locale) => {
    const offenders = [...entries(locale)].filter(([, value]) => /[–—]/.test(value));
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it.each(LOCALES)("%s não tem texto vazio nem espaço sobrando nas pontas", (locale) => {
    const offenders = [...entries(locale)].filter(([, value]) => value.trim() !== value || value.length === 0);
    expect(offenders.map(([key]) => key)).toEqual([]);
  });
});

describe("translate", () => {
  it("interpola variáveis pelo nome", () => {
    expect(translate("pt", "settings.volumeValue", { value: 75 })).toBe("75%");
    expect(translate("en", "lab.controls.surnameHint", { max: 16 })).toBe("Up to 16 letters.");
  });

  it("mantém o marcador visível quando a variável falta", () => {
    expect(interpolate("{a} e {b}", { a: 1 })).toBe("1 e {b}");
  });

  it("devolve a própria chave quando ela não existe em nenhum idioma", () => {
    expect(translate("es", "nao.existe" as MessageKey)).toBe("nao.existe");
  });

  it("não interpreta propriedades herdadas como variável", () => {
    expect(interpolate("{toString}", {})).toBe("{toString}");
  });
});

describe("translatePlural", () => {
  it("escolhe singular ou plural pela regra do idioma", () => {
    expect(translatePlural("pt", "units.seasons", 1)).toBe("1 temporada");
    expect(translatePlural("pt", "units.seasons", 2)).toBe("2 temporadas");
    expect(translatePlural("en", "units.games", 1)).toBe("1 game");
    expect(translatePlural("es", "units.goals", 3)).toBe("3 goles");
  });

  it("formata o número no idioma", () => {
    expect(translatePlural("pt", "units.games", 1391)).toBe("1.391 jogos");
    expect(translatePlural("en", "units.games", 1391)).toBe("1,391 games");
  });
});
