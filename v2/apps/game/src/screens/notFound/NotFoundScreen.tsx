import { ArrowRight } from "lucide-react";
import { useNavigation } from "../../app/navigation";
import { ErrorArt } from "../../app/ErrorBoundary";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";

/**
 * Página não encontrada, dentro do jogo (GDD 37): um endereço que o Futeiros
 * não conhece abre aqui, com a casca de pé e a volta para o hub (D50). Sair
 * limpa o endereço (a navegação troca a URL pela raiz do jogo).
 */
export function NotFoundScreen() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <ErrorArt kind="out" className="mb-6 block w-60 max-w-full" />
        <p className="eyebrow text-glory">{t("notFound.eyebrow")}</p>
        <h1 className="display mt-3 text-5xl font-black uppercase">{t("notFound.title")}</h1>
        <p className="mt-4 text-muted">{t("notFound.body")}</p>
        <Button
          className="mt-8"
          size="lg"
          onClick={() => {
            feedback("back");
            go("hub", { replace: true });
          }}
        >
          {t("notFound.home")}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
