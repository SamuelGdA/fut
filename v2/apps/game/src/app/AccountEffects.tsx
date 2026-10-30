import { useEffect } from "react";
import { useAccount } from "../features/account/store";
import { disableAnalytics, enableAnalytics, trackScreen } from "../features/consent/google";
import { trackingAllowed, useConsent } from "../features/consent/store";
import { useT } from "../i18n/useT";
import { notify } from "../ui/toast/notify";
import { type Screen, useNavigation } from "./navigation";

/** Telas que ficam abertas para quem ainda não escolheu o @ (o próprio login e as páginas legais). */
const OPEN_BEFORE_USERNAME: ReadonlySet<Screen> = new Set(["login", "terms", "privacy", "notFound"]);

/**
 * Efeitos da conta e do consentimento (D112 e D113), sem desenhar nada:
 * confere a sessão ao abrir, segura o jogador no passo do @ até ele escolher, liga ou desliga o Analytics pela
 * escolha de cookies e mede a tela aberta (com permissão).
 */
export function AccountEffects() {
  const { t, tp } = useT();
  const status = useAccount((state) => state.status);
  const dataStatus = useAccount((state) => state.dataStatus);
  const username = useAccount((state) => state.profile?.username);
  const notice = useAccount((state) => state.notice);
  const imported = useAccount((state) => state.imported);
  const screen = useNavigation((state) => state.screen);
  const go = useNavigation((state) => state.go);
  const consent = useConsent((state) => state.choice);

  useEffect(() => {
    void useAccount.getState().init();
  }, []);

  // O @ é obrigatório antes de jogar (D112): sem ele, só o login e as páginas legais abrem.
  useEffect(() => {
    if (status === "member" && dataStatus === "ready" && username === null && !OPEN_BEFORE_USERNAME.has(screen)) {
      go("login", { replace: true, force: true });
    }
  }, [status, dataStatus, username, screen, go]);

  useEffect(() => {
    if (!notice || notice === "confirmedElsewhere" || notice === "linkExpired" || notice === "oauthError") return;
    if (notice === "imported" && imported > 0) notify({ id: "account-imported", tone: "glory", title: tp("account.imported", imported) });
    if (notice === "signedOut") notify({ id: "account-out", tone: "neutral", title: t("account.signedOut") });
    if (notice === "deleted") notify({ id: "account-deleted", tone: "neutral", title: t("account.deleted") });
    useAccount.getState().clearNotice();
  }, [notice, imported, t, tp]);

  useEffect(() => {
    if (trackingAllowed(consent)) enableAnalytics();
    else disableAnalytics();
  }, [consent]);

  useEffect(() => {
    trackScreen(screen);
  }, [screen, consent]);

  return null;
}
