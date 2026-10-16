import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";
import { errorPages } from "./build/errorPages.ts";
import { gameLoading } from "./build/gameLoading.ts";
import { CODE_CACHE, IMAGE_CACHE, RUNTIME_IMAGE_DIRS, RUNTIME_IMAGE_PATTERN } from "./src/services/cacheNames.ts";

const PUBLIC_ASSETS = fileURLToPath(new URL("./public/assets/", import.meta.url));

/** O peso das imagens que entram conforme aparecem, para os Ajustes dizerem quanto é guardar tudo. */
function folderBytes(folder: string): number {
  return readdirSync(folder).reduce((total, name) => {
    const path = join(folder, name);
    const stats = statSync(path);
    return total + (stats.isDirectory() ? folderBytes(path) : stats.size);
  }, 0);
}

const RUNTIME_IMAGE_BYTES = RUNTIME_IMAGE_DIRS.reduce((total, directory) => total + folderBytes(join(PUBLIC_ASSETS, directory)), 0);

// A casca usa submódulos pequenos de posições/atributos; os grafos dos modos
// só são guardados após a escolha, sem antecipar o motor completo no hub.
const loading = gameLoading();

const THEME = "#f3f0e8";

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
    loading.plugin,
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
        name: "Futeiros: dois jogos de futebol",
        short_name: "Futeiros",
        description: "Craque, a carreira de jogador, e Técnico, a carreira de treinador: dois jogos de futebol decididos por escolhas.",
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
        // Na instalação só a casca/hub. Os jogos entram quando o modo é aberto.
        globPatterns: ["**/*.{js,css,html,woff2,svg,png,webp}"],
        manifestTransforms: [async (entries) => ({ manifest: entries.filter((entry) => loading.initialAsset(entry.url)), warnings: [] })],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Qualquer endereço sem internet abre o jogo; o jogo decide se é a
        // página não encontrada.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/\/assets\//, /\.[a-z0-9]+$/i],
        cleanupOutdatedCaches: true,
        // Escudos e troféus entram conforme aparecem e saem dali na próxima vez.
        runtimeCaching: [
          { urlPattern: /\/game-cache\.json$/, handler: "NetworkFirst", options: { cacheName: CODE_CACHE, networkTimeoutSeconds: 2, cacheableResponse: { statuses: [200] } } },
          { urlPattern: /\/assets\/[^/]+\.(?:js|css|woff2)$/, handler: "CacheFirst", options: { cacheName: CODE_CACHE, matchOptions: { ignoreVary: true }, cacheableResponse: { statuses: [200] }, expiration: { maxEntries: 350, purgeOnQuotaError: true } } },
          {
            urlPattern: RUNTIME_IMAGE_PATTERN,
            handler: "CacheFirst",
            options: {
              cacheName: IMAGE_CACHE,
              matchOptions: { ignoreVary: true },
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
    // Relatórios gerados são reescritos durante os testes e podem estar bloqueados no Windows.
    watch: { ignored: ["**/e2e-relatorio/**", "**/e2e-resultados/**"] },
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
