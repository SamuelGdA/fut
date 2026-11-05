import { expect, type Page, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { abrir, abrirMomento, auditar, OPCOES } from "./apoio";

const clubes = (page: Page) => page.locator(`${OPCOES} .option-title`).allInnerTexts();

for (const theme of ["light", "dark"] as const) test(`D118: sortear outros clubes na janela, duas vezes, depois do anúncio, ${theme}`, async ({ page }, info) => {
  // Na amostra da coleção, a decisão 40 é a janela de 2040, com propostas.
  await abrirMomento(page, await readFile(new URL("./fixtures/colecao-m43.json", import.meta.url)), 40, { theme, motion: "reduced" });
  const redraw = page.locator(".season-decision-slide[data-active] .option-redraw");
  await expect(redraw).toBeVisible();
  await expect(redraw).toContainText("Sortear outros clubes");
  await expect(redraw).toContainText("Anúncio · 2/2");
  // Cabe na tela: o laço continua sem rolar (D23).
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  await auditar(page, `D118 sorteio ${theme}`);
  await page.screenshot({ path: info.outputPath(`d118-janela-${theme}.png`) });

  const vistos = new Set(await clubes(page));
  for (const restam of [1, 0]) {
    await redraw.click();
    const ad = page.getByRole("alertdialog", { name: "Intervalo comercial" });
    await expect(ad).toBeVisible();
    if (restam === 1) await page.screenshot({ path: info.outputPath(`d118-anuncio-${theme}.png`) });
    await expect(ad).toBeHidden({ timeout: 5_000 });
    const novos = await clubes(page);
    // Ficar no clube continua; os clubes de fora são todos inéditos nesta janela.
    const fora = novos.filter((nome) => !vistos.has(nome));
    expect(fora.length).toBeGreaterThan(0);
    for (const nome of novos) vistos.add(nome);
    if (restam > 0) await expect(redraw).toContainText(`Anúncio · ${restam}/2`);
  }
  // Usou as duas: a opção some.
  await expect(redraw).toHaveCount(0);
});

test("D118: cada modo tem o seu endereço", async ({ page }) => {
  await abrir(page, { motion: "reduced" }, "/craque");
  await expect(page.getByRole("heading", { name: /Quem é você/i, level: 1 })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/craque");
  // Sem carreira de técnico salva, o endereço do Técnico abre a criação do técnico.
  await page.goto("/tecnico");
  await expect(page.locator("#conteudo h1").first()).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/tecnico");
});
