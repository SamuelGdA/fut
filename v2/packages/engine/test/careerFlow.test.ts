import { getClub } from "@craque/world";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  autoplay,
  type Career,
  CAREER_POLICIES,
  CareerError,
  type CareerPolicy,
  type CareerSetup,
  choose,
  createCareer,
  ENGINE_VERSION,
  EVENT_CATALOG,
  FIRST_AGE,
  INJURY_TAG,
  LOAN,
  MAX_INJURY_EVENTS,
  ovrOf,
  parseSave,
  policyChoice,
  POSITIONS,
  RELEASE,
  replay,
  saveOf,
} from "../src";

/**
 * O laço de carreira (GDD 14) e os invariantes da seção 39 que dependem dele:
 * 5 (replay), 6 (toda decisão tem opção), 7 (toda carreira termina) e 24
 * (escolha velha recusada). Cada carreira custa uns 50 ms.
 */

const NATIONS = ["BRA", "ARG", "ESP", "ENG", "NGA", "JPN", "NZL", "AFG", "ISL"] as const;

function setupOf(seed: string, overrides: Partial<CareerSetup> = {}, identity: Partial<CareerSetup["identity"]> = {}): CareerSetup {
  return {
    seed,
    startYear: 2026,
    pace: "intense",
    difficulty: "normal",
    ...overrides,
    identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: 9, ...identity },
  };
}

/** Joga a carreira guardando cada carreira intermediária, para conferir o caminho. */
function walk(setup: CareerSetup, policy: CareerPolicy): Career[] {
  const steps = [createCareer(setup)];
  let career = steps[0] as Career;
  for (let guard = 0; guard < 100 && career.decision; guard += 1) {
    const choice = policyChoice(career, policy);
    if (!choice) break;
    career = choose(career, choice).career;
    steps.push(career);
  }
  return steps;
}

const setupArbitrary: fc.Arbitrary<{ setup: CareerSetup; policy: CareerPolicy }> = fc.record({
  setup: fc.record({
    seed: fc.string({ minLength: 1, maxLength: 12 }).filter((seed) => seed.trim().length > 0),
    startYear: fc.constant(2026),
    pace: fc.constantFrom("intense" as const, "normal" as const),
    difficulty: fc.constantFrom("normal" as const, "hard" as const),
    identity: fc.record({
      surname: fc.constant("TESTE"),
      foot: fc.constant("right" as const),
      nationality: fc.constantFrom(...NATIONS),
      position: fc.constantFrom(...POSITIONS),
      dreamNumber: fc.option(fc.integer({ min: 1, max: 99 }), { nil: null }),
    }),
  }),
  policy: fc.constantFrom(...CAREER_POLICIES),
});

const settings = { numRuns: 24, seed: 20261001 } as const;

describe("começo da carreira", () => {
  it("nasce aos 16, sem clube, com três bases para escolher", () => {
    for (const nationality of NATIONS) {
      for (const position of ["st", "gk", "cb"] as const) {
        const career = createCareer(setupOf(`base-${nationality}-${position}`, {}, { nationality, position }));
        expect(career.age).toBe(FIRST_AGE);
        expect(career.contract).toBeNull();
        expect(career.decision?.kind).toBe("base");
        expect(career.decision?.options).toHaveLength(3);
        expect(career.decision?.options.every((option) => option.kind === "club")).toBe(true);
      }
    }
  });

  it("a base é do país quando o país tem liga", () => {
    const career = createCareer(setupOf("base-pais", {}, { nationality: "ARG" }));
    const clubs = career.decision?.options.flatMap((option) => (option.kind === "club" ? [option.offer] : [])) ?? [];
    expect(clubs.length).toBe(3);
    expect(clubs.every((offer) => getClub(offer.club)?.country === "ARG")).toBe(true);
    expect(clubs.every((offer) => offer.mission === "academyBet")).toBe(true);
  });

  it("recusa setup que o motor não saberia jogar", () => {
    expect(() => createCareer(setupOf(" "))).toThrow(CareerError);
    expect(() => createCareer(setupOf("x", {}, { nationality: "XXX" }))).toThrow(CareerError);
    expect(() => createCareer(setupOf("x", {}, { dreamNumber: 0 }))).toThrow(CareerError);
  });
});

