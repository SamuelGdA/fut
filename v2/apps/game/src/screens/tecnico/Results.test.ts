import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { coachCommand, createCoachCareer, cloneCareer } from "@craque/engine/coach";
import { historyEntry, leagueState } from "../../../../../packages/engine/src/coach/review";
import { buildReport } from "../../../../../packages/engine/src/coach/report";
import { ResultsView } from "./Results";

describe("D72: campeão sem copa nem prêmio individual",()=>{
  it("mostra a taça da liga, a vitrine e Campeão; primeiro turno não recebe título",()=>{
    const fresh=createCoachCareer({seed:"d72-vitrine",startYear:2026,mode:"fast",identity:{name:"Teste",nationality:"BRA"}},{players:[],free:[]});
    const career=cloneCareer(coachCommand(fresh,{type:"acceptOffer",offer:fresh.offers[0]!.id}).career);
    const league=leagueState(career,career.coach!.club)!;
    league.champion=career.coach!.club;league.done=true;
    career.history=[historyEntry(career,null,false,false,false,false)];
    career.lastReport=buildReport(career,[],[],true,false);
    expect(career.lastReport.awards).toHaveLength(0);
    expect(career.lastReport.competitions.some(item=>item.champion)).toBe(false);
    const html=renderToStaticMarkup(createElement(ResultsView,{career,onContinue:()=>{}}));
    expect(html).toContain("Conquistas da temporada");
    expect(html).toContain("tec-season-honours");
    expect(html).toContain("Campeão");
    career.lastReport={...career.lastReport,final:false,partial:true};
    const half=renderToStaticMarkup(createElement(ResultsView,{career,onContinue:()=>{}}));
    expect(half).not.toContain("tec-season-honours");
    expect(half).not.toContain(">Campeão<");
  });
});
