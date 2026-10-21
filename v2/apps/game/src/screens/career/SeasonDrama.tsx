import { dramaAction, dramaText, matchResultText } from "@craque/content";
import type { SeasonRecord } from "@craque/engine";
import { Check, Minus } from "lucide-react";
import { useT } from "../../i18n/useT";
import { d74 } from "../../i18n/d74";
import { promiseSpan } from "../../i18n/d78";

/** O mesmo registro acompanha a temporada e a folha de bastidores do jornal. */
export function SeasonDrama({ record, matches = true }: { record: SeasonRecord; matches?: boolean }) {
  const { locale, number } = useT();
  const copy = dramaText(locale); const text = d74(locale);
  const promise = record.promise;
  return <div className="season-drama">
    {promise ? <section className="season-promise" data-fulfilled={promise.fulfilled}>
      <div className="promise-heading"><span className="promise-seal" aria-hidden="true">{promise.fulfilled ? <Check size={18} /> : <Minus size={18} />}</span><div><p className="eyebrow">{dramaAction(locale, promise.level)}</p><h3>{promise.fulfilled ? text.promiseKept : text.promiseMiss}</h3></div></div>
      <p className="promise-target-label">{text.promiseGoal}</p><p className="promise-achieved"><b>{number(promise.actual)}</b><span>/ {number(promise.target)}</span> <small>{copy[promise.metric === "glory" ? "glory" : promise.metric]}</small></p>
      {promise.throughYear && promise.throughYear > promise.year ? <p className="promise-period">{promiseSpan(locale, promise.year, promise.throughYear)}</p> : null}
      <div className="promise-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, 100 * promise.actual / promise.target)}%` }} /></div>
      {promise.fulfilled ? <div className="promise-rewards">{promise.fans > 0 ? <span>+{promise.fans} {copy.fans}</span> : null}{promise.legacy > 0 ? <span>+{promise.legacy} {copy.legacy}</span> : null}{promise.capacity > 0 ? <span>+{number(promise.capacity, { maximumFractionDigits: 1 })} {copy.evolution}</span> : null}</div> : null}
    </section> : null}
    {record.veteranChosen && record.veteran ? <p className="eyebrow">{copy.veteran}: {dramaAction(locale, record.veteran, record.position)}</p> : null}
    {matches && record.keyMatches?.map((result) => <p className="season-key-result" key={result.match.competition}><strong>{result.success ? copy.success : copy.failure}</strong> {matchResultText(locale, result)}</p>)}
  </div>;
}

/** A conclusão fica à vista; a folha de detalhes conserva metas e recompensas completas. */
export function PromiseSummary({ record }: { record: SeasonRecord }) {
  const { locale, number } = useT();
  const promise = record.promise;
  if (!promise) return null;
  const copy = dramaText(locale); const text = d74(locale);
  return <div className="promise-summary" data-fulfilled={promise.fulfilled} role="status">
    <span aria-hidden="true">{promise.fulfilled ? <Check size={16} /> : <Minus size={16} />}</span>
    <div><strong>{promise.fulfilled ? text.promiseKept : text.promiseMiss}</strong><p>{number(promise.actual)} / {number(promise.target)} {copy[promise.metric]}</p></div>
  </div>;
}
