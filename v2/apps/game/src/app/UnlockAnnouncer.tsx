import { useEffect } from "react";
import { useUnlocks } from "../features/hall/unlocks";
import { useT } from "../i18n/useT";
import { feedback } from "../services/feedback";
import { notify } from "../ui/toast/notify";

/** Até quantos avisos de uma vez: com mais conquistas que isso, as primeiras e uma linha com o resto. */
const MAX_NOTICES = 3;

/**
 * O aviso de conquista (GDD 28.2): som próprio e um aviso por conquista, quando
 * nenhuma revelação está aberta. Não desenha nada; fica na casca do app para
 * avisar em qualquer tela.
 */
export function UnlockAnnouncer() {
  const { t, tp } = useT();
  const pending = useUnlocks((state) => state.queue.length);
  const held = useUnlocks((state) => state.held);

  useEffect(() => {
    if (held || pending === 0) return;
    const notices = useUnlocks.getState().take();
    if (notices.length === 0) return;
    feedback("unlock");
    // Nunca "mais 1": se cabe, cada uma tem o seu aviso.
    const shown = notices.length <= MAX_NOTICES ? notices.length : MAX_NOTICES - 1;
    for (const notice of notices.slice(0, shown)) {
      notify({ id: `unlock-${notice.id}`, tone: "glory", eyebrow: t("achievements.unlocked"), title: notice.name, description: notice.description });
    }
    const rest = notices.length - shown;
    if (rest > 0) notify({ id: "unlock-more", tone: "glory", eyebrow: t("achievements.unlocked"), title: tp("achievements.more", rest) });
  }, [pending, held, t, tp]);

  return null;
}
