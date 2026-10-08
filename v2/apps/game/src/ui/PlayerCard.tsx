import type { AvatarConfig } from "@craque/art";
import type { Position, Six } from "@craque/engine";
import { getClubKit, getCountry, getCountryKit, getLeague } from "@craque/world";
import type { CSSProperties } from "react";
import { clubStyle, nationStyle } from "../features/career/clubColors";
import { ATTRIBUTE_SLOTS, attributeText } from "../i18n/attributes";
import { useT } from "../i18n/useT";
import { AnimatedNumber } from "./AnimatedNumber";
import { Avatar } from "./Avatar";
import { type CardTier, cardTier } from "./cardTier";
import { cn } from "./cn";
import { Crest, Flag, LeagueBadge } from "./Media";

/**
 * A carta do jogador (GDD 30 e D43), no desenho das cartas de videogame de
 * futebol, sem copiar nenhuma: silhueta de escudo com os cantos de cima
 * chanfrados e a ponta rasa embaixo, o material da faixa de OVR no corpo
 * inteiro e um filete por dentro. No alto à esquerda, o OVR e a posição; o
 * retrato ocupa o alto; embaixo, o nome, os seis atributos numa linha (sigla
 * em cima, número embaixo) e, no pé, bandeira, liga e escudo do clube. O
 * número da camisa fica discreto no alto à direita.
 *
 * O tamanho vem só de `--card-w` (px ou um comprimento CSS, como a carta que
 * mede a altura livre); tudo dentro é em `em`, imagens também. Com `animate`,
 * o OVR e os atributos contam até o valor novo quando mudam.
 */

export interface PlayerCardProps {
  surname: string;
  position: Position;
  /** `null` na carta de demonstração, antes da carreira existir. */
  ovr: number | null;
  attributes: Six | null;
  nationality: string | null;
  club: string | null;
  league: string | null;
  shirt: number | null;
  avatar: AvatarConfig | null;
  /** Largura em px, ou um comprimento CSS (a carta que mede a altura livre). Padrão 220. */
  width?: number | string;
  /** Faixa forçada (o laboratório mostra todas). */
  tier?: CardTier;
  /** O OVR e os atributos contam até o valor novo quando mudam. */
  animate?: boolean;
  /**
   * Selo carimbado na carta de compartilhar (D43): Difícil em vermelho,
   * Desafio em dourado. A carreira no Normal não leva selo.
   */
  seal?: { readonly kind: "hard" | "challenge"; readonly label: string } | null;
  className?: string;
}

export function PlayerCard({
  surname,
  position,
  ovr,
  attributes,
  nationality,
  club,
  league,
  shirt,
  avatar,
  width = 220,
  tier,
  animate = false,
  seal = null,
  className,
}: PlayerCardProps) {
  const { t, c, locale } = useT();
  const country = getCountry(nationality);
  const leagueData = getLeague(league);
  const kit = club ? getClubKit(club) : nationality ? getCountryKit(nationality) : null;
  const shownTier = tier ?? (ovr === null ? "bronze" : cardTier(ovr));
  const positionAbbr = c(`positionAbbr.${position}`);
  const style = { "--card-w": typeof width === "number" ? `${width}px` : width, ...(club ? clubStyle(club) : nationStyle(nationality)) } as CSSProperties;

  const label = [
    surname,
    c(`positions.${position}`),
    ovr === null ? null : `OVR ${ovr}`,
    country?.names[locale],
    t(`card.tiers.${shownTier}`),
    seal?.label,
  ]
    .filter(Boolean)
    .join(", ");

  const shown = (value: number) => (animate ? <AnimatedNumber value={value} showDelta={false} /> : value);

  return (
    <div className={cn("pcard", className)} data-tier={shownTier} style={style} role="img" aria-label={label}>
      <div className="pcard-face" aria-hidden="true">
        <svg className="pcard-rule" viewBox="0 0 100 140" preserveAspectRatio="none" focusable="false">
          <polygon points="10.5,3 89.5,3 97,10.5 97,121.5 50,136.6 3,121.5 3,10.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="pcard-portrait">
          <Avatar config={avatar} kit={kit} showBackground={false} className="h-full w-full" />
        </div>
        <div className="pcard-rating">
          <span className="pcard-ovr-num numeric">{ovr === null ? "?" : shown(ovr)}</span>
          <span className="pcard-pos">{positionAbbr}</span>
        </div>
        {shirt !== null ? <span className="pcard-shirt numeric">{shirt}</span> : null}
        {seal ? (
          <span className="pcard-seal" data-kind={seal.kind}>
            {seal.label}
          </span>
        ) : null}
        <div className="pcard-body">
          <p className="pcard-name">{surname || t("card.you")}</p>
          <dl className="pcard-attrs">
            {ATTRIBUTE_SLOTS.map((slot) => (
              <div key={slot}>
                <dt>{attributeText(t, position, slot, "abbr")}</dt>
                <dd className="numeric">{attributes ? shown(Math.round(attributes[slot] ?? 0)) : "?"}</dd>
              </div>
            ))}
          </dl>
          <div className="pcard-foot">
            {country ? (
              <span className="pcard-flag">
                <Flag country={country} size={40} language={locale} decorative fill />
              </span>
            ) : null}
            {leagueData ? (
              <span className="pcard-league">
                <LeagueBadge league={leagueData} size={36} decorative fill />
              </span>
            ) : null}
            {club ? (
              <span className="pcard-crest">
                <Crest club={club} size={44} decorative plain fill />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
