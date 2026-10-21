import { beforeAll, describe, expect, it } from "vitest";
import { createCareer, matchChance, matchScenes, playerClubImpact, resolveKeyMatch, stream, type Career, type KeyMatch } from "../src";
import { matchChanceCeiling } from "../src/career/drama";
import { debugPlayer } from "../src/debug";
import { pickMatchScene } from "../src/career/matchMoments";

let career: Career;
const match: KeyMatch = { competition: "brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 85, score: [2, 2], scene: "throughBall" };
beforeAll(() => { career = debugPlayer(createCareer({ seed: "d81", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "TESTE", nationality: "BRA", foot: "right", position: "st", dreamNumber: 9 } }), { age: 25, ovr: 75, position: "st", talent: "star", trait: "professional", loanOwner: null }); });

describe("D81: raridade e contexto da partida", () => {
  it("bicicleta é menos frequente que voleio e não vira obrigatória por repetição", () => {
    let bikes = 0, volleys = 0, exhausted = 0;
    const used = new Set(matchScenes("st", false).filter(scene => scene !== "bicycle"));
    for (let i = 0; i < 4000; i++) {
      const scene = pickMatchScene("st", false, new Set(), stream(`d81-${i}`, "drama"));
      bikes += Number(scene === "bicycle"); volleys += Number(scene === "volley");
      exhausted += Number(pickMatchScene("st", false, used, stream(`d81-${i}`, "drama")) === "bicycle");
    }
    expect(bikes).toBeGreaterThan(0); expect(bikes).toBeLessThan(volleys * 0.4);
    expect(exhausted).toBeGreaterThan(0); expect(exhausted).toBeLessThan(1000);
  });
  it("um erro com a liga empatada raramente conserva o empate e nunca fabrica gol próprio", () => {
    let draws = 0;
    for (let i = 0; i < 500; i++) {
      const result = resolveKeyMatch({ ...career, setup: { ...career.setup, seed: `d81-draw-${i}` } }, match, { id: "drama:bold", kind: "drama", action: "bold", chance: 0 });
      expect(result.success).toBe(false); expect(result.goals).toBe(0); expect(result.assists).toBe(0); expect(result.won).toBe(false); expect(result.penalties).toBeNull();
      expect([[2, 2], [2, 3]]).toContainEqual(result.score); draws += Number(result.score[0] === result.score[1]);
    }
    expect(draws).toBeGreaterThan(30); expect(draws).toBeLessThan(90);
  });
  it("mesmos atributos se beneficiam de uma liga abaixo do OVR e sofrem numa liga acima", () => {
    const at = (level: number) => ({ ...career, world: { ...career.world, strength: career.world.strength.map(() => level) } });
    for (const action of ["bold", "team", "safe"]) {
      const weak = matchChance(at(50), match, action), peer = matchChance(at(75), match, action), strong = matchChance(at(95), match, action);
      expect(weak).toBeGreaterThan(peer); expect(peer).toBeGreaterThan(strong);
      expect(weak).toBeLessThanOrEqual(matchChanceCeiling(career, match, action));
      expect(matchChance(at(50), { ...match, national: true }, action)).toBe(matchChance(at(95), { ...match, national: true }, action));
    }
    expect(matchChance(at(50), { ...match, scene: "decisivePenalty" }, "leave")).toBe(0.5);
  });
  it("aumenta a ajuda de um destaque fraco sem beneficiar elite ou reserva que não joga", () => {
    expect(playerClubImpact(60, 85, 1)).toBeCloseTo(7.1);
    expect(playerClubImpact(70, 97, 1)).toBeCloseTo(5.97);
    expect(playerClubImpact(80, 85, 1)).toBe(1.5);
    expect(playerClubImpact(60, 85, 0)).toBe(0);
  });
});
