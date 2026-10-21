import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, auditar, esperarQueCaiba, fixturePlans } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json", import.meta.url), "utf8")) as { moments: Record<string, { file: string; index: number }> };
for (const motion of ["full", "reduced"] as const) test(`D74: avanço automático no mesmo ano, movimento ${motion}`, async ({ page }) => {
  const moment = metadata.moments.europe!;
  const raw = await readFile(new URL(`./fixtures/${moment.file}`, import.meta.url));
  const seed = (JSON.parse(raw.toString()) as {setup:{seed:string}}).setup.seed;
  const plan = fixturePlans[seed]!;
  const index = plan.findIndex((step, i) => step.match && plan[i + 1]?.match && plan[i + 1]?.year === step.year);
  expect(index, "A amostra precisa de duas partidas consecutivas na mesma temporada").toBeGreaterThanOrEqual(0);
  await abrirMomento(page, raw, index, { motion });
  const id = await page.locator(".season-decision-slide[data-active] .decision").getAttribute("aria-labelledby");
  const year = await page.locator(".season-decision-slide[data-active] .match-broadcast-top > span").last().textContent();
  await page.locator(".drama-option").first().click();
  await expect(page.locator(".match-outcome")).toBeVisible();
  await expect(page.getByRole("heading", { name: "O lance que decidiu", level: 2 })).toBeFocused();
  const shifts = await page.evaluate(async () => {
    const samples: number[] = [];
    const until = performance.now() + 4200;
    while (performance.now() < until) {
      const nodes = document.querySelectorAll(".season-decision-slide");
      for (const node of nodes) { const transform = getComputedStyle(node).transform; samples.push(transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41); }
      await new Promise(requestAnimationFrame);
    }
    return samples;
  });
  await expect(page.locator(".season-decision-slide[data-active] .decision")).not.toHaveAttribute("aria-labelledby", id!);
  await expect(page.locator(".season-decision-slide[data-active] .match-broadcast-top > span").last()).toHaveText(year!);
  if (motion === "full") { expect(Math.min(...shifts)).toBeLessThan(-1); expect(Math.max(...shifts)).toBeGreaterThan(1); }
  else expect(shifts.every((value) => Math.abs(value) < .01)).toBe(true);
});

for (const position of ["gk", "cb", "rb", "cm"] as const) test(`D74: lance por posição ${position}, LED e resultado no mesmo ano`, async ({ page }, info) => {
  await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
  const moment = metadata.moments[position]!;
  const raw = await readFile(new URL(`./fixtures/${moment.file}`, import.meta.url));
  await abrirMomento(page, raw, moment.index, { theme: position === "cb" || position === "cm" ? "dark" : "light" });
  await expect(page.locator(".led-score svg circle[data-lit]").first()).toBeVisible();
  expect(await page.locator(".drama-options").innerText()).not.toMatch(/%|\d+\s*(de sucesso|chance)/i);
  await expect(page.locator(".season-progress i[data-state='current']")).toHaveCount(1);
  expect(await page.locator(".season-progress i").count()).toBeGreaterThan(1);
  const year = await page.locator(".match-broadcast-top > span").last().textContent();
  const id = await page.locator(".season-decision-slide[data-active] .decision").getAttribute("aria-labelledby");
  await esperarQueCaiba(page);
  expect(await page.locator(".drama-options").evaluate(node => [...node.children].every(child => child.getBoundingClientRect().bottom <= node.closest(".season-decision-window")!.getBoundingClientRect().bottom - 8)), "As três opções precisam caber inteiras").toBe(true);
  await auditar(page, `D74 escolha ${position}`);
  await page.screenshot({ path: info.outputPath(`posicao-${position}.png`), style: ".toast-viewport { visibility:hidden }" });
  await page.locator(".drama-option").first().click();
  // A inspeção de contraste/captura pode durar mais que os 2.100ms da leitura automática.
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.locator(".match-outcome")).toBeVisible();
  await expect(page.locator(".season-decision-slide[data-active] .decision")).toHaveAttribute("aria-labelledby", id!);
  await expect(page.locator(".match-broadcast-top > span").last()).toHaveText(year!);
  await expect(page.locator(".match-feedback")).toBeVisible();
  await expect(page.locator(".match-selected-choice .drama-option")).toHaveAttribute("aria-pressed", "true");
  await esperarQueCaiba(page);
  await page.screenshot({ path: info.outputPath(`resultado-${position}.png`), style: ".toast-viewport { visibility:hidden }" });
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator(".season-decision-slide[data-active] .decision")).not.toHaveAttribute("aria-labelledby", id!);
});

