import { type ComponentType, type LazyExoticComponent, lazy, Suspense, useEffect } from "react";
import { useT } from "../i18n/useT";
import { IS_DEV } from "../lib/env";
import { Loading } from "../ui/Loading";
import { Boundary, ErrorPanel } from "./ErrorBoundary";
import { SCREEN_GAME, type Screen, useNavigation } from "./navigation";

/**
 * Um componente por tela registrada, cada um no próprio pedaço do bundle: a
 * casca pinta primeiro e a tela chega logo atrás. Faltar uma tela é erro de
 * compilação.
 */
type Loader = () => Promise<{ default: ComponentType }>;

const SCREEN_LOADERS: Readonly<Record<Screen, Loader>> = {
  hub: () => import("../screens/hub/HubScreen").then((module) => ({ default: module.HubScreen })),
  home: () => import("../screens/home/HomeScreen").then((module) => ({ default: module.HomeScreen })),
  identity: () => import("../screens/identity/IdentityScreen").then((module) => ({ default: module.IdentityScreen })),
  appearance: () => import("../screens/appearance/AppearanceScreen").then((module) => ({ default: module.AppearanceScreen })),
  career: () => import("../screens/career/CareerScreen").then((module) => ({ default: module.CareerScreen })),
  summary: () => import("../screens/summary/SummaryScreen").then((module) => ({ default: module.SummaryScreen })),
  shared: () => import("../screens/shared/SharedScreen").then((module) => ({ default: module.SharedScreen })),
  challenge: () => import("../screens/challenge/ChallengeScreen").then((module) => ({ default: module.ChallengeScreen })),
  hall: () => import("../screens/achievements/AchievementsScreen").then((module) => ({ default: module.AchievementsScreen })),
  archived: () => import("../screens/home/HomeScreen").then((module) => ({ default: module.HomeScreen })),
  achievements: () => import("../screens/achievements/AchievementsScreen").then((module) => ({ default: module.AchievementsScreen })),
  notFound: () => import("../screens/notFound/NotFoundScreen").then((module) => ({ default: module.NotFoundScreen })),
  lab: () => import("../screens/lab/LabScreen").then((module) => ({ default: module.LabScreen })),
  tecnicoIdentity: () => import("../screens/tecnico/TecnicoIdentityScreen").then((module) => ({ default: module.TecnicoIdentityScreen })),
  tecnicoAppearance: () => import("../screens/tecnico/TecnicoAppearanceScreen").then((module) => ({ default: module.TecnicoAppearanceScreen })),
  tecnico: () => import("../screens/tecnico/TecnicoScreen").then((module) => ({ default: module.TecnicoScreen })),
  tecnicoLegacy: () => import("../screens/tecnico/TecnicoLegacyScreen").then((module) => ({ default: module.TecnicoLegacyScreen })),
};

const SCREEN_COMPONENTS = Object.fromEntries(
  Object.entries(SCREEN_LOADERS).map(([screen, load]) => [screen, lazy(load)]),
) as Readonly<Record<Screen, LazyExoticComponent<ComponentType>>>;

/** As telas que o jogador costuma abrir, na ordem provável, para baixar antes do clique. */
const PRELOAD: readonly Screen[] = ["home", "tecnicoIdentity", "identity", "career", "challenge", "summary", "appearance", "hall", "achievements"];

/**
 * Baixa as outras telas em segundo plano, quando o navegador está ocioso
 * depois da primeira pintura (D43): tocar num botão abre a tela na hora, sem
 * "Carregando". Sem internet e com o jogo já guardado, vem do aparelho.
 */
function usePreloadScreens(): void {
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      for (const screen of PRELOAD) void SCREEN_LOADERS[screen]().catch(() => undefined);
      if (IS_DEV) void SCREEN_LOADERS.lab().catch(() => undefined);
    };
    // Safari ainda não tem requestIdleCallback: lá, um pouco depois da primeira pintura.
    const idle = "requestIdleCallback" in window;
    const handle = idle ? window.requestIdleCallback(run, { timeout: 2500 }) : window.setTimeout(run, 1200);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);
}

/** Telas que leem a carreira salva: o erro delas oferece limpar o save. */
const READS_SAVE: ReadonlySet<Screen> = new Set(["career", "summary"]);

function ScreenLoading() {
  const { t } = useT();
  return <Loading label={t("common.loading")} />;
}

/**
 * A tela atual, com a própria barreira de erro: uma tela que quebre (ou que
 * não baixe) mostra o erro dentro da casca, com volta para o Início. Trocar
 * de tela zera a barreira.
 */
export function ScreenOutlet() {
  const screen = useNavigation((state) => state.screen);
  const go = useNavigation((state) => state.go);
  const Current = SCREEN_COMPONENTS[screen];
  usePreloadScreens();
  return (
    <Boundary
      label={`tela ${screen}`}
      resetKey={screen}
      fallback={(error, reset) => (
        <ErrorPanel
          error={error}
          layout="screen"
          onRetry={reset}
          onHome={screen === "hub" ? undefined : () => go("hub", { force: true })}
          offerReset={READS_SAVE.has(screen)}
          game={SCREEN_GAME[screen] === "tecnico" ? "tecnico" : "craque"}
        />
      )}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Current key={screen} />
      </Suspense>
    </Boundary>
  );
}
