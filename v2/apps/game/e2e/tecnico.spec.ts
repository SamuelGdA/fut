import { expect, type Page, test } from "@playwright/test";
import { abrir, auditar, cartao } from "./apoio";

/**
 * O Técnico de ponta a ponta (GDD 42): do hub à identidade, às três
 * propostas, às ações com respostas, ao evento, à simulação (com a decisão no
 * meio do jogo, quando vier), aos resultados, à avaliação e ao legado. Inclui
 * a retomada do último Técnico pelo diário de comandos (D61). O legado
 * encerrado continua apenas nesta sessão. A semente vem fixa pelo
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
  await expect(page.getByText("A última carreira em andamento fica neste aparelho. Você pode continuar pelo hub até encerrá-la.")).toBeVisible();
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

/** Fecha e preserva a negociação até o fim desta etapa. */
async function continuarResultados(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  if (await page.getByRole("heading", { name: "O mercado bateu à porta" }).isVisible()) {
    await expect(page.getByText("Propostas espontâneas. Aceitar ou recusar não gasta ação.")).toBeVisible();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
  }
}
/** Fecha o processo pelo "Concluir". */
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

/** Todas as alternativas cabem, inclusive a de descrição mais longa. */
async function decisaoCabe(page: Page): Promise<void> {
  const alternatives = page.locator(".tec-decision-option");
  for (let index = 0; index < await alternatives.count(); index += 1) {
    await alternatives.nth(index).click();
    await expect(page.getByRole("button", { name: "Confirmar decisão" })).toBeInViewport();
    await expect.poll(() => page.locator(".tec-event, .tec-match, .tec-event > .tec-card").evaluateAll((nodes) => nodes.every((node) => node.scrollHeight <= node.clientHeight + 1))).toBe(true);
    await etapaCabe(page);
  }
  await alternatives.first().click();
}

/**
 * Do evento até os resultados: escolhe a primeira opção do evento (se houver),
 * simula e responde às decisões no meio do jogo até o fim do período.
 */
async function simularAteResultados(page: Page): Promise<void> {
  const evento = page.getByRole("group", { name: "O que fazer" });
  if (await evento.isVisible()) {
    await decisaoCabe(page);
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: test.info().outputPath("decisao-vestiario.png") });
    await evento.getByRole("button").first().click();
    await expect(page.getByText("Resultado", { exact: true })).toBeVisible();
  }
  const simulate = page.getByRole("button", { name: /^Simular (a temporada|o turno)$/ });
  await expect(simulate.or(page.getByRole("group", { name: "Sua decisão" })).or(page.getByRole("heading", { name: /^Fim d(a temporada|o 1º turno)$/ }))).toBeVisible({ timeout: 60_000 });
  if (await simulate.isVisible()) await simulate.click();
  const resultados = page.getByRole("heading", { name: /^Fim d(a temporada|o 1º turno)$/ });
  let decidedMatch = false;
  for (let rodada = 0; rodada < 6; rodada += 1) {
    const decisao = page.getByRole("group", { name: "Sua decisão" });
    await expect(resultados.or(decisao)).toBeVisible({ timeout: 60_000 });
    if (await resultados.isVisible()) {
      if (decidedMatch) {
        await expect(page.locator(".tec-resolution")).toContainText("Sua decisão em campo");
        await expect(page.locator(".tec-resolution")).toContainText(/\d+ × \d+/);
      }
      return;
    }
    await auditar(page, "Decisão no jogo", ".tec-event");
    await expect(page.locator(".tec-odds")).toHaveCount(0);
    await decisaoCabe(page);
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: test.info().outputPath("decisao-partida.png") });
    await decisao.getByRole("button").first().click();
    // A resolução é assíncrona. A decisão anterior ainda fica visível durante
    // o trabalho; esperar sua saída evita auditar a tela que já está saindo.
    await expect(decisao).toBeHidden({ timeout: 60_000 });
    decidedMatch = true;
  }
  await expect(resultados).toBeVisible({ timeout: 60_000 });
}

