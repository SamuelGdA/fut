import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, auditar, esperarQueCaiba, OPCOES } from "./apoio";

const moments = (JSON.parse(await readFile(new URL("./fixtures/momentos-m41.json",import.meta.url),"utf8")) as {moments:Record<string,{file:string;index:number}>}).moments;

for (const theme of ["light","dark"] as const) {
  test(`D71: pilhas redistribuem troféus e seleção tem legado, ${theme}`,async({page},info)=>{
    if(info.project.name==="celular")await page.setViewportSize({width:360,height:640});
    // D108: a amostra da América é o centroavante do Brasil, ídolo sem a Copa do Mundo.
    const replay=await readFile(new URL("./fixtures/america-m41.json",import.meta.url));
    await abrir(page,{theme},`/#c=z${deflateRawSync(replay).toString("base64url")}`);
    await page.getByRole("link",{name:"Caminho",exact:true}).click();
    // D106: centroavante do Brasil sem Copa do Mundo. Os números davam lenda; o país cobra a Copa, e a tela diz por quê.
    await expect(page.getByText("Legado na seleção: Ídolo",{exact:true})).toBeVisible();
    await expect(page.getByText("Números de lenda, mas sem a Copa do Mundo o país guarda você como ídolo.",{exact:true})).toBeVisible();
    const stack=page.locator('.honour-stack[data-multiple]').first();
    await stack.scrollIntoViewIfNeeded();
    const count=Number(await stack.getAttribute('data-count'));
    await expect(stack.locator('.honour-count')).toHaveText(`×${count}`);
    await expect(stack.locator('.honour-copy')).toHaveCount(1);
    // D90: as cópias abrem num painel flutuante, com o ano de cada uma.
    if(info.project.name==="desktop")await stack.hover();
    else await stack.tap();
    const items=page.locator('.honour-pile .honour-pile-item');
    await expect(items).toHaveCount(count);
    await expect.poll(()=>items.evaluateAll(nodes=>nodes.every(node=>node.getBoundingClientRect().width>=28 && /\d{4}/.test(node.textContent ?? "")))).toBe(true);
    await expect.poll(()=>page.locator('.timeline-card').evaluateAll(nodes=>nodes.every(node=>node.scrollWidth<=node.clientWidth+1))).toBe(true);
    await expect(page.getByRole('button',{name:'Legado na seleção',exact:true})).toHaveCount(0);
    await auditar(page,"Pilhas de títulos e legado nacional");
    await page.screenshot({path:info.outputPath(`pilhas-${theme}.png`)});
    if(info.project.name==="desktop") {
      await page.getByRole('heading',{name:'Linha do tempo',exact:true}).hover();
      await expect(page.locator('.honour-pile')).toHaveCount(0);
      await expect(stack.locator('.honour-count')).toHaveText(`×${count}`);
    } else {
      await page.keyboard.press("Escape");
      await expect(page.locator('.honour-pile')).toHaveCount(0);
    }
    await page.getByRole("link",{name:"Hipotético",exact:true}).click();
    await expect(page.getByText(/Esta sessão tem ajustes de teste/)).toHaveCount(0);
    expect(await page.locator('.what-if-chapter').evaluate(node=>getComputedStyle(node).fontFamily)).toContain("Schibsted");
    expect(await page.locator('.what-if-chapter li').evaluateAll(nodes=>nodes.every(node=>node.scrollWidth<=node.clientWidth+1))).toBe(true);
  });

  test(`D71: ultimato mostra a frase completa, ${theme}`,async({page},info)=>{
    if(info.project.name==="celular")await page.setViewportSize({width:360,height:640});
    const replay=await readFile(new URL(`./fixtures/${moments.ultimatum!.file}`,import.meta.url));
    await abrirMomento(page,replay,moments.ultimatum!.index,{theme});
    await page.locator(OPCOES).filter({has:page.getByText("Ficar",{exact:true})}).click();
    await page.getByRole("button",{name:"Confirmar escolha",exact:true}).click();
    // D84: no PC a frase inteira fica na mensagem do resultado, sem aba repetida; no celular a aba guarda a leitura completa.
    if(info.project.name==="celular") await page.getByRole("region",{name:"O último lance",exact:true}).getByRole("button").click();
    else await expect(page.getByRole("region",{name:"O último lance",exact:true})).toHaveCount(0);
    const body=page.locator(info.project.name==="celular" ? ".play-event-text" : ".result-body").filter({hasText:"o mercado volta ao normal"});
    await expect(body).toBeVisible();
    await expect(body).toContainText("Só a próxima decisão terá propostas de clubes mais fracos, se houver transferência; depois o mercado volta ao normal.");
    expect(await body.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
    expect(await body.evaluate(node=>getComputedStyle(node).getPropertyValue("-webkit-line-clamp"))).not.toMatch(/^[1-9]/);
    await esperarQueCaiba(page);
    await auditar(page,"Resultado do ultimato completo");
    await page.screenshot({path:info.outputPath(`ultimato-${theme}.png`)});
  });
}
