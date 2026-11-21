import { AdFrame } from "./AdFrame";
import { useAdPreview } from "./preview";
import { AD_SLOTS, type AdSlotId } from "./slots";

/**
 * Um espaço de anúncio no conteúdo (D134), lido do registro central. Hoje só
 * desenha a moldura de prévia; sem a prévia (produção), não desenha nada,
 * nem um buraco. Nenhuma rede de anúncio é chamada.
 */
export function AdSlot({ id, className }: { id: AdSlotId; className?: string }) {
  const on = useAdPreview((state) => state.on);
  if (!on) return null;
  const slot = AD_SLOTS[id];
  return <AdFrame id={id} kind={slot.kind} desktop={slot.desktop} mobile={slot.mobile} className={className} />;
}
