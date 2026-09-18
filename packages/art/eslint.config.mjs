import { defineConfig, globalIgnores } from "eslint/config";
import { base } from "@craque/eslint-config/base";
import { strict } from "@craque/eslint-config/strict";

export default defineConfig([
  ...base,
  ...strict,
  {
    /*
     * Art is geometry, and geometry is coordinates.
     *
     * A silhouette with sixty numbers in it is one shape, not sixty decisions,
     * so a line ceiling measures the wrong thing: splitting a path across two
     * files to satisfy a count makes it harder to see, not easier. Same for
     * parameters. `roundRect(ctx, x, y, w, h, r)` is the signature every 2D
     * API in existence uses, and wrapping those six numbers in an object to
     * satisfy a rule aimed at business logic would make the drawing code worse
     * to read and no safer.
     *
     * The rules that stay on are the ones that still mean something here: no
     * `any`, no default export, and no reading ambient state.
     */
    files: ["src/**/*.ts"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      complexity: "off",
    },
  },
  {
    /*
     * The one place in the repository where `Math.random` is correct.
     *
     * The determinism rule exists for the simulation: the same seed has to
     * produce the same career forever, and every crest and trophy is derived
     * from a hash of its own id for the same reason. None of that applies to
     * the "surprise me" button, whose entire job is to hand the player a face
     * they did not choose and a different one next time. Seeding it would mean
     * pressing it twice gave the same result.
     */
    files: ["src/avatar/config.ts"],
    rules: { "no-restricted-properties": "off" },
  },
  globalIgnores(["dist/**"]),
]);