for (const theme of ["light", "dark"] as const) test(`D74: duas folhas por ano, legendas completas e sem arquivo anual, ${theme}`, async ({ page }, info) => {
  if (info.project.name === "celular") await page.setViewportSize({ width: 360, height: 640 });
  const raw = await readFile(new URL("./fixtures/colecao-m23.json", import.meta.url));
  await abrir(page, { theme, motion: "reduced" }, `/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.getByRole("link", { name: "Números", exact: true }).click();
  await expect(page.locator(".drama-archive")).toHaveCount(0);
  await page.getByRole("link", { name: "Troféus", exact: true }).click();
  expect(await page.locator(".showcase-label").count()).toBeGreaterThan(10);
  expect(await page.locator(".showcase-label").evaluateAll((nodes) => nodes.every((node) => node.scrollHeight <= node.clientHeight + 1))).toBe(true);
  await page.getByRole("link", { name: "Jornal", exact: true }).click();
  const book = page.locator(".paper-stage");
  await expect(book.locator(".paper-page[data-leaf='cover']")).toHaveCount(1);
  const spread = book.locator('.paper-spread');
  const pages = spread.locator('.paper-page');
  await expect(pages).toHaveCount(2);
  const year = await spread.getAttribute('data-year');
  await expect(pages.nth(0)).toHaveAttribute('data-leaf', 'cover');
  await expect(pages.nth(1)).toHaveAttribute('data-leaf', 'blank');
  await expect(pages.nth(1)).toBeEmpty();
  expect(await pages.evaluateAll(nodes => {
    const a = nodes[0]!.getBoundingClientRect(), b = nodes[1]!.getBoundingClientRect();
    return Math.abs(a.top - b.top) < 1 && Math.abs(a.right - b.left) < 1;
  })).toBe(true);
  await page.screenshot({ path: info.outputPath(`jornal-aberto-vazio-${theme}.png`) });
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  await expect(book.locator('.paper-sheet')).toHaveCount(0);
  await expect(spread).not.toHaveAttribute('data-year', year!);
  for (let next = 0; next < 6 && await spread.locator('.paper-page[data-leaf="inside"]').count() === 0; next++) {
    await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
    await expect(book.locator('.paper-sheet')).toHaveCount(0);
  }
  await expect(spread.locator('.paper-page[data-leaf="inside"]')).toHaveCount(1);
  await expect(pages.nth(0)).toHaveAttribute('data-year', (await spread.getAttribute('data-year'))!);
  await expect(pages.nth(1)).toHaveAttribute('data-year', (await spread.getAttribute('data-year'))!);
  for (let season = 0; season < 6 && await spread.locator(".paper-moments li").count() === 0; season++) {
    await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
    await expect(book.locator('.paper-sheet')).toHaveCount(0);
  }
  expect(await spread.locator('.paper-moments li').count()).toBeGreaterThan(0);
  expect(await pages.evaluateAll(nodes => nodes.every(node => {
    const bounds = node.getBoundingClientRect();
    return node.scrollHeight <= node.clientHeight + 1 && [...node.querySelectorAll('.paper-moments li, .paper-inside-notes')].every(item => item.getBoundingClientRect().bottom < bounds.bottom);
  }))).toBe(true);
  expect(await spread.locator('.paper-photo img').evaluateAll(nodes => nodes.every(node => {
    const image = node.getBoundingClientRect(), frame = node.parentElement!.getBoundingClientRect();
    return image.left >= frame.left && image.right <= frame.right && image.top >= frame.top && image.bottom <= frame.bottom;
  })), 'O escudo deve caber na moldura do jornal').toBe(true);
  await auditar(page, 'D77 jornal aberto', '.paper-stage');
  await page.screenshot({ path: info.outputPath(`jornal-aberto-lances-${theme}.png`) });
});

test("D74: pilha grande abre gradualmente e termina sem sobreposição", async ({ page }, info) => {
  const raw = await readFile(new URL("./fixtures/pilhas-m23.json", import.meta.url));
  if (info.project.name === "celular") await page.setViewportSize({ width: 360, height: 640 });
  await abrir(page, { theme: "dark" }, `/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.getByRole("link", { name: "Caminho", exact: true }).click();
  const stacks = page.locator(".honour-stack[data-multiple]");
  const counts = await stacks.evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("data-count"))));
  const count = Math.max(...counts);
  expect(count).toBeGreaterThanOrEqual(9);
  const stack = stacks.nth(counts.indexOf(count));
  const copies = stack.locator(".honour-copy");
  await copies.last().scrollIntoViewIfNeeded();
  // Começa antes do toque: uma consulta só depois pode perder os quadros intermediários.
  const entering = copies.evaluateAll(async (nodes) => {
    const group = nodes[0]?.closest(".honour-stack");
    const until = performance.now() + 5000;
    while (performance.now() < until) {
      if (group?.hasAttribute("data-expanded") && [...group.querySelectorAll(".honour-copy")].some(node => {
        const opacity = Number(getComputedStyle(node).opacity);
        return opacity > 0 && opacity < 1;
      })) return true;
      await new Promise(requestAnimationFrame);
    }
    return false;
  });
  if (info.project.name === "desktop") await copies.last().hover();
  else await copies.last().locator(".honour-token").tap();
  await expect(copies).toHaveCount(count);
  expect(await entering, "A abertura deve mostrar opacidade intermediária depois do toque ou hover").toBe(true);
  await auditar(page, "D74 pilha grande");
  expect(await copies.evaluateAll((nodes) => nodes.every((node, index) => {
    const rect = node.getBoundingClientRect();
    return nodes.slice(index + 1).every((other) => {
      const next = other.getBoundingClientRect();
      return Math.min(rect.right, next.right) - Math.max(rect.left, next.left) < 1 || Math.min(rect.bottom, next.bottom) - Math.max(rect.top, next.top) < 1;
    });
  }))).toBe(true);
  await page.screenshot({ path: info.outputPath("pilha-grande.png") });
});
