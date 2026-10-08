import { CloudDownload, Square } from "lucide-react";
import { useEffect } from "react";
import { useT } from "../../i18n/useT";
import { RUNTIME_IMAGE_BYTES } from "../../services/offlineImages";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { useOfflineImages } from "./offlineStore";

/**
 * Imagens sem internet, nos ajustes (GDD 37): quantos escudos e troféus já
 * estão no aparelho e o botão para guardar todos de uma vez. Escudo que não
 * foi guardado aparece desenhado sem conexão; isto é para quem não quer
 * nenhum desenhado.
 */
export function OfflineImagesRow() {
  const { t, number } = useT();
  const status = useOfflineImages((state) => state.status);
  const stored = useOfflineImages((state) => state.stored);
  const total = useOfflineImages((state) => state.total);
  const failed = useOfflineImages((state) => state.failed);

  useEffect(() => {
    void useOfflineImages.getState().refresh();
  }, []);

  const size = `${number(RUNTIME_IMAGE_BYTES / 1_000_000, { maximumFractionDigits: 0 })} MB`;

  if (status === "unsupported") return <p className="text-sm text-muted">{t("settings.offlineUnsupported")}</p>;

  const line =
    status === "counting"
      ? t("settings.offlineCounting")
      : status === "done"
        ? t("settings.offlineDone", { total })
        : status === "partial"
          ? t("settings.offlineFailed", { failed })
          : status === "full"
            ? t("settings.offlineQuota")
            : t("settings.offlineProgress", { done: stored, total });

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm text-muted">{t("settings.offlineHint", { size })}</p>
      {total > 0 && status !== "counting" ? (
        <div
          className="mission-bar"
          role="progressbar"
          aria-label={t("settings.offlineTitle")}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={stored}
          aria-valuetext={line}
        >
          <span style={{ transform: `scaleX(${total > 0 ? Math.min(1, stored / total) : 0})` }} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="numeric text-xs text-faint" aria-live="polite">
          {line}
        </p>
        {status === "storing" ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              feedback("back");
              useOfflineImages.getState().stop();
            }}
          >
            <Square size={14} aria-hidden="true" />
            {t("settings.offlineStop")}
          </Button>
        ) : status !== "done" ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={status === "counting"}
            onClick={() => {
              feedback("confirm");
              void useOfflineImages.getState().start();
            }}
          >
            <CloudDownload size={15} aria-hidden="true" />
            {t("settings.offlineStore")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
