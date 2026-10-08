import { create } from "zustand";

/**
 * Telas existentes (GDD 5). Cada marco acrescenta as suas aqui e no
 * ScreenOutlet; o tipo garante que nenhuma tela registrada fique sem
 * componente. O laboratório só abre em desenvolvimento.
 */
export const SCREENS = [
  "home",
  "identity",
  "appearance",
  "career",
  "summary",
  "shared",
  "challenge",
  "hall",
  "archived",
  "achievements",
  "notFound",
  "lab",
] as const;

export type Screen = (typeof SCREENS)[number];

export const INITIAL_SCREEN: Screen = "home";

export function isScreen(value: unknown): value is Screen {
  return typeof value === "string" && (SCREENS as readonly string[]).includes(value);
}

/**
 * O que vai no `history.state`. A URL não muda entre telas: o botão voltar do
 * sistema funciona, e nenhum host estático precisa de regra de reescrita.
 */
interface HistoryEntry {
  craque: 2;
  screen: Screen;
}

export function toHistoryEntry(screen: Screen): HistoryEntry {
  return { craque: 2, screen };
}

export function fromHistoryEntry(state: unknown): Screen | null {
  if (typeof state !== "object" || state === null) return null;
  const entry = state as Partial<HistoryEntry>;
  if (entry.craque !== 2) return null;
  return isScreen(entry.screen) ? entry.screen : null;
}

/**
 * Guarda de saída. Recebe o destino e devolve `true` para deixar passar. Quem
 * devolve `false` assume a navegação (por exemplo, abrindo uma confirmação e
 * chamando `go(destino, { force: true })` depois).
 */
export type LeaveGuard = (to: Screen) => boolean;

interface NavigationState {
  screen: Screen;
  guard: LeaveGuard | null;
  go(to: Screen, options?: { replace?: boolean; force?: boolean }): void;
  back(): void;
  setGuard(guard: LeaveGuard | null): void;
  /** Uso interno: aplica o destino vindo do botão voltar do navegador. */
  applyPop(state: unknown): void;
}

function canUseHistory(): boolean {
  return typeof window !== "undefined" && typeof window.history !== "undefined";
}

/**
 * Ao sair da tela do link compartilhado, o `#c=` sai da barra de endereço; ao
 * sair da página não encontrada, o endereço desconhecido vira a raiz do jogo:
 * recarregar depois abre o jogo normal. Fora delas, a URL fica como está.
 */
function urlLeaving(from: Screen, to: Screen): string | undefined {
  if (from === to) return undefined;
  if (from === "shared") return `${window.location.pathname}${window.location.search}`;
  if (from === "notFound") return import.meta.env.BASE_URL;
  return undefined;
}

export const useNavigation = create<NavigationState>()((set, get) => ({
  screen: INITIAL_SCREEN,
  guard: null,

  go(to, options = {}) {
    const { screen, guard } = get();
    if (to === screen) return;
    if (!options.force && guard && !guard(to)) return;
    if (canUseHistory()) {
      const entry = toHistoryEntry(to);
      const url = urlLeaving(screen, to);
      if (options.replace) window.history.replaceState(entry, "", url);
      else window.history.pushState(entry, "", url);
    }
    set({ screen: to });
  },

  back() {
    if (canUseHistory()) window.history.back();
  },

  setGuard(guard) {
    set({ guard });
  },

  applyPop(state) {
    const target = fromHistoryEntry(state) ?? INITIAL_SCREEN;
    const { screen, guard } = get();
    if (target === screen) return;
    if (guard && !guard(target)) {
      // O navegador já voltou; recoloca a tela atual e deixa a guarda decidir.
      if (canUseHistory()) window.history.pushState(toHistoryEntry(screen), "");
      return;
    }
    set({ screen: target });
  },
}));

/** Liga o estado de navegação ao histórico. Chamar uma vez, na raiz. */
export function connectHistory(): () => void {
  if (!canUseHistory()) return () => {};
  const { screen } = useNavigation.getState();
  window.history.replaceState(toHistoryEntry(screen), "");
  const onPop = (event: PopStateEvent) => useNavigation.getState().applyPop(event.state);
  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}
