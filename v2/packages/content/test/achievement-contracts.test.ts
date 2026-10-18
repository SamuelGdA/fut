import { describe, expect, it } from "vitest";
import { autoplay, createCareer, challengeSetup, challengeStatus, dailyHand, type Career, type SeasonRecord } from "@craque/engine";
import { CLUBS, COMPETITIONS, LEAGUES } from "@craque/world";
import { createCoachCareer, type CoachCareer, type SeasonHistory } from "@craque/engine/coach";
import { ACHIEVEMENTS, achievementMet, newAchievements, type AchievementContext } from "../src/achievements";
import { COACH_ACHIEVEMENTS, coachAchievementsMet } from "../src/coach";

// Estados controlados exercitam cada contrato de desbloqueio e seus bloqueios.
// Não substituem as simulações de probabilidade e de recordes do motor.
const setup={seed:"d72-conquistas",startYear:2026,pace:"intense" as const,difficulty:"normal" as const,identity:{surname:"Teste",nationality:"BRA" as const,position:"st" as const,foot:"right" as const,dreamNumber:9}};
const fresh=createCareer(setup),base=autoplay(fresh,"ambitious"),record=base.history[0]!;
const league=(country:string,division=1)=>LEAGUES.find(item=>item.country===country && item.division===division)!;
const annual=(year:number,club="barcelona"):SeasonRecord=>({...record,year,age:16+year-2026,club,league:league(CLUBS.find(item=>item.id===club)!.country).id,games:60,ovrEnd:95,loan:false,legacy:"legend",production:{...record.production,goals:73,assists:25},national:{...record.national,games:12,goals:10},awards:{...record.awards,won:["ballonDor","goldenShoe","goldenGlove","youngPlayer","topScorer","bestPlayer"]},titles:["league:laliga","cup:ESP","cont1:UEFA",...(year%4===2?["worldcup"]:[])]});
const ended=(history:readonly SeasonRecord[]):Career=>({...base,history,end:{reason:"age",age:40}});
const main=ended(Array.from({length:24},(_,i)=>annual(2026+i)));
const national=ended(main.history.map(item=>({...item,club:"palmeiras",league:league("BRA").id,titles:["league:brasileirao","cup:BRA","cont1:CONMEBOL","nations:CONMEBOL"]})));
const countries=["ENG","ESP","ITA","GER","FRA",...new Set(CLUBS.map(club=>club.country))];
const road=ended(Array.from({length:24},(_,i)=>annual(2026+i,CLUBS.find(club=>club.country===countries[i%countries.length])!.id)));
const home=ended([annual(2026),annual(2027,"real-madrid"),annual(2028)]);
const movement=(division:1|2,position:number):SeasonRecord=>({...annual(2026,"santos"),league:league("BRA",division).id,titles:[],competitions:record.competitions.map(entry=>entry.competition.startsWith("league:")?{...entry,competition:`league:${league("BRA",division).id}`,position}:entry)});
const historyWithTitle=annual(2027,"santos");
const recovered=ended([movement(1,20),movement(2,1),{...historyWithTitle,titles:[`league:${league("BRA").id}`,"cont1:CONMEBOL"]}]);
const hand=dailyHand("2026-10-03"),challengeCareer=autoplay(createCareer(challengeSetup(hand,setup.identity)),"ambitious");
const challengeResult=challengeStatus(hand,challengeCareer);
const contexts:AchievementContext[]=[main,national,road,home,recovered,
  {...main,contract:main.contract?{...main.contract,club:main.history[0]!.club}:null},
  {...road,nationality:"ARG" as const},
  {...road,log:base.log.map(entry=>entry.kind==="transfer"?{...entry,traitor:true}:entry)},
  ended(main.history.map(item=>({...item,ovrEnd:item.age<31?79:95}))),
  ...["ENG","ESP","ITA","GER"].map(country=>ended(main.history.map(item=>({...item,titles:[`league:${league(country).id}`]})))),
  ...COMPETITIONS.map(competition=>ended([{...record,titles:[competition.id]}])),
].map(career=>({career,challenge:null,finishedBefore:9,rankedDays:7}));
contexts.push({career:challengeCareer,challenge:{...challengeResult,total:900,erased:0,edict:{...challengeResult.edict,state:"intact"},missions:challengeResult.missions.map(mission=>({...mission,ratio:1}))},finishedBefore:9,rankedDays:7});

describe("D72: cada conquista do Craque",()=>{
  it("nenhuma é liberada ao criar a carreira",()=>expect(newAchievements({career:fresh,challenge:null,finishedBefore:0,rankedDays:0},new Set())).toEqual([]));
  it.each(ACHIEVEMENTS)("$id tem caso positivo e não reaparece depois de obtida",item=>{
    const witness=contexts.find(context=>achievementMet(item,context));
    expect(witness,`sem caso positivo: ${item.id}`).toBeDefined();
    expect(newAchievements(witness!,new Set())).toContain(item.id);
    expect(newAchievements(witness!,new Set([item.id]))).not.toContain(item.id);
    if(item.when==="end")expect(newAchievements({...witness!,career:{...witness!.career,end:null}},new Set())).not.toContain(item.id);
  });
});

describe("D72: cada conquista do Técnico",()=>{
  const coach=createCoachCareer({seed:"d72-conquistas",startYear:2026,mode:"fast",identity:{name:"Teste",nationality:"BRA"}},{players:[],free:[]});
  const season:SeasonHistory={year:2026,club:"santos",league:league("BRA").id,division:1,position:1,tableSize:20,objective:{kind:"title",target:2,expected:1,tableSize:20},objectiveMet:true,titles:[`league:${league("BRA").id}`,"cup:BRA","cont1:CONMEBOL","clubworldcup"],promoted:true,relegated:false,dismissed:false,partial:false,rescue:true,confidence:90,reputationAfter:90,topScorer:null,bestPlayer:null,invincible:true};
  const champion:CoachCareer={...coach,reputation:90,ended:{reason:"completed",partial:false},history:Array.from({length:24},(_,i)=>({...season,year:2026+i,club:i<10?"santos":i<20?"barcelona":"arsenal",dismissed:i===0})),legacy:Object.fromEntries(Array.from({length:5},(_,i)=>[String(i),{player:String(i),name:"Teste",nationality:"BRA" as const,position:"st" as const,revealed:true,apps:30,goals:10,seasons:1,bestOvr:80,signed:false,firstOvr:60,rated:30,ratingSum:210}]))};
  it("nenhuma é liberada antes da primeira temporada",()=>expect(coachAchievementsMet(coach)).toEqual([]));
  it.each(COACH_ACHIEVEMENTS)("$id tem caso positivo e respeita encerramento",item=>{
    expect(item.check(champion)).toBe(true);
    expect(coachAchievementsMet(champion)).toContain(item.id);
    if(item.when==="end")expect(coachAchievementsMet({...champion,ended:null})).not.toContain(item.id);
  });
  it("meia temporada não libera Invencíveis nem conta como temporada completa",()=>{
    const partial={...coach,history:[{...season,partial:true}]};
    expect(coachAchievementsMet(partial)).not.toContain("tecnico:invincibles");
    expect(coachAchievementsMet(partial)).not.toContain("tecnico:firstSeason");
  });
});