describe("invariantes do laço (GDD 39)", () => {
  it("6 e 7: toda decisão tem opção, e toda carreira termina entre 17 e 40 anos", () => {
    fc.assert(
      fc.property(setupArbitrary, ({ setup, policy }) => {
        const steps = walk(setup, policy);
        const last = steps[steps.length - 1] as Career;
        for (const career of steps) {
          const decision = career.decision;
          if (!decision) continue;
          if (decision.options.length === 0) return false;
          if (decision.kind !== "forced" && decision.options.length < 2) return false;
          if (new Set(decision.options.map((option) => option.id)).size !== decision.options.length) return false;
        }
        if (!last.end || last.decision) return false;
        return last.end.age >= FIRST_AGE + 1 && last.end.age <= 40;
      }),
      settings,
    );
  });

  it("5: o save refaz exatamente a mesma carreira", () => {
    fc.assert(
      fc.property(setupArbitrary, ({ setup, policy }) => {
        const career = autoplay(createCareer(setup), policy);
        const again = replay(parseSave(JSON.parse(JSON.stringify(saveOf(career)))));
        expect(again).toEqual(career);
        return true;
      }),
      { ...settings, numRuns: 10 },
    );
  });

  it("5: replay também no meio da carreira, e o resto segue igual", () => {
    const setup = setupOf("meio", { pace: "normal" }, { position: "cm" });
    const full = autoplay(createCareer(setup), "random");
    const half = { ...saveOf(full), choices: full.choices.slice(0, Math.floor(full.choices.length / 2)) };
    const resumed = autoplay(replay(half), "random");
    expect(resumed).toEqual(full);
  });

  it("24: escolha para outra decisão, opção inexistente e carreira encerrada são recusadas", () => {
    const career = createCareer(setupOf("recusas"));
    const decision = career.decision;
    if (!decision) throw new Error("sem decisão");
    const first = decision.options[0]?.id ?? "";
    expect(() => choose(career, { decision: decision.id + 1, option: first })).toThrow(expect.objectContaining({ code: "stale" }));
    expect(() => choose(career, { decision: decision.id, option: "nada" })).toThrow(expect.objectContaining({ code: "unknownOption" }));
    const next = choose(career, { decision: decision.id, option: first }).career;
    expect(() => choose(next, { decision: decision.id, option: first })).toThrow(expect.objectContaining({ code: "stale" }));
    const ended = autoplay(createCareer(setupOf("recusas-fim")), "balanced");
    expect(() => choose(ended, { decision: 1, option: "stay" })).toThrow(expect.objectContaining({ code: "ended" }));
  });

  it("escolher não muda a carreira de antes (imutável)", () => {
    const career = createCareer(setupOf("imutavel"));
    const snapshot = JSON.stringify(career);
    const choice = policyChoice(career, "balanced");
    if (!choice) throw new Error("sem escolha");
    choose(career, choice);
    expect(JSON.stringify(career)).toBe(snapshot);
  });

  it("save de outro motor não é refeito", () => {
    const career = createCareer(setupOf("versao"));
    expect(() => replay({ ...saveOf(career), engine: "2.0.0-m1" })).toThrow(expect.objectContaining({ code: "version" }));
    expect(() => parseSave({ v: 1, engine: ENGINE_VERSION, setup: {}, choices: [] })).toThrow(CareerError);
    expect(() => parseSave("lixo")).toThrow(CareerError);
  });
});

describe("o histórico", () => {
  it("uma temporada por idade, anos seguidos, sem buraco, e o OVR bate com os atributos", () => {
    fc.assert(
      fc.property(setupArbitrary, ({ setup, policy }) => {
        const career = autoplay(createCareer(setup), policy);
        const history = career.history;
        if (history.length !== (career.end?.age ?? 0) - FIRST_AGE) return false;
        return history.every(
          (season, index) =>
            season.age === FIRST_AGE + index &&
            season.year === setup.startYear + index &&
            season.ovrEnd === ovrOf(season.position, season.attributes) &&
            season.games <= season.clubGames &&
            season.fans >= 0 &&
            season.fans <= 100,
        );
      }),
      settings,
    );
  });
});

