import { expect, type Page, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { abrir, auditar, entrarNoCraque, jogoRapido } from "./apoio";
import { chamadas, comConta, perfil, simularGoogle, simularNuvem, SUPABASE } from "./conta";

/**
 * Contas, privacidade e segurança (D112 a D114), com o Supabase simulado
 * (e2e/conta.ts): o visitante, o login por e-mail e pelo Google com a volta no
 * /login, a confirmação de e-mail, o @ obrigatório, o perfil com esqueletos e
 * troféus, as páginas legais, o aviso de cookies, a CSP e o aviso legal.
 */

/** Toda violação da Content-Security-Policy que o navegador relatar. */
function vigiarCsp(page: Page): string[] {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to (load|execute|connect|frame|apply)/i.test(message.text())) violations.push(message.text());
  });
  return violations;
}

test("visitante: Entrar no topo, convite nas conquistas, aviso e ranking mundial no Desafio", async ({ page }) => {
  await simularNuvem(page, { ranking: [{ posicao: 1, username: "lider_do_dia", pontos: 931, total: 2, voce: false }, { posicao: 2, username: "segundo", pontos: 702, total: 2, voce: false }] });
  const csp = vigiarCsp(page);
  await abrir(page);
  await expect(page.getByRole("banner").getByRole("button", { name: "Entrar" })).toBeVisible();

  await page.getByRole("button", { name: /Conquistas/ }).first().click();
  await expect(page.getByRole("heading", { name: "Sua coleção começa aqui", level: 1 })).toBeVisible();
  await expect(page.getByText("Faça login para começar a colecionar conquistas e registrar suas estatísticas.")).toBeVisible();
  // Os troféus do convite aparecem bloqueados: cinza e meio apagados.
  expect(await page.locator(".achievements-gate .trophy-icon").first().evaluate((node) => getComputedStyle(node).filter)).toContain("grayscale(1)");
  await auditar(page, "Conquistas, visitante");

  await page.getByRole("button", { name: "Voltar ao início" }).click();
  await entrarNoCraque(page);
  await page.getByRole("button", { name: "Ver o desafio" }).click();
  await expect(page.getByText("Você está jogando como visitante. Faça login para registrar no Ranking e desbloquear conquistas!")).toBeVisible();
  const ranking = page.getByRole("list", { name: "Ranking mundial do dia" });
  await expect(ranking).toContainText("@lider_do_dia");
  await expect(ranking).toContainText("931");
  await auditar(page, "Desafio, visitante");
  expect(csp).toEqual([]);
});