test("do hub ao legado: propostas, três ações, evento, simulação, avaliação e aposentadoria", async ({ page }, info) => {
  test.setTimeout(240_000);
  const celular = info.project.name === "celular";
  await comSemente(page);
  await abrir(page);

  // O cartão do Técnico avisa que não há save.
  await expect(cartao(page, "tecnico")).toContainText("A última carreira");
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
  await expect(page.locator(".tec-event")).toBeVisible({ timeout: 60_000 });
  if (celular) await etapaCabe(page);
  await simularAteResultados(page);
  await expect(page.getByRole("heading", { name: "Fim da temporada" })).toBeVisible();
  await expect(page.getByText("Dinheiro do período")).toBeVisible();
  await expect(page.locator(".tec-campaign .eyebrow")).toHaveText("Brasileirão Série B");
  await auditar(page, "Técnico, resultados");
  await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath("relatorio.png") });
  const revelation = page.locator(".tec-report-block").filter({ has: page.locator("summary", { hasText: "Revelações" }) });
  if (await revelation.count()) {
    await revelation.locator("summary").click();
    await revelation.scrollIntoViewIfNeeded();
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath("revelacoes.png") });
  }
  await continuarResultados(page);

  // Avaliação: objetivo, confiança e as propostas da próxima temporada.
  await expect(page.getByText("Avaliação da temporada")).toBeVisible();
  await expect(page.getByText("Confiança da diretoria", { exact: true })).toBeVisible();
  await auditar(page, "Técnico, avaliação");

  // Aposentar depois da primeira temporada: o legado, sem save.
  await page.getByRole("button", { name: "Encerrar a carreira" }).click();
  await page.locator(".dialog-popup").getByRole("button", { name: "Encerrar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Moraes", level: 1 })).toBeVisible();
  await expect(page.getByText("Este legado não é salvo")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Números", exact: true })).toBeVisible();
  for (const name of ["Troféus e prêmios", "Jogadores marcantes", "Linha do tempo", "Números"]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  }
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

test("recarregar retoma a última carreira do Técnico pelo diário de comandos", async ({ page }, info) => {
  await comSemente(page, "e2e-tecnico-2"); await abrir(page);
  await criarTecnico(page, info.project.name === "celular", { nome: "Lacerda" }); await assinar(page);
  const header = await page.locator(".career-header").textContent();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("futeiros.tecnico.save") ?? "{}").commands.length)).toBe(1);
  const dialogs: string[] = []; page.on("dialog", dialog => { dialogs.push(dialog.type()); void dialog.accept(); });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  await cartao(page, "tecnico").getByRole("button", { name: "Voltar à carreira" }).click();
  await expect(page.getByRole("heading", { name: "Ações", level: 2 })).toBeVisible();
  expect(await page.locator(".career-header").textContent()).toBe(header);
  expect(dialogs).not.toContain("beforeunload");
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
  await expect(page.getByRole("alertdialog", { name: "Sair do Técnico?", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ficar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Ações", level: 2 })).toBeVisible();

  await page.locator(".topbar").getByRole("button", { name: /Futeiros/ }).click();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Futeiros", level: 1 })).toBeVisible();
  await expect(cartao(page, "tecnico")).toContainText("Em andamento");

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
  await continuarResultados(page);

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
  await expect(page.locator(".tec-event")).toBeVisible({ timeout: 60_000 });
  await etapaCabe(page);
});

for (const theme of ["light", "dark"] as const) {
  test(`decisão de partida sem rolagem, ${theme}`, async ({ page }, info) => {
    const mobile = info.project.name === "celular";
    if (mobile) await page.setViewportSize({ width: 360, height: 640 });
    await comSemente(page, "teste-pausa-5");
    await abrir(page, { theme });
    await criarTecnico(page, mobile);
    await assinar(page);
    await page.getByRole("button", { name: "Ir para o evento" }).click();
    await page.getByRole("button", { name: "Seguir", exact: true }).click();
    await expect(page.getByRole("group", { name: "Sua decisão" })).toBeVisible({ timeout: 60_000 });
    await decisaoCabe(page);
    await auditar(page, "Decisão em campo", ".tec-event");
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath(`partida-${theme}.png`) });
    await page.getByRole("radio").first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".tec-decision-option").nth(1)).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Confirmar decisão" }).click();
    await expect(page.getByRole("heading", { name: "Fim da temporada" })).toBeVisible({ timeout: 60_000 });
    await expect(page.locator(".tec-resolution")).toContainText("Sua decisão em campo");
  });

  test(`central do Técnico: ficha na tática, finanças e resolução, ${theme}`, async ({ page }, info) => {
    const mobile = info.project.name === "celular";
    if (mobile) await page.setViewportSize({ width: 360, height: 640 });
    await comSemente(page, "e2e-tecnico-d59");
    await abrir(page, { theme });
    await criarTecnico(page, mobile);
    await assinar(page);
    await etapaCabe(page);
    // Confere também o conteúdo, pois overflow:hidden pode esconder uma ação.
    await expect(acao(page, "Pedir verba")).toBeInViewport();
    await expect(page.getByRole("button", { name: "Ir para o evento" })).toBeInViewport();
    await expect.poll(() => page.getByRole("button", { name: "Ir para o evento" }).evaluate((button) => {
      const box = button.getBoundingClientRect();
      const bar = document.querySelector(".tabbar")?.getBoundingClientRect();
      return box.bottom <= (bar?.top ?? window.innerHeight) && box.top >= 0;
    })).toBe(true);
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath(`central-${theme}.png`) });

    await page.getByRole("tab", { name: "Time", exact: true }).click();
    const before = await page.locator(".tec-pitch").innerText();
    const inspect = page.locator(".tec-slot-btn").first();
    if (mobile) await inspect.click();
    else await inspect.hover();
    const card = mobile ? folha(page) : page.locator(".tec-player-peek");
    await expect(card).toBeVisible();
    await expect(card).toContainText("OVR");
    await expect(card).toContainText("Salário");
    await expect(card).toContainText("Na temporada");
    await auditar(page, "Consulta na tática", mobile ? ".sheet-popup" : ".tec-player-peek");
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath(`ficha-${theme}.png`) });
    await page.keyboard.press("Escape");
    await expect(card).not.toBeVisible();
    expect(await page.locator(".tec-pitch").innerText()).toBe(before);
    if (mobile) await page.getByRole("tab", { name: "Etapa", exact: true }).click();

    await acao(page, "Contratar").click();
    await expect(folha(page).getByRole("meter", { name: "Verba para contratações", exact: true })).toBeVisible();
    if (mobile) {
      // Nomes longos têm a primeira linha; números e chance vêm abaixo.
      const rows = folha(page).locator(".tec-player");
      expect(await rows.evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1 && node.children[2]!.clientWidth >= 150))).toBe(true);
    }
    // A lista agora ordena em cabeçalhos. Os alvos mais caros testam o
    // excesso real do lote, independentemente de quem lidera por OVR.
    await folha(page).getByRole("button", { name: "Valor", exact: true }).click();
    await folha(page).getByRole("checkbox").first().click();
    await expect(folha(page).locator(".tec-finance-track [data-part='1']").first()).toBeVisible();
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath(`mercado-${theme}.png`) });
    await folha(page).getByRole("checkbox").nth(1).click();
    await expect(folha(page).locator(".tec-finance-meter[data-over]")).toBeVisible();
    await expect(folha(page)).toContainText("acima do limite");
    await expect(folha(page).getByRole("meter", { name: "Verba para contratações", exact: true })).toBeInViewport();
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath(`excedente-${theme}.png`) });
    await folha(page).getByRole("button", { name: "Fechar", exact: true }).click();

    await acao(page, "Vestiário").click();
    for (let index = 0; index < 3; index += 1) await folha(page).getByRole("checkbox").nth(index).click();
    await folha(page).getByRole("button", { name: "Confirmar", exact: true }).click();
    const options = folha(page).locator(".tec-decision-option");
    await expect(options.first()).toBeVisible();
    for (let index = 0; index < await options.count(); index += 1) {
      await options.nth(index).click();
      await expect.poll(() => folha(page).locator(".tec-response-body").evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
    }
    await options.first().click();
    await expect(folha(page).getByRole("button", { name: "Confirmar decisão" })).toBeInViewport();
    await folha(page).getByRole("button", { name: "Confirmar decisão" }).click();
    await expect(folha(page).locator(".tec-resolution")).toBeVisible();
    await auditar(page, "Resultado de vestiário", ".sheet-popup");
    await page.screenshot({ style: ".toast-viewport { display: none !important; }", path: info.outputPath(`resolucao-${theme}.png`) });
    await concluir(page);
  });
}

