import { beforeAll, describe, expect, it } from "vitest";
import { leagueAt } from "@craque/world";
import { continentalEntrants, type SeasonMemory } from "../src";
import { cloneCareer, FORMATION_SLOTS, squadOf, viableSquad, type CoachPlayer } from "../src/coach";
import { optimalLineup } from "../src/coach/assignment";
import { seasonAwards } from "../src/coach/awards";
import { incomingTransfers } from "../src/coach/incomingTransfers";
import { objectiveFor, seasonOffers, historyEntry } from "../src/coach/review";
import { buildSeason, seasonMemory } from "../src/coach/competitions";
import { started, playSeason, must } from "./coach/helpers";
import { offseason } from "../src/coach/rollover";
import { performanceSpots } from "../src/world/qualification";
import { getElite } from "@craque/world";
import { decideAwards, PLAYER, type PlayerAwardInput } from "../src/awards/awards";

const base=started("d64-regressions","slow"),template=squadOf(base,base.coach!.club)[0]!;
const memory:SeasonMemory={...base.memory,continental:{},cups:{}};
function player(id:string,position:CoachPlayer["position"],ovr=75):CoachPlayer{return {...template,id,position,alternates:[],ovr,level:ovr,traits:[],birthYear:2000,satisfaction:65,form:0,injury:null};}

describe("D64: escalação ótima e desempates",()=>{
  function chosen(extras:CoachPlayer[]){const pool=FORMATION_SLOTS["4-3-3"].map((slot,index)=>player("slot:"+index,slot,74));return optimalLineup([...pool,...extras],"4-3-3");}
  it("OVR continua valendo mais que característica e idade",()=>{
    const talented={...player("trait","st",74),traits:["clutch"] as CoachPlayer["traits"],birthYear:2010};
    expect(chosen([talented,player("best","st",75)])).toContain("best");
    expect(chosen([talented,player("best","st",75)])).not.toContain("trait");
  });
  it("desempata por característica antes de juventude",()=>{
    expect(chosen([{...player("trait","st"),traits:["clutch"]}, {...player("young","st"),birthYear:2010}])).toContain("trait");
  });
  it("depois por idade, satisfação e fase",()=>{
    expect(chosen([{...player("old","st"),satisfaction:100},{...player("young","st"),birthYear:2001,satisfaction:40}])).toContain("young");
    expect(chosen([{...player("happy","st"),satisfaction:80},player("neutral","st")])).toContain("happy");
    expect(chosen([{...player("form","st"),form:1},player("normal","st")])).toContain("form");
  });
});

describe("D64: classificação continental",()=>{
  it("campeão da Sul-Americana ganha Libertadores sem duplicar torneios",()=>{
    const winner=memory.tables[leagueAt("BRA",1)!.id]![14]!;
    const entries=continentalEntrants({...memory,continental:{"cont2:CONMEBOL":{winner,runnerUp:memory.tables[leagueAt("BRA",1)!.id]![13]!}}});
    expect(entries["cont1:CONMEBOL"]).toContain(winner);
    expect(entries["cont2:CONMEBOL"]).not.toContain(winner);
  });
  it("Europa leva à Champions e Conference leva à Europa",()=>{
    const table=memory.tables[leagueAt("ENG",1)!.id]!,europa=table[12]!,conference=table[13]!;
    const entries=continentalEntrants({...memory,continental:{"cont2:UEFA":{winner:europa,runnerUp:table.at(-2)!},"cont3:UEFA":{winner:conference,runnerUp:table[10]!}}});
    expect(entries["cont1:UEFA"]).toContain(europa);expect(entries["cont2:UEFA"]).not.toContain(europa);
    expect(entries["cont2:UEFA"]).toContain(conference);expect(entries["cont3:UEFA"]).not.toContain(conference);
  });
  it("Colombia manda campeão da copa à Sul-Americana, não à Libertadores",()=>{
    const table=memory.tables[leagueAt("COL",1)!.id]!,winner=table.at(-1)!;
    const entries=continentalEntrants({...memory,cups:{"cup:COL":{winner,runnerUp:table.at(-2)!}}},()=>true);
    expect(entries["cont2:CONMEBOL"]).toContain(winner);expect(entries["cont1:CONMEBOL"]).not.toContain(winner);
  });
  it("os dois finalistas da Copa do Brasil podem classificar, mantendo sete vagas-base",()=>{
    const table=memory.tables[leagueAt("BRA",1)!.id]!,winner=table[13]!,runnerUp=table[14]!;
    const entries=continentalEntrants({...memory,cups:{"cup:BRA":{winner,runnerUp}}});
    expect(entries["cont1:CONMEBOL"]).toContain(winner);expect(entries["cont1:CONMEBOL"]).toContain(runnerUp);
    expect(entries["cont1:CONMEBOL"]!.filter(id=>base.clubs[id]?.country==="BRA")).toHaveLength(7);
  });
  it("renovação mostra a mesma continental que a próxima temporada de fato terá",()=>{
    const career=cloneCareer(base),club=career.coach!.club;
    const state=career.competitions["cont2:CONMEBOL"]!;
    state.champion=club;state.done=true;state.reached[club]="champion";
    career.history=[{...historyEntry(career,null,false,false,false,false),titles:["cont2:CONMEBOL"]}];
    const offer=seasonOffers(career,false).find(item=>item.stay)!;
    expect(offer.internationals).toContain("cont1:CONMEBOL");expect(offer.internationals).not.toContain("cont2:CONMEBOL");
    const next=buildSeason({seed:career.setup.seed,year:career.year+1,clubs:career.clubs,memory:seasonMemory(career.year,career.competitions,career.memory)});
    expect(next.competitions["cont1:CONMEBOL"]?.entrants).toContain(club);
  });
});

