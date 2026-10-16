import { describe, expect, it } from "vitest";
import { createRng, createWorld, clubIndex, simulateWorldSeason } from "../src";
import { playerClubImpact } from "../src/world/tuning";
import { type CoachCareer, type CoachPlayer, createCoachCareer, FORMATION_SLOTS, squadOf, isAvailable, purchaseChance, valueOf } from "../src/coach";
import { cloneCareer } from "../src/coach/career";
import { optimalLineup } from "../src/coach/assignment";
import { stageInjury } from "../src/coach/injuries";
import { traitFits, youthAlternates } from "../src/coach/eligibility";
import { seasonAwards } from "../src/coach/awards";
import { rememberSquad, isClubIdol } from "../src/coach/legacy";
import { incomingTransfers } from "../src/coach/incomingTransfers";
import { seasonOffers } from "../src/coach/review";
import { simulateDays } from "../src/coach/season";
import { started, must, refused, WORLD, playSeason } from "./coach/helpers";

const base = started("d63-rules", "slow");
function clone(): CoachCareer { return cloneCareer(base); }
const template = squadOf(base, base.coach!.club)[0]!;
function player(id: string, position: CoachPlayer["position"], ovr: number, alternates: CoachPlayer["alternates"] = []): CoachPlayer { return { ...template, id, position, ovr, level: ovr, alternates, injury: null, traits: [] }; }

describe("D63: escalação, base e características", () => {
  it("escolhe o MEI que também é PD pelo maior OVR, sem desperdiçar outra posição", () => {
    const pool = FORMATION_SLOTS["4-3-3"].map((slot, i) => player(`slot:${i}`, slot, 70));
    pool.push(player("mei-pd", "cam", 84, ["rw"]));
    const lineup = optimalLineup(pool, "4-3-3");
    expect(lineup).toHaveLength(11);
    expect(lineup[FORMATION_SLOTS["4-3-3"].indexOf("rw")]).toBe("mei-pd");
    expect(new Set(lineup).size).toBe(11);
    lineup.forEach((id, i) => { const p = pool.find(p => p.id === id)!; expect([p.position, ...p.alternates]).toContain(FORMATION_SLOTS["4-3-3"][i]); });
  });
  it("não usa atleta sem posição declarada para tapar uma vaga vazia", () => {
    const lineup = optimalLineup([player("striker", "st", 99)], "4-3-3");
    expect(lineup.filter(Boolean)).toEqual(["striker"]);
    expect(lineup[FORMATION_SLOTS["4-3-3"].indexOf("st")]).toBe("striker");
  });
  it("maximiza o conjunto quando um polivalente é necessário em outra vaga", () => {
    const lineup = optimalLineup([player("both", "lw", 90, ["rw"]), player("left", "lw", 89), player("right", "rw", 50)], "4-3-3");
    expect(lineup.filter(Boolean).sort()).toEqual(["both", "left"]);
  });
  it("Muralha nunca aparece num atacante sem posição defensiva", () => {
    expect(traitFits("aerial", ["st", "rw"])).toBe(false);
    expect(traitFits("aerial", ["cm", "cdm"])).toBe(true);
    for (const p of Object.values(base.players)) for (const trait of p.traits) expect(traitFits(trait, [p.position, ...p.alternates])).toBe(true);
  });
  it("as posições da base não atravessam diretamente defesa e ataque", () => {
    let alternates = 0;
    for (let i=0;i<300;i++) for (const position of ["cb", "lb", "rb", "st", "lw", "rw"] as const) {
      const result = youthAlternates(position, createRng(`alt:${i}:${position}`));
      alternates += result.length;
      const forbidden = ["cb", "lb", "rb"].includes(position) ? ["st", "lw", "rw"] : ["cb", "lb", "rb"];
      expect(result.some(slot => forbidden.includes(slot))).toBe(false);
      expect(new Set(result).size).toBe(result.length);
    }
    expect(alternates).toBeGreaterThan(500);
    expect(youthAlternates("gk", createRng("gk"))).toEqual([]);
  });
});

