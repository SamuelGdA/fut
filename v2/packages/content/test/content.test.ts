import {
  autoplay,
  type Career,
  type CareerSetup,
  choose,
  createCareer,
  type Effect,
  EVENT_CATALOG,
  futureGeneration,
  PLAYER,
  policyChoice,
} from "@craque/engine";
import { COUNTRIES, ELITE } from "@craque/world";
import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENT_TEXTS,
  CHALLENGE_TEXTS,
  CAREER_TEXTS,
  contenderName,
  COVER_ANGLES,
  COVER_TEXTS,
  type CoverAngle,
  effectTone,
  seasonCovers,
  COUNTRY_CULTURES,
  BIO_TEXTS,
  bioFacts,
  biography,
  CHAPTER_CAPS,
  careerHeadlines,
  displayName,
  HEADLINE_KEYS,
  HEADLINE_TEXTS,
  HEADLINES_MAX,
  THEME_IDS,
  THEMES,
  careerRecords,
  compareRecord,
  decisionText,
  REAL_RECORDS,
  RECORD_IDS,
  RECORD_TEXTS,
  recordsBeatenIn,
  recordText,
  describeEffect,
  EVENT_TEXTS,
  eventOutcomeText,
  FAMOUS_NAMES,
  generatedName,
  LOCALES,
  type Locale,
  NAME_POOLS,
  optionLabel,
  walkMessages,
} from "../src";

function entries(tree: unknown): Map<string, string> {
  return new Map([...walkMessages(tree)].map(({ key, value }) => [key, value]));
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? "").sort();
}

const DICTIONARIES = [
  ["carreira", CAREER_TEXTS],
  ["eventos", EVENT_TEXTS],
  ["capa", COVER_TEXTS],
  ["recordes", RECORD_TEXTS],
  ["manchetes", HEADLINE_TEXTS],
  ["biografia", BIO_TEXTS],
  ["conquistas", ACHIEVEMENT_TEXTS],
  ["desafio", CHALLENGE_TEXTS],
] as const;

describe("dicionários de conteúdo (GDD 35)", () => {
  for (const [name, texts] of DICTIONARIES) {
    const source = entries(texts.pt);

    it.each(LOCALES)(`${name}: %s tem exatamente as chaves do português`, (locale) => {
      expect([...entries(texts[locale]).keys()].sort()).toEqual([...source.keys()].sort());
    });

    it.each(LOCALES)(`${name}: %s usa os mesmos marcadores do português`, (locale) => {
      const mismatched = [...entries(texts[locale])]
        .filter(([key, value]) => placeholders(value).join() !== placeholders(source.get(key) ?? "").join())
        .map(([key]) => key);
      expect(mismatched).toEqual([]);
    });

    it.each(LOCALES)(`${name}: %s não tem travessão, texto vazio nem espaço sobrando`, (locale) => {
      const offenders = [...entries(texts[locale])]
        .filter(([, value]) => /[–—]/.test(value) || value.trim() !== value || value.length === 0)
        .map(([key]) => key);
      expect(offenders).toEqual([]);
    });
  }
});

