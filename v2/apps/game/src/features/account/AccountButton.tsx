import { LogIn } from "lucide-react";
import { useNavigation } from "../../app/navigation";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Skeleton } from "../../ui/Skeleton";
import { openLogin } from "./openLogin";
import { useAccount } from "./store";

/**
 * Onde a conta sai da barra: as telas do laço (D23), para a carreira em
 * memória não correr risco, e o próprio login, onde o botão só repetiria a tela.
 */
const HIDDEN_ON = new Set(["career", "tecnico", "login"]);

/**
 * A conta na barra do topo (D112): "Entrar" para o visitante, o @ com a
 * inicial para quem está logado. No celular, só o ícone ou a inicial.
 */
export function AccountButton() {
  const { t } = useT();
  const status = useAccount((state) => state.status);
  const username = useAccount((state) => state.profile?.username ?? null);
  const screen = useNavigation((state) => state.screen);
  const go = useNavigation((state) => state.go);

  if (status === "off" || HIDDEN_ON.has(screen)) return null;

  if (status === "checking") {
    return (
      <span className="account-chip" role="status" aria-label={t("account.checking")}>
        <Skeleton round className="size-8" />
      </span>
    );
  }

  if (status === "guest") {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="account-signin"
        onClick={() => {
          feedback("select");
          openLogin(screen);
        }}
      >
        <LogIn size={17} aria-hidden="true" />
        <span className="max-sm:sr-only">{t("account.signIn")}</span>
      </Button>
    );
  }

  const name = username ?? "";
  return (
    <button
      type="button"
      className="account-chip"
      aria-current={screen === "profile" ? "page" : undefined}
      aria-label={name ? t("account.openProfile", { name }) : t("account.profileFallback")}
      onClick={() => {
        feedback("select");
        go("profile");
      }}
    >
      <span className="account-monogram" aria-hidden="true">{(name[0] ?? "@").toUpperCase()}</span>
      {name ? <span className="account-handle max-sm:hidden" aria-hidden="true">@{name}</span> : null}
    </button>
  );
}
