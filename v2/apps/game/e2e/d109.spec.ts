import { expect, test } from "@playwright/test";
import { abrirCraque, auditar } from "./apoio";

test("D109, D110: o Craque abre na tela de quem é você, com ritmo, dificuldade, jogo rápido e o desafio", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "no celular a seção aparece na etapa final, coberta pela jornada");
  await abrirCraque(page, { motion: "reduced" });
  await expect(page.getByRole("button", { name: "Jogo rápido" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ver o desafio" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Conquistas/ })).toBeVisible();
  const rapida = page.getByRole("radio", { name: "Rápida", exact: true });
  await expect(rapida).toBeVisible();
  await rapida.click();
  await expect(rapida).toHaveAttribute("aria-checked", "true");
  await page.getByRole("radio", { name: "Difícil", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Difícil", exact: true })).toHaveAttribute("aria-checked", "true");
  // A escolha fica guardada para a próxima visita e para o jogo rápido.
  const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem("craque.v2.prefs") ?? "{}").state as { pace: string; difficulty: string });
  expect(prefs).toMatchObject({ pace: "normal", difficulty: "hard" });
  await auditar(page, "D109 quem é você");
});

test("D109: na aparência, Voltar descarta e Pronto guarda; o acessório tem coluna própria", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "as três colunas são do PC");
  await abrirCraque(page, { motion: "reduced" });
  const avatar = () => page.evaluate(() => JSON.parse(localStorage.getItem("craque.v2.draft") ?? "{}").state?.avatar?.accessory as string | undefined);
  const before = await avatar();

  await page.getByRole("button", { name: "Editar aparência", exact: true }).click();
  await page.getByRole("tab", { name: "Detalhes", exact: true }).click();
  const accessory = page.locator(".avatar-editor-section").filter({ hasText: "Acessório" });
  const x = (await accessory.boundingBox())!.x;
  await page.getByRole("button", { name: "Esquerdo", exact: true }).click();
  await expect(page.getByText("Cor do brinco", { exact: true })).toBeVisible();
  expect((await accessory.boundingBox())!.x).toBeCloseTo(x, 0);
  await page.getByRole("button", { name: "Boné", exact: true }).click();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Editar aparência", exact: true })).toBeVisible();
  expect(await avatar()).toBe(before);

  await page.getByRole("button", { name: "Editar aparência", exact: true }).click();
  await page.getByRole("tab", { name: "Detalhes", exact: true }).click();
  await page.getByRole("button", { name: "Boné", exact: true }).click();
  await page.getByRole("button", { name: "Pronto", exact: true }).click();
  await expect(page.getByRole("button", { name: "Editar aparência", exact: true })).toBeVisible();
  expect(await avatar()).toBe("cap");
});
