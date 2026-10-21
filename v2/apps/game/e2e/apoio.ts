import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { deflateRawSync } from "node:zlib";
import { readFileSync } from "node:fs";

export interface FixtureStep { id:number;kind:string;year:number;age:number;option:number;history:number[];match:boolean }
export const fixturePlans = (JSON.parse(readFileSync(new URL("./fixtures/momentos-m23.json",import.meta.url),"utf8")) as { plans:Record<string,FixtureStep[]> }).plans;

/**
 * O que toda jornada usa: abrir o jogo com preferências conhecidas, jogar um
 * turno, encerrar a carreira, medir se o laço cabe na tela e auditar a
 * acessibilidade com o axe.
 */

/**
 * As opções da decisão atual. Só `.option` não serve: o painel "Memória" do
 * Início usa o mesmo desenho de linha, e um teste apressado clicaria nele.
 */
export const OPCOES = ".season-decision-slide[data-active] .decision-options .option";

export interface Prefs {
  locale?: "pt" | "es" | "en";
  theme?: "dark" | "light";
  pace?: "intense" | "normal";
  difficulty?: "normal" | "hard";
  motion?: "full" | "reduced";
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
    motion: prefs.motion ?? "full",
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

/** Chega ao lance pelo primeiro ponto principal do ano e joga as escolhas intermediárias reais. */
export async function abrirMomento(page: Page, raw: Buffer, index: number, prefs: Prefs = {}): Promise<void> {
  const save = JSON.parse(raw.toString()) as {setup:{seed:string}};
  const plan=fixturePlans[save.setup.seed]!;
  let anchor = 0;
  const firstYears = new Set<number>();
  const path: { option: number; drama: boolean; match: boolean; id: number }[] = [];
  for (let i=0; i<=index; i++) {
    const decision = plan[i]!;
    if (!["match", "promise", "veteran"].includes(decision.kind) && !firstYears.has(decision.year)) { firstYears.add(decision.year); anchor=i; }
    path.push({ option: decision.option, drama: ["match", "promise", "veteran"].includes(decision.kind), match: decision.kind==="match", id: decision.id });
  }
  await abrir(page,prefs,`/#c=z${deflateRawSync(raw).toString("base64url")}`);
  await page.getByRole("link", {name:"Hipotético",exact:true}).click();
  await page.locator(`.what-if-chapter li[data-choice-index='${anchor}'] button`).click();
  await page.getByRole("button", {name:"Começar linha alternativa",exact:true}).click();
  for (let i=anchor; i<index; i++) {
    const step=path[i]!;
    await expect(page.locator(".season-decision-slide")).toHaveCount(1);
    await page.locator(OPCOES).nth(step.option).click();
    if(!step.drama)await page.getByRole("button",{name:"Confirmar escolha",exact:true}).click();
    if(step.match)await page.locator(".season-decision-slide[data-active] .match-continue").click();
    await expect(page.locator(".season-decision-slide[data-active] .decision")).not.toHaveAttribute("aria-labelledby",`decisao-${step.id}`);
  }
  await expect(page.locator(".season-decision-slide")).toHaveCount(1);
  await fecharAvisos(page);
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
    .locator(".season-decision-slide[data-active] .decision")
    .first()
    .getAttribute("aria-labelledby", { timeout: 1_000 })
    .catch(() => null);
}

/**
 * Um turno: marca a primeira opção que não aposenta e confirma. Partidas
 * revelam o lance na mesma tela (D74); o helper usa Continuar depois da
 * revelação, sem aguardar o avanço automático. Devolve falso se a
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
  // Na transição há dois cards no DOM; o que sai está inerte e não decide o fluxo.
  const immediate = await page.locator(".season-decision-slide[data-active] .drama-decision").count() > 0;
  const before = await decisionId(page);
  await options.nth(index).click();
  if (!immediate) await page.getByRole("button", { name: "Confirmar escolha" }).click();
  const continueMatch = page.locator(".season-decision-slide[data-active] .match-continue");
  if (immediate && await continueMatch.isVisible()) await continueMatch.click();
  await expect
    .poll(async () => ((await page.locator(".end-panel").count()) > 0 ? "fim" : await decisionId(page)), { timeout: 10_000 })
    .not.toBe(before);
  return true;
}

/** Fecha os avisos pelos controles reais antes de usar o menu que fica sob eles. */
async function fecharAvisos(page: Page): Promise<void> {
  const notices=page.locator(".toast:not([data-ending-style]) .toast-close");
  // Três é o limite visível, não o tamanho da fila: fechar uma conquista pode revelar outra.
  await expect(async () => {
    if (await notices.count()) await notices.first().click({ timeout: 1_000 });
    await expect(page.locator(".toast:not([data-ending-style])")).toHaveCount(0, { timeout: 100 });
  }).toPass({ timeout: 15_000, intervals: [100, 250, 500] });
}

/** O aviso offline pode chegar entre a checagem e o clique; repetir não fecha um menu já aberto. */
export async function abrirMenuDaCarreira(page: Page): Promise<void> {
  const menu = page.getByRole("button", { name: "Menu da carreira" });
  await expect(async () => {
    if (await menu.getAttribute("aria-expanded") !== "true") {
      await fecharAvisos(page);
      await menu.click({ timeout: 1_000 });
    }
    await expect(menu).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
  }).toPass({ timeout: 15_000, intervals: [100, 250, 500] });
}

/** Encerra a carreira pelo menu do placar e espera o resumo. */
export async function encerrar(page: Page): Promise<void> {
  for (const result of await page.locator(".result-msg").all()) {
    await expect(result).toHaveCSS("pointer-events", "none");
  }
  await abrirMenuDaCarreira(page);
  await page.getByRole("menuitem", { name: "Encerrar carreira" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Encerrar", exact: true }).click();
  await expect(page.locator(".summary")).toBeVisible();
}

/** Volta ao Início pelo menu do placar, confirmando a saída. */
export async function sairDaCarreira(page: Page): Promise<void> {
  await abrirMenuDaCarreira(page);
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
  const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).exclude(".toast-viewport");
  // Avisos também têm role=dialog. Mesmo na auditoria de uma folha, ficam
  // fora daqui; o teste próprio os verifica parados, sem o fade de saída.
  const result = await (only ? builder.include(only) : builder).analyze();
  const serious = result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
  const report = serious.map(
    (violation) => `${violation.id} (${violation.impact}): ${violation.help}\n    ${violation.nodes.slice(0, 4).map((node) => node.target.join(" ")).join("\n    ")}`,
  );
  expect(report, `acessibilidade em ${onde}`).toEqual([]);
}
