import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";
import { errorPages } from "./build/errorPages.ts";
import { IMAGE_CACHE, RUNTIME_IMAGE_PATTERN } from "./src/services/cacheNames.ts";

const PUBLIC_ASSETS = fileURLToPath(new URL("./public/assets/", import.meta.url));

/** O peso das imagens que entram conforme aparecem, para os Ajustes dizerem quanto é guardar tudo. */
function folderBytes(folder: string): number {
  return readdirSync(folder).reduce((total, name) => {
    const path = join(folder, name);
    const stats = statSync(path);
    return total + (stats.isDirectory() ? folderBytes(path) : stats.size);
  }, 0);
}

const RUNTIME_IMAGE_BYTES = folderBytes(join(PUBLIC_ASSETS, "clubs")) + folderBytes(join(PUBLIC_ASSETS, "trophies"));

const THEME = "#0d1110";

export default defineConfig({
  define: {
    __RUNTIME_IMAGE_BYTES__: JSON.stringify(RUNTIME_IMAGE_BYTES),
  },
  plugins: [
    react(),
    // React Compiler: memoização automática dos componentes, sem useMemo à mão.
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    // Páginas estáticas 404, 403, 500 e 503 (GDD 37).
    errorPages(),
    // PWA (GDD 37): instalável, e a casca e o jogo funcionam sem internet.
    VitePWA({
      // O jogo pergunta antes de trocar de versão: atualizar no meio de uma
      // revelação não é com a gente. O registro fica no `PwaEffects`.
      registerType: "prompt",
      injectRegister: false,
      // O glob do Workbox já leva o favicon e os ícones; sem isto, entrariam duas vezes.
      includeManifestIcons: false,
      manifest: {
        id: "./",
        name: "CRAQUE: carreira de futebol",
        short_name: "CRAQUE",
        description: "Crie um jogador de 16 anos e conduza a carreira inteira, decisão por decisão, até a aposentadoria.",
        lang: "pt-BR",
        dir: "ltr",
        start_url: "./",
        scope: "./",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "any",
        background_color: THEME,
        theme_color: THEME,
        categories: ["games", "sports"],
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Na instalação: o jogo inteiro (código, estilos, fontes latinas), as
        // páginas de erro, os ícones, bandeiras, selos de liga e prêmios.
        globPatterns: ["**/*.{js,css,html,woff2,svg,png,webp}"],
        globIgnores: [
          "assets/clubs/**",
          "assets/trophies/**",
          "assets/federations/**",
          // Alfabetos que os textos do jogo não usam: baixam se um dia aparecerem.
          "**/*-cyrillic*",
          "**/*-greek*",
          "**/*-vietnamese*",
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Qualquer endereço sem internet abre o jogo; o jogo decide se é a
        // página não encontrada.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/\/assets\//, /\.[a-z0-9]+$/i],
        cleanupOutdatedCaches: true,
        // Escudos e troféus entram conforme aparecem e saem dali na próxima vez.
        runtimeCaching: [
          {
            urlPattern: RUNTIME_IMAGE_PATTERN,
            handler: "CacheFirst",
            options: {
              cacheName: IMAGE_CACHE,
              expiration: { maxEntries: 900, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "build/**/*.test.ts"],
  },
});