describe("eventos, empréstimos e clubes bloqueados", () => {
  const careers = CAREER_POLICIES.flatMap((policy, index) =>
    Array.from({ length: 6 }, (_, seed) =>
      walk(
        setupOf(`regras-${policy}-${seed}`, { pace: seed % 2 === 0 ? "intense" : "normal", difficulty: seed % 3 === 0 ? "hard" : "normal" }, {
          position: POSITIONS[(seed + index) % POSITIONS.length],
          nationality: NATIONS[(seed + index) % NATIONS.length],
        }),
        policy,
      ),
    ),
  );

  it("cada evento aparece no máximo uma vez, e lesões no máximo duas", () => {
    for (const steps of careers) {
      const last = steps[steps.length - 1] as Career;
      expect(new Set(last.eventsSeen).size).toBe(last.eventsSeen.length);
      const injuries = last.eventsSeen.filter((id) => EVENT_CATALOG.find((event) => event.id === id)?.tags.includes(INJURY_TAG));
      expect(injuries.length).toBeLessThanOrEqual(MAX_INJURY_EVENTS);
      expect(last.injuryEvents).toBe(injuries.length);
    }
  });

  it("evento só nas idades da agenda, com 2 ou mais opções e chance entre 5% e 95%", () => {
    for (const steps of careers) {
      for (const career of steps) {
        const decision = career.decision;
        if (decision?.kind !== "event") continue;
        expect(career.agenda).toContain(decision.age);
        expect(decision.options.length).toBeGreaterThanOrEqual(2);
        for (const option of decision.options) {
          if (option.kind === "event" && option.chance !== null) {
            expect(option.chance).toBeGreaterThanOrEqual(0.05);
            expect(option.chance).toBeLessThanOrEqual(0.95);
          }
        }
      }
    }
  });

  it("no máximo dois empréstimos, sempre entre 18 e 23 anos", () => {
    for (const steps of careers) {
      const last = steps[steps.length - 1] as Career;
      expect(last.loans).toBeLessThanOrEqual(LOAN.maxPerCareer);
      for (const career of steps) {
        if (career.decision?.kind === "loan") {
          expect(career.age).toBeGreaterThanOrEqual(LOAN.minAge);
          expect(career.age).toBeLessThanOrEqual(LOAN.maxAge);
        }
      }
    }
  });

  it("clube bloqueado nunca mais aparece numa oferta", () => {
    for (const steps of careers) {
      for (const career of steps) {
        const offered = career.decision?.options.flatMap((option) => {
          if (option.kind === "club") return [option.offer.club];
          if (option.kind === "event" && option.target?.club) return [option.target.club.club];
          return [];
        });
        for (const club of offered ?? []) expect(career.blocked).not.toContain(club);
      }
    }
  });

  it("aposentar só aparece a partir dos 33 (32 na dispensa), salvo sem mercado", () => {
    for (const steps of careers) {
      for (const career of steps) {
        const decision = career.decision;
        if (!decision?.options.some((option) => option.kind === "retire")) continue;
        if (decision.kind === "forced") continue;
        expect(career.age).toBeGreaterThanOrEqual(decision.kind === "release" ? 32 : 33);
      }
    }
  });

  it("dispensa só a partir da idade da dificuldade", () => {
    for (const steps of careers) {
      for (const career of steps) {
        if (career.decision?.kind === "release") expect(career.age).toBeGreaterThanOrEqual(RELEASE[career.setup.difficulty].age);
      }
    }
  });

  it("a volta de empréstimo vem na idade combinada", () => {
    for (const steps of careers) {
      for (const career of steps) {
        if (career.decision?.kind !== "return") continue;
        expect(career.contract?.loan).not.toBeNull();
        expect(career.age).toBeGreaterThanOrEqual(career.contract?.loan?.untilAge ?? Number.POSITIVE_INFINITY);
      }
    }
  });

  it("o ritmo Intensa tem mais eventos que o Normal", () => {
    const events = (pace: "intense" | "normal") =>
      Array.from({ length: 12 }, (_, seed) => autoplay(createCareer(setupOf(`ritmo-${seed}`, { pace })), "balanced").eventsSeen.length);
    const mean = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length;
    expect(mean(events("intense"))).toBeGreaterThan(mean(events("normal")));
  });
});
