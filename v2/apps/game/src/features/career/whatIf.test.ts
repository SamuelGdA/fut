import { describe, expect, it } from "vitest";
import { autoplay, choose, createCareer, policyChoice, retireNow, saveOf } from "@craque/engine";
import { debugPlayer } from "@craque/engine/debug";
import { actualDecisionPoints, carryDecisionMemory, decisionCheckpoint, decisionPoints, principalDecisionPoints, rememberDecision } from "./whatIf";
import { useCareer } from "./store";

const career = autoplay(createCareer({ seed: "hypothetical-d68", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "Teste", nationality: "BRA", position: "lw", foot: "right", dreamNumber: 11 } }), "balanced");
describe("hipotético em sessões com ajustes de teste", () => {
  it("mostra somente a primeira decisão principal de cada ano e conserva índices para ramificar", () => {
    const all = actualDecisionPoints(career, "pt");
    const points = principalDecisionPoints(all);
    expect(new Set(points.map(point => point.year)).size).toBe(points.length);
    expect(points.every(point => !["match", "promise", "veteran"].includes(point.kind))).toBe(true);
    expect(points.length).toBeLessThan(all.length);
    for (const point of points) {
      expect(all.find(candidate => candidate.year === point.year && !["match", "promise", "veteran"].includes(candidate.kind))).toBe(point);
      expect(decisionCheckpoint(career, point.index)?.decision?.kind).toBe(point.kind);
    }
  });
  it("registra todas as escolhas reais após mudanças de OVR/idade e retoma exatamente cada estado",()=>{
    let current=createCareer(career.setup);
    const originals=[];
    for(let step=0;step<18 && current.decision;step++) {
      if(step===3 || step===8) {
        const adjusted=debugPlayer(current,{talent:"phenom",age:current.age,ovr:99,position:"lw",trait:"professional",loanOwner:null});
        carryDecisionMemory(current,adjusted); current=adjusted;
      }
      const choice=policyChoice(current,"ambitious")!;
      originals.push(current);
      const next=choose(current,choice).career;
      rememberDecision(current,next,choice);current=next;
    }
    if(!current.end){const ended=retireNow(current);carryDecisionMemory(current,ended);current=ended;}
    for(const locale of ["pt","en","es"] as const)expect(actualDecisionPoints(current,locale)).toHaveLength(current.choices.length);
    originals.forEach((original,index)=>expect(decisionCheckpoint(current,index)).toBe(original));
    expect(originals.length).toBeGreaterThan(10);
    useCareer.setState({career:current,internalTesting:true,status:"ready"});
    expect(useCareer.getState().branch(saveOf(current),null,9)).toBe(true);
    expect(useCareer.getState().career).toBe(originals[9]);
    expect(useCareer.getState().internalTesting).toBe(true);
    useCareer.getState().discard();
  });
  it("lista os pontos reproduzíveis da carreira completa nos três idiomas", () => {
    for (const locale of ["pt", "en", "es"] as const) {
      const points = decisionPoints(saveOf(career), locale);
      expect(points).toHaveLength(career.choices.length);
      expect(points[0]!.title).toBeTruthy();
    }
  });
  it("uma opção de teste incompatível não derruba os pontos válidos anteriores", () => {
    const save = saveOf(career), choices = [...save.choices];
    choices[2] = { ...choices[2]!, option: "oferta-apenas-no-debug" };
    expect(decisionPoints({ ...save, choices }, "pt")).toHaveLength(2);
  });
});
