import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PREFS, sanitizePrefs, usePrefs } from "./prefs";

describe("sanitizePrefs (GDD 34.3)", () => {
  it("entrada que não é objeto vira o padrão inteiro", () => {
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs("tema escuro")).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs(undefined)).toEqual(DEFAULT_PREFS);
  });

  it("o padrão é escuro, português, volume 75% e ritmo intenso", () => {
    expect(DEFAULT_PREFS).toMatchObject({
      theme: "dark",
      locale: "pt",
      volume: 3,
      muted: false,
      pace: "intense",
      difficulty: "normal",
      motion: "system",
    });
  });

  it("um campo inválido cai para o padrão sem derrubar os válidos", () => {
    const result = sanitizePrefs({ theme: "neon", locale: "en", volume: 9, muted: "sim", pace: "normal" });
    expect(result.theme).toBe("dark");
    expect(result.locale).toBe("en");
    expect(result.volume).toBe(3);
    expect(result.muted).toBe(false);
    expect(result.pace).toBe("normal");
  });

  it("descarta chaves desconhecidas", () => {
    expect(sanitizePrefs({ hacker: true })).not.toHaveProperty("hacker");
  });
});

describe("volume e mudo", () => {
  beforeEach(() => {
    usePrefs.setState({ ...DEFAULT_PREFS });
  });

  it("subir o volume para fora do zero desmuta sozinho", () => {
    const actions = usePrefs.getState();
    actions.setMuted(true);
    actions.setVolume(2);
    expect(usePrefs.getState()).toMatchObject({ volume: 2, muted: false });
  });

  it("levar o volume a zero não muda o estado de mudo", () => {
    const actions = usePrefs.getState();
    actions.setMuted(true);
    actions.setVolume(0);
    expect(usePrefs.getState()).toMatchObject({ volume: 0, muted: true });
  });

  it("volume é preso entre 0 e 4 e arredondado", () => {
    usePrefs.getState().setVolume(7.4);
    expect(usePrefs.getState().volume).toBe(4);
    usePrefs.getState().setVolume(-3);
    expect(usePrefs.getState().volume).toBe(0);
  });
});
