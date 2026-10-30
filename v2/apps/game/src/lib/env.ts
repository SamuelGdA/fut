/** Modo de imagens escolhido no build (GDD 31.1). */
export type AssetMode = "real" | "gerado";

/**
 * D111: o padrão são os escudos e selos reais (era o desenhado, D46); onde
 * falta imagem real, entra o desenhado. `VITE_ASSETS=gerado` mostra só os
 * desenhados.
 */
export const ASSET_MODE: AssetMode = import.meta.env.VITE_ASSETS === "gerado" ? "gerado" : "real";

/** Troféus e prêmios preservam suas imagens reais; modo gerado explícito ainda permite comparar. */
export const TROPHY_ASSET_MODE: AssetMode = import.meta.env.VITE_ASSETS === "gerado" ? "gerado" : "real";

export const IS_DEV = import.meta.env.DEV;

/**
 * O endereço impresso no pôster (GDD 29.1). Sem `VITE_SITE_URL`, vale o
 * endereço de onde o jogo está sendo servido: nunca um domínio inventado.
 */
export function siteLabel(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return configured.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return typeof window === "undefined" ? "" : window.location.host;
}
