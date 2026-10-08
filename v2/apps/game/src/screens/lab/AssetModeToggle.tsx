import { useT } from "../../i18n/useT";
import { useAssetMode } from "../../lib/assets";
import type { AssetMode } from "../../lib/env";
import { feedback } from "../../services/feedback";
import { Segmented } from "../../ui/Segmented";

/**
 * Troca a origem das imagens na hora (reais ou geradas). Toda imagem do jogo
 * lê o modo do mesmo lugar, então escudos, selos e troféus mudam juntos.
 */
export function AssetModeToggle() {
  const { t } = useT();
  const mode = useAssetMode((state) => state.mode);
  const trophyMode = useAssetMode((state) => state.trophyMode);
  const resetMode = useAssetMode((state) => state.resetMode);
  const setMode = useAssetMode((state) => state.setMode);

  return (
    <Segmented<AssetMode | "default">
      value={mode === trophyMode ? mode : "default"}
      onValueChange={(next) => {
        if (next === "default") resetMode();
        else setMode(next);
        feedback("select");
      }}
      label={t("lab.art.mode")}
      size="sm"
      options={[
        { value: "default", label: t("lab.art.modeDefault") },
        { value: "real", label: t("lab.art.modeReal") },
        { value: "gerado", label: t("lab.art.modeGenerated") },
      ]}
    />
  );
}
