import { saveOf } from "@craque/engine";
import { useEffect, useLayoutEffect } from "react";
import { useNavigation } from "../../app/navigation";
import { useCareer } from "../../features/career/store";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Loading } from "../../ui/Loading";
import { notify } from "../../ui/toast/notify";
import { SummaryView } from "./SummaryView";

/**
 * O resumo da carreira deste navegador (GDD 24). Lê o save; sem carreira
 * terminada, volta para onde faz sentido (Início ou a carreira em andamento).
 * "Jogar de novo" volta à Identidade, ou ao Desafio do dia se foi desafio.
 */
export function SummaryScreen() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const status = useCareer((state) => state.status);
  const career = useCareer((state) => state.career);
  const avatar = useCareer((state) => state.avatar);
  const alternate = useCareer((state) => state.alternate);

  // Antes da primeira pintura: o replay é síncrono, e a tela já abre pronta.
  useLayoutEffect(() => {
    useCareer.getState().hydrate();
  }, []);

  useEffect(() => {
    if (status === "empty" || status === "stale" || status === "invalid") go("home", { replace: true });
  }, [status, go]);

  // Uma carreira que ainda não acabou não tem resumo: volta para ela.
  useEffect(() => {
    if (career && !career.end) go("career", { replace: true });
  }, [career, go]);

  if (!career || !career.end) {
    return (
      <Loading label={t("common.loading")} className="min-h-[60dvh]" />
    );
  }

  const challenge = typeof career.setup.challengeId === "string";

  const branch = (index: number) => {
    if (useCareer.getState().branch(saveOf(career), avatar, index)) {
      feedback("whistle");
      go("career");
    } else {
      notify({ tone: "bad", title: t("summary.whatIf.failed") });
    }
  };

  return (
    <SummaryView
      career={career}
      avatar={avatar}
      mode="own"
      alternate={alternate !== null}
      onAgain={() => go(challenge ? "challenge" : "identity")}
      onHome={() => go("home")}
      onBranch={challenge ? undefined : branch}
    />
  );
}
