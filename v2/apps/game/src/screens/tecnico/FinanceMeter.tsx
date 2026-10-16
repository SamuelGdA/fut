import { m, useReducedMotion } from "motion/react";
import { InfoTip } from "../../ui/InfoTip";
import type { TecnicoTranslator } from "../../i18n/tecnico/useTecnicoT";

/** A projeção inclui o excedente na escala; vermelho nunca esconde uma dívida. */
export function FinanceMeter({ label, used, limit, pending = 0, t }: { label: string; used: number; limit: number; pending?: number; t: TecnicoTranslator }) {
  const reduced = useReducedMotion() === true;
  const total = Math.max(0, used + pending);
  const cap = Math.max(0, limit);
  const scale = Math.max(1, cap, total);
  const current = Math.min(cap, total, Math.max(0, used));
  const proposed = Math.max(0, Math.min(cap, total) - current);
  const excess = Math.max(0, total - cap);
  const remaining = Math.max(0, cap - total);
  const summary = t.tt(excess > 0 ? "ux.excess" : "ux.remaining", { money: t.money(excess > 0 ? excess : remaining) });
  const help = [t.tt("club.budget"), t.tt("header.budget")].includes(label) ? "ux.budgetHelp" : label === t.tt("club.wages") ? "ux.wageHelp" : "ux.cashHelp";
  return (
    <div className="tec-finance-meter" data-over={excess > 0 || undefined}>
      <div className="tec-finance-label"><span className="tec-fact-label">{label}<InfoTip label={label}>{t.tt(help)}</InfoTip></span><strong className="numeric">{t.money(total)} / {t.money(cap)}</strong></div>
      <div className="tec-finance-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={scale} aria-valuenow={total} aria-valuetext={`${t.money(total)} / ${t.money(cap)}. ${summary}`}>
        {[current, proposed, excess].map((amount, index) => <m.span key={index} data-part={index} initial={false} animate={{ width: `${amount / scale * 100}%` }} transition={{ duration: reduced ? 0 : 0.35 }} />)}
        {excess > 0 ? <span className="tec-finance-limit" style={{ left: `${cap / scale * 100}%` }} /> : null}
      </div>
      <p className="tec-finance-summary"><span aria-hidden="true">{excess > 0 ? "▼" : "●"}</span> {summary}</p>
    </div>
  );
}
