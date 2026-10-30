import { describe, expect, it } from "vitest";
import { choose, createCareer, decideAwards, MAX_DECISIONS, PLAYER, policyChoice, type Career, type Decision, type KeyMatch, type Position } from "../src";
import { BALLON, ballonPositionPenalty } from "../src/awards/awards";
import { MATCH_FAN_LOSS, matchFanLoss, resolveKeyMatch } from "../src/career/drama";
import { legacyLevel, LEGACY_BAR } from "../src/career/fans";
import { famedMarketValue, baseMarketValue } from "../src/player/value";
import { applyEffects } from "../src/career/effects";
import { widenedClubs } from "../src/career/market";
import { marketContext } from "../src/career/context";

const setup = (seed: string, position: Position = "st") => ({ seed, startYear: 2026, pace: "intense" as const, difficulty: "normal" as const, identity: { surname: "TESTE", nationality: "BRA", foot: "right" as const, position, dreamNumber: null } });
function player(seed: string): Career {
  const career = createCareer(setup(seed));
  const next = choose(career, { decision: career.decision!.id, option: career.decision!.options[0]!.id }).career;
  return { ...next, age: 27, player: { ...next.player, capacity: 80 } };
}
function play(seed: string, position: Position): Decision[] {
  let career = createCareer(setup(seed, position));
  const decisions: Decision[] = [];
  for (let guard = 0; guard < MAX_DECISIONS && career.decision; guard++) {
    decisions.push(career.decision);
    const choice = policyChoice(career, "ambitious");
    if (!choice) break;
    career = choose(career, choice).career;
  }
  return decisions;
}
const match = (competition: string, stage: KeyMatch["stage"], national = false): KeyMatch => ({ competition, team: national ? "BRA" : "flamengo", opponent: national ? "ARG" : "palmeiras", national, stage, minute: 86, score: [1, 1], scene: "counter" });

describe("D90: erro custa torcida pela competição e pela fase", () => {
  it("vai de 1 a 10 e cresce com o peso e a fase", () => {
    const career = player("d90-fans");
    expect(matchFanLoss(career, match("league:brasileirao-serie-b", "league"))).toBe(MATCH_FAN_LOSS.min);
    expect(matchFanLoss(career, match("worldcup", "final", true))).toBe(MATCH_FAN_LOSS.max);
    const steps = (["quarter", "semi", "final"] as const).map((stage) => matchFanLoss(career, match("cont1:CONMEBOL", stage)));
    expect(steps[0]).toBeLessThan(steps[1]!);
    expect(steps[1]).toBeLessThan(steps[2]!);
    expect(matchFanLoss(career, match("cup:BRA", "final"))).toBeLessThan(steps[2]!);
  });
  it("todo lance jogado e errado cobra; só o pênalti deixado ao companheiro não", () => {
    const career = player("d90-fail");
    for (const action of ["bold", "team", "safe"]) {
      const result = resolveKeyMatch(career, match("cont1:CONMEBOL", "final"), { id: `drama:${action}`, kind: "drama", action, chance: 0 });
      expect(result.fans).toBe(-matchFanLoss(career, match("cont1:CONMEBOL", "final")));
    }
    const leave = resolveKeyMatch(career, { ...match("cup:BRA", "final"), scene: "decisivePenalty" }, { id: "drama:leave", kind: "drama", action: "leave", chance: 0 });
    expect(leave.fans).toBe(0);
  });
  it("lenda do clube perde metade a partir de -2", () => {
    const career = player("d90-legend");
    const club = career.contract!.club;
    const legend: Career = { ...career, bonds: { ...career.bonds, [club]: { ...career.bonds[club]!, legacyPoints: 1000, seasons: 12 } }, history: career.history.map((record) => ({ ...record, club, games: 400 })) };
    const final = match("worldcup", "final", true);
    expect(matchFanLoss(legend, final)).toBe(Math.ceil(matchFanLoss(career, final) / 2));
    expect(matchFanLoss(legend, match("league:brasileirao-serie-b", "league"))).toBe(1);
  });
});

