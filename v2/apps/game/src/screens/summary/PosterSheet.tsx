import type { AvatarConfig } from "@craque/art";
import type { Career } from "@craque/engine";
import { Download, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  canShareImage,
  downloadBlob,
  posterFileName,
  renderPoster,
  shareImage,
} from "../../features/summary/poster";
import { useT } from "../../i18n/useT";
import { useElementWidth } from "../../lib/useElementWidth";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Switch } from "../../ui/Fields";
import { Sheet } from "../../ui/Overlays";
import { notify } from "../../ui/toast/notify";
import { SHARE_HEIGHT, SHARE_WIDTH } from "../../features/summary/shareCard";
import { ShareCard } from "./ShareCard";

interface PosterSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  career: Career;
  avatar: AvatarConfig | null;
}

type Busy = "download" | "share" | null;

/**
 * A imagem da carreira na tela antes de sair (GDD 29.2 e D118): a prévia é a
 * própria imagem de 1200 × 630 em tamanho real, reduzida por escala; o PNG
 * sai do mesmo nó. Baixar sempre;
 * compartilhar só onde o navegador aceita arquivo de imagem.
 */
export function PosterSheet({ open, onOpenChange, career, avatar }: PosterSheetProps) {
  const { t } = useT();
  const [showSurname, setShowSurname] = useState(true);
  const [busy, setBusy] = useState<Busy>(null);
  const [frameRef, width] = useElementWidth(320);
  const posterRef = useRef<HTMLDivElement>(null);
  const scale = width / SHARE_WIDTH;
  const shareable = canShareImage();
  const fileName = posterFileName(career.setup.identity.surname, showSurname);

  const produce = async (kind: Exclude<Busy, null>) => {
    const node = posterRef.current;
    if (!node || busy) return;
    setBusy(kind);
    try {
      const blob = await renderPoster(node, undefined, { width: SHARE_WIDTH, height: SHARE_HEIGHT });
      if (kind === "download") {
        downloadBlob(blob, fileName);
        feedback("confirm");
        notify({ tone: "good", title: t("summary.poster.saved"), description: fileName });
      } else {
        const outcome = await shareImage(blob, fileName, t("app.name"), t("summary.poster.shareText"));
        if (outcome === "failed") notify({ tone: "bad", title: t("summary.poster.shareFailed") });
        if (outcome === "shared") feedback("confirm");
      }
    } catch {
      notify({ tone: "bad", title: t("summary.poster.failed") });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("summary.poster.title")}
      closeLabel={t("common.close")}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" loading={busy === "download"} disabled={busy !== null} onClick={() => void produce("download")}>
            <Download size={18} aria-hidden="true" />
            {t("summary.poster.download")}
          </Button>
          {shareable ? (
            <Button className="flex-1" variant="secondary" loading={busy === "share"} disabled={busy !== null} onClick={() => void produce("share")}>
              <Share2 size={18} aria-hidden="true" />
              {t("summary.poster.share")}
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Switch checked={showSurname} onCheckedChange={setShowSurname} label={t("summary.poster.showSurname")} />
        <div ref={frameRef} className="share-frame" style={{ height: SHARE_HEIGHT * scale }}>
          <div className="share-scale" style={{ transform: `scale(${scale})` }}>
            <ShareCard ref={posterRef} career={career} avatar={avatar} showSurname={showSurname} />
          </div>
        </div>
      </div>
    </Sheet>
  );
}
