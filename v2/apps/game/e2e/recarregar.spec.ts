import { expect, test } from "@playwright/test";
import { abrirCraque, abrirMenuDaCarreira, encerrar, jogarTurno, jogoRapido } from "./apoio";

// D61: o Craque não persiste a carreira; rascunho e conquistas continuam independentes.
test("recarregar encerra a sessão do Craque e permite começar novamente", async ({ page }) => {
  await abrirCraque(page); await jogoRapido(page); await jogarTurno(page); await jogarTurno(page);
  expect(await page.evaluate(() => localStorage.getItem("craque.v2.save"))).toBeNull();
  // D118: o endereço é o do Craque; recarregar volta à criação do jogador, sem carreira.
  await expect(page).toHaveURL(/\/craque$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: /Quem é você/i, level: 1 })).toBeVisible();
  await jogoRapido(page);
  expect(await jogarTurno(page)).toBe(true);
});
test("o resumo do Craque permanece nesta sessão, sem registro de retomada", async ({ page }) => {
  await abrirCraque(page); await jogoRapido(page); await jogarTurno(page); await encerrar(page);
  await expect(page.locator(".summary")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Quem é você/i, level: 1 })).toBeVisible();
  await expect(page.locator(".summary")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("craque.v2.save"))).toBeNull();
});
test("sair para o início mantém o rascunho e permite um novo jogo sem salvar a carreira", async ({ page }) => {
  await abrirCraque(page); await jogoRapido(page); await jogarTurno(page);
  await abrirMenuDaCarreira(page);
  await page.getByRole("menuitem", { name: "Voltar ao início" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Quem é você/i, level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Jogo rápido" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.locator(".decision-options .option").first()).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("craque.v2.save"))).toBeNull();
});
