import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Drawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Button, IconButton } from "./Button";

interface SheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: ReactNode;
  description?: ReactNode;
  closeLabel: string;
  children: ReactNode;
  /** Ações fixas no rodapé, fora da área que rola. */
  footer?: ReactNode;
}

/**
 * Folha que sobe da borda de baixo. Fecha arrastando para baixo, tocando fora
 * ou com Esc. No desktop, fica centralizada com largura limitada.
 */
export function Sheet({ open, onOpenChange, title, description, closeLabel, children, footer }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(next) => onOpenChange(next)} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.Viewport className="sheet-viewport">
          <Drawer.Popup className="sheet-popup">
            <div className="sheet-handle" aria-hidden="true" />
            <Drawer.Content className="sheet-content">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Drawer.Title className="display text-3xl font-extrabold uppercase">{title}</Drawer.Title>
                  {description ? (
                    <Drawer.Description className="mt-1.5 text-sm text-muted">{description}</Drawer.Description>
                  ) : null}
                </div>
                <Drawer.Close
                  render={
                    <IconButton label={closeLabel} size="iconSm">
                      <X size={18} aria-hidden="true" />
                    </IconButton>
                  }
                />
              </div>
              {children}
            </Drawer.Content>
            {footer ? <div className="border-t border-line px-5 py-4">{footer}</div> : null}
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm(): void;
  /** "bad" para ações que tiram o jogador de onde está. */
  tone?: "bad" | "glory" | "neutral";
}

/**
 * Confirmação modal. A opção que não muda nada é a destacada e a que recebe o
 * foco: quem aperta Enter por reflexo nunca perde nada.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  tone = "bad",
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="dialog-backdrop" />
        <AlertDialog.Viewport className="dialog-viewport">
          <AlertDialog.Popup className="dialog-popup" data-tone={tone} initialFocus={cancelRef}>
            <AlertDialog.Title className="display text-3xl font-extrabold uppercase">{title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted">{description}</AlertDialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant={tone === "bad" ? "danger" : "secondary"}
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
              >
                {confirmLabel}
              </Button>
              <AlertDialog.Close render={<Button ref={cancelRef} variant="primary" />}>{cancelLabel}</AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
