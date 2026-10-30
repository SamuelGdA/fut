import { Cookie } from "lucide-react";
import { screenUrl, useNavigation } from "../../app/navigation";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { bannerVisible, type ConsentChoice, useConsent } from "./store";

/**
 * O aviso de cookies (D113): uma faixa no pé da tela, no desenho do
 * laboratório (painel, filete de ouro, tipografia de placar). Não bloqueia o
 * jogo nem rouba o foco. As duas escolhas têm o mesmo tamanho e o mesmo peso:
 * recusar é tão fácil quanto aceitar. Só aparece quando o build tem Analytics
 * ou AdSense configurado.
 */
export function CookieBanner({ preview = false }: { preview?: boolean }) {
  const { t } = useT();
  const choice = useConsent((state) => state.choice);
  const reopened = useConsent((state) => state.reopened);
  const go = useNavigation((state) => state.go);
  if (!preview && !bannerVisible(choice, reopened)) return null;

  const pick = (next: ConsentChoice) => {
    feedback(next === "all" ? "confirm" : "select");
    if (!preview) useConsent.getState().choose(next);
  };

  return (
    <section className="cookie-banner" data-preview={preview || undefined} role="region" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner-inner">
        <span className="cookie-banner-mark" aria-hidden="true">
          <Cookie size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="cookie-banner-title" className="eyebrow text-glory">{t("consent.title")}</h2>
          <p className="mt-1 text-sm text-muted">
            {t("consent.body")}{" "}
            <a
              href={screenUrl("privacy")}
              className="cookie-banner-link"
              onClick={(event) => {
                event.preventDefault();
                go("privacy");
              }}
            >
              {t("consent.policy")}
            </a>
          </p>
        </div>
        <div className="cookie-banner-actions">
          <Button variant="secondary" size="sm" onClick={() => pick("essential")}>
            {t("consent.essentialOnly")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => pick("all")}>
            {t("consent.acceptAll")}
          </Button>
        </div>
      </div>
    </section>
  );
}
