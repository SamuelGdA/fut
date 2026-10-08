/**
 * Troféus gerados que só o v2 precisa (arquivo novo, não portado).
 *
 * A tabela portada do v1 (`TROPHY_ART`) só cobre competições que nunca tiveram
 * foto. No modo de imagens "gerado" (GDD 31.1) toda competição precisa da sua
 * peça, senão todas as copas nacionais sairiam como a mesma taça prateada e
 * todas as ligas como a mesma taça dourada. Esta tabela completa o conjunto:
 * prêmios individuais, copas e ligas que tinham foto, continentais
 * principais, torneios de seleções e os dois mundiais. Um teste garante que
 * nenhuma competição repete a arte de outra.
 *
 * As marcas gravadas ficam em ASCII: um caractere acentuado dentro de uma
 * imagem embutida quebra a imagem.
 */

import { generatedTrophyUrl, TROPHY_ART, type TrophyArtCategory } from "./index";
import { trophyDataUri, type TrophySpec } from "./render";

const spec = (
  shape: TrophySpec["shape"],
  metal: TrophySpec["metal"],
  accent: string,
  mark?: string,
): TrophySpec => ({ shape, metal, accent, mark });

export const EXTRA_TROPHY_ART: Readonly<Record<string, TrophySpec>> = {
  // --- Prêmios individuais ---
  "award:ballon-dor": spec("bowl", "gold", "#8a6a1f", "BO"),
  "award:golden-glove": spec("cup", "gold", "#1d3f8f", "GG"),
  "award:golden-shoe": spec("cup", "gold", "#7a1f2b", "GS"),
  "award:young-player": spec("chalice", "silver", "#0b7a3b", "U21"),
  "award:top-scorer": spec("cup", "bronze", "#8f3b1d", "TOP"),
  "award:best-player": spec("chalice", "gold", "#4b2a86", "MVP"),

  // --- Copas nacionais que tinham foto ---
  "cup:ARG": spec("cup", "silver", "#6cace4", "AR"),
  "cup:BRA": spec("cup", "gold", "#0f9d55", "BR"),
  "cup:CHI": spec("cup", "silver", "#c8102e", "CL"),
  "cup:COL": spec("cup", "gold", "#f5c400", "CO"),
  "cup:ECU": spec("cup", "gold", "#0b2d7a", "EC"),
  "cup:ENG": spec("cup", "silver", "#1d3f8f", "FA"),
  "cup:ESP": spec("cup", "silver", "#c60b1e", "ES"),
  "cup:FRA": spec("cup", "silver", "#0b2d7a", "FR"),
  "cup:GER": spec("cup", "gold", "#12161c", "DE"),
  "cup:ITA": spec("cup", "silver", "#0b7a3b", "IT"),
  "cup:PAR": spec("cup", "silver", "#c8102e", "PY"),
  "cup:URU": spec("cup", "silver", "#6cace4", "UY"),
  "cup:USA": spec("cup", "silver", "#0a3161", "US"),
  "cup:VEN": spec("cup", "gold", "#7a1f2b", "VE"),

  // --- Ligas que tinham foto ---
  // Primeira divisão em ouro (a Bundesliga é uma salva, como a real),
  // segunda divisão em prata, igual às segundas divisões da tabela do v1.
  "league:liga-profesional": spec("chalice", "silver", "#6cace4", "LPF"),
  "league:primera-nacional": spec("cup", "silver", "#6cace4", "PN"),
  "league:brasileirao": spec("bowl", "gold", "#0f9d55", "BR"),
  "league:brasileirao-serie-b": spec("cup", "silver", "#0f9d55", "BR-B"),
  "league:liga-de-primera": spec("chalice", "gold", "#c8102e", "CL"),
  "league:liga-dimayor": spec("bowl", "gold", "#f5c400", "COL"),
  "league:ligapro-serie-a": spec("chalice", "gold", "#0b2d7a", "LPA"),
  "league:premier-league": spec("cup", "gold", "#3d195b", "PL"),
  "league:championship": spec("chalice", "silver", "#0b6b8f", "CHP"),
  "league:laliga": spec("chalice", "silver", "#ff4b44", "LL"),
  "league:laliga-2": spec("cup", "silver", "#c60b1e", "LL2"),
  "league:ligue-1": spec("bowl", "silver", "#0b2d7a", "L1"),
  "league:ligue-2": spec("cup", "silver", "#0b2d7a", "L2"),
  "league:bundesliga": spec("salver", "silver", "#d20515", "BL"),
  "league:2-bundesliga": spec("cup", "silver", "#12161c", "2BL"),
  "league:serie-a": spec("cup", "gold", "#0b7a3b", "SA"),
  "league:serie-b": spec("cup", "silver", "#0b7a3b", "SB"),
  "league:liga-mx": spec("chalice", "gold", "#0b6b3a", "MX"),
  "league:copa-de-primera": spec("bowl", "gold", "#c8102e", "PY"),
  "league:liga1": spec("cup", "gold", "#c8102e", "PE"),
  "league:liga-uruguaya": spec("chalice", "silver", "#6cace4", "UY"),
  "league:usa-mls": spec("chalice", "silver", "#0a3161", "MLS"),
  "league:liga-futve": spec("bowl", "gold", "#7a1f2b", "VE"),

  // --- Continentais principais ---
  "cont:UEFA:continental_primary": spec("chalice", "silver", "#0b1f5c", "UCL"),
  "cont:UEFA:continental_secondary": spec("chalice", "silver", "#e8650c", "UEL"),
  "cont:CONMEBOL:continental_primary": spec("chalice", "silver", "#0b6b3a", "LIB"),
  "cont:CONMEBOL:continental_secondary": spec("chalice", "silver", "#0b6b8f", "SUD"),
  "cont:CONCACAF:continental_primary": spec("chalice", "silver", "#12161c", "CCC"),

  // --- Seleções e mundiais ---
  "nations:UEFA": spec("cup", "silver", "#0b2d7a", "EURO"),
  "nations:CONMEBOL": spec("cup", "gold", "#0b6b3a", "CA"),
  "nations:CONCACAF": spec("cup", "gold", "#c8102e", "GC"),
  "nations:CAF": spec("cup", "gold", "#0b7a3b", "AFCN"),
  "nations:AFC": spec("cup", "silver", "#7a1f2b", "ASIA"),
  "nations:OFC": spec("cup", "silver", "#0b6b8f", "OFC"),
  worldcup: spec("chalice", "gold", "#0b7a3b", "WC"),
  clubworldcup: spec("chalice", "gold", "#1d3f8f", "CWC"),
};

/**
 * Arte gerada de qualquer competição ou prêmio: primeiro a tabela do v1, depois
 * esta, e por fim a silhueta da categoria. Sempre devolve uma imagem.
 */
export function trophyArtUrl(artKey: string | null | undefined, category: TrophyArtCategory = "cup"): string {
  if (artKey && TROPHY_ART[artKey]) return generatedTrophyUrl(artKey, category);
  const extra = artKey ? EXTRA_TROPHY_ART[artKey] : undefined;
  if (extra) return trophyDataUri(extra);
  return generatedTrophyUrl(null, category);
}
