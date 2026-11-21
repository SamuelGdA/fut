import { Megaphone } from "lucide-react";
import { useEffect } from "react";
import { useT } from "../../i18n/useT";
import { Switch } from "../../ui/Fields";
import { ADS_PREVIEW_AVAILABLE, useAdPreview } from "./preview";

/**
 * O botão que liga e desliga a prévia dos anúncios (D134), na barra do topo
 * do PC, e o atalho Alt + Shift + A. No celular, a barra do topo não tem
 * espaço: a chave fica nos Ajustes (`AdPreviewSwitch`). Só existe onde a
 * prévia existe (desenvolvimento e suíte ponta a ponta), nunca em produção.
 */
export function AdPreviewToggle() {
  const { t } = useT();
  const on = useAdPreview((state) => state.on);
  const toggle = useAdPreview((state) => state.toggle);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.shiftKey && event.code === "KeyA") {
        event.preventDefault();
        useAdPreview.getState().toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Na suíte (build de produção com a prévia disponível), o botão só aparece
  // com a prévia ligada: as outras telas testadas continuam como no site.
  if (!ADS_PREVIEW_AVAILABLE || (!import.meta.env.DEV && !on)) return null;
  return (
    <button type="button" className="ad-toggle" aria-pressed={on} aria-label={t("ads.preview.toggle")} title={t("ads.preview.shortcut")} onClick={toggle}>
      <Megaphone size={14} aria-hidden="true" />
      <span className="ad-toggle-text" aria-hidden="true">{on ? t("ads.preview.on") : t("ads.preview.off")}</span>
    </button>
  );
}

/** A mesma chave, nos Ajustes (é o caminho no celular). */
export function AdPreviewSwitch() {
  const { t } = useT();
  const on = useAdPreview((state) => state.on);
  const toggle = useAdPreview((state) => state.toggle);
  if (!ADS_PREVIEW_AVAILABLE || (!import.meta.env.DEV && !on)) return null;
  return (
    <div className="border-t border-line pt-2">
      <Switch label={t("ads.preview.toggle")} description={t("ads.preview.shortcut")} checked={on} onCheckedChange={toggle} />
    </div>
  );
}
