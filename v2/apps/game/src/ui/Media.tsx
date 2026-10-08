import {
  type Award,
  type Club,
  type Competition,
  type Country,
  getClub,
  type League,
  type Language,
} from "@craque/world";
import { useState } from "react";
import {
  awardImageUrl,
  clubCrestUrl,
  competitionTrophyUrl,
  flagUrl,
  generatedAwardUrl,
  generatedCrestUrl,
  generatedFlagUrl,
  generatedLeagueUrl,
  generatedTrophyUrl,
  leagueLogoUrl,
  useAssetMode,
} from "../lib/assets";
import { cn } from "./cn";

/**
 * Imagens do mundo: escudo, bandeira, selo de liga, troféu e prêmio. Todas com
 * tamanho explícito (nada pula quando a imagem chega), carregamento sob
 * demanda e texto alternativo. Quando a imagem é decorativa ao lado do nome,
 * passe `decorative` e o leitor de tela pula a imagem. Imagem real que não
 * carrega (sem internet e fora do cache) troca na hora pela arte gerada.
 */

interface BaseProps {
  size: number;
  className?: string;
  decorative?: boolean;
  /**
   * Ocupa a caixa do pai em vez de `size` px (a carta mede em `em`). `size`
   * continua dando a proporção e a reserva de espaço.
   */
  fill?: boolean;
}

function Picture({
  src,
  fallback,
  alt,
  width,
  height,
  className,
  decorative,
  fill = false,
  loading = "lazy",
}: {
  src: string;
  loading?: "lazy" | "eager";
  /** A arte gerada, se a real falhar. */
  fallback: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  decorative?: boolean;
  fill?: boolean;
}) {
  // Guarda qual endereço falhou: se o `src` mudar (outro clube), tenta o real de novo.
  const [failed, setFailed] = useState<string | null>(null);
  const current = failed === src && fallback ? fallback : src;
  return (
    <img
      src={current}
      onError={() => {
        if (fallback && current !== fallback) setFailed(src);
      }}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      draggable={false}
      className={cn("shrink-0 select-none object-contain", className)}
      style={fill ? { width: "100%", height: "100%" } : { width, height }}
    />
  );
}

/**
 * Escudo do clube. A partir de 20 px vem sobre um brilho radial bem leve
 * (pedido do produto no M1): escudo escuro continua legível em fundo escuro, e
 * escudo claro não ganha moldura visível. Abaixo disso o brilho não caberia e
 * o escudo vai puro. `plain` tira o brilho, para quando o escudo já está
 * sobre a cor do clube.
 */
export function Crest({
  club,
  size,
  className,
  decorative,
  plain = false,
  fill = false,
}: BaseProps & { club: Club | string; plain?: boolean }) {
  const mode = useAssetMode((state) => state.mode);
  const resolved = typeof club === "string" ? getClub(club) : club;
  const name = resolved?.name ?? (typeof club === "string" ? club : club.name);
  const bare = plain || size < 20;
  const inner = bare ? size : Math.round(size * 0.84);
  const picture = (
    <Picture
      src={clubCrestUrl(club, mode)}
      fallback={generatedCrestUrl(club)}
      alt={name}
      width={inner}
      height={inner}
      className={bare ? className : undefined}
      decorative={decorative}
      fill={bare && fill}
    />
  );
  if (bare) return picture;
  return (
    <span className={cn("crest-backdrop", className)} style={{ width: size, height: size }}>
      {picture}
    </span>
  );
}

export function Flag({
  country,
  size,
  className,
  decorative,
  language,
  fill,
}: BaseProps & { country: Country; language: Language }) {
  const height = Math.round((size * 3) / 4);
  return (
    <Picture
      src={flagUrl(country.iso2)}
      fallback={generatedFlagUrl(country.iso2)}
      alt={country.names[language]}
      width={size}
      height={height}
      className={cn("rounded-xs object-cover", className)}
      decorative={decorative}
      fill={fill}
    />
  );
}

export function LeagueBadge({ league, size, className, decorative, fill }: BaseProps & { league: League }) {
  const mode = useAssetMode((state) => state.mode);
  return (
    <Picture
      src={leagueLogoUrl(league, mode)}
      fallback={generatedLeagueUrl(league)}
      alt={league.name}
      width={size}
      height={size}
      className={className}
      decorative={decorative}
      fill={fill}
    />
  );
}

/** Troféus são mais altos que largos: a caixa segue a proporção 4:7 da arte. */
export function TrophyArt({
  competition,
  size,
  className,
  decorative,
  language,
}: BaseProps & { competition: Competition; language: Language }) {
  const mode = useAssetMode((state) => state.trophyMode);
  return (
    <Picture
      loading="eager"
      src={competitionTrophyUrl(competition, mode)}
      fallback={generatedTrophyUrl(competition)}
      alt={competition.names[language]}
      width={Math.round(size * 0.8)}
      height={size}
      className={className}
      decorative={decorative}
    />
  );
}

export function AwardArt({
  award,
  size,
  className,
  decorative,
  language,
}: BaseProps & { award: Award; language: Language }) {
  const mode = useAssetMode((state) => state.trophyMode);
  return (
    <Picture
      loading="eager"
      src={awardImageUrl(award, mode)}
      fallback={generatedAwardUrl(award)}
      alt={award.names[language]}
      width={Math.round(size * 0.8)}
      height={size}
      className={className}
      decorative={decorative}
    />
  );
}
