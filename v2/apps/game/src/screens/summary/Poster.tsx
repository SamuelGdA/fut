import type { AvatarConfig } from "@craque/art";
import { stintsOf } from "@craque/content";
import type { Career } from "@craque/engine";
import { AWARDS, getClub, getCompetition, getCountry } from "@craque/world";
import { type CSSProperties, type Ref } from "react";
import { clubStyle } from "../../features/career/clubColors";
import { challengeOf } from "../../features/hall/session";
import { showcaseItems } from "../../features/summary/showcase";
import { ovrCurve, peakCard, posterNumbers } from "../../features/summary/summaryData";
import { useT } from "../../i18n/useT";
import { siteLabel } from "../../lib/env";
import { AwardArt, Crest, Flag, TrophyArt } from "../../ui/Media";
import { PitchMark } from "../../ui/PitchMark";
import { PlayerCard } from "../../ui/PlayerCard";

interface PosterProps {
  career: Career;
  avatar: AvatarConfig | null;
  showSurname: boolean;
  ref?: Ref<HTMLDivElement>;
}

/** Peças da vitrine que cabem na faixa do pôster. */
const POSTER_SHOWCASE = 7;
/** Clubes principais (os de mais temporadas). */
const POSTER_CLUBS = 3;

/**
 * O pôster (GDD 29.1): 1080 × 1350, paleta escura fixa (vale nos dois temas),
 * margem de 60 px e tudo em posição conhecida: marca e selo, carta do auge,
 * sobrenome (pode sair), país e posição, seis números, valor de pico, vitrine
 * resumida, clubes principais, curva do OVR e o rodapé com o endereço.
 */
