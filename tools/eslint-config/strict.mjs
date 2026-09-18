// @ts-check
import tseslint from "typescript-eslint";

/**
 * The clean-code ceilings, applied to every package extracted from the old
 * codebase and to nothing else.
 *
 * These are the numbers from docs/ARCHITECTURE.md, expressed as build
 * failures rather than as a style guide nobody reads. They exist because the
 * module they are aimed at preventing already happened once: the career
 * module reached 2,843 lines holding types, scheduling, decision generation,
 * resolution, season simulation, derived views and debug tooling at the same
 * time.
 */
export const strict = tseslint.config(
  {
    rules: {
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 50, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["error", 12],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],
      "max-nested-callbacks": ["error", 3],

      /*
       * Lives here rather than in `base` on purpose.
       *
       * It is a clean-code rule, not a correctness one, and the pre-rewrite
       * code uses the pattern it forbids in a way that is actually safe:
       * rebinding a parameter to a *new* object built by spreading the old one,
       * which mutates nothing. New code should thread a local instead, so the
       * rule applies to packages from their first commit and not to modules
       * that are on their way out.
       */
      "no-param-reassign": "error",

      // A default export gives the same module a different name at every call
      // site, which is precisely what makes a large refactor hard to follow.
      "no-restricted-exports": ["error", { restrictDefaultExports: { direct: true } }],

      // The simulation has to produce the same career from the same seed on
      // every machine, every run, forever. These are the ways that breaks.
      // Scoped to the two calls that actually read ambient state: the rest of
      // `Math` is arithmetic and is exactly what the engine is made of.
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message: "Determinism: use the seeded generator in kernel/random.",
        },
        {
          object: "Date",
          property: "now",
          message: "Determinism: time must be passed in, never read.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: "Determinism: time must be passed in, never read.",
        },
      ],
    },
  },
  {
    /*
     * A config file has to default-export; that is the framework's contract,
     * not a style choice.
     */
    files: ["**/*.config.{js,mjs,cjs,ts,mts}", "**/eslint.config.{js,mjs,ts}"],
    rules: { "no-restricted-exports": "off" },
  },
  {
    /*
     * A `describe` block is a container of tests, not a function with logic in
     * it, so counting its lines measures how many cases a suite covers and
     * then penalises it for covering more. The ceilings that matter inside a
     * test are the ones on the code under test.
     */
    files: ["**/*.test.ts", "**/*.test.tsx", "**/test/**", "**/tests/**"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
    },
  },
);