test("a busca de contratação sobrevive a outra ação e guarda respostas na etapa", async ({ page }, info) => {
  await comSemente(page, "e2e-tecnico-d63-market"); await abrir(page);
  await criarTecnico(page, info.project.name === "celular"); await assinar(page);
  await acao(page, "Contratar").click();
  const candidate = folha(page).getByRole("checkbox").first();
  await candidate.click();
  const name = await candidate.locator(".font-semibold").first().innerText();
  await folha(page).getByRole("button", { name: "Fechar", exact: true }).click();
  await acao(page, "Treinar").click();
  await folha(page).getByRole("radio", { name: /^Defesa/ }).click();
  await folha(page).getByRole("button", { name: "Confirmar", exact: true }).click();
  if (await folha(page).getByRole("button", { name: "Concluir", exact: true }).isVisible()) await concluir(page);
  await acao(page, "Contratar").click();
  await expect(folha(page).getByRole("checkbox", { checked: true })).toContainText(name);
  await expect(folha(page).getByText("1 escolhido")).toBeVisible();
  await folha(page).getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(folha(page).getByText("Respostas", { exact: true })).toBeVisible();
  const response = await folha(page).locator(".tec-response-body").innerText();
  await concluir(page);
  await acao(page, "Contratar").click();
  await expect(folha(page).getByText("Respostas", { exact: true })).toBeVisible();
  await expect(folha(page).locator(".tec-response-body")).toHaveText(response, { useInnerText: true });
  await expect(folha(page).getByRole("button", { name: "Nova busca · 1 ação" })).toBeEnabled();
  await folha(page).getByRole("button", { name: "Nova busca · 1 ação" }).click();
  await expect(folha(page).getByRole("checkbox", { checked: true })).toHaveCount(0);
  await expect(folha(page).getByRole("button", { name: "Confirmar", exact: true })).toBeDisabled();
  await folha(page).getByRole("button", { name: "Fechar", exact: true }).click();
  await expect(page.getByText("1 ação disponível")).toBeVisible();
});

