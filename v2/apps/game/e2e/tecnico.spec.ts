import { expect, type Page, test } from "@playwright/test";
import { abrir, auditar, cartao } from "./apoio";

/**
 * O Técnico de ponta a ponta (GDD 42): do hub à identidade, às três
 * propostas, às ações com respostas, ao evento, à simulação (com a decisão no
 * meio do jogo, quando vier), aos resultados, à avaliação e ao legado. Sem
 * save (D51): recarregar encerra a carreira e volta ao hub, e o armazenamento
 * só guarda preferências, rascunhos e conquistas. A semente vem fixa pelo
 * `sessionStorage`, só nos testes.
 */

const SEMENTE = "e2e-tecnico-1";

async function comSemente(page: Page, seed = SEMENTE): Promise<void> {
  await page.addInitScript((value) => window.sessionStorage.setItem("futeiros.e2e.seed", value), seed);
}

interface Identidade {
  nome?: string;
  pais?: string;
  ritmo?: "Rápido" | "Lento";
}

/** Do hub até as três propostas iniciais. */
async function criarTecnico(page: Page, celular: boolean, { nome = "Moraes", pais = "Brasil", ritmo = "Rápido" }: Identidade = {}): Promise<void> {
  await cartao(page, "tecnico").getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Quem está no banco", level: 1 })).toBeVisible();
  await page.getByLabel("Nome do técnico").fill(nome);
  await page.getByRole("radio", { name: pais, exact: true }).click();
  await expect(page.getByRole("radio", { name: pais, exact: true })).toHaveAttribute("aria-checked", "true");
  if (celular) await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("radio", { name: ritmo, exact: true }).click();
  await expect(page.getByText("Recarregar ou fechar a página encerra a carreira")).toBeVisible();
  await page.getByRole("button", { name: "Começar carreira", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Escolha onde começar", level: 1 })).toBeVisible();
}

/** Assina a primeira proposta e espera a etapa. */
async function assinar(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Assinar" }).first().click();
  await expect(page.getByRole("heading", { name: "Ações", level: 2 })).toBeVisible();
}

const acao = (page: Page, nome: string) => page.locator(".tec-action").filter({ has: page.locator(".tec-action-name", { hasText: new RegExp(`^${nome}$`) }) });
/** A folha do processo (o aviso de "pronto para jogar sem internet" também é um diálogo). */
const folha = (page: Page) => page.locator(".sheet-popup");

/** Fecha o processo pelo "Concluir" (o que ficar sem resposta é recusado). */
async function concluir(page: Page): Promise<void> {
  await folha(page).getByRole("button", { name: "Concluir", exact: true }).click();
  await expect(folha(page)).toHaveCount(0);
}

/** A etapa cabe na tela: nem a página nem o palco rolam ou vazam para o lado. */
async function etapaCabe(page: Page): Promise<void> {
  const over = await page.evaluate(() => {
    const root = document.documentElement;
    const hidden = [...document.querySelectorAll<HTMLElement>(".career, .tabbar, .tec-center")].map((element) => element.scrollWidth - element.clientWidth);
    return {
      vertical: Math.max(0, root.scrollHeight - window.innerHeight),
      horizontal: Math.max(0, root.scrollWidth - window.innerWidth, ...hidden),
    };
  });
  expect(over, "a etapa tem de caber na tela").toEqual({ vertical: 0, horizontal: 0 });
}

/**
 * Do evento até os resultados: escolhe a primeira opção do evento (se houver),
 * simula e responde às decisões no meio do jogo até o fim do período.
 */
async function simularAteResultados(page: Page): Promise<void> {
  const evento = page.getByRole("group", { name: "O que fazer" });
  if (await evento.isVisible()) {
    await evento.getByRole("button").first().click();
    await expect(page.getByText("Resultado", { exact: false }).first()).toBeVisible();
  }
  await page.getByRole("button", { name: /^Simular (a temporada|o turno)$/ }).click();
  const resultados = page.getByRole("heading", { name: /^Fim d(a temporada|o 1º turno)$/ });
  for (let rodada = 0; rodada < 6; rodada += 1) {
    const decisao = page.getByRole("group", { name: "Sua decisão" });
    await expect(resultados.or(decisao)).toBeVisible({ timeout: 60_000 });
    if (await resultados.isVisible()) return;
    await auditar(page, "Decisão no jogo", ".tec-event");
    await decisao.getByRole("button").first().click();
  }
  await expect(resultados).toBeVisible({ timeout: 60_000 });
}

test("do hub ao legado: propostas, três ações, evento, simulação, avaliação e aposentadoria", async ({ page }, info) => {
  test.setTimeout(240_000);
  const celular = info.project.name === "celular";
  await comSemente(page);
  await abrir(page);

  // O cartão do Técnico avisa que não há save.
  await expect(cartao(page, "tecnico")).toContainText("Sem salvamento");
  await criarTecnico(page, celular);

  // Três propostas do Brasil; quase sempre da segunda divisão (95% cada).
  await expect(page.getByRole("button", { name: "Assinar" })).toHaveCount(3);
  await auditar(page, "Técnico, propostas");
  await assinar(page);
  await expect(page.getByText("3 ações disponíveis")).toBeVisible();
  if (celular) await etapaCabe(page);
  await auditar(page, "Técnico, etapa");

  // Treinar: escolhe um setor, confirma, e a vaga é gasta.
  await acao(page, "Treinar").click();
  await expect(folha(page)).toBeVisible();
  await expect(folha(page).getByText("Usa 1 de 3 ações")).toBeVisible();
  await folha(page).getByRole("radio", { name: /^Defesa/ }).click();
  await folha(page).getByRole("button", { name: "Confirmar", exact: true }).click();
  if (await folha(page).getByRole("button", { name: "Concluir", exact: true }).isVisible()) await concluir(page);
  await expect(page.getByText("2 ações disponíveis")).toBeVisible();

  // Contratar: até três alvos, cada um com a resposta do jogador e do clube.
  await acao(page, "Contratar").click();
  await expect(folha(page).getByRole("heading", { name: "Contratar" })).toBeVisible();
  await folha(page).getByRole("checkbox").first().click();
  await expect(folha(page).getByText("1 escolhido")).toBeVisible();
  await folha(page).getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(folha(page).getByText("Respostas", { exact: true })).toBeVisible();
  await auditar(page, "Técnico, respostas", "[role='dialog']");
  await concluir(page);
  await expect(page.getByText("1 ação disponível")).toBeVisible();

  // Desenvolver: marca um jogador.
  await acao(page, "Desenvolver").click();
  await folha(page).getByRole("checkbox", { disabled: false }).first().click();
  await folha(page).getByRole("button", { name: "Confirmar", exact: true }).click();
  if (await folha(page).getByRole("button", { name: "Concluir", exact: true }).isVisible()) await concluir(page);
  await expect(page.getByText("Sem ações nesta etapa")).toBeVisible();

  // A quarta ação não abre: as três da etapa já foram usadas.
  // O botão fica com aria-disabled, mas o toque explica o porquê.
  await acao(page, "Vender").click({ force: true });
  await expect(page.getByText("As três ações da etapa já foram usadas.")).toBeVisible();
  await expect(folha(page)).toHaveCount(0);

  // O elenco: nenhuma informação escondida (só OVR, palavras e faixas).
  await page.getByRole("tab", { name: "Elenco" }).click();
  await expect(page.getByRole("heading", { name: "Elenco", level: 2 })).toBeVisible();
  if (celular) await page.getByRole("tab", { name: "Etapa" }).click();

  // Evento e simulação até o fim da temporada (rápido: uma etapa por ano).
  await page.getByRole("button", { name: "Ir para o evento" }).click();
  await expect(page.getByText("Evento da etapa").first()).toBeVisible();
  if (celular) await etapaCabe(page);
  await simularAteResultados(page);
  await expect(page.getByRole("heading", { name: "Fim da temporada" })).toBeVisible();
  await expect(page.getByText("Dinheiro do período")).toBeVisible();
  await auditar(page, "Técnico, resultados");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  // Avaliação: objetivo, confiança e as propostas da próxima temporada.
  await expect(page.getByText("Avaliação da temporada")).toBeVisible();
  await expect(page.getByText("Confiança da diretoria", { exact: true })).toBeVisible();
  await auditar(page, "Técnico, avaliação");

  // Aposentar depois da primeira temporada: o legado, sem save.
  await page.getByRole("button", { name: "Encerrar a carreira" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Encerrar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A carreira de Moraes", level: 1 })).toBeVisible();
  await expect(page.getByText("Este legado não é salvo")).toBeVisible();
  await auditar(page, "Técnico, legado");

  // Nada da carreira no armazenamento: só preferências, rascunhos e conquistas.
  const stored = await page.evaluate(() =>
    [window.localStorage, window.sessionStorage].flatMap((area) => Object.keys(area).map((key) => ({ key, value: area.getItem(key) ?? "" }))),
  );
  const allowed = /^(craque\.v2\.(prefs|draft|tecnico\.draft|hall|unlocks|progress|challenge|achievements)[\w.]*|craque-e2e|futeiros\.e2e\.seed)$/;
  expect(stored.map((row) => row.key).filter((key) => !allowed.test(key))).toEqual([]);
  for (const row of stored) {
    expect(row.value, row.key).not.toContain('"fixtures"');
    expect(row.value, row.key).not.toContain('"phase"');
  }

  // A volta ao hub mostra o legado em memória.
  await page.getByRole("button", { name: "Voltar ao início" }).click();
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  await expect(cartao(page, "tecnico")).toContainText("Legado na tela");
});

test("recarregar encerra a carreira do Técnico e abre o hub", async ({ page }, info) => {
  const celular = info.project.name === "celular";
  await comSemente(page, "e2e-tecnico-2");
  await abrir(page);
  await criarTecnico(page, celular, { nome: "Lacerda" });
  await assinar(page);

  // O navegador pergunta antes de recarregar (beforeunload); aceitando, a carreira acaba.
  const dialogs: string[] = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.type());
    void dialog.accept();
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  expect(dialogs).toContain("beforeunload");
  await expect(cartao(page, "tecnico")).not.toContainText("Em andamento");
  await expect(cartao(page, "tecnico")).toContainText("Recarregar a página encerra a carreira do Técnico.");
  // O rascunho da identidade continua (é preferência, não carreira).
  await cartao(page, "tecnico").getByRole("button", { name: "Jogar", exact: true }).click();
  await expect(page.getByLabel("Nome do técnico")).toHaveValue("Lacerda");
});

test("sair do Técnico pede confirmação e a carreira segue em memória até recarregar", async ({ page }, info) => {
  const celular = info.project.name === "celular";
  await comSemente(page, "e2e-tecnico-3");
  await abrir(page);
  await criarTecnico(page, celular, { nome: "Teixeira", pais: "Argentina" });
  await assinar(page);
  const header = (await page.locator(".career-header").textContent()) ?? "";

  // A marca no topo leva ao hub, mas pergunta antes.
  await page.locator(".topbar").getByRole("button", { name: /Futeiros/ }).click();
  await expect(page.getByRole("alertdialog").or(page.getByRole("dialog"))).toContainText("Sair do Técnico?");
  await page.getByRole("button", { name: "Ficar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ações", level: 2 })).toBeVisible();

  await page.locator(".topbar").getByRole("button", { name: /Futeiros/ }).click();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  await expect(cartao(page, "tecnico")).toContainText("Em andamento nesta aba");

  // Voltar à carreira: a mesma etapa, o mesmo placar.
  await cartao(page, "tecnico").getByRole("button", { name: "Voltar à carreira" }).click();
  await expect(page.getByRole("heading", { name: "Ações", level: 2 })).toBeVisible();
  expect((await page.locator(".career-header").textContent()) ?? "").toBe(header);
});

test("ritmo lento: duas etapas por temporada, com ações renovadas no 2º turno", async ({ page }, info) => {
  test.setTimeout(180_000);
  const celular = info.project.name === "celular";
  await comSemente(page, "e2e-tecnico-4");
  await abrir(page);
  await criarTecnico(page, celular, { nome: "Paiva", ritmo: "Lento" });
  await assinar(page);

  // Seguir com ações sobrando pede confirmação.
  await page.getByRole("button", { name: "Ir para o evento" }).click();
  await expect(page.getByText("Ainda há ações sobrando. Seguir mesmo assim?")).toBeVisible();
  await page.getByRole("button", { name: "Seguir", exact: true }).click();
  await simularAteResultados(page);
  await expect(page.getByRole("heading", { name: "Fim do 1º turno" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  // O 2º turno: outra etapa, com as três ações de volta.
  await expect(page.getByRole("heading", { name: "Ações", level: 2 })).toBeVisible();
  await expect(page.getByText("3 ações disponíveis")).toBeVisible();
  await expect(page.locator(".career-header")).toContainText("2º turno");
});

test("a etapa cabe numa tela de 360 × 640", async ({ page }, info) => {
  test.skip(info.project.name !== "celular", "medida do celular pequeno");
  await page.setViewportSize({ width: 360, height: 640 });
  await comSemente(page, "e2e-tecnico-5");
  await abrir(page);
  await criarTecnico(page, true, { nome: "Rocha" });
  await assinar(page);
  await etapaCabe(page);
  await page.getByRole("button", { name: "Ir para o evento" }).click();
  await page.getByRole("button", { name: "Seguir", exact: true }).click();
  await expect(page.getByText("Evento da etapa").first()).toBeVisible();
  await etapaCabe(page);
});
