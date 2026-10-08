import { describe, expect, it } from "vitest";
import {
  ageDecline,
  ageRate,
  attributesAt,
  capSeasonGain,
  coachFactor,
  createRng,
  drawSeasonForm,
  evolveSeason,
  explosionChance,
  FOCUS_SLOT,
  focusesFor,
  gapDrive,
  GROWTH,
  guaranteeFocus,
  minutesFactor,
  overallLevel,
  type Player,
  settleTraining,
  softCeiling,
  titleMorale,
  trainFocus,
  TRAINING_CAP,
} from "../src";

function player(overrides: Partial<Player> = {}): Player {
  return {
    position: "st",
    talent: "star",
    potential: 90,
    capacity: 60,
    prodigy: false,
    maturity: "normal",
    peakAge: 26.5,
    longevity: 0,
    trait: "professional",
    dna: [0, 0, 0, 0, 0, 0],
    training: [0, 0, 0, 0, 0, 0],
    ...overrides,
  };
}

/** Congela fundo: qualquer tentativa de mutação lança erro em módulo estrito. */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    for (const inner of Object.values(value)) deepFreeze(inner);
    Object.freeze(value);
  }
  return value;
}

const season = {
  age: 19,
  games: 36,
  clubStrength: 72,
  fans: 60,
  difficulty: "normal",
  titleImportance: 0,
  focus: null,
} as const;

describe("teto suave", () => {
  it("passa intacto até o joelho e nunca alcança o teto", () => {
    expect(softCeiling(3, 4, 7)).toBe(3);
    expect(softCeiling(4, 4, 7)).toBe(4);
    let previous = 4;
    for (const raw of [5, 8, 12, 20, 60, 500]) {
      const value = softCeiling(raw, 4, 7);
      expect(value).toBeGreaterThan(previous);
      expect(value).toBeLessThan(7);
      previous = value;
    }
  });

  it("nenhuma temporada soma mais que o teto biológico em L", () => {
    expect(capSeasonGain(1000)).toBeLessThan(GROWTH.ceiling);
    expect(capSeasonGain(-3)).toBe(0);
  });
});

describe("fatores do crescimento (GDD 10.1)", () => {
  it("jovem aprende mais rápido que veterano", () => {
    expect(ageRate(17, 27)).toBeGreaterThan(ageRate(22, 27));
    expect(ageRate(22, 27)).toBeGreaterThan(ageRate(29, 27));
    expect(ageRate(16, 27)).toBeLessThanOrEqual(1);
  });

  it("a folga satura: longe do teto anda rápido, perto anda devagar", () => {
    expect(gapDrive(50, 90)).toBeGreaterThan(gapDrive(80, 90));
    expect(gapDrive(80, 90)).toBeGreaterThan(gapDrive(90, 90));
    expect(gapDrive(95, 90)).toBeGreaterThan(0);
    expect(gapDrive(20, 90)).toBeLessThan(1);
  });

  it("jogar mais e treinador melhor ajudam, com limites", () => {
    expect(minutesFactor(0)).toBe(GROWTH.benchFactor);
    expect(minutesFactor(34)).toBe(1);
    expect(minutesFactor(60)).toBe(1);
    expect(coachFactor(40)).toBe(GROWTH.coachMin);
    expect(coachFactor(95)).toBe(GROWTH.coachMax);
  });

  it("moral de título tem teto e para acima de P + 1 (GDD 10.4)", () => {
    expect(titleMorale(0, 70, 90)).toBe(0);
    expect(titleMorale(1, 70, 90)).toBeCloseTo(0.25);
    expect(titleMorale(20, 70, 90)).toBe(1.2);
    expect(titleMorale(3, 91, 90)).toBe(0);
  });
});

describe("declínio (GDD 10.3)", () => {
  it("é zero até alguns anos depois do pico e cresce com a idade", () => {
    const veteran = player({ peakAge: 27 });
    expect(ageDecline(veteran, 27, "normal")).toBe(0);
    expect(ageDecline(veteran, 29, "normal")).toBe(0);
    let previous = 0;
    for (let age = 30; age <= 39; age += 1) {
      const loss = ageDecline(veteran, age, "normal");
      expect(loss).toBeGreaterThanOrEqual(previous);
      previous = loss;
    }
  });

  it("Profissional envelhece melhor, Difícil pior, e zagueiro e goleiro têm carência", () => {
    const base = player({ trait: "competitor", peakAge: 27 });
    expect(ageDecline(player({ peakAge: 27 }), 33, "normal")).toBeLessThan(ageDecline(base, 33, "normal"));
    expect(ageDecline(base, 33, "hard")).toBeGreaterThan(ageDecline(base, 33, "normal"));
    expect(ageDecline({ ...base, position: "gk" }, 33, "normal")).toBeLessThan(ageDecline(base, 33, "normal"));
  });
});

