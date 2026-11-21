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

  // A imagem da carreira (D118) abre no Compartilhar (D133), com a prévia, e fecha.
  await expect(page.getByRole("button", { name: "Imagem", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Compartilhar", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Compartilhar carreira" })).toBeVisible();
  await expect(page.locator(".share-card").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Compartilhar carreira" })).toHaveCount(0);

  // Jogar de novo volta para a identidade com o rascunho intacto.
  await page.getByRole("button", { name: "Jogar de novo" }).click();
  await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toHaveValue("Ribeiro");
});

test("Compartilhar no computador: cada rede abre a tela de postar, e a imagem se baixa (D133)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "No celular, o compartilhamento é o do aparelho.");
  await page.addInitScript(() => {
    const opened: string[] = [];
    Object.assign(window, { __opened: opened });
    window.open = ((url: string) => {
      opened.push(url);
      return null;
    }) as typeof window.open;
  });
  await abrirCraque(page);
  await jogoRapido(page);
  for (let turn = 0; turn < 3; turn += 1) await jogarTurno(page);
  await encerrar(page);
  const surname = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  const name = surname.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_m, before: string, letter: string) => `${before}${letter.toUpperCase()}`);
  await page.getByRole("button", { name: "Compartilhar", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Compartilhar carreira" });
  await expect(sheet.locator(".share-card")).toBeVisible();

  // Só redes que abrem a tela de postar; nada que só copia, e a mensagem não se edita.
  for (const gone of ["Discord", "Instagram", "Copiar link", "Copiar mensagem", "Copiar imagem", "Mais opções"]) await expect(sheet.getByRole("button", { name: gone })).toHaveCount(0);
  await expect(sheet.getByRole("textbox")).toHaveCount(0);

  const message = `Olha a carreira que eu fiz com o ${name} no Futeiro! Monte o seu jogador e escolha a sua história também.`;
  for (const network of ["WhatsApp", "X", "Facebook", "Telegram", "Reddit"]) await sheet.getByRole("button", { name: network, exact: true }).click();
  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  const link = new URL(page.url()).origin.replace(/^http:/, "https:");
  expect(opened[0]).toBe(`https://wa.me/?text=${encodeURIComponent(`${message}\n${link}`)}`);
  expect(opened[1]).toBe(`https://x.com/intent/post?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`);
  expect(opened[2]).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`);
  expect(opened[3]).toBe(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`);
  expect(opened[4]).toBe(`https://www.reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(message)}`);

  // Sem o sobrenome, a mensagem também não o diz.
  await sheet.getByRole("switch", { name: "Mostrar sobrenome" }).click();
  await sheet.getByRole("button", { name: "WhatsApp", exact: true }).click();
  const anonymous = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened.at(-1)!);
  expect(decodeURIComponent(anonymous)).toContain("Olha a carreira que eu fiz no Futeiro!");

  // A imagem se baixa para mandar junto.
  const downloading = page.waitForEvent("download");
  await sheet.getByRole("button", { name: "Baixar imagem", exact: true }).click();
  expect((await downloading).suggestedFilename()).toBe("craque-carreira.png");
});

test("Compartilhar no celular: imagem e mensagem juntas, ou só o convite (D133)", async ({ page }, info) => {
  test.skip(info.project.name !== "celular", "No computador, cada rede tem o seu botão.");
  await page.addInitScript(() => {
    const shared: { files: number; type: string; text: string }[] = [];
    Object.assign(window, { __shared: shared });
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        shared.push({ files: data.files?.length ?? 0, type: data.files?.[0]?.type ?? "", text: data.text ?? "" });
      },
    });
  });
  await abrirCraque(page);
  await jogoRapido(page);
  for (let turn = 0; turn < 2; turn += 1) await jogarTurno(page);
  await encerrar(page);
  await page.getByRole("button", { name: "Compartilhar", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Compartilhar carreira" });
  await expect(sheet.locator(".share-card")).toBeVisible();
  await expect(sheet.getByRole("button", { name: "WhatsApp" })).toHaveCount(0);
  await expect(sheet.getByRole("textbox")).toHaveCount(0);

  await sheet.getByRole("button", { name: "Compartilhar", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: unknown[] }).__shared.length)).toBe(1);
  let shared = await page.evaluate(() => (window as unknown as { __shared: { files: number; type: string; text: string }[] }).__shared);
  expect(shared[0]).toMatchObject({ files: 1, type: "image/png" });
  expect(shared[0]?.text).toMatch(/^Olha a carreira que eu fiz com o .+ no Futeiro! Monte o seu jogador e escolha a sua história também\.\nhttps:\/\/\S+$/);

  // Sem a imagem do jogador: só o convite para jogar, e nada para baixar.
  await sheet.getByRole("switch", { name: "Mandar a imagem do jogador" }).click();
  await expect(sheet.locator(".share-card")).toHaveCount(0);
  await expect(sheet.getByRole("button", { name: "Baixar imagem" })).toHaveCount(0);
  await sheet.getByRole("button", { name: "Compartilhar", exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __shared: unknown[] }).__shared.length)).toBe(2);
  shared = await page.evaluate(() => (window as unknown as { __shared: { files: number; type: string; text: string }[] }).__shared);
  expect(shared[1]?.files).toBe(0);
  expect(shared[1]?.text).toMatch(/^Bora jogar\? No Futeiro você monta o seu jogador e escolhe a sua história\.\nhttps:\/\/\S+$/);
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
    await page.getByRole("button",{name:"Compartilhar",exact:true}).click();
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
