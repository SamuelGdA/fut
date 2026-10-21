import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { abrir, abrirMomento, auditar, esperarQueCaiba, OPCOES, fixturePlans } from "./apoio";
import { deflateRawSync } from "node:zlib";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json",import.meta.url),"utf8")) as { moments: Record<string,{file:string;index:number}> };
for (const theme of ["light","dark"] as const) {
  test(`D78: promessa rápida explica os dois anos e mostra as três metas inteiras, ${theme}`,async({page},info)=>{
    await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
    const raw=await readFile(new URL(`./fixtures/${metadata.moments.fastTwo!.file}`,import.meta.url));
    const save=JSON.parse(raw.toString()) as {setup:{seed:string}};
    const index=fixturePlans[save.setup.seed]!.findIndex(step=>step.kind==="promise");
    expect(index).toBeGreaterThan(0);
    await abrirMomento(page,raw,index,{theme});
    await expect(page.locator(".drama-heading .decision-body")).toContainText("a meta soma as duas temporadas");
    const goals=await page.locator(".promise-option-target").allTextContents();
    expect(goals).toHaveLength(3);
    expect(Number(goals[0]!.match(/\d+/)?.[0])).toBeGreaterThanOrEqual(20);
    expect(await page.locator(OPCOES).evaluateAll(nodes=>nodes.every(node=>node.getBoundingClientRect().bottom<=node.closest(".season-decision-window")!.getBoundingClientRect().bottom-2))).toBe(true);
    await esperarQueCaiba(page); await auditar(page,`Promessa rápida ${theme}`);
    await page.screenshot({path:info.outputPath(`promessa-dupla-${theme}.png`),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
  });
  for(const role of ["st","gk"] as const) test(`D78: reinvenção com ícones e chips, ${role}, ${theme}`,async({page},info)=>{
    await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
    const source=metadata.moments[role==="st"?"veteran":"gk"]!;
    const raw=await readFile(new URL(`./fixtures/${source.file}`,import.meta.url));
    const seed=(JSON.parse(raw.toString()) as {setup:{seed:string}}).setup.seed;
    const moment={index:fixturePlans[seed]!.findIndex(step=>step.kind==="veteran")};
    await abrirMomento(page,raw,moment.index,{theme});
    const cards=page.locator(`${OPCOES}[data-path]`);
    await expect(cards).toHaveCount(6);
    await expect(cards.locator(".option-icon svg")).toHaveCount(6);
    if(role==="gk")await expect(page.locator(".career > [role='status']")).not.toBeEmpty();
    expect(await cards.locator(".veteran-effects > .numeric").allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining("+ Passe"),expect.stringContaining("+2 legado")]));
    const bounds=await cards.evaluateAll(nodes=>nodes.map(node=>{
      const b=node.getBoundingClientRect(),p=node.closest(".season-decision-window")!.getBoundingClientRect();
      return {bottom:b.bottom,limit:p.bottom,width:node.scrollWidth,available:node.clientWidth};
    }));
    expect(bounds.every(b=>b.bottom<=b.limit+1&&b.width<=b.available+1),JSON.stringify(bounds)).toBe(true);
    await esperarQueCaiba(page); await auditar(page,`Reinvenção ${theme}`);
    await page.screenshot({path:info.outputPath(`veterano-${theme}.png`),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
  });
  test(`D78: hipotético legível conserva a primeira escolha principal de cada ano, ${theme}`,async({page},info)=>{
    await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
    const raw=await readFile(new URL("./fixtures/colecao-m23.json",import.meta.url));
    const save=JSON.parse(raw.toString()) as {setup:{seed:string}};
    const years=new Set<number>(),expected:number[]=[];
    for(const [i,d] of fixturePlans[save.setup.seed]!.entries()) {
      if(!["match","promise","veteran"].includes(d.kind)&&!years.has(d.year)){years.add(d.year);expected.push(i);}
    }
    await abrir(page,{theme},`/#c=z${deflateRawSync(raw).toString("base64url")}`);
    await page.getByRole("link",{name:"Hipotético",exact:true}).click();
    expect(await page.locator(".what-if-chapter li").evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute("data-choice-index"))))).toEqual(expected);
    expect(await page.locator("#capitulo-whatIf .summary-chapter-title").evaluate(n=>getComputedStyle(n).fontFamily)).toContain("Big Shoulders");
    await expect(page.locator(".what-if-chapter")).toContainText(/Assinar contrato: .+/);
    await auditar(page,`Hipotético ${theme}`);
    await page.screenshot({path:info.outputPath(`hipotetico-${theme}.png`),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
  });
}

for(const key of ["fastTwo","fastFirst","fastSecond","fastNone"]) test(`D78: ritmo rápido revela os anos na ordem, ${key}`,async({page},info)=>{
  await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
  const moment=metadata.moments[key]!;
  const raw=await readFile(new URL(`./fixtures/${moment.file}`,import.meta.url));
  const save=JSON.parse(raw.toString()) as {setup:{seed:string}};
  const plan=fixturePlans[save.setup.seed]!;
  const year=plan[moment.index]!.year;
  await abrirMomento(page,raw,moment.index,{theme:key==="fastTwo"?"dark":"light"});
  let matches=0;
  let end=moment.index;
  for(let i=moment.index;i<plan.length;i++) {
    const decision=plan[i]!;end=i;
    if(decision.year>=year+2)break;
    if(decision.kind==="promise") {
      await expect(page.locator(".drama-heading .decision-body")).toContainText("soma as duas temporadas");
      await expect(page.locator(OPCOES).first()).toContainText(/\d+\+/);
    }
    if(decision.match) {
      matches++;
      await expect(page.locator(".match-broadcast-top > span").last()).toHaveText(String(decision.year));
      if(decision.year===year+1) {
        await expect(page.locator(".play[data-years]").first()).toHaveAttribute("data-years",String(year));
        await expect(page.locator(".play[data-years]").first()).toBeVisible();
        expect(await page.locator(OPCOES).evaluateAll(nodes=>nodes.every(node=>{
          const frame=node.closest(".season-decision-window")!.getBoundingClientRect();
          return node.getBoundingClientRect().bottom<=frame.bottom-4 && node.scrollHeight<=node.clientHeight+1;
        })),"O resumo do primeiro ano não pode cortar as escolhas do segundo").toBe(true);
        await esperarQueCaiba(page);
        await page.screenshot({path:info.outputPath(`${key}-segundo-ano.png`),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
      }
    }
    const headerBefore = decision.match ? await page.locator(".match-broadcast").boundingBox() : null;
    await page.locator(OPCOES).nth(decision.option).click();
    if(!["match","promise","veteran"].includes(decision.kind))await page.getByRole("button",{name:"Confirmar escolha",exact:true}).click();
    if(decision.match) {
      await expect(page.locator(".match-outcome")).toBeVisible();
      await page.evaluate(()=>{Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"));});
      const headerAfter = await page.locator(".match-broadcast").boundingBox();
      expect(headerAfter!.y).toBeCloseTo(headerBefore!.y,1);
      if(decision.year===year+1)await expect(page.locator(".play[data-years]").first()).toHaveAttribute("data-years",String(year));
      await page.waitForTimeout(650);
      expect(await page.locator(".season-decision-slide[data-active] .match-continue").evaluate(button=>button.getBoundingClientRect().bottom<=button.closest(".season-decision-window")!.getBoundingClientRect().bottom-1),"O resultado e o botão precisam caber sem rolar").toBe(true);
      if(decision.year===year+1)await page.screenshot({path:info.outputPath(`${key}-resultado-segundo-ano.png`),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
      await page.evaluate(()=>{Reflect.deleteProperty(document,"hidden");document.dispatchEvent(new Event("visibilitychange"));});
      await page.locator(".season-decision-slide[data-active] .match-continue").click();
    }
    await expect(page.locator(".season-decision-slide[data-active] .decision")).not.toHaveAttribute("aria-labelledby",`decisao-${decision.id}`);
    await expect(page.locator(".season-decision-slide")).toHaveCount(1);
  }
  expect(matches).toBe(key==="fastTwo"?2:key==="fastNone"?0:1);
  expect(plan[end]!.history.filter(y=>y>=year&&y<year+2)).toHaveLength(2);
  await expect(page.locator(".play[data-years]").first()).toHaveAttribute("data-years",new RegExp(String(year+1)));
  await esperarQueCaiba(page);
});
