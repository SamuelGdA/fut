import { expect, test } from "@playwright/test";
import { abrir, cartao } from "./apoio";

for (const game of ["craque", "tecnico"] as const) {
  test(`hub leve e cache apenas do ${game} depois da escolha`, async ({ page, context, request }, info) => {
    const manifest = await (await request.get("/game-cache.json")).json() as Record<"craque" | "tecnico" | "shell", string[]>;
    const other = game === "craque" ? "tecnico" : "craque";
    const only = (mode: "craque" | "tecnico") => manifest[mode].filter((file) => !manifest[mode === "craque" ? "tecnico" : "craque"].includes(file) && !manifest.shell.includes(file));
    const own = only(game), opposite = only(other);
    expect(own.length).toBeGreaterThan(0); expect(opposite.length).toBeGreaterThan(0);
    const requests = new Set<string>();
    context.on("request", (req) => requests.add(new URL(req.url()).pathname.slice(1)));
    await abrir(page);
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    // Uma janela ociosa também não pode iniciar o antigo pré-carregamento dos jogos.
    await page.waitForTimeout(3000);
    for (const file of [...own, ...opposite]) expect(requests.has(file), `antecipou ${file} no hub`).toBe(false);
    for (const file of new Set([...manifest.craque, ...manifest.tecnico].filter((asset) => /\/store-[^/]+\.js$/.test(asset)))) {
      const bytes = (await (await request.get(`/${file}`)).body()).byteLength;
      if (bytes > 500_000) expect(requests.has(file), "elenco pesado antecipado no hub").toBe(false);
    }
    expect([...requests].some((file) => /(?:HomeScreen|CareerScreen|TecnicoScreen|SummaryView)-/.test(file))).toBe(false);
    const initial = await page.evaluate(() => performance.getEntriesByType("resource").length);
    await cartao(page, game).getByRole("button", { name: "Jogar", exact: true }).click();
    await expect.poll(() => page.evaluate((mode) => document.documentElement.getAttribute(`data-offline-${mode}`), game), { timeout: 60_000 }).toBe("ready");
    for (const file of opposite) expect(requests.has(file), `baixou ${file} do modo não escolhido`).toBe(false);
    const stored = await page.evaluate(async () => {
      const urls: string[] = [];
      for (const name of await caches.keys()) for (const key of await (await caches.open(name)).keys()) urls.push(new URL(key.url).pathname.slice(1));
      return urls;
    });
    for (const file of own) expect(stored).toContain(file);
    for (const file of opposite) expect(stored).not.toContain(file);
    await test.info().attach("carregamento", { body: JSON.stringify({ game, initialRequests: initial, ownAssets: own.length, unselectedAssets: opposite.length }), contentType: "application/json" });
    await context.setOffline(true); await page.reload();
    await expect(page.getByRole("heading", { name: "Futeiros", exact: true })).toBeVisible();
    await cartao(page, game).getByRole("button", { name: "Jogar", exact: true }).click();
    await expect(page.getByRole("heading", { name: game === "craque" ? "CRAQUE" : "Quem está no banco", exact: true })).toBeVisible();
    if (game === "tecnico" && info.project.name === "celular") await expect(page.getByLabel("Nome do técnico")).toBeVisible();
  });
}
