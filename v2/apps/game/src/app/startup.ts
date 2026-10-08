import { savedScreen } from "../features/career/saveRecord";
import { readShareHash } from "../features/summary/shareHash";
import { IS_DEV } from "../lib/env";
import type { Screen } from "./navigation";

/**
 * O endereço é o do jogo? O CRAQUE vive num endereço só (a raiz do build, ou o
 * `index.html` dela); as telas não mudam a URL. Qualquer outro caminho é uma
 * página que não existe (GDD 37).
 */
export function isGamePath(pathname: string, base: string = import.meta.env.BASE_URL): boolean {
  const root = base.endsWith("/") ? base : `${base}/`;
  return pathname === root || pathname === root.slice(0, -1) || pathname === `${root}index.html`;
}

/**
 * Onde o jogo abre (GDD 5): um endereço desconhecido abre a página não
 * encontrada; um link de carreira (`#c=`) abre o resumo compartilhado;
 * recarregar retoma a Carreira ou o Resumo em que o jogador estava; qualquer
 * outra tela recarrega no Início. Em desenvolvimento, `#lab` abre o
 * laboratório. Lê só a tela salva, sem refazer a carreira.
 */
export function startScreen(
  hash: string = typeof window === "undefined" ? "" : window.location.hash,
  pathname: string = typeof window === "undefined" ? "/" : window.location.pathname,
): Screen {
  if (!isGamePath(pathname)) return "notFound";
  if (readShareHash(hash)) return "shared";
  if (IS_DEV && hash === "#lab") return "lab";
  return savedScreen() ?? "home";
}
