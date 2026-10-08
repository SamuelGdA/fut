/** Vibração curta onde o aparelho e o navegador permitem (GDD 33.3). */

export type Haptic = "tap" | "success" | "trophy" | "heavy";

const PATTERNS: Readonly<Record<Haptic, number | number[]>> = {
  tap: 8,
  success: [10, 40, 16],
  trophy: [16, 50, 16, 50, 36],
  heavy: 50,
};

/**
 * Só aparelhos de toque vibram de verdade. Navegadores de desktop expõem
 * `navigator.vibrate` e simplesmente ignoram a chamada, e oferecer o ajuste lá
 * seria um interruptor que não faz nada.
 */
export function canVibrate(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function" &&
    navigator.maxTouchPoints > 0
  );
}

export function vibrate(haptic: Haptic): void {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(PATTERNS[haptic]);
  } catch {
    // Alguns navegadores lançam exceção sem gesto do usuário; ignorar é certo.
  }
}
