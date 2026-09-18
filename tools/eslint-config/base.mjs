// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Correctness rules that apply to every line of the repository, old and new.
 *
 * Deliberately holds no size or complexity ceiling. Those live in `strict`
 * and are switched on per package, because the app still contains the
 * pre-rewrite code: a 2,800-line module that is scheduled for deletion should
 * not be able to fail the build of a package that has nothing to do with it.
 */
export const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // `unknown` at the boundary, never `any` past it.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // An unused parameter named with a leading underscore is a documented
      // signature, not dead code.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "object-shorthand": "error",
    },
  },
);

export default base;
