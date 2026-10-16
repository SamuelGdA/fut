import { describe, expect, it } from "vitest";
import { cloneCareer, squadOf, FORMATION_SLOTS } from "../../src/coach";
import { addPromise } from "../../src/coach/events";
import { promiseProgress } from "../../src/coach/promises";
import { must, playStage, started } from "./helpers";

describe("D64: promessas conferidas na escalação do segundo turno",()=>{
  const base=started("d64-promises","slow");
  const reserve=squadOf(base,base.coach!.club).find(player=>!base.coach!.tactics.lineup.includes(player.id)&&FORMATION_SLOTS[base.coach!.tactics.formation].some(slot=>player.position===slot||player.alternates.includes(slot)))!;
  function promised(){
    const career=cloneCareer(base);
    addPromise(career,"starts",reserve.id,1,"talk");
    return career;
  }
  function secondTurn(start:boolean,injured=false){
    const career=promised();
    career.half=1;career.day=150;career.phase="event";career.event=null;career.matchEventArmed=false;
    const slot=FORMATION_SLOTS[career.coach!.tactics.formation].findIndex(position=>position===reserve.position||reserve.alternates.includes(position));
    career.coach!.tactics.lineup=career.coach!.tactics.lineup.map(id=>id===reserve.id?"":id);
    if(start)career.coach!.tactics.lineup[slot]=reserve.id;
    if(injured)career.players[reserve.id]!.injury={kind:"light",since:140,until:300,turns:1};
    return must(career,{type:"simulate"});
  }
  it("tem jogador definido, meta binária e prazo no começo do segundo turno",()=>{
    const career=promised(),promise=career.promises[0]!;
    expect(promise).toMatchObject({player:reserve.id,kind:"starts",target:1,until:150,status:"active"});
    expect(promiseProgress(career,promise).done).toBe(0);
  });
  it("permanece aberta após o primeiro turno",()=>{
    const after=playStage(promised());
    expect(after.promises.find(promise=>promise.player===reserve.id)?.status).toBe("active");
  });
  it("é cumprida por estar nos onze escolhidos, mesmo que a IA o substitua depois",()=>{
    expect(secondTurn(true).promises.find(promise=>promise.player===reserve.id)?.status).toBe("kept");
  });
  it("é quebrada quando fica fora dos onze, independentemente dos minutos posteriores",()=>{
    expect(secondTurn(false).promises.find(promise=>promise.player===reserve.id)?.status).toBe("broken");
  });
  it("dispensa cobrança se o atleta está lesionado no prazo",()=>{
    expect(secondTurn(false,true).promises.find(promise=>promise.player===reserve.id)?.status).toBe("kept");
  });
  it("não cria promessa no rápido nem no segundo turno",()=>{
    const fast=cloneCareer({...base,setup:{...base.setup,mode:"fast"}});
    addPromise(fast,"starts",reserve.id,1,"talk");expect(fast.promises).toHaveLength(0);
    const second=cloneCareer(base);second.half=1;
    addPromise(second,"starts",reserve.id,1,"talk");expect(second.promises).toHaveLength(0);
  });
  it("desfazer pela conversa não conta como cumprida",()=>{
    let career=must(promised(),{type:"openAction",kind:"locker"});
    career=must(career,{type:"confirmAction",payload:{kind:"locker",mode:"talk",players:[reserve.id]}});
    const talk=career.flow?.kind==="locker"?career.flow.talks[0]:null;
    expect(talk?.concern).toBe("promise");
    career=must(career,{type:"respond",item:talk!.id,decision:"release"});
    expect(career.promises[0]?.status).toBe("released");
  });
});
