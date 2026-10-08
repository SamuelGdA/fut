import type { SeasonRecord } from "@craque/engine";
import { AWARDS, getCompetition } from "@craque/world";
import type { CSSProperties } from "react";
import { showcaseItems, showcaseLayout } from "../../features/summary/showcase";
import { useT } from "../../i18n/useT";
import { useElementWidth } from "../../lib/useElementWidth";
import { AwardArt, TrophyArt } from "../../ui/Media";

interface ShowcaseProps {
  history: readonly SeasonRecord[];
  /** Altura em que a coleção inteira deve caber. */
  maxHeight?: number;
  /** O maior tamanho de peça: poucas taças não viram taças gigantes (D43). */
  maxArt?: number;
}

/**
 * A vitrine (GDD 24.5): cada competição uma peça só, com ×N, e os anos no
 * título da peça. A grade mede a largura e escolhe o maior tamanho em que tudo
 * cabe; com dezenas de títulos as legendas saem antes de as peças encolherem
 * demais. As imagens carregam sob demanda e decodificam fora da thread
 * principal.
 */
export function Showcase({ history, maxHeight = 520, maxArt }: ShowcaseProps) {
  const { t, locale } = useT();
  const [ref, width] = useElementWidth(320);
  const items = showcaseItems(history);
  const layout = showcaseLayout(items.length, width, maxHeight, maxArt);

  if (items.length === 0) {
    return (
      <div ref={ref} className="shelf-empty text-sm">
        {t("career.trophies.empty")}
      </div>
    );
  }

  const style = {
    "--cell-w": `${layout.cellWidth}px`,
    "--cell-h": `${layout.cellHeight}px`,
  } as CSSProperties;

  return (
    <div ref={ref}>
      <ul className="showcase" style={style} data-labels={layout.labels || undefined} aria-label={t("summary.showcase")}>
        {items.map((item) => {
          const name = item.kind === "title" ? (getCompetition(item.id)?.names[locale] ?? item.id) : AWARDS[item.id].names[locale];
          const years = item.years.join(", ");
          const competition = item.kind === "title" ? getCompetition(item.id) : null;
          return (
            <li key={`${item.kind}-${item.id}`} className="showcase-item" data-kind={item.kind} title={`${name}: ${years}`}>
              <span className="showcase-art">
                {item.kind === "award" ? (
                  <AwardArt award={AWARDS[item.id]} size={layout.art} language={locale} decorative />
                ) : competition ? (
                  <TrophyArt competition={competition} size={layout.art} language={locale} decorative />
                ) : null}
                {item.count > 1 ? <span className="showcase-count numeric">{t("career.trophies.times", { count: item.count })}</span> : null}
              </span>
              {layout.labels ? (
                <span className="showcase-label">{name}</span>
              ) : (
                <span className="sr-only">{name}</span>
              )}
              <span className="sr-only">{t("summary.showcaseYears", { years })}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
