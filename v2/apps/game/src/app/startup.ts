import { readShareHash } from "../features/summary/shareHash";
import { IS_DEV } from "../lib/env";
import { GAME_PATHS, type Screen, SCREEN_PATHS } from "./navigation";

/**
 * O endereço é o do jogo? O Futeiros vive na raiz do build (ou no
 * `index.html` dela) e nos caminhos das telas com endereço próprio (D112:
 * login, perfil, termos, privacidade) e de modo (D118: craque, tecnico),
 * com ou sem barra no fim. Qualquer
 * outro caminho é uma página que não existe (GDD 37).
 */
export function isGamePath(pathname: string, base: string = import.meta.env.BASE_URL): boolean {
  return screenOfPath(pathname, base) !== null;
}

/** A tela do caminho: o hub na raiz, a tela própria nos caminhos dela, a entrada do modo no caminho dele, `null` fora disso. */
export function screenOfPath(pathname: string, base: string = import.meta.env.BASE_URL): Screen | "root" | null {
  const root = base.endsWith("/") ? base : `${base}/`;
  if (pathname === root || pathname === root.slice(0, -1) || pathname === `${root}index.html`) return "root";
  if (!pathname.startsWith(root)) return null;
  const rest = pathname.slice(root.length).replace(/\/index\.html$/, "").replace(/\/$/, "");
  for (const [screen, path] of Object.entries(SCREEN_PATHS)) {
    if (path === rest) return screen as Screen;
  }
  for (const { path, entry } of Object.values(GAME_PATHS)) {
    if (path === rest) return entry;
  }
  return null;
}

/**
 * Onde o jogo abre (GDD 5 e D50): um endereço desconhecido abre a página não
 * encontrada; um link de carreira (`#c=`) abre o resumo compartilhado; todo o
 * resto abre o hub do Futeiros. O Craque é uma sessão em memória; o Técnico pode retomar a última
 * carreira em andamento pelo hub. Recarregar sempre abre o hub, menos nos caminhos próprios (D112),
 * que reabrem a própria tela, e nos de modo (D118), que abrem a entrada do modo. Em desenvolvimento, `#lab` abre o laboratório.
 */
export function startScreen(
  hash: string = typeof window === "undefined" ? "" : window.location.hash,
  pathname: string = typeof window === "undefined" ? "/" : window.location.pathname,
): Screen {
  const own = screenOfPath(pathname);
  if (own === null) return "notFound";
  // Um link de carreira copiado no caminho do Craque (D118) também abre o resumo compartilhado.
  if ((own === "root" || own === "home") && readShareHash(hash)) return "shared";
  if (own !== "root") return own;
  if (IS_DEV && hash === "#lab") return "lab";
  return "hub";
}
