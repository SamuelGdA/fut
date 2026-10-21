import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { deflateRawSync } from "node:zlib";
import { abrir, abrirMomento, auditar, esperarQueCaiba, fixturePlans } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json", import.meta.url), "utf8")) as { moments: Record<string, { file: string; index: number }> };
for (const theme of ["light", "dark"] as const) {
  test(`D82: jornal ampliado navega sem fechar e preserva a folha, ${theme}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const raw = await readFile(new URL("./fixtures/colecao-m23.json", import.meta.url));
    await abrir(page, { theme, motion: "reduced" }, `/#c=z${deflateRawSync(raw).toString("base64url")}`);
    await page.getByRole("link", { name: "Jornal", exact: true }).click();
    await page.getByRole("button", { name: "Ampliar jornal", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Ampliar jornal", exact: true });
    const previous = dialog.getByRole("button", { name: "Página anterior", exact: true });
    const next = dialog.getByRole("button", { name: "Próxima página", exact: true });
    await expect(previous).toBeDisabled();
    const year = await dialog.locator(".paper-page").getAttribute("data-year");
    await dialog.getByRole("button", { name: "Bastidores", exact: true }).click();
    await next.click();
    await expect(dialog.locator(".paper-page")).not.toHaveAttribute("data-year", year!);
    await expect(dialog.locator(".paper-page")).toHaveAttribute("data-leaf", "inside");
    await expect(dialog.locator(".paper-moment-story").first()).toBeVisible();
    const story = dialog.locator(".paper-moment-story").first();
    await expect(story).not.toContainText(/\b(Você|Sua|Seu)\b/);
    expect(await story.evaluate(n => ({ family: getComputedStyle(n).fontFamily, size: parseFloat(getComputedStyle(n).fontSize) }))).toMatchObject({ size: 14 });
    expect(await story.evaluate(n => getComputedStyle(n).fontFamily)).toContain("Schibsted");
    await previous.click(); await expect(dialog.locator(".paper-page")).toHaveAttribute("data-year", year!);
    await expect(previous).toBeDisabled();
    const controls = await Promise.all([previous.boundingBox(), next.boundingBox(), dialog.getByRole("button", { name: "Fechar", exact: true }).boundingBox()]);
    expect(controls.every(b => b && Math.abs(b.y - controls[0]!.y) < 8)).toBe(true);
    await next.click();
    await auditar(page, `D82 leitor ${theme}`);
    await page.screenshot({ path: info.outputPath(`d82-leitor-${theme}.png`) });
    let notes = 0;
    for (let i = 0; i < 30; i++) {
      const heading = dialog.locator(".paper-inside-notes h5").first();
      if (await heading.count()) {
        notes++;
        expect(await heading.evaluate(n => ({ family: getComputedStyle(n).fontFamily, size: parseFloat(getComputedStyle(n).fontSize), weight: getComputedStyle(n).fontWeight }))).toMatchObject({ size: 16, weight: "700" });
        expect(await heading.evaluate(n => getComputedStyle(n).fontFamily)).toContain("Schibsted");
        if (notes === 1) { await heading.scrollIntoViewIfNeeded(); await page.screenshot({ path: info.outputPath(`d82-promessa-jornal-${theme}.png`) }); }
      }
      if (await next.isDisabled()) break;
      await next.click();
    }
    expect(notes).toBeGreaterThan(0);
    await expect(next).toBeDisabled(); await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator(".paper-stage .paper-spread")).toHaveAttribute("data-year", "2046");
  });

  for (const route of ["sameYear", "fastYear", "nextMain"] as const) test(`D82: deslize conserva dimensões até sair, ${route}, ${theme}`, async ({ page }, info) => {
    await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
    const sample = metadata.moments[route === "fastYear" ? "fastTwo" : "europe"]!;
    const raw = await readFile(new URL(`./fixtures/${sample.file}`, import.meta.url));
    const seed = (JSON.parse(raw.toString()) as { setup: { seed: string } }).setup.seed;
    const plan = fixturePlans[seed]!;
    const index = plan.findIndex((step, i) => step.match && plan[i + 1] && (route === "sameYear" ? plan[i + 1]!.match && plan[i + 1]!.year === step.year : route === "fastYear" ? plan[i + 1]!.match && plan[i + 1]!.year > step.year : !plan[i + 1]!.match && plan[i + 1]!.year > step.year));
    expect(index).toBeGreaterThanOrEqual(0);
    await abrirMomento(page, raw, index, { theme, motion: "full" });
    await page.locator(".season-decision-slide[data-active] .drama-option").first().click();
    await expect(page.locator(".match-outcome")).toBeVisible();
    const frames = await page.evaluate(async () => {
      const card = document.querySelector(".season-decision-slide[data-active]")!;
      const initial = card.getBoundingClientRect();
      (card.querySelector(".match-continue") as HTMLButtonElement).click();
      const frames: { width: number; height: number; top: number; x: number }[] = [];
      const end = performance.now() + 750;
      while (card.isConnected && performance.now() < end) {
        const b = card.getBoundingClientRect();
        frames.push({ width: b.width, height: b.height, top: b.top, x: b.x });
        await new Promise(requestAnimationFrame);
      }
      return { initial: { width: initial.width, height: initial.height, top: initial.top }, frames };
    });
    expect(frames.frames.length).toBeGreaterThan(4);
    expect(Math.min(...frames.frames.map(f => f.x))).toBeLessThan(-20);
    for (const frame of frames.frames) {
      expect(frame.width).toBeCloseTo(frames.initial.width, 0);
      expect(frame.height).toBeCloseTo(frames.initial.height, 0);
      expect(frame.top).toBeCloseTo(frames.initial.top, 0);
    }
    await expect(page.locator(".career")).not.toHaveAttribute("data-transitioning");
    await expect(page.locator(".season-decision-slide[data-active] .decision-title")).toBeFocused();
    await esperarQueCaiba(page);
    await auditar(page, `D82 transição ${route} ${theme}`);
    await page.screenshot({ path: info.outputPath(`d82-transicao-${route}-${theme}.png`), style: ".toast-viewport {visibility:hidden!important}" });
  });
}

test("D82: trocar de aba durante o resultado não bloqueia a próxima decisão", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const sample = metadata.moments.europe!;
  await abrirMomento(page, await readFile(new URL(`./fixtures/${sample.file}`, import.meta.url)), sample.index, { motion: "full" });
  await page.locator(".season-decision-slide[data-active] .drama-option").first().click();
  await expect(page.locator(".match-outcome")).toBeVisible();
  await page.getByRole("tab", { name: "Jogador", exact: true }).click();
  await page.waitForTimeout(3400);
  await page.getByRole("tab", { name: "Temporada", exact: true }).click();
  await expect(page.locator(".career")).not.toHaveAttribute("data-transitioning");
  await expect(page.locator(".season-decision-window")).not.toHaveAttribute("inert");
  await expect(page.locator(".season-decision-slide[data-active] .decision-title")).toBeVisible();
  await esperarQueCaiba(page);
});
