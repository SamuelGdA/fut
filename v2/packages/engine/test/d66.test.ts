import { describe,it,expect } from "vitest";
import { createPlayer, ovrAt } from "../src/player/player";
import { createWorld } from "../src/world/season";
import { simulatePlayerSeason } from "../src/season/playerSeason";
import { stream } from "../src/rng";
import { lateBreakthrough } from "../src/evolution/breakthrough";
import { championsLeagueDraw,championsPairs } from "../src/coach/champions";
import { seasonBudget } from "../src/coach/review";
import { fresh,must,playSeason,started } from "./coach/helpers";
import type { Fixture,CompetitionState } from "../src/coach/types";
import { injuryChance } from "../src/season/injury";
import { roleFor } from "../src/coach/world";
import { growthStep, learnedPosition } from "../src/coach/evolution";
import { positionPenalty } from "../src/coach/players";
import { cloneCareer } from "../src/coach/career";
import { recordCompetitionStats } from "../src/coach/awards";
import { historyEntry, leagueState } from "../src/coach/review";
import type { CoachPlayer, MatchResult } from "../src/coach/types";

describe("D66: mudanças verificáveis",()=>{
  it("físico reduz risco em qualquer idade e dificuldade, sem zerar o risco",()=>{
    for(const age of [16,27,35,40])for(const difficulty of ["normal","hard"] as const){
      const rates=[20,40,60,80,99].map(physical=>injuryChance(age,physical,"professional",difficulty));
      expect(rates.every((value,i)=>value>0 && (!i || value<rates[i-1]!))).toBe(true);
    }
  });
  it("a qualidade de um reserva não deixa sua expectativa de jogos cair com o excesso de bons jogadores",()=>{
    const template=Object.values(fresh("roles66").players)[0]!;
    const pool=Array.from({length:8},(_,i)=>({...template,id:`cm${i}`,position:"cm" as const,ovr:88,level:88,birthYear:2000}));
    expect(roleFor(pool[7]!,pool,2026,88)).toBe("starter");
    expect(roleFor({...pool[7]!,ovr:92},pool,2026,88)).toBe("star");
  });
  it("notas ruins reduzem evolução com a mesma sorte, e improvisar tem penalidade real",()=>{
    const template={...Object.values(fresh("roles66").players)[0]!,position:"cm" as const,alternates:[],traits:[],level:75,ovr:75,potential:80,birthYear:1999} as CoachPlayer;
    const input={year:2026,fraction:1,games:30,performance:0,mentor:1,developed:false};
    expect(growthStep(template,{...input,performance:-1},stream("same","coach"))).toBeLessThan(growthStep(template,input,stream("same","coach")));
    expect(positionPenalty(template,"cm")).toBe(0);expect(positionPenalty(template,"cb")).toBeLessThan(0);
  });
  it("aprender posição exige oito boas partidas, é raro e não ensina goleiro a virar atacante",()=>{
    const template={...Object.values(fresh("roles66").players)[0]!,position:"cm" as const,alternates:[],improvised:{cam:{apps:10,ratingSum:75}}} as CoachPlayer;
    let learned=0;
    for(let i=0;i<1000;i++)if(learnedPosition(template,1,stream(`learn:${i}`,"coach")))learned++;
    expect(learned).toBeGreaterThan(25);expect(learned).toBeLessThan(100);
    expect(learnedPosition({...template,position:"gk"},1,stream("no","coach"))).toBeNull();
    expect(learnedPosition({...template,improvised:{cam:{apps:7,ratingSum:70}}},1,stream("no","coach"))).toBeNull();
  });
  it("estatísticas usam minutos efetivos e não dão clean sheet a entrada curta",()=>{
    const career=cloneCareer(fresh("stats66")),players=Object.values(career.players).slice(0,3),[a,b,c]=players;
    const result={home:0,away:1,extraTime:false,penalties:null,winner:"away",injuries:[],
      goals:[{minute:60,side:"away",scorer:null,assist:null,setPiece:false}],
      participants:{home:[{player:a!.id,from:0,to:60,rating:6},{player:b!.id,from:60,to:90,rating:6},{player:c!.id,from:0,to:90,rating:6}] ,away:[]},
      coach:{side:"home",used:[],lineup:[],philosophy:"attacking",opponentPhilosophy:"defensive",formation:"4-3-3",eventOption:null,shortHanded:false}} as MatchResult;
    recordCompetitionStats(career,{id:"stats",competition:"stats"} as Fixture,result,players,[]);
    const rows=career.competitionStats.stats!;
    expect(rows[a!.id]).toMatchObject({apps:1,starts:1,minutes:60,goalsConceded:1,cleanSheets:0});
    expect(rows[b!.id]).toMatchObject({apps:1,starts:0,minutes:30,goalsConceded:0,cleanSheets:0});
    expect(rows[c!.id]).toMatchObject({minutes:90,goalsConceded:1});
  });
  it("Invencíveis exige liga ganha, nenhuma derrota e temporada completa",()=>{
    const career=cloneCareer(started("invincible66")),league=leagueState(career,career.coach!.club)!;
    const row=league.table!.find(row=>row.club===career.coach!.club)!;
    league.champion=career.coach!.club;row.lost=0;
    expect(historyEntry(career,null,false,false,false,false).invincible).toBe(true);
    expect(historyEntry(career,null,true,false,false,false).invincible).toBe(false);
    row.lost=1;expect(historyEntry(career,null,false,false,false,false).invincible).toBe(false);
    row.lost=0;league.champion="other";expect(historyEntry(career,null,false,false,false,false).invincible).toBe(false);
  },30000);
  it("a descoberta tardia tem grande salto, é rara e acontece uma vez",()=>{
    const base={...createPlayer({seed:"late",position:"st",difficulty:"normal"}),capacity:67,potential:72};
    let found=0;
    for(let i=0;i<10000;i++){
      const next=lateBreakthrough(base,27,30,stream(`bloom:${i}`,"growth","late"));
      if(next===base)continue;found++;
      expect(ovrAt(next,27)).toBeGreaterThanOrEqual(78);expect(ovrAt(next,27)).toBeLessThanOrEqual(86);
      expect(lateBreakthrough(next,28,30,stream("again","growth"))).toBe(next);
    }
    expect(found).toBeGreaterThan(2);expect(found).toBeLessThan(40);
    expect(lateBreakthrough(base,23,30,stream("young","growth"))).toBe(base);
  });
  it("a temporada real aplica e identifica a descoberta tardia além da curva biológica",()=>{
    let seed="";
    for(let i=0;i<10000;i++)if(stream(`integration:${i}`,"growth","lateBreakthrough",2026).next()<0.0015){seed=`integration:${i}`;break;}
    expect(seed).not.toBe("");
    const player={...createPlayer({seed,position:"st",difficulty:"normal"}),capacity:67,potential:72};
    const result=simulatePlayerSeason({seed,world:createWorld(seed,2026),player,age:27,nationality:"BRA",club:"goias",difficulty:"normal",fans:50,focus:null,modifiers:{minimumRole:"starter"}});
    expect(result.stats.games).toBeGreaterThanOrEqual(12);
    expect(result.evolution.breakthroughGain).toBeGreaterThan(5);
    expect(result.player.breakthroughAge).toBe(27);
    expect(ovrAt(result.player,27)).toBeGreaterThanOrEqual(78);
  });
  it("36 clubes recebem oito rivais, dois por pote, quatro mandos e nunca repetem na rodada",()=>{
    const ids=Array.from({length:36},(_,i)=>String(i)),coefficient=(id:string)=>100-Number(id),country=(id:string)=>String(Number(id)%12);
    for(let seed=0;seed<12;seed++){
      const rounds=championsLeagueDraw(ids,coefficient,country,stream(`draw:${seed}`,"coach"));
      expect(rounds).toHaveLength(8);
      for(const round of rounds){expect(round).toHaveLength(18);expect(new Set(round.flatMap(pair=>[...pair])).size).toBe(36);}
      for(const club of ids){
        const own=rounds.flat().filter(([a,b])=>a===club||b===club),rivals=own.map(([a,b])=>a===club?b:a);
        expect(new Set(rivals).size).toBe(8);expect(own.filter(([a])=>a===club)).toHaveLength(4);
        const venues=rounds.map(round=>round.some(([home])=>home===club));
        expect(venues[0]).not.toBe(venues[1]);expect(venues[6]).not.toBe(venues[7]);
        for(let i=2;i<8;i++)expect(venues[i]===venues[i-1] && venues[i]===venues[i-2]).toBe(false);
        expect(rivals.every(id=>country(id)!==country(club))).toBe(true);
        for(let pot=0;pot<4;pot++)expect(rivals.filter(id=>Math.floor(Number(id)/9)===pot)).toHaveLength(2);
        for(let c=0;c<12;c++)expect(rivals.filter(id=>country(id)===String(c)).length).toBeLessThanOrEqual(2);
      }
    }
  },30000);
  it("playoff segue os pares da tabela e a chave herda o caminho do cabeça",()=>{
    const state={leagueRanking:Array.from({length:36},(_,i)=>String(i+1)),knockoutSeeds:{},id:"cont1:UEFA"} as CompetitionState;
    const po=championsPairs(state,{label:"PO",days:[1,2],drawn:false,roundKind:"knockout"},[],"paths",2026);
    po.forEach(([a,b],i)=>{const g=Math.floor(i/2);expect([9+g*2,10+g*2]).toContain(Number(a));expect([23-g*2,24-g*2]).toContain(Number(b));});
    const played=(pairs:readonly (readonly [string,string])[],round:string):Fixture[]=>pairs.map(([a,b],i)=>({id:`cont1:UEFA|${round}|${i}|2`,home:a,away:b,decisive:true,result:{winner:b}} as Fixture));
    const r16=championsPairs(state,{label:"R16",days:[3,4],drawn:false,roundKind:"knockout"},played(po,"PO"),"paths",2026);
    expect(r16).toHaveLength(8);
    const qf=championsPairs(state,{label:"QF",days:[5,6],drawn:false,roundKind:"knockout"},played(r16,"R16"),"paths",2026);
    expect(qf).toHaveLength(4);expect(qf.every(([a,b])=>(state.knockoutSeeds?.[a] ?? 99)<(state.knockoutSeeds?.[b] ?? 99))).toBe(true);
  });
  it("gastos altos reduzem a próxima verba, sem zerá-la se há recursos",()=>{
    const club={revenue:100_000_000,cash:100_000_000,previousInvestment:0} as Parameters<typeof seasonBudget>[0];
    expect(seasonBudget({...club,previousInvestment:50_000_000},0)).toBeLessThan(seasonBudget(club,0));
    expect(seasonBudget({...club,previousInvestment:50_000_000},0)).toBeGreaterThan(20_000_000);
    expect(seasonBudget({...club,cash:-50_000_000},0)).toBe(0);
  });
  it("vaga vazia é recusada antes de avançar sem completar silenciosamente",()=>{
    const career=started("empty66");const tactics=career.coach!.tactics;
    const changed=must(career,{type:"setTactics",lineup:tactics.lineup.map((id,i)=>i===0?"":id)});
    expect(changed.coach!.tactics.lineup[0]).toBe("");
    // O comando não muda a carreira recebida quando é recusado.
    return import("../src/coach/career").then(({coachCommand})=>expect(coachCommand(changed,{type:"advance"}).error).toBe("emptyLineup"));
  },30000);
  it("a Champions do mundo termina com fase de liga e todas as eliminatórias",()=>{
    const career=playSeason(started("champions66")),state=career.competitions["cont1:UEFA"]!;
    expect(state.entrants).toHaveLength(36);expect(state.table?.every(row=>row.played===8)).toBe(true);
    expect(state.done).toBe(true);expect(state.champion).toBeTruthy();
    const games=career.fixtures.filter(f=>f.competition===state.id);
    expect(games).toHaveLength(189);expect(games.every(f=>f.result)).toBe(true);
    expect(career.history[0]?.invincible).toBe(career.competitions[career.history[0]!.league.startsWith("league:")?career.history[0]!.league:`league:${career.history[0]!.league}`]?.champion===career.coach?.club && career.lastReport?.record.lost===0);
    const stats=Object.values(career.competitionStats[state.id] ?? {});
    expect(stats.every(row=>(row.cleanSheets ?? 0)<=row.apps && (row.starts ?? 0)<=row.apps)).toBe(true);
    expect(fresh("champions66").competitionStats).toEqual({});
  },60000);
});
