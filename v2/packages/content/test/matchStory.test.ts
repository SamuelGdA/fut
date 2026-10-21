import { describe, expect, it } from "vitest";
import type { KeyMatchResult } from "@craque/engine";
import { matchStory, sceneOption } from "../src";
const result:KeyMatchResult={match:{competition:"cont1:CONMEBOL",team:"flamengo",opponent:"palmeiras",national:false,stage:"final",minute:88,score:[1,1],scene:"throughBall"},action:"team",success:true,won:true,score:[2,1],penalties:null,goals:0,assists:1,fans:2,legacy:1};
describe("D79: crônica de decisões no jornal",()=>{
  for(const locale of ["pt","en","es"] as const) it(`${locale}: conta adversário, momento, escolha e consequência reais`,()=>{
    const story=matchStory(locale,result,"cm","MOREIRA");
    expect(story.body).toContain("MOREIRA");
    expect(story.body).toContain("Palmeiras");expect(story.body).toContain("88");
    expect(story.body).toContain(sceneOption(locale,"throughBall","team")!.toLocaleLowerCase(locale));
    expect(story.body.length).toBeGreaterThan(100);
    expect(`${story.title} ${story.body}`).not.toMatch(/[—–]/);
    const lost=matchStory(locale,{...result,won:false,success:false,assists:0},"cm","MOREIRA");
    expect(lost.body).not.toBe(story.body);expect(lost.title).not.toBe(story.title);
    const safe=matchStory(locale,{...result,action:"safe",assists:0},"cm","MOREIRA");
    expect(safe.title).not.toBe(story.title);
    const penalty={...result,match:{...result.match,scene:"penalty" as const},action:"left",goals:1,assists:0};
    expect(matchStory(locale,penalty,"st").body).toContain({pt:"bater no canto esquerdo",en:"aim for the left corner",es:"rematar a la esquina izquierda"}[locale]);
    expect(matchStory(locale,{...penalty,goals:0,match:{...penalty.match,scene:"penaltySave"}},"gk").body).toContain({pt:"se lançar para o lado esquerdo",en:"dive towards the left side",es:"lanzarse hacia el lado izquierdo"}[locale]);
  });
  it("gol olímpico só vira manchete quando a tentativa entra",()=>{
    const goal={...result,match:{...result.match,scene:"corner" as const},action:"bold",goals:1,assists:0};
    expect(matchStory("pt",goal,"cm").body).toContain("Um gol olímpico");
    expect(matchStory("pt",{...goal,success:false,won:false,goals:0},"cm").body).not.toContain("Um gol olímpico");
  });
});
