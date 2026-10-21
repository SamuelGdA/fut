import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { abrirMomento, auditar, esperarQueCaiba } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json", import.meta.url), "utf8")) as { moments: Record<string, { file: string; index: number; resultScore?: number[] }> };
async function partida(page: Page, moment: string, theme: "light" | "dark", motion: "full" | "reduced" = "full") {
  const fixture = metadata.moments[moment]!;
  const raw = await readFile(new URL(`./fixtures/${fixture.file}`, import.meta.url));
  await abrirMomento(page, raw, fixture.index, { theme, motion });
}

for (const theme of ["light", "dark"] as const) for (const moment of ["nation", "cb", "rb"] as const) {
  test(`D76: escolha marcada e feedback ${moment}, ${theme}`, async ({ page }, info) => {
    await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
    await partida(page, moment, theme);
    const chosen = await page.locator(".drama-option .option-title").first().textContent();
    const id = await page.locator(".season-decision-slide[data-active] .decision").getAttribute("aria-labelledby");
    await page.locator(".drama-option").first().focus();
    await page.keyboard.press("Enter");
    // Usa a pausa de aba oculta do jogo para inspecionar o estado intermediário.
    // O relógio do navegador continua livre para a auditoria de acessibilidade.
    await page.evaluate(() => {
      Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(650);
    const result = page.locator(".match-outcome");
    await expect(result).toHaveAttribute("data-success", String(moment !== "rb"));
    await expect(page.locator(".season-decision-slide[data-active] .decision")).toHaveAttribute("aria-labelledby", id!);
    const selected = page.locator(".match-selected-choice .drama-option");
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(selected).toBeDisabled();
    await expect(selected.locator(".option-title")).toHaveText(chosen!);
    await expect(page.locator(".drama-option")).toHaveCount(1);
    await expect(result.locator("canvas")).toHaveCount(0);
    await expect(result.locator(".match-feedback svg")).toHaveCount(1); // Somente o ícone original Check/X.
    await expect(page.locator(".led-score")).toHaveAttribute("aria-label", metadata.moments[moment]!.resultScore!.join(" : "));
    await expect(page.locator(".match-scoreboard strong")).toHaveAttribute("data-updated", "true");
    const ui = await page.evaluate(() => {
      const choice = document.querySelector(".match-selected-choice")!.getBoundingClientRect();
      const card = document.querySelector(".match-feedback")!;
      const result = document.querySelector(".match-outcome")!;
      const style = getComputedStyle(card);
      return { below: card.getBoundingClientRect().top >= choice.bottom, enter: getComputedStyle(result).animationDuration, shake: style.animationName, shakeDuration: style.animationDuration, shakeDelay: style.animationDelay };
    });
    expect(ui.below).toBe(true); expect(ui.enter).toBe("0.42s");
    if (moment === "rb") { expect(ui.shake).toBe("decision-result-shake"); expect(ui.shakeDuration).toBe("0.15s"); expect(ui.shakeDelay).toBe("0.42s"); }
    else expect(ui.shake).toBe("none");
    await expect(result.locator(".match-result-badge")).toContainText(moment === "nation" ? "GOL DECISIVO!" : moment === "cb" ? "NO TEMPO CERTO" : "PASSE INTERCEPTADO");
    if (await result.getAttribute("data-champion") === "true") {
      await expect(result.locator(".match-result-trophy img")).toBeVisible();
      expect(await result.locator(".match-result-trophy img").evaluate((node) => {
        const box = node.getBoundingClientRect(), frame = node.parentElement!.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && box.left >= frame.left && box.right <= frame.right && box.top >= frame.top && box.bottom <= frame.bottom;
      })).toBe(true);
    } else await expect(result.locator(".match-result-trophy")).toHaveCount(0);
    await esperarQueCaiba(page);
    await auditar(page, `D76 ${moment} ${theme}`, ".drama-decision");
    await page.screenshot({ path: info.outputPath(`feedback-${moment}-${theme}.png`), style: ".toast-viewport { visibility:hidden !important }" });
    await page.evaluate(() => {
      Reflect.deleteProperty(document,"hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.getByRole("button", { name: "Continuar", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(result).toHaveCount(0);
  });
}

for (const source of ["game", "system"] as const) test(`D77: preferência de animação do jogo, ${source}`, async ({ page }, info) => {
  if (info.project.name === "celular") await page.setViewportSize({ width: 360, height: 640 });
  await page.emulateMedia({ reducedMotion: source === "system" ? "reduce" : "no-preference" });
  await partida(page, "rb", "dark", source === "game" ? "reduced" : "full");
  await page.locator(".drama-option").first().click();
  await expect(page.locator(".match-feedback")).toBeVisible();
  if (source === "game") expect(await page.locator(".match-outcome, .match-feedback, .match-scoreboard strong").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).animationName === "none"))).toBe(true);
  else {
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    expect(await page.locator(".match-outcome").evaluate(node => getComputedStyle(node).animationName)).toBe("decision-result-enter");
    expect(await page.locator(".led-digits-new .led-team-digits[data-changed]").evaluate(node => getComputedStyle(node).animationName)).toBe("led-number-in");
  }
  await esperarQueCaiba(page);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.locator(".match-outcome")).toHaveCount(0);
});
