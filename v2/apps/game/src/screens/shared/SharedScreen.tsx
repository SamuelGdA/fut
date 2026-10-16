import type { AvatarConfig } from "@craque/art";
import { type Career, CareerError, ENGINE_VERSION, parseSave, replay, saveOf } from "@craque/engine";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { decodeShare, readShareHash } from "../../features/summary/shareLink";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Loading } from "../../ui/Loading";
import { SummaryView } from "../summary/SummaryView";
import { useCareer } from "../../features/career/store";
import { notify } from "../../ui/toast/notify";

type SharedState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly career: Career; readonly avatar: AvatarConfig | null }
  | { readonly kind: "error"; readonly reason: "broken" | "version" | "unfinished" };

/** Lê o link, refaz a carreira e diz o que deu. Nunca lança. */
async function openShared(token: string | null): Promise<SharedState> {
  if (!token) return { kind: "error", reason: "broken" };
  try {
    const shared = await decodeShare(token);
    const save = parseSave(shared.save);
    if (save.engine !== ENGINE_VERSION) return { kind: "error", reason: "version" };
    const career = replay(save);
    if (!career.end) return { kind: "error", reason: "unfinished" };
    return { kind: "ready", career, avatar: shared.avatar };
  } catch (error) {
    return { kind: "error", reason: error instanceof CareerError && error.code === "version" ? "version" : "broken" };
  }
}

/**
 * Uma carreira aberta por link (GDD 29.2): refeita por replay e mostrada no
 * resumo em modo leitura. Só a confirmação do hipotético inicia outra sessão.
 * Abrir o link não toca na carreira de quem abre. O token é lido
 * uma vez, na criação da tela; ao sair, a navegação tira o fragmento da URL e
 * recarregar abre o jogo normal.
 */
export function SharedScreen() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const [token] = useState(() => readShareHash(window.location.hash));
  const [state, setState] = useState<SharedState>({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    void openShared(token).then((result) => {
      if (alive) setState(result);
    });
    return () => {
      alive = false;
    };
  }, [token]);

  const home = () => go("home", { replace: true });

  if (state.kind === "loading") {
    return (
      <Loading label={t("shared.loading")} className="min-h-[60dvh]" />
    );
  }

  if (state.kind === "error") {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-start justify-center gap-4 px-4">
        <p className="eyebrow text-bad">{t("shared.errorEyebrow")}</p>
        <h1 className="display text-4xl font-black uppercase">{t(`shared.errors.${state.reason}.title`)}</h1>
        <p className="text-muted">{t(`shared.errors.${state.reason}.body`)}</p>
        <Button
          size="lg"
          onClick={() => {
            feedback("back");
            home();
          }}
        >
          <Home size={18} aria-hidden="true" />
          {t("shared.home")}
        </Button>
      </div>
    );
  }

  const branch = (index: number) => {
    if (useCareer.getState().branch(saveOf(state.career), state.avatar, index)) {
      feedback("whistle"); go("career");
    } else notify({ tone: "bad", title: t("summary.whatIf.failed") });
  };
  return <SummaryView career={state.career} avatar={state.avatar} mode="shared" onHome={home} onBranch={typeof state.career.setup.challengeId === "string" ? undefined : branch} />;
}
