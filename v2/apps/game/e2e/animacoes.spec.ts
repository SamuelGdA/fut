import { expect, test } from "@playwright/test";
import { abrir, auditar } from "./apoio";

for (const theme of ["light", "dark"] as const) {
  test(`D69: animações independem do PC e a escolha fica salva, ${theme}`, async ({ page }, info) => {
    if (info.project.name === "celular") await page.setViewportSize({ width: 360, height: 640 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page, { theme });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    const durations = () => page.locator(".hub-card button").first().evaluate(node => getComputedStyle(node).transitionDuration);
    const enabled = await durations();
    expect(enabled.split(",").some(value => parseFloat(value) > 0.01)).toBe(true);
    await page.getByRole("button", { name: "Abrir ajustes" }).click();
    const toggle = page.getByRole("switch", { name: "Animações", exact: true });
    await expect(toggle).toBeChecked();
    await toggle.uncheck();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    expect(await durations()).not.toBe(enabled);
    await auditar(page, "Ajustes de animações", "[role='dialog']");
    await page.reload();
    await page.getByRole("button", { name: "Abrir ajustes" }).click();
    await expect(toggle).not.toBeChecked();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await toggle.check();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.getByRole("button", { name: "Abrir ajustes" }).click();
    await expect(toggle).toBeChecked();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    expect(await durations()).toBe(enabled);
    await expect(toggle).toBeInViewport();
    await page.screenshot({ path: info.outputPath(`animacoes-${theme}.png`) });
  });
}
