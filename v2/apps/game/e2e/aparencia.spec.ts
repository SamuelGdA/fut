import { expect, test } from "@playwright/test";
import { abrirCraque, auditar } from "./apoio";

for (const theme of ["light", "dark"] as const) {
  test(`aparência sem salto entre abas, ${theme}`, async ({ page }, info) => {
    await abrirCraque(page, { theme });
    await page.getByRole("button", { name: "Começar carreira", exact: true }).click();
    if (info.project.name === "celular") {
      await page.getByLabel("Sobrenome").fill("Silva");
      await page.getByRole("button", { name: "Avançar", exact: true }).click();
      await page.getByRole("searchbox", { name: "Buscar país" }).fill("Brasil");
      await page.getByRole("option", { name: /Brasil/ }).click();
      await page.getByRole("button", { name: "Avançar", exact: true }).click();
      await page.getByRole("radio", { name: "Centroavante", exact: true }).click();
      await page.getByRole("button", { name: "Avançar", exact: true }).click();
    }
    await page.getByRole("button", { name: "Editar aparência", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Rosto", exact: true })).toBeVisible();
    const preview = page.locator(".avatar-editor-preview");
    const before = await preview.boundingBox();
    const positions: number[] = [];
    for (const name of ["Rosto", "Cabelo e barba", "Detalhes", "Rosto"]) {
      await page.getByRole("tab", { name, exact: true }).click();
      await expect(page.getByRole("tabpanel")).toHaveCount(1);
      const box = await preview.boundingBox();
      expect(box?.x).toBe(before?.x);
      expect(box?.y).toBe(before?.y);
      positions.push((await page.getByRole("button", { name: "Pronto", exact: true }).boundingBox())?.y ?? 0);
    }
    if (positions.length) expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
    await auditar(page, `Aparência ${theme}`);
    await page.screenshot({ path: info.outputPath(`aparencia-${theme}.png`), fullPage: true });
  });
}
