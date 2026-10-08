import { defineConfig } from "@playwright/test";

/**
 * A suíte ponta a ponta (GDD 40.2): o jogo de verdade, no build de produção
 * servido pelo `vite preview` (é onde existe o service worker), num celular de
 * 375 × 812 e num desktop de 1280 × 800. Usa o Chrome instalado no sistema:
 * nada de baixar navegador.
 *
 *   pnpm e2e                  a suíte inteira (gera o build antes)
 *   pnpm e2e --project=desktop
 *   pnpm e2e e2e/jornada.spec.ts --project=desktop
 *
 * O relatório HTML fica em `e2e-relatorio/` e, quando algo falha, o rastro e a
 * foto ficam em `e2e-resultados/`.
 */

const PORT = 4173;

export default defineConfig({
  testDir: "./e2e",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: process.env["CI"] ? 2 : 4,
  retries: process.env["CI"] ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "e2e-relatorio", open: "never" }]],
  outputDir: "e2e-resultados",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    locale: "pt-BR",
    // Um fuso longe de UTC: o Desafio do dia tem de virar pela meia-noite UTC, não pela local.
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // A suíte toca o jogo inteiro; som e vibração ficam desligados nas preferências.
    permissions: ["clipboard-read", "clipboard-write"],
  },
  projects: [
    {
      name: "celular",
      use: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    },
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    // O build da suíte usa as imagens reais: assim o modo real (cache de
    // escudos, "Guardar todas") continua testado; o padrão é o desenhado (D46).
    command: `pnpm build && pnpm exec vite preview --port ${PORT} --strictPort`,
    env: { VITE_ASSETS: "real" },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env["CI"],
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
