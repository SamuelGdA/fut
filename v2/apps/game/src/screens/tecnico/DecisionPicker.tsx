import { useReducedMotion } from "../../lib/useReducedMotion";
import { Check, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { m } from "motion/react";
import { Button } from "../../ui/Button";
import { feedback } from "../../services/feedback";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";

/** Uma escolha em foco, com todas as alternativas visíveis e confirmação deliberada. */
export function DecisionPicker({ options, label, disabled, onChoose }: {
  options: readonly { id: string; title: string; detail: ReactNode; canConfirm?: boolean }[];
  label: string; disabled?: boolean; onChoose(id: string): void;
}) {
  const { tt } = useTecnicoT();
  const [selected, setSelected] = useState(options[0]?.id ?? "");
  const reduced = useReducedMotion() === true;
  const choice = options.find((option) => option.id === selected) ?? options[0];
  return <div className="tec-decision-picker" role="group" aria-label={label}>
    <div className="tec-decision-rail" role="radiogroup" aria-label={label}>
      {options.map((option, index) => <button key={option.id} type="button" role="radio" aria-checked={choice?.id === option.id} disabled={disabled}
        tabIndex={choice?.id === option.id ? 0 : -1}
        onKeyDown={(event) => {
          const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1) + options.length) % options.length;
          const candidate = options[next];
          if (candidate) setSelected(candidate.id);
          event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='radio']")[next]?.focus();
        }}
        className="tec-decision-option" data-checked={choice?.id === option.id || undefined}
        onClick={() => { setSelected(option.id); feedback("tick"); }}>
        <span className="tec-decision-number numeric">{choice?.id === option.id ? <Check size={16} aria-hidden="true" /> : `0${index + 1}`}</span>
        <span>{option.title}</span><ChevronRight size={14} aria-hidden="true" />
      </button>)}
    </div>
    {choice ? <m.div key={choice.id} className="tec-decision-focus" initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }}>{choice.detail}</m.div> : null}
    <Button className="tec-decision-confirm" loading={disabled} disabled={!choice || choice.canConfirm === false} onClick={() => { if (choice) { feedback("confirm"); onChoose(choice.id); } }}>{tt("ux.confirmDecision")}<Check size={16} aria-hidden="true" /></Button>
  </div>;
}
