import { Popover } from "@base-ui/react/popover";
import { SectionBoundary } from "../../app/ErrorBoundary";
import { Settings2 } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { IconButton } from "../../ui/Button";
import { cn } from "../../ui/cn";

const loadPanel = () => import("./SettingsPanel");
const SettingsPanel = lazy(() => loadPanel().then((module) => ({ default: module.SettingsPanel })));

/** Reserva a altura do painel enquanto ele carrega, para nada pular. */
function PanelPlaceholder() {
  return <div className="h-96" aria-hidden="true" />;
}

/**
 * Engrenagem da barra superior e o painel de ajustes (GDD 34.1). O painel só
 * é baixado ao abrir, e começa a baixar quando o ponteiro ou o foco chegam
 * na engrenagem, para abrir sem espera.
 */
export function SettingsMenu() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const preload = () => {
    void loadPanel();
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) feedback("tick");
      }}
    >
      <Popover.Trigger
        render={
          <IconButton label={t("nav.openSettings")} onPointerEnter={preload} onFocus={preload}>
            <Settings2
              size={20}
              aria-hidden="true"
              className={cn("transition-transform duration-300 ease-out", open && "rotate-45")}
            />
          </IconButton>
        }
      />
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={6} collisionPadding={12} className="layer-popover">
          <Popover.Popup className="popover-popup w-[min(340px,calc(100vw-24px))] p-5">
            <Popover.Title className="display text-3xl font-extrabold uppercase">
              {t("settings.title")}
            </Popover.Title>
            <SectionBoundary label="ajustes">
              <Suspense fallback={<PanelPlaceholder />}>
                <SettingsPanel />
              </Suspense>
            </SectionBoundary>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
