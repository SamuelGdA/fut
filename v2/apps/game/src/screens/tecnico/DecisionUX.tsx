import type { EventEffect } from "@craque/engine/coach";
import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { TecnicoTranslator } from "../../i18n/tecnico/useTecnicoT";
import { EffectChips } from "./shared";

/** Exibe os dois lados da decisão usando os efeitos reais, sem inventar chances. */
export function RiskPreview({ chance, success, failure, t }: { chance: number | null; success: readonly EventEffect[]; failure: readonly EventEffect[]; t: TecnicoTranslator }) {
  return (
    <span className="tec-risk-preview">
      <span className="tec-risk-heading">
        <span>{t.tt(chance === null ? "ux.tradeoff" : "ux.upside")}</span>
        <strong className="numeric">{chance === null ? "↔" : t.tt(chance >= 0.7 ? "ux.riskLow" : chance >= 0.45 ? "ux.riskMid" : "ux.riskHigh")}</strong>
      </span>

      <EffectChips effects={success} t={t} />
      {chance !== null && failure.length > 0 ? <span className="tec-risk-downside"><span className="tec-risk-heading">{t.tt("ux.downside")}</span><EffectChips effects={failure} t={t} /></span> : null}
    </span>
  );
}

/** Resolução permanece no layout; animação nunca bloqueia a próxima ação. */
export function Resolution({ good, title, children }: { good: boolean; title: string; children: ReactNode }) {
  const reduced = useReducedMotion() === true;
  return (
    <m.div className="tec-resolution" data-tone={good ? "good" : "bad"} role="status"
      initial={reduced ? false : { opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: good || reduced ? 0 : [0, -4, 4, -2, 0] }}
      transition={{ duration: reduced ? 0 : 0.4 }}>
      <m.span className="tec-resolution-mark" aria-hidden="true" initial={reduced ? false : { scale: 0.3, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 350, damping: 18 }}>
        {good ? "★" : "▼"}
      </m.span>
      <div className="min-w-0 flex-1"><p className="eyebrow text-tone">{title}</p>{children}</div>
    </m.div>
  );
}
