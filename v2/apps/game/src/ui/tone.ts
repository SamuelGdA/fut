/**
 * Tons semânticos. Todo tom bom ou ruim tem glifo próprio: cor nunca é o único
 * sinal (GDD 36).
 */
export const TONES = ["good", "bad", "neutral", "glory", "info"] as const;

export type Tone = (typeof TONES)[number];

export const TONE_GLYPH: Readonly<Record<Tone, string>> = {
  good: "▲",
  bad: "▼",
  neutral: "●",
  glory: "★",
  info: "◆",
};

export function isTone(value: unknown): value is Tone {
  return typeof value === "string" && (TONES as readonly string[]).includes(value);
}

/** Sinal de menos tipográfico (U+2212), que não é travessão. */
export const MINUS = "−";

/** "+2", "−1" ou "0", para variações de número na interface. */
export function signed(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${MINUS}${Math.abs(value)}`;
  return "0";
}
