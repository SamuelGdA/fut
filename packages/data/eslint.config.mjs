import { defineConfig, globalIgnores } from "eslint/config";
import { base } from "@craque/eslint-config/base";
import { strict } from "@craque/eslint-config/strict";

export default defineConfig([
  ...base,
  ...strict,
  {
    // The rivalry table and the kit table are flat lists of real-world facts.
    // Splitting either to satisfy a line count would make them harder to check
    // against reality, which is the only thing that matters about them.
    files: ["src/world/rivalries.ts", "src/world/kits.ts", "src/competitions/trophies.ts"],
    rules: { "max-lines": "off" },
  },
  {
    // Generated from the league files; it is a list, not logic.
    files: ["src/world/leagues/order.ts"],
    rules: { "max-lines": "off" },
  },
  globalIgnores(["dist/**"]),
]);
