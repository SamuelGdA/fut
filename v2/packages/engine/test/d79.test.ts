import { describe, expect, it } from "vitest";
import { attributesAt, choose, createCareer, EVENT_CATALOG, policyChoice, type Career, type KeyMatch, type Position } from "../src";
import { matchChance, matchChanceCeiling, veteranDue } from "../src/career/drama";
import { matchSkillWeights } from "../src/career/matchMoments";

const setup = (seed: string, position: Position = "st") => ({ seed, startYear: 2026, pace: "intense" as const, difficulty: "normal" as const, identity: { surname: "TESTE", nationality: "BRA", foot: "right" as const, position, dreamNumber: null } });
const match: KeyMatch = { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "counter" };
function player(seed: string, position: Position = "st"): Career {
  const career = createCareer(setup(seed, position));
  return { ...career, age: 27, player: { ...career.player, capacity: 75 } };
}
describe("D79: chances ligadas à ação, com limites reproduzíveis", () => {
  it("sorteia os tetos por aparição e nunca permite ultrapassá-los, nem com arquétipo", () => {
    const ceilings = new Set<number>();
    for (let i = 0; i < 80; i++) {
      const base = player(`d79-cap-${i}`);
      const career = { ...base, player: { ...base.player, capacity: 110 }, veteran: "poacher" as const };
      for (const action of ["bold", "team", "safe"]) {
        const cap = matchChanceCeiling(career, match, action);
        expect(cap).toBeGreaterThanOrEqual(0.7);
        expect(cap).toBeLessThanOrEqual(action === "bold" ? 0.7 : action === "team" ? 0.8 : 0.9);
        expect(matchChance(career, match, action)).toBeLessThanOrEqual(cap);
        expect(matchChance(career, match, action)).toBe(matchChance(career, match, action));
        if (action === "team") ceilings.add(cap);
      }
    }
    expect(ceilings.size).toBeGreaterThan(5);
  });
  it("passe pesa no passe, arrancada em ritmo e finalização, corte em defesa", () => {
    const career = player("d79-attributes");
    for (const [scene, action, relevant, irrelevant] of [["throughBall", "bold", 2, 4], ["counter", "bold", 0, 2], ["counter", "bold", 1, 4], ["interception", "bold", 4, 2]] as const) {
      const improve = (slot: number): Career => ({ ...career, player: { ...career.player, training: career.player.training.map((v, i) => v + (i === slot ? 8 : 0)) as unknown as typeof career.player.training } });
      expect(matchChance(improve(relevant), { ...match, scene }, action)).toBeGreaterThan(matchChance(improve(irrelevant), { ...match, scene }, action));
      expect(matchSkillWeights("st", { ...match, scene }, action).reduce((a,b) => a+b,0)).toBeCloseTo(1);
    }
  });
  it("gol olímpico é raro mesmo com técnica máxima; cobrar curto não cria assistência", () => {
    const career = player("d79-corner", "cm");
    expect(matchChance({ ...career, player: { ...career.player, capacity: 110 } }, { ...match, scene: "corner" }, "bold")).toBeLessThanOrEqual(0.08);
    expect(matchSkillWeights("cm", { ...match, scene: "corner" }, "bold")[2]).toBe(0.75);
  });
  it("especialista melhora todas as defesas de pênalti, sem ultrapassar 45%", () => {
    const career = player("d79-gk", "gk");
    for (const scene of ["penaltySave", "shootout"] as const) for (const action of ["left", "right"]) {
      const base = matchChance(career, { ...match, scene }, action);
      const trained = matchChance({ ...career, veteran: "poacher" }, { ...match, scene }, action);
      expect(trained).toBeGreaterThan(base); expect(trained).toBeLessThanOrEqual(0.45);
      expect(trained).toBe(matchChance({ ...career, veteran: "poacher" }, { ...match, scene }, action === "left" ? "right" : "left"));
    }
  });
});
describe("D79: catálogo e envelhecimento", () => {
  it("não agenda mais treino de bairro nem pênalti como acontecimento", () => {
    expect(EVENT_CATALOG.map(e=>e.id)).not.toContain("communityClinic");
    expect(EVENT_CATALOG.map(e=>e.id)).not.toContain("decisivePenalty");
  });
  it("reinvenção exige perda forte aos 33+, mas parte das carreiras não recebe convite", () => {
    let invitations = 0;
    for (let i=0;i<100;i++) {
      const base=player(`d79-veteran-${i}`);
      const career={...base, age:37, player:{...base.player, peakAge:27, longevity:0}};
      const eligible=veteranDue(career);
      if(eligible) invitations++;
      expect(veteranDue({...career,age:29})).toBe(false);
      expect(veteranDue({...career,veteran:"maestro"})).toBe(false);
      if(eligible) expect(attributesAt(career.player,35)).not.toEqual(attributesAt(career.player,37));
    }
    expect(invitations).toBeGreaterThan(20);expect(invitations).toBeLessThan(70);
  });
  it("pênalti convertido conserva as duas alternativas e torcida +8/-6 ou neutra", () => {
    const base=player("d79-decisive");
    const game={...match,scene:"decisivePenalty" as const,competition:"cup:BRA",stage:"final" as const};
    // Isola o momento para verificar consequências, sem alterar resultados de carreira.
    for(const action of ["take","leave"]) for(const chance of [0,1]) {
      const career:Career={...base, drama:{remaining:1,startAge:base.age,startAttributes:attributesAt(base.player,base.age),event:null,traitor:false,prepared:true,queue:[game],results:[],decisions:1},decision:{...base.decision!,kind:"match",match:game,options:[{id:`drama:${action}`,kind:"drama",action,chance}]}};
      const result=choose(career,{decision:career.decision!.id,option:`drama:${action}`}).notices.find(n=>n.kind==="matchOutcome");
      expect(result?.kind==="matchOutcome"?result.result.fans:null).toBe(action==="leave"?0:chance?8:-6);
      expect(policyChoice(career,"ambitious")).not.toBeNull();
    }
  });
});
