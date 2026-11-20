import { useCareer } from "../features/career/store";
import { cacheGame } from "./modeCache";
import { SCREEN_GAME, useNavigation } from "./navigation";
import { useEffect, useState } from "react";
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
 * versão nova chega com o site aberto, ela espera em silêncio até um momento
 * seguro (D131): ir para o hub, para o início do Craque ou "Jogar de novo",
 * sem carreira em andamento. Aí o site recarrega na versão nova. Recarregar
 * no meio do jogo encerraria a sessão do Craque, então isso nunca acontece.
 *
 * Não desenha nada. O registro é importado sob demanda, fora do pacote da
 * primeira tela.
 */
/** Telas em que recarregar não perde nada, se não houver carreira em andamento (D131). */
const SAFE_SCREENS = new Set(["hub", "home", "identity"]);

/** A versão nova esperando: a função que a ativa e recarrega, ou `null`. */
let pendingUpdate: (() => void) | null = null;

/**
 * Já há uma versão nova (esperando ou entrando). Aí o jogo não guarda as peças
 * do modo para jogar sem internet: seriam as da versão velha, e cada download
 * passando por ela atrasa a troca em dezenas de segundos.
 */
let newVersionKnown = false;

/** Não há carreira do Craque viva na memória (nenhuma, ou já terminada). */
function noCareerRunning(): boolean {
  const career = useCareer.getState().career;
  return career === null || career.end !== null;
}

/**
 * Troca para a versão nova já (D131). O caminho de sempre (avisar a versão
 * esperando e recarregar quando ela assume) leva até 30 s no Chrome, que
 * segura a troca enquanto a versão velha termina o que está fazendo. Em vez
 * de esperar: a instalação velha é desligada e a página recarrega direto do
 * servidor, já na versão nova, que se reinstala em segundo plano.
 */
async function switchToNewVersion(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.unregister();
  } finally {
    window.location.reload();
  }
}

/** Até quanto tempo depois de abrir o site uma versão esperando ainda troca sozinha. */
const UPDATE_ON_OPEN_MS = 6000;

/** Sem recarregar até lá, a tela "Atualizando" sai e o jogo segue (D131). */
const UPDATING_MAX_MS = 10_000;

export function PwaEffects() {
  const screen = useNavigation((state) => state.screen);
  const game = SCREEN_GAME[screen];
  // A troca leva alguns segundos (o navegador ativa a versão nova antes de
  // recarregar): uma tela cheia segura os toques, para ninguém começar uma
  // carreira que o recarregamento apagaria.
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    if (!updating) return;
    const timer = window.setTimeout(() => setUpdating(false), UPDATING_MAX_MS);
    return () => window.clearTimeout(timer);
  }, [updating]);
  // D131: chegou num lugar seguro com uma versão nova esperando: troca agora.
  useEffect(() => {
    if (!pendingUpdate || !SAFE_SCREENS.has(screen) || !noCareerRunning()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a tela de espera nasce junto com a troca, que é um efeito externo.
    setUpdating(true);
    pendingUpdate();
  }, [screen]);
  useEffect(() => {
    if (!import.meta.env.PROD || newVersionKnown || (game !== "craque" && game !== "tecnico")) return;
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
      registerSW({
        immediate: true,
        onNeedRefresh() {
          if (!touched && performance.now() < UPDATE_ON_OPEN_MS) {
            newVersionKnown = true;
            void switchToNewVersion();
            return;
          }
          // Espera o próximo lugar seguro (D131).
          newVersionKnown = true;
          pendingUpdate = () => {
            pendingUpdate = null;
            void switchToNewVersion();
          };
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

  if (!updating) return null;
  const locale = readPrefs().locale;
  return (
    <div className="pwa-updating" role="status" aria-live="polite">
      <p>{translate(locale, "pwa.updating")}</p>
    </div>
  );
}
