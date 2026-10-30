import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { abrir, abrirMomento, auditar, esperarQueCaiba } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m41.json", import.meta.url), "utf8")) as { moments: Record<string, { file: string; index: number }> };
const RARITY = ["common", "rare", "epic", "legendary"];

test("D106: conquistas da comum à lendária e seletor na fonte de título", async ({ page }) => {
  await abrir(page, { motion: "reduced" });
  await page.getByRole("button", { name: "Conquistas" }).first().click();
  await expect(page.getByRole("heading", { name: "Conquistas", level: 1 })).toBeVisible();
  for (const tab of ["Carreira", "Títulos", "Recordes"]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    const order = await page.locator(".achievement").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-rarity")));
    const ranks = order.map((rarity) => RARITY.indexOf(rarity ?? ""));
    expect(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1]!), `${tab}: ${order.join(",")}`).toBe(true);
  }
  expect(await page.locator(".seg-games .seg-item").first().evaluate((node) => getComputedStyle(node).fontFamily)).toContain("Big Shoulders");
});

for (const theme of ["light", "dark"] as const) test(`D106: as bolinhas reveem o resultado das decisões do ano, ${theme}`, async ({ page }, info) => {
  await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
  const moment = metadata.moments.europe!;
  const raw = await readFile(new URL(`./fixtures/${moment.file}`, import.meta.url));
  await abrirMomento(page, raw, moment.index, { theme, motion: "reduced" });
  const active = page.locator(".season-decision-slide[data-active]");
  // O jogo-chave tem o título do momento e o nome da cena em cima.
  await expect(active.locator(".drama-kicker")).toBeVisible();
  const first = active.locator("button.season-progress-step").first();
  await expect(first).toHaveAccessibleName("Rever o resultado da decisão 1");
  await first.click();
  await expect(active.locator(".season-progress small")).toHaveText(/Revendo a decisão 1 de \d+/);
  await expect(active.locator(".option[data-original='Sua escolha']")).toHaveCount(1);
  await esperarQueCaiba(page);
  await auditar(page, `D106 revisão ${theme}`);
  await page.screenshot({ path: info.outputPath(`revisao-${theme}.png`) });
  await page.getByText("Voltar à decisão atual", { exact: true }).click();
  await expect(active.locator(".drama-kicker")).toBeVisible();
  await expect(active.locator(".season-progress small")).toHaveText(/^Decisão \d+ de \d+/);
});
