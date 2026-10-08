import { expect, test } from "@playwright/test";
import { abrir, encerrar, jogarTurno, jogoRapido, OPCOES } from "./apoio";

/**
 * Hall da Fama, "E se...?" e conquistas (GDD 28): a carreira terminada entra
 * no Hall, abre só de leitura, uma linha alternativa sai de uma decisão (e,
 * por ser só para se divertir, não entra no Hall, D43), e apagar pede
 * confirmação.
 */

test("Hall da Fama, E se...? e conquistas", async ({ page }) => {
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

  // Só a original no Hall: a linha alternativa é só para se divertir.
  await page.getByRole("button", { name: "Início", exact: true }).click();
  await page.getByRole("button", { name: /Hall da Fama/ }).first().click();
  await expect(page.locator(".hall-card")).toHaveCount(1);
  await expect(page.locator(".hall-card").filter({ hasText: "Linha alternativa" })).toHaveCount(0);

  // Abrir mostra o resumo só de leitura, com a volta para o Hall.
  await page.locator(".hall-card").first().getByRole("button", { name: "Abrir" }).click();
  await expect(page.getByText("Do Hall da Fama")).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao Hall" }).first().click();

  // Apagar pede confirmação.
  await page.locator(".hall-card").first().getByRole("button", { name: "Apagar" }).click();
  await expect(page.getByRole("alertdialog", { name: "Apagar do Hall da Fama?" })).toBeVisible();
  await page.locator(".dialog-popup").getByRole("button", { name: "Apagar", exact: true }).click();
  await expect(page.locator(".hall-card")).toHaveCount(0);

  // Conquistas: a primeira carreira terminada já está liberada, com quem liberou.
  await page.getByRole("button", { name: "Ver conquistas" }).click();
  const first = page.locator(".achievement").filter({ hasText: "Primeiro apito final" });
  await expect(first).toHaveAttribute("data-unlocked", "true");
});
