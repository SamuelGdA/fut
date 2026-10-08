/**
 * Valores das cores para exibição no laboratório. Espelham `styles/index.css`;
 * `tokens.test.ts` reprova se os dois saírem de sincronia.
 */
export const TOKEN_VALUES = {
  dark: {
    canvas: "#0d1110",
    panel: "#161d1a",
    "panel-2": "#1d2622",
    line: "#2b3631",
    fg: "#eef1ea",
    muted: "#9ca79f",
    faint: "#838e86",
    good: "#3fb26a",
    glory: "#e3b341",
    bad: "#ec5b60",
    info: "#7aa6cf",
  },
  light: {
    canvas: "#f3f0e8",
    panel: "#fbf9f4",
    "panel-2": "#f0ece3",
    line: "#dad4c7",
    fg: "#161b18",
    muted: "#545d57",
    faint: "#646c65",
    good: "#187a42",
    glory: "#86600b",
    bad: "#bd2c34",
    info: "#2f6c9e",
  },
} as const;

export type TokenName = keyof (typeof TOKEN_VALUES)["dark"];

/** Cores de clube para a demonstração do acento dinâmico. */
export const CLUB_SWATCHES = {
  green: { club: "#1f8a4c", onClub: "#ffffff" },
  red: { club: "#c8102e", onClub: "#ffffff" },
  sky: { club: "#6cace4", onClub: "#0d1110" },
  maroon: { club: "#7a1e2c", onClub: "#ffffff" },
  yellow: { club: "#f2c230", onClub: "#0d1110" },
} as const;

export type ClubSwatch = keyof typeof CLUB_SWATCHES;
