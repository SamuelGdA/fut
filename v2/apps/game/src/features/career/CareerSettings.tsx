import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { type Difficulty, type Pace, usePrefs } from "../../store/prefs";
import { Segmented } from "../../ui/Segmented";

/**
 * Ritmo e dificuldade da carreira (D109: na tela de quem é você, junto do
 * resto do que se escolhe antes de começar). O jogo rápido usa a última escolha.
 */
export function CareerSettings({ stacked = false }: { stacked?: boolean }) {
  const { t } = useT();
  const pace = usePrefs((state) => state.pace);
  const difficulty = usePrefs((state) => state.difficulty);
  return (
    <div className={stacked ? "grid gap-4" : "grid gap-5 sm:grid-cols-2"}>
      <div>
        <p className="eyebrow mb-2.5">{t("pace.label")}</p>
        <Segmented<Pace>
          block
          label={t("pace.label")}
          value={pace}
          onValueChange={(next) => {
            usePrefs.getState().setPace(next);
            feedback("tick");
          }}
          options={[
            // D110: Normal primeiro, Rápida depois.
            { value: "intense", label: t("pace.intense.name") },
            { value: "normal", label: t("pace.normal.name") },
          ]}
        />
        <p className="mt-2 text-xs text-faint">{t(`pace.${pace}.hint`)}</p>
      </div>
      <div>
        <p className="eyebrow mb-2.5">{t("difficulty.label")}</p>
        <Segmented<Difficulty>
          block
          label={t("difficulty.label")}
          value={difficulty}
          onValueChange={(next) => {
            usePrefs.getState().setDifficulty(next);
            feedback("tick");
          }}
          options={[
            { value: "normal", label: t("difficulty.normal.name") },
            { value: "hard", label: t("difficulty.hard.name"), tone: "bad" },
          ]}
        />
      </div>
    </div>
  );
}
