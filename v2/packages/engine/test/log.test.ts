import { describe, expect, it } from "vitest";
import {
  autoplay,
  CAREER_POLICIES,
  type Career,
  type CareerLogEntry,
  type CareerSetup,
  createCareer,
  LOG_MAX,
  replay,
  retireNow,
  saveOf,
} from "../src";

/**
 * O diário da carreira (GDD 21.1, M6): a biografia, a linha do tempo e o
 * jornal leem daqui, então ele tem de bater com o histórico e sair igual do
 * replay.
 */

function setup(seed: string, overrides: Partial<CareerSetup> = {}): CareerSetup {
  return {
    seed,
    startYear: 2026,
    pace: "intense",
    difficulty: "normal",
    identity: { surname: "DIARIO", foot: "right", nationality: "BRA", position: "st", dreamNumber: null },
    ...overrides,
  };
}

function entries<K extends CareerLogEntry["kind"]>(career: Career, kind: K): Array<Extract<CareerLogEntry, { kind: K }>> {
  return career.log.filter((entry): entry is Extract<CareerLogEntry, { kind: K }> => entry.kind === kind);
}

const careers = CAREER_POLICIES.flatMap((policy) =>
  [0, 1, 2].map((index) => ({ policy, career: autoplay(createCareer(setup(`diario-${policy}-${index}`)), policy) })),
);

describe("diário da carreira", () => {
  it("começa vazio e termina com a aposentadoria, uma vez só", () => {
    expect(createCareer(setup("vazio")).log).toEqual([]);
    for (const { career } of careers) {
      const retired = entries(career, "retired");
      expect(retired).toHaveLength(1);
      expect(career.log[career.log.length - 1]?.kind).toBe("retired");
      expect(retired[0]?.reason).toBe(career.end?.reason);
      expect(retired[0]?.age).toBe(career.end?.age);
    }
  });

  it("cada troca de clube no histórico tem a transferência no diário, com a idade da temporada nova", () => {
    for (const { career } of careers) {
      const transfers = entries(career, "transfer");
      career.history.forEach((record, index) => {
        const previous = career.history[index - 1];
        if (previous && previous.club === record.club) return;
        const found = transfers.find((entry) => entry.to === record.club && entry.age === record.age);
        expect(found, `${career.setup.seed}: chegada a ${record.club} aos ${record.age}`).toBeDefined();
      });
      for (const entry of transfers) expect(entry.from).not.toBe(entry.to);
    }
  });

  it("idades e anos andam juntos e nunca voltam", () => {
    for (const { career } of careers) {
      let age = 0;
      for (const entry of career.log) {
        expect(entry.age).toBeGreaterThanOrEqual(age);
        expect(entry.year - entry.age).toBe(career.setup.startYear - 16);
        age = entry.age;
      }
    }
  });

  it("a primeira convocação bate com o que a carreira guarda", () => {
    for (const { career } of careers) {
      const cap = entries(career, "firstCap");
      expect(cap.length).toBe(career.firstCapAge === null ? 0 : 1);
      if (career.firstCapAge !== null) expect(cap[0]?.age).toBe(career.firstCapAge);
    }
  });

  it("eventos resolvidos aparecem com o mesmo resultado do histórico", () => {
    for (const { career } of careers) {
      const events = entries(career, "event");
      const recorded = career.history.flatMap((record) => (record.event ? [record.event] : []));
      expect(events.map(({ event, option, success }) => ({ id: event, option, success }))).toEqual(recorded);
    }
  });

  it("a oferta recusada registrada é a maior da decisão", () => {
    const refused = careers.flatMap(({ career }) => entries(career, "refused"));
    expect(refused.length).toBeGreaterThan(0);
    for (const entry of refused) {
      expect(entry.club).not.toBe(entry.chosen);
      expect(entry.strength).toBeGreaterThan(0);
    }
  });

  it("o replay refaz o diário igual, e encerrar pelo botão registra a aposentadoria voluntária", () => {
    for (const { career } of careers.slice(0, 4)) {
      expect(replay(saveOf(career)).log).toEqual(career.log);
    }
    const midway = autoplay(createCareer(setup("meio")), "balanced");
    const partial = replay({ ...saveOf(midway), choices: saveOf(midway).choices.slice(0, 5) });
    const quit = retireNow(partial);
    expect(quit.log[quit.log.length - 1]).toMatchObject({ kind: "retired", reason: "voluntary", age: partial.age });
    expect(replay(saveOf(quit)).log).toEqual(quit.log);
  });

  it("fica abaixo do teto numa carreira inteira", () => {
    for (const { career } of careers) expect(career.log.length).toBeLessThan(LOG_MAX);
  });
});
