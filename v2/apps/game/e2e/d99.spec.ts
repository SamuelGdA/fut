import { expect, type Page, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { abrirMomento } from "./apoio";

/**
 * D99: o resultado do lance segue sozinho, mas para enquanto o jogador segura
 * o clique no card da decisão; com "Pular resultado automaticamente"
 * desligado, só Continuar segue.
 */
const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m41.json", import.meta.url), "utf8")) as { moments: Record<string, { file: string; index: number }> };

async function abrirLance(page: Page, autoAdvance: boolean) {
  const moment = metadata.moments.cb!;
  const raw = await readFile(new URL(`./fixtures/${moment.file}`, import.meta.url));
  await abrirMomento(page, raw, moment.index, { autoAdvance });
  const id = await page.locator(".season-decision-slide[data-active] .decision").getAttribute("aria-labelledby");
  await page.locator(".drama-option").first().click();
  await expect(page.locator(".match-continue")).toBeVisible();
  return id!;
}

const ativa = ".season-decision-slide[data-active] .decision";

test("D99: segurar o clique no card da decisão segura o resultado; soltar retoma", async ({ page }) => {
  const id = await abrirLance(page, true);
  const box = (await page.locator(".match-outcome").boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.waitForTimeout(3600);
  await expect(page.locator(ativa)).toHaveAttribute("aria-labelledby", id);
  await page.mouse.up();
  await expect(page.locator(ativa)).not.toHaveAttribute("aria-labelledby", id, { timeout: 4000 });
});

test("D99: sem o avanço automático, o resultado espera o Continuar", async ({ page }) => {
  const id = await abrirLance(page, false);
  await page.waitForTimeout(4000);
  await expect(page.locator(ativa)).toHaveAttribute("aria-labelledby", id);
  await page.locator(".season-decision-slide[data-active] .match-continue").click();
  await expect(page.locator(ativa)).not.toHaveAttribute("aria-labelledby", id, { timeout: 4000 });
});