describe("D64: reconhecimento justo e Rei da América",()=>{
  it("craque de copa não pode vir de um eliminado nas oitavas",()=>{
    const career=cloneCareer(base),club=career.coach!.club,own=squadOf(career,club).find(p=>p.position!=="gk")!,cup=career.competitions["cup:BRA"]!;
    const rival=cup.entrants.find(id=>id!==club)!,other=squadOf(career,rival)[0]!;
    cup.done=true;cup.champion=rival;cup.reached[club]="R16";cup.reached[rival]="champion";
    career.competitionStats={"cup:BRA":{[own.id]:{apps:6,goals:20,assists:10,ratingSum:60},[other.id]:{apps:8,goals:2,assists:1,ratingSum:56}}};
    const awards=seasonAwards(career);
    expect(awards.some(award=>award.kind==="playerCompetition"&&award.player===own.id)).toBe(false);
  });
  it("prêmios incluem Rei da América, não passam +3 OVR por ano e não são reaplicados",()=>{
    const career=cloneCareer(base),club=Object.values(career.clubs).find(c=>c.country==="BRA"&&c.division===1)!.id;
    career.coach={...career.coach!,club};
    const own=squadOf(career,club).find(p=>p.position==="st")!;own.level=90;own.ovr=90;
    const league=Object.values(career.competitions).find(state=>state.kind==="league"&&state.entrants.includes(club))!,cup=career.competitions["cup:BRA"]!;
    for(const state of [league,cup]){state.done=true;state.champion=club;state.reached[club]="champion";}
    career.competitionStats={[league.id]:{[own.id]:{apps:30,goals:40,assists:20,ratingSum:240}},[cup.id]:{[own.id]:{apps:8,goals:12,assists:6,ratingSum:64}}};
    const awards=seasonAwards(career);
    expect(awards.filter(award=>award.player===own.id).length).toBeGreaterThan(3);
    expect(awards.some(award=>award.kind==="kingOfAmerica"&&award.player===own.id)).toBe(true);
    expect(own.ovr).toBe(93);seasonAwards(career);expect(own.ovr).toBe(93);
  });
  it("no Craque não basta nacionalidade, OVR alto ou jogar a Série B",()=>{
    const input:PlayerAwardInput={eligible:true,position:"st",ovr:99,age:27,games:50,goals:50,assists:20,leagueGoals:40,cleanSheets:20,playsInUefa:false,playsInAmericas:true,eliteDivision:true,success:{league:true,cup:true,primary:true,worldCup:false,nationsCup:false},crownEntries:[]};
    expect(decideAwards("d64-king",2026,{},input,false).won).toContain("kingOfAmerica");
    expect(decideAwards("d64-king",2026,{}, {...input,eliteDivision:false},false).won).not.toContain("kingOfAmerica");
    expect(decideAwards("d64-king",2026,{}, {...input,playsInAmericas:false},false).won).not.toContain("kingOfAmerica");
    expect(decideAwards("d64-king",2026,{}, {...input,goals:1,assists:1},false).kingOfAmerica?.winner).not.toBe(PLAYER);
  });
});

