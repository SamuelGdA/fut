import { useEffect } from "react";
import { translate } from "../i18n/translate";
import { readPrefs } from "../store/prefs";
import { notify } from "../ui/toast/notify";

/**
 * O PWA na tela (GDD 37). Registra o service worker (só no build: no
 * desenvolvimento ele não existe) e conversa com o jogador em três momentos:
 *
 * - na primeira instalação, "pronto para jogar sem internet";
 * - quando sai uma versão nova, um aviso que espera com o botão "Atualizar":
 *   o jogo nunca troca de versão sozinho no meio de uma carreira;
 * - quando a conexão cai ou volta.
 *
 * Não desenha nada. O registro é importado sob demanda, fora do pacote da
 * primeira tela.
 */
export function PwaEffects() {
  useEffect(() => {
    if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    let cancelled = false;
    void import("virtual:pwa-register").then(({ registerSW }) => {
      if (cancelled) return;
      const updateServiceWorker = registerSW({
        immediate: true,
        onNeedRefresh() {
          const locale = readPrefs().locale;
          notify({
            id: "pwa-update",
            tone: "info",
            title: translate(locale, "pwa.updateTitle"),
            description: translate(locale, "pwa.updateBody"),
            timeout: 0,
            action: { label: translate(locale, "pwa.update"), onClick: () => void updateServiceWorker(true) },
          });
        },
        onOfflineReady() {
          const locale = readPrefs().locale;
          notify({
            id: "pwa-ready",
            tone: "good",
            title: translate(locale, "pwa.readyTitle"),
            description: translate(locale, "pwa.readyBody"),
          });
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const offline = () => {
      const locale = readPrefs().locale;
      notify({
        id: "pwa-network",
        tone: "bad",
        title: translate(locale, "pwa.offlineTitle"),
        description: translate(locale, "pwa.offlineBody"),
        timeout: 8000,
      });
    };
    const online = () => {
      notify({ id: "pwa-network", tone: "good", title: translate(readPrefs().locale, "pwa.onlineTitle") });
    };
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);

  return null;
}