describe("D63: lesões bloqueiam turnos inteiros", () => {
  it("um lesionado não pode entrar nem manualmente nem automaticamente", () => {
    const career = clone(), id = career.coach!.tactics.lineup.find(Boolean)!;
    career.players[id]!.injury = stageInjury(career, 0, 365, "medium");
    const manual = must(career, { type: "setTactics", lineup: career.coach!.tactics.lineup });
    expect(manual.coach!.tactics.lineup).not.toContain(id);
    expect(must(career, { type: "autoLineup" }).coach!.tactics.lineup).not.toContain(id);
    expect(isAvailable(career.players[id]!, 364)).toBe(false);
    expect(career.coach!.tactics.lineup).toContain(id);
  });
  it("a lesão pré-turno dura um ou dois turnos; no meio do jogo bloqueia também o próximo inteiro", () => {
    const career = clone();
    expect(stageInjury(career, 0, 150, "light").until).toBe(150);
    expect(stageInjury(career, 0, 365, "medium").until).toBe(365);
    expect(stageInjury(career, 40, 150, "light").until).toBe(365);
    career.half = 1;
    expect(stageInjury(career, 200, 365, "medium").until).toBe(730);
  });
  it("o atleta perde toda a simulação seguinte e volta apenas no planejamento de recuperação", () => {
    const career = clone(), id = career.coach!.tactics.lineup.find(Boolean)!;
    career.players[id]!.injury = stageInjury(career, 0, 365, "medium");
    const reviewed = playSeason(career);
    expect(reviewed.fixtures.flatMap(f => f.result?.coach?.used.map(p => p.player) ?? [])).not.toContain(id);
    expect(reviewed.players[id]!.season.apps).toBe(0);
    const stay = reviewed.offers.find(o => o.stay);
    if (stay) expect(must(reviewed, { type: "decide", choice: "stay" }).players[id]!.injury).toBeNull();
  }, 15_000);
});

describe("D63: negociações preservadas e ofertas espontâneas", () => {
  it("fecha uma compra, vende e retoma a resposta sem gastar de novo", () => {
    const career = clone();
    const strength = career.clubs[career.coach!.club]!.strength;
    const targets = Object.values(career.players).filter(p => p.club && p.club !== career.coach!.club && p.ovr <= strength - 2 && p.ovr >= strength - 6 && valueOf(p,career.year)*1.6 < career.coach!.budget/3).sort((a,b)=>purchaseChance(career,b,career.coach!.club).total-purchaseChance(career,a,career.coach!.club).total).slice(0,3).map(p=>p.id);
    let current = must(must(career,{type:"openAction",kind:"buy"}),{type:"confirmAction",payload:{kind:"buy",players:targets}});
    expect(current.flow?.kind).toBe("buy");
    const original = current.flow;
    current = must(current,{type:"closeAction"});
    current = must(current,{type:"openAction",kind:"sell"});
    current = must(current,{type:"cancelAction"});
    current = must(current,{type:"openAction",kind:"buy"});
    expect(current.actionsUsed).toBe(1);
    expect(current.flow).toEqual(original);
    current = must(current,{type:"closeAction"});
    current = must(current,{type:"openAction",kind:"buy",fresh:true});
    expect(current.flow?.step).toBe("select");
    expect(current.actionsUsed).toBe(1);
  });
  it("as propostas espontâneas são determinísticas, distintas e cobrem 1 a 3 jogadores", () => {
    let seen=0;
    for(let i=0;i<60;i++) {
      const career={...base,setup:{...base.setup,seed:`incoming:${i}`}};
      const offers=incomingTransfers(career);
      expect(offers).toEqual(incomingTransfers(career));
      expect(offers.length).toBeLessThanOrEqual(3);
      expect(new Set(offers.map(o=>o.player)).size).toBe(offers.length);
      if(offers.length)seen++;
    }
    expect(seen).toBeGreaterThan(15); expect(seen).toBeLessThan(45);
  });
  it("recusar proposta recebida não consome ações e não pode ser aceito de novo", () => {
    const career=clone(), id=squadOf(career,career.coach!.club).find(p=>p.position!=="gk")!.id;
    career.phase="transferOffers";
    career.transferOffers=[{id:"incoming",player:id,buyer:"flamengo",price:1000000,status:"pending"}];
    const next=must(career,{type:"respondTransfer",item:"incoming",decision:"decline"});
    expect(next.actionsUsed).toBe(career.actionsUsed);
    expect(next.players[id]!.club).toBe(career.coach!.club);
    expect(refused(next,{type:"respondTransfer",item:"incoming",decision:"accept"})).toBe("notPending");
  });
});

