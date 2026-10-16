import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PREFS, sanitizePrefs, usePrefs } from "./prefs";
import { safeStorage, STORAGE_KEYS } from "../services/storage";

describe("sanitizePrefs (GDD 34.3)", () => {
  it("entrada que não é objeto vira o padrão inteiro", () => {
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs("tema escuro")).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs(undefined)).toEqual(DEFAULT_PREFS);
  });

  it("o padrão é claro, português, volume 75% e ritmo intenso", () => {
    expect(DEFAULT_PREFS).toMatchObject({
      theme: "light",
      locale: "pt",
      volume: 3,
      muted: false,
      pace: "intense",
      difficulty: "normal",
      motion: "full",
    });
  });

  it("um campo inválido cai para o padrão sem derrubar os válidos", () => {
    const result = sanitizePrefs({ theme: "neon", locale: "en", volume: 9, muted: "sim", pace: "normal" });
    expect(result.theme).toBe("light");
    expect(result.locale).toBe("en");
    expect(result.volume).toBe(3);
    expect(result.muted).toBe(false);
    expect(result.pace).toBe("normal");
  });

  it("descarta chaves desconhecidas", () => {
    expect(sanitizePrefs({ hacker: true })).not.toHaveProperty("hacker");
  });

  it("animações antigas do sistema passam para ativadas e desativadas explícitas são preservadas", () => {
    expect(sanitizePrefs({ motion: "system" }).motion).toBe("full");
    expect(sanitizePrefs({ motion: "invalid" }).motion).toBe("full");
    expect(sanitizePrefs({ motion: "reduced" }).motion).toBe("reduced");
  });
});

it("a escolha de animações permanece depois de reabrir, nos dois estados", async () => {
  for (const motion of ["reduced", "full"] as const) {
    usePrefs.getState().setMotion(motion);
    const stored = safeStorage.getItem(STORAGE_KEYS.prefs)!;
    usePrefs.setState({ motion: motion === "full" ? "reduced" : "full" });
    safeStorage.setItem(STORAGE_KEYS.prefs, stored);
    await usePrefs.persist.rehydrate();
    expect(usePrefs.getState().motion).toBe(motion);
  }
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

it("detalhes começam fechados e a preferência sobrevive à reidratação", async () => {
  expect(sanitizePrefs({}).seasonDetails).toBe(false);
  usePrefs.getState().setSeasonDetails(true);
  const stored = safeStorage.getItem(STORAGE_KEYS.prefs);
  expect(JSON.parse(stored!).state.seasonDetails).toBe(true);
  usePrefs.setState({seasonDetails:false});
  safeStorage.setItem(STORAGE_KEYS.prefs, stored!);
  await usePrefs.persist.rehydrate();
  expect(usePrefs.getState().seasonDetails).toBe(true);
  usePrefs.getState().setSeasonDetails(false);
});
