import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, auditar, esperarQueCaiba, fixturePlans, OPCOES } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json",import.meta.url),"utf8")) as {moments:Record<string,{file:string;index:number}>};
for(const theme of ["light","dark"] as const) for(const scene of ["corner","decisivePenalty"] as const) test(`D79: ${scene}, texto, resultado e cards inteiros, ${theme}`,async({page},info)=>{
  await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
  const sample=metadata.moments[scene]!;
  await abrirMomento(page,await readFile(new URL(`./fixtures/${sample.file}`,import.meta.url)),sample.index,{theme});
  const choices=page.locator(OPCOES);
  await expect(choices).toHaveCount(scene==="corner"?3:2);
  if(scene==="corner") {
    expect(await choices.locator(".option-title").allTextContents()).toEqual(["Tentar o gol olímpico","Cruzar na área","Cobrar escanteio curto"]);
    expect(await choices.locator(".drama-hint").allTextContents()).toEqual(["Mais protagonismo.","Bônus individual menor.","Sem bônus individual."]);
  } else {
    await expect(page.locator(".decision-title")).toHaveText("O pênalti decisivo");
    expect(await choices.locator(".option-title").allTextContents()).toEqual(["Assumir a cobrança","Deixar com o companheiro"]);
  }
  expect((await choices.allTextContents()).join(" ")).not.toMatch(/%|Proteger o espaço/);
  await esperarQueCaiba(page);await auditar(page,`D79 ${scene} ${theme}`);
  await choices.first().click();
  // Pausa pela mesma regra de visibilidade usada ao trocar de aba, para auditar o resultado.
  await page.evaluate(()=>{Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"));});
  await page.waitForTimeout(650);
  await expect(page.locator(".match-outcome")).toBeVisible();
  const cards=page.locator(".career-right > .result-layer, .career-right > .play");
  expect(await cards.evaluateAll(nodes=>nodes.every(n=>!["auto","scroll"].includes(getComputedStyle(n).overflowY)&&n.scrollHeight<=n.clientHeight+1))).toBe(true);
  expect(await page.locator(".season-decision-slide[data-active] .match-continue").evaluate(n=>n.getBoundingClientRect().bottom<=n.closest(".season-decision-window")!.getBoundingClientRect().bottom)).toBe(true);
  expect(await page.locator(".result-eyebrow").first().evaluate(n=>getComputedStyle(n).fontFamily)).toContain("Big Shoulders");
  await auditar(page,`D79 resultado ${scene} ${theme}`);
  await page.screenshot({path:info.outputPath(`d79-${scene}-${theme}.png`),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
});

test("D79: ficar informa continental e os números se alinham sem rolagem",async({page},info)=>{
  await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
  const sample=metadata.moments.stayContinental!;
  await abrirMomento(page,await readFile(new URL(`./fixtures/${sample.file}`,import.meta.url)),sample.index,{theme:"light"});
  const stay=page.locator(OPCOES).filter({hasText:"Ficar onde está"});
  await stay.click();await expect(stay.locator(".option-detail")).toContainText(/Disputa|Champions|Libertadores|Europa|Conference|Sul-Americana/);
  const stats=page.locator(".career-right > .play .play-stats");
  if(info.project.name==="desktop") {
    await expect(stats).toBeVisible();
    expect(await stats.locator("dd").evaluateAll(nodes=>{const tops=nodes.map(n=>n.getBoundingClientRect().top);return Math.max(...tops)-Math.min(...tops)<1;})).toBe(true);
    const card=page.locator(".career-right > .play");
    expect(await card.evaluate(n=>!["auto","scroll"].includes(getComputedStyle(n).overflowY))).toBe(true);
    await card.locator(".play-details-button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").locator(".play-season-details")).toBeVisible();
  }
  await page.screenshot({path:info.outputPath("d79-permanencia.png"),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
});

test("D79: fim de carreira preenche a mesma largura da decisão",async({page},info)=>{
  await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
  const raw=await readFile(new URL("./fixtures/colecao-m23.json",import.meta.url));
  const seed=(JSON.parse(raw.toString()) as {setup:{seed:string}}).setup.seed;
  const plan=fixturePlans[seed]!;const last=plan.at(-1)!;
  await abrirMomento(page,raw,plan.length-1,{theme:"light"});
  await page.locator(OPCOES).nth(last.option).click();
  if(!["match","promise","veteran"].includes(last.kind))await page.getByRole("button",{name:"Confirmar escolha",exact:true}).click();
  if(last.match)await page.locator(".season-decision-slide[data-active] .match-continue").click();
  await expect(page.locator(".end-panel")).toBeVisible();
  await page.waitForTimeout(650);
  expect(await page.locator(".end-panel").evaluate(n=>{const b=n.getBoundingClientRect(),f=n.closest(".season-decision-window")!.getBoundingClientRect();return Math.abs(b.left-f.left)<1&&Math.abs(b.right-f.right)<1;})).toBe(true);
  await esperarQueCaiba(page);await auditar(page,"D79 fim de carreira");
  await page.screenshot({path:info.outputPath("d79-fim.png"),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
});

test("D79: laboratório usa os lances e chips atuais",async({page},info)=>{
  await abrir(page,{theme:"light",motion:"reduced"},"http://127.0.0.1:4174/#lab");
  await page.getByRole("tab",{name:"Design",exact:true}).click();
  const lab=page.locator(".match-lab");await expect(lab).toBeVisible();
  await lab.getByRole("button",{name:/Direto do escanteio ·/}).click();
  await expect(lab.locator(".drama-option .option-title")).toHaveText(["Tentar o gol olímpico","Cruzar na área","Cobrar escanteio curto"]);
  await lab.getByRole("button",{name:/O pênalti decisivo ·/}).click();
  await expect(lab.locator(".drama-option")).toHaveCount(2);
  await lab.locator(".drama-option").first().click();
  await expect(lab.locator(":scope > p[role='status']")).toHaveText("Assumir a cobrança");
  await lab.locator(".match-continue").click();
  await lab.getByRole("button",{name:"A palavra fica",exact:true}).click();
  await expect(lab.locator(".promise-option-effects [data-tone='bad']")).toHaveCount(2);
  await lab.getByRole("button",{name:"A experiência muda o jogo",exact:true}).click();
  await expect(lab.locator(".veteran-effects [data-tone='bad']")).toHaveCount(6);
  await expect(lab.locator(".season-rival, .drama-rival")).toHaveCount(0);
  await auditar(page,"D79 laboratório",".match-lab");
  await lab.locator(".match-lab-preview").screenshot({path:info.outputPath("d79-laboratorio.png")});
});

for(const locale of ["pt","en","es"] as const) test(`D79: todas as folhas do jornal cabem com crônicas, ${locale}`,async({page},info)=>{
  await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:800});
  const raw=await readFile(new URL("./fixtures/colecao-m23.json",import.meta.url));
  await abrir(page,{locale,motion:"reduced",theme:"light"},`/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.locator('a[href="#capitulo-newspaper"]').click();
  const spread=page.locator(".paper-stage .paper-spread");
  const next=page.locator(".paper-turn").nth(1);
  const defects:Array<{year:string|null;leaf:string|null;overflow:number}>=[];
  let editions=0,stories=0;
  for(let i=0;i<30;i++) {
    const year=await spread.getAttribute("data-year");
    const rows=await spread.locator(".paper-page").evaluateAll(nodes=>nodes.map(n=>({year:n.getAttribute("data-year"),leaf:n.getAttribute("data-leaf"),overflow:n.scrollHeight-n.clientHeight})));
    defects.push(...rows.filter(r=>r.overflow>1));
    stories+=await spread.locator(".paper-moment-story").count();editions++;
    await expect(spread.locator(".season-rival")).toHaveCount(0);
    if(await next.isDisabled())break;
    await next.click();await expect(spread).not.toHaveAttribute("data-year",year!);
  }
  expect(editions).toBeGreaterThan(15);expect(stories).toBeGreaterThan(10);
  expect(defects).toEqual([]);
});
for(const kind of ["promise","veteran"] as const) test(`D79: benefícios e custos em chips, ${kind}`,async({page},info)=>{
  await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
  const sample=metadata.moments[kind]!;
  await abrirMomento(page,await readFile(new URL(`./fixtures/${sample.file}`,import.meta.url)),sample.index,{theme:"light"});
  const costs=page.locator(`${OPCOES} [data-tone='bad']`);
  await expect(costs).toHaveCount(kind==="promise"?2:6);
  if(kind==="promise") await expect(page.locator(".drama-hint")).toHaveCount(0);
  expect(await page.locator(OPCOES).evaluateAll(nodes=>nodes.every(n=>n.getBoundingClientRect().bottom<=n.closest(".season-decision-window")!.getBoundingClientRect().bottom+1))).toBe(true);
  await auditar(page,`D79 chips ${kind}`);
  await page.screenshot({path:info.outputPath(`d79-${kind}.png`),style:".toast-viewport, .toast-viewport * {visibility:hidden !important}"});
});
