import type { AvatarConfig } from "@craque/art";
import { stintsOf } from "@craque/content";
import type { Career } from "@craque/engine";
import { AWARDS, getCompetition, getCountry } from "@craque/world";
import { type CSSProperties, type Ref } from "react";
import { clubStyle } from "../../features/career/clubColors";
import { challengeOf } from "../../features/hall/session";
import { SHARE_HEIGHT, SHARE_WIDTH, shareHighlights, shareShelf } from "../../features/summary/shareCard";
import { peakCard, posterNumbers } from "../../features/summary/summaryData";
import { useT } from "../../i18n/useT";
import { siteLabel } from "../../lib/env";
import { AwardArt, Crest, Flag, TrophyArt } from "../../ui/Media";
import { PitchMark } from "../../ui/PitchMark";
import { PlayerCard } from "../../ui/PlayerCard";

interface ShareCardProps {
  career: Career;
  avatar: AvatarConfig | null;
  showSurname: boolean;
  ref?: Ref<HTMLDivElement>;
}

/** Clubes no rodapé (os de mais temporadas). */
const SHARE_CLUBS = 4;
/** Largura da faixa de destaques, em pixels da imagem. */
const SHELF_WIDTH = 800;

/**
 * A imagem compartilhável da carreira (D118): 1200 × 630, paleta escura fixa
 * nos dois temas. À esquerda, a carta do auge; à direita, o nome, os seis
 * números e os destaques (prêmios individuais primeiro, depois os títulos);
 * embaixo, os clubes principais e a marca com o endereço do jogo.
 */
export function ShareCard({ career, avatar, showSurname, ref }: ShareCardProps) {
  const { t, c, number, locale } = useT();
  const peak = peakCard(career);
  const country = getCountry(career.nationality);
  const surname = career.setup.identity.surname;
  const numbers = posterNumbers(career);
  const highlights = shareHighlights(career.history);
  const shelf = shareShelf(highlights.length, SHELF_WIDTH);
  const first = career.history[0];
  const last = career.history[career.history.length - 1];
  const challenge = challengeOf(career);
  const name = showSurname ? surname : c(`positions.${career.player.position}`);
  const titleSize = name.length <= 8 ? 112 : name.length <= 11 ? 90 : name.length <= 15 ? 70 : 56;

  const seasonsByClub = new Map<string, { seasons: number; from: number }>();
  for (const stint of stintsOf(career.history)) {
    const current = seasonsByClub.get(stint.club);
    seasonsByClub.set(stint.club, { seasons: (current?.seasons ?? 0) + stint.seasons, from: Math.min(current?.from ?? stint.fromYear, stint.fromYear) });
  }
  const clubs = [...seasonsByClub].sort((a, b) => b[1].seasons - a[1].seasons || a[1].from - b[1].from).slice(0, SHARE_CLUBS);
  const site = siteLabel();

  return (
    <div ref={ref} className="share-card" data-theme="dark" style={{ ...clubStyle(peak?.club ?? null), width: SHARE_WIDTH, height: SHARE_HEIGHT } as CSSProperties}>
      <div className="share-card-side">
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
            width={262}
            seal={
              challenge
                ? { kind: "challenge", label: t("summary.poster.challenge", { score: challenge.total }) }
                : career.setup.difficulty === "hard"
                  ? { kind: "hard", label: t("summary.poster.hard") }
                  : null
            }
          />
        ) : null}
        {peak ? <p className="share-card-peak">{t("summary.poster.peak", { ovr: peak.ovrEnd, age: peak.age })}</p> : null}
      </div>

      <div className="share-card-main">
        <header className="share-card-top">
          <span className="share-card-brand">
            <PitchMark className="share-card-mark" />
            <span className="share-card-wordmark">{t("brand.name")}</span>
            <span className="share-card-mode">{t("app.name")}</span>
          </span>
          {challenge ? (
            <span className="share-card-seal" data-kind="challenge">{t("summary.poster.challenge", { score: challenge.total })}</span>
          ) : career.setup.difficulty === "hard" ? (
            <span className="share-card-seal">{t("summary.poster.hard")}</span>
          ) : null}
        </header>

        <div className="share-card-identity">
          <p className="share-card-eyebrow">
            {country ? <Flag country={country} size={30} language={locale} decorative /> : null}
            <span>{country?.names[locale]}</span>
            <span aria-hidden="true">·</span>
            <span>{c(`positions.${career.player.position}`)}</span>
            {first && last ? <><span aria-hidden="true">·</span><span>{t("summary.years", { from: first.year, to: last.year })}</span></> : null}
          </p>
          <p className="share-card-name" style={{ fontSize: titleSize }}>{name}</p>
        </div>

        <dl className="share-card-numbers">
          {numbers.map((item) => (
            <div key={item.key}>
              <dt>{t(`summary.numbers.${item.key}`)}</dt>
              <dd>{number(item.value)}</dd>
            </div>
          ))}
        </dl>

        <section className="share-card-shelf" style={{ "--share-art": `${shelf.art}px` } as CSSProperties}>
          <p className="share-card-label">{t("summary.poster.highlights")}</p>
          {highlights.length > 0 ? (
            <ul>
              {highlights.slice(0, shelf.shown).map((item) => {
                const competition = item.kind === "title" ? getCompetition(item.id) : null;
                const label = item.kind === "title" ? competition?.names[locale] ?? item.id : AWARDS[item.id].names[locale];
                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <span className="share-card-art">
                      {item.kind === "award" ? (
                        <AwardArt award={AWARDS[item.id]} size={shelf.art} language={locale} decorative />
                      ) : competition ? (
                        <TrophyArt competition={competition} size={shelf.art} language={locale} decorative />
                      ) : null}
                      {item.count > 1 ? <span className="share-card-count">×{item.count}</span> : null}
                    </span>
                    <span className="share-card-trophy">{label}</span>
                  </li>
                );
              })}
              {shelf.more > 0 ? <li className="share-card-more">+{shelf.more}</li> : null}
            </ul>
          ) : (
            <p className="share-card-empty">{t("summary.poster.noTitles")}</p>
          )}
        </section>
      </div>

      <footer className="share-card-foot">
        <div className="share-card-clubs">
          <span>{t("summary.poster.clubs")}</span>
          <ul>
            {clubs.map(([club]) => (
              <li key={club}><Crest club={club} size={38} decorative /></li>
            ))}
          </ul>
        </div>
        <span>{site ? t("summary.poster.footer", { site }) : t("brand.name")}</span>
      </footer>
    </div>
  );
}
