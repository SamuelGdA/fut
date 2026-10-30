import { describe, expect, it } from "vitest";
import { choose, createCareer, EVENT_CATALOG, MAX_DECISIONS, policyChoice, type Career, type KeyMatchResult } from "../src";
import { ballonSpotlight, SPOTLIGHT } from "../src/awards/awards";
import { promisePending, windowDecision } from "../src/career/decisions";
import { YOUNG_BREAKOUT, youngBreakout } from "../src/evolution/breakthrough";
import { createPlayer, ovrAt } from "../src/player/player";
import { stream } from "../src/rng";
import { simulatePlayerSeason } from "../src/season/playerSeason";
import { createWorld } from "../src/world/season";

const keyMatch = (stage: KeyMatchResult["match"]["stage"], action: string, success: boolean, competition = "cont1:UEFA"): KeyMatchResult => ({
  match: { competition, team: "real-madrid", opponent: "bayern-munchen", national: competition === "worldcup", stage, minute: 80, score: [1, 1], scene: "breakaway" },
  action, success, won: success, score: success ? [2, 1] : [1, 2], penalties: null, goals: Number(success), assists: 0, fans: 0, legacy: 0, recognition: 0,
});

describe("D107: erro e jogo coletivo na Bola de Ouro", () => {
  it("o jogo coletivo que dá certo soma, bem menos que o lance de protagonista", () => {
    const team = ballonSpotlight([keyMatch("final", "team", true)]);
    const bold = ballonSpotlight([keyMatch("final", "bold", true)]);
    expect(team).toBeGreaterThan(0);
    expect(team).toBeLessThan(bold / 4);
    expect(ballonSpotlight([keyMatch("final", "safe", true)])).toBe(0);
  });

  it("errar tira um pouquinho, mais na fase final e na competição grande, e bem menos do que acertar dá", () => {
    for (const action of ["bold", "team", "safe", "left"]) expect(ballonSpotlight([keyMatch("league", action, false)])).toBeLessThan(0);
    const miss = (stage: KeyMatchResult["match"]["stage"], competition = "cont1:UEFA") => ballonSpotlight([keyMatch(stage, "bold", false, competition)]);
    expect(miss("final")).toBeLessThan(miss("semi"));
    expect(miss("semi")).toBeLessThan(miss("league"));
    expect(miss("final", "worldcup")).toBeLessThan(miss("final"));
    expect(miss("final")).toBeLessThan(miss("final", "cup:BRA"));
    expect(-miss("final", "worldcup")).toBeLessThan(ballonSpotlight([keyMatch("final", "bold", true, "worldcup")]) / 3);
    // Abrir mão do pênalti não é lance jogado; e o ano ruim tem piso.
    expect(ballonSpotlight([keyMatch("final", "leave", false)])).toBe(0);
    expect(ballonSpotlight(Array.from({ length: 30 }, () => keyMatch("final", "bold", false, "worldcup")))).toBe(SPOTLIGHT.min);
  });
});

describe("D107: homenagem com a opção de manter o número", () => {
  it("manter o número não muda a camisa nem traz pressão, e a torcida aplaude menos", () => {
    const event = EVENT_CATALOG.find((item) => item.id === "homage")!;
    const keep = event.options.find((option) => option.id === "keep")!;
    expect(keep.kind).toBe("safe");
    expect(keep.success).toEqual([{ kind: "fans", amount: 2 }]);
    const wear = event.options.find((option) => option.id === "number")!;
    expect(wear.success).toContainEqual({ kind: "pressure", amount: 0.1 });
  });
});

describe("D107: explosão jovem", () => {
  const base = { ...createPlayer({ seed: "explosao", position: "st", difficulty: "normal" }), capacity: 56, potential: 70 };

  it("leva de 50/60 a 70 e tantos, uma vez, com mais chance quanto mais novo", () => {
    const count = (age: number) => {
      let found = 0;
      for (let index = 0; index < 4000; index++) {
        const next = youngBreakout(base, age, stream(`explosao:${index}`, "growth", "youngBreakout", age));
        if (next === base) continue;
        found++;
        expect(ovrAt(next, age)).toBeGreaterThanOrEqual(Math.max(YOUNG_BREAKOUT.target[0], ovrAt(base, age) + YOUNG_BREAKOUT.minJump));
        expect(next.breakoutAge).toBe(age);
        expect(youngBreakout(next, age + 1, stream("de novo", "growth"))).toBe(next);
      }
      return found;
    };
    const young = count(18);
    const older = count(21);
    expect(young).toBeGreaterThan(older);
    expect(young).toBeGreaterThan(30);
    expect(young).toBeLessThan(120);
    expect(count(23)).toBe(0);
    const ready = { ...base, capacity: 75, potential: 85 };
    expect(ovrAt(ready, 19)).toBeGreaterThan(YOUNG_BREAKOUT.maxOvr);
    for (let index = 0; index < 500; index++) expect(youngBreakout(ready, 19, stream(`pronto:${index}`, "growth"))).toBe(ready);
  });

  it("vale na mesma temporada: o salto e a vaga de titular", () => {
    let seed = "";
    for (let index = 0; index < 20000 && !seed; index++) if (stream(`explode:${index}`, "growth", "youngBreakout", 2026).next() < YOUNG_BREAKOUT.chanceYoung) seed = `explode:${index}`;
    expect(seed).not.toBe("");
    const player = { ...createPlayer({ seed, position: "st", difficulty: "normal" }), capacity: 56, potential: 70 };
    const result = simulatePlayerSeason({ seed, world: createWorld(seed, 2026), player, age: 18, nationality: "BRA", club: "flamengo", difficulty: "normal", fans: 50, focus: null });
    expect(result.stats.breakout).toBe(true);
    expect(result.stats.ovrStart).toBeGreaterThanOrEqual(70);
    expect(["starter", "star"]).toContain(result.stats.role);
    expect(result.player.breakoutAge).toBe(18);
  });
});

describe("D107: promessa no ritmo Rápida", () => {
  it("a janela do meio do período não aposenta quem tem promessa em andamento", () => {
    let career: Career = createCareer({ seed: "d107-promessa", startYear: 2026, pace: "normal", difficulty: "normal", identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: null } });
    for (let guard = 0; guard < MAX_DECISIONS && career.decision && !(career.age >= 34 && career.contract); guard++) career = choose(career, policyChoice(career, "balanced")!).career;
    expect(career.age).toBeGreaterThanOrEqual(34);
    const year = career.world.year;
    const free = { ...career, decision: null, promise: undefined };
    expect(windowDecision(free).decision?.options.some((option) => option.kind === "retire")).toBe(true);
    const pending: Career = { ...free, promise: { year: year - 1, throughYear: year, level: "humble", metric: "contributions", target: 10 } };
    expect(promisePending(pending)).toBe(true);
    expect(windowDecision(pending).decision?.options.some((option) => option.kind === "retire")).toBe(false);
    expect(promisePending({ ...pending, promise: { ...pending.promise!, throughYear: year - 1 } })).toBe(false);
  });
});
