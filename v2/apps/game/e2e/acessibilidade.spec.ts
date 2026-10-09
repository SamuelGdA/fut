import { expect, test } from "@playwright/test";
import { abrir, abrirCraque, auditar, encerrar, entrarNoCraque, jogarTurno, jogoRapido } from "./apoio";

/**
 * Acessibilidade (GDD 36): o axe audita cada tela nos dois temas (WCAG 2.1 A e
 * AA, contraste incluído), e um turno inteiro do laço é jogado só com o
 * teclado: Tab, setas, Enter e Espaço.
 */

for (const theme of ["dark", "light"] as const) {
  test(`axe nas telas do jogo, tema ${theme === "dark" ? "escuro" : "claro"}`, async ({ page }) => {
    await abrir(page, { theme });
    await auditar(page, "Hub");
    await entrarNoCraque(page);
    await auditar(page, "Início");

    await page.getByRole("button", { name: "Começar carreira" }).click();
    await expect(page.getByLabel("Sobrenome")).toBeVisible();
    await auditar(page, "Identidade");
    await page.goBack();

    await page.getByRole("button", { name: "Ver o desafio" }).click();
    await expect(page.getByText("Missão surpresa")).toBeVisible();
    await auditar(page, "Desafio do dia");
    await page.goBack();

    await jogoRapido(page);
    await auditar(page, "Carreira, decisão");
    // O lance aparece na própria tela (D43): números contando, jornal embaixo.
    await jogarTurno(page);
    await expect(page.locator(".play").first()).toBeVisible();
    await expect(page.locator(".news-bar")).toBeVisible();
    await auditar(page, "Carreira, lance");

    await jogarTurno(page);
    await encerrar(page);
    await auditar(page, "Resumo");

    await page.getByRole("button", { name: "Início", exact: true }).click();
    await page.getByRole("button", { name: /Conquistas/ }).click();
    await expect(page.locator(".achievement").first()).toBeVisible();
    await auditar(page, "Conquistas");

    await page.goto("/nao-existe");
    await expect(page.getByRole("heading", { name: "Bola fora" })).toBeVisible();
    await auditar(page, "Página não encontrada");
  });
}

test("os avisos, parados na tela, também passam no axe", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "basta um tamanho");
  for (const theme of ["dark", "light"] as const) {
    await page.context().clearCookies();
    await abrir(page, { theme });
    await page.evaluate((value) => {
      const raw = window.localStorage.getItem("craque.v2.prefs");
      const prefs = raw ? JSON.parse(raw) : { state: {}, version: 1 };
      prefs.state.theme = value;
      window.localStorage.setItem("craque.v2.prefs", JSON.stringify(prefs));
    }, theme);
    await page.reload();
    // A conexão cai: o aviso de "sem conexão" aparece e fica.
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(page.locator(".toast").first()).toBeVisible();
    await page.waitForTimeout(800);
    await auditar(page, `aviso, tema ${theme}`, ".toast-viewport");
  }
});

test("um turno inteiro só com o teclado", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "teclado é do desktop");
  await abrirCraque(page);

  // Do topo da página até o Jogo rápido, só com Tab.
  for (let presses = 0; presses < 40; presses += 1) {
    await page.keyboard.press("Tab");
    const name = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    if (name === "Jogo rápido") break;
  }
  await expect(page.getByRole("button", { name: "Jogo rápido" })).toBeFocused();
  await page.keyboard.press("Enter");

  // A decisão nova recebe o foco no título: o leitor de tela lê a pergunta.
  await expect(page.locator(".decision-title")).toBeFocused();

  // Tab entra no grupo de opções; as setas andam e marcam.
  await page.keyboard.press("Tab");
  const options = page.getByRole("radio");
  await expect(options.first()).toBeFocused();
  const count = await options.count();
  if (count > 1) {
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toBeFocused();
    await expect(options.nth(1)).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowUp");
    await expect(options.first()).toHaveAttribute("aria-checked", "true");
  } else {
    await page.keyboard.press("Space");
    await expect(options.first()).toHaveAttribute("aria-checked", "true");
  }
  // Um Tab sai do grupo (só uma opção entra no Tab) e chega ao confirmar.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Confirmar escolha" })).toBeFocused();
  await page.keyboard.press("Enter");

  // Sem janela para fechar (D43): a próxima decisão chega com o foco no título.
  await expect(page.locator(".play").first()).toBeVisible();
  await expect(page.locator(".decision-title")).toBeFocused();
});

test("o leitor de tela ouve o lance numa frase, a cada jogada", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "basta um tamanho");
  await abrirCraque(page);
  await jogoRapido(page);
  const live = page.locator(".career > [role='status']");
  await expect(live).toHaveText("");
  await jogarTurno(page);
  await expect(live).toContainText("OVR");
  const first = await live.textContent();
  await jogarTurno(page);
  await expect(live).toContainText("OVR");
  expect(await live.textContent()).not.toBe(first);
});
