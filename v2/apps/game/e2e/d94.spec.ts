import { expect, test } from "@playwright/test";
import { abrir, auditar } from "./apoio";

test("D94: conquistas com raridade e a coleção de recordes", async ({ page }, info) => {
  await abrir(page, { motion: "reduced" });
  await page.getByRole("button", { name: "Conquistas" }).first().click();
  await expect(page.getByRole("heading", { name: "Conquistas", level: 1 })).toBeVisible();
  const cards = page.locator(".achievement");
  await expect(cards.first()).toHaveAttribute("data-rarity", /common|rare|epic|legendary/);
  await page.getByRole("tab", { name: "Recordes", exact: true }).click();
  await expect(page.getByText(/Coleção de recordes: \d+ de 22/)).toBeVisible();
  await expect(page.locator(".achievement[data-rarity='legendary']")).not.toHaveCount(0);
  await expect(page.locator(".achievement-rarity").first()).toBeVisible();
  await auditar(page, "D94 conquistas");
  await page.screenshot({ path: info.outputPath("d94-conquistas.png") });
});

for (const theme of ["light", "dark"] as const) test(`D94: final valendo recorde e selo de recorde no laboratório, ${theme}`, async ({ page }, info) => {
  await abrir(page, { motion: "reduced", theme }, "http://127.0.0.1:4174/#lab");
  await page.getByRole("tab", { name: "Design", exact: true }).click();
  const lab = page.locator(".match-lab");
  await lab.getByRole("button", { name: /Libertadores/ }).first().click();
  await expect(lab.locator(".match-stake")).toContainText("Vale recorde");
  await expect(lab.locator(".match-stake")).toContainText("Francisco Sá");
  // D95: duas medalhas no laboratório, a lendária superada e a clássica igualada.
  await expect(lab.locator(".paper-record-seal")).toHaveCount(2);
  await expect(lab.locator(".paper-record-seal").first()).toContainText("Recorde quebrado");
  await expect(lab.locator(".paper-record-seal").last()).toContainText("Clássico");
  await expect(lab.locator(".cover-record-badge")).toContainText("Recorde igualado");
  await auditar(page, `D94 laboratório ${theme}`, ".match-lab");
  await lab.locator(".match-lab-preview").screenshot({ path: info.outputPath(`d94-vale-recorde-${theme}.png`) });
  await lab.locator(".lab-record-seals").screenshot({ path: info.outputPath(`d94-selos-${theme}.png`) });
});
