import { type Career, saveOf } from "@craque/engine";
import { GitBranch } from "lucide-react";
import { useState } from "react";
import { type DecisionPoint, decisionPoints } from "../../features/career/whatIf";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { ConfirmDialog } from "../../ui/Overlays";

/**
 * "E se...?" (GDD 28.3): a linha do tempo de decisões, cada uma com o que foi
 * escolhido e um botão para seguir dali por outro caminho. A original fica no
 * Hall da Fama; a nova é marcada como linha alternativa.
 */
export function WhatIfChapter({ career, onBranch }: { career: Career; onBranch(index: number): void }) {
  const { t, locale } = useT();
  const points = decisionPoints(saveOf(career), locale);
  const [pending, setPending] = useState<DecisionPoint | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted">{t("summary.whatIf.intro")}</p>
      <ol className="flex flex-col divide-y divide-line rounded-sm border border-line bg-panel">
        {points.map((point) => (
          <li key={point.index} className="flex items-center gap-3 px-3 py-2.5">
            <span className="numeric w-8 shrink-0 text-center text-sm font-bold text-faint">{point.age}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{point.title}</span>
              <span className="block truncate text-xs text-muted">
                {t("summary.whatIf.at", { age: point.age, year: point.year })} · {t("summary.whatIf.chose", { option: point.chose })}
              </span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0"
              aria-label={`${t("summary.whatIf.go")}: ${point.title}, ${t("summary.whatIf.at", { age: point.age, year: point.year })}`}
              onClick={() => {
                feedback("select");
                setPending(point);
              }}
            >
              <GitBranch size={15} aria-hidden="true" />
              <span className="hidden sm:inline">{t("summary.whatIf.go")}</span>
            </Button>
          </li>
        ))}
      </ol>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(next) => {
          if (!next) setPending(null);
        }}
        title={t("summary.whatIf.confirmTitle")}
        description={t("summary.whatIf.confirmBody", { age: pending?.age ?? 0 })}
        confirmLabel={t("summary.whatIf.confirm")}
        cancelLabel={t("common.cancel")}
        tone="neutral"
        onConfirm={() => {
          if (pending) onBranch(pending.index);
          setPending(null);
        }}
      />
    </div>
  );
}
