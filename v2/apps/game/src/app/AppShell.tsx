import { lazy, Suspense, type ReactNode } from "react";
import { SCREEN_GAME, useNavigation } from "./navigation";
import { AccountButton } from "../features/account/AccountButton";
import { AdAnchor } from "../features/ads/AdAnchor";
import { AdInterstitial } from "../features/ads/AdInterstitial";
import { AdPreviewToggle } from "../features/ads/AdPreviewToggle";
import { AdRails } from "../features/ads/AdRails";
import { ADS_PREVIEW_AVAILABLE } from "../features/ads/preview";
import { RAIL_SCREENS } from "../features/ads/slots";
import { CookieBanner } from "../features/consent/CookieBanner";
import { SettingsMenu } from "../features/settings/SettingsMenu";
import { useT } from "../i18n/useT";
import { PitchMark } from "../ui/PitchMark";
import { Toaster } from "../ui/toast/Toaster";
import { UnlockAnnouncer } from "./UnlockAnnouncer";
// D124: com o Técnico bloqueado, o guia dele nem entra no build.
const CoachGuide = import.meta.env.VITE_MODOS_BLOQUEADOS === "tecnico" ? null : lazy(() => import("../screens/tecnico/Guide").then((module) => ({ default: module.Guide })));
const DebugTools = import.meta.env.DEV ? lazy(() => import("../features/debug/DebugTools").then((module) => ({ default: module.DebugTools }))) : null;

/**
 * Marca (D50): o campo visto de cima e o nome do Futeiro, que leva ao hub.
 * Dentro de um jogo, a etiqueta dele aparece ao lado (Craque ou Técnico).
 */
function Brand() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const screen = useNavigation((state) => state.screen);
  const game = SCREEN_GAME[screen];
  const content = (
    <>
      <PitchMark className="h-7 w-5" />
      <span className="display text-3xl font-black uppercase tracking-wide">{t("brand.name")}</span>
    </>
  );
  return (
    <div className="flex min-w-0 items-center gap-3">
      {screen === "hub" ? (
        <span className="flex items-center gap-2.5 text-fg">{content}</span>
      ) : (
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-sm text-fg"
          aria-label={`${t("brand.name")}: ${t("brand.hub")}`}
          onClick={() => go("hub")}
        >
          {content}
        </button>
      )}
      {game === "craque" || game === "tecnico" ? <span className="brand-game">{t(`brand.games.${game}`)}</span> : null}
      {game === "tecnico" && CoachGuide ? <Suspense fallback={null}><CoachGuide /></Suspense> : null}
      {DebugTools && (game === "craque" || game === "tecnico") ? <Suspense fallback={null}><DebugTools game={game} /></Suspense> : null}
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner mx-auto flex max-w-6xl items-center justify-between gap-3 px-4">
        <Brand />
        <div className="flex items-center gap-1">
          {ADS_PREVIEW_AVAILABLE ? <AdPreviewToggle /> : null}
          <AccountButton />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}

/**
 * Casca fixa: pular para o conteúdo, barra superior, tela e avisos. A barra
 * fica em todas as telas, a Carreira inclusive (D43): o placar do jogador vem
 * logo abaixo dela. A conta (D112) entra ao lado dos ajustes; o aviso de
 * cookies (D113), no pé, só quando há o que consentir. Os trilhos de anúncio
 * do PC e a âncora do celular (D134) também moram aqui, fora do conteúdo.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useT();
  const screen = useNavigation((state) => state.screen);
  const rail = RAIL_SCREENS[screen];
  return (
    <>
      <a href="#conteudo" className="skip-link">
        {t("nav.skipToContent")}
      </a>
      <TopBar />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      {/* D134: trilhos do PC e âncora do celular, fora do conteúdo (prévia). */}
      {rail ? <AdRails key={screen} place={rail} prefix={screen === "career" ? "carreira-trilho" : "trilho"} /> : null}
      <AdAnchor />
      <AdInterstitial />
      <Toaster closeLabel={t("common.close")} />
      <UnlockAnnouncer />
      <CookieBanner />
    </>
  );
}
