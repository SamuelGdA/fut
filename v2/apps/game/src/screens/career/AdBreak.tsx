import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useEffect, useRef } from "react";
import { useT } from "../../i18n/useT";

/** Quanto o anúncio de exemplo fica na tela antes do sorteio (D118). */
export const AD_BREAK_MS = 1000;

/**
 * O intervalo comercial do novo sorteio de clubes (D118). Por enquanto é um
 * anúncio de EXEMPLO: abre, segura um segundo com a barra correndo e fecha
 * sozinho. Quando a monetização for ligada, este é o lugar do anúncio
 * recompensado de verdade; o sorteio só acontece depois que ele termina.
 */
export function AdBreak({ open, onDone }: { open: boolean; onDone(): void }) {
  const { t } = useT();
  // O tempo conta da abertura; um novo desenho da tela não o reinicia.
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; }, [onDone]);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => done.current(), AD_BREAK_MS);
    return () => window.clearTimeout(timer);
  }, [open]);
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="dialog-backdrop" />
        <AlertDialog.Viewport className="dialog-viewport">
          <AlertDialog.Popup className="dialog-popup ad-break" data-tone="bad">
            <p className="ad-slot-label">{t("ads.label")}</p>
            <AlertDialog.Title className="display text-2xl font-extrabold uppercase">{t("career.redraw.adTitle")}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted">{t("career.redraw.adBody")}</AlertDialog.Description>
            <div className="ad-break-art" aria-hidden="true">{t("career.redraw.adSample")}</div>
            <div className="ad-break-bar" role="progressbar" aria-label={t("career.redraw.adTitle")} style={{ animationDuration: `${AD_BREAK_MS}ms` }} />
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
