import { expect, test } from "@playwright/test";
import { abrir, encerrar, jogarTurno, jogoRapido, OPCOES } from "./apoio";

/** Caminho hipotético sem arquivo de carreiras; conquistas preservadas (D47). */

test("carreira hipotética e conquistas sem Hall", async ({ page }) => {
  await abrir(page);
  await jogoRapido(page);
  for (let turn = 0; turn < 3; turn += 1) await jogarTurno(page);
  await encerrar(page);

  // E se...?: segue da primeira decisão, por outro caminho.
  await page.getByRole("button", { name: /^Seguir daqui/ }).first().click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Começar linha alternativa" }).click();
  await expect(page.locator(".career-header")).toContainText("Linha alternativa");
  await expect(page.locator(`${OPCOES}[data-original]`)).toHaveCount(1);
  await jogarTurno(page);
  await encerrar(page);
  await expect(page.locator(".summary-hero")).toContainText("Linha alternativa");

  // Não há arquivo de carreiras; as conquistas da original continuam.
  await page.getByRole("button", { name: "Início", exact: true }).click();
  await expect(page.getByRole("button", { name: /Hall da Fama/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Conquistas/ }).click();
  const first = page.locator(".achievement").filter({ hasText: "Primeiro apito final" });
  await expect(first).toHaveAttribute("data-unlocked", "true");
  await page.getByRole("tab", { name: "Títulos", exact: true }).click();
  await expect(page.locator(".achievement").filter({ hasText: "Brasileirão" }).first()).toBeVisible();
  await page.getByRole("tab", { name: "Recordes", exact: true }).click();
  await expect(page.locator(".achievement")).toHaveCount(18);
  await page.getByRole("tab", { name: "Secretas", exact: true }).click();
  await expect(page.locator(".achievement")).toHaveCount(4);
  await expect(page.locator(".achievement").filter({ hasText: "Conquista secreta" }).first()).toBeVisible();
});