test("login por e-mail: erro claro, entrada e volta para onde estava", async ({ page }) => {
  const nuvem = await simularNuvem(page);
  const csp = vigiarCsp(page);
  await abrir(page);
  await page.getByRole("banner").getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Entre em campo", level: 1 })).toBeVisible();
  await auditar(page, "Login");

  await page.getByLabel("E-mail", { exact: true }).fill("jogador@exemplo.com");
  await page.getByLabel("Senha", { exact: true }).fill("errada123");
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await expect(page.getByRole("alert")).toHaveText("E-mail ou senha não conferem.");

  await page.getByLabel("Senha", { exact: true }).fill(nuvem.password);
  await page.getByRole("button", { name: "Mostrar senha" }).click();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
  // De volta ao hub, com o @ no topo; a URL volta para a raiz.
  await expect(page.getByRole("heading", { name: "Futeiro", level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Abrir o perfil de @craque_e2e" })).toBeVisible();
  // Só as colunas que a tela usa: nunca `select=*`.
  const read = chamadas(nuvem, "/rest/v1/profiles").find((call) => call.method === "GET");
  expect(read?.search).toContain("select=username%2Ccriado_em");
  expect(read?.search).not.toContain("select=*");
  expect(csp).toEqual([]);
});

test("Google sem o script do Google (bloqueado): o botão do jogo sai para o Supabase com PKCE e volta pelo /login já logado", async ({ page }) => {
  const nuvem = await simularNuvem(page);
  await abrir(page, {}, "/login");
  await page.getByRole("button", { name: "Continuar com Google" }).click();
  await expect(page).toHaveURL(new RegExp(`^${SUPABASE}/auth/v1/authorize`));
  const authorize = new URL(page.url());
  expect(authorize.searchParams.get("provider")).toBe("google");
  expect(authorize.searchParams.get("redirect_to")).toBe("http://localhost:4173/login");
  expect(authorize.searchParams.get("code_challenge_method")?.toLowerCase()).toBe("s256");

  // A volta do Google: o código na URL vira sessão e some da barra de endereço.
  await page.goto("/login?code=codigo-e2e");
  await expect(page.getByRole("heading", { name: "Futeiro", level: 1 })).toBeVisible();
  await expect(page).not.toHaveURL(/code=/);
  const exchange = chamadas(nuvem, "/auth/v1/token").find((call) => call.search.includes("grant_type=pkce"));
  expect((exchange?.body as { auth_code?: string } | undefined)?.auth_code).toBe("codigo-e2e");
});

type Gis = { __gis: { renders: number; client_id: string; nonce: string; fedcm: boolean; width: number; theme: string; locale: string } };

test("Google pelo botão oficial: a janelinha do navegador entra sem sair do site, com nonce (D123)", async ({ page }) => {
  const nuvem = await simularNuvem(page);
  await simularGoogle(page);
  const csp = vigiarCsp(page);
  await abrir(page, {}, "/login");
  // O botão do jogo dá lugar ao oficial do Google, na largura da coluna.
  const official = page.getByRole("button", { name: "Continuar como Jogador E2E" });
  await expect(official).toBeVisible();
  await expect(page.getByRole("button", { name: "Continuar com Google" })).toHaveCount(0);
  const gis = await page.evaluate(() => (window as unknown as Gis).__gis);
  expect(gis.client_id).toBe("1234567890-e2esomentetestes.apps.googleusercontent.com");
  expect(gis.fedcm).toBe(true);
  expect(gis.theme).toBe("outline");
  expect(gis.locale).toBe("pt-BR");
  expect(gis.width).toBeGreaterThanOrEqual(200);
  expect(gis.width).toBeLessThanOrEqual(400);

  await official.click();
  await expect(page.getByRole("heading", { name: "Futeiro", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir o perfil de @craque_e2e" })).toBeVisible();
  const exchange = chamadas(nuvem, "/auth/v1/token").find((call) => call.search.includes("grant_type=id_token"));
  const body = exchange?.body as { id_token?: string; nonce?: string; provider?: string } | undefined;
  expect(body?.id_token).toBe("token-google-e2e");
  expect(body?.provider).toBe("google");
  // O Google assinou o hash; o Supabase recebe o nonce cru e confere.
  expect(createHash("sha256").update(body?.nonce ?? "").digest("hex")).toBe(gis.nonce);
  expect(chamadas(nuvem, "/auth/v1/authorize")).toEqual([]);
  // D122: a conta nova recebe o idioma do jogo, uma vez, para os e-mails.
  await expect.poll(() => chamadas(nuvem, "/auth/v1/user").filter((call) => call.method === "PUT").map((call) => (call.body as { data?: { locale?: string } }).data?.locale)).toEqual(["pt"]);
  expect(csp).toEqual([]);
});

test("Google no tema escuro e em inglês: o botão oficial acompanha", async ({ page }) => {
  await simularNuvem(page);
  await simularGoogle(page);
  await abrir(page, { theme: "dark", locale: "en" }, "/login");
  await expect(page.getByRole("button", { name: "Continuar como Jogador E2E" })).toBeVisible();
  const gis = await page.evaluate(() => (window as unknown as Gis).__gis);
  expect(gis.theme).toBe("filled_black");
  expect(gis.locale).toBe("en");
});

test("link de confirmação aberto em outro navegador: e-mail confirmado, falta entrar", async ({ page }) => {
  await simularNuvem(page);
  await abrir(page, {}, "/login?code=sem-verificador");
  await expect(page.getByText("E-mail confirmado. Entre com seu e-mail e senha para continuar.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("criar conta pede confirmação por e-mail e confere o @ antes", async ({ page }) => {
  const nuvem = await simularNuvem(page);
  await abrir(page, {}, "/login");
  await page.getByRole("radio", { name: "Criar conta" }).click();
  await page.getByLabel("Seu @", { exact: true }).fill("ja_existe");
  await expect(page.getByText("@ja_existe já tem dono")).toBeVisible();
  await page.getByLabel("Seu @", { exact: true }).fill("Novo_Craque");
  await expect(page.getByText("@novo_craque está livre")).toBeVisible();
  await page.getByLabel("E-mail", { exact: true }).fill("novo@exemplo.com");
  await page.getByLabel("Senha", { exact: true }).fill("curta");
  await page.getByRole("button", { name: "Criar conta", exact: true }).last().click();
  await expect(page.getByRole("alert")).toContainText("pelo menos 8 caracteres");
  await page.getByLabel("Senha", { exact: true }).fill("senha1234");
  await page.getByRole("button", { name: "Criar conta", exact: true }).last().click();
  await expect(page.getByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
  const signup = chamadas(nuvem, "/auth/v1/signup")[0]?.body as { email?: string; data?: { username?: string; locale?: string } };
  // D122: o idioma do jogo vai junto, para os e-mails da conta saírem nele.
  expect(signup.data?.locale).toBe("pt");
  expect(signup.email).toBe("novo@exemplo.com");
  expect(signup.data?.username).toBe("novo_craque");
  await auditar(page, "Login, confirmação");
});

test("primeiro login sem @: o passo do @ é obrigatório antes de jogar", async ({ page }) => {
  const nuvem = await comConta(page, { profile: perfil({ username: null, carreiras: 0 }) });
  await abrir(page);
  // Qualquer tela leva ao passo do @.
  await expect(page.getByRole("heading", { name: "Escolha seu @" })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Seu @", { exact: true }).fill("admin");
  await page.getByRole("button", { name: "Começar a jogar" }).click();
  // O motivo certo: reservado é reservado, não "formato errado".
  await expect(page.getByRole("alert")).toContainText("Esse @ é reservado");
  // D126: palavrão disfarçado avisa enquanto digita e não sai do aparelho.
  await page.getByLabel("Seu @", { exact: true }).fill("put4_10");
  await expect(page.getByText("Esse @ não é permitido", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Começar a jogar" }).click();
  await expect(page.getByRole("alert")).toContainText("Esse @ não é permitido. Escolha outro.");
  expect(chamadas(nuvem, "/rest/v1/profiles").filter((call) => call.method === "PATCH")).toEqual([]);
  await page.getByLabel("Seu @", { exact: true }).fill("meu_craque");
  await expect(page.getByText("@meu_craque está livre")).toBeVisible();
  await page.getByRole("button", { name: "Começar a jogar" }).click();
  await expect(page.getByRole("heading", { name: "Futeiro", level: 1 })).toBeVisible();
  // Só o username sai na atualização do perfil (mass assignment).
  const patch = chamadas(nuvem, "/rest/v1/profiles").find((call) => call.method === "PATCH");
  expect(patch?.body).toEqual({ username: "meu_craque" });
});

test("perfil: esqueletos enquanto carrega, números da conta e troféus com quantidade", async ({ page }, info) => {
  const nuvem = await comConta(page, {
    trophies: [
      { id_trophy: "title:cont1:CONMEBOL", quantidade: 3, data_desbloqueio: "2026-10-02T10:00:00Z" },
      { id_trophy: "ballonDor", quantidade: 5, data_desbloqueio: "2026-10-03T10:00:00Z" },
      { id_trophy: "firstCareer", quantidade: 12, data_desbloqueio: "2026-10-01T10:00:00Z" },
    ],
  });
  await abrir(page, { motion: "reduced" });
  // O banco demora: o perfil aberto direto pelo endereço mostra os esqueletos no lugar de cada bloco.
  nuvem.delay = 2500;
  await page.goto("/perfil");
  await expect(page.getByRole("status", { name: "Abrindo o perfil" })).toBeVisible();
  await expect(page.locator(".profile-page .skeleton").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "@craque_e2e", level: 1 })).toBeVisible();
  await expect(page.locator(".profile-stat").filter({ hasText: "Gols" }).first()).toContainText("2.840");
  await expect(page.locator(".profile-stat").filter({ hasText: "Bolas de Ouro" })).toContainText("5");
  // A vitrine (D118): os títulos primeiro, depois as outras conquistas, com o
  // selo da quantidade e o nome acessível completo.
  const icons = page.locator(".profile-showcase .trophy-icon");
  await expect(icons.first()).toHaveAttribute("aria-label", /^Copa Libertadores: conquistada, conquistada em 3 carreiras/);
  const ballon = icons.filter({ has: page.locator(".trophy-count", { hasText: "×5" }) }).first();
  await expect(ballon).toHaveAttribute("aria-label", /Bola de Ouro: conquistada, conquistada em 5 carreiras/);
  await auditar(page, "Perfil");
  await page.screenshot({ path: info.outputPath("perfil.png"), fullPage: true });

  // A tela de conquistas: liberada colorida com quantidade, bloqueada em cinza.
  await page.getByRole("button", { name: "Ver todas as conquistas" }).click();
  const unlocked = page.locator(".achievement[data-unlocked]").filter({ hasText: "Primeiro apito final" });
  await expect(unlocked.locator(".trophy-count")).toHaveText("×12");
  expect(await unlocked.locator(".trophy-icon").evaluate((node) => getComputedStyle(node).filter)).toBe("none");
  const locked = page.locator(".achievement:not([data-unlocked]) .trophy-icon").first();
  expect(await locked.evaluate((node) => getComputedStyle(node).filter)).toBe("grayscale(1) opacity(0.5)");
  await expect(locked).toHaveAttribute("aria-label", /: bloqueada$/);
});

test("sair e apagar a conta pelo perfil", async ({ page }) => {
  const nuvem = await comConta(page);
  await abrir(page, {}, "/perfil");
  await expect(page.getByRole("heading", { name: "@craque_e2e", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Apagar a conta" }).click();
  // D127: primeiro o link por e-mail. O foco vai para a opção que não muda nada.
  await expect(page.getByRole("button", { name: "Manter a conta" })).toBeFocused();
  await expect(page.getByText("mandamos um link para jogador@exemplo.com")).toBeVisible();
  await page.getByRole("button", { name: "Mandar o link" }).click();
  await expect(page.getByText("Link enviado para jogador@exemplo.com")).toBeVisible();
  const otp = chamadas(nuvem, "/auth/v1/otp")[0];
  expect((otp?.body as { email?: string } | undefined)?.email).toBe("jogador@exemplo.com");
  expect(decodeURIComponent(otp?.search ?? "")).toContain("redirect_to=http://localhost:4173/perfil?apagar=1");
  expect(chamadas(nuvem, "/rest/v1/rpc/excluir_conta")).toHaveLength(0);

  // A volta pelo link: o perfil abre já pedindo a confirmação final.
  await page.goto("/perfil?apagar=1");
  await expect(page).toHaveURL(/\/perfil$/);
  await page.getByRole("button", { name: "Apagar para sempre" }).click();
  await expect(page.getByRole("heading", { name: "Futeiro", level: 1 })).toBeVisible();
  await expect(page.getByRole("banner").getByRole("button", { name: "Entrar" })).toBeVisible();
  expect(chamadas(nuvem, "/rest/v1/rpc/excluir_conta")).toHaveLength(1);
  expect(await page.evaluate(() => localStorage.getItem("craque.v2.auth"))).toBeNull();
});

for (const [path, title] of [["/termos", "Termos de Serviço"], ["/privacidade", "Política de Privacidade"]] as const) {
  test(`${title} em endereço próprio, com índice e axe`, async ({ page }) => {
    const csp = vigiarCsp(page);
    await abrir(page, {}, path);
    await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Nesta página" }).getByRole("link").first()).toBeVisible();
    await expect(page.getByText("contato@exemplo.com")).toBeVisible();
    // A data da versão não pode virar o dia anterior no fuso de Brasília.
    await expect(page.getByText("Atualizado em 20/11/2026")).toBeVisible();
    if (path === "/privacidade") {
      await expect(page.getByRole("heading", { name: /Google Analytics/ })).toBeVisible();
      await expect(page.getByRole("heading", { name: /Google AdSense/ })).toBeVisible();
    }
    await auditar(page, title);
    expect(csp).toEqual([]);
  });
}

test.describe("aviso de cookies", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("as duas escolhas têm o mesmo peso; Analytics só com Aceitar todos", async ({ page }) => {
    const gtag: string[] = [];
    await page.route("https://www.googletagmanager.com/**", async (route) => {
      gtag.push(route.request().url());
      await route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
    });
    const csp = vigiarCsp(page);
    await abrir(page);
    const banner = page.getByRole("region", { name: "Cookies no Futeiro" });
    await expect(banner).toBeVisible();
    await auditar(page, "Aviso de cookies", ".cookie-banner");
    const [essential, all] = [banner.getByRole("button", { name: "Somente essenciais" }), banner.getByRole("button", { name: "Aceitar todos" })];
    const [a, b] = [await essential.boundingBox(), await all.boundingBox()];
    expect(Math.abs((a?.height ?? 0) - (b?.height ?? 0))).toBeLessThan(1);

    await essential.click();
    await expect(banner).toHaveCount(0);
    await page.waitForTimeout(300);
    expect(gtag).toEqual([]);

    // Mudar de ideia pelos Ajustes.
    await page.getByRole("button", { name: "Abrir ajustes" }).click();
    await page.getByRole("button", { name: "Preferências de cookies" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("region", { name: "Cookies no Futeiro" }).getByRole("button", { name: "Aceitar todos" }).click();
    await expect.poll(() => gtag.length).toBeGreaterThan(0);
    expect(gtag[0]).toContain("id=G-E2ETESTE00");
    expect(JSON.parse((await page.evaluate(() => localStorage.getItem("craque.v2.consent"))) ?? "{}")).toMatchObject({ v: 1, choice: "all" });
    expect(csp).toEqual([]);
  });
});

test("cabeçalhos de segurança: CSP sem script embutido e sem iframe de fora", async ({ request }) => {
  for (const path of ["/", "/login", "/perfil", "/termos", "/privacidade"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const headers = response.headers();
    expect(headers["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"], path).not.toContain("'unsafe-inline' 'unsafe-eval'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  }
});

test("o aviso legal fica em letra miúda nas telas onde a carreira começa, sem cobrir o laço", async ({ page }) => {
  const csp = vigiarCsp(page);
  await abrir(page);
  await entrarNoCraque(page);
  const notice = page.locator(".legal-fine");
  await expect(notice).toContainText("Aviso legal.");
  await expect(notice).toContainText("não possui caráter comercial");
  expect(await notice.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))).toBeLessThanOrEqual(12);
  await page.getByRole("button", { name: "Ver o desafio" }).click();
  await expect(page.locator(".legal-fine")).toContainText("não possui caráter comercial");
  // No laço da carreira, nada de aviso por cima da decisão.
  await page.goBack();
  await jogoRapido(page);
  await expect(page.locator(".legal-fine")).toHaveCount(0);
  expect(csp).toEqual([]);
});
