import { expect, test } from "@playwright/test";
import { deflateRawSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { abrir, abrirCraque, encerrar, entrarNoCraque, esperarQueCaiba, idade, jogarTurno, jogoRapido, OPCOES } from "./apoio";

/**
 * A jornada inteira de um jogador (GDD 40.2): do hub, pelo Início e pela identidade, até
 * o fim da carreira e o resumo, com o pôster e o "Jogar de novo". No celular,
 * o laço é medido a cada turno: cabe na tela, sem rolar (D23).
 */

test("do hub ao Resumo, montando o jogador", async ({ page }, info) => {
  const celular = info.project.name === "celular";
  await abrir(page, { pace: "normal" });
  // A abertura é o hub do Futeiros (D50), com os dois jogos.
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Craque", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Técnico", level: 2 })).toBeVisible();
  await entrarNoCraque(page);

  // Identidade: no celular em etapas, no desktop tudo de uma vez.
  await page.getByRole("button", { name: "Começar carreira" }).click();
  await page.getByLabel("Sobrenome").fill("Ribeiro");
  if (celular) await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("searchbox", { name: "Buscar país" }).fill("Portugal");
  await page.getByRole("option", { name: /Portugal/ }).click();
  if (celular) await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("radio", { name: "Meia ofensivo" }).click();
  await expect(page.getByRole("radio", { name: "Meia ofensivo" })).toHaveAttribute("aria-checked", "true");
  if (celular) await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("button", { name: "Começar carreira" }).click();

  // A carreira: o placar com o sobrenome, a primeira decisão é a da base.
  await expect(page.locator(".career-header")).toContainText("RIBEIRO");
  await expect(page.locator(OPCOES).first()).toBeVisible();
  if (celular) await esperarQueCaiba(page);

  // Joga até os 30 (ou até a carreira acabar sozinha) e encerra.
  for (let turn = 0; turn < 30 && (await idade(page)) < 30; turn += 1) {
    if (!(await jogarTurno(page))) break;
    if (celular) await esperarQueCaiba(page);
  }
  if ((await page.locator(OPCOES).count()) > 0) {
    await encerrar(page);
  } else {
    await page.getByRole("button", { name: "Ver resumo" }).click();
  }

  // O resumo: o sobrenome, o motivo do fim e os capítulos.
  await expect(page.getByRole("heading", { name: "RIBEIRO", level: 1 })).toBeVisible();
  for (const chapter of ["Biografia", "Números", "Linha do tempo", "Troféus", "Jornal", "Ribeiro hipotético"]) {
    await expect(page.getByRole("heading", { name: chapter, level: 2 })).toBeAttached();
  }

  // O pôster abre com a prévia e fecha.
  await page.getByRole("button", { name: "Pôster" }).click();
  await expect(page.getByRole("dialog", { name: "Pôster da carreira" })).toBeVisible();
  await expect(page.locator(".poster").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Pôster da carreira" })).toHaveCount(0);

  // Jogar de novo volta para a identidade com o rascunho intacto.
  await page.getByRole("button", { name: "Jogar de novo" }).click();
  await expect(page.getByLabel("Sobrenome")).toHaveValue("Ribeiro");
});

test("o link da carreira abre o resumo só de leitura, sem tocar no save de quem abre", async ({ page }) => {
  await abrirCraque(page);
  await jogoRapido(page);
  for (let turn = 0; turn < 3; turn += 1) await jogarTurno(page);
  await encerrar(page);
  await page.getByRole("button", { name: "Copiar link" }).click();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain("#c=");

  // Outra pessoa, outro navegador: abre o link e vê o resumo, sem carreira dela mexida.
  const other = await page.context().browser()?.newContext({ viewport: page.viewportSize() ?? undefined });
  if (!other) throw new Error("sem navegador");
  const reader = await other.newPage();
  await reader.goto(link);
  await expect(reader.getByText("Carreira compartilhada")).toBeVisible();
  expect(await reader.evaluate(() => window.localStorage.getItem("craque.v2.save"))).toBeNull();
  await other.close();
});

for (const theme of ["light", "dark"] as const) {
  test(`D66: coleção grande cabe na prévia e no PNG, ${theme}`, async ({ page }, info) => {
    // Link público de replay, o mesmo contrato de Copiar link; sem injetar estado na página.
    // Fixture real: autoplay ambicioso, semente lab-fim-ambitious-7 no motor m13.
    const replay=await readFile(new URL("./fixtures/colecao-m13.json",import.meta.url));
    const token=deflateRawSync(replay).toString("base64url");
    await abrir(page,{theme},`/#c=z${token}`);
    await page.getByRole("button",{name:"Pôster",exact:true}).click();
    expect(await page.locator(".poster-showcase li").count()).toBeGreaterThan(14);
    expect(await page.locator(".poster").evaluate(node=>node.scrollHeight)).toBeGreaterThan(1350);
    await expect.poll(()=>page.locator(".poster-frame").evaluate(frame=>Math.abs(frame.getBoundingClientRect().height-frame.querySelector(".poster")!.getBoundingClientRect().height))).toBeLessThanOrEqual(1);
    if(info.project.name==="desktop" && theme==="light") {
      const downloading=page.waitForEvent("download");
      await page.getByRole("button",{name:"Baixar pôster",exact:true}).click();
      const path=info.outputPath("colecao-completa.png");
      await (await downloading).saveAs(path);
      const png=await readFile(path);
      expect(png.readUInt32BE(16)).toBe(1080);
      expect(png.readUInt32BE(20)).toBeGreaterThan(1350);
    }
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`D67: troféu revela nome sem clique persistente, ${theme}`, async ({ page }, info) => {
    test.skip(info.project.name === "celular", "O comportamento específico de hover é de mouse; o nome continua acessível por rótulo.");
    const replay = await readFile(new URL("./fixtures/colecao-m13.json", import.meta.url));
    const token = deflateRawSync(replay).toString("base64url");
    await abrir(page, { theme }, `/#c=z${token}`);
    await page.getByRole("link", { name: "Caminho", exact: true }).click();
    const trophy = page.locator(".honour-token").first();
    await trophy.scrollIntoViewIfNeeded();
    await expect(trophy).not.toHaveRole("button");
    const title = await trophy.getAttribute("aria-label");
    expect(title).toBeTruthy();
    await trophy.hover();
    await expect(page.getByRole("tooltip")).toHaveText(title!);
    await trophy.click();
    await page.getByRole("heading", { name: "Linha do tempo", exact: true }).hover();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await trophy.hover();
    await expect(page.getByRole("tooltip")).toHaveText(title!);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
}
