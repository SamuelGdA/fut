import { expect, test } from "@playwright/test";
import { abrir, encerrar, esperarQueCaiba, idade, jogarTurno, jogoRapido, OPCOES } from "./apoio";

/**
 * A jornada inteira de um jogador (GDD 40.2): do Início, pela identidade, até
 * o fim da carreira e o resumo, com o pôster e o "Jogar de novo". No celular,
 * o laço é medido a cada turno: cabe na tela, sem rolar (D23).
 */

test("do Início ao Resumo, montando o jogador", async ({ page }, info) => {
  const celular = info.project.name === "celular";
  await abrir(page, { pace: "normal" });
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();

  // Identidade: no celular em etapas, no desktop tudo de uma vez.
  await page.getByRole("button", { name: "Começar carreira" }).click();
  await page.getByLabel("Sobrenome").fill("Ribeiro");
  if (celular) await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("searchbox", { name: "Buscar país" }).fill("Portugal");
  await page.getByRole("option", { name: /Portugal/ }).click();
  if (celular) await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("radio", { name: "Meia ofensivo" }).click();
  await expect(page.getByRole("radio", { name: "Meia ofensivo" })).toHaveAttribute("aria-checked", "true");
  if (celular) await page.getByRole("button", { name: "Avançar" }).click();
  await page.getByRole("button", { name: "Começar carreira" }).click();

  // A carreira: o placar com o sobrenome, a primeira decisão é a da base.
  await expect(page.locator(".career-header")).toContainText("RIBEIRO");
  await expect(page.locator(OPCOES).first()).toBeVisible();
  if (celular) await esperarQueCaiba(page);

  // Joga até os 30 (ou até a carreira acabar sozinha) e encerra.
  for (let turn = 0; turn < 30 && (await idade(page)) < 30; turn += 1) {
    if (!(await jogarTurno(page))) break;
    if (celular) await esperarQueCaiba(page);
  }
  if ((await page.locator(OPCOES).count()) > 0) {
    await encerrar(page);
  } else {
    await page.getByRole("button", { name: "Ver resumo" }).click();
  }

  // O resumo: o sobrenome, o motivo do fim e os capítulos.
  await expect(page.getByRole("heading", { name: "RIBEIRO", level: 1 })).toBeVisible();
  for (const chapter of ["Biografia", "Números", "Linha do tempo", "Troféus", "Jornal", "Ribeiro hipotético"]) {
    await expect(page.getByRole("heading", { name: chapter, level: 2 })).toBeAttached();
  }

  // O pôster abre com a prévia e fecha.
  await page.getByRole("button", { name: "Pôster" }).click();
  await expect(page.getByRole("dialog", { name: "Pôster da carreira" })).toBeVisible();
  await expect(page.locator(".poster").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Pôster da carreira" })).toHaveCount(0);

  // Jogar de novo volta para a identidade com o rascunho intacto.
  await page.getByRole("button", { name: "Jogar de novo" }).click();
  await expect(page.getByLabel("Sobrenome")).toHaveValue("Ribeiro");
});

test("o link da carreira abre o resumo só de leitura, sem tocar no save de quem abre", async ({ page }) => {
  await abrir(page);
  await jogoRapido(page);
  for (let turn = 0; turn < 3; turn += 1) await jogarTurno(page);
  await encerrar(page);
  await page.getByRole("button", { name: "Copiar link" }).click();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain("#c=");

  // Outra pessoa, outro navegador: abre o link e vê o resumo, sem carreira dela mexida.
  const other = await page.context().browser()?.newContext({ viewport: page.viewportSize() ?? undefined });
  if (!other) throw new Error("sem navegador");
  const reader = await other.newPage();
  await reader.goto(link);
  await expect(reader.getByText("Carreira compartilhada")).toBeVisible();
  expect(await reader.evaluate(() => window.localStorage.getItem("craque.v2.save"))).toBeNull();
  await other.close();
});
