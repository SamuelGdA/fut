import { describe, expect, it } from "vitest";
import { ACCESSORY_STYLES, BEARD_STYLES, DEFAULT_AVATAR, EARRING_COLORS, EARRING_SIDES, EARRING_STYLES, EYEBROW_STYLES, HAIR_STYLES, MOUTH_STYLES, NOSE_SHAPES, renderAvatarSvg, SCAR_SPOTS, type AvatarConfig } from "../src";

const svg = (patch: Partial<AvatarConfig>) => renderAvatarSvg({ ...DEFAULT_AVATAR, ...patch });

describe("D106: cabelo, barba e detalhes do avatar", () => {
  it("cada estilo desenha algo diferente e nenhum número inválido", () => {
    const groups: Array<[string, readonly string[], (value: string) => string]> = [
      ["cabelo", HAIR_STYLES, (hair) => svg({ hair: hair as AvatarConfig["hair"] })],
      ["barba", BEARD_STYLES, (beard) => svg({ beard: beard as AvatarConfig["beard"] })],
      ["item", ACCESSORY_STYLES, (accessory) => svg({ accessory: accessory as AvatarConfig["accessory"] })],
      ["sobrancelha", EYEBROW_STYLES, (eyebrows) => svg({ eyebrows: eyebrows as AvatarConfig["eyebrows"] })],
      ["nariz", NOSE_SHAPES, (nose) => svg({ nose: nose as AvatarConfig["nose"] })],
      ["boca", MOUTH_STYLES, (mouth) => svg({ mouth: mouth as AvatarConfig["mouth"] })],
      ["cicatriz", SCAR_SPOTS, (scar) => svg({ scar: scar as AvatarConfig["scar"] })],
      ["brinco", EARRING_SIDES, (earring) => svg({ earring: earring as AvatarConfig["earring"] })],
      ["modelo de brinco", EARRING_STYLES, (earringStyle) => svg({ earring: "both", earringStyle: earringStyle as AvatarConfig["earringStyle"] })],
      ["cor de brinco", EARRING_COLORS.map(String), (color) => svg({ earring: "left", earringColor: EARRING_COLORS.indexOf(color) })],
    ];
    for (const [name, values, draw] of groups) {
      const drawn = values.map(draw);
      expect(new Set(drawn).size, name).toBe(values.length);
      for (const markup of drawn) expect(markup, name).not.toMatch(/NaN|undefined/);
    }
  });

  it("um save antigo, sem os campos novos, desenha igual a quem escolheu nenhum", () => {
    const { scar: _scar, earring: _earring, earringStyle: _style, earringColor: _color, ...old } = DEFAULT_AVATAR;
    expect(renderAvatarSvg(old as AvatarConfig)).toBe(svg({ scar: "none", earring: "none" }));
  });

  it("boné, gorro e boina escondem o cabelo inteiro", () => {
    for (const accessory of ["cap", "beanie", "beret"] as const) {
      expect(svg({ accessory, hair: "long" })).toBe(svg({ accessory, hair: "afro" }));
    }
  });
});