for (const touch of [false, true]) {
  test(`troca por arrasto ${touch ? "com toque" : "com mouse"}, sem gastar ação`, async ({ page }, info) => {
    test.skip(touch !== (info.project.name === "celular"));
    if (touch) await page.setViewportSize({ width: 360, height: 640 });
    await comSemente(page, "e2e-tecnico-d60-drag");
    await abrir(page);
    await criarTecnico(page, touch);
    await assinar(page);
    await page.getByRole("tab", { name: "Time", exact: true }).click();
    const first = page.locator("[data-lineup-slot='0']");
    const second = page.locator("[data-lineup-slot='1']");
    await first.scrollIntoViewIfNeeded();
    const a = await first.locator(".tec-slot-name").innerText();
    const b = await second.locator(".tec-slot-name").innerText();
    const grip = await first.locator(".tec-slot-btn").boundingBox();
    const target = await second.boundingBox();
    if (!grip || !target) throw new Error("vagas fora da tela");
    if (touch) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: grip.x + grip.width / 2, y: grip.y + grip.height / 2 }] });
      for (let step = 1; step <= 12; step += 1) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: grip.x + grip.width / 2 + (target.x + target.width / 2 - grip.x - grip.width / 2) * step / 12, y: grip.y + grip.height / 2 + (target.y + target.height / 2 - grip.y - grip.height / 2) * step / 12 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await cdp.detach();
    } else {
      await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
      await page.mouse.down();
      await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
      await page.mouse.up();
    }
    await expect(first.locator(".tec-slot-name")).toHaveText(b);
    await expect(second.locator(".tec-slot-name")).toHaveText(a);
    if (!touch) {
      // A carta inteira e a linha do banco aceitam o mesmo gesto do mouse.
      await first.dragTo(second);
      await expect(first.locator(".tec-slot-name")).toHaveText(a);
      await expect(second.locator(".tec-slot-name")).toHaveText(b);
      // Capturar o ponteiro não pode roubar o clique normal da consulta.
      await page.mouse.move(20, 170); await page.keyboard.press("Escape");
      await first.locator(".tec-slot-btn").click();
      expect(await first.locator(".tec-slot-btn").getAttribute("aria-expanded")).toBe("true");
      const reserve = page.locator(".tec-reserve-row[draggable='true']").first();
      const reserveName = await reserve.locator(".truncate.font-semibold").innerText();
      await reserve.dragTo(first);
      await expect(first.locator(".tec-slot-btn")).toHaveAttribute("aria-label", new RegExp(reserveName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      const reverse = page.locator(".tec-reserve-row[draggable='true']").first();
      const reverseName = await reverse.locator(".truncate.font-semibold").innerText();
      await first.dragTo(reverse);
      await expect(first.locator(".tec-slot-btn")).toHaveAttribute("aria-label", new RegExp(reverseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    } else {
      // Leva um reserva ao campo mesmo com o banco mais abaixo no painel.
      const reserve = page.locator(".tec-reserve-row[draggable='true']").first();
      const reserveName = await reserve.locator(".truncate.font-semibold").innerText();
      await reserve.scrollIntoViewIfNeeded();
      const panel = page.locator(".scroll-panel:visible").first();
      const scrollBefore = await panel.evaluate((node) => node.scrollTop);
      const box = await panel.boundingBox();
      const reserveGrip = await reserve.locator(".tec-drag-grip").boundingBox();
      if (!box || !reserveGrip) throw new Error("banco fora da tela");
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: reserveGrip.x + reserveGrip.width / 2, y: reserveGrip.y + reserveGrip.height / 2 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + box.width / 2, y: box.y + 6 }] });
      await expect.poll(() => panel.evaluate((node) => node.scrollTop)).toBeLessThan(scrollBefore);
      await expect.poll(async () => {
        const slot = await first.boundingBox();
        if (!slot) return false;
        const center = slot.y + slot.height / 2;
        if (center < box.y + 48 || center > box.y + box.height - 48) {
          // Se a máquina levou mais tempo entre consultas, corrigir o sentido
          // também evita passar pela vaga e continuar rolando para sempre.
          await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + box.width / 2, y: center < box.y + 48 ? box.y + 6 : box.y + box.height - 6 }] });
          return false;
        }
        // Mover para a vaga interrompe a rolagem; o teste não continua segurando a borda.
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: slot.x + slot.width / 2, y: slot.y + slot.height / 2 }] });
        return await first.getAttribute("data-drop-target") === "true";
      }, { intervals: [25, 50, 100] }).toBe(true);
      const vacancy = await first.boundingBox();
      if (!vacancy) throw new Error("vaga fora da tela");
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: vacancy.x + vacancy.width / 2, y: vacancy.y + vacancy.height / 2 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await cdp.detach();
      await expect(first.locator(".tec-slot-btn")).toHaveAttribute("aria-label", new RegExp(reserveName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      // Também levar um titular ao banco troca os dois jogadores, com rolagem para baixo.
      const reverse = page.locator(".tec-reserve-row[draggable='true']").first();
      const reverseName = await reverse.locator(".truncate.font-semibold").innerText();
      const sourceGrip = await first.locator(".tec-slot-btn").boundingBox();
      if (!sourceGrip) throw new Error("titular fora da tela");
      const reverseCdp = await page.context().newCDPSession(page);
      await reverseCdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: sourceGrip.x + sourceGrip.width / 2, y: sourceGrip.y + sourceGrip.height / 2 }] });
      await reverseCdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height - 6 }] });
      await expect.poll(async () => {
        const target = await reverse.boundingBox();
        if (!target) return false;
        const center = target.y + target.height / 2;
        if (center < box.y + 48 || center > box.y + box.height - 48) {
          await reverseCdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box.x + box.width / 2, y: center < box.y + 48 ? box.y + 6 : box.y + box.height - 6 }] });
          return false;
        }
        await reverseCdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: target.x + target.width / 2, y: target.y + target.height / 2 }] });
        return await reverse.getAttribute("data-drop-target") === "true";
      }, { intervals: [25, 50, 100] }).toBe(true);
      await reverseCdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await reverseCdp.detach();
      await expect(first.locator(".tec-slot-btn")).toHaveAttribute("aria-label", new RegExp(reverseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    if (touch) await page.getByRole("tab", { name: "Etapa", exact: true }).click();
    await expect(page.getByText("3 ações disponíveis")).toBeVisible();
  });
}


