import { describe, expect, it } from "vitest";
import { matchScenes, POSITIONS } from "@craque/engine";
import { dramaText, sceneOption } from "../src";

describe("D80: contrato dos 53 lances", () => {
  for (const locale of ["pt", "en", "es"] as const) it(`${locale}: todo contexto jogável tem pergunta e opções próprias`, () => {
    const scenes = new Set(POSITIONS.flatMap(position => matchScenes(position, true)));
    expect(scenes.size).toBe(53);
    for (const scene of scenes) {
      const [title, body] = dramaText(locale).scenes[scene];
      const bold = sceneOption(locale, scene, "bold");
      const team = sceneOption(locale, scene, "team");
      expect(title.length).toBeGreaterThan(4);
      expect(body.length).toBeGreaterThan(20);
      expect(bold).toBeTruthy(); expect(team).toBeTruthy(); expect(bold).not.toBe(team);
      for (const text of [title, body, bold, team]) expect(text).not.toMatch(/[—–]|\d+%/);
    }
  });
});
