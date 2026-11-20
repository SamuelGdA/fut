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
  // A abertura é o hub do Futeiro (D50), com os dois jogos.
  await expect(page.getByRole("heading", { name: "Futeiro", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Craque", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Técnico", level: 2 })).toBeVisible();
  await entrarNoCraque(page);

  // Identidade (D110: o Craque abre nela): no celular em etapas, no desktop tudo de uma vez.
  await page.getByRole("textbox", { name: "Nome", exact: true }).fill("Ribeiro");
  await expect(page.getByText("Pé preferido", { exact: true })).toHaveCount(0);
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
  // D99: sem biografia, nesta ordem.
  const chapters = ["Números", "Troféus", "Linha do tempo", "Jornal", "Ribeiro hipotético"];
  for (const chapter of chapters) await expect(page.getByRole("heading", { name: chapter, level: 2 })).toBeAttached();
  expect((await page.locator(".summary-chapter-title").allTextContents()).map((title) => title.toLowerCase())).toEqual(chapters.map((title) => title.toLowerCase()));
  await expect(page.getByRole("heading", { name: "Biografia" })).toHaveCount(0);

  // A imagem da carreira (D118) abre com a prévia e fecha.
  await page.getByRole("button", { name: "Imagem", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Imagem da carreira" })).toBeVisible();
  await expect(page.locator(".share-card").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Imagem da carreira" })).toHaveCount(0);

  // Jogar de novo volta para a identidade com o rascunho intacto.
  await page.getByRole("button", { name: "Jogar de novo" }).click();
  await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toHaveValue("Ribeiro");
});

test("Compartilhar manda a imagem da carreira com o convite, sem o link (D130)", async ({ page }) => {
  // O compartilhamento do aparelho, simulado: guarda o que o jogo pediu.
  await page.addInitScript(() => {
    const calls: unknown[] = [];
    Object.assign(window, { __shares: calls });
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: { files?: File[]; text?: string; url?: string }) => {
        calls.push({ files: (data.files ?? []).map((file) => ({ name: file.name, type: file.type, size: file.size })), text: data.text, url: data.url });
      },
    });
  });
  await abrirCraque(page);
  await jogoRapido(page);
  for (let turn = 0; turn < 3; turn += 1) await jogarTurno(page);
  await encerrar(page);
  await page.getByRole("button", { name: "Compartilhar" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shares: unknown[] }).__shares.length), { timeout: 30_000 }).toBe(1);
  const [shared] = await page.evaluate(() => (window as unknown as { __shares: { files: { name: string; type: string; size: number }[]; text: string; url?: string }[] }).__shares);
  expect(shared?.files).toHaveLength(1);
  expect(shared?.files[0]?.type).toBe("image/png");
  expect(shared?.files[0]?.size).toBeGreaterThan(10_000);
  expect(shared?.text).toContain("Olha a carreira que eu fiz com o");
  expect(shared?.text).not.toContain("#c=");
  expect(shared?.url).toBeUndefined();
});

test("o link da carreira abre o resumo só de leitura, sem tocar no save de quem abre", async ({ page }) => {
  await abrirCraque(page);
  await jogoRapido(page);
  for (let turn = 0; turn < 3; turn += 1) await jogarTurno(page);
  await encerrar(page);
  await page.getByRole("button", { name: "Copiar carreira" }).click();
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
  test(`D66 e D118: coleção grande cabe na imagem de 1200 × 630, ${theme}`, async ({ page }, info) => {
    // Link público de replay, o mesmo contrato de Copiar carreira; sem injetar estado na página.
    // Fixture real: semente d80-collection-16, refeita no motor m43 com as escolhas da amostra anterior.
    const replay=await readFile(new URL("./fixtures/colecao-m43.json",import.meta.url));
    const token=deflateRawSync(replay).toString("base64url");
    await abrir(page,{theme},`/#c=z${token}`);
    await page.getByRole("button",{name:"Imagem",exact:true}).click();
    const card=page.locator(".share-card");
    await expect(card).toBeVisible();
    // Muitos destaques: a faixa mostra o que cabe e o resto vira "+N"; nada sai do quadro.
    await expect(card.locator(".share-card-more")).toHaveText(/^\+\d+$/);
    expect(await card.evaluate(node=>node.scrollHeight<=630 && node.scrollWidth<=1200)).toBe(true);
    expect(await card.locator(".share-card-shelf ul").evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
    // Prêmios individuais abrem a faixa, antes dos títulos.
    await expect(card.locator(".share-card-trophy").first()).toHaveText(/Bola de Ouro|Troféu Yashin|Troféu Kopa|Rei da América|Chuteira de Ouro/);
    await expect.poll(()=>page.locator(".share-frame").evaluate(frame=>Math.abs(frame.getBoundingClientRect().height-frame.querySelector(".share-card")!.getBoundingClientRect().height))).toBeLessThanOrEqual(1);
    if(info.project.name==="desktop" && theme==="light") {
      const downloading=page.waitForEvent("download");
      await page.getByRole("button",{name:"Baixar imagem",exact:true}).click();
      const path=info.outputPath("colecao-completa.png");
      await (await downloading).saveAs(path);
      const png=await readFile(path);
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    }
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`D67: troféu revela nome sem clique persistente, ${theme}`, async ({ page }, info) => {
    test.skip(info.project.name === "celular", "O comportamento específico de hover é de mouse; o nome continua acessível por rótulo.");
    const replay = await readFile(new URL("./fixtures/colecao-m43.json", import.meta.url));
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

for (const theme of ["light", "dark"] as const) {
  test(`D68: hipotético em link compartilhado abre outra linha, ${theme}`, async ({ page }, info) => {
    if(info.project.name === "celular") await page.setViewportSize({ width: 360, height: 640 });
    const replay = await readFile(new URL("./fixtures/colecao-m43.json", import.meta.url));
    await abrir(page, { theme }, `/#c=z${deflateRawSync(replay).toString("base64url")}`);
    await page.getByRole("link", { name: "Hipotético", exact: true }).click();
    await expect(page.getByRole("heading", { name: "MOREIRA hipotético", exact: true })).toBeVisible();
    const point = page.getByRole("button", { name: /^Seguir daqui/ }).first();
    await point.click();
    await page.getByRole("button", { name: "Começar linha alternativa", exact: true }).click();
    await expect(page.locator(".career-header")).toContainText("Linha alternativa");
    await expect(page.locator(`${OPCOES}[data-original]`)).toHaveCount(1);
    await expect(page.locator(OPCOES).first()).toBeVisible();
    await page.screenshot({ path: info.outputPath(`hipotetico-${theme}.png`) });
  });
}
