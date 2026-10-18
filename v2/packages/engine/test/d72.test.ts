import { describe, expect, it } from "vitest";
import { cloneCareer } from "../src/coach/career";
import { changeCash } from "../src/coach/finance";
import { applyEffects, pickStageEvent } from "../src/coach/events";
import { applyPeriodFinances, seasonPrizes } from "../src/coach/review";
import { askingTerms, roundPlayerPrice, transferPlayer } from "../src/coach/market";
import { valueOf } from "../src/coach/players";
import { baseMarketValue, marketValue, marketValueCeiling } from "../src/player/value";
import { stream } from "../src/rng";
import { buildSeason, finishLeagues } from "../src/coach/competitions";
import { started } from "./coach/helpers";

describe("D72: diretoria e caixa",()=>{
  it("€400M é o máximo nos dois modos; idade, OVR e acréscimos continuam limitados",()=>{
    const career=cloneCareer(started("d72-values"));
    let player=Object.values(career.players)[0]!;
    const rng=stream("d72-values","market");
    player.club="real-madrid"; player.role="star";
    for(let age=16;age<=40;age++) for(let ovr=40;ovr<=110;ovr++) {
      player={...player,birthYear:career.year-age,ovr};
      const ceiling=marketValueCeiling(age);
      expect(ceiling).toBeLessThanOrEqual(400_000_000);
      expect(baseMarketValue(ovr,age)).toBeLessThanOrEqual(ceiling);
      expect(marketValue(rng,ovr,age)).toBeLessThanOrEqual(ceiling);
      expect(valueOf(player,career.year)).toBeLessThanOrEqual(ceiling);
      expect(askingTerms(career,player,"barcelona",rng).price).toBeLessThanOrEqual(ceiling);
      expect(roundPlayerPrice(valueOf(player,career.year)*2,age)).toBeLessThanOrEqual(ceiling);
    }
    player={...player,ovr:99,birthYear:career.year-20};
    expect(valueOf(player,career.year)).toBe(400_000_000);
    player.ovr=90;expect(valueOf(player,career.year)).toBeLessThan(250_000_000);
    player={...player,ovr:99,birthYear:career.year-30};career.players[player.id]=player;
    expect(valueOf(player,career.year)).toBeLessThan(210_000_000);
    const buyer=career.clubs.barcelona!,seller=career.clubs["real-madrid"]!;
    const beforeBuyer=buyer.cash,beforeInvestment=seller.investment ?? 0;
    transferPlayer(career,player.id,"barcelona",1e9,"purchase");
    expect(beforeBuyer-buyer.cash).toBe(marketValueCeiling(30));
    expect(beforeInvestment-(seller.investment ?? 0)).toBe(marketValueCeiling(30));
  });
  it("Diretoria animada pode sair no primeiro turno, nunca no segundo",()=>{
    const career=cloneCareer(started("d72-event","slow"));
    let first=0;
    for(let i=0;i<1000;i++){
      const sample={...career,setup:{...career.setup,seed:`d72-event-${i}`}};
      sample.half=0; first+=Number(pickStageEvent(sample).event?.id==="boardBonus");
      sample.half=1; expect(pickStageEvent(sample).event?.id).not.toBe("boardBonus");
    }
    expect(first).toBeGreaterThan(0);
  });
  it("receita, premiação, evento e venda respeitam €500M sem perdoar dívida",()=>{
    const career=cloneCareer(started("d72-cash")),club=career.clubs[career.coach!.club]!;
    changeCash(club,1e10);expect(club.cash).toBe(500_000_000);
    changeCash(club,-600_000_000);expect(club.cash).toBe(-100_000_000);
    club.cash=499_999_999;
    applyEffects(career,[{type:"cash",amount:10_000_000}],null,"event");expect(club.cash).toBe(500_000_000);
    for(const team of Object.values(career.clubs))team.cash=499_999_999;
    applyPeriodFinances(career,1);
    finishLeagues(career.competitions,()=>70);seasonPrizes(career,new Set(),new Set());
    const player=Object.values(career.players).find(p=>p.club===club.id)!;
    const buyer=Object.keys(career.clubs).find(id=>id!==club.id)!;
    transferPlayer(career,player.id,buyer,100_000_000,"sale");
    expect(club.cash).toBe(500_000_000);
    expect(Object.values(career.clubs).every(team=>team.cash<=500_000_000)).toBe(true);
  });
  it("campeão da Europa League não aparece simultaneamente nas três competições UEFA",()=>{
    const career=cloneCareer(started("d72-uefa"));
    const memory={...career.memory,continental:{...career.memory.continental,"cont2:UEFA":{winner:"real-madrid",runnerUp:"barcelona"}}};
    const built=buildSeason({seed:career.setup.seed,year:career.year,clubs:career.clubs,memory});
    const european=Object.values(built.competitions).filter(state=>["cont1:UEFA","cont2:UEFA","cont3:UEFA"].includes(state.id));
    const all=european.flatMap(state=>state.entrants);
    expect(new Set(all).size).toBe(all.length);
    expect(built.competitions["cont1:UEFA"]?.entrants).toContain("real-madrid");
  });
});
