import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * O que toda jornada usa: abrir o jogo com preferências conhecidas, jogar um
 * turno, encerrar a carreira, medir se o laço cabe na tela e auditar a
 * acessibilidade com o axe.
 */

/**
 * As opções da decisão atual. Só `.option` não serve: o painel "Memória" do
 * Início usa o mesmo desenho de linha, e um teste apressado clicaria nele.
 */
export const OPCOES = ".decision-options .option";

export interface Prefs {
  locale?: "pt" | "es" | "en";
  theme?: "dark" | "light";
  pace?: "intense" | "normal";
  difficulty?: "normal" | "hard";
}

/**
 * Abre o jogo com as preferências dadas (som e vibração desligados). A
 * abertura é sempre o hub do Futeiros (D50). As preferências entram só na
 * primeira abertura da aba: recarregar no meio do teste mantém o que o jogo
 * gravou.
 */
export async function abrir(page: Page, prefs: Prefs = {}, path = "/"): Promise<void> {
  const state = {
    locale: prefs.locale ?? "pt",
    theme: prefs.theme ?? "light",
    volume: 0,
    muted: true,
    motion: "system",
    haptics: false,
    pace: prefs.pace ?? "intense",
    difficulty: prefs.difficulty ?? "normal",
  };
  await page.addInitScript((value) => {
    if (window.sessionStorage.getItem("craque-e2e")) return;
    window.sessionStorage.setItem("craque-e2e", "1");
    window.localStorage.setItem("craque.v2.prefs", JSON.stringify({ state: value, version: 1 }));
  }, state);
  await page.goto(path);
  // Espera a tela de verdade desenhar (o título dela), não só o `load` da página:
  // sob carga, um Início ainda carregando leria o que o teste gravar em seguida.
  await expect(page.locator("#conteudo h1").first()).toBeVisible();
}

/** O cartão de um dos dois jogos no hub. */
export const cartao = (page: Page, jogo: "craque" | "tecnico") => page.locator(`.hub-card[data-game="${jogo}"]`);

/** Do hub para o Início do Craque ("Jogar", ou "Início do Craque" com carreira salva). */
export async function entrarNoCraque(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  await cartao(page, "craque")
    .getByRole("button", { name: /^(Jogar|Início do Craque)$/ })
    .click();
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();
}

/** Abre o jogo e entra no Início do Craque. */
export async function abrirCraque(page: Page, prefs: Prefs = {}): Promise<void> {
  await abrir(page, prefs);
  await entrarNoCraque(page);
}

/** No hub, o cartão do Craque retoma a carreira salva ("Continuar carreira" ou "Ver o resumo"). */
export async function retomarCraque(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  await cartao(page, "craque")
    .getByRole("button", { name: /^(Continuar carreira|Ver o resumo)$/ })
    .click();
}

export async function jogoRapido(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Jogo rápido" }).click();
  await expect(page.locator(OPCOES).first()).toBeVisible();
}

/** Espera os números que contam (D43) chegarem ao valor final. */
export async function esperarNumeros(page: Page): Promise<void> {
  await expect(page.locator("[data-count='counting']")).toHaveCount(0);
}

/** A idade no placar da carreira. */
export async function idade(page: Page): Promise<number> {
  const text = await page.locator(".career-header").innerText();
  return Number(/(\d+) anos/.exec(text)?.[1] ?? 0);
}

/** O id da decisão na tela (`decisao-N`), ou `null` sem decisão. */
async function decisionId(page: Page): Promise<string | null> {
  return page
    .locator(".decision")
    .first()
    .getAttribute("aria-labelledby", { timeout: 1_000 })
    .catch(() => null);
}

/**
 * Um turno: marca a primeira opção que não aposenta e confirma. Sem janela de
 * revelação (D43): o lance aparece na própria tela e a próxima decisão já
 * vem. Espera a decisão trocar (ou a carreira acabar). Devolve falso se a
 * carreira já tinha acabado.
 */
export async function jogarTurno(page: Page): Promise<boolean> {
  const options = page.locator(OPCOES);
  // A próxima decisão pode estar chegando; carreira terminada não tem opção.
  await options
    .first()
    .waitFor({ timeout: 5_000 })
    .catch(() => undefined);
  const count = await options.count();
  if (count === 0) return false;
  let index = 0;
  for (let candidate = 0; candidate < count; candidate += 1) {
    const text = (await options.nth(candidate).innerText()).toLowerCase();
    if (!/pendurar|aposentar/.test(text)) {
      index = candidate;
      break;
    }
  }
  await options.nth(index).click();
  const before = await decisionId(page);
  await page.getByRole("button", { name: "Confirmar escolha" }).click();
  await expect
    .poll(async () => ((await page.locator(".end-panel").count()) > 0 ? "fim" : await decisionId(page)), { timeout: 10_000 })
    .not.toBe(before);
  return true;
}

/** Encerra a carreira pelo menu do placar e espera o resumo. */
export async function encerrar(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Menu da carreira" }).click();
  await page.getByRole("menuitem", { name: "Encerrar carreira" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Encerrar", exact: true }).click();
  await expect(page.locator(".summary")).toBeVisible();
}

/** Volta ao Início pelo menu do placar, confirmando a saída. */
export async function sairDaCarreira(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Menu da carreira" }).click();
  await page.getByRole("menuitem", { name: "Voltar ao início" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByRole("heading", { name: "CRAQUE", level: 1 })).toBeVisible();
}

/**
 * O laço cabe na tela (D23 e D43): a página não rola nem para baixo nem para o
 * lado, a carreira não esconde nada vazando por baixo do `overflow: hidden`, e
 * nem o lance nem o jornal passam da largura.
 */
export async function esperarQueCaiba(page: Page): Promise<void> {
  const over = await page.evaluate(() => {
    const root = document.documentElement;
    const hidden = [...document.querySelectorAll<HTMLElement>(".career, .career-header, .tabbar, .play, .news-bar, .decision-options")].map(
      (element) => element.scrollWidth - element.clientWidth,
    );
    return {
      vertical: Math.max(0, root.scrollHeight - window.innerHeight),
      horizontal: Math.max(0, root.scrollWidth - window.innerWidth, ...hidden),
    };
  });
  expect(over, "o laço tem de caber na tela").toEqual({ vertical: 0, horizontal: 0 });
}

/**
 * Auditoria do axe (WCAG 2.1 A e AA). Falha com violação séria ou crítica, e
 * lista cada uma com os elementos, para o conserto ser direto. Os avisos ficam
 * de fora da varredura geral (entram e saem sozinhos, e no meio do esmaecer o
 * contraste medido é o de um texto transparente); eles têm auditoria própria,
 * parados (`auditarAvisos`).
 */
export async function auditar(page: Page, onde: string, only?: string): Promise<void> {
  // Espera as animações finitas acabarem: no meio de um esmaecer, o axe mede o
  // contraste de um texto ainda transparente.
  await page
    .waitForFunction(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .every((animation) => animation.playState !== "running"),
      null,
      { timeout: 8_000 },
    )
    .catch(() => undefined);
  const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  const result = await (only ? builder.include(only) : builder.exclude(".toast-viewport")).analyze();
  const serious = result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  const report = serious.map(
    (violation) => `${violation.id} (${violation.impact}): ${violation.help}\n    ${violation.nodes.slice(0, 4).map((node) => node.target.join(" ")).join("\n    ")}`,
  );
  expect(report, `acessibilidade em ${onde}`).toEqual([]);
}
