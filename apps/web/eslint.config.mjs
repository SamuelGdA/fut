import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { base } from "@craque/eslint-config/base";

/**
 * The app does not take `@craque/eslint-config/strict`.
 *
 * It holds the pre-rewrite codebase, moved here verbatim, and the size and
 * complexity ceilings would fail on modules that exist only until the engine
 * is extracted. Each package that leaves this directory gets `strict` from
 * its first commit instead, so the ceilings apply to the code that is going
 * to live rather than to the code that is going to go.
 */
export default defineConfig([
  ...base,
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
