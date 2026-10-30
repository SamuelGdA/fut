import { describe, expect, it } from "vitest";
import { challengeSetup, challengeStatus, createCareer, dailyHand, shiftChallengeDay, type KeyMatch, type SeasonRecord } from "../src";
import { recordStake } from "../src/career/drama";
import { CHALLENGE_RECORD_CHANCE, CHALLENGE_RECORDS, RECORD_POINTS, recordPoints } from "../src/challenge/records";

const final = (competition: string): KeyMatch => ({ competition, team: "real-madrid", opponent: "bayern", national: competition === "worldcup", stage: "final", minute: 86, score: [1, 1], scene: "counter" });

function history(titles: readonly string[][]): SeasonRecord[] {
  const record = { year: 2026, titles: [] as string[], games: 40, national: { games: 0, goals: 0 }, production: { goals: 0 } } as unknown as SeasonRecord;
  return titles.map((list, index) => ({ ...record, year: 2026 + index, titles: list }));
}

describe("D94: a final que vale recorde", () => {
  it("vencer a Champions iguala Gento com cinco antes e supera com seis (D94)", () => {
    expect(recordStake(history(Array.from({ length: 5 }, () => ["cont1:UEFA"])), final("cont1:UEFA"))).toMatchObject({ record: "championsLeague", goal: "match", mark: 6, after: 6 });
    expect(recordStake(history([["cont1:UEFA"], ["cont1:UEFA"], [], ["cont1:UEFA"], ["cont1:UEFA"], ["cont1:UEFA"], ["cont1:UEFA"]]), final("cont1:UEFA"))).toMatchObject({ record: "championsLeague", goal: "beat" });
  });
  it("a sequência de continentais e a Copa do Mundo também valem; quarta de final nunca", () => {
    expect(recordStake(history([["cont1:CONMEBOL"], ["cont1:CONMEBOL"], ["cont1:CONMEBOL"], ["cont1:CONMEBOL"]]), final("cont1:UEFA"))).toMatchObject({ record: "primaryStreak", goal: "match" });
    expect(recordStake(history([["worldcup"], ["worldcup"]]), final("worldcup"))).toMatchObject({ record: "worldCups", goal: "match", mark: 3 });
    expect(recordStake(history([["worldcup"], ["worldcup"]]), { ...final("worldcup"), stage: "semi" })).toBeNull();
    expect(recordStake(history([["cont1:UEFA"]]), final("cont1:UEFA"))).toBeNull();
  });
});

describe("D94: desafio do dia com recorde-alvo", () => {
  const days = Array.from({ length: 160 }, (_, index) => dailyHand(shiftChallengeDay("2026-10-27", index)));
  it("cerca de um em quatro dias é de recorde, e nesses todo mundo é Fenômeno", () => {
    const record = days.filter((hand) => hand.record);
    expect(record.length / days.length).toBeGreaterThan(CHALLENGE_RECORD_CHANCE - 0.1);
    expect(record.length / days.length).toBeLessThan(CHALLENGE_RECORD_CHANCE + 0.1);
    for (const hand of record) {
      expect(hand.talent).toBe("phenom");
      const setup = challengeSetup(hand, { surname: "TESTE", foot: "right", dreamNumber: null });
      expect(setup.talent).toBe("phenom");
      expect(createCareer(setup).player.talent).toBe("phenom");
      const catalog = CHALLENGE_RECORDS.find((item) => item.id === hand.record?.id);
      expect(catalog && (catalog.positions === "any" || catalog.positions.includes(hand.position))).toBe(true);
    }
    for (const hand of days.filter((item) => !item.record)) expect(challengeSetup(hand, { surname: "TESTE", foot: "right", dreamNumber: null }).talent).toBeUndefined();
  });
  it("perto rende, igualar e superar rendem mais, e a nota continua até 1000", () => {
    expect(recordPoints(0, 10)).toBe(0);
    expect(recordPoints(5, 10)).toBeLessThan(recordPoints(9, 10));
    expect(recordPoints(10, 10) - recordPoints(9.99, 10)).toBeGreaterThanOrEqual(RECORD_POINTS.match - 1);
    expect(recordPoints(11, 10)).toBe(RECORD_POINTS.near + RECORD_POINTS.match + RECORD_POINTS.beat);
    const hand = days.find((item) => item.record)!;
    const status = challengeStatus(hand, createCareer(challengeSetup(hand, { surname: "TESTE", foot: "right", dreamNumber: null })));
    expect(status.record).toMatchObject({ id: hand.record!.id, mark: hand.record!.mark });
    expect(status.total).toBeLessThanOrEqual(1000);
  });
});
