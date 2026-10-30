import type { CoverRecord } from "@craque/content";
import { Trophy } from "lucide-react";
import { useT } from "../../i18n/useT";

/** Estrelas da faixa no selo (D95): uma no clássico, quatro no lendário. */
const TIER_STARS = { entry: 1, rare: 2, epic: 3, legendary: 4 } as const;

/**
 * O selo de recorde do jornal (D94): carimbo dourado (superou) ou da cor da
 * faixa (igualou). Fica por cima da página, sem mudar a altura do jornal.
 * Desde a D95 o selo grande é uma medalha: faixa com o resultado, estrelas da
 * raridade, o nome do recorde e o duelo detentor × jogador em dois números
 * (D96: com o nome do jogador, não "Você").
 * `stamp` liga a batida do carimbo: só a página assentada carimba, nunca a
 * folha que ainda gira (senão ele chega antes do papel).
 */
export function RecordSeal({ record, player, compact = false, stamp = true }: { record: CoverRecord; player?: string; compact?: boolean; stamp?: boolean }) {
  const { t, number } = useT();
  if (compact) {
    const label = record.beaten ? t("career.play.recordBeaten") : t("career.play.recordMatched");
    return <span className="cover-record-badge" data-tier={record.tier} data-beaten={record.beaten || undefined}><Trophy size={11} aria-hidden="true" />{label}</span>;
  }
  const label = record.beaten ? t("career.play.recordBroken") : t("career.play.recordMatched");
  const score = t("career.play.recordScore", { holder: record.holder, mark: number(record.mark), value: number(record.value) });
  return (
    <div className="paper-record-seal" data-tier={record.tier} data-beaten={record.beaten || undefined} data-stamp={stamp || undefined} role="img" aria-label={`${label}. ${record.name}. ${score}`}>
      <span className="paper-record-stars" aria-hidden="true">
        {"★".repeat(TIER_STARS[record.tier])}
        <small>{t(`summary.records.tiers.${record.tier}`)}</small>
      </span>
      <span className="paper-record-label" aria-hidden="true"><Trophy size={13} aria-hidden="true" />{label}</span>
      <span className="paper-record-name" aria-hidden="true">{record.name}</span>
      <span className="paper-record-duel" aria-hidden="true">
        <span><b className="numeric">{number(record.mark)}</b><small>{record.holder}</small></span>
        <span data-you><b className="numeric">{number(record.value)}</b><small>{player ?? t("career.play.recordYou")}</small></span>
      </span>
      {record.more > 0 ? <span className="paper-record-more" aria-hidden="true">{t("career.play.recordMore", { count: record.more })}</span> : null}
    </div>
  );
}
