import { expect, test } from "@playwright/test";
import { abrirCraque, encerrar, esperarNumeros, jogarTurno, jogoRapido, retomarCraque } from "./apoio";

/**
 * Recarregar no meio (GDD 34.2 e invariante 23): o jogo abre no hub (D50), e o
 * cartão do Craque retoma a carreira na mesma decisão, o lance como a última
 * temporada (sem o evento e sem comemorar), e o resumo no resumo.
 */

test("recarregar no meio da carreira abre o hub, e continuar volta na mesma decisão, com a última temporada na tela", async ({ page }) => {
  await abrirCraque(page);
  await jogoRapido(page);
  await jogarTurno(page);
  await jogarTurno(page);
  // O placar conta até o OVR novo (D43): a foto do placar é a do valor final.
  await esperarNumeros(page);
  // textContent: o texto de verdade, não o que o CSS deixou em caixa alta.
  const title = (await page.locator(".decision-title").textContent()) ?? "";
  const header = (await page.locator(".career-header").textContent()) ?? "";

  await page.reload();
  await retomarCraque(page);
  await expect(page.locator(".decision-title")).toHaveText(title);
  await expect(page.locator(".career-header")).toHaveText(header);
  // O lance da tela recarregada é a última temporada; o aviso do leitor de tela fica quieto.
  await expect(page.locator(".play").first()).toBeVisible();
  await expect(page.locator(".career > [role='status']")).toHaveText("");

  // Segue jogando normalmente depois de recarregar.
  expect(await jogarTurno(page)).toBe(true);
});

test("recarregar no resumo abre o hub, e o cartão do Craque leva de volta ao resumo", async ({ page }) => {
  await abrirCraque(page);
  await jogoRapido(page);
  await jogarTurno(page);
  await encerrar(page);
  const surname = (await page.getByRole("heading", { level: 1 }).textContent()) ?? "";
  await page.reload();
  await retomarCraque(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(surname);
  await expect(page.locator(".summary")).toBeVisible();
});

test("sair para o Início guarda a carreira: o hub retoma ela, e começar outra não pergunta nada", async ({ page }) => {
  await abrirCraque(page);
  await jogoRapido(page);
  await jogarTurno(page);
  const title = (await page.locator(".decision-title").textContent()) ?? "";
  const seed = await page.evaluate(() => (JSON.parse(localStorage.getItem("craque.v2.save") ?? "{}") as { setup?: { seed: string } }).setup?.seed);
  expect(seed).toBeTruthy();
  await page.getByRole("button", { name: "Menu da carreira" }).click();
  await page.getByRole("menuitem", { name: "Voltar ao início" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Sair", exact: true }).click();

  // O Início é para começar (D45): a carreira em andamento não aparece nele.
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();
  await expect(page.getByText("Carreira em andamento")).toHaveCount(0);

  // Abrir o jogo de novo abre o hub, que mostra e retoma a carreira guardada.
  await page.reload();
  await expect(page.locator('.hub-card[data-game="craque"]')).toContainText("Carreira salva");
  await retomarCraque(page);
  await expect(page.locator(".decision-title")).toHaveText(title);

  // Começar outra carreira pelo Início troca o save sem perguntar; sobrenomes podem se repetir.
  await page.getByRole("button", { name: "Menu da carreira" }).click();
  await page.getByRole("menuitem", { name: "Voltar ao início" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByRole("button", { name: "Jogo rápido" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.locator(".decision-options .option").first()).toBeVisible();
  const newSeed = await page.evaluate(() => (JSON.parse(localStorage.getItem("craque.v2.save") ?? "{}") as { setup?: { seed: string } }).setup?.seed);
  expect(newSeed).toBeTruthy();
  expect(newSeed).not.toBe(seed);
  await page.getByRole("button", { name: "Menu da carreira" }).click();
  await page.getByRole("menuitem", { name: "Voltar ao início" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByRole("button", { name: /Hall da Fama/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Conquistas/ })).toBeVisible();
});