describe("D63: legado, clubes e prêmios", () => {
  it("o auge permanece estável depois do declínio e de uma aposentadoria", () => {
    const career=clone(), p=squadOf(career,career.coach!.club)[0]!;
    p.ovr=92; rememberSquad(career); const peak=career.legacy[p.id]!.peak;
    p.ovr=65; rememberSquad(career); delete career.players[p.id];
    expect(career.legacy[p.id]!.bestOvr).toBe(92); expect(career.legacy[p.id]!.peak).toEqual(peak);
  });
  it("volume sem rendimento, ou de outro clube, não cria um ídolo", () => {
    const career=clone(), p=squadOf(career,career.coach!.club)[0]!;
    p.joinedYear=2020; rememberSquad(career);
    const local=career.legacy[p.id]!.byClub![p.club]!;
    Object.assign(local,{apps:150,seasons:5,goals:80,assists:30,bestOvr:90,rated:150,ratingSum:7*150});
    expect(isClubIdol(career,p)).toBe(true);
    local.ratingSum=6*150; expect(isClubIdol(career,p)).toBe(false);
    local.ratingSum=7*150; local.apps=0; expect(isClubIdol(career,p)).toBe(false);
  });
  it("um jogador pode ganhar vários prêmios mas no máximo +3 de OVR, até 99, sem craque continental B/C", () => {
    const career=clone(), p=squadOf(career,career.coach!.club)[0]!;
    p.ovr=97; p.level=97; rememberSquad(career);
    for(const [i,kind] of ["league","cont1","cont2","cont3"].entries()) {
      const state=Object.values(career.competitions).find(s=>s.kind===kind)!;
      expect(state).toBeTruthy(); state.done=true; state.champion=p.club;
      career.competitionStats[state.id]={[p.id]:{apps:40,goals:50-i,assists:20,ratingSum:340}};
    }
    const awards=seasonAwards(career);
    expect(awards.filter(a=>a.player===p.id).length).toBeGreaterThan(3);
    expect(p.ovr).toBe(99);
    expect(awards.filter(a=>a.kind==="playerCompetition").map(a=>career.competitions[a.competition!]!.kind)).not.toContain("cont2");
    expect(awards.filter(a=>a.kind==="playerCompetition").map(a=>career.competitions[a.competition!]!.kind)).not.toContain("cont3");
    expect(seasonAwards(career)).toEqual(awards); expect(p.ovr).toBe(99);
    expect(new Set(awards.map(a=>`${a.kind}:${a.player}:${a.competition}`)).size).toBe(awards.length);
  });
  it("não entrega novamente os prêmios dos outros clubes quando nosso clube não ganhou nenhum", () => {
    const career=clone(), p=Object.values(career.players).find(player=>player.club && player.club!==career.coach!.club)!;
    p.level=80; p.ovr=80;
    const competition=Object.values(career.competitions).find(state=>state.kind==="cont1")!;
    competition.done=true; competition.champion=p.club;
    career.competitions={[competition.id]:competition};
    career.competitionStats={[competition.id]:{[p.id]:{apps:30,goals:25,assists:10,ratingSum:240}}};
    expect(seasonAwards(career)).toEqual([]);
    const level=p.level; expect(level).toBeGreaterThan(80);
    expect(seasonAwards(career)).toEqual([]); expect(p.level).toBe(level);
  });
  it("reputação máxima gera quatro propostas, incluindo renovação e outra do país atual", () => {
    const career=clone(); career.reputation=100;
    const offers=seasonOffers(career,false);
    expect(offers).toHaveLength(4); expect(offers.filter(o=>o.stay)).toHaveLength(1);
    const country=career.clubs[career.coach!.club]!.country;
    expect(offers.some(o=>!o.stay && career.clubs[o.club]!.country===country)).toBe(true);
    expect(offers.filter(o=>!o.stay).every(o=>o.strength>=70)).toBe(true);
  });
  it("renovar conserva os jogadores sobreviventes e traz de 1 a 3 reforços da diretoria/base", () => {
    const prepared=clone();prepared.coach!.board=100;prepared.coach!.credit=1.5;
    const reviewed=playSeason(prepared);
    // O teste isola renovação, não o mérito desta semente após mudanças do motor.
    if(!reviewed.offers.some(o=>o.stay))throw new Error("preparação não garantiu renovação");
    const before=squadOf(reviewed,reviewed.coach!.club).filter(p=>reviewed.year-p.birthYear<30);
    const next=must(reviewed,{type:"decide",choice:"stay"});
    for(const p of before) expect(next.players[p.id]?.club).toBe(p.club);
    const arrivals=next.news.arrivals.filter(id=>id.includes(":2"));
    expect(next.news.arrivals.length).toBeGreaterThanOrEqual(1);
    expect(arrivals.length).toBeLessThanOrEqual(3);
  });
});

