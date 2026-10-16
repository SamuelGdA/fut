import { describe,expect,it } from "vitest";
import { COMPETITIONS } from "./competitions";
import { compareHonours,honourPrestige } from "./honourOrder";
describe("importância na vitrine",()=>{
  it("todo prêmio específico de competição fica abaixo de qualquer taça do catálogo",()=>{
    const competitions=Object.values(COMPETITIONS);
    for(const competition of competitions)for(const title of competitions){
      expect(honourPrestige({kind:"award",id:"bestPlayer",competition:competition.id})).toBeLessThan(honourPrestige({kind:"title",id:title.id}));
    }
  });
  it("ordena por importância sem dar prioridade a uma coleção mais numerosa",()=>{
    const items=[{kind:"title",id:"super:ENG"},{kind:"title",id:"cont1:UEFA"},{kind:"award",id:"ballonDor"}] as const;
    expect([...items].sort(compareHonours).map(item=>item.id)).toEqual(["ballonDor","cont1:UEFA","super:ENG"]);
  });
});
