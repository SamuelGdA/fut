import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, auditar } from "./apoio";

for (const theme of ["light", "dark"] as const) test(`D107: o top 10 da Bola de Ouro aparece nos detalhes da temporada, ${theme}`, async ({ page }, info) => {
  test.skip(info.project.name === "celular", "os detalhes abrem pelo cartão do lance, no PC");
  await page.setViewportSize({ width: 1280, height: 720 });
  // Na amostra da coleção, a janela de 2040 (decisão 39) vem logo depois de uma temporada no top 10 da Bola de Ouro.
  await abrirMomento(page, await readFile(new URL("./fixtures/colecao-m41.json", import.meta.url)), 39, { theme, motion: "reduced" });
  await page.locator(".career-right > .play .play-details-button").click();
  const dialog = page.getByRole("dialog", { name: "O último lance" });
  const ballon = dialog.locator(".season-competition[data-award='ballonDor']");
  await expect(ballon).toBeVisible();
  await expect(ballon.locator(".season-competition-name")).toHaveText("Bola de Ouro");
  await expect(ballon.locator(".season-competition-place")).toHaveText(/^(\d+º lugar|Vencedor)$/);
  await expect(dialog.getByText("Prêmios", { exact: true })).toBeVisible();
  expect(await ballon.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  await auditar(page, `D107 top 10 ${theme}`);
  await page.screenshot({ path: info.outputPath(`d107-top10-${theme}.png`) });
});

for (const theme of ["light", "dark"] as const) test(`D107: no jornal, notas do ano e números da capa não se cobrem, ${theme}`, async ({ page }) => {
  // D108: a amostra de pilhas tem capas cheias de taças e prêmios, com etiquetas e notas do ano.
  const raw = await readFile(new URL("./fixtures/pilhas-m41.json", import.meta.url));
  await abrir(page, { theme, motion: "reduced" }, `/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.getByRole("link", { name: "Jornal", exact: true }).click();
  const book = page.locator(".paper-stage").first();
  await book.focus();
  let checked = 0;
  for (let turn = 0; turn < 26; turn += 1) {
    // As notas se medem depois da pintura: espera a página assentar antes de medir.
    await page.waitForTimeout(150);
    const issues = await book.evaluate((stage) => {
      const found: string[] = [];
      let pages = 0;
      for (const leaf of stage.querySelectorAll<HTMLElement>(".paper-spread .paper-page")) {
        if (leaf.getBoundingClientRect().width < 50) continue;
        pages += 1;
        for (const also of leaf.querySelectorAll(".paper-also")) {
          const bottom = also.getBoundingClientRect().bottom;
          const items = [...also.querySelectorAll("li:not([data-cut])")].map((item) => item.getBoundingClientRect());
          items.forEach((rect, index) => {
            if (rect.bottom > bottom + 0.5) found.push(`${leaf.dataset.year}: nota cortada`);
            if (index > 0 && rect.top < items[index - 1]!.bottom - 0.5) found.push(`${leaf.dataset.year}: notas se cobrem`);
          });
        }
        const stats = leaf.querySelector(".paper-stats")?.getBoundingClientRect();
        const box = leaf.querySelector(".paper-columns > .paper-box")?.getBoundingClientRect();
        if (stats && box && stats.bottom > box.bottom + 1) found.push(`${leaf.dataset.year}: números saem da caixa`);
      }
      return { found, pages };
    });
    expect(issues.found).toEqual([]);
    checked += issues.pages;
    await page.keyboard.press("ArrowRight");
  }
  expect(checked).toBeGreaterThan(20);
  await auditar(page, `D107 jornal ${theme}`, ".paper-stage");
});
