import { expect, type Page, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, auditar, entrarNoCraque, jogoRapido } from "./apoio";

/**
 * D134: a prévia dos espaços de anúncio. No build da suíte ela existe, mas
 * desligada; estes testes ligam pela URL ou pelo aparelho. Nenhuma rede de
 * anúncio é chamada em nenhum caso.
 */

const colecao = () => readFile(new URL("./fixtures/colecao-m43.json", import.meta.url));
const linkDaColecao = async () => `/?ads=on#c=z${deflateRawSync(await colecao()).toString("base64url")}`;

/** O tamanho da moldura do espaço, em px. */
const tamanho = (page: Page, id: string) =>
  page.locator(`[data-ad-slot="${id}"] .ad-frame`).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return `${Math.round(rect.width)}×${Math.round(rect.height)}`;
  });

/** Nada vaza para o lado e nenhum espaço fica em cima de algo clicável. */
async function semConflito(page: Page): Promise<void> {
  const result = await page.evaluate(() => {
    const ads = [...document.querySelectorAll<HTMLElement>(".ad-box")].filter((el) => el.getClientRects().length > 0).map((el) => el.getBoundingClientRect());
    const hits: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("#conteudo button, #conteudo a[href], #conteudo input, #conteudo [role=tab]")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      for (const ad of ads) if (r.left < ad.right && r.right > ad.left && r.top < ad.bottom && r.bottom > ad.top) hits.push(el.textContent?.trim().slice(0, 30) ?? el.tagName);
    }
    return { scrollX: document.documentElement.scrollWidth - window.innerWidth, hits };
  });
  expect(result).toEqual({ scrollX: 0, hits: [] });
}

test("D134: sem ligar a prévia, nenhum espaço de anúncio aparece", async ({ page }) => {
  await abrir(page, { motion: "reduced" });
  await expect(page.locator(".ad-box")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mostrar ou ocultar a prévia dos anúncios" })).toHaveCount(0);
  // Link de carreira é lido ao abrir: sai da página antes, senão só troca o fragmento.
  await page.goto("about:blank");
  await page.goto(await linkDaColecao().then((url) => url.replace("?ads=on", "")));
  await expect(page.locator(".summary")).toBeVisible();
  await expect(page.locator(".ad-box")).toHaveCount(0);
  // Nenhum script de anúncio no documento.
  expect(await page.locator('script[src*="googlesyndication"], script[src*="doubleclick"], script[src*="adsbygoogle"]').count()).toBe(0);
});

test("D134: hub e resumo com os espaços no tamanho IAB exato, sem cobrir nada", async ({ page }, info) => {
  const mobile = info.project.name === "celular";
  await abrir(page, { motion: "reduced" }, "/?ads=on");
  await expect(page.locator('[data-ad-slot="hub-rodape"]')).toBeVisible();
  expect(await tamanho(page, "hub-rodape")).toBe(mobile ? "320×100" : "728×90");
  await semConflito(page);

  await page.goto("about:blank");
  await page.goto(await linkDaColecao());
  await expect(page.locator(".summary")).toBeVisible();
  for (const id of ["resumo-numeros", "resumo-jornal"]) expect(await tamanho(page, id)).toBe(mobile ? "300×250" : "728×90");
  // Entre capítulos: depois dos números e depois da linha do tempo.
  const ordem = await page.locator(".summary-chapter, .summary [data-ad-slot]").evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.adSlot ?? el.id));
  expect(ordem.slice(ordem.indexOf("capitulo-numbers"), ordem.indexOf("capitulo-numbers") + 3)).toEqual(["capitulo-numbers", "resumo-numeros", "capitulo-trophies"]);
  expect(ordem.slice(ordem.indexOf("capitulo-timeline"), ordem.indexOf("capitulo-timeline") + 3)).toEqual(["capitulo-timeline", "resumo-jornal", "capitulo-newspaper"]);
  await semConflito(page);
  await auditar(page, "resumo com a prévia dos anúncios");
  await page.screenshot({ path: info.outputPath("d134-resumo.png") });

  if (mobile) {
    // A âncora só entra depois de rolar, e a página reserva a altura dela embaixo.
    await expect(page.locator('[data-ad-slot="ancora-celular"]')).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(page.locator('[data-ad-slot="ancora-celular"]')).toBeVisible();
    expect(await tamanho(page, "ancora-celular")).toBe("320×50");
    const reservado = await page.locator("#conteudo").evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    expect(reservado).toBeGreaterThanOrEqual(58);
    // No fim da página, nada fica atrás da âncora.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const fim = await page.evaluate(() => {
      const anchor = document.querySelector(".ad-anchor")!.getBoundingClientRect();
      const items = [...document.querySelectorAll<HTMLElement>("#conteudo button, #conteudo a[href]")].filter((el) => el.getClientRects().length > 0);
      const last = items.at(-1)!.getBoundingClientRect();
      return last.bottom <= anchor.top;
    });
    expect(fim).toBe(true);
  }
});

