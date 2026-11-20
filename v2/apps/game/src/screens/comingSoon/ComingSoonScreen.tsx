import { ArrowRight } from "lucide-react";
import { useNavigation } from "../../app/navigation";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";

/**
 * O Técnico no ar enquanto o modo está bloqueado (D124): qualquer caminho para
 * ele (o cartão do hub, `/tecnico`, uma carreira salva no aparelho) cai aqui,
 * com a faixa "Em breve" e a volta para o hub. Nada do motor do Técnico vem
 * junto.
 */
export function ComingSoonScreen() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <p className="coming-soon-badge">{t("comingSoon.badge")}</p>
        <h1 className="display mt-4 text-5xl font-black uppercase">{t("comingSoon.title")}</h1>
        <p className="mt-4 text-muted">{t("comingSoon.body")}</p>
        <Button
          className="mt-8"
          size="lg"
          onClick={() => {
            feedback("back");
            go("hub", { replace: true });
          }}
        >
          {t("comingSoon.home")}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
