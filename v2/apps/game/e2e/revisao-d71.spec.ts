import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, auditar, esperarQueCaiba, OPCOES } from "./apoio";

for (const theme of ["light","dark"] as const) {
  test(`D71: pilhas redistribuem troféus e seleção tem legado, ${theme}`,async({page},info)=>{
    if(info.project.name==="celular")await page.setViewportSize({width:360,height:640});
    const replay=await readFile(new URL("./fixtures/colecao-m15.json",import.meta.url));
    await abrir(page,{theme},`/#c=z${deflateRawSync(replay).toString("base64url")}`);
    await page.getByRole("link",{name:"Caminho",exact:true}).click();
    await expect(page.getByText("Legado na seleção: Lenda",{exact:true})).toBeVisible();
    const stack=page.locator('.honour-stack[data-multiple]').first();
    const copies=stack.locator('.honour-copy');
    await copies.last().scrollIntoViewIfNeeded();
    const count=await copies.count();
    await expect(stack.locator('.honour-count')).toHaveText(`×${count}`);
    const collapsed=await copies.first().evaluate(node=>node.getBoundingClientRect().width);
    if(info.project.name==="desktop")await copies.last().hover();
    else await copies.last().locator('.honour-token').tap();
    await expect.poll(()=>copies.first().evaluate(node=>node.getBoundingClientRect().width)).toBeGreaterThan(collapsed+15);
    await expect.poll(()=>copies.evaluateAll(nodes=>nodes.every(node=>node.getBoundingClientRect().width>=28))).toBe(true);
    expect(await page.locator('.timeline-card').evaluateAll(nodes=>nodes.every(node=>node.scrollWidth<=node.clientWidth+1))).toBe(true);
    await auditar(page,"Pilhas de títulos e legado nacional");
    await page.screenshot({path:info.outputPath(`pilhas-${theme}.png`)});
    await page.getByRole("link",{name:"Hipotético",exact:true}).click();
    await expect(page.getByText(/Esta sessão tem ajustes de teste/)).toHaveCount(0);
    expect(await page.locator('.what-if-chapter').evaluate(node=>getComputedStyle(node).fontFamily)).toContain("Schibsted");
    expect(await page.locator('.what-if-chapter li').evaluateAll(nodes=>nodes.every(node=>node.scrollWidth<=node.clientWidth+1))).toBe(true);
  });

  test(`D71: ultimato mostra a frase completa, ${theme}`,async({page},info)=>{
    if(info.project.name==="celular")await page.setViewportSize({width:360,height:640});
    const replay=await readFile(new URL("./fixtures/narrativa-m15.json",import.meta.url));
    await abrir(page,{theme},`/#c=z${deflateRawSync(replay).toString("base64url")}`);
    await page.getByRole("link",{name:"Hipotético",exact:true}).click();
    await page.getByRole("button",{name:/^Seguir daqui: Ultimato do empresário/}).click();
    await page.getByRole("button",{name:"Começar linha alternativa",exact:true}).click();
    await page.locator(OPCOES).filter({has:page.getByText("Ficar",{exact:true})}).click();
    await page.getByRole("button",{name:"Confirmar escolha",exact:true}).click();
    if(info.project.name==="celular") await page.getByRole("region",{name:"O último lance",exact:true}).getByRole("button").click();
    const body=page.locator('.play-event-text').filter({hasText:"o mercado volta ao normal"});
    await expect(body).toBeVisible();
    await expect(body).toContainText("Só a próxima decisão terá propostas de clubes mais fracos, se houver transferência; depois o mercado volta ao normal.");
    expect(await body.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
    expect(await body.evaluate(node=>getComputedStyle(node).getPropertyValue("-webkit-line-clamp"))).not.toMatch(/^[1-9]/);
    if(info.project.name==="desktop") {
      const message=page.locator('.result-body');
      await expect(message).toContainText("depois o mercado volta ao normal.");
      expect(await message.evaluate(node=>node.scrollHeight-node.clientHeight)).toBeLessThanOrEqual(1);
    }
    await esperarQueCaiba(page);
    await auditar(page,"Resultado do ultimato completo");
    await page.screenshot({path:info.outputPath(`ultimato-${theme}.png`)});
  });
}
