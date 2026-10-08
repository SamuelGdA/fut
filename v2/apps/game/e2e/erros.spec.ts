import { expect, test } from "@playwright/test";
import { abrir, encerrar, jogarTurno, jogoRapido } from "./apoio";

/**
 * Resiliência (GDD 34.4 e 37): nenhum erro deixa o jogador numa tela branca.
 * O service worker fica de fora aqui, para os testes cortarem a rede de
 * arquivos específicos sem o cache responder no lugar.
 */

test.use({ serviceWorkers: "block" });

test("endereço que não existe: Bola fora, e a volta limpa o endereço", async ({ page }) => {
  await abrir(page, {}, "/vestiario/12");
  await expect(page.getByRole("heading", { name: "Bola fora" })).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao jogo" }).click();
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/");
});

test("save corrompido: o jogo avisa e abre o Início, com o rascunho intacto", async ({ page }) => {
  await abrir(page);
  await page.evaluate(() => {
    window.localStorage.setItem("craque.v2.save", "{quebrado");
    window.localStorage.setItem(
      "craque.v2.draft",
      JSON.stringify({ state: { surname: "Guardado", dreamNumber: null, foot: "right", nationality: null, position: null, avatar: null }, version: 1 }),
    );
  });
  await page.reload();
  await expect(page.getByText("O save não pôde ser aberto")).toBeVisible();
  await page.getByRole("button", { name: "Começar carreira" }).click();
  await expect(page.getByLabel("Sobrenome")).toHaveValue("Guardado");
});

test("tela que não baixa: o erro aparece dentro da casca, com recarregar e volta ao Início", async ({ page }) => {
  // As telas baixam em segundo plano logo depois da primeira pintura (D43): a
  // rede da tela do Hall cai antes de o jogo abrir, para nem o download
  // antecipado nem o clique a trazerem.
  await page.route(/\/assets\/HallScreen-[\w-]+\.js$/, (route) => route.abort());
  await abrir(page);
  await page.getByRole("button", { name: /Hall da Fama/ }).first().click();
  await expect(page.getByRole("heading", { name: "Faltou um pedaço do jogo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Recarregar" })).toBeVisible();
  // A casca continua de pé: a marca no topo e os ajustes.
  await expect(page.getByRole("banner")).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao início" }).click();
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();
});

test("tela que quebra ao desenhar: aviso na casca, carreira salva, e dá para voltar", async ({ page }) => {
  await abrir(page);
  await jogoRapido(page);
  await jogarTurno(page);
  await encerrar(page);
  // Um navegador que quebra no observador de rolagem do resumo, a partir de agora.
  await page.addInitScript(() => {
    window.IntersectionObserver = class {
      constructor() {
        throw new Error("observador quebrado de propósito");
      }
    } as unknown as typeof IntersectionObserver;
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Esta tela não abriu" })).toBeVisible();
  await expect(page.getByText("sua carreira continua salva")).toBeVisible();
  await expect(page.getByRole("button", { name: "Limpar dados e recarregar" })).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao início" }).click();
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("craque.v2.save"))).not.toBeNull();
});

test("páginas estáticas 404, 403, 500 e 503, no idioma salvo", async ({ page }) => {
  await abrir(page, { locale: "es" });
  const pages = [
    { path: "/404.html", title: "Balón afuera" },
    { path: "/403.html", title: "Fuera de juego" },
    { path: "/500.html", title: "Pegó en el palo" },
    { path: "/503.html", title: "Partido suspendido" },
  ];
  for (const item of pages) {
    await page.goto(item.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title);
    await expect(page.getByRole("link", { name: "Volver al juego" })).toHaveAttribute("href", "/");
  }
  // A 500 avisa que a carreira continua salva e oferece tentar de novo.
  await page.goto("/500.html");
  await expect(page.getByText("Tu carrera sigue guardada")).toBeVisible();
  await expect(page.getByRole("button", { name: "Intentar de nuevo" })).toBeVisible();
});

test("o jogo que não baixa nem começa: a abertura vira erro com recarregar", async ({ page }) => {
  await page.route(/\/assets\/index-[\w-]+\.js$/, (route) => route.abort());
  await page.goto("/");
  await expect(page.getByText("Abrindo o CRAQUE")).toBeVisible();
  await expect(page.getByText("Não deu para abrir o jogo.", { exact: false })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Recarregar" })).toBeVisible();
});
