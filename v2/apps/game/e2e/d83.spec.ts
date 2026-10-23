import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { abrir, abrirMomento, auditar, esperarQueCaiba } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json", import.meta.url), "utf8")) as { moments: Record<string, { file: string; index: number }> };

/** Os momentos reais das fixtures e o pacote de transmissão que cada um tem de mostrar. */
const FAMILIES = { europe: ["ucl", "stars"], america: ["libertadores", "rays"], world: ["worldcup", "globe"], nation: ["copaamerica", "aguayo"], league: ["league:BRA", "stands"] } as const;

/**
 * Contraste das superfícies de leitura, nas cores que o navegador calculou: o
 * texto das opções contra o fundo da opção e o texto do cabeçalho contra a
 * placa. O axe não mede texto sobre degradê; esta conta mede.
 */
async function leitura(page: Page) {
  return page.evaluate(() => {
    const channels = (color: string) => {
      const value = color.trim();
      if (value.startsWith("#")) return [1, 3, 5].map((start) => parseInt(value.slice(start, start + 2), 16));
      return value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    };
    const luminance = (color: string) => {
      const [r, g, b] = channels(color).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const ratio = (a: string, b: string) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number]; return (x + 0.05) / (y + 0.05); };
    const slide = document.querySelector(".season-decision-slide[data-active]")!;
    const stage = slide.querySelector<HTMLElement>(".drama-decision.bc-stage")!;
    const plate = getComputedStyle(stage).getPropertyValue("--bc-plate");
    const color = (selector: string) => getComputedStyle(slide.querySelector(selector)!).color;
    const options = [...slide.querySelectorAll<HTMLElement>(".drama-option")].map((option) => {
      const background = getComputedStyle(option).backgroundColor;
      return { title: ratio(getComputedStyle(option.querySelector(".option-title")!).color, background), hint: ratio(getComputedStyle(option.querySelector(".drama-hint")!).color, background) };
    });
    return {
      options,
      competition: ratio(color(".match-competition"), plate),
      live: ratio(color(".match-live"), plate),
      minute: ratio(color(".match-minute"), plate),
      year: ratio(color(".match-broadcast-top"), plate),
    };
  });
}

for (const [family, [broadcast, motif]] of Object.entries(FAMILIES)) {
  test(`D83: transmissão ${broadcast}, leitura e faixas do time`, async ({ page }, info) => {
    await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
    const moment = metadata.moments[family]!;
    await abrirMomento(page, await readFile(new URL(`./fixtures/${moment.file}`, import.meta.url)), moment.index, { theme: "dark" });
    const stage = page.locator(".season-decision-slide[data-active] .drama-decision.bc-stage");
    await expect(stage).toHaveAttribute("data-broadcast", broadcast);
    await expect(stage).toHaveAttribute("data-motif", motif);
    // O padrão de fundo é uma máscara do pseudo-elemento, nunca uma imagem por cima do texto.
    expect(await stage.evaluate((node) => getComputedStyle(node, "::before").maskImage)).not.toBe("none");
    // Cada time com a sua barra no placar e a faixa do time de quem joga no pé do cabeçalho.
    const sides = stage.locator(".match-scoreboard > span[data-kit]");
    await expect(sides).toHaveCount(2);
    expect(await sides.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node, "::after").backgroundImage).every((image) => image.includes("gradient")))).toBe(true);
    expect(await stage.locator(".match-scarf").evaluate((node) => getComputedStyle(node).backgroundImage)).toContain("gradient");
    const reading = await leitura(page);
    for (const option of reading.options) {
      // 7:1 mesmo com a opção sob o cursor, a superfície mais clara.
      expect(option.title, "título da opção").toBeGreaterThanOrEqual(7);
      expect(option.hint, "texto da opção").toBeGreaterThanOrEqual(4.5);
    }
    expect(reading.competition, "nome da competição").toBeGreaterThanOrEqual(7);
    expect(reading.live, "selo ao vivo").toBeGreaterThanOrEqual(4.5);
    expect(reading.minute, "minuto").toBeGreaterThanOrEqual(4.5);
    expect(reading.year, "ano").toBeGreaterThanOrEqual(4.5);
    await esperarQueCaiba(page);
    await auditar(page, `D83 ${broadcast}`);
    await page.screenshot({ path: info.outputPath(`d83-${family}.png`), style: ".toast-viewport { visibility: hidden !important; }" });
  });
}

for (const motion of ["full", "reduced"] as const) test(`D83: reflexo de entrada e ponto ao vivo, animações ${motion}`, async ({ page }, info) => {
  await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const moment = metadata.moments.europe!;
  await abrirMomento(page, await readFile(new URL(`./fixtures/${moment.file}`, import.meta.url)), moment.index, { theme: "dark", motion });
  const header = page.locator(".season-decision-slide[data-active] .match-broadcast");
  const glint = await header.evaluate((node) => ({ name: getComputedStyle(node, "::after").animationName, display: getComputedStyle(node, "::after").display }));
  const live = await header.locator(".match-live i").evaluate((node) => getComputedStyle(node).animationName);
  if (motion === "reduced") {
    expect(glint.display).toBe("none");
    expect(live).toBe("none");
  } else {
    expect(glint.name).toBe("bc-glint");
    expect(live).toBe("bc-live");
  }
});

test("D83: vitrine de transmissões no laboratório", async ({ page }, info) => {
  await abrir(page, { theme: "dark", motion: "reduced" }, "http://127.0.0.1:4174/#lab");
  await page.getByRole("tab", { name: "Design", exact: true }).click();
  const gallery = page.locator(".bc-gallery");
  await gallery.scrollIntoViewIfNeeded();
  const tiles = gallery.locator(".bc-tile");
  // A vitrine monta depois da primeira pintura da área Design.
  await expect.poll(() => tiles.count()).toBeGreaterThanOrEqual(80);
  const ids = await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-broadcast")));
  expect(ids).not.toContain("generic");
  // Torneios sem país (continentais, mundiais e de seleções) nunca repetem identidade.
  const tournaments = ids.filter((id) => !id!.includes(":"));
  expect(new Set(tournaments).size).toBe(tournaments.length);
  expect(await tiles.locator(".bc-emblem").count()).toBe(ids.length);
  expect(await tiles.locator(".match-scarf[data-kit]").count()).toBe(ids.length);
  // A seleção escolhida veste todos os torneios de seleções: a Argentina leva o sol de Maio na faixa.
  await page.locator("#transmissoes select").selectOption("ARG");
  const world = gallery.locator(".bc-tile[data-broadcast='worldcup']");
  await expect(world.locator(".match-scoreboard b").first()).toHaveText("Argentina");
  await expect(world.locator(".match-scarf")).toHaveAttribute("data-kit", "flag");
  expect(await world.locator(".match-scarf").evaluate((node) => getComputedStyle(node).getPropertyValue("--kmark").trim())).toBe("#f6b40e");
  await auditar(page, "D83 vitrine", ".bc-gallery");
  await gallery.screenshot({ path: info.outputPath("d83-vitrine.png") });
});
