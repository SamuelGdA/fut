import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, esperarQueCaiba } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json", import.meta.url), "utf8")) as { moments: Record<string, { file: string; index: number }> };
interface UiFrame { t: number; opacity: number; resultY: number; digitY: number; incoming: number; outgoing: number; changed: boolean; width: number }
for (const theme of ["light", "dark"] as const) test(`D77: espaço, aviso imediato, resultado e dígitos animados, arrasto automático, ${theme}`, async ({ page }, info) => {
  await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const moment = metadata.moments.cb!;
  const raw = await readFile(new URL(`./fixtures/${moment.file}`, import.meta.url));
  await abrirMomento(page, raw, moment.index, { theme });
  await expect(page.locator(".season-decision-slide")).toHaveCount(1);
  const spacing = await page.locator(".drama-decision").evaluate(node => {
    const box = node.getBoundingClientRect(), heading = node.querySelector(".drama-heading")!.getBoundingClientRect();
    const options = node.querySelectorAll(".drama-option");
    const a = options[0]!.getBoundingClientRect(), b = options[1]!.getBoundingClientRect();
    return { left: heading.left - box.left, right: box.right - heading.right, gap: b.top - a.bottom };
  });
  expect(spacing.left).toBeGreaterThanOrEqual(12); expect(spacing.right).toBeGreaterThanOrEqual(12); expect(spacing.gap).toBeGreaterThanOrEqual(8);
  expect(await page.locator(".drama-options").evaluate(node => {
    const bounds = node.closest(".season-decision-window")!.getBoundingClientRect();
    return [...node.children].every(child => child.getBoundingClientRect().bottom <= bounds.bottom + 1);
  }), "Todas as opções devem caber inteiras").toBe(true);
  await esperarQueCaiba(page);
  const headerBefore = await page.locator(".match-broadcast").boundingBox();
  const id = await page.locator(".season-decision-slide[data-active] .decision").getAttribute("aria-labelledby");
  // Começa a observar antes do clique: as verificações seguintes não podem perder a entrada de 420 ms.
  await page.evaluate(() => {
    const target = window as typeof window & { d77Frames: Promise<UiFrame[]> };
    target.d77Frames = new Promise<UiFrame[]>((resolve) => {
      const frames: UiFrame[] = []; let start: number | null = null;
      const sample = () => {
        const result = document.querySelector(".match-outcome"), digits = document.querySelector(".led-digits-new .led-team-digits[data-changed]");
        if (start === null) { if (!result) { requestAnimationFrame(sample); return; } start = performance.now(); }
        const incoming = document.querySelector(".season-decision-slide[data-active]"), outgoing = document.querySelector(".season-decision-slide[aria-hidden='true']");
        const shift = (node: Element | null, axis: "m41" | "m42") => node && getComputedStyle(node).transform !== "none" ? new DOMMatrixReadOnly(getComputedStyle(node).transform)[axis] : 0;
        frames.push({ t: performance.now() - start, opacity: result ? +getComputedStyle(result).opacity : 1, resultY: shift(result, "m42"), digitY: shift(digits, "m42"), incoming: shift(incoming, "m41"), outgoing: shift(outgoing, "m41"), changed: Boolean(outgoing), width: incoming?.getBoundingClientRect().width ?? 0 });
        if (performance.now() - start < 3500) requestAnimationFrame(sample); else resolve(frames);
      };
      requestAnimationFrame(sample);
    });
  });
  await page.locator(".drama-option").first().click();
  await expect(page.locator(".result-layer .result-msg")).toBeVisible({ timeout: 500 });
  const headerAfter = await page.locator(".match-broadcast").boundingBox();
  expect(headerAfter!.y).toBeCloseTo(headerBefore!.y, 1);
  await expect(page.locator(".season-decision-slide[data-active] .decision")).toHaveAttribute("aria-labelledby", id!);
  await expect(page.locator(".match-continue")).toHaveClass(/font-display/);
  const samples = await page.evaluate(() => (window as typeof window & { d77Frames: Promise<UiFrame[]> }).d77Frames);
  await info.attach("movimentos-da-interface", { body: JSON.stringify(samples), contentType: "application/json" });
  expect(samples.some(frame => frame.opacity > 0 && frame.opacity < .98 && frame.resultY > .1)).toBe(true);
  expect(samples.some(frame => frame.digitY > 2)).toBe(true);
  expect(samples.some(frame => frame.incoming > frame.width * .4 && frame.outgoing < -1)).toBe(true);
  const begins = samples.find(frame => frame.changed)!;
  expect(begins).toBeDefined(); expect(begins.t).toBeGreaterThan(1700); expect(begins.t).toBeLessThan(2400);
  await expect(page.locator(".season-decision-slide")).toHaveCount(1);
  await esperarQueCaiba(page);
});

test("D77: jornal aberto folheia a temporada inteira e volta por teclado", async ({ page }, info) => {
  if (info.project.name === "celular") await page.setViewportSize({ width: 360, height: 640 });
  const raw = await readFile(new URL("./fixtures/colecao-m23.json", import.meta.url));
  await abrir(page, { theme: "light" }, `/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.getByRole("link", { name: "Jornal", exact: true }).click();
  const book = page.locator(".paper-stage"), spread = book.locator(".paper-spread");
  const year = await spread.getAttribute("data-year");
  await book.focus(); await page.keyboard.press("ArrowRight");
  await expect(book.locator(".paper-sheet-front .paper-page")).toHaveCount(1);
  await expect(book.locator(".paper-sheet-back .paper-page")).toHaveCount(1);
  await expect(book.locator(".paper-sheet")).toHaveCount(0);
  await expect(spread).not.toHaveAttribute("data-year", year!);
  await page.keyboard.press("ArrowLeft");
  await expect(book.locator(".paper-sheet")).toHaveCount(0);
  await expect(spread).toHaveAttribute("data-year", year!);
  await expect(spread.locator(".paper-page")).toHaveCount(2);
  await page.screenshot({ path: info.outputPath("jornal-aberto.png") });
});
