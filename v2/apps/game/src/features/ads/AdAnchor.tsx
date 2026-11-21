import { useEffect, useSyncExternalStore } from "react";
import { useNavigation } from "../../app/navigation";
import { AdFrame } from "./AdFrame";
import { useAdPreview } from "./preview";
import { ANCHOR_REVEAL, ANCHOR_SCREENS, ANCHOR_SIZE } from "./slots";

function subscribeScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** A pessoa já rolou o bastante para a âncora entrar? */
function useScrolledPast(limit: number): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY >= limit,
    () => false,
  );
}

function subscribeFocus(onChange: () => void): () => void {
  document.addEventListener("focusin", onChange);
  document.addEventListener("focusout", onChange);
  return () => {
    document.removeEventListener("focusin", onChange);
    document.removeEventListener("focusout", onChange);
  };
}

/**
 * Um campo de texto tem o foco? Com o teclado do celular aberto (o nome no
 * Desafio do dia), a âncora sai para não ficar por cima do que se digita.
 */
function useTyping(): boolean {
  return useSyncExternalStore(
    subscribeFocus,
    () => {
      const element = document.activeElement;
      return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || (element instanceof HTMLElement && element.isContentEditable);
    },
    () => false,
  );
}

/**
 * A âncora do celular (D134): 320×50 preso ao pé da tela, acima da área
 * segura do aparelho, só nas telas de leitura (nunca no laço, na criação ou no
 * login, que têm ação embaixo). Enquanto ela vale para a tela, a raiz ganha
 * `data-ad-anchor`: a página reserva a mesma altura embaixo e o aviso de
 * cookies sobe, então nada fica escondido atrás dela. Só aparece depois que
 * a pessoa rola um pouco: nunca cobre os botões do topo da tela (o
 * "Compartilhar" do resumo). O espaço embaixo fica reservado desde o começo,
 * então ela entrar não mexe em nada. Sai enquanto um campo de texto tem o
 * foco (teclado aberto). No PC, não aparece.
 */
export function AdAnchor() {
  const on = useAdPreview((state) => state.on);
  const screen = useNavigation((state) => state.screen);
  const active = on && ANCHOR_SCREENS.includes(screen);
  const scrolled = useScrolledPast(ANCHOR_REVEAL);
  const typing = useTyping();

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.setAttribute("data-ad-anchor", "");
    return () => root.removeAttribute("data-ad-anchor");
  }, [active]);

  if (!active || !scrolled || typing) return null;
  return (
    <div className="ad-anchor">
      <AdFrame id="ancora-celular" kind="anchor" desktop={null} mobile={ANCHOR_SIZE} />
    </div>
  );
}
