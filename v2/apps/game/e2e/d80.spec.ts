import { expect, test } from "@playwright/test";
import { abrir, abrirCraque, auditar, entrarNoCraque, esperarQueCaiba, jogoRapido, OPCOES } from "./apoio";

for (const scenario of [{ scene: "bicycle", title: "De costas para o gol", position: "st" }, { scene: "goalLine", title: "Em cima da linha", position: "cb" }, { scene: "keeperCorner", title: "A última subida", position: "gk" }]) test(`D80: debug força ${scenario.scene} no componente real, sem rolagem`, async ({page}, info) => {
  await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
  await abrir(page, { motion: "reduced", theme: scenario.scene === "goalLine" ? "light" : "dark" }, "http://127.0.0.1:4174/");
  await entrarNoCraque(page); await jogoRapido(page);
  await page.getByRole("button", { name: "Controles de teste", exact: true }).click();
  const debug = page.getByRole("dialog", { name: "Controles de teste" });
  await expect(debug.getByLabel("Forçar decisão").locator("option")).toHaveCount(102);
  await debug.getByLabel("Forçar decisão").selectOption(`match:${scenario.scene}`);
  await debug.getByLabel("Posição", { exact: true }).selectOption(scenario.position);
  await debug.getByRole("button", { name: "Aplicar cenário", exact: true }).click();
  await expect(page.locator(".decision-title")).toContainText(scenario.title);
  await expect(page.locator(OPCOES)).toHaveCount(3);
  if (scenario.scene === "keeperCorner") { await expect(page.locator(".match-minute")).toContainText("94"); await expect(page.locator(".led-score")).toHaveAttribute("aria-label", "1 : 2"); }
  await esperarQueCaiba(page); await auditar(page, `D80 ${scenario.scene}`);
  await page.screenshot({ path: info.outputPath(`d80-${scenario.scene}.png`) });
  await page.locator(OPCOES).first().click();
  await expect(page.locator(".match-outcome")).toBeVisible();
  await esperarQueCaiba(page);
  expect(await page.locator(".season-decision-slide[data-active] .match-continue").evaluate(button=>button.getBoundingClientRect().bottom<=button.closest(".season-decision-window")!.getBoundingClientRect().bottom), "O relato e o botão precisam caber inteiros").toBe(true);
  await page.screenshot({ path: info.outputPath(`d80-${scenario.scene}-resultado.png`) });
});

test("D80: laboratório resolve reação como empate e pênalti conserva subtextos curtos", async ({page},info) => {
  await abrir(page, { motion: "reduced" }, "http://127.0.0.1:4174/#lab");
  await page.getByRole("tab", { name: "Design", exact: true }).click();
  const lab = page.locator(".match-lab");
  await lab.getByRole("button", { name: /O pênalti decisivo ·/ }).click();
  await expect(lab.locator(".drama-hint")).toHaveText(["Mais protagonismo", "Sem bônus individual."]);
  await lab.getByRole("button", { name: /Entre as linhas ·/ }).click();
  expect(await lab.locator(".match-scoreboard b").evaluateAll(nodes => nodes.every(node => node.getBoundingClientRect().height <= parseFloat(getComputedStyle(node).lineHeight) + 1)), "Flamengo e Palmeiras devem caber sem quebrar o nome no meio").toBe(true);
  await expect(lab.locator(".led-score")).toHaveAttribute("aria-label", "0 : 1");
  await lab.locator(".drama-option").first().click();
  await expect(lab.locator(".match-final h3")).toContainText("1 × 1 · Empate");
  await expect(lab.locator(".match-final h3")).not.toContainText("DERROTA");
  await lab.locator(".match-lab-preview").screenshot({ path: info.outputPath("d80-empate.png") });
});

test("D80: controles de teste ficam fora da produção", async ({page}) => {
  await abrirCraque(page);
  await expect(page.getByRole("button", { name: "Controles de teste", exact: true })).toHaveCount(0);
});
