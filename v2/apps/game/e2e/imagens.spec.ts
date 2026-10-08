import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { trophyArtUrl, EXTRA_TROPHY_ART } from "../../../packages/art/src/trophy/extra";
import { TROPHY_ART } from "../../../packages/art/src/trophy";

const files = JSON.parse(readFileSync(new URL("../../../packages/world/data/trophy-files.json", import.meta.url), "utf8")) as {
  trophies: Record<string, string>; awards: Record<string, string>;
};

// Verifica decodificação de verdade: existir uma URL não garante imagem carregada.
for (const mode of ["real", "gerado"] as const) {
  test(`todas as competições e prêmios carregam no modo ${mode}`, async ({ page }) => {
    const images = mode === "real" ? [
      ...Object.entries(files.trophies).map(([id, ext]) => ({ id, src: `/assets/trophies/${id}.${ext}` })),
      ...Object.entries(files.awards).map(([id, ext]) => ({ id, src: `/assets/awards/${id}.${ext}` })),
    ] : Object.keys({ ...TROPHY_ART, ...EXTRA_TROPHY_ART }).map((id) => ({ id, src: trophyArtUrl(id) }));
    await page.goto("/");
    const broken = await page.evaluate(async (entries) => {
      return (await Promise.all(entries.map(async (entry) => {
        const image = new Image();
        image.src = entry.src;
        try {
          await image.decode();
          return image.naturalWidth > 0 && image.naturalHeight > 0 ? null : entry.id;
        } catch {
          return entry.id;
        }
      }))).filter((entry) => entry !== null);
    }, images);
    expect(broken).toEqual([]);
  });
}
