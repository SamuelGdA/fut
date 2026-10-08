/** As faixas de raridade da carta (GDD 30), pelo OVR. */
export const CARD_TIERS = ["bronze", "silver", "gold", "elite", "legend"] as const;
export type CardTier = (typeof CARD_TIERS)[number];

export function cardTier(ovr: number): CardTier {
  if (ovr >= 92) return "legend";
  if (ovr >= 85) return "elite";
  if (ovr >= 75) return "gold";
  if (ovr >= 65) return "silver";
  return "bronze";
}
