import { Tooltip } from "@base-ui/react/tooltip";
import { AWARDS, getCompetition, type AwardKey, type Language } from "@craque/world";
import { useEffect, useRef, useState } from "react";
import { AwardArt, TrophyArt } from "./Media";

/** Dica temporária por hover ou foco de teclado; no toque (D88), abre por 2 s; quem envolve a taça decide se o toque segue adiante. Clicar com o mouse nunca prende a dica. */
export function HonourToken({ id, award, label, year, size = 30, language, stacked = false }: { id: string; award?: AwardKey; label?: string; year?: number; size?: number; language: Language; stacked?: boolean }) {
  const competition = getCompetition(id);
  const name = label ?? (award ? `${AWARDS[award].names[language]}${competition ? ` · ${competition.names[language]}` : ""}` : competition?.names[language] ?? id);
  const text = `${name}${year ? ` · ${year}` : ""}`;
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(0);
  const touchedAt = useRef(0);
  useEffect(() => { if (!touched) return; const timer = window.setTimeout(() => setOpen(false), 2000); return () => window.clearTimeout(timer); }, [touched]);
  const art = award ? <AwardArt award={AWARDS[award]} size={size} language={language} tooltip="" decorative /> : competition ? <TrophyArt competition={competition} size={size} language={language} tooltip="" decorative /> : null;
  return <Tooltip.Provider><Tooltip.Root disableHoverablePopup open={open} onOpenChange={(next) => { if (!next && performance.now() - touchedAt.current < 2000) return; setOpen(next); }}><Tooltip.Trigger render={<span tabIndex={0} role="img" />} delay={150} className="honour-token" data-stacked={stacked || undefined} aria-label={text} onPointerDown={(event) => { if (event.pointerType !== "touch") return; touchedAt.current = performance.now(); setOpen(true); setTouched(event.timeStamp); }}>{stacked ? <span className="honour-shadow" aria-hidden="true">{art}</span> : null}{art}</Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner side="top" sideOffset={6} collisionPadding={10} className="layer-popover"><Tooltip.Popup role="tooltip" className="popover-popup" data-size="tip">{text}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>;
}
