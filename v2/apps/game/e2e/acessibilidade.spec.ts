import { expect, test } from "@playwright/test";
import { abrir, abrirCraque, auditar, encerrar, entrarNoCraque, jogarTurno, jogoRapido } from "./apoio";
import { simularNuvem } from "./conta";

/**
 * Acessibilidade (GDD 36): o axe audita cada tela nos dois temas (WCAG 2.1 A e
 * AA, contraste incluído), e um turno inteiro do laço é jogado só com o
 * teclado: Tab, setas, Enter e Espaço.
 */

for (const theme of ["dark", "light"] as const) {
  test(`axe nas telas do jogo, tema ${theme === "dark" ? "escuro" : "claro"}`, async ({ page }) => {
    await simularNuvem(page, { ranking: [{ posicao: 1, username: "lider_do_dia", pontos: 931, total: 2, voce: false }, { posicao: 2, username: "segundo", pontos: 702, total: 2, voce: false }] });
    await abrir(page, { theme });
    await auditar(page, "Hub");
    await entrarNoCraque(page);
    // D110: o Início do Craque é a tela de quem é você.
    await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toBeVisible();
    await auditar(page, "Identidade");

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
    // D112: o visitante vê o convite para entrar no lugar da coleção.
    await expect(page.getByRole("heading", { name: "Sua coleção começa aqui", level: 1 })).toBeVisible();
    await auditar(page, "Conquistas, visitante");

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
  await expect(page.locator(".season-decision-slide[data-active] .decision-title")).toBeFocused();

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
  await expect(page.locator(".season-decision-slide[data-active] .decision-title")).toBeFocused();
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
  // A jogada seguinte pode ser uma escolha sem temporada (treino, evento): o
  // anúncio dela não traz OVR. Joga até a próxima temporada anunciada.
  // Lê o anúncio só depois que ele muda: logo após a jogada, ele ainda pode
  // ser o da anterior.
  let previous = first;
  for (let turn = 0; turn < 8; turn++) {
    await jogarTurno(page);
    await expect.poll(async () => (await live.textContent()) ?? "", { timeout: 5_000 }).not.toBe(previous).catch(() => undefined);
    const text = (await live.textContent()) ?? "";
    if (text.includes("OVR") && text !== first) break;
    previous = text;
  }
  await expect(live).toContainText("OVR");
  expect(await live.textContent()).not.toBe(first);
});