describe("D90: ano com decisão principal e até cinco decisões", () => {
  it("todo ano abre com uma decisão principal e tem no máximo quatro partidas", () => {
    let four = 0;
    for (let i = 0; i < 16; i++) {
      const decisions = play(`d90-year-${i}`, i % 2 ? "cam" : "st");
      const years = new Map<number, Decision[]>();
      for (const decision of decisions) years.set(decision.year, [...(years.get(decision.year) ?? []), decision]);
      for (const list of years.values()) {
        expect(list[0]?.kind).not.toBe("match");
        const matches = list.filter((decision) => decision.kind === "match").length;
        expect(matches).toBeLessThanOrEqual(4);
        expect(list.length).toBeLessThanOrEqual(5);
        if (matches === 4) four++;
      }
    }
    expect(four).toBeGreaterThan(0);
  });
});

describe("D90: craque de elite recebe propostas de mais clubes", () => {
  it("acima do clube mais forte do mundo, a faixa alcança os grandes perto do topo", () => {
    const career = player("d90-elite");
    const context = { ...marketContext(career), level: 104, ovr: 97 };
    const top = Math.max(...context.world.strength);
    const pool = widenedClubs(context, 2);
    expect(pool.length).toBeGreaterThanOrEqual(8);
    expect(pool.every((index) => (context.world.strength[index] ?? 0) >= top - 8)).toBe(true);
  });
});

describe("D90: lenda e ídolo mais exigentes", () => {
  it("as barras subiram", () => {
    expect(LEGACY_BAR.legend.seasons).toBe(5);
    expect(legacyLevel(1000, 4, 1, 500)).toBe("idol");
    expect(legacyLevel(1000, 5, 1, 139)).toBe("idol");
    expect(legacyLevel(1000, 5, 1, 140)).toBe("legend");
    expect(legacyLevel(1000, 1, 1, 500)).toBe("respected");
  });
});

describe("D90: contrato de chuteira dá mídia", () => {
  it("topar a campanha sobe o valor 8% sem passar do teto da idade", () => {
    const career = player("d90-boot");
    const applied = applyEffects(career, [{ kind: "fame", amount: 0.08 }], null, []).career;
    expect(applied.fame).toBeCloseTo(0.08);
    expect(famedMarketValue(80, 26, 80, applied.fame)).toBeCloseTo(baseMarketValue(80, 26, 80) * 1.08);
    expect(famedMarketValue(99, 26, 90, 0.5)).toBeLessThanOrEqual(baseMarketValue(99, 26, 90) * 1.5);
  });
});

describe("D90: goleiro na Bola de Ouro e Troféu Yashin", () => {
  const keeper = { eligible: true, position: "gk" as const, ovr: 96, age: 28, games: 55, goals: 0, assists: 0, leagueGoals: 0, cleanSheets: 30, playsInUefa: true, success: { league: true, cup: true, primary: true, worldCup: false, nationsCup: false }, crownEntries: [] };
  it("o desconto é grande e só alivia numa temporada histórica", () => {
    expect(ballonPositionPenalty({ ...keeper, success: { ...keeper.success, primary: false } })).toBe(BALLON.keeperPenalty);
    expect(ballonPositionPenalty(keeper)).toBe(BALLON.keeperPenalty - BALLON.keeperRelief);
    expect(ballonPositionPenalty({ ...keeper, position: "st" })).toBe(0);
  });
  it("goleiro que ganha a Bola de Ouro leva o Troféu Yashin junto", () => {
    let ballons = 0;
    for (let year = 2030; year < 2230; year++) {
      const outcome = decideAwards(`d90-gk-${year}`, year, {}, { ...keeper, bonus: 25 }, false);
      if (outcome.ballonDor.winner === PLAYER) {
        ballons++;
        expect(outcome.goldenGlove.winner).toBe(PLAYER);
      }
    }
    expect(ballons).toBeGreaterThan(0);
  });
});
