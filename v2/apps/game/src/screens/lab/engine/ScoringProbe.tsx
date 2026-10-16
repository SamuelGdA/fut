import { productionRates, type Position } from "@craque/engine";
import { useState } from "react";
import { d68 } from "../../../i18n/d68";
import { useT } from "../../../i18n/useT";
import { StepSlider } from "../../../ui/Fields";
import { Panel } from "../../../ui/Panel";

/** As taxas reais do motor, isolando finalização e função no mesmo contexto. */
export function ScoringProbe() {
  const { locale, c, number } = useT();
  const [ovr, setOvr] = useState(94), [finishing, setFinishing] = useState(94);
  const positions: Position[] = ["st", "lw", "rw", "cam", "lm", "rm", "cm", "cdm", "cb", "gk"];
  return <Panel title={d68(locale, "scoringTitle")}>
    <p className="text-sm text-muted">{d68(locale, "scoringHint")}</p>
    <div className="my-5 grid gap-5 sm:grid-cols-2">
      <StepSlider label={d68(locale, "level")} value={ovr} min={40} max={99} valueText={String(ovr)} onValueChange={setOvr} />
      <StepSlider label={d68(locale, "finishing")} value={finishing} min={40} max={99} valueText={String(finishing)} onValueChange={setFinishing} />
    </div>
    <p className="eyebrow mb-3">{d68(locale, "expected")}</p>
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">{positions.map(position => {
      const rates = productionRates({ position, ovr, attributes: [ovr, finishing, ovr, ovr, ovr, ovr], trait: "professional", teamStrength: 88, clubStrength: 87, opposition: 80, games: 50 });
      return <div key={position} className="rounded-sm border border-line p-3"><dt className="eyebrow">{c(`positionAbbr.${position}`)}</dt><dd className="display numeric text-3xl font-bold">{number(rates.goalsPerGame * 50, { maximumFractionDigits: 1 })}</dd></div>;
    })}</dl>
  </Panel>;
}
