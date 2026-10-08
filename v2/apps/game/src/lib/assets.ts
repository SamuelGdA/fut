import {
  generatedLeagueBadge,
  teamCrestUrl,
  toArtLeague,
  trophyArtUrl,
} from "@craque/art";
import { type Award, type Club, type Competition, getClub, type League } from "@craque/world";
import { create } from "zustand";
import { ASSET_MODE, TROPHY_ASSET_MODE, type AssetMode } from "./env";

/**
 * De onde vem cada imagem do jogo (GDD 31.1).
 *
 * `real`: escudos, selos e troféus reais quando existem, e a arte gerada no
 * lugar dos que faltam. `gerado`: só a arte gerada. Bandeiras são sempre as
 * reais. Por padrão, escudos e selos são gerados, troféus e prêmios reais.
 * O modo vem do build; no laboratório dá para trocar em tempo real.
 */

interface AssetModeState {
  mode: AssetMode;
  trophyMode: AssetMode;
  /**
   * Troca o modo até a página recarregar. Só o laboratório chama isto, para
   * comparar as duas artes; o jogo usa sempre o modo do build.
   */
  setMode(mode: AssetMode): void;
  resetMode(): void;
}

export const useAssetMode = create<AssetModeState>()((set) => ({
  mode: ASSET_MODE,
  trophyMode: TROPHY_ASSET_MODE,
  setMode: (mode) => set({ mode, trophyMode: mode }),
  resetMode: () => set({ mode: ASSET_MODE, trophyMode: TROPHY_ASSET_MODE }),
}));

const BASE = import.meta.env.BASE_URL;

function publicAsset(path: string): string {
  return `${BASE}assets/${path}`;
}

export function flagUrl(iso2: string): string {
  return publicAsset(`flags/${iso2.toLowerCase()}.svg`);
}

export function clubCrestUrl(club: Club | string, mode: AssetMode): string {
  const resolved = typeof club === "string" ? getClub(club) : club;
  const id = typeof club === "string" ? club : club.id;
  if (mode === "real" && resolved?.crest) return publicAsset(`clubs/${resolved.id}.${resolved.crest}`);
  return teamCrestUrl(id) ?? "";
}

export function leagueLogoUrl(league: League, mode: AssetMode): string {
  if (mode === "real" && league.crest) return publicAsset(`leagues/${league.id}.${league.crest}`);
  return generatedLeagueBadge(toArtLeague(league));
}

export function competitionTrophyUrl(competition: Competition, mode: AssetMode): string {
  if (mode === "real" && competition.trophy) return publicAsset(competition.trophy);
  return trophyArtUrl(competition.art.key, competition.art.category);
}

export function awardImageUrl(award: Award, mode: AssetMode): string {
  if (mode === "real" && award.image) return publicAsset(award.image);
  return trophyArtUrl(award.art, "cup");
}

// ------------------------------------------------------------- arte de reserva

/**
 * A arte gerada que entra quando a imagem real não carrega (GDD 31 e 37,
 * invariante 16): sem internet e ainda fora do cache, um escudo nunca aparece
 * quebrado, aparece desenhado. Tudo aqui é gerado no próprio aparelho.
 */

export function generatedCrestUrl(club: Club | string): string {
  return teamCrestUrl(typeof club === "string" ? club : club.id) ?? "";
}

export function generatedLeagueUrl(league: League): string {
  return generatedLeagueBadge(toArtLeague(league));
}

export function generatedTrophyUrl(competition: Competition): string {
  return trophyArtUrl(competition.art.key, competition.art.category);
}

export function generatedAwardUrl(award: Award): string {
  return trophyArtUrl(award.art, "cup");
}

/** Bandeira de reserva: o código do país num retângulo neutro. As reais entram na instalação; esta é só a rede. */
export function generatedFlagUrl(iso2: string): string {
  const code = iso2.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30"><rect width="40" height="30" rx="2" fill="#25302b"/><text x="20" y="19.5" font-family="system-ui,sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="#eef1ea">${code}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