test("guia, oito formações e promoção da base abrem a ficha correta", async ({ page }, info) => {
  const mobile = info.project.name === "celular";
  if (mobile) await page.setViewportSize({ width: 360, height: 640 });
  await comSemente(page, "e2e-tecnico-d61-youth"); await abrir(page);
  await criarTecnico(page, mobile); await assinar(page);
  await expect(page.getByRole("button", { name: "Controles de teste" })).toHaveCount(0);
  await page.getByRole("button", { name: "Guia do Técnico" }).click();
  await folha(page).getByRole("radio", { name: "Elenco", exact: true }).click();
  await expect(folha(page).locator(".tec-guide-traits article")).toHaveCount(9);
  await auditar(page, "Guia do Técnico", ".sheet-popup");
  await folha(page).getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByRole("tab", { name: "Time", exact: true }).click();
  await expect(page.locator(".tec-formation")).toHaveText(["3-4-3", "3-5-2", "4-4-2", "4-3-3", "4-2-3-1", "4-1-4-1", "5-3-2", "5-4-1"]);
  for (const name of ["3-4-3", "5-4-1", "4-2-3-1"]) { await page.getByRole("radio", { name, exact: true }).click(); await expect(page.locator("[data-lineup-slot]")).toHaveCount(11); }
  if (mobile) await page.getByRole("tab", { name: "Etapa", exact: true }).click();
  await acao(page, "Base").click();
  const candidate = folha(page).getByRole("radio", { disabled: false }).first();
  await expect(folha(page).locator(".tec-trait-star")).toHaveCount(0);
  const name = await candidate.locator(".font-semibold").first().innerText();
  expect(name.trim().split(" ").length).toBeGreaterThan(1);
  await candidate.click(); await folha(page).getByRole("button", { name: "Confirmar", exact: true }).click();
  const inspection = mobile ? folha(page) : page.locator(".tec-player-peek");
  await expect(inspection.getByRole("heading", { name, exact: true })).toBeVisible();
  await expect(inspection).toContainText("Na temporada");
  if (mobile) await inspection.getByRole("button", { name: "Fechar", exact: true }).click();
  else await page.keyboard.press("Escape");
  await expect(page.getByRole("tab", { name: "Time", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Time", level: 2 })).toBeVisible();
});


test("o último Técnico retoma formação e seleção aberta depois de recarregar", async ({ page }, info) => {
  const mobile = info.project.name === "celular";
  await comSemente(page, "e2e-tecnico-d61-resume"); await abrir(page); await criarTecnico(page, mobile); await assinar(page);
  await page.getByRole("tab", { name: "Time", exact: true }).click();
  await page.getByRole("radio", { name: "3-4-3", exact: true }).click();
  if (mobile) await page.getByRole("tab", { name: "Etapa", exact: true }).click();
  await acao(page, "Base").click();
  const name = await folha(page).getByRole("radio", { disabled: false }).first().locator(".font-semibold").first().innerText();
  const record = await page.evaluate(() => localStorage.getItem("futeiros.tecnico.save"));
  expect(record).not.toBeNull();
  await page.reload(); await expect(page.getByRole("heading", { name: "Futeiros", exact: true })).toBeVisible();
  await cartao(page, "tecnico").getByRole("button", { name: "Voltar à carreira", exact: true }).click();
  await expect(folha(page).getByRole("radio", { disabled: false }).first()).toContainText(name);
  expect(await page.evaluate(() => localStorage.getItem("futeiros.tecnico.save"))).toBe(record);
  await folha(page).getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByRole("tab", { name: "Time", exact: true }).click();
  await expect(page.getByRole("radio", { name: "3-4-3", exact: true })).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("[data-lineup-slot]")).toHaveCount(11);
});
for (const theme of ["light", "dark"] as const) {
  test(`D66: filtros de OVR e ficha estatística, ${theme}`, async ({ page }, info) => {
    test.setTimeout(180_000);
    const mobile=info.project.name==="celular";
    if(mobile)await page.setViewportSize({width:360,height:640});
    await comSemente(page,"e2e-d66-stats");
    await abrir(page,{theme});
    await criarTecnico(page,mobile);
    await assinar(page);
    await acao(page,"Contratar").click();
    await folha(page).getByRole("button",{name:"OVR máximo",exact:true}).click();
    await expect(page.getByRole("spinbutton",{name:"OVR mínimo",exact:true})).toHaveValue("");
    await expect(page.getByRole("spinbutton",{name:"OVR máximo",exact:true})).toHaveValue("");
    await page.getByRole("spinbutton",{name:"OVR mínimo",exact:true}).fill("80");
    await page.getByRole("spinbutton",{name:"OVR máximo",exact:true}).fill("82");
    await page.keyboard.press("Escape");
    await folha(page).getByRole("button",{name:"Só o que cabe na verba",exact:true}).click();
    await folha(page).getByRole("button",{name:"Mostrar quase impossíveis",exact:true}).click();
    await expect(folha(page).locator(".tec-pick-list .tec-ovr").first()).toBeVisible();
    const overalls=await folha(page).locator(".tec-pick-list .tec-ovr").allTextContents();
    expect(overalls.every(text=>parseInt(text)>=80 && parseInt(text)<=82)).toBe(true);
    await folha(page).getByRole("button",{name:"Faixa de idade",exact:true}).click();
    await expect(page.getByRole("spinbutton",{name:"Idade mínima",exact:true})).toHaveValue("");
    await expect(page.getByRole("spinbutton",{name:"Idade máxima",exact:true})).toHaveValue("");
    await page.getByRole("spinbutton",{name:"Idade mínima",exact:true}).fill("25");
    await page.getByRole("spinbutton",{name:"Idade máxima",exact:true}).fill("29");
    await page.keyboard.press("Escape");
    await expect(folha(page).locator(".tec-pick-list .tec-player-age").first()).toBeVisible();
    expect((await folha(page).locator(".tec-pick-list .tec-player-age").allTextContents()).every(text=>parseInt(text)>=25 && parseInt(text)<=29)).toBe(true);
    await folha(page).locator('.tec-column-filter[aria-label="Posição"]').click();
    await page.getByRole("button",{name:"GOL",exact:true}).click();
    await expect(folha(page).locator(".tec-pick-list .tec-pos").first()).toBeVisible();
    expect((await folha(page).locator(".tec-pick-list .tec-pos").allTextContents()).every(text=>text==="GOL")).toBe(true);
    await auditar(page,"Contratar, faixa OVR e posição");
    const overflow=await folha(page).evaluate(element=>element.scrollWidth-element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await folha(page).getByRole("button",{name:"Fechar",exact:true}).click();
    await page.getByRole("button",{name:"Ir para o evento",exact:true}).click();
    await page.getByRole("alertdialog").getByRole("button",{name:"Seguir",exact:true}).click();
    await simularAteResultados(page);
    const report=page.locator(".tec-report-block").first();
    await report.locator("summary").click();
    const openedAt=await report.locator(".tec-report-content").evaluate(node=>node.getAnimations()[0]?.startTime ?? 0);
    await expect(report.locator(".tec-report-content")).toHaveCSS("animation-name","tec-panel-enter");
    await report.locator("summary").click();
    expect(await report.locator(".tec-report-content").evaluate(node=>node.getAnimations().length)).toBe(0);
    await report.locator("summary").click();
    await expect.poll(()=>report.locator(".tec-report-content").evaluate(node=>Number(node.getAnimations()[0]?.startTime))).toBeGreaterThan(Number(openedAt));
    await page.getByRole("tab",{name:"Estatísticas",exact:true}).click();
    await expect(page.locator('[role="tabpanel"]:visible > .scroll-panel-inner')).toHaveCSS("animation-name","tec-panel-enter");
    await expect(page.locator(".tec-stat-table tbody tr").first()).toBeVisible();
    await page.locator(".tec-stat-table thead").getByRole("button",{name:"Jogos",exact:true}).click();
    const apps=await page.locator(".tec-stat-table tbody tr td:first-of-type").allTextContents();
    expect(Number(apps[0])).toBeGreaterThan(0);
    await page.locator(".tec-stat-player").first().click();
    await expect(page.locator(".tec-player-statistics")).toContainText("Minutos");
    await expect(page.locator(".tec-player-statistics .tec-stat-numbers")).not.toHaveCount(1);
    await expect(page.locator(".tec-player-statistics")).not.toContainText("Salário");
    await auditar(page,"Ficha estatística detalhada por competição");
    await page.screenshot({path:info.outputPath(`estatisticas-${theme}.png`)});
    await page.getByRole("dialog").getByRole("button",{name:"Fechar",exact:true}).click();
    await page.getByRole("tab",{name:mobile?"Mais":"Competições",exact:true}).click();
    await page.getByRole("combobox",{name:"Competições",exact:true}).selectOption("cont1:UEFA");
    await expect(page.locator('[role="tabpanel"]:visible table tbody tr')).toHaveCount(36);
    await expect(page.getByText("Consulte seu calendário e todos os torneios da temporada, mesmo aqueles em que seu clube não participou.",{exact:true})).toBeVisible();
    await page.screenshot({path:info.outputPath(`champions-consulta-${theme}.png`)});
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`D67: propostas recebidas, aceitar e recusar, ${theme}`, async ({ page }, info) => {
    const mobile = info.project.name === "celular";
    await page.setViewportSize(mobile ? { width: 360, height: 640 } : { width: 1280, height: 720 });
    await comSemente(page, "e2e-d67-market:1"); await abrir(page, { theme });
    await criarTecnico(page, mobile, { ritmo: "Lento" }); await assinar(page);
    if (!mobile) await page.getByRole("tab", { name: "Elenco", exact: true }).click();
    await page.getByRole("button", { name: "Ir para o evento", exact: true }).click();
    if (await page.getByRole("alertdialog").isVisible()) await page.getByRole("button", { name: "Seguir", exact: true }).click();
    await simularAteResultados(page);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByRole("heading", { name: "O mercado bateu à porta" })).toBeVisible();
    const cards = page.locator(".tec-incoming-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText("Clube interessado");
    await expect(cards.first()).toContainText("Valor da proposta");
    await etapaCabe(page); await auditar(page, "Propostas espontâneas de venda");
    const position = await page.locator(".tec-results").evaluate(node => ({ top: node.getBoundingClientRect().top, header: document.querySelector(".tec-hud")!.getBoundingClientRect().bottom, scroll: document.querySelector(".career-body")?.scrollTop ?? 0 }));
    expect(position.scroll).toBe(0);
    expect(position.top).toBeGreaterThanOrEqual(position.header - 1);
    expect(await cards.evaluateAll(nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
    await page.screenshot({ path: info.outputPath(`propostas-${theme}.png`) });
    await cards.first().getByRole("button", { name: "Recusar", exact: true }).click();
    await expect(cards.first().getByRole("status")).toContainText("Recusado");
    await cards.nth(1).getByRole("button", { name: "Aceitar", exact: true }).click();
    await expect(cards.nth(1).getByRole("status")).toContainText("Aceito");
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Ações", exact: true })).toBeVisible();
  });
}
