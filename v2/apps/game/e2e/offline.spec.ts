import { expect, type Page, test } from "@playwright/test";
import { abrir, jogarTurno, jogoRapido } from "./apoio";

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
  expect(manifest).toMatchObject({ name: "CRAQUE: carreira de futebol", short_name: "CRAQUE", display: "standalone", theme_color: "#0d1110" });
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
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();

  await jogoRapido(page);
  await jogarTurno(page);
  await jogarTurno(page);
  // Escudos nunca vistos: sem rede e sem cache, entram desenhados.
  await expect.poll(() => brokenImages(page)).toEqual([]);

  // Outras telas inteiras também abrem sem rede.
  await page.getByRole("button", { name: "Menu da carreira" }).click();
  await page.getByRole("menuitem", { name: "Voltar ao início" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByRole("button", { name: "Ver o desafio" }).click();
  await expect(page.getByText("Missão surpresa")).toBeVisible();
  await expect.poll(() => brokenImages(page)).toEqual([]);
  await context.setOffline(false);
});

test("guardar todas as imagens nos ajustes: sem internet, os escudos são os reais", async ({ page, context }, info) => {
  test.skip(info.project.name === "celular", "o download de ~22 MB roda uma vez, no desktop");
  await abrir(page);
  await controlada(page);
  await page.getByRole("button", { name: "Abrir ajustes" }).first().click();
  await page.getByRole("button", { name: "Guardar todas" }).click();
  await expect(page.getByText(/^Todas as \d+ guardadas no aparelho$/)).toBeVisible({ timeout: 120_000 });
  await page.keyboard.press("Escape");

  // O que ficou no cache de imagens que o service worker lê.
  const stored = await page.evaluate(async () => {
    const cache = await caches.open("craque-imagens");
    return (await cache.keys()).map((request) => new URL(request.url).pathname);
  });
  const crest = stored.find((path) => path.includes("/assets/clubs/"));
  const trophy = stored.find((path) => path.includes("/assets/trophies/"));
  expect(crest).toBeTruthy();
  expect(trophy).toBeTruthy();

  await context.setOffline(true);
  await page.reload();
  // Sem rede, o service worker entrega do cache o escudo e o troféu reais.
  for (const path of [crest, trophy]) {
    const status = await page.evaluate(async (url) => (await fetch(url ?? "")).status, path);
    expect(status, path).toBe(200);
  }
  await jogoRapido(page);
  await jogarTurno(page);
  await expect.poll(() => brokenImages(page)).toEqual([]);
  await context.setOffline(false);
});

test("os ajustes cabem numa tela de 320 × 568 e a linha de imagens offline é alcançável", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await abrir(page);
  await page.getByRole("button", { name: "Abrir ajustes" }).first().click();
  const panel = page.locator(".popover-popup");
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(568);
  const store = page.getByRole("button", { name: "Guardar todas" });
  await store.scrollIntoViewIfNeeded();
  await expect(store).toBeInViewport();
});
