import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, auditar, esperarQueCaiba } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json", import.meta.url), "utf8")) as { moments: Record<string, {file:string;index:number}> };
for (const theme of ["light", "dark"] as const) {
  test(`D81: jornal proporcional e leitura ampliada, ${theme}`, async ({page},info) => {
    const mobile=info.project.name==="celular";
    await page.setViewportSize(mobile?{width:360,height:640}:{width:1280,height:720});
    const raw=await readFile(new URL("./fixtures/colecao-m23.json",import.meta.url));
    await abrir(page,{theme,motion:"reduced"},`/#c=z${deflateRawSync(raw).toString("base64url")}`);
    await page.getByRole("link",{name:"Jornal",exact:true}).click();
    const book=page.locator(".paper-stage").first();
    await expect(book.locator(".paper-spread > .paper-page")).toHaveCount(2);
    const firstYear=await book.locator(".paper-spread").getAttribute("data-year");
    await book.focus(); await page.keyboard.press("ArrowRight");
    await expect(book.locator(".paper-spread")).not.toHaveAttribute("data-year",firstYear!);
    await expect(book.locator(".paper-sheet")).toHaveCount(0);
    expect(await book.evaluate(node=>node.getBoundingClientRect().right<=innerWidth)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), "O jornal não pode alargar a página no celular").toBe(true);
    if(mobile) {
      await expect(book).toHaveAttribute("data-compact", "true");
      expect(await book.evaluate(node=>node.getBoundingClientRect().height)).toBeLessThan(300);
      await page.screenshot({path:info.outputPath(`jornal-mobile-${theme}.png`),style:".toast-viewport {visibility:hidden!important}"});
      await page.getByRole("button",{name:"Ampliar jornal",exact:true}).click();
      const dialog=page.getByRole("dialog",{name:"Ampliar jornal",exact:true});
      await expect(dialog.locator('.paper-page[data-leaf="cover"]')).toBeVisible();
      expect(await dialog.locator(".paper-page").evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
      await dialog.getByRole("button",{name:"Bastidores",exact:true}).click();
      await expect(dialog.locator(".paper-page")).toHaveCount(1);
      await expect(dialog.locator(".paper-moment-story").first()).toBeVisible();
      expect(await dialog.locator(".paper-moment-story").first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(13);
      expect(await dialog.locator(".paper-page").evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
      await auditar(page,`D81 leitura ${theme}`);
      await page.screenshot({path:info.outputPath(`jornal-leitura-${theme}.png`)});
    } else await expect(page.getByRole("button",{name:"Ampliar jornal",exact:true})).toBeHidden();
  });
  test(`D81: resultado da promessa à vista sem abrir detalhes, ${theme}`,async({page},info)=>{
    await page.setViewportSize(info.project.name==="celular"?{width:360,height:640}:{width:1280,height:720});
    const sample=metadata.moments.promiseResult!;
    await abrirMomento(page,await readFile(new URL(`./fixtures/${sample.file}`,import.meta.url)),sample.index,{theme,motion:"reduced"});
    const report=page.locator(".promise-summary").first();
    await expect(report).toBeVisible();
    await expect(report).toContainText(/Palavra cumprida|A meta ficou pelo caminho/);
    await expect(report).toContainText(/\d+ \/ \d+/);
    await expect(report).not.toContainText("Meta acessível. Sem punição.");
    await esperarQueCaiba(page); await auditar(page,`D81 promessa ${theme}`);
    await page.screenshot({path:info.outputPath(`promessa-resultado-${theme}.png`),style:".toast-viewport {visibility:hidden!important}"});
  });
}

test("D81: relato identifica a ação escolhida em cada alternativa",async({page})=>{
  await abrir(page,{motion:"reduced"},"http://127.0.0.1:4174/#lab");
  await page.getByRole("tab",{name:"Design",exact:true}).click();
  const lab=page.locator(".match-lab");
  for(let index=0;index<3;index++) {
    await lab.getByRole("button",{name:/Entre as linhas ·/}).click();
    const option=lab.locator(".drama-option").nth(index);
    const chosen=await option.locator(".option-title").innerText();
    await option.click();
    await expect(lab.locator(".match-final p")).toContainText(chosen.toLocaleLowerCase("pt"));
    await expect(lab.locator(".match-final p")).not.toContainText("preservou o físico");
  }
  await expect(lab.locator(".promise-summary")).toBeVisible();
});
