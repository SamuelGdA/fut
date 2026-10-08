import type { ReactNode } from "react";
import { SCREEN_GAME, useNavigation } from "./navigation";
import { SettingsMenu } from "../features/settings/SettingsMenu";
import { useT } from "../i18n/useT";
import { PitchMark } from "../ui/PitchMark";
import { Toaster } from "../ui/toast/Toaster";
import { UnlockAnnouncer } from "./UnlockAnnouncer";

/**
 * Marca (D50): o campo visto de cima e o nome do Futeiros, que leva ao hub.
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
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner mx-auto flex max-w-6xl items-center justify-between gap-3 px-4">
        <Brand />
        <div className="flex items-center gap-1">
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}

/**
 * Casca fixa: pular para o conteúdo, barra superior, tela e avisos. A barra
 * fica em todas as telas, a Carreira inclusive (D43): o placar do jogador vem
 * logo abaixo dela.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useT();
  return (
    <>
      <a href="#conteudo" className="skip-link">
        {t("nav.skipToContent")}
      </a>
      <TopBar />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Toaster closeLabel={t("common.close")} />
      <UnlockAnnouncer />
    </>
  );
}
