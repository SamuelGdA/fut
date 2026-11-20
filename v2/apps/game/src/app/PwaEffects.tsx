import { cacheGame } from "./modeCache";
import { SCREEN_GAME, useNavigation } from "./navigation";
import { useEffect } from "react";
import { translate } from "../i18n/translate";
import { readPrefs } from "../store/prefs";
import { notify } from "../ui/toast/notify";

/**
 * O PWA na tela (GDD 37). Registra o service worker (só no build: no
 * desenvolvimento ele não existe) e conversa com o jogador em três momentos:
 *
 * - na primeira instalação, "pronto para jogar sem internet";
 * - quando a conexão cai ou volta.
 *
 * Versão nova (D129): sem aviso. O navegador baixa a versão nova em segundo
 * plano; ela passa a valer na próxima vez que o site abre. Se ao abrir já há
 * uma versão esperando, o jogo troca na hora, antes de o jogador tocar em
 * qualquer coisa (nada se perde: ainda não há carreira na memória). Se a
 * versão nova chega com o site aberto, ela espera em silêncio: recarregar
 * no meio do jogo encerraria a sessão do Craque.
 *
 * Não desenha nada. O registro é importado sob demanda, fora do pacote da
 * primeira tela.
 */
/** Até quanto tempo depois de abrir o site uma versão esperando ainda troca sozinha. */
const UPDATE_ON_OPEN_MS = 6000;

export function PwaEffects() {
  const screen = useNavigation((state) => state.screen);
  const game = SCREEN_GAME[screen];
  useEffect(() => {
    if (!import.meta.env.PROD || (game !== "craque" && game !== "tecnico")) return;
    let cancelled = false;
    void cacheGame(game, () => cancelled).catch(() => undefined);
    return () => { cancelled = true; };
  }, [game]);
  useEffect(() => {
    if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    let cancelled = false;
    // O jogador já mexeu no site? Depois disso, nenhuma troca de versão recarrega a página.
    let touched = false;
    const touch = () => {
      touched = true;
    };
    window.addEventListener("pointerdown", touch, { once: true, capture: true });
    window.addEventListener("keydown", touch, { once: true, capture: true });
    void import("virtual:pwa-register").then(({ registerSW }) => {
      if (cancelled) return;
      const updateServiceWorker = registerSW({
        immediate: true,
        onNeedRefresh() {
          if (!touched && performance.now() < UPDATE_ON_OPEN_MS) void updateServiceWorker(true);
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
      window.removeEventListener("pointerdown", touch, { capture: true });
      window.removeEventListener("keydown", touch, { capture: true });
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
