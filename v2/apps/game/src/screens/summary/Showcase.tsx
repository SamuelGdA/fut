import type { SeasonRecord } from "@craque/engine";
import { AWARDS, getCompetition } from "@craque/world";
import { useState, type CSSProperties } from "react";
import { showcaseItems, showcaseLayout, type ShowcaseItem } from "../../features/summary/showcase";
import { useT } from "../../i18n/useT";
import { useElementWidth } from "../../lib/useElementWidth";
import { Sheet } from "../../ui/Overlays";
import { AwardArt, TrophyArt } from "../../ui/Media";

interface ShowcaseProps {
  history: readonly SeasonRecord[];
  /** Altura em que a coleção inteira deve caber. */
  maxHeight?: number;
  /** O maior tamanho de peça: poucas taças não viram taças gigantes (D43). */
  maxArt?: number;
  kind?: "title" | "award";
}

/**
 * A vitrine (GDD 24.5): cada competição uma peça só, com ×N, e os anos no
 * título da peça. A grade mede a largura e escolhe o maior tamanho em que tudo
 * cabe; com dezenas de títulos as legendas saem antes de as peças encolherem
 * demais. As imagens carregam sob demanda e decodificam fora da thread
 * principal.
 */
export function Showcase({ history, maxHeight = 520, maxArt, kind }: ShowcaseProps) {
  const { t, locale } = useT();
  const [selected, setSelected] = useState<ShowcaseItem | null>(null);
  const nameOf = (item: ShowcaseItem) => item.kind === "title" ? (getCompetition(item.id)?.names[locale] ?? item.id) : `${AWARDS[item.id].names[locale]}${item.competition ? ` · ${getCompetition(item.competition)?.names[locale] ?? item.competition}` : ""}`;
  const [ref, width] = useElementWidth(320);
  const items = showcaseItems(history).filter((item) => !kind || item.kind === kind);
  const layout = showcaseLayout(items.length, width, maxHeight, maxArt, kind !== undefined);

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
          const name = nameOf(item);
          const years = item.years.join(", ");
          const competition = item.kind === "title" ? getCompetition(item.id) : null;
          return (
            <li key={`${item.kind}-${item.id}-${item.kind === "award" ? item.competition ?? "" : ""}`} className="showcase-cell">
              <button type="button" className="showcase-item" data-kind={item.kind} aria-label={`${name}: ${years} · ×${item.count}`} title={`${name}: ${years}`} onClick={() => setSelected(item)}>
              <span className="showcase-art">
                {item.kind === "award" ? (
                  <AwardArt award={AWARDS[item.id]} size={layout.art} language={locale} tooltip={`${name}: ${years}`} decorative />
                ) : competition ? (
                  <TrophyArt competition={competition} size={layout.art} language={locale} tooltip={`${name}: ${years}`} decorative />
                ) : null}
                {item.count > 1 ? <span className="showcase-count numeric">{t("career.trophies.times", { count: item.count })}</span> : null}
              </span>
              {layout.labels ? (
                <span className="showcase-label" data-competition={item.kind === "award" && !!item.competition || undefined}>
                  {item.kind === "award" && item.competition ? <><span>{AWARDS[item.id].names[locale]}</span><span className="showcase-competition">{getCompetition(item.competition)?.names[locale] ?? item.competition}</span></> : name}
                </span>
              ) : (
                <span className="sr-only">{name}</span>
              )}
              <span className="sr-only">{t("summary.showcaseYears", { years })}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }} title={selected ? nameOf(selected) : ""} closeLabel={t("common.close")}>
        {selected ? <div className="grid justify-items-center gap-4">{selected.kind === "award" ? <AwardArt award={AWARDS[selected.id]} size={160} language={locale} decorative /> : getCompetition(selected.id) ? <TrophyArt competition={getCompetition(selected.id)!} size={160} language={locale} decorative /> : null}<p className="numeric text-sm">{t("summary.showcaseYears", { years: selected.years.join(", ") })} · ×{selected.count}</p></div> : null}
      </Sheet>
    </div>
  );
}
