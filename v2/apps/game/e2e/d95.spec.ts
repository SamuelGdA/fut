import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, auditar, entrarNoCraque } from "./apoio";

const DESPEDIDA = /despede dos gramados|Obrigado,|diz adeus|último apito|pendura as chuteiras/;

test("D95: o Início não tem mais Editar jogador", async ({ page }) => {
  await abrir(page, { motion: "reduced" });
  await entrarNoCraque(page);
  await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Editar jogador" })).toHaveCount(0);
});

for (const theme of ["light", "dark"] as const) test(`D95: a última edição é a despedida, com o selo no lugar do escudo, ${theme}`, async ({ page }, info) => {
  // D106: amostra própria, um zagueiro que se aposenta batendo um recorde na última temporada.
  const raw = await readFile(new URL("./fixtures/despedida-m41.json", import.meta.url));
  await abrir(page, { theme, motion: "reduced" }, `/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.getByRole("link", { name: "Jornal", exact: true }).click();
  const book = page.locator(".paper-stage").first();
  await book.focus();
  const cover = book.locator(".paper-spread .paper-page[data-leaf='cover']");
  // Vai página a página até a última.
  for (let turn = 0; turn < 30 && !(await cover.locator(".paper-headline").textContent())?.match(DESPEDIDA); turn += 1) await page.keyboard.press("ArrowRight");
  await expect(cover.locator(".paper-headline")).toHaveText(DESPEDIDA);
  // O zagueiro bateu um recorde no último ano: o selo fica, dentro da linha de abertura, sem cobrir a manchete.
  const seal = cover.locator(".paper-lede .paper-record-seal");
  // D108: o zagueiro da amostra passa os 1.390 jogos de Peter Shilton na última temporada.
  await expect(seal).toHaveAttribute("aria-label", /Recorde quebrado\. Jogos na carreira/);
  // No fluxo: a linha de abertura começa depois da manchete, e o meio do selo
  // fica abaixo dela (a inclinação levanta só um canto, alguns pixels).
  const headline = await cover.locator(".paper-headline").boundingBox();
  const lede = await cover.locator(".paper-lede").boundingBox();
  const box = await seal.boundingBox();
  expect(lede!.y).toBeGreaterThanOrEqual(headline!.y + headline!.height - 1);
  expect(box!.y + box!.height / 2).toBeGreaterThan(headline!.y + headline!.height);
  expect(await cover.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(0);
  await auditar(page, `D95 despedida ${theme}`, ".paper-stage");
  await book.screenshot({ path: info.outputPath(`d95-despedida-${theme}.png`) });
});

test("D95: virando a página, o selo da edição seguinte não vaza por cima da folha", async ({ page }) => {
  const raw = await readFile(new URL("./fixtures/pilhas-m41.json", import.meta.url));
  await abrir(page, { motion: "full" }, `/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.getByRole("link", { name: "Jornal", exact: true }).click();
  const book = page.locator(".paper-stage").first();
  // A página isola o empilhamento: o z-index do selo não sai dela.
  expect(await book.locator(".paper-page").first().evaluate((node) => getComputedStyle(node).isolation)).toBe("isolate");
});
