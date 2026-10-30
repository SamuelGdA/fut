import { expect, test } from "@playwright/test";
import { abrir, auditar, entrarNoCraque, esperarQueCaiba, jogoRapido, OPCOES } from "./apoio";

// D91: as disputas de pênaltis raras, forçadas pelo debug no componente real.
for (const scenario of [
  { scene: "suddenDeath", title: "Nas alternadas", position: "cb", kick: "8ª cobrança" },
  { scene: "keeperShootout", title: "Só falta você", position: "gk", kick: "11ª cobrança" },
]) test(`D91: debug força ${scenario.scene}, com a cobrança no placar e sem rolagem`, async ({ page }, info) => {
  await page.setViewportSize(info.project.name === "celular" ? { width: 360, height: 640 } : { width: 1280, height: 720 });
  await abrir(page, { motion: "reduced", theme: scenario.position === "gk" ? "dark" : "light" }, "http://127.0.0.1:4174/");
  await entrarNoCraque(page); await jogoRapido(page);
  await page.getByRole("button", { name: "Controles de teste", exact: true }).click();
  const debug = page.getByRole("dialog", { name: "Controles de teste" });
  await debug.getByLabel("Forçar decisão").selectOption(`match:${scenario.scene}`);
  await debug.getByLabel("Posição", { exact: true }).selectOption(scenario.position);
  await debug.getByRole("button", { name: "Aplicar cenário", exact: true }).click();
  await expect(page.locator(".drama-kicker")).toContainText(scenario.title); // D106: o nome da cena fica acima do título do momento
  await expect(page.locator(OPCOES)).toHaveCount(2);
  await expect(page.locator(".match-minute")).toContainText(scenario.kick);
  await esperarQueCaiba(page); await auditar(page, `D91 ${scenario.scene}`);
  await page.screenshot({ path: info.outputPath(`d91-${scenario.scene}.png`) });
  await page.locator(OPCOES).first().click();
  await expect(page.locator(".match-outcome")).toBeVisible();
  await expect(page.locator(".match-final h3")).toContainText(/Pênaltis (8 × 7|7 × 8|11 × 10|10 × 11)/);
  await esperarQueCaiba(page);
  await page.screenshot({ path: info.outputPath(`d91-${scenario.scene}-resultado.png`) });
});

test("D91: pênalti contra o goleiro explica o canto do cobrador", async ({ page }) => {
  await abrir(page, { motion: "reduced" }, "http://127.0.0.1:4174/");
  await entrarNoCraque(page); await jogoRapido(page);
  await page.getByRole("button", { name: "Controles de teste", exact: true }).click();
  const debug = page.getByRole("dialog", { name: "Controles de teste" });
  await debug.getByLabel("Forçar decisão").selectOption("match:penaltySave");
  await debug.getByLabel("Posição", { exact: true }).selectOption("gk");
  await debug.getByRole("button", { name: "Aplicar cenário", exact: true }).click();
  await expect(page.locator(`${OPCOES} .drama-hint`)).toHaveText(["O cobrador já escolheu o canto. Acertou o lado, defendeu.", "Metade da chance para cada lado."]);
});

test("D91: laboratório mostra o empate segurado em amarelo e a queda nos pênaltis em laranja", async ({ page }, info) => {
  await abrir(page, { motion: "reduced" }, "http://127.0.0.1:4174/#lab");
  await page.getByRole("tab", { name: "Design", exact: true }).click();
  for (const [button, tone, eyebrow] of [["Empate segurado", "draw", "Segurou o empate!"], ["Caiu nos pênaltis", "short", "Caiu nos pênaltis!"]] as const) {
    await page.getByRole("button", { name: button, exact: true }).click();
    const message = page.locator(".result-msg").last();
    await expect(message).toHaveAttribute("data-tone", tone);
    await expect(message.locator(".result-eyebrow")).toHaveText(eyebrow);
    // No celular o aviso sai sozinho depois de 4 s; a captura fica no PC.
    if (info.project.name === "desktop") await message.screenshot({ path: info.outputPath(`d91-${tone}.png`) });
  }
  const colors = await page.locator(".result-msg").last().evaluate((node) => getComputedStyle(node).getPropertyValue("--tone").trim());
  expect(colors).not.toBe("");
});

test("D91: criação só com o nome e Início sem as frases retiradas", async ({ page }) => {
  await abrir(page, { motion: "reduced" });
  await entrarNoCraque(page);
  await expect(page.getByText("Talento aparece com mais frequência")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Nome", exact: true })).toBeVisible();
  await expect(page.getByText("Sobrenome", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Até 16 letras/)).toHaveCount(0);
});
