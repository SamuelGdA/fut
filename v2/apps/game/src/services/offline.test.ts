import { describe, expect, it } from "vitest";
import { IMAGE_CACHE, RUNTIME_IMAGE_DIRS, RUNTIME_IMAGE_PATTERN } from "./cacheNames";

/** As imagens entram no cache conforme aparecem (GDD 37); o service worker só combina as pastas delas. */
describe("cache de imagens", () => {
  it("o padrão do service worker pega as pastas dele e só elas", () => {
    expect(IMAGE_CACHE).toBe("craque-imagens");
    for (const folder of RUNTIME_IMAGE_DIRS) expect(RUNTIME_IMAGE_PATTERN.test(`/assets/${folder}/x.svg`)).toBe(true);
    expect(RUNTIME_IMAGE_PATTERN.test("/assets/flags/br.svg")).toBe(true);
    expect(RUNTIME_IMAGE_PATTERN.test("/assets/unknown/br.svg")).toBe(false);
    expect(RUNTIME_IMAGE_PATTERN.test("/assets/index-abc.js")).toBe(false);
  });
});
