import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * The simulation still lives inside the app, so the harness reaches into it
 * through the app's own `@/` alias.
 *
 * This is the single line that has to change when the engine is extracted:
 * `@/` stops pointing at the app and `@craque/engine` takes over. Everything
 * else in this tool, including the captured baselines, stays exactly as it is,
 * which is the whole point of capturing them before the move rather than after.
 */
const appSrc = fileURLToPath(new URL("../../apps/web/src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "@": appSrc },
  },
  test: {
    include: ["test/**/*.test.ts"],
    // Fingerprinting thousands of careers is arithmetic, not I/O.
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
