import { useState } from "react";
import { useNavigation } from "../../app/navigation";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { usePrefs } from "../../store/prefs";

export interface QuickStart {
  readonly starting: boolean;
  start(): void;
}

/** Jogo rápido (GDD 6.1): identidade e aparência sorteadas, direto para o primeiro clube. */
export function useQuickStart(): QuickStart {
  const { locale } = useT();
  const go = useNavigation((state) => state.go);
  const pace = usePrefs((state) => state.pace);
  const difficulty = usePrefs((state) => state.difficulty);
  const [starting, setStarting] = useState(false);
  const start = async () => {
    setStarting(true);
    try {
      const [{ quickDraft, setupFromDraft }, { useCareer }] = await Promise.all([
        import("./newCareer"),
        import("./store"),
      ]);
      // O jogo rápido sorteia um jogador só para esta carreira: o último jogador
      // montado continua guardado para a próxima (D43).
      const next = quickDraft(locale);
      useCareer.getState().start(setupFromDraft({ draft: next, pace, difficulty, locale, first: !usePrefs.getState().startedCareer }), next.avatar);
      usePrefs.getState().markCareerStarted();
      feedback("whistle");
      go("career");
    } finally {
      setStarting(false);
    }
  };
  return { starting, start: () => { feedback("select"); void start(); } };
}

