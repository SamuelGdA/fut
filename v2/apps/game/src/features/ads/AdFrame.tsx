import type { CSSProperties } from "react";
import { useT } from "../../i18n/useT";
import { cn } from "../../ui/cn";
import { type AdSize, sizeLabel } from "./slots";

export type AdFrameKind = "inline" | "reward" | "rail" | "anchor";

interface AdFrameProps {
  id: string;
  kind: AdFrameKind;
  desktop: AdSize | null;
  mobile: AdSize | null;
  className?: string;
  style?: CSSProperties;
  /** Só nos trilhos: o lado e se ficam presos à janela ou ao corpo da carreira. */
  side?: "left" | "right";
  anchor?: "fixed" | "contained";
}

/**
 * A moldura de prévia de um anúncio (D134). Ocupa exatamente o tamanho IAB:
 * o do celular abaixo de 768 px e o do PC daqui para cima, trocados só por
 * CSS (sem pulo ao abrir a tela). Mostra o selo de prévia, o ID do espaço, o
 * tamanho e o tipo. O rótulo "Publicidade" fica em cima, como no anúncio de
 * verdade, e já entra na altura reservada.
 */
export function AdFrame({ id, kind, desktop, mobile, className, style, side, anchor }: AdFrameProps) {
  const { t } = useT();
  const sizes = [desktop ? `${t("ads.preview.desktop")} ${sizeLabel(desktop)}` : null, mobile ? `${t("ads.preview.mobile")} ${sizeLabel(mobile)}` : null].filter(Boolean).join(", ");
  const vars = {
    ...style,
    "--ad-dw": desktop ? `${desktop.width}px` : undefined,
    "--ad-dh": desktop ? `${desktop.height}px` : undefined,
    "--ad-mw": mobile ? `${mobile.width}px` : undefined,
    "--ad-mh": mobile ? `${mobile.height}px` : undefined,
  } as CSSProperties;
  return (
    <aside
      className={cn("ad-box", className)}
      data-ad-slot={id}
      data-kind={kind}
      data-desktop={desktop ? sizeLabel(desktop) : "none"}
      data-mobile={mobile ? sizeLabel(mobile) : "none"}
      data-side={side}
      data-anchor={anchor}
      style={vars}
      aria-label={`${t("ads.label")} (${t("ads.preview.badge")}): ${id}, ${sizes}`}
    >
      <span className="ad-box-label" aria-hidden="true">{t("ads.label")}</span>
      <span className="ad-frame" aria-hidden="true">
        <span className="ad-frame-inner">
          <span className="ad-frame-badge">{t("ads.preview.badge")}</span>
          <span className="ad-frame-body">
            <span className="ad-frame-id">{id}</span>
            {desktop ? <span className="ad-frame-size" data-for="desktop">{sizeLabel(desktop)}</span> : null}
            {mobile ? <span className="ad-frame-size" data-for="mobile">{sizeLabel(mobile)}</span> : null}
            <span className="ad-frame-kind">{t(`ads.kinds.${kind}`)}</span>
          </span>
        </span>
      </span>
    </aside>
  );
}
