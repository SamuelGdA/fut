import { readFileSync } from "node:fs";
import { EVENT_IDS, MATCH_EVENT_OPTIONS, TALK_EFFECTS } from "@craque/engine/coach";
import { describe, expect, it } from "vitest";
import { COACH_ACHIEVEMENTS, COACH_TEXTS, coachPlayerName, TECNICO_ACHIEVEMENT_IDS } from "../src/coach";
import { LOCALES, walkMessages } from "../src";

/** Textos do Técnico (GDD 42): três idiomas iguais em forma, e casados com o catálogo do motor. */

function entries(tree: unknown): Map<string, string> {
  return new Map([...walkMessages(tree)].map(({ key, value }) => [key, value]));
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

const source = entries(COACH_TEXTS.pt);

describe("dicionário do Técnico nos três idiomas", () => {
  it.each(LOCALES)("%s tem exatamente as chaves do português", (locale) => {
    expect([...entries(COACH_TEXTS[locale]).keys()].sort()).toEqual([...source.keys()].sort());
  });

  it.each(LOCALES)("%s usa os mesmos marcadores do português", (locale) => {
    const mismatched = [...entries(COACH_TEXTS[locale])].filter(([key, value]) => placeholders(value).join() !== placeholders(source.get(key) ?? "").join()).map(([key]) => key);
    expect(mismatched).toEqual([]);
  });

  it.each(LOCALES)("%s não tem travessão, texto vazio nem espaço sobrando", (locale) => {
    const offenders = [...entries(COACH_TEXTS[locale])].filter(([, value]) => /[–—]/.test(value) || value.trim() !== value || value.length === 0).map(([key]) => key);
    expect(offenders).toEqual([]);
  });
});

/** Opções de cada evento lidas do código do motor: id e se tem sorteio. */
function catalogOptions(): Map<string, Map<string, boolean>> {
  const code = readFileSync(new URL("../../engine/src/coach/events.ts", import.meta.url), "utf8");
  const result = new Map<string, Map<string, boolean>>();
  const blocks = code.split(/\n {2}\{\n {4}id: "/).slice(1);
  for (const block of blocks) {
    const id = block.slice(0, block.indexOf('"'));
    const options = new Map<string, boolean>();
    for (const match of block.matchAll(/option\("(\w+)", (null|[\d.]+)/g)) options.set(match[1] ?? "", match[2] !== "null");
    result.set(id, options);
  }
  return result;
}

describe("tradução de verdade", () => {
  it.each(["es", "en"] as const)("%s não é uma cópia do português (no máximo 8% de textos iguais)", (locale) => {
    const own = entries(COACH_TEXTS[locale]);
    const same = [...source].filter(([key, value]) => /[a-zà-ú]{4}/i.test(value) && own.get(key) === value);
    expect(same.length / source.size).toBeLessThanOrEqual(0.08);
  });
});

describe("textos casados com o motor", () => {
  const events = COACH_TEXTS.pt.events as Readonly<Record<string, { options: Record<string, Record<string, string>> }>>;

  it("todo evento do catálogo tem texto, e não sobra texto de evento que não existe", () => {
    expect(Object.keys(events).sort()).toEqual([...EVENT_IDS].sort());
  });

  it("cada opção tem rótulo e o resultado certo: sucesso e fracasso nas que sorteiam, resultado nas outras", () => {
    expect(catalogOptions().size).toBe(EVENT_IDS.length);
    const problems: string[] = [];
    for (const [id, options] of catalogOptions()) {
      const texts = events[id]?.options ?? {};
      if (Object.keys(texts).sort().join() !== [...options.keys()].sort().join()) problems.push(`${id}: opções`);
      for (const [option, risky] of options) {
        const expected = risky ? ["failure", "label", "success"] : ["label", "result"];
        if (Object.keys(texts[option] ?? {}).sort().join() !== expected.join()) problems.push(`${id}.${option}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("toda decisão no jogo tem rótulo, dica e objetivo", () => {
    const options = COACH_TEXTS.pt.matchEvent.options as Readonly<Record<string, Record<string, string>>>;
    const ids = new Set(Object.values(MATCH_EVENT_OPTIONS).flatMap((list) => list.map((entry) => entry.id)));
    for (const id of ids) expect(Object.keys(options[id] ?? {}).sort()).toEqual(["goal", "hint", "label"]);
  });

  it("toda resposta de conversa tem rótulo e os resultados que pode ter", () => {
    const options = COACH_TEXTS.pt.talks.options as Readonly<Record<string, Record<string, string>>>;
    expect(Object.keys(options).sort()).toEqual(Object.keys(TALK_EFFECTS).sort());
    for (const [id, effect] of Object.entries(TALK_EFFECTS)) {
      const expected = effect.chance === null ? ["good", "label"] : ["bad", "good", "label"];
      expect(Object.keys(options[id] ?? {}).sort(), id).toEqual(expected);
    }
  });

  it("toda conquista do Técnico tem nome e descrição", () => {
    const texts = COACH_TEXTS.pt.achievements as Readonly<Record<string, unknown>>;
    expect(TECNICO_ACHIEVEMENT_IDS.map((id) => id.replace(/^tecnico:/, "")).sort()).toEqual(Object.keys(texts).sort());
    expect(new Set(COACH_ACHIEVEMENTS.map((item) => item.id)).size).toBe(COACH_ACHIEVEMENTS.length);
  });
});

describe("nomes dos jogadores gerados", () => {
  it("lacunas dos elencos têm o mesmo nome em qualquer carreira; jovens da carreira dependem da semente", () => {
    const gap = { id: "g:goias:3", name: "", nationality: "BRA" as const };
    expect(coachPlayerName("a", gap)).toBe(coachPlayerName("b", gap));
    expect(coachPlayerName("a", gap).length).toBeGreaterThan(3);
    const youth = { id: "y:2026:0:goias:1", name: "", nationality: "BRA" as const };
    expect(coachPlayerName("a", youth)).toBe(coachPlayerName("a", youth));
    const real = { id: "fc:1", name: "Kylian Mbappé", nationality: "FRA" as const };
    expect(coachPlayerName("x", real)).toBe("Kylian Mbappé");
  });
});
