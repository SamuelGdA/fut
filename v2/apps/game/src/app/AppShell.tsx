import type { ReactNode } from "react";
import { useNavigation } from "./navigation";
import { SettingsMenu } from "../features/settings/SettingsMenu";
import { useT } from "../i18n/useT";
import { PitchMark } from "../ui/PitchMark";
import { Toaster } from "../ui/toast/Toaster";
import { UnlockAnnouncer } from "./UnlockAnnouncer";

/** Marca: o campo visto de cima e o nome em tipografia de placar. Leva ao Início. */
function Brand() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const screen = useNavigation((state) => state.screen);
  const content = (
    <>
      <PitchMark className="h-7 w-5" />
      <span className="display text-3xl font-black uppercase tracking-wide">{t("app.name")}</span>
      <span className="eyebrow mt-1 hidden sm:inline">{t("app.tagline")}</span>
    </>
  );
  if (screen === "home") return <span className="flex items-center gap-2.5 text-fg">{content}</span>;
  return (
    <button
      type="button"
      className="flex items-center gap-2.5 rounded-sm text-fg"
      aria-label={`${t("app.name")}: ${t("nav.home")}`}
      onClick={() => go("home")}
    >
      {content}
    </button>
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
