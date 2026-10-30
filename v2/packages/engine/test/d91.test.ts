import { describe, expect, it } from "vitest";
import { createCareer, createRng, type Career, type KeyMatch, type Position } from "../src";
import { BALLON_POSITION, ballonPositionPenalty } from "../src/awards/awards";
import { MATCH_FAN_LOSS, matchChance, matchFanLoss, resolveKeyMatch } from "../src/career/drama";
import { isCornerChoice, matchActionKind, pickMatchScene, RARE_SHOOTOUT } from "../src/career/matchMoments";

const setup = (seed: string, position: Position) => ({ seed, startYear: 2026, pace: "intense" as const, difficulty: "normal" as const, identity: { surname: "TESTE", nationality: "BRA", foot: "right" as const, position, dreamNumber: null } });
function player(seed: string, position: Position): Career {
  const career = createCareer(setup(seed, position));
  return { ...career, age: 27, player: { ...career.player, capacity: 80 } };
}
const cup = (scene: KeyMatch["scene"], kick?: number): KeyMatch => ({ competition: "cup:BRA", team: "flamengo", opponent: "palmeiras", national: false, stage: "quarter", minute: 120, score: [1, 1], scene, ...(kick ? { kick } : {}) });

describe("D91: Bola de Ouro mais difícil quanto mais atrás", () => {
  it("o desconto cresce do meio-campo ao zagueiro; atacante não perde nada", () => {
    const order: Position[] = ["st", "cm", "cdm", "lb", "cb"];
    const values = order.map((position) => BALLON_POSITION[position]);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
    expect(BALLON_POSITION.lb).toBe(BALLON_POSITION.rb);
    for (const position of ["st", "lw", "rw", "cam"] as const) expect(BALLON_POSITION[position]).toBe(0);
    const sample = { ovr: 90, cleanSheets: 10, success: { league: true, cup: false, primary: false, worldCup: false, nationsCup: false } };
    expect(ballonPositionPenalty({ ...sample, position: "cb" })).toBe(BALLON_POSITION.cb);
    // O goleiro segue com a regra própria, acima de todos.
    expect(ballonPositionPenalty({ ...sample, position: "gk" })).toBeGreaterThan(BALLON_POSITION.cb);
  });
});

describe("D91: disputas de pênaltis raras", () => {
  it("só no mata-mata: a série alternada chega ao defensor, e só falta o goleiro é mais raro ainda", () => {
    const count = (position: Position, knockout: boolean, scene: KeyMatch["scene"]) => {
      let hits = 0;
      for (let i = 0; i < 4000; i++) if (pickMatchScene(position, knockout, new Set(), createRng(`d91-${position}-${knockout}-${i}`)) === scene) hits++;
      return hits / 4000;
    };
    const defender = count("cb", true, "suddenDeath");
    const keeper = count("gk", true, "keeperShootout");
    expect(defender).toBeGreaterThan(RARE_SHOOTOUT.defenderChance * 0.6);
    expect(defender).toBeLessThan(RARE_SHOOTOUT.defenderChance * 1.5);
    expect(keeper).toBeGreaterThan(0);
    expect(keeper).toBeLessThan(defender);
    expect(count("cb", false, "suddenDeath")).toBe(0);
    expect(count("st", true, "suddenDeath")).toBe(0);
    expect(count("gk", false, "keeperShootout")).toBe(0);
  });

  it("as cobranças raras são de canto, valem como chute e o placar dos pênaltis mostra a cobrança", () => {
    for (const [position, scene, kick] of [["cb", "suddenDeath", 9], ["gk", "keeperShootout", 11]] as const) {
      const career = player(`d91-kick-${position}`, position);
      const match = cup(scene, kick);
      expect(isCornerChoice(scene)).toBe(true);
      expect(matchActionKind(position, match, "left")).toBe("shot");
      const left = matchChance(career, match, "left");
      expect(left).toBe(matchChance(career, match, "right"));
      expect(left).toBeGreaterThan(0);
      const won = resolveKeyMatch(career, match, { id: "drama:left", kind: "drama", action: "left", chance: 1 });
      const lost = resolveKeyMatch(career, match, { id: "drama:left", kind: "drama", action: "left", chance: 0 });
      expect(won.won).toBe(true);
      expect(won.penalties).toEqual([kick, kick - 1]);
      expect(won.goals).toBe(0);
      expect(lost.won).toBe(false);
      expect(lost.penalties).toEqual([kick - 1, kick]);
      expect(lost.score).toEqual(match.score);
    }
  });
});

describe("D91: goleiro que não defende o pênalti perde um pouco menos de torcida", () => {
  it("um a menos que o mesmo erro de outro lance", () => {
    const keeper = player("d91-fans", "gk");
    const save = matchFanLoss(keeper, { ...cup("penaltySave"), stage: "final" });
    const other = matchFanLoss(keeper, { ...cup("keeper"), stage: "final" });
    expect(save).toBe(other - MATCH_FAN_LOSS.keeperSave);
    // O goleiro que cobra (só falta você) não tem o alívio: é cobrança, não defesa.
    expect(matchFanLoss(keeper, { ...cup("keeperShootout", 11), stage: "final" })).toBe(other);
    const miss = resolveKeyMatch(keeper, { ...cup("penaltySave"), stage: "final" }, { id: "drama:left", kind: "drama", action: "left", chance: 0.5 });
    if (!miss.success) expect(miss.fans).toBe(-save);
  });
});