export function Poster({ career, avatar, showSurname, ref }: PosterProps) {
  const { t, c, number, money, locale } = useT();
  const peak = peakCard(career);
  const country = getCountry(career.nationality);
  const surname = career.setup.identity.surname;
  const numbers = posterNumbers(career);
  const items = showcaseItems(career.history).slice(0, POSTER_SHOWCASE);
  const extra = showcaseItems(career.history).length - items.length;
  const peakValue = Math.max(0, ...career.history.map((record) => record.marketValue));
  const first = career.history[0];
  const last = career.history[career.history.length - 1];

  // Clubes principais: a soma das passagens por clube, os de mais temporadas.
  const seasonsByClub = new Map<string, { seasons: number; from: number; to: number }>();
  for (const stint of stintsOf(career.history)) {
    const current = seasonsByClub.get(stint.club);
    seasonsByClub.set(stint.club, {
      seasons: (current?.seasons ?? 0) + stint.seasons,
      from: Math.min(current?.from ?? stint.fromYear, stint.fromYear),
      to: Math.max(current?.to ?? stint.toYear, stint.toYear),
    });
  }
  const clubs = [...seasonsByClub]
    .sort((a, b) => b[1].seasons - a[1].seasons || a[1].from - b[1].from)
    .slice(0, POSTER_CLUBS);

  const titleSize = surname.length <= 8 ? 128 : surname.length <= 11 ? 100 : 78;
  const curve = ovrCurve(career.history);
  const challenge = challengeOf(career);

  return (
    <div ref={ref} className="poster" data-theme="dark" style={clubStyle(peak?.club ?? null) as CSSProperties}>
      <header className="poster-top">
        <span className="poster-brand">
          <PitchMark className="poster-brand-mark" />
          <span className="poster-wordmark">{t("app.name")}</span>
          <span className="poster-tagline">{t("app.tagline")}</span>
        </span>
        {challenge ? (
          // O selo do desafio, dourado, vence o vermelho do Difícil (todo desafio é Difícil).
          <span className="poster-seal" data-kind="challenge">
            {t("summary.poster.challenge", { score: challenge.total })}
          </span>
        ) : career.setup.difficulty === "hard" ? (
          <span className="poster-seal">{t("summary.poster.hard")}</span>
        ) : null}
      </header>

      <section className="poster-hero">
        {peak ? (
          <PlayerCard
            surname={showSurname ? surname : t("app.name")}
            position={peak.position}
            ovr={peak.ovrEnd}
            attributes={peak.attributes}
            nationality={peak.nationality}
            club={peak.club}
            league={peak.league}
            shirt={peak.shirt}
            avatar={avatar}
            width={380}
            seal={
              challenge
                ? { kind: "challenge", label: t("summary.poster.challenge", { score: challenge.total }) }
                : career.setup.difficulty === "hard"
                  ? { kind: "hard", label: t("summary.poster.hard") }
                  : null
            }
          />
        ) : null}
        <div className="poster-identity">
          <p className="poster-eyebrow">
            {first && last ? t("summary.years", { from: first.year, to: last.year }) : t("summary.eyebrow")}
          </p>
          <p className="poster-surname" style={{ fontSize: titleSize }}>
            {showSurname ? surname : c(`positions.${career.player.position}`)}
          </p>
          <p className="poster-origin">
            {country ? <Flag country={country} size={44} language={locale} decorative /> : null}
            <span>{country?.names[locale]}</span>
            <span aria-hidden="true">·</span>
            <span>{c(`positions.${career.player.position}`)}</span>
          </p>
          <dl className="poster-numbers">
            {numbers.map((item) => (
              <div key={item.key}>
                <dt>{t(`summary.numbers.${item.key}`)}</dt>
                <dd>{number(item.value)}</dd>
              </div>
            ))}
          </dl>
          <p className="poster-value">
            <span>{t("summary.numbers.peakValue")}</span>
            <strong>{money(peakValue)}</strong>
          </p>
        </div>
      </section>

      <section className="poster-block">
        <p className="poster-label">{t("summary.poster.showcase")}</p>
        {items.length > 0 ? (
          <ul className="poster-showcase">
            {items.map((item) => {
              const competition = item.kind === "title" ? getCompetition(item.id) : null;
              return (
                <li key={`${item.kind}-${item.id}`}>
                  {item.kind === "award" ? (
                    <AwardArt award={AWARDS[item.id]} size={104} language={locale} decorative />
                  ) : competition ? (
                    <TrophyArt competition={competition} size={104} language={locale} decorative />
                  ) : null}
                  {item.count > 1 ? <span className="poster-count">×{item.count}</span> : null}
                </li>
              );
            })}
            {extra > 0 ? <li className="poster-more">+{extra}</li> : null}
          </ul>
        ) : (
          <p className="poster-empty">{t("summary.poster.noTitles")}</p>
        )}
      </section>

      <section className="poster-block">
        <p className="poster-label">{t("summary.poster.clubs")}</p>
        <ul className="poster-clubs">
          {clubs.map(([club, span]) => (
            <li key={club}>
              <Crest club={club} size={68} decorative />
              <span>
                <strong>{getClub(club)?.name ?? club}</strong>
                <small>{span.from === span.to ? span.from : t("summary.years", { from: span.from, to: span.to })}</small>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {curve.length >= 3 ? (
        <section className="poster-block">
          <p className="poster-label">{t("summary.poster.curve")}</p>
          <OvrCurve points={curve.map((point) => point.ovr)} peak={peak?.ovrEnd ?? 0} width={960} height={104} />
        </section>
      ) : null}

      <footer className="poster-foot">
        <span>{siteLabel() ? t("summary.poster.footer", { site: siteLabel() }) : t("app.name")}</span>
        {peak ? <span>{t("summary.poster.peak", { ovr: peak.ovrEnd, age: peak.age })}</span> : null}
      </footer>
    </div>
  );
}

/** A curva do OVR, com o pico marcado. Usada no pôster e no resumo. */
export function OvrCurve({ points, peak, width, height }: { points: readonly number[]; peak: number; width: number; height: number }) {
  const min = Math.min(...points) - 3;
  const max = Math.max(...points) + 3;
  const pad = 8;
  const x = (index: number) => pad + (index * (width - pad * 2)) / Math.max(1, points.length - 1);
  const y = (value: number) => pad + (1 - (value - min) / Math.max(1, max - min)) * (height - pad * 2);
  const line = points.map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;
  const peakIndex = points.indexOf(peak);
  return (
    <svg className="ovr-curve" viewBox={`0 0 ${width} ${height}`} width="100%" aria-hidden="true">
      <path d={area} className="ovr-curve-area" />
      <path d={line} className="ovr-curve-line" vectorEffect="non-scaling-stroke" />
      {peakIndex >= 0 ? <circle cx={x(peakIndex)} cy={y(peak)} r={7} className="ovr-curve-peak" /> : null}
    </svg>
  );
}
