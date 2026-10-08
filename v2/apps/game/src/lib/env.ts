/** Modo de imagens escolhido no build (GDD 31.1). */
export type AssetMode = "real" | "gerado";

export const ASSET_MODE: AssetMode = import.meta.env.VITE_ASSETS === "gerado" ? "gerado" : "real";

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
