import { Tooltip } from "@base-ui/react/tooltip";
import { AWARDS, getCompetition, type AwardKey, type Language } from "@craque/world";
import { AwardArt, TrophyArt } from "./Media";

/** Dica temporária por hover ou foco de teclado. Clicar nunca prende a dica. */
export function HonourToken({ id, award, label, year, size = 30, language, stacked = false }: { id: string; award?: AwardKey; label?: string; year?: number; size?: number; language: Language; stacked?: boolean }) {
  const competition = getCompetition(id);
  const name = label ?? (award ? `${AWARDS[award].names[language]}${competition ? ` · ${competition.names[language]}` : ""}` : competition?.names[language] ?? id);
  const text = `${name}${year ? ` · ${year}` : ""}`;
  const art = award ? <AwardArt award={AWARDS[award]} size={size} language={language} tooltip="" decorative /> : competition ? <TrophyArt competition={competition} size={size} language={language} tooltip="" decorative /> : null;
  return <Tooltip.Provider><Tooltip.Root disableHoverablePopup><Tooltip.Trigger render={<span tabIndex={0} role="img" />} delay={150} className="honour-token" data-stacked={stacked || undefined} aria-label={text}>{stacked ? <span className="honour-shadow" aria-hidden="true">{art}</span> : null}{art}</Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner side="top" sideOffset={6} collisionPadding={10} className="layer-popover"><Tooltip.Popup role="tooltip" className="popover-popup" data-size="tip">{text}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>;
}
