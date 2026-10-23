import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { abrirMomento, auditar, esperarQueCaiba } from "./apoio";

const metadata = JSON.parse(await readFile(new URL("./fixtures/momentos-m23.json", import.meta.url), "utf8")) as { engine: string; moments: Record<string, { file: string; index: number }> };

for (const theme of ["light", "dark"] as const) for (const kind of ["match", "promise", "veteran"] as const) {
  test(`D73: ${kind}, ${theme}, teclado e leitura`, async ({ page }, info) => {
    await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
    const sample = metadata.moments[kind === "match" ? "league" : kind]!;
    const replay = await readFile(new URL(`./fixtures/${sample.file}`, import.meta.url));
    await abrirMomento(page, replay, sample.index, { theme });
    await expect(page.locator(`.drama-decision[data-kind='${kind}']`)).toBeVisible();
    if (kind === "veteran") await expect(page.locator(".drama-option")).toHaveCount(6);
    if (kind === "match") {
      await expect(page.locator(".match-scoreboard")).toContainText("1 : 1");
      await expect(page.locator(".match-minute")).toContainText("′");
      expect(await page.locator(".career").evaluate((node) => getComputedStyle(node).getPropertyValue("--match-accent").trim())).not.toBe("");
    }
    await esperarQueCaiba(page);
    expect(await page.locator(".play-honours-art").evaluateAll((nodes) => nodes.every((node) => {
      const box = node.getBoundingClientRect();
      return [...node.querySelectorAll("img, svg")].every((art) => {
        const rect = art.getBoundingClientRect();
        return rect.left >= box.left - 1 && rect.right <= box.right + 1 && rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1;
      });
    })), "As taças precisam caber no quadro da temporada").toBe(true);
    expect(await page.locator(".drama-option").evaluateAll((nodes) => nodes.every((node) => node.scrollHeight <= node.clientHeight + 2))).toBe(true);
    expect(await page.locator(".drama-options").evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return [...node.children].every((child) => {
        const rect = child.getBoundingClientRect();
        return rect.top >= bounds.top - 2 && rect.bottom <= bounds.bottom + 2;
      });
    }), "Todas as escolhas precisam aparecer inteiras, sem rolar o card").toBe(true);
    await auditar(page, `D73 ${kind} ${theme}`);
    await page.screenshot({ path: info.outputPath(`${kind}-${theme}.png`), style: ".toast-viewport { visibility: hidden !important; }" });
    const first = page.locator(".drama-option").first();
    await first.focus();
    await page.keyboard.press("Enter");
    if (kind !== "veteran") await expect(page.locator(".result-title").first()).toBeVisible();
    if (kind === "match") {
      await expect(page.locator(".match-outcome .result-title")).toContainText("Placar final");
      await expect(page.locator(".match-outcome")).toBeVisible();
      await page.locator(".match-continue").click();
    }
    await esperarQueCaiba(page);
    await auditar(page, `D73 resultado ${kind} ${theme}`);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`D73: quatro atmosferas da carreira, ${theme}`, async ({ page }, info) => {
    // Cada família tem o seu pacote de transmissão (D83): competição, padrão e a faixa do time.
    const packages: Record<string, readonly [string, string]> = { europe: ["ucl", "stars"], america: ["libertadores", "rays"], world: ["worldcup", "globe"], nation: ["copaamerica", "aguayo"] };
    for (const family of ["europe", "america", "world", "nation"]) {
      const target = await page.context().newPage();
      await target.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
      const moment = metadata.moments[family];
      expect(moment, `A fixture precisa de uma partida ${family}`).toBeDefined();
      const raw = await readFile(new URL(`./fixtures/${moment!.file}`, import.meta.url));
      expect(JSON.parse(raw.toString()).engine).toBe(metadata.engine);
      await abrirMomento(target, raw, moment!.index, { theme });
      await expect(target.locator(".match-scoreboard")).toBeVisible();
      const [broadcast, motif] = packages[family]!;
      const stage = target.locator(".season-decision-slide[data-active] .drama-decision.bc-stage");
      await expect(stage).toHaveAttribute("data-broadcast", broadcast);
      await expect(stage).toHaveAttribute("data-motif", motif);
      await expect(stage.locator(".match-scarf[data-kit]")).toHaveCount(1);
      await expect(stage.locator(".match-scoreboard > span[data-kit]")).toHaveCount(2);
      await expect(stage.locator(".match-competition .bc-emblem")).toHaveCount(1);
      if (family === "nation" || family === "world") {
        expect(await target.locator(".career").evaluate((node) => getComputedStyle(node).getPropertyValue("--match-bg-gradient"))).toContain("color-mix");
        await expect(stage.locator(".match-scarf")).toHaveAttribute("data-kit", "flag");
        await expect(target.locator("[data-motif='stars']")).toHaveCount(0);
      }
      await auditar(target, `Atmosfera ${family}, ${theme}`);
      await target.screenshot({ path: info.outputPath(`atmosfera-${family}-${theme}.png`), style: ".toast-viewport { visibility: hidden !important; }" });
      await target.locator(".drama-option").first().click();
      await expect(target.locator(".match-outcome .result-title")).toContainText(/Classificado|Eliminado|Campeão|Vice-campeão/);
      await expect(target.locator(".match-feedback")).toBeVisible();
      await expect(target.locator(".match-selected-choice .drama-option")).toBeDisabled();
      await expect(target.locator(".match-outcome canvas")).toHaveCount(0);
      await esperarQueCaiba(target);
      await target.close();
    }
  });
}
