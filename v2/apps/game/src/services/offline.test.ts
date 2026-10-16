import { CLUBS, COMPETITIONS } from "@craque/world";
import { describe, expect, it } from "vitest";
import { IMAGE_CACHE, RUNTIME_IMAGE_DIRS, RUNTIME_IMAGE_PATTERN } from "./cacheNames";
import { canStoreImages, RUNTIME_IMAGE_BYTES, runtimeImageUrls } from "./offlineImages";

/** As imagens que entram conforme aparecem (GDD 37), e o que o service worker combina com o jogo. */

describe("imagens para jogar sem internet", () => {
  const urls = runtimeImageUrls();

  it("a lista tem imagens reais de todas as categorias sob demanda, sem repetir", () => {
    expect(urls.length).toBeGreaterThan(300);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url, url).toMatch(RUNTIME_IMAGE_PATTERN);
    const crests = CLUBS.filter((club) => club.crest).length;
    const trophies = new Set(COMPETITIONS.filter((competition) => competition.trophy?.startsWith("trophies/")).map((competition) => competition.trophy)).size;
    expect(urls.filter((url) => url.includes("/assets/clubs/"))).toHaveLength(crests);
    expect(urls.filter((url) => url.includes("/assets/trophies/"))).toHaveLength(trophies);
    // D62: estas categorias passam a entrar sob demanda, não na instalação.
    for (const folder of ["flags", "leagues", "awards"]) expect(urls.some((url) => url.includes(`/assets/${folder}/`))).toBe(true);
  });

  it("o padrão do service worker pega as pastas dele e só elas", () => {
    expect(IMAGE_CACHE).toBe("craque-imagens");
    for (const folder of RUNTIME_IMAGE_DIRS) expect(RUNTIME_IMAGE_PATTERN.test(`/assets/${folder}/x.svg`)).toBe(true);
    expect(RUNTIME_IMAGE_PATTERN.test("/assets/flags/br.svg")).toBe(true);
    expect(RUNTIME_IMAGE_PATTERN.test("/assets/unknown/br.svg")).toBe(false);
    expect(RUNTIME_IMAGE_PATTERN.test("/assets/index-abc.js")).toBe(false);
  });

  it("o peso medido no build é o de verdade (escudos e troféus)", () => {
    expect(RUNTIME_IMAGE_BYTES).toBeGreaterThan(10_000_000);
  });

  it("sem Cache Storage (Node, navegador antigo), o jogo sabe que não dá para guardar", () => {
    expect(canStoreImages()).toBe(typeof caches !== "undefined");
  });
});