describe("textos dos eventos contra o catálogo", () => {
  const eventTexts = EVENT_TEXTS.pt as Readonly<Record<string, { title: string; body: string; options: Record<string, Record<string, string>> }>>;

  it("cada evento do catálogo tem texto, e não sobra texto de evento que não existe", () => {
    expect(Object.keys(eventTexts).sort()).toEqual(EVENT_CATALOG.map((event) => event.id).sort());
  });

  it("cada opção tem rótulo e o resultado certo para o tipo: sucesso e fracasso nas arriscadas, resultado nas outras", () => {
    const problems: string[] = [];
    for (const event of EVENT_CATALOG) {
      const options = eventTexts[event.id]?.options ?? {};
      expect(Object.keys(options).sort(), event.id).toEqual(event.options.map((option) => option.id).sort());
      for (const option of event.options) {
        const text = options[option.id] ?? {};
        const expected = option.kind === "risky" ? ["failure", "label", "success"] : ["label", "result"];
        if (Object.keys(text).sort().join() !== expected.join()) problems.push(`${event.id}.${option.id}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("cada marcador usado tem de onde vir: destino, posição, país, número ou rival que a opção ou a condição garantem", () => {
    const problems: string[] = [];
    for (const event of EVENT_CATALOG) {
      const texts = eventTexts[event.id];
      if (!texts) continue;
      const conditions = JSON.stringify(event.when);
      const anyEffect = (kind: Effect["kind"]) =>
        event.options.some((option) => [...option.success, ...(option.failure ?? [])].some((effect) => effect.kind === kind));
      const allowed = (name: string, optionEffects: readonly Effect[] | null): boolean => {
        const has = (kind: Effect["kind"]) => (optionEffects ? optionEffects.some((effect) => effect.kind === kind) : anyEffect(kind));
        switch (name) {
          case "target":
            return has("transfer");
          case "position":
            return has("position");
          case "country":
            return has("nationality");
          case "number":
            return event.expand !== undefined;
          case "rival":
            return conditions.includes('"kind":"rival"');
          case "rivalClub":
            return conditions.includes("rivalClubInterested") || conditions.includes('"kind":"derby"');
          case "club":
            return true;
          default:
            return false;
        }
      };
      const bodyText = `${texts.title} ${texts.body}`;
      for (const name of placeholders(bodyText)) if (!allowed(name, null)) problems.push(`${event.id}.body:{${name}}`);
      for (const option of event.options) {
        const effects = [...option.success, ...(option.failure ?? [])];
        for (const value of Object.values(texts.options[option.id] ?? {})) {
          for (const name of placeholders(value)) if (!allowed(name, effects)) problems.push(`${event.id}.${option.id}:{${name}}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it.each(LOCALES)("%s descreve todo efeito do catálogo sem marcador sobrando", (locale) => {
    const target = {
      club: { club: "flamengo" } as never,
      position: "cm" as const,
      country: "ITA",
      number: 7,
    };
    for (const event of EVENT_CATALOG) {
      for (const option of event.options) {
        for (const effect of [...option.success, ...(option.failure ?? [])]) {
          const text = describeEffect(locale, effect, target);
          if (effect.kind === "story") {
            expect(text).toBeNull();
          } else {
            expect(text, `${event.id}.${option.id}.${effect.kind}`).toBeTruthy();
            expect(text).not.toMatch(/[{}]/);
          }
        }
      }
    }
  });
});

// ------------------------------------------------------------------ nomes

describe("nomes da geração futura (D13)", () => {
  const codes = new Set(COUNTRIES.map((country) => country.code));

  it("a tabela de culturas só usa países que existem", () => {
    expect(Object.keys(COUNTRY_CULTURES).filter((code) => !codes.has(code))).toEqual([]);
  });

  it("todo país da geração futura tem cultura própria na tabela", () => {
    const nations = new Set(futureGeneration("nomes").map((contender) => contender.nationality));
    expect([...nations].filter((code) => !COUNTRY_CULTURES[code])).toEqual([]);
  });

  it("o nome é fixo para a mesma pessoa e muda entre carreiras", () => {
    expect(generatedName("a|future:2015:3", "BRA")).toBe(generatedName("a|future:2015:3", "BRA"));
    const names = new Set(Array.from({ length: 40 }, (_, index) => generatedName(`semente-${index}|future:2015:3`, "BRA")));
    expect(names.size).toBeGreaterThan(30);
  });

  it("o nome sai da cultura do país", () => {
    const name = generatedName("x|future:2020:1", "JPN");
    const [first, last] = name.split(" ");
    expect(NAME_POOLS.japanese.first).toContain(first);
    expect(NAME_POOLS.japanese.last).toContain(last);
  });

  it("nenhum nome gerado é de jogador real conhecido", () => {
    const real = new Set([...ELITE.map((profile) => profile.name), ...FAMOUS_NAMES]);
    for (let seed = 0; seed < 60; seed += 1) {
      for (const contender of futureGeneration(`famosos-${seed}`)) {
        const name = contenderName({ seed: `famosos-${seed}`, id: contender.id, playerName: "" });
        expect(real.has(name ?? "")).toBe(false);
      }
    }
  });

  it("a lista de famosos só tem nomes que as listas conseguiriam formar", () => {
    const formable = (name: string) =>
      Object.values(NAME_POOLS).some((pool) =>
        pool.first.some((first) => name.startsWith(`${first} `) && (pool.last as readonly string[]).includes(name.slice(first.length + 1))),
      );
    expect([...FAMOUS_NAMES].filter((name) => !formable(name))).toEqual([]);
  });

  it("contenderName: o jogador, a elite real, a geração futura e o artilheiro de outro clube", () => {
    const real = ELITE[0];
    const future = futureGeneration("quem")[0];
    expect(contenderName({ seed: "quem", id: PLAYER, playerName: "SILVA" })).toBe("SILVA");
    expect(contenderName({ seed: "quem", id: real?.id ?? "", playerName: "" })).toBe(real?.name);
    expect(contenderName({ seed: "quem", id: future?.id ?? "", playerName: "" })).toMatch(/^\S.* \S/);
    expect(contenderName({ seed: "quem", id: "club:flamengo", playerName: "" })).toBeNull();
  });
});

// --------------------------------------------- carreiras inteiras, em texto

function setup(index: number): CareerSetup {
  const positions = ["st", "cm", "cb", "gk", "lw", "cam", "rb", "cdm"] as const;
  const nations = ["BRA", "ARG", "ENG", "JPN", "NGA", "ESP", "USA", "CRO"] as const;
  return {
    seed: `texto-${index}`,
    startYear: 2026,
    pace: index % 2 === 0 ? "intense" : "normal",
    difficulty: index % 3 === 0 ? "hard" : "normal",
    identity: {
      surname: "Teste",
      foot: "right",
      nationality: nations[index % nations.length] ?? "BRA",
      position: positions[index % positions.length] ?? "st",
      dreamNumber: 10,
    },
  };
}

function renderAll(locale: Locale, career: Career): string[] {
  const decision = career.decision;
  if (!decision) return [];
  const text = decisionText(locale, career, decision);
  const lines = [text.title, text.body];
  for (const option of decision.options) {
    lines.push(optionLabel(locale, career, decision, option));
    if (option.kind === "event" && decision.event) {
      lines.push(eventOutcomeText(locale, career, decision.event, option, option.chance === null ? null : true));
      if (option.chance !== null) lines.push(eventOutcomeText(locale, career, decision.event, option, false));
    }
  }
  return lines;
}

describe("uma carreira inteira contada nos três idiomas", () => {
  it("toda decisão, opção e resultado tem texto, sem marcador sobrando", () => {
    const seen = new Set<string>();
    for (let index = 0; index < 16; index += 1) {
      let career = createCareer(setup(index));
      for (let step = 0; step < 80 && career.decision; step += 1) {
        for (const locale of LOCALES) {
          for (const line of renderAll(locale, career)) {
            expect(line.length, `${career.decision.kind} ${career.decision.event ?? ""}`).toBeGreaterThan(0);
            expect(line, `${locale} ${career.decision.event ?? career.decision.kind}`).not.toMatch(/[{}]/);
          }
        }
        seen.add(career.decision.event ?? career.decision.kind);
        const choice = policyChoice(career, index % 2 === 0 ? "balanced" : "random");
        if (!choice) break;
        career = choose(career, choice).career;
      }
      expect(career.end).not.toBeNull();
    }
    // Tipos de decisão que qualquer lote razoável precisa ter passado.
    for (const kind of ["base", "window", "focus"]) expect(seen.has(kind)).toBe(true);
  });

  it("autoplay e os textos convivem com a mesma carreira", () => {
    const career = autoplay(createCareer(setup(99)), "ambitious");
    expect(career.end).not.toBeNull();
  });
});

// ------------------------------------------------------------- capa (GDD 21.2)

describe("capa do jornal", () => {
  const ALLOWED = new Set([
    "surname",
    "club",
    "league",
    "competition",
    "award",
    "year",
    "age",
    "rank",
    "count",
    "ovr",
    "goals",
    "assists",
    "cleanSheets",
    "gamesText",
    "goalsText",
    "assistsText",
    "cleanSheetsText",
    "productionText",
    "record",
    "holder",
    "mark",
    "value",
  ]);

  it("cada ângulo tem pelo menos cinco manchetes e três linhas de apoio nos três idiomas (GDD 21.2), e os jornais são oito", () => {
    for (const locale of LOCALES) {
      const texts = COVER_TEXTS[locale];
      expect(texts.papers).toHaveLength(8);
      expect(Object.keys(texts.angles).sort()).toEqual([...COVER_ANGLES].sort());
      for (const angle of COVER_ANGLES) {
        expect(texts.angles[angle].headlines.length, `${locale} ${angle}`).toBeGreaterThanOrEqual(5);
        expect(texts.angles[angle].support.length, `${locale} ${angle}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("números crus só onde o ângulo garante plural; o resto usa os textos com plural", () => {
    // Artilharia: 20+ gols; garçom: 10+ assistências; muralha: 15+ jogos sem sofrer; colecionador e
    // temporada perfeita: 3+ títulos; explosão: o OVR. Fora desses, número cru arrisca "1 jogos".
    const RAW: Readonly<Record<string, readonly string[]>> = {
      goals: ["scorer"],
      assists: ["playmaker"],
      cleanSheets: ["wall"],
      count: ["perfect", "collector"],
    };
    for (const [key, value] of entries(COVER_TEXTS.pt)) {
      const angle = key.split(".")[1] ?? "";
      for (const name of placeholders(value)) {
        const allowed = RAW[name];
        if (allowed) expect(allowed, `${key}: {${name}}`).toContain(angle);
      }
    }
  });

  it("nenhum nome de clube depois de artigo ou preposição com artigo (pt e es)", () => {
    const pattern = /\b(o|a|do|da|no|na|ao|pelo|pela|el|la|del|al|en el|en la)\s+\{(club|league|competition)\}/i;
    for (const locale of ["pt", "es"] as const) {
      for (const [key, value] of entries(COVER_TEXTS[locale])) expect(value, `${locale} ${key}`).not.toMatch(pattern);
    }
  });

  it("só usa marcadores que a capa preenche", () => {
    for (const [key, value] of entries(COVER_TEXTS.pt)) {
      for (const name of placeholders(value)) expect(ALLOWED.has(name), `${key}: {${name}}`).toBe(true);
    }
  });

  it("carreiras inteiras: toda temporada tem capa sem marcador sobrando, e a manchete não se repete de um ano para o outro", () => {
    const seen = new Set<CoverAngle>();
    for (let index = 0; index < 24; index += 1) {
      const career = autoplay(createCareer(setup(200 + index)), index % 3 === 0 ? "ambitious" : index % 3 === 1 ? "random" : "balanced");
      for (const locale of LOCALES) {
        const covers = seasonCovers(locale, career);
        expect(covers).toHaveLength(career.history.length);
        covers.forEach((cover, position) => {
          expect(cover.headline, `${locale} ${cover.angle}`).not.toMatch(/[{}]/);
          expect(cover.support).not.toMatch(/[{}]/);
          const previous = covers[position - 1];
          if (previous) {
            expect(cover.headline).not.toBe(previous.headline);
            expect(cover.support).not.toBe(previous.support);
          }
          seen.add(cover.angle);
        });
      }
    }
    // Ângulos comuns que um lote razoável precisa ter visto.
    for (const angle of ["newAddress", "steady", "nationalChampion", "forgotten"] as const) expect(seen.has(angle), angle).toBe(true);
  });

  it("tom dos efeitos: ganhos para cima, perdas para baixo, trocas neutras", () => {
    expect(effectTone({ kind: "capacity", amount: 1, when: "now" })).toBe("good");
    expect(effectTone({ kind: "fans", amount: -6 })).toBe("bad");
    expect(effectTone({ kind: "pressure", amount: 0.2 })).toBe("bad");
    expect(effectTone({ kind: "injury", scale: 0.5 })).toBe("good");
    expect(effectTone({ kind: "games", scale: 0.8 })).toBe("bad");
    expect(effectTone({ kind: "transfer", to: "offer" })).toBe("neutral");
    expect(effectTone({ kind: "final", result: "win" })).toBe("good");
  });
});

describe("recordes reais (GDD 26)", () => {
  /** Uma temporada fictícia, só com o que os recordes medem. */
  function season(year: number, overrides: { goals?: number; titles?: string[]; ballon?: boolean; caps?: number }): Career["history"][number] {
    const base = autoplay(createCareer(setup(900)), "balanced").history[0];
    if (!base) throw new Error("sem temporada");
    return {
      ...base,
      year,
      age: 16 + (year - 2026),
      games: 30,
      titles: overrides.titles ?? [],
      production: { ...base.production, goals: overrides.goals ?? 0 },
      national: { ...base.national, games: overrides.caps ?? 0, goals: 0 },
      awards: { ...base.awards, won: overrides.ballon ? ["ballonDor"] : [] },
    };
  }

  it("cada recorde tem texto nos três idiomas, valor positivo e só os ativos têm data", () => {
    expect(REAL_RECORDS.map((record) => record.id)).toEqual([...RECORD_IDS]);
    for (const record of REAL_RECORDS) {
      expect(record.value).toBeGreaterThan(0);
      for (const locale of LOCALES) {
        const text = recordText(locale, record);
        expect(text.name.length).toBeGreaterThan(3);
        expect(text.holder.length).toBeGreaterThan(3);
        expect(text.checked === null).toBe(record.asOf === null);
      }
    }
    expect(recordText("pt", REAL_RECORDS[0]!).checked).toBe("Conferido em setembro de 2026");
    expect(recordText("en", REAL_RECORDS[0]!).checked).toBe("Checked September 2026");
  });

  it("melhor temporada, soma e sequência medem do jeito certo", () => {
    const seasonGoals = REAL_RECORDS.find((record) => record.id === "seasonGoals")!;
    const history = [season(2026, { goals: 40 }), season(2027, { goals: 74 }), season(2028, { goals: 10 })];
    const result = compareRecord(seasonGoals, history);
    expect(result).toMatchObject({ value: 74, status: "beaten", reachedYear: 2027, beatenYear: 2027 });

    const streak = REAL_RECORDS.find((record) => record.id === "ballonStreak")!;
    const ballons = [2026, 2027, 2028, 2029, 2030].map((year) => season(year, { ballon: true }));
    expect(compareRecord(streak, ballons)).toMatchObject({ value: 5, status: "beaten", reachedYear: 2029, beatenYear: 2030 });
    const broken = [season(2026, { ballon: true }), season(2027, { ballon: true }), season(2028, {}), season(2029, { ballon: true })];
    expect(compareRecord(streak, broken).value).toBe(2);

    const libertadores = REAL_RECORDS.find((record) => record.id === "libertadores")!;
    const six = [2026, 2027, 2028, 2029, 2030, 2031].map((year) => season(year, { titles: ["cont1:CONMEBOL", "cont1:UEFA"] }));
    expect(compareRecord(libertadores, six)).toMatchObject({ value: 6, status: "matched", beatenYear: null });
  });

  it("o recorde passado numa temporada vira a capa dela, com a marca real e a do jogador", () => {
    const history = [season(2026, { goals: 30 }), season(2027, { goals: 80 })];
    expect(recordsBeatenIn(history, 0)).toEqual([]);
    expect(recordsBeatenIn(history, 1).map((result) => result.record.id)).toContain("seasonGoals");
  });

  it("uma carreira inteira se compara com todos os recordes sem quebrar", () => {
    const career = autoplay(createCareer(setup(901)), "ambitious");
    const results = careerRecords(career.history);
    expect(results).toHaveLength(RECORD_IDS.length);
    for (const result of results) expect(["beaten", "matched", "short"]).toContain(result.status);
  });
});

describe("manchetes da carreira (GDD 21.1)", () => {
  it("toda chave tem texto, e uma carreira inteira sai sem marcador sobrando, dentro do limite", () => {
    for (const locale of LOCALES) expect(Object.keys(HEADLINE_TEXTS[locale]).sort()).toEqual([...HEADLINE_KEYS].sort());
    for (let index = 0; index < 6; index += 1) {
      const career = autoplay(createCareer(setup(300 + index)), index % 2 ? "ambitious" : "balanced");
      for (const locale of LOCALES) {
        const headlines = careerHeadlines(locale, career);
        expect(headlines.length).toBeLessThanOrEqual(HEADLINES_MAX);
        for (const headline of headlines) {
          expect(headline.text, `${locale} ${headline.key}`).not.toMatch(/[{}]/);
          expect(career.history.some((record) => record.year === headline.year)).toBe(true);
        }
      }
      // Cada título do histórico vira uma manchete de título.
      const titles = career.history.reduce((total, record) => total + record.titles.length, 0);
      expect(careerHeadlines("pt", career).filter((headline) => headline.key === "title")).toHaveLength(titles);
    }
  });
});

describe("biografia (GDD 25)", () => {
  it("cada tema tem quatro redações em cada idioma, e não sobra texto de tema que não existe", () => {
    for (const locale of LOCALES) {
      const themes = BIO_TEXTS[locale].themes;
      expect(Object.keys(themes).sort()).toEqual([...THEME_IDS].sort());
      for (const id of THEME_IDS) expect(themes[id], `${locale} ${id}`).toHaveLength(4);
    }
  });

  it("carreiras inteiras nos três idiomas: capítulos no limite, sem marcador sobrando, um tema por grupo, nenhuma frase repetida", () => {
    const lengths: number[] = [];
    for (let index = 0; index < 30; index += 1) {
      const career = autoplay(createCareer(setup(400 + index)), (["ambitious", "balanced", "loyal", "random"] as const)[index % 4] ?? "balanced");
      for (const locale of LOCALES) {
        const bio = biography(locale, career);
        expect(bio.chapters.length, `${career.setup.seed} ${locale}`).toBeGreaterThanOrEqual(3);
        const lines = bio.chapters.flatMap((chapter) => chapter.lines);
        for (const chapter of bio.chapters) {
          expect(chapter.lines.length).toBeLessThanOrEqual(CHAPTER_CAPS[chapter.id]);
          expect(chapter.title.length).toBeGreaterThan(2);
        }
        for (const line of lines) {
          expect(line, `${locale}: ${line}`).not.toMatch(/[{}]/);
          expect(line, `${locale}: ${line}`).not.toMatch(/[–—]/);
          expect(line.charAt(0), line).toBe(line.charAt(0).toLocaleUpperCase(locale));
        }
        expect(new Set(lines).size).toBe(lines.length);
        const groups = bio.themes.map((id) => THEMES[id].group);
        expect(new Set(groups).size).toBe(groups.length);
        // O primeiro clube abre a história.
        expect(bio.themes[0]).toBe("firstClub");
        // "Os últimos capítulos" só para a passagem curta que fecha a carreira depois do auge.
        if (bio.themes.includes("lastClub")) {
          const facts = bioFacts(career);
          const last = facts.stints[facts.stints.length - 1];
          expect(last && facts.peak && last.fromAge > facts.peak.age && last.seasons * 2 < facts.totals.seasons).toBe(true);
        }
        lengths.push(lines.length);
      }
    }
    // Carreiras de verdade rendem um artigo, não um parágrafo.
    expect(Math.min(...lengths)).toBeGreaterThanOrEqual(7);
  });

  it("a mesma carreira conta a mesma história; o sobrenome sai em caixa de nome", () => {
    const career = autoplay(createCareer({ ...setup(450), identity: { ...setup(450).identity, surname: "DA SILVA-ÁVILA" } }), "ambitious");
    expect(biography("pt", career)).toEqual(biography("pt", career));
    expect(displayName("DA SILVA-ÁVILA", "pt")).toBe("Da Silva-Ávila");
    expect(displayName("O'NEILL", "en")).toBe("O'Neill");
    const text = biography("pt", career).chapters.flatMap((chapter) => chapter.lines).join(" ");
    expect(text).not.toContain("DA SILVA-ÁVILA");
  });
});