test("D134: trilhos só onde sobra margem, nunca em cima do jogo", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "Trilho é do PC.");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(await linkDaColecao());
  await expect(page.locator(".summary")).toBeVisible();
  expect(await tamanho(page, "trilho-esquerdo")).toBe("300×600");
  expect(await tamanho(page, "trilho-direito")).toBe("300×600");
  const conteudo = await page.locator(".summary-chapter").first().boundingBox();
  const esquerdo = await page.locator('[data-ad-slot="trilho-esquerdo"]').boundingBox();
  const direito = await page.locator('[data-ad-slot="trilho-direito"]').boundingBox();
  expect(esquerdo!.x + esquerdo!.width).toBeLessThan(conteudo!.x);
  expect(direito!.x).toBeGreaterThan(conteudo!.x + conteudo!.width);
  await semConflito(page);

  // Numa tela de laptop comum, o resumo ainda ganha o 160×600; o hub não.
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(page.locator('[data-ad-slot="trilho-esquerdo"] .ad-frame')).toHaveCSS("width", "160px");
  await page.goto("/?ads=on");
  await expect(page.locator('[data-ad-slot="hub-rodape"]')).toBeVisible();
  await expect(page.locator(".ad-rail")).toHaveCount(0);

  // Na carreira, os trilhos ficam fora das três colunas; abaixo de 1696 px, somem.
  await page.setViewportSize({ width: 1920, height: 1080 });
  await entrarNoCraque(page);
  await jogoRapido(page);
  await expect(page.locator('[data-ad-slot="carreira-trilho-esquerdo"]')).toBeVisible();
  expect(await tamanho(page, "carreira-trilho-esquerdo")).toBe("160×600");
  const colunas = await page.locator(".career-columns").boundingBox();
  const trilho = await page.locator('[data-ad-slot="carreira-trilho-direito"]').boundingBox();
  expect(trilho!.x).toBeGreaterThan(colunas!.x + colunas!.width);
  // O laço continua sem rolar (D23).
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  await page.setViewportSize({ width: 1600, height: 900 });
  await expect(page.locator(".ad-rail")).toHaveCount(0);
});

test("D134: o laço do celular e a criação não têm anúncio", async ({ page }, info) => {
  test.skip(info.project.name !== "celular", "Celular.");
  await abrir(page, { motion: "reduced" }, "/?ads=on");
  await entrarNoCraque(page);
  await expect(page.locator(".ad-box")).toHaveCount(0);
  await jogoRapido(page);
  await expect(page.locator(".ad-box")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-ad-anchor"))).toBe(false);
});

test("D134: Alt + Shift + A esconde e mostra, e a escolha fica no aparelho", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "Atalho de teclado.");
  await abrir(page, { motion: "reduced" }, "/?ads=on");
  const toggle = page.getByRole("button", { name: "Mostrar ou ocultar a prévia dos anúncios" });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".ad-box")).toHaveCount(1);
  await page.keyboard.press("Alt+Shift+KeyA");
  await expect(page.locator(".ad-box")).toHaveCount(0);
  // Sem o "?ads=on" na URL, vale o que ficou guardado.
  await page.goto("/");
  await expect(page.locator("#conteudo h1").first()).toBeVisible();
  await expect(page.locator(".ad-box")).toHaveCount(0);
  await page.keyboard.press("Alt+Shift+KeyA");
  await expect(page.locator(".ad-box")).toHaveCount(1);
});

test("D134: o intervalo do sorteio de clubes mostra o 300×250 do recompensado", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("futeiro.ads-preview", "on"));
  await abrirMomento(page, await colecao(), 40, { motion: "reduced" });
  await page.locator(".season-decision-slide[data-active] .option-redraw").click();
  const ad = page.getByRole("alertdialog", { name: "Intervalo comercial" });
  await expect(ad).toBeVisible();
  await expect(ad.locator('[data-ad-slot="sorteio-recompensado"]')).toBeVisible();
  expect(await tamanho(page, "sorteio-recompensado")).toBe("300×250");
  await expect(ad).toBeHidden({ timeout: 5_000 });
});
