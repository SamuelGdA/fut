import { LogIn, UserRound } from "lucide-react";
import { useNavigation } from "../../app/navigation";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { cn } from "../../ui/cn";
import { openLogin } from "./openLogin";
import { useAccount } from "./store";

/**
 * O aviso do visitante (D112): uma faixa fina, sem fechar nada nem tapar o
 * jogo, com o link para entrar. Só aparece para quem está sem conta num build
 * com contas.
 */
export function GuestNotice({ className, preview = false }: { className?: string; preview?: boolean }) {
  const { t } = useT();
  const status = useAccount((state) => state.status);
  const screen = useNavigation((state) => state.screen);
  // A prévia do laboratório aparece sempre, com ou sem conta.
  if (status !== "guest" && !preview) return null;
  return (
    <p className={cn("guest-notice", className)}>
      <UserRound size={15} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 flex-1">{t("account.guestNotice")}</span>
      <button
        type="button"
        className="guest-notice-action"
        onClick={() => {
          feedback("select");
          openLogin(screen);
        }}
      >
        <LogIn size={14} aria-hidden="true" />
        {t("account.signIn")}
      </button>
    </p>
  );
}
