import { describe, expect, it } from "vitest";
import { attributesAt, autoplay, choose, createCareer, matchActionKind, matchScenes, MAX_DECISIONS, policyChoice, POSITIONS, replay, saveOf, type Career, type KeyMatch } from "../src";
import { matchOrder, promiseOptions, promiseReport } from "../src/career/drama";

const setup = (seed: string, pace: "normal" | "intense" = "normal") => ({ seed, startYear: 2026, pace, difficulty: "normal" as const, identity: { surname: "TESTE", foot: "right" as const, nationality: "BRA", position: "st" as const, dreamNumber: null } });
const match: KeyMatch = { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "breakaway" };

describe("D78: calendário e modo rápido", () => {
  it("final continental fica depois das outras partidas de clube e antes de toda seleção", () => {
    const continental = { ...match, competition: "cont1:UEFA", stage: "final" as const };
    const domestic = { ...match, competition: "cup:BRA", stage: "final" as const };
    const national = { ...match, competition: "worldcup", national: true, stage: "quarter" as const };
    expect([national, continental, domestic, match].sort((a,b) => matchOrder(a)-matchOrder(b))).toEqual([match, domestic, continental, national]);
    expect(matchOrder({ ...continental, competition: "cont1:CONMEBOL" })).toBe(matchOrder(continental));
  });

  it("a promessa rápida soma os dois anos, não premia o primeiro e liquida uma vez", () => {
    const finished = autoplay(createCareer(setup("d78-promise")), "balanced");
    const first = { ...finished.history[0]!, year: 2028, production: { ...finished.history[0]!.production, goals: 12, assists: 3 } };
    const second = { ...first, year: 2029, production: { ...first.production, goals: 3, assists: 4 } };
    const career: Career = { ...finished, history: [first], promise: { year: 2028, throughYear: 2029, level: "protagonist", metric: "contributions", target: 20 } };
    expect(promiseReport(career, first)).toBeUndefined();
    expect(promiseReport(career, second)).toMatchObject({ actual: 22, target: 20, fulfilled: true, fans: 5 });
    expect(promiseReport(career, { ...second, year: 2030 })).toBeUndefined();
    const options = promiseOptions({ ...career, age: 18, drama: { remaining: 2, startAge: 18, startAttributes: attributesAt(career.player, 18), event: null, traitor: false, prepared: false, queue: [], results: [], decisions: 1 } });
    expect(options[0]!.target).toBeGreaterThanOrEqual(20);
    expect(options.every(p => p.throughYear === p.year + 1)).toBe(true);
  });

  it("o replay rápido revela somente anos completos antes da próxima partida, com no máximo um lance por ano", () => {
    let total = 0, secondYear = 0;
    for (let seed = 0; seed < 6; seed++) {
      let career = createCareer(setup(`d78-fast-${seed}`));
      const counts = new Map<number, number>();
      for (let guard = 0; career.decision && guard < MAX_DECISIONS; guard++) {
        const decision = career.decision;
        if (decision.match) {
          total++;
          counts.set(decision.year, (counts.get(decision.year) ?? 0) + 1);
          expect(career.history.some(s => s.year === decision.year)).toBe(false);
          if (career.drama!.startAge < career.age) {
            secondYear++;
            expect(career.history.at(-1)?.year).toBe(decision.year - 1);
          }
        }
        const before = career;
        const step = choose(career, policyChoice(career, "ambitious")!);
        career = step.career;
        expect(step.notices.filter(n => n.kind === "season").map(n => n.year)).toEqual(career.history.slice(before.history.length).map(s => s.year));
        expect(career.history.every(s => s.year < (career.decision?.year ?? Infinity))).toBe(true);
      }
      expect(Math.max(...counts.values(), 0)).toBeLessThanOrEqual(1);
      for (const season of career.history) if (season.promise) {
        const report = season.promise;
        const production = career.history.filter(s => s.year >= report.year && s.year <= (report.throughYear ?? report.year));
        expect(report.actual).toBe(production.reduce((n,s) => n + s.production.goals + s.production.assists, 0));
      }
      if (seed === 0) expect(replay(saveOf(career))).toEqual(career);
    }
    expect(total).toBeGreaterThan(10); expect(secondYear).toBeGreaterThan(2);
  });

  it("53 contextos cobrem todas as posições e não transformam cobertura defensiva em assistência", () => {
    expect(new Set(POSITIONS.flatMap(p => matchScenes(p, true))).size).toBe(53);
    for (const position of POSITIONS) expect(matchScenes(position, false).length).toBeGreaterThanOrEqual(8);
    expect(matchActionKind("cb", { ...match, scene: "defensiveHeader" }, "team")).toBe("tackle");
    expect(matchActionKind("gk", { ...match, scene: "lowCross" }, "bold")).toBe("save");
    expect(matchActionKind("rb", { ...match, scene: "cutback" }, "bold")).toBe("pass");
  });
});
