// Uma configuração para o workspace inteiro. Pacotes com regras próprias (o
// motor, que proíbe relógio e Math.random) ganham um bloco por pasta aqui.
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    // As saídas do `pnpm e2e` (relatório e rastros) trazem o visualizador do
    // Playwright em JavaScript: não são código do jogo.
    ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**", "**/.vite/**", "**/e2e-relatorio/**", "**/e2e-resultados/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      eqeqeq: ["error", "smart"],
      "no-param-reassign": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    files: ["apps/game/src/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite()],
    languageOptions: {
      globals: globals.browser,
    },
  },

  {
    files: ["**/*.config.{js,ts}", "eslint.config.js", "apps/game/build/**/*.ts", "apps/game/e2e/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    // Scripts de linha de comando (notas dos clubes): Node, e falam pelo console.
    files: ["**/scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "off",
    },
  },

  {
    // Ferramentas de linha de comando (harness de balanceamento): o relatório
    // sai pelo terminal.
    files: ["tools/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "off",
    },
  },
]);