describe("forma da temporada (GDD 10.2)", () => {
  it("ninguém explode com menos de 20 jogos, e a chance cai com a idade", () => {
    expect(explosionChance(18, 19)).toBe(0);
    expect(explosionChance(18, 30)).toBeGreaterThan(explosionChance(24, 30));
    expect(explosionChance(24, 30)).toBeGreaterThan(explosionChance(30, 30));
  });

  it("consome sempre exatamente dois sorteios", () => {
    for (const seed of ["a", "b", "c", "d", "e"]) {
      const used = createRng(seed);
      drawSeasonForm(used, 18, 40);
      const fresh = createRng(seed);
      fresh.next();
      fresh.next();
      expect(used.next()).toBe(fresh.next());
    }
  });
});

describe("treino (GDD 10.5)", () => {
  it("cada foco treina um atributo só: +2 nele, nada nos outros, e para em +8 (D42)", () => {
    let training = player().training;
    training = trainFocus(training, "finishing");
    expect(training[FOCUS_SLOT.finishing]).toBe(2);
    expect(training.reduce((sum, value) => sum + value, 0)).toBe(2);
    for (let index = 0; index < 10; index += 1) training = trainFocus(training, "finishing");
    expect(Math.max(...training)).toBe(TRAINING_CAP);
  });

  it("os seis focos de cada linha cobrem os seis atributos da carta", () => {
    for (const position of ["st", "gk"] as const) {
      const slots = focusesFor(position).map((focus) => FOCUS_SLOT[focus]);
      expect([...slots].sort()).toEqual([0, 1, 2, 3, 4, 5]);
    }
  });

  it("abaixo do teto acelera, no teto especializa sem passar do potencial", () => {
    const young = player({ capacity: 60 });
    const trained = settleTraining(young, trainFocus(young.training, "finishing"));
    expect(trained.capacity).toBe(young.capacity);
    expect(overallLevel(trained)).toBeGreaterThan(overallLevel(young));

    const atCeiling = player({ capacity: 90 });
    const specialised = settleTraining(atCeiling, trainFocus(atCeiling.training, "finishing"));
    expect(overallLevel(specialised)).toBeCloseTo(atCeiling.potential, 9);
    expect(specialised.capacity).toBeLessThan(atCeiling.capacity);
    expect(attributesAt(specialised, 28)[1]).toBeGreaterThan(attributesAt(atCeiling, 28)[1]);
  });

  it("a garantia deixa o atributo treinado pelo menos 2 acima do início, mesmo com o declínio", () => {
    const veteran = player({ capacity: 84, potential: 86, peakAge: 26, trait: "competitor" });
    const start = attributesAt(veteran, 33);
    const aged = { ...veteran, capacity: veteran.capacity - 3 };
    const kept = guaranteeFocus(aged, "finishing", start, 34);
    const end = attributesAt(kept, 34);
    expect(end[FOCUS_SLOT.finishing]).toBeGreaterThanOrEqual(start[FOCUS_SLOT.finishing] + 2);
    // Os outros atributos podem cair numa temporada ruim: só o treinado é garantido.
    expect(end[FOCUS_SLOT.vision]).toBeLessThan(start[FOCUS_SLOT.vision]);
  });
});

describe("um passo de evolução", () => {
  it("é puro: não muda a entrada e repete o resultado com a mesma semente", () => {
    const input = deepFreeze(player());
    const first = evolveSeason(input, { ...season, focus: "finishing" }, createRng("passo"));
    const second = evolveSeason(input, { ...season, focus: "finishing" }, createRng("passo"));
    expect(first).toEqual(second);
    expect(first.player).not.toBe(input);
    expect(input.capacity).toBe(60);
  });

  it("mais jogos rendem mais crescimento, com a mesma sorte", () => {
    const bench = evolveSeason(player(), { ...season, games: 4 }, createRng("jogos"));
    const starter = evolveSeason(player(), { ...season, games: 40 }, createRng("jogos"));
    expect(starter.report.gain).toBeGreaterThan(bench.report.gain);
  });

  it("foco de goleiro em jogador de linha é ignorado", () => {
    const result = evolveSeason(player(), { ...season, focus: "reflexes" }, createRng("foco"));
    expect(result.player.training).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
