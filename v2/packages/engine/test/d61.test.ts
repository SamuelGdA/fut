import { describe, expect, it } from "vitest";
import { choose, createCareer, createRng, evolveSeason, TALENT_ODDS, type CareerSetup } from "../src";
import { moveTo } from "../src/career/move";
import { debugCoach } from "../src/debug";
import { FORMATIONS, FORMATION_SLOTS, eventTargets, wageBillOf, coachCommand, eventCost, canAffordEvent } from "../src/coach";
import { applyEffects, debugEvent, pickStageEvent } from "../src/coach/events";
import { cloneCareer } from "../src/coach/career";
import { closeAction } from "../src/coach/actions";
import { started } from "./coach/helpers";

const setup: CareerSetup = { seed: "loan-regression", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "TESTE", foot: "right", nationality: "BRA", position: "st", dreamNumber: 9 } };
function borrowed() {
  const base = createCareer(setup);
  const first = base.decision!.options[0]!;
  if (first.kind !== "club") throw new Error("base sem clube");
  const career = choose(base, { decision: base.decision!.id, option: first.id }).career;
  return { ...career, contract: { ...career.contract!, loan: { owner: "flamengo", ownerShirt: 9, untilAge: career.age + 2 } } };
}

describe("D61: regras e regressões", () => {
  it("treinar não encerra o empréstimo nem altera o dono do passe", () => {
    const career = borrowed();
    const input = { ...career, decision: { ...career.decision!, kind: "focus" as const, event: null, options: [{ id: "focus", kind: "focus" as const, focus: "finishing" as const }] } };
    const before = JSON.stringify(input);
    const next = choose(input, { decision: input.decision.id, option: "focus" }).career;
    expect(next.contract?.loan).toEqual(career.contract.loan);
    expect(JSON.stringify(input)).toBe(before);
  });
  it("renovar no clube do empréstimo preserva o passe; compra explícita encerra o empréstimo", () => {
    const career = borrowed();
    const base = createCareer(setup).decision!.options[0]!;
    if (base.kind !== "club") throw new Error("sem oferta");
    const offer = { ...base.offer, club: career.contract.club, loan: false, buyout: false, back: false };
    expect(moveTo(career, offer, [], { loan: false }).career.contract?.loan).toEqual(career.contract.loan);
    expect(moveTo(career, { ...offer, buyout: true }, [], { loan: false }).career.contract?.loan).toBeNull();
  });
  it("reconhecimentos somam capacidade depois do crescimento e declínio, até três (D78)", () => {
    const career = borrowed();
    for (const age of [19, 35]) {
      const context = { age, games: 36, clubStrength: 75, fans: 60, difficulty: "normal" as const, titleImportance: 0, focus: null };
      const plain = evolveSeason(career.player, context, createRng("bonus"));
      const awarded = evolveSeason(career.player, { ...context, successBonus: 9 }, createRng("bonus"));
      const capped = evolveSeason(career.player, { ...context, successBonus: 3 }, createRng("bonus"));
      expect(awarded).toEqual(capped);
      expect(awarded.player.capacity).toBeGreaterThanOrEqual(plain.player.capacity);
      expect(awarded.player.capacity - plain.player.capacity).toBeLessThanOrEqual(1.65 + 1e-9);
    }
  });
  it("os novos percentuais somam 100 em cada dificuldade", () => {
    expect(TALENT_ODDS.normal).toEqual({ journeyman: 26, prospect: 33, class: 23, star: 12, phenom: 6 });
    expect(Object.values(TALENT_ODDS.hard).reduce((a,b)=>a+b,0)).toBeCloseTo(100);
  });
  it("as oito formações têm onze posições e um goleiro", () => {
    expect(FORMATIONS).toHaveLength(8);
    expect(FORMATIONS).toEqual([...FORMATIONS].sort((a,b)=>Number(a[0])-Number(b[0])));
    for (const formation of FORMATIONS) { expect(FORMATION_SLOTS[formation]).toHaveLength(11); expect(FORMATION_SLOTS[formation].filter(p=>p==="gk")).toHaveLength(1); }
  });
  it("o grupo consultado no evento é exatamente o afetado", () => {
    const career = cloneCareer(started("groups"));
    const group = eventTargets(career,"youth",null);
    expect(group.every(p=>career.year-p.birthYear<=21)).toBe(true);
    const ids = new Set(group.map(p=>p.id));
    const before = Object.fromEntries(Object.values(career.players).map(p=>[p.id,p.satisfaction]));
    applyEffects(career,[{type:"satisfaction",target:"youth",amount:3}],null,"event");
    for(const player of Object.values(career.players)) expect(player.satisfaction).toBe(ids.has(player.id) ? Math.min(100,before[player.id]!+3) : before[player.id]);
  });
  it("aumento e renegociação mudam a folha, sem consumir a verba", () => {
    const career = cloneCareer(started("payroll"));
    const id = career.coach!.tactics.lineup[0]!;
    const budget = career.coach!.budget, wages = wageBillOf(career,career.coach!.club);
    applyEffects(career,[{type:"wage",amount:1000}],id,"event");
    expect(wageBillOf(career,career.coach!.club)).toBe(wages+1000);
    expect(career.coach!.budget).toBe(budget);
    const salaries = Object.fromEntries(eventTargets(career,"squad",null).map(p=>[p.id,p.wage]));
    applyEffects(career,[{type:"wage",amount:-0.05,target:"squad",relative:true}],null,"event");
    for(const player of eventTargets(career,"squad",null)) expect(player.wage).toBeCloseTo(Math.round(salaries[player.id]!*0.95/100)*100,0);
  });
  it("eventos recentes não repetem quando há outras situações elegíveis", () => {
    const career = cloneCareer(started("cooldown"));
    career.eventsSeen = ["veteranMentor","preseasonTour","boardBonus"];
    const event = pickStageEvent(career);
    if(event.event) expect(career.eventsSeen).not.toContain(event.event.id);
    expect(debugEvent(career,"not-real")).toBeNull();
  });
  it("evento sem verba recusa a escolha sem mudar a carreira", () => {
    const career = cloneCareer(started("event-funds"));
    career.coach!.budget = 0;
    const event = debugEvent(career, "academyBridge")!;
    career.phase = "event"; career.event = event;
    const paid = event.options.find(option => eventCost(option) > 0)!;
    expect(canAffordEvent(career, paid)).toBe(false);
    const result = coachCommand(career, { type: "chooseEvent", option: paid.id });
    expect(result.error).toBe("budget"); expect(result.career).toBe(career);
    expect(event.options.some(option => canAffordEvent(career, option))).toBe(true);
  });
  it("concluir conversa não decide opções que o treinador não escolheu", () => {
    const career = cloneCareer(started("unanswered-talk"));
    const id = career.coach!.tactics.lineup[0]!;
    career.flow = { kind: "locker", step: "responses", number: 1, mode: "talk", meeting: null, talks: [{ id: "pending", player: id, concern: "minutes", options: ["promiseMinutes"], chosen: null, outcome: null, immediate: 0 }] };
    const promises = career.promises.length, mood = career.players[id]!.satisfaction;
    closeAction(career);
    expect(career.flow).toBeNull(); expect(career.promises).toHaveLength(promises);
    expect(career.players[id]!.satisfaction).toBe(mood);
  });
  it("o debug altera uma cópia e recupera as lesões do cenário", () => {
    const career=cloneCareer(started("debug-heal"));const id=career.coach!.tactics.lineup[0]!;
    career.players[id]!.injury={kind:"light",since:career.day,until:career.day+10};
    const before=JSON.stringify(career);
    const next=debugCoach(career,{board:80,fans:80,reputation:50,budget:1234567,squadDelta:1,heal:true,event:null});
    expect(next.players[id]!.injury).toBeNull();expect(JSON.stringify(career)).toBe(before);
  });
});
