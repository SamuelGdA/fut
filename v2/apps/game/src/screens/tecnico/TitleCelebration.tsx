import { getCompetition } from "@craque/world";
import { useReducedMotion } from "motion/react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { revisionText } from "../../i18n/tecnico/revision";
import { Confetti } from "../../ui/Confetti";
import { TrophyArt } from "../../ui/Media";

/** A conquista ocupa o centro do relatório, com a mesma taça do Craque. */
export function TitleCelebration({ titles, year }: { titles: readonly string[]; year: number }) {
  const t = useTecnicoT(), reduced = useReducedMotion();
  if (!titles.length) return null;
  return <section className="tec-title-celebration" aria-label={`${revisionText(t.locale, "champion")} ${year}`}><div className="tec-title-beams" aria-hidden="true" /><p className="eyebrow text-glory">★ {revisionText(t.locale, "champion")} · {year}</p><div className="tec-title-pieces">{titles.map((id, index) => {
    const competition = getCompetition(id);
    return <div key={id} className="tec-title-piece" style={{ animationDelay: `${index * 100}ms` }}>{competition ? <TrophyArt competition={competition} size={100} language={t.locale} decorative /> : null}<strong>{competition?.names[t.locale] ?? id}</strong></div>;
  })}</div>{!reduced ? <Confetti burst={year} count={36} /> : null}</section>;
}