describe("D64: mercado e ambição",()=>{
  // Uma temporada real prepara os três caminhos; cada transição tem sua própria verificação.
  let review: ReturnType<typeof playSeason>;
  beforeAll(()=>{ review=playSeason(started("d64-market-timing")); });
  it("o mercado anual ainda não aparece na revisão da temporada",()=>{
    expect(review.phase).toBe("review");expect(review.transferOffers).toEqual([]);
  });
  it("trocar de clube inicia a etapa sem antecipar o mercado anual",()=>{
    const external=review.offers.find(offer=>!offer.stay)!;
    const moved=must(review,{type:"decide",choice:{offer:external.id}});
    expect(moved.phase).toBe("stage");expect(moved.transferOffers).toEqual([]);
  });
  it("renovar libera as ofertas somente quando há uma janela elegível",()=>{
    if(review.offers.some(offer=>offer.stay)){
      const renewed=must(review,{type:"decide",choice:"stay"});
      expect(["stage","transferOffers"]).toContain(renewed.phase);
      if(renewed.phase==="transferOffers")expect(renewed.transferOffers.length).toBeGreaterThan(0);
    }
  });
  it("contratação da diretoria preserva a identidade de um atleta existente e marca sua chegada",()=>{
    let found=false;
    for(let i=0;i<10&&!found;i++){
      const career=cloneCareer(started("d64-board:"+i)),club=career.coach!.club;
      career.clubs[club]!.revenue=100_000_000;career.clubs[club]!.cash=100_000_000;
      const before=new Map(Object.values(career.players).map(entry=>[entry.id,{birthYear:entry.birthYear,origin:entry.origin,traits:[...entry.traits]}]));
      offseason(career,{promoted:new Set(),relegated:new Set()});
      const signing=Object.values(career.players).find(entry=>entry.club===club&&entry.arrival?.kind==="board");
      if(!signing)continue;
      found=true;expect(before.get(signing.id)).toEqual({birthYear:signing.birthYear,origin:signing.origin,traits:signing.traits});
      expect(signing.arrival?.year).toBe(career.year);expect(signing.joinedYear).toBe(career.year);
    }
    expect(found).toBe(true);
  });
  it("aceitar todas as ofertas espontâneas ainda deixa dois goleiros e elenco viável",()=>{
    for(let i=0;i<30;i++){
      const career=cloneCareer({...base,setup:{...base.setup,seed:"d64-incoming:"+i}}),club=career.coach!.club;
      const offers=incomingTransfers(career),outgoing=new Set(offers.map(offer=>offer.player));
      expect(viableSquad(squadOf(career,club).filter(player=>!outgoing.has(player.id)))).toBe(true);
    }
  });
  it("um campeão da elite deixa de ter objetivo de evitar a queda e atrai clubes fortes do país",()=>{
    const career=cloneCareer(base),club=Object.values(career.clubs).find(c=>c.country==="BRA"&&c.division===1&&c.strength<79)!.id;
    career.coach={...career.coach!,club};
    const league=Object.values(career.competitions).find(state=>state.kind==="league"&&state.entrants.includes(club))!;
    career.history=[{...historyEntry(career,null,false,false,false,false),division:1,position:1,titles:[league.id]}];
    expect(["title","top"]).toContain(objectiveFor(career,club).kind);
    const domestic=seasonOffers(career,false).filter(offer=>!offer.stay&&career.clubs[offer.club]?.country==="BRA");
    expect(domestic.length).toBeGreaterThan(0);expect(domestic.every(offer=>offer.division===1&&offer.strength>=career.clubs[club]!.strength)).toBe(true);
  });
});

describe("D64: regulamentos e elegibilidade continental",()=>{
  it("Bento fora das Américas não é elegível, Vitor Roque e Arrascaeta são",()=>{
    expect(getElite("bento")?.americas).toBe(false);
    expect(getElite("vitor-roque")?.americas).toBe(true);expect(getElite("vitor-roque")?.europe).toBe(false);
    expect(getElite("giorgian-de-arrascaeta")?.americas).toBe(true);
  });
  it("a vaga UEFA de desempenho vem dos resultados anuais e acrescenta um clube à Champions",()=>{
    expect(performanceSpots({"cont1:UEFA":["real-madrid","barcelona","liverpool","arsenal"]})).toEqual(["ESP","ENG"]);
    const plain=continentalEntrants({...memory,performanceSpots:[]}),bonus=continentalEntrants({...memory,performanceSpots:["ENG"]});
    const english=(entries:Record<string,string[]>)=>entries["cont1:UEFA"]!.filter(id=>base.clubs[id]?.country==="ENG");
    expect(english(bonus)).toHaveLength(english(plain).length+1);
  });
  it("Chile tem quatro vagas principais, quatro secundárias e playoff consistente",()=>{
    const table=memory.tables[leagueAt("CHI",1)!.id]!,testMemory={...memory,cups:{"cup:CHI":{winner:table.at(-1)!,runnerUp:table.at(-2)!},"leaguecup:CHI":{winner:table[4]!,runnerUp:table[5]!}}};
    const entries=continentalEntrants(testMemory,()=>true,"d64-chile");
    const chilean=(id:string)=>entries[id]!.filter(club=>base.clubs[club]?.country==="CHI");
    expect(chilean("cont1:CONMEBOL")).toHaveLength(4);expect(chilean("cont2:CONMEBOL")).toHaveLength(4);
    expect(chilean("cont1:CONMEBOL")).toContain(table[4]);
    expect(chilean("cont1:CONMEBOL").some(id=>chilean("cont2:CONMEBOL").includes(id))).toBe(false);
    expect(continentalEntrants(testMemory,()=>true,"d64-chile")).toEqual(entries);
  });
});
