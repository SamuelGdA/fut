import { expect, type Page, test } from "@playwright/test";
import { abrir, abrirMenuDaCarreira, entrarNoCraque, jogarTurno, jogoRapido } from "./apoio";

/**
 * PWA (GDD 37): instalável, e a casca e o jogo funcionam sem internet. Imagem
 * que ainda não foi guardada aparece desenhada, nunca quebrada; quem guardou
 * todas nos ajustes vê as reais.
 */

/** Espera o service worker instalar e passar a controlar a página. */
async function controlada(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
}

/** Imagens que terminaram de carregar sem nada desenhado (quebradas). */
const brokenImages = (page: Page) =>
  page.evaluate(() => [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src.slice(0, 80)));

test("instalável: manifesto com nome, ícones, cor e modo de aplicativo", async ({ page, request }) => {
  await abrir(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();
  const manifest = (await (await request.get(href ?? "")).json()) as {
    name: string;
    short_name: string;
    display: string;
    start_url: string;
    theme_color: string;
    icons: Array<{ src: string; sizes: string; purpose?: string }>;
  };
  expect(manifest).toMatchObject({ name: "Futeiro: futebol de escolhas", short_name: "Futeiro", display: "standalone", theme_color: "#f3f0e8" });
  expect(manifest.icons.map((icon) => icon.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
  for (const icon of manifest.icons) {
    const response = await request.get(`/${icon.src}`);
    expect(response.status(), icon.src).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});

test("sem internet: o jogo abre, joga, e nenhuma imagem quebra", async ({ page, context }) => {
  await abrir(page);
  await controlada(page);
  await entrarNoCraque(page);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.offlineCraque), { timeout: 60_000 }).toBe("ready");
  await context.setOffline(true);
  // D118: recarregar no endereço do Craque abre direto a criação do jogador.
  await page.reload();
  await expect(page.getByRole("heading", { name: /Quem é você/i, level: 1 })).toBeVisible();

  await jogoRapido(page);
  await jogarTurno(page);
  await jogarTurno(page);
  // Escudos nunca vistos: sem rede e sem cache, entram desenhados.
  await expect.poll(() => brokenImages(page)).toEqual([]);

  // Outras telas inteiras também abrem sem rede.
  await abrirMenuDaCarreira(page);
  await page.getByRole("menuitem", { name: "Voltar ao início" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByRole("button", { name: "Ver o desafio" }).click();
  await expect(page.getByText("Missão surpresa")).toBeVisible();
  await expect.poll(() => brokenImages(page)).toEqual([]);
  await context.setOffline(false);
});

test("os ajustes cabem numa tela de 320 × 568", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await abrir(page);
  await page.getByRole("button", { name: "Abrir ajustes" }).first().click();
  const panel = page.locator(".popover-popup");
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(568);
});