describe("D63: Mundial e Intercontinental", () => {
  const world=createCoachCareer({seed:"d63-world-cup",startYear:2029,mode:"fast",identity:{name:"Teste",nationality:"BRA"}},WORLD);
  simulateDays(world);
  it("Mundial tem 32 clubes, oito grupos de quatro, três jogos por equipe e 63 jogos no total",()=>{
    const state=world.competitions.clubworldcup!;
    expect(state.entrants).toHaveLength(32); expect(new Set(state.entrants).size).toBe(32);
    expect(state.groups).toHaveLength(8); expect(state.groups!.every(g=>g.clubs.length===4)).toBe(true);
    const fixtures=world.fixtures.filter(f=>f.competition==="clubworldcup");
    expect(fixtures.filter(f=>f.roundKind==="group")).toHaveLength(48);
    expect(fixtures).toHaveLength(63); expect(state.done).toBe(true); expect(state.champion).toBeTruthy();
  });
  it("Intercontinental tem seis campeões, cinco jogos, europeu entra apenas na final",()=>{
    const state=world.competitions.intercontinental!, fixtures=world.fixtures.filter(f=>f.competition==="intercontinental");
    expect(state.entrants).toHaveLength(6); expect(fixtures).toHaveLength(5);
    const europe=world.competitions["cont1:UEFA"]!.champion!;
    expect(fixtures.filter(f=>f.home===europe||f.away===europe).map(f=>f.round)).toEqual(["F"]);
    expect(state.done).toBe(true); expect(state.champion).toBeTruthy();
  });
  it("supercopas encerradas guardam o campeão na fase correta",()=>{
    for(const state of Object.values(world.competitions).filter(s=>s.kind==="super"||s.kind==="contsuper")) {
      expect(state.done).toBe(true); expect(state.champion).toBeTruthy();
      expect(state.reached[state.champion!]).toBe("champion");
    }
  });
});

describe("D64: ajuda progressiva do craque ao clube", () => {
  it("97 ajuda um pouco mais que 90 mesmo num clube fraco, com retornos menores no topo",()=>{
    expect(playerClubImpact(70,97,1)).toBeGreaterThan(playerClubImpact(70,90,1));
    expect(playerClubImpact(70,97,1)-playerClubImpact(70,90,1)).toBeCloseTo(0.42);
    expect(playerClubImpact(70,97,1)).toBeCloseTo(5.22);
    expect(playerClubImpact(70,97,0.5)).toBeCloseTo(playerClubImpact(70,97,1)/2);
  });
  it("a contribuição deixa um investimento persistente pequeno, sem garantir vitórias",()=>{
    const world=createWorld("d63-club",2026), id="vasco-da-gama", index=clubIndex(id);
    expect(index).toBeGreaterThanOrEqual(0);
    const plain=simulateWorldSeason(world,"d63-club"), improved=simulateWorldSeason(world,"d63-club",{club:id,ovr:97,participation:0.9});
    expect(improved.next.strength[index]!).toBeGreaterThan(plain.next.strength[index]!);
    expect(improved.next.strength[index]!-plain.next.strength[index]!).toBeLessThan(1);
  });
});
