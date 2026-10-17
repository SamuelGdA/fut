import { describe, expect, it } from "vitest";
import { CLUBS } from "@craque/world";
import { rankedWorldCupClubs, rememberContinentalRanking } from "../src/world/qualification";
import { clubWorldCupEntrants } from "../src/coach/competitions";
import { cloneCareer } from "../src/coach/career";
import { historyEntry, seasonBudget, seasonOffers } from "../src/coach/review";
import { nationalLegacy } from "../src/season/nationalLegacy";
import { decideAwards, type PlayerAwardInput } from "../src/awards/awards";
import type { SeasonRecord } from "../src/career/types";
import { started } from "./coach/helpers";

describe("D71: classificação e mercado reconhecem campanhas reais", () => {
  it("ranking usa só quatro temporadas e respeita países, preservando campeões distintos", () => {
    const country = (id: string) => id.startsWith("br") ? "BRA" : "ARG";
    const ranking = [{br1:100,br2:90,br3:80,ar1:70,ar2:60}];
    expect(rankedWorldCupClubs([],ranking,4,country)).toEqual(["br1","br2","ar1","ar2"]);
    expect(rankedWorldCupClubs(["br1","br2","br3"],ranking,4,country)).toEqual(["br1","br2","br3","ar1"]);
    expect(rememberContinentalRanking([{old:9},{},{},{expired:999}],{now:1})).toEqual([{now:1},{old:9},{},{}]);
  });
  it("Criciúma sem campanha continental não entra no Mundial nem com força 99", () => {
    const career = cloneCareer(started("d71-criciuma"));
    const club = CLUBS.find(club => club.name.includes("Criciúma"))!;
    career.clubs[club.id]!.strength=99;
    const entrants=clubWorldCupEntrants({seed:career.setup.seed,year:2029,clubs:career.clubs,memory:career.memory}, id=>career.clubs[id]?.strength ?? 60);
    expect(entrants).not.toContain(club.id);
    expect(entrants).toHaveLength(32);
    expect(new Set(entrants).size).toBe(32);
  },20_000);
  it("vice da Série A recebe pelo menos uma oportunidade doméstica da Série A", () => {
    const source=cloneCareer(started("d71-criciuma"));
    const id=CLUBS.find(club=>club.name.includes("Criciúma"))!.id;
    source.coach={...source.coach!,club:id};source.clubs[id]!.division=1;source.reputation=26;
    const last={...historyEntry(source,null,false,false,false,false),division:1 as const,position:2,tableSize:20,titles:[],objectiveMet:true};
    source.history=[last];
    for(let i=0;i<40;i++) {
      const career={...source,setup:{...source.setup,seed:`d71-offers-${i}`}};
      const offers=seasonOffers(career,false).filter(offer=>!offer.stay);
      expect(offers.some(offer=>career.clubs[offer.club]?.country==="BRA" && career.clubs[offer.club]?.division===1)).toBe(true);
    }
  },20_000);
});

describe("D71: dinheiro guardado tem valor e gastar tem consequência", () => {
  it("economia de várias temporadas acumula poder de compra sem criar dinheiro", () => {
    const source=started("d71-criciuma"), reference=source.clubs[source.coach!.club]!;
    const run=(spend:boolean)=>{
      const club={...reference,revenue:100_000_000,cash:30_000_000,previousInvestment:0};
      let budget=seasonBudget(club,0);const budgets:number[]=[];
      for(let year=0;year<6;year++) {
        const spent=spend?budget:0;
        club.cash-=spent;club.cash+=25_000_000;
        club.previousInvestment=spent;
        budget=seasonBudget(club,budget-spent);budgets.push(budget);
        expect(budget).toBeLessThanOrEqual(club.cash+15_000_000);
        expect(club.cash).toBeGreaterThanOrEqual(-15_000_000);
      }
      return budgets;
    };
    const saving=run(false), spending=run(true);
    expect(saving.at(-1)).toBeGreaterThan(saving[0]! * 2);
    expect(saving.at(-1)).toBeGreaterThan(spending.at(-1)! * 3);
    expect(spending[0]).toBeLessThan(32_000_000);
    // Regressão do Barcelona: gastar 107 de uma verba de 151 não pode gerar
    // um novo orçamento maior só porque a receita cresceu pouco.
    const rich={...reference,revenue:488_900_000,cash:244_700_000,previousInvestment:107_000_000};
    expect(seasonBudget(rich,44_100_000)).toBeLessThan(151_100_000);
  });
});

describe("D71: reconhecimento internacional", () => {
  it("fora da Europa o melhor do mundo é possível e muito mais raro, mesmo em ano histórico", () => {
    const player:PlayerAwardInput={eligible:true,position:"st",ovr:99,age:26,games:60,goals:90,assists:25,leagueGoals:55,cleanSheets:35,playsInUefa:true,success:{league:true,cup:true,primary:true,worldCup:true,nationsCup:false},crownEntries:[]};
    let europe=0,outside=0;
    for(let i=0;i<1500;i++) {
      const seed=`d71-ballot-${i}`;
      if(decideAwards(seed,2030,{},player,true).ballonDor.winner==="player")europe++;
      if(decideAwards(seed,2030,{},{...player,playsInUefa:false},true).ballonDor.winner==="player")outside++;
    }
    expect(outside).toBeGreaterThan(0);
    expect(outside).toBeLessThan(1500*0.025);
    expect(europe).toBeGreaterThan(outside*20);
    expect(decideAwards("ordinary",2030,{},{...player,playsInUefa:false,goals:30,assists:5},true).ballonDor.winner).not.toBe("player");
  });
  it("seleção menor pode ter lenda sem títulos, enquanto a forte exige mais", () => {
    const record={nationality:"ANG",position:"st",ovrEnd:90,national:{games:100,goals:25,assists:10,cleanSheets:20,competitions:[]}} as unknown as SeasonRecord;
    expect(nationalLegacy([record],"ANG",65).level).toBe("legend");
    expect(nationalLegacy([{...record,nationality:"BRA"}],"BRA",88).level).toBe("respected");
    expect(nationalLegacy([],"BRA",88)).toMatchObject({level:"none",games:0,score:0});
    expect(nationalLegacy([record],"BRA",88).games).toBe(0);
  });
});
