import { Popover } from "@base-ui/react/popover";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface InfoTipProps {
  /** Nome acessível do botão, por exemplo o nome da estatística. */
  label: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Explicação curta de um número ou termo. Abre ao passar o mouse e também com
 * um toque, porque dica que só existe no hover não existe no celular.
 */
export function InfoTip({ label, children, side = "top" }: InfoTipProps) {
  return (
    <Popover.Root>
      <Popover.Trigger openOnHover delay={200} className="infotip-trigger" aria-label={label}>
        <Info size={14} strokeWidth={2.25} aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side={side} sideOffset={8} collisionPadding={12} className="layer-popover">
          <Popover.Popup className="popover-popup" data-size="tip">
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
