import { expect, test } from "@playwright/test";
import { abrirCraque, encerrar, esperarQueCaiba, idade, jogarTurno, OPCOES } from "./apoio";

/**
 * O Desafio do dia (GDD 27): a entrada com a mão do dia, a tentativa com o
 * painel do desafio, a regra dos 27 para encerrar, o resultado no resumo e a
 * ranqueada no Início e no Hall da Fama.
 */

test("da entrada do desafio ao resultado ranqueado", async ({ page }, info) => {
  const celular = info.project.name === "celular";
  await abrirCraque(page);
  await page.getByRole("button", { name: "Ver o desafio" }).click();
  await expect(page.getByRole("heading", { name: /^A mão de / })).toBeVisible();
  await expect(page.getByText("Missão surpresa")).toBeVisible();
  await expect(page.getByText("A primeira tentativa que você terminar hoje é a ranqueada.")).toBeVisible();

  await page.getByLabel("Sobrenome").fill("Teste");
  await page.getByRole("button", { name: "Jogar o desafio" }).click();
  await expect(page.locator(OPCOES).first()).toBeVisible();

  // O painel do desafio: quinta aba no celular, primeira da exploração no desktop.
  if (celular) {
    await page.getByRole("tab", { name: "Desafio" }).click();
    await expect(page.getByText("Se parasse agora")).toBeVisible();
    await esperarQueCaiba(page);
    await page.getByRole("tab", { name: "Temporada" }).click();
  } else {
    await expect(page.getByText("Se parasse agora")).toBeVisible();
  }

  // Antes dos 27, encerrar não aparece no menu.
  await page.getByRole("button", { name: "Menu da carreira" }).click();
  await expect(page.getByRole("menuitem", { name: "Voltar ao início" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Encerrar carreira" })).toHaveCount(0);
  await page.keyboard.press("Escape");

  for (let turn = 0; turn < 40 && (await idade(page)) < 27; turn += 1) {
    if (!(await jogarTurno(page))) break;
    if (celular) await esperarQueCaiba(page);
  }
  if ((await page.locator(OPCOES).count()) > 0) await encerrar(page);
  else await page.getByRole("button", { name: "Ver resumo" }).click();

  // O resumo abre no capítulo do desafio: nota sobre 1000 e a ranqueada.
  await expect(page.getByRole("heading", { name: "Desafio do dia", level: 2 })).toBeVisible();
  await expect(page.locator("#capitulo-challenge")).toContainText("de 1000");
  await expect(page.locator("#capitulo-challenge")).toContainText("Ranqueada");

  // O Início mostra a ranqueada de hoje; o Hall, o selo do desafio.
  await page.getByRole("button", { name: "Início", exact: true }).click();
  await expect(page.getByText(/^Ranqueada de hoje: \d+ pontos$/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Hall da Fama/ })).toHaveCount(0);
});
