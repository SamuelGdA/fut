import { Toast } from "@base-ui/react/toast";
import { X } from "lucide-react";
import { isTone, TONE_GLYPH } from "../tone";
import { readEyebrow, toastManager } from "./notify";

interface ToasterProps {
  closeLabel: string;
}

/**
 * Trilho de avisos: canto superior direito no desktop, topo centralizado no
 * celular. Tocar num aviso só apressa a saída; nada aqui bloqueia a tela.
 */
export function Toaster({ closeLabel }: ToasterProps) {
  return (
    <Toast.Provider toastManager={toastManager} limit={3}>
      <Toast.Portal>
        <Toast.Viewport className="toast-viewport">
          <ToastList closeLabel={closeLabel} />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList({ closeLabel }: ToasterProps) {
  const { toasts, close } = Toast.useToastManager();

  return toasts.map((toast) => {
    const tone = isTone(toast.type) ? toast.type : "neutral";
    const eyebrow = readEyebrow(toast.data);
    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        swipeDirection={["right", "up"]}
        className="toast"
        data-tone={tone}
        onClick={() => close(toast.id)}
      >
        <div className="toast-mark" aria-hidden="true">
          {TONE_GLYPH[tone]}
        </div>
        <Toast.Content className="toast-body">
          {eyebrow ? <p className="eyebrow text-tone mb-1.5">{eyebrow}</p> : null}
          <Toast.Title className="text-sm font-semibold leading-snug text-fg" />
          <Toast.Description className="mt-0.5 text-sm leading-snug text-muted" />
          {toast.actionProps ? <Toast.Action className="toast-action" /> : null}
        </Toast.Content>
        <Toast.Close className="toast-close" aria-label={closeLabel}>
          <X size={16} aria-hidden="true" />
        </Toast.Close>
      </Toast.Root>
    );
  });
}
